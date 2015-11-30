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
 * @param {string} image Selector to pass to Caman
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
 * @param {string} image Selector to pass to Caman
 * @param {Object} action Object required by the tool to undo its action.
 */
ImageTool.prototype.undoAction = null;

window.ImageTool = ImageTool;

}( jQuery, OO ) );
