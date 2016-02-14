import initCarousel from './_carousel'
import initMap from './_map'


class App {
    constructor() {
        this._initElements();
        this.scrollDuration = 3000;

        this.findSectionPositions();
        this._initHeader();
        this._initMainMenu();
        this._initNav();
        this._initScrollNav();
        $(window).load(() => {
            this.findSectionPositions();
            this.setHeaderPosition();
        });
    }

    _initElements() {
        this.$header = $(".page_header");
        this.headerFixed = false;
        this.headerHeight = this.$header.outerHeight();
        this.headerDefaultPos = this.$header.offset().top;

        this.$navLinks = $(".nav_link");

        this.$mainMenu = $(".main_menu");
        this.$mainMenuLink = this.$mainMenu.find(".main_menu__link");
        this.$mainMenuTrigger = this.$mainMenu.find(".trigger");
        this.$mainMenuActiveMarker = this.$mainMenu.find(".main_menu__marker");

        this.$sections = $(".section");
    }

    setHeaderPosition() {
        if($(window).scrollTop() >= this.headerDefaultPos) {
            if(!this.headerFixed){
                this.$header.addClass("fixed");
                this.headerFixed = true;
            }
        } else {
            if(this.headerFixed){
                this.$header.removeClass("fixed");
                this.headerFixed = false;
            }
        }
    }

    _initHeader() {
        $(window).scroll(() => this.setHeaderPosition());
    }

    _initMainMenu() {
        this.$mainMenuTrigger.on("click", e => {
            e.stopPropagation();
            this.$mainMenu.toggleClass("open");
        });
        $("body").on("click", () => this.$mainMenu.removeClass("open"));
    }

    _initNav() {
        let self = this;
        this.$navLinks.on("click", function(e){
            let sectionID = $(this).attr("href").replace("#", "");
            e.preventDefault();
            self.scroll2Section(sectionID);
            self.setActiveMenuItem(sectionID);
            self.menuClicked = true;
            setTimeout(() => self.menuClicked = false, 500);
        });
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
            scrollTop: this.sectionPositions[sectionID] || 0,
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
