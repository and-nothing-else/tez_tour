import $ from 'jquery'


class App {
    constructor() {
        this._initHeader();
        this._initMainMenu();
    }

    _initHeader() {
        const $header = $(".page_header"),
            headerDefaultPos = $header.offset().top;
        let headerFixed = false;
        function setMainMenuPosition() {
            var scrollTop = $(window).scrollTop();
            if(scrollTop >= headerDefaultPos) {
                if(!headerFixed){
                    $header.addClass("fixed");
                    headerFixed = true;
                }
            } else {
                if(headerFixed){
                    $header.removeClass("fixed");
                    headerFixed = false;
                }
            }
        }
        $(window).scroll(setMainMenuPosition);
    }

    _initMainMenu() {
        const $mainMenu = $(".main_menu"),
            $mainMenuTrigger = $mainMenu.find(".trigger");
        $mainMenuTrigger.on("click", () => $mainMenu.toggleClass("open"));
    }
}


$(function(){
    new App();
});
