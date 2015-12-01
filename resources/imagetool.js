( function ( $, OO ) {

var ImageTool;

/**
 * @class ImageTool
 *
 * Tools used within ImageEditor.
 *
 * ## Simple tools
 * To register a simple tool like rotate, only implement the
 * {@link #doAction} and {@link #undoAction} methods.
 *
 *     rotateClockwise = new ImageTool( {
 *     	name: 'rotateClockwise',
 *     	icon: 'rotate-clockwise',
 *     	title: 'Rotate clockwise'
 *     } );
 *
 *     rotateClockwise.doAction = function ( image ) {
 *     	// Call Caman methods directly on image
 *     	image.rotate( 90 );
 *     	image.render();
 *     	return {};
 *     };
 *
 *     rotateClockwise.undoAction = function ( image ) {
 *     	// The rotate tool doesn't need its action object to undo
 *     	image.rotate( -90 );
 *     	image.render();
 *     };
 *
 *     // Register the tool before calling editor.initialize()
 *     editor.registerTool( rotateClockwise );
 *
 * If the icon doesn't exist in OOjs UI, add the CSS class to render a
 * custom icon.
 *
 *     .oo-ui-icon-rotate-clockwise {
 *     	background-image: url( icons/rotate-clockwise.svg );
 *     }
 *
 * ## Interactive tools
 *
 * Some tools, like crop, need an additional user interface to collect
 * data from the user and complete their action. For such tools set
 * {@link #cfg-isInteractive} to `true`. The editor will pass an
 * OO.ui.PanelLayout to render the additional interface. The
 * {@link #doAction} and {@link #undoAction} should still be structured
 * the same way as they are called by the undo and redo methods of the
 * editor. The additional interface of the tool is responsible for calling
 * {@link #doAction} with the right parameters.
 *
 *     crop = new ImageTool( {
 *     	name: 'crop',
 *     	icon: 'crop',
 *     	title: 'Crop',
 *     	isInteractive: true
 *     } );
 *
 *     crop.setupInterface = function ( image, panel ) {
 *     	var controls;
 *
 *     	this.widthInput = new OO.ui.TextInputWidget( { value: 20 } );
 *     	this.heightInput = new OO.ui.TextInputWidget( { value: 20 } );
 *     	this.xInput = new OO.ui.TextInputWidget( { value: 0 } );
 *     	this.yInput = new OO.ui.TextInputWidget( { value: 0 } );
 *     	this.crop = new OO.ui.ButtonWidget( {
 *     		label: 'Crop',
 *     		flags: [ 'primary', 'progressive' ]
 *     	} );
 *     	this.cancel = new OO.ui.ButtonWidget( {
 *     		label: 'Cancel',
 *     		flags: [ 'destructive' ]
 *     	} );
 *
 *     	this.crop.on( 'click', function () {
 *     		var action = {
 *     			width: this.widthInput.getValue(),
 *     			height: this.heightInput.getValue(),
 *     			x: this.xInput.getValue(),
 *     			y: this.yInput.getValue()
 *     		};
 *
 *     		// Call doAction from a UI event
 *     		this.deferred.resolve( this.doAction( image, action ) );
 *     	}.bind( this ) );
 *
 *     	this.cancel.on( 'click', function () {
 *     		// Reject the deferred if tool couldn't complete the action
 *     		this.deferred.reject();
 *     	}.bind( this ) );
 *
 *     	controls = new OO.ui.HorizontalLayout( {
 *     		items: [
 *     			this.widthInput,
 *     			this.heightInput,
 *     			this.xInput,
 *     			this.yInput,
 *     			this.crop,
 *     			this.cancel
 *     		]
 *     	} );
 *     	panel.$element.append( controls.$element );
 *     };
 *
 *     crop.doAction = function ( image, action ) {
 *     	// Save old image data before cropping, will need this for undo
 *     	action.oldImageData = image.imageData;
 *     	image.crop( action.width, action.height, action.x, action.y );
 *     	image.render();
 *     	return action;
 *     };
 *
 *     crop.undoAction = function ( image, action ) {
 *     	// Restore the old image on the canvas
 *     	var canvas = image.canvas;
 *     	canvas.height = action.oldImageData.height;
 *     	canvas.width = action.oldImageData.width;
 *     	image.canvas.getContext( '2d' ).putImageData( action.oldImageData, 0, 0 );
 *     };
 *
 *     this.registerTool( crop );
 *
 * See ImageEditor.registerCoreTools for more exaples.
 *
 * ## Updating the toolbar
 * After registering the tool the update ImageEditor.toolbarGroups for it
 * to show up in the editor's main toolbar.
 *
 *     editor.setToolbarGroup( editor.getToolbarGroup().push( {
 *     	type: 'bar',
 *     	includes: [ 'myNewTool' ]
 *     } ) );
 *
 * @cfg {string} name (required)
 * @cfg {string} icon (required)
 * @cfg {string} title (required)
 * @cfg {boolean} [isInteractive=false]
 */
ImageTool = function ( config ) {

	if (
		config.name === undefined ||
		config.icon === undefined ||
		config.title === undefined
	) {
		throw new Error( 'All config not passed' );
	}

	this.name =  config.name;
	this.icon = config.icon;
	this.title = config.title;
	this.isInteractive = config.isInteractive || false;
};

OO.initClass( ImageTool );

/**
 * Does the action of the tool.
 *
 * @abstract
 * @method doAction
 * @param {Caman} image Caman image object to be maupilated.
 * @param {Object} [action] Passed when action is being re-done.
 * @return {Object} Returns an action object to be saved by the
 * editor. This action should have data required by the tool to undo
 * its action.
 */
ImageTool.prototype.doAction = null;

/**
 * Undoes the action of the tool.
 *
 * @abstract
 * @method undoAction
 * @param {Caman} image Caman image object to be maupilated.
 * @param {Object} action Passes previously saved action data to undo.
 */
ImageTool.prototype.undoAction = null;

// Interactive tool specific methods

/**
 * Called for interactive tool. Returns a promise that should be
 * resolved with the action object once the tool is done processing.
 *
 * @method getAction
 * @param {Caman} image Caman image object to be maupilated.
 * @param {OO.ui.PanelLayout} panel Panel object to render additional UI for the tool
 */
ImageTool.prototype.getAction = function ( image, panel ) {
	this.deferred = $.Deferred();
	this.setupInterface( image, panel );
	return this.deferred.promise();
};

/**
 * Called by {@link #getAction} to setup the required UI elements for
 * the interactive tool. It should setup the UI control that calls
 * {@link #doAction} with the required `action` object.
 *
 * @abstract
 * @private
 * @method setupInterface
 * @param {Caman} image Caman image object to be maupilated.
 * @param {OO.ui.PanelLayout} panel Panel object to render additional UI for the tool
 */
ImageTool.prototype.setupInterface = null;

window.ImageTool = ImageTool;

}( jQuery, OO ) );
