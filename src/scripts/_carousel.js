import owlCarousel from '../../node_modules/owlcarousel/owl-carousel/owl.carousel'

function startCarousel($carousel) {
    $carousel.owlCarousel({
        items : 5,
        itemsDesktop: false,
        itemsDesktopSmall : [939,3],
        itemsTablet: [719, 1],
        navigation : true,
        pagination : false,
        navigationText: ["", ""]
    });
}

function initCarousel() {
    $.getJSON("/api/partners.json", (data) => {
        let $carousel = $("#partners-carousel");

        data.sort(() => .5 - Math.random());

        for (let partner of data) {
            let $cItem = $("<div>").addClass("slide"),
                $cImg = $("<img>").attr("src", `/images/partners/${partner.img}`);
            if (partner.link) {
                $cItem.html($(`<a href=${partner.link}>`).html($cImg));
            } else {
                $cItem.html($cImg);
            }
            $carousel.append($cItem);
        }

        startCarousel($carousel);
    });
    startCarousel($("#community-carousel"));
}


export default initCarousel
