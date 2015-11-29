( function ( $, OO ) {

// We probably don't want this in the mw namespace
var mw = mw || {};

/**
 * @class ImageTweaks
 *
 * ImageEditor is a user interface that allows making edits to
 * images. It uses OO.ui.Toolbar and OO.ui.PanelLayout for the basic
 * UI, and Caman for image editing.
 *
 *     var e = new mw.ImageTweaks( {
 *         containerId: 'editor',
 *         imagePath: 'cat.png'
 *     } );
 *     e.initialize();
 *
 * @cfg {string} containerId DOM ID of the containter in which the
 * editor will be rendered.
 * @cfg {string} imagePath Path of the image to load in the editor.
 */
mw.ImageTweaks = function ( config ) {

	if ( config.containerId === undefined || config.imagePath === undefined ) {
		throw new Error( 'All config not passed' );
	}

	// Setup container
	this.$container = $( '#' + config.containerId );
	this.$container
		.addClass( 'mwe-imagetweaks-editor' )
		.append(
			$( '<div>' )
				.addClass( 'mwe-imagetweaks-canvas-container' )
				.append(
					$( '<img>' )
						.attr( 'src', config.imagePath )
						.attr( 'id', 'mwe-imagetweaks-image' )
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

	/**
	 * @property toolbarGroups The groups config passed to the
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
};

/**
 * Initializes the editor.
 */
mw.ImageTweaks.prototype.initialize = function () {
	this.setupToolbar();

	// TODO Stuff about the editor's state
};

/**
 * Setups up the toolbar.
 */
mw.ImageTweaks.prototype.setupToolbar = function () {
	this.setupTools();

	// Setup toolbar
	this.toolbar.setup( this.getToolbarGroups() );

	this.saveButton = new OO.ui.ButtonWidget( {
		label: 'Save',
		flags: [ 'progressive', 'primary' ]
	} );
	this.toolbar.$actions.append( this.saveButton.$element );
};

/**
 * Setter method for {@link #property-toolbarGroups}.
 *
 * @param {Object} groups
 * @return {Object}
 */
mw.ImageTweaks.prototype.setToolbarGroups = function ( groups ) {
	this.toolbarGroups = groups;
	return this.toolbarGroups;
};

/**
 * Getter method for {@link #property-toolbarGroups}.
 *
 * @return {Object}
 */
mw.ImageTweaks.prototype.getToolbarGroups = function () {
	return this.toolbarGroups;
};

mw.ImageTweaks.prototype.setupTools = function () {
	// Undo
	this.setupTool( {
		name: 'undo',
		icon: 'undo',
		title: 'Undo'
	}, function () {
		this.setActive( false );
	} );

	// Redo
	this.setupTool( {
		name: 'redo',
		icon: 'redo',
		title: 'Redo'
	}, function () {
		this.setActive( false );
	} );

	// Rotate left
	this.setupTool( {
		name: 'rotateCounterClockwise',
		icon: 'rotate-counter-clockwise',
		title: 'Rotate counter clockwise'
	}, function () {
		Caman( '#mwe-imagetweaks-image', function () {
			this.rotate( -90 );
			this.render();
		} );

		this.setActive( false );
	} );

	// Rotate right
	this.setupTool( {
		name: 'rotateClockwise',
		icon: 'rotate-clockwise',
		title: 'Rotate clockwise'
	}, function () {
		Caman( '#mwe-imagetweaks-image', function () {
			this.rotate( 90 );
			this.render();
		} );

		this.setActive( false );
	} );

	// Flip vertical
	this.setupTool( {
		name: 'flipVertical',
		icon: 'flip-vertical',
		title: 'Flip vertical'
	}, function () {
		Caman( '#mwe-imagetweaks-image', function () {
			this.flip( 'y' );
			this.render();
		} );

		this.setActive( false );
	} );

	// Flip horizontal
	this.setupTool( {
		name: 'flipHorizontal',
		icon: 'flip-horizontal',
		title: 'Flip horizontal'
	}, function () {
		Caman( '#mwe-imagetweaks-image', function () {
			this.flip( 'x' );
			this.render();
		} );

		this.setActive( false );
	} );

	// Crop
	this.setupTool( {
		name: 'crop',
		icon: 'crop',
		title: 'Crop'
	}, function () {
		this.setActive( false );
	} );
};

mw.ImageTweaks.prototype.setupTool = function ( config, onSelect ) {
	function Tool() {
		Tool.super.apply( this, arguments );
	}
	OO.inheritClass( Tool, OO.ui.Tool );

	Tool.static.name = config.name;
	Tool.static.icon = config.icon;
	Tool.static.title = config.title;

	Tool.prototype.onSelect = onSelect;

	Tool.prototype.onUpdateState = function () {
		this.setActive( false );
	};

	this.toolFactory.register( Tool );
};

mw.ImageTweaks.prototype.doAction = function ( action ) {
	switch ( action ) {
		case 'rotateCounterClockwise':
			Caman( '#mwe-imagetweaks-image', function () {
				this.rotate( -90 );
				this.render();
			} );
			break;

		case 'rotateClockwise':
			Caman( '#mwe-imagetweaks-image', function () {
				this.rotate( 90 );
				this.render();
			} );
			break;

		default:
			throw new Error( 'Unknown action' );
	}
};

// Init
$( function () {
	var e = new mw.ImageTweaks( {
		containerId: 'editor',
		imagePath: 'cat.png'
	} );
	e.initialize();
} );

}( jQuery, OO ) );
