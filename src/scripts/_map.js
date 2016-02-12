function initMap() {
    const coordinates = {
        lat: 25.06295762,
        lng: 55.16853801
    },
    styleArray = [
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                { color: "#d5bb8e"},
                { visibility: "simplified" }
            ]
        },
        {
            featureType: "landscape",
            stylers: [
                { color: "#153352"}
            ]
        },
        {
            featureType: "water",
            stylers: [
                { color: "#102d4a"}
            ]
        },
        {
            featureType: "poi",
            stylers: [
                { color: "#183857"}
            ]
        },
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                { color: "#214262"}
            ]
        },
        {
            featureType: "road",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        },
        {
            featureType: "transit",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ];
    var map = new google.maps.Map(
        document.getElementById('map'),
        {
            center: coordinates,
            zoom: 14,
            styles: styleArray,
            scrollwheel: false,
            mapTypeControl: false
        }
    );
}


export default initMap
