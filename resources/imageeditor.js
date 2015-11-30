( function ( $, OO, ImageTool, Caman ) {

var ImageEditor;

/**
 * @class ImageEditor
 *
 * ImageEditor is a user interface that allows making edits to
 * images. It uses OO.ui.Toolbar and OO.ui.PanelLayout for the basic
 * UI, and Caman for image editing.
 *
 *     var e = new ImageEditor( {
 *         containerId: 'editor',
 *         imagePath: 'cat.png'
 *     } );
 *     e.initialize();
 *
 * @cfg {string} containerId DOM ID of the containter in which the
 * editor will be rendered.
 * @cfg {string} imagePath Path of the image to load in the editor.
 */
ImageEditor = function ( config ) {

	if ( config.containerId === undefined || config.imagePath === undefined ) {
		throw new Error( 'All config not passed' );
	}

	// Setup container
	this.$container = $( '#' + config.containerId );
	this.$container
		.addClass( 'mwe-imageeditor-editor' )
		.append(
			$( '<div>' )
				.addClass( 'mwe-imageeditor-canvas-container' )
				.append(
					$( '<img>' )
						.attr( 'src', config.imagePath )
						.attr( 'id', 'mwe-imageeditor-image' )
				)
		);

	// Editor
	this.editor = new OO.ui.PanelLayout( {
		framed: true,
		padded: false
	} );
	this.$container.append( this.editor.$element );

	// Toolbar
	this.toolFactory = new OO.ui.ToolFactory();
	this.toolGroupFactory = new OO.ui.ToolGroupFactory();
	this.toolbar = new OO.ui.Toolbar( this.toolFactory, this.toolGroupFactory, {
		actions: true
	} );
	this.editor.$element.append( this.toolbar.$element );

	// Interactive panel
	this.interactivePanel = new OO.ui.PanelLayout( {
		expanded: false,
		framed: true,
		padded: true,
		classes: [ 'mwe-imageeditor-interactivepanel' ]
	} );
	this.interactivePanel.toggle( false );
	this.editor.$element.append( this.interactivePanel.$element );

	/**
	 * @property {Array} toolbarGroups The groups config passed to the
	 * [toolbar's
	 * setup](https://doc.wikimedia.org/oojs-ui/master/js/#!/api/OO.ui.Toolbar-method-setup)
	 * method.
	 */
	this.toolbarGroups = [
		{
			type: 'bar',
			include: [ 'undo', 'redo' ]
		},
		{
			type: 'bar',
			include: [ 'rotateCounterClockwise', 'rotateClockwise' ]
		},
		{
			type: 'bar',
			include: [ 'flipVertical', 'flipHorizontal' ]
		},
		{
			type: 'bar',
			include: [ 'crop' ]
		}
	];

	/**
	 * @property {Object} tools Instances of ImageTools registered with the ImageEditor
	 */
	this.tools = {};

	/**
	 * @property {Array} actions Actions taken so far.
	 */
	this.actions = [];

	/**
	 * @property {number} currentAction Current action as an index
	 * of the {@link #property-actions} array.
	 */
	this.currentAction = undefined;

	/**
	 * @property {boolean} isUndoable Is the editor undoable?
	 */
	this.isUndoable = false;

	/**
	 * @property {boolean} isRedoable Is the editor redoable?
	 */
	this.isRedoable = false;

	/**
	 * @property {boolean} interactiveTool Is an interactive tool currently active?
	 */
	this.interactiveTool = false;
};

OO.initClass( ImageEditor );

/**
 * Initializes the editor.
 */
ImageEditor.prototype.initialize = function () {
	this.setupToolbar();

	// TODO Stuff about the editor's state
};

/**
 * Setups up the toolbar.
 */
ImageEditor.prototype.setupToolbar = function () {
	this.registerCoreTools();
	this.setupUndoRedo();
	this.setupTools();

	// Setup toolbar
	this.toolbar.setup( this.getToolbarGroups() );

	this.saveButton = new OO.ui.ButtonWidget( {
		label: 'Save',
		flags: [ 'constructive', 'primary' ]
	} );

	// Refresh the undo redo states
	this.toolbar.emit( 'updateState' );

	this.toolbar.$actions.append( this.saveButton.$element );
};

/**
 * Setter method for {@link #property-toolbarGroups}.
 *
 * @param {Object} groups
 * @return {Object}
 */
ImageEditor.prototype.setToolbarGroups = function ( groups ) {
	this.toolbarGroups = groups;
	return this.toolbarGroups;
};

/**
 * Getter method for {@link #property-toolbarGroups}.
 *
 * @return {Object}
 */
ImageEditor.prototype.getToolbarGroups = function () {
	return this.toolbarGroups;
};

/**
 * Pushes to {@link #property-actions}, updates {@link
 * #property-currentAction}, and calls {@link #updateUndoRedoState}.
 *
 * @param {string} name
 * @param {Object} action
 */
ImageEditor.prototype.addAction = function ( name, action ) {
	// The current action is being made over the latest action
	if (
		this.currentAction === undefined ||
		this.currentAction === this.actions.length - 1
	) {
		this.actions.push( {
			name: name,
			action: action
		} );

		this.currentAction = this.actions.length - 1;
	} else {
		this.actions = this.actions.slice( 0, this.currentAction + 1 );
		this.actions.push( {
			name: name,
			action: action
		} );

		this.currentAction = this.actions.length - 1;
	}
	this.updateUndoRedoState();
};

/**
 * Updates the state of the undo and redo buttons based on
 * {@link #property-currentAction}.
 */
ImageEditor.prototype.updateUndoRedoState = function () {
	this.isUndoable = ( this.currentAction >= 0 );
	this.isRedoable = ( this.currentAction !== this.actions.length - 1 );
	this.toolbar.emit( 'updateState' );
};

/**
 * Undos last action
 */
ImageEditor.prototype.undo = function () {
	var lastAction = this.actions[ this.currentAction ];
	this.tools[ lastAction.name ].undoAction( '#mwe-imageeditor-image', lastAction.action );
	this.currentAction--;
	this.updateUndoRedoState();
};

/**
 * Redos last action
 */
ImageEditor.prototype.redo = function () {
	var nextAction = this.actions[ this.currentAction + 1 ];
	this.tools[ nextAction.name ].doAction( '#mwe-imageeditor-image', nextAction.action );
	this.currentAction++;
	this.updateUndoRedoState();
};

/**
 * Sets up the undo and redo buttons in the toolbar
 */
ImageEditor.prototype.setupUndoRedo = function () {
	var editor =  this;

	// Undo
	function UndoTool() {
		UndoTool.super.apply( this, arguments );
	}

	OO.inheritClass( UndoTool, OO.ui.Tool );

	UndoTool.static.name = 'undo';
	UndoTool.static.icon = 'undo';
	UndoTool.static.title = 'Undo';

	UndoTool.prototype.onSelect = function () {
		editor.undo();
		this.setActive( false );
	};

	UndoTool.prototype.onUpdateState = function () {
		if ( editor.isUndoable && !editor.getInteractiveTool() ) {
			this.setDisabled( false );
		} else {
			this.setDisabled( true );
		}
		this.setActive( false );
	};

	this.toolFactory.register( UndoTool );

	// Redo
	function RedoTool() {
		RedoTool.super.apply( this, arguments );
	}

	OO.inheritClass( RedoTool, OO.ui.Tool );

	RedoTool.static.name = 'redo';
	RedoTool.static.icon = 'redo';
	RedoTool.static.title = 'Redo';

	RedoTool.prototype.onSelect = function () {
		editor.redo();
		this.setActive( false );
	};

	RedoTool.prototype.onUpdateState = function () {
		if ( editor.isRedoable && !editor.getInteractiveTool() ) {
			this.setDisabled( false );
		} else {
			this.setDisabled( true );
		}
		this.setActive( false );
	};

	this.toolFactory.register( RedoTool );
};

/**
 * Setter method for {@link #property-interactiveTool}.
 *
 * @param {boolean} value
 * @return {boolean}
 */
ImageEditor.prototype.setInteractiveTool = function ( value ) {
	this.interactiveTool = value;
	this.interactivePanel.$element.empty();
	this.interactivePanel.toggle( value );
	this.toolbar.emit( 'updateState' );
	return this.interactiveTool;
};

/**
 * Getter method for {@link #property-interactiveTool}.
 *
 * @return {boolean}
 */
ImageEditor.prototype.getInteractiveTool = function () {
	return this.interactiveTool;
};

/**
 * Reads list of registered tools and sets them up with the toolbar.
 */
ImageEditor.prototype.setupTools = function () {
	$.each( this.tools, function ( tool ) {
		this.setupTool( this.tools[ tool ] );
	}.bind( this ) );
};

/**
 * Sets up an instance of ImageTool with the toolbar.
 */
ImageEditor.prototype.setupTool = function ( tool ) {
	var editor = this;

	function Tool() {
		Tool.super.apply( this, arguments );
	}
	OO.inheritClass( Tool, OO.ui.Tool );

	Tool.static.name = tool.name;
	Tool.static.icon = tool.icon;
	Tool.static.title = tool.title;

	Tool.prototype.onSelect = function () {
		var action;
		if ( tool.isInteractive ) {
			editor.setInteractiveTool( true );
			tool.getAction( editor.interactivePanel, '#mwe-imageeditor-image' )
				.done( function ( action ) {
					editor.addAction( tool.name, action );
				} ).always( function () {
					editor.setInteractiveTool( false );
				} );
		} else {
			action = tool.doAction( '#mwe-imageeditor-image' );
			editor.addAction( tool.name, action );
		}

		this.setActive( false );
	};

	Tool.prototype.onUpdateState = function () {
		if ( editor.getInteractiveTool() ) {
			this.setDisabled( true );
		} else {
			this.setDisabled( false );
		}
		this.setActive( false );
	};

	this.toolFactory.register( Tool );
};

/**
 * Register an ImageTool with the editor
 */
ImageEditor.prototype.registerTool = function ( tool ) {
	this.tools[ tool.name ] = tool;
};

/**
 * Instantiate and register core tools with the editor
 */
ImageEditor.prototype.registerCoreTools = function () {
	var rotateCounterClockwise, rotateClockwise, flipVertical, flipHorizontal, crop;

	rotateCounterClockwise = new ImageTool(  {
		name: 'rotateCounterClockwise',
		icon: 'rotate-counter-clockwise',
		title: 'Rotate counter clockwise' // TODO Localizable
	} );
	rotateCounterClockwise.doAction = function ( image ) {
		Caman( image, function () {
			this.rotate( -90 );
			this.render();
		} );

		return {};
	};
	rotateCounterClockwise.undoAction = function ( image ) {
		Caman( image, function () {
			this.rotate( 90 );
			this.render();
		} );
	};
	this.registerTool( rotateCounterClockwise );

	rotateClockwise = new ImageTool(  {
		name: 'rotateClockwise',
		icon: 'rotate-clockwise',
		title: 'Rotate clockwise'
	} );
	rotateClockwise.doAction = function ( image ) {
		Caman( image, function () {
			this.rotate( 90 );
			this.render();
		} );

		return {};
	};
	rotateClockwise.undoAction = function ( image ) {
		Caman( image, function () {
			this.rotate( -90 );
			this.render();
		} );
	};
	this.registerTool( rotateClockwise );

	flipVertical = new ImageTool( {
		name: 'flipVertical',
		icon: 'flip-vertical',
		title: 'Flip vertical'
	} );
	flipVertical.doAction = function ( image ) {
		Caman( image, function () {
			this.flip( 'y' );
			this.render();
		} );

		return {};
	};
	flipVertical.undoAction = function ( image ) {
		Caman( image, function () {
			this.flip( 'y' );
			this.render();
		} );
	};
	this.registerTool( flipVertical );

	flipHorizontal = new ImageTool( {
		name: 'flipHorizontal',
		icon: 'flip-horizontal',
		title: 'Flip horizontal'
	} );
	flipHorizontal.doAction = function ( image ) {
		Caman( image, function () {
			this.flip( 'x' );
			this.render();
		} );

		return {};
	};
	flipHorizontal.undoAction = function ( image ) {
		Caman( image, function () {
			this.flip( 'x' );
			this.render();
		} );
	};
	this.registerTool( flipHorizontal );

	crop = new ImageTool( {
		name: 'crop',
		icon: 'crop',
		title: 'Crop',
		isInteractive: true
	} );

	crop.getAction = function ( panel, image ) {
		this.deferred = $.Deferred();
		this.panel = panel;
		this.image = image;
		this.setupInterface();

		return this.deferred.promise();
	};

	crop.setupInterface = function () {
		var controls;

		this.widthInput = new OO.ui.TextInputWidget( { value: 20 } );
		this.heightInput = new OO.ui.TextInputWidget( { value: 20 } );
		this.xInput = new OO.ui.TextInputWidget( { value: 0 } );
		this.yInput = new OO.ui.TextInputWidget( { value: 0 } );
		this.crop = new OO.ui.ButtonWidget( {
			label: 'Crop',
			flags: [ 'primary', 'progressive' ]
		} );
		this.cancel = new OO.ui.ButtonWidget( {
			label: 'Cancel',
			flags: [ 'destructive' ]
		} );

		this.crop.on( 'click', function () {
			var action = {
				width: this.widthInput.getValue(),
				height: this.heightInput.getValue(),
				x: this.xInput.getValue(),
				y: this.yInput.getValue()
			};
			this.deferred.resolve( this.doAction( this.image, action ) );
		}.bind( this ) );

		this.cancel.on( 'click', function () {
			this.deferred.reject();
		}.bind( this ) );

		controls = new OO.ui.HorizontalLayout( {
			items: [
				this.widthInput,
				this.heightInput,
				this.xInput,
				this.yInput,
				this.crop,
				this.cancel
			]
		} );
		this.panel.$element.append( controls.$element );
	};

	crop.doAction = function ( image, action ) {
		var canvas, height, width, data;
		canvas = $( image ).eq( 0 )[ 0 ];
		height = canvas.height;
		width = canvas.width;
		data = canvas.getContext( '2d' ).getImageData( 0, 0, width, height );
		action.oldImageData = data;
		Caman( image, function () {
			this.crop( action.width, action.height, action.x, action.y );
			this.render();
		} );

		return action;
	};

	crop.undoAction = function ( image, action ) {
		var canvas = $( image ).eq( 0 )[ 0 ];
		canvas.height = action.oldImageData.height;
		canvas.width = action.oldImageData.width;
		canvas.getContext( '2d' ).putImageData(	action.oldImageData, 0, 0 );
	};

	this.registerTool( crop );

};

window.ImageEditor = ImageEditor;

}( jQuery, OO, ImageTool, Caman ) );
