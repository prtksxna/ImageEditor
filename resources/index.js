( function ( $, OO, ImageEditor ) {

$( function () {
	var e = new ImageEditor( {
		containerId: 'editor',
		imagePath: 'flower.jpg'
	} );
	e.initialize();
} );

}( jQuery, OO, ImageEditor ) );
