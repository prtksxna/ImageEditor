( function ( $, OO ) {

mw = {};

mw.ImageTweaks = function ( containerId, imagePath ) {

	this.$container = $( '#' + containerId );
	this.$container
		.addClass( 'mwe-imagetweaks-editor' )
		.append(
			$( '<div>' )
				.addClass( 'mwe-imagetweaks-canvas-container' )
				.append(
					$( '<img>' )
						.attr( 'src', imagePath )
						.attr( 'id', 'mwe-imagetweaks-image' )
				)
		);

	// Editor
	this.editor = new OO.ui.PanelLayout( {
		framed: true,
		padded: false,
	} );

	// TODO Get a container
	this.$container.append( this.editor.$element );

	// Toolbar
	this.toolFactory = new OO.ui.ToolFactory();
	this.toolGroupFactory = new OO.ui.ToolGroupFactory();
	this.toolbar = new OO.ui.Toolbar( this.toolFactory, this.toolGroupFactory, {
		actions: true
	} );

	this.setupTools();

	// Setup toolbar
	this.toolbar.setup( [
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
	] );

	this.saveButton = new OO.ui.ButtonWidget( {
		label: 'Save',
		flags: [ 'progressive', 'primary' ]
	} );
	this.toolbar.$actions.append( this.saveButton.$element );

	this.editor.$element.append( this.toolbar.$element );
}

mw.ImageTweaks.prototype.setupTools = function () {

	// Undo
	this.setupTool( {
		name: 'undo',
		icon: 'undo',
		title: 'Undo'
	}, function () {
		console.log( 'undo' );
		this.setActive( false );
	} );

	// Redo
	this.setupTool( {
		name: 'redo',
		icon: 'redo',
		title: 'Redo'
	}, function () {
		console.log( 'redo' );
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
		console.log( 'crop' );
		this.setActive( false );
	} );
};

mw.ImageTweaks.prototype.setupTool = function ( config, onSelect ) {
	function Tool () {
		Tool.super.apply( this, arguments );
	}
	OO.inheritClass( Tool, OO.ui.Tool );

	Tool.static.name = config.name;
	Tool.static.icon = config.icon;
	Tool.static.title = config.title;

	Tool.prototype.onSelect = onSelect

	Tool.prototype.onUpdateState = function () {
		this.setActive( false );
	};

	this.toolFactory.register( Tool );
}

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
	};
};

// Init
$( function () {
	var e = new mw.ImageTweaks( 'editor', 'cat.png' );
} );

}( jQuery, OO ) );
