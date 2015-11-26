Caman.Plugin.register( 'flip', function ( axis ) {
	var canvas, ctx, width, height;
	width = this.canvas.width;
	height = this.canvas.height;

	// Support NodeJS by checking for exports object
	if ( typeof exports !== 'undefined' && exports !== null ) {
		canvas = new Canvas( width, height );
	} else {
		canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;
		canvas.id = this.canvas.id;
	}

	ctx = canvas.getContext( '2d' );

	if ( axis === 'x' ) {
		ctx.translate( width, 0 );
		ctx.scale( -1, 1 );
	} else if ( axis === 'y' ) {
		ctx.translate( 0, height );
		ctx.scale( 1, -1 );
	}
	ctx.drawImage( this.canvas, 0, 0 );

	this.replaceCanvas( canvas );
	return this;
} );

Caman.Filter.register( 'flip', function () {
	return this.processPlugin( 'flip', arguments );
} );
