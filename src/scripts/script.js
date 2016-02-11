import $ from 'jquery'


class App {
    constructor() {
        this._initElements();
        this.scrollDuration = 3000;

        this._initHeader();
        this._initMainMenu();
        this._initScrollNav();
    }

    _initElements() {
        this.$header = $(".page_header");
        this.headerHeight = this.$header.outerHeight();
        this.headerDefaultPos = this.$header.offset().top;

        this.$mainMenu = $(".main_menu");
        this.$mainMenuLink = this.$mainMenu.find(".main_menu__link");
        this.$mainMenuTrigger = this.$mainMenu.find(".trigger");
    }

    _initHeader() {
        let headerFixed = false;
        $(window).scroll(() => {
            if($(window).scrollTop() >= this.headerDefaultPos) {
                if(!headerFixed){
                    this.$header.addClass("fixed");
                    headerFixed = true;
                }
            } else {
                if(headerFixed){
                    this.$header.removeClass("fixed");
                    headerFixed = false;
                }
            }
        });
    }

    _initMainMenu() {
        let self = this;
        this.$mainMenuTrigger.on("click", () => this.$mainMenu.toggleClass("open"));
        this.$mainMenuLink.on("click", function(){
            self.scroll2Section($(this).attr("href").replace("#", ""));
        });
    }

    _initScrollNav() {

    }

    scroll2Section(sectionID){
        let $section = $("#section_" + sectionID),
            scrollPosition = $section.offset().top - this.headerHeight;
        $("html,body").animate({
            scrollTop: scrollPosition,
            duration: this.scrollDuration
        });
    }
}


$(function(){
    new App();
});
