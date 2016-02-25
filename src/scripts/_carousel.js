import owlCarousel from '../../node_modules/owlcarousel/owl-carousel/owl.carousel'


function initCarousel() {
    $(".owl-carousel").owlCarousel({
        items : 5,
        itemsDesktop: false,
        itemsDesktopSmall : [939,3],
        itemsTablet: [719, 1],
        navigation : true,
        pagination : false,
        navigationText: ["", ""]
    });
}


export default initCarousel
