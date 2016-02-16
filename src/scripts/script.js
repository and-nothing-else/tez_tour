import initCarousel from './_carousel'
import initMap from './_map'


class App {
    constructor() {
        this._initElements();
        this.scrollDuration = 3000;
        this.tileAnimationDuration = 300;

        this.shown = {
            showcase: false,
            about: false,
            partners: false,
            community: false,
            codex: false,
            contact: false
        };

        this.findSectionPositions();
        this._initHeader();
        this._initMainMenu();
        this._initNav();
        this._initScrollNav();
        this._initTiles();

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

        this.$tiles = $(".tile_content");
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
            if (bp < 0) bp = 0;
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
            if (!this.menuClicked) {
                if (newSection != this.currentSection) {
                    this.setActiveMenuItem(newSection);
                    this.currentSection = newSection;
                }
            }
            if (!this.shown[newSection]) {
                $(`.section--${newSection} .out`).removeClass("out");
                this.shown[newSection] = true;
                if(newSection == 'codex') {
                    let tilesQueue = [];
                    for (let i = 0; i < this.$tiles.size(); i++) tilesQueue.push(i);
                    tilesQueue.sort(() => .5 - Math.random());
                    let ShowTile = (arr) => {
                        let tileIndex = arr.pop(),
                            $tile = this.$tiles.eq(tileIndex);
                        $tile.removeClass("tile_out");
                        setTimeout(() => {
                            if (arr.length) {
                                ShowTile(arr);
                            }
                        }, 500);
                    };
                    ShowTile(tilesQueue);
                }
            }
        });
        $(window).resize(() => this.findSectionPositions());
        $(window).trigger("scroll");
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

    _initTiles() {
        let animationDuration = this.tileAnimationDuration;
        function getTileDirection($el, mouseX, mouseY) {
            let w = $el.width(),
                h = $el.height(),
                x = ( mouseX - $el.offset().left - ( w/2 )) * ( w > h ? ( h/w ) : 1 ),
                y = ( mouseY - $el.offset().top  - ( h/2 )) * ( h > w ? ( w/h ) : 1 ),
                direction = Math.round( ( ( ( Math.atan2(y, x) * (180 / Math.PI) ) + 180 ) / 90 ) + 3 ) % 4;
            return (direction);
        }

        this.$tiles.hover(
            function(e) {
                let $el = $(this),
                    $overlay = $el.find(".tile_content__overlay"),
                    overlayStyles = {left: '-100%', top: 0},
                    $placeHolder = $el.find(".tile_content__placeholder"),
                    placeholderStyles = {left: '100%', top: 0},
                    direction = getTileDirection($el, e.pageX, e.pageY);

                switch(direction) {
                    case 0: overlayStyles = {left: 0, top: '-100%'}; placeholderStyles = {left: 0, top: '100%'}; break;
                    case 1: overlayStyles = {left: '100%', top: 0}; placeholderStyles = {left: '-100%', top: 0}; break;
                    case 2: overlayStyles = {left: 0, top: '100%'}; placeholderStyles = {left: 0, top: '-100%'}; break;
                }

                if(e.type == "mouseenter" || e.type == "mouseover") {
                    $overlay.stop().css(overlayStyles).animate({left: 0, top: 0}, animationDuration);
                    $placeHolder.stop().css({left: 0, top: 0}).animate(placeholderStyles, animationDuration);
                } else {
                    $overlay.stop().css({left: 0, top: 0}).animate(overlayStyles, animationDuration);
                    $placeHolder.stop().css(placeholderStyles).animate({left: 0, top: 0}, animationDuration);
                }
            }
        );
    }
}


$(function(){
    new App();
    initCarousel();
    initMap();
});
