( function ( $, OO, ImageEditor ) {

$( function () {
	$( '#demo_images a' ).on( 'click', function ( e ) {
		var e = new ImageEditor( {
			containerId: 'editor',
			imagePath: $( this ).attr( 'href' )
		} );
		e.initialize();
		$( '#demo_images' ).remove();
		return false;
	} );

} );

}( jQuery, OO, ImageEditor ) );
