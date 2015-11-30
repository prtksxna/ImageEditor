( function ( $, OO ) {

var ImageTool;

/**
 * @class ImageTool
 *
 * Tools used within ImageEditor
 *
 * @cfg {string} name
 * @cfg {string} icon
 * @cfg {string} title
 * @cfg {boolean} isInteractive
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
 * @return {Object} action Returns an action object to be saved by the
 * editor. This action should have data required by the tool to undo
 * its action.
 */
// TODO doAction will have to return a promise at some point, for interactive tools
ImageTool.prototype.doAction = null;

/**
 * Does the action of the tool.
 *
 * @abstract
 * @method undoAction
 * @param {Caman} image Caman image object to be maupilated.
 * @param {Object} action Passes previously saved action data to undo.
 */
ImageTool.prototype.undoAction = null;

ImageTool.prototype.getAction = function ( image, panel ) {
	this.deferred = $.Deferred();
	this.image = image;
	this.panel = panel;
	this.setupInterface();
	return this.deferred.promise();
}

window.ImageTool = ImageTool;

}( jQuery, OO ) );
