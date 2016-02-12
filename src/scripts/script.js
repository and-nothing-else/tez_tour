import initCarousel from './_carousel'
import initMap from './_map'


class App {
    constructor() {
        this._initElements();
        this.scrollDuration = 3000;

        this.findSectionPositions();
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

        this.$sections = $(".section");
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
        this.$mainMenuTrigger.on("click", e => {
            e.stopPropagation();
            this.$mainMenu.toggleClass("open");
        });
        this.$mainMenuLink.on("click", function(){
            let sectionID = $(this).attr("href").replace("#", "");
            self.scroll2Section(sectionID);
            self.setActiveMenuItem(sectionID);
            self.menuClicked = true;
            setTimeout(() => self.menuClicked = false, 500);
        });
        $("body").on("click", () => this.$mainMenu.removeClass("open"));
    }

    findSectionPositions() {
        let self = this;
        this.sectionPositions = {};
        this.sectionBreakPoints = [];
        this.$sections.each(function(){
            let sectionID = $(this).attr("id").replace("section_", ""),
                bp = $(this).offset().top - self.headerHeight;
            self.sectionPositions[sectionID] = bp;
            self.sectionBreakPoints.push(bp);
        });
        self.sectionBreakPoints.sort((a, b) => a - b);
    }

    _initScrollNav() {
        this.findSectionPositions();
        this.currentSection = '';
        this.menuClicked = false;
        let fp = $(window).height() / 4,
            newSection = '';
        $(window).scroll(() => {
            if (!this.menuClicked) {
                let scrollPosition = $(window).scrollTop();
                let bp = Math.max(...this.sectionBreakPoints.filter(v => v <= scrollPosition + fp));
                for (let s in this.sectionPositions) {
                    if(this.sectionPositions.hasOwnProperty(s)) {
                        if (this.sectionPositions[s] == bp) {
                            newSection = s;
                            break;
                        }
                    }
                }
                if (newSection != this.currentSection) {
                    this.setActiveMenuItem(newSection);
                    this.currentSection = newSection;
                }
            }
        });
        $(window).resize(() => this.findSectionPositions());
    }

    scroll2Section(sectionID) {
        $("html,body").animate({
            scrollTop: this.sectionPositions[sectionID],
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
    initCarousel();
    initMap();
});
