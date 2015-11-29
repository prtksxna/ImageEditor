( function ( $, OO, ImageEditor ) {

$( function () {
	var e = new ImageEditor( {
		containerId: 'editor',
		imagePath: 'cat.png'
	} );
	e.initialize();
} );

}( jQuery, OO, ImageEditor ) );
