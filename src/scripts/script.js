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
        this.$mainMenuActiveMarker = this.$mainMenu.find(".main_menu__marker");
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
            let sectionID = $(this).attr("href").replace("#", "");
            self.scroll2Section(sectionID);
            self.setActiveMenuItem(sectionID);
        });
    }

    _initScrollNav() {

    }

    scroll2Section(sectionID) {
        let $section = $("#section_" + sectionID),
            scrollPosition = $section.offset().top - this.headerHeight;
        $("html,body").animate({
            scrollTop: scrollPosition,
            duration: this.scrollDuration
        });
    }

    setActiveMenuItem(sectionID) {
        let $menuItem = this.$mainMenuLink.filter(`[href="#${sectionID}"]`);
        if($menuItem.length > 0) {
            let menuItemWidth = $menuItem.width(),
                menuItemLeft = $menuItem.offset().left - this.$mainMenu.offset().left;
            this.$mainMenuLink.removeClass("active");
            $menuItem.addClass("active");
            this.$mainMenuActiveMarker
                .removeClass("outside")
                .css({
                    left: menuItemLeft,
                    width: menuItemWidth
                });
        } else {
            this.$mainMenuActiveMarker.addClass("outside");
        }
    }
}


$(function(){
    new App();
});
