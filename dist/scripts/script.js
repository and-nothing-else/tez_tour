(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 *  jQuery OwlCarousel v1.3.3
 *
 *  Copyright (c) 2013 Bartosz Wojciechowski
 *  http://www.owlgraphic.com/owlcarousel/
 *
 *  Licensed under MIT
 *
 */

/*JS Lint helpers: */
/*global dragMove: false, dragEnd: false, $, jQuery, alert, window, document */
/*jslint nomen: true, continue:true */

if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function ($, window, document) {

    var Carousel = {
        init : function (options, el) {
            var base = this;

            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

            base.userOptions = options;
            base.loadContent();
        },

        loadContent : function () {
            var base = this, url;

            function getData(data) {
                var i, content = "";
                if (typeof base.options.jsonSuccess === "function") {
                    base.options.jsonSuccess.apply(this, [data]);
                } else {
                    for (i in data.owl) {
                        if (data.owl.hasOwnProperty(i)) {
                            content += data.owl[i].item;
                        }
                    }
                    base.$elem.html(content);
                }
                base.logIn();
            }

            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }

            if (typeof base.options.jsonPath === "string") {
                url = base.options.jsonPath;
                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        },

        logIn : function () {
            var base = this;

            base.$elem.data({
                "owl-originalStyles": base.$elem.attr("style"),
                "owl-originalClasses": base.$elem.attr("class")
            });

            base.$elem.css({opacity: 0});
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible = null;
            base.setVars();
        },

        setVars : function () {
            var base = this;
            if (base.$elem.children().length === 0) {return false; }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        },

        onStartup : function () {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();

            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();

            base.$elem.find(".owl-wrapper").css("display", "block");

            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        },

        eachMoveUpdate : function () {
            var base = this;

            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();

            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        },

        updateVars : function () {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        },

        reload : function () {
            var base = this;
            window.setTimeout(function () {
                base.updateVars();
            }, 0);
        },

        watchVisibility : function () {
            var base = this;

            if (base.$elem.is(":visible") === false) {
                base.$elem.css({opacity: 0});
                window.clearInterval(base.autoPlayInterval);
                window.clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = window.setInterval(function () {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({opacity: 1}, 200);
                    window.clearInterval(base.checkVisible);
                }
            }, 500);
        },

        wrapItems : function () {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        },

        baseClass : function () {
            var base = this,
                hasBaseClass = base.$elem.hasClass(base.options.baseClass),
                hasThemeClass = base.$elem.hasClass(base.options.theme);

            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }

            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        },

        updateItems : function () {
            var base = this, width, i;

            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }

            width = $(base.options.responsiveBaseWidth).width();

            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (base.options.itemsCustom !== false) {
                //Reorder array by screen size
                base.options.itemsCustom.sort(function (a, b) {return a[0] - b[0]; });

                for (i = 0; i < base.options.itemsCustom.length; i += 1) {
                    if (base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }

            } else {

                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }

                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }

                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }

                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }

                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }

            //if number of items is less than declared
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        },

        response : function () {
            var base = this,
                smallDelay,
                lastWindowWidth;

            if (base.options.responsive !== true) {
                return false;
            }
            lastWindowWidth = $(window).width();

            base.resizer = function () {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        window.clearInterval(base.autoPlayInterval);
                    }
                    window.clearTimeout(smallDelay);
                    smallDelay = window.setTimeout(function () {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            };
            $(window).resize(base.resizer);
        },

        updatePosition : function () {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        },

        appendItemsSizes : function () {
            var base = this,
                roundPages = 0,
                lastItem = base.itemsAmount - base.options.items;

            base.$owlItems.each(function (index) {
                var $this = $(this);
                $this
                    .css({"width": base.itemWidth})
                    .data("owl-item", Number(index));

                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages);
            });
        },

        appendWrapperSizes : function () {
            var base = this,
                width = base.$owlItems.length * base.itemWidth;

            base.$owlWrapper.css({
                "width": width * 2,
                "left": 0
            });
            base.appendItemsSizes();
        },

        calculateAll : function () {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        },

        calculateWidth : function () {
            var base = this;
            base.itemWidth = Math.round(base.$elem.width() / base.options.items);
        },

        max : function () {
            var base = this,
                maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0;
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        },

        min : function () {
            return 0;
        },

        loops : function () {
            var base = this,
                prev = 0,
                elWidth = 0,
                i,
                item,
                roundPageNum;

            base.positionsInArray = [0];
            base.pagesInArray = [];

            for (i = 0; i < base.itemsAmount; i += 1) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);

                if (base.options.scrollPerPage === true) {
                    item = $(base.$owlItems[i]);
                    roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        },

        buildControls : function () {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        },

        buildButtons : function () {
            var base = this,
                buttonsWrapper = $("<div class=\"owl-buttons\"/>");
            base.owlControls.append(buttonsWrapper);

            base.buttonPrev = $("<div/>", {
                "class" : "owl-prev",
                "html" : base.options.navigationText[0] || ""
            });

            base.buttonNext = $("<div/>", {
                "class" : "owl-next",
                "html" : base.options.navigationText[1] || ""
            });

            buttonsWrapper
                .append(base.buttonPrev)
                .append(base.buttonNext);

            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
            });

            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            });
        },

        buildPagination : function () {
            var base = this;

            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);

            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        },

        updatePagination : function () {
            var base = this,
                counter,
                lastPage,
                lastItem,
                i,
                paginationButton,
                paginationButtonInner;

            if (base.options.pagination === false) {
                return false;
            }

            base.paginationWrapper.html("");

            counter = 0;
            lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

            for (i = 0; i < base.itemsAmount; i += 1) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        lastItem = base.itemsAmount - base.options.items;
                    }
                    paginationButton = $("<div/>", {
                        "class" : "owl-page"
                    });
                    paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);

                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);

                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        },
        checkPagination : function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function () {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper
                        .find(".owl-page")
                        .removeClass("active");
                    $(this).addClass("active");
                }
            });
        },

        checkNavigation : function () {
            var base = this;

            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        },

        updateControls : function () {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        },

        destroyControls : function () {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        },

        next : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        prev : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0;
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind";
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        goTo : function (position, speed, drag) {
            var base = this,
                goToPixel;

            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }

            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0);
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            goToPixel = base.positionsInArray[position];

            if (base.browser.support3d === true) {
                base.isCss3Finish = false;

                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);

                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);

                } else {
                    base.swapSpeed("slideSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        },

        jumpTo : function (position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0);
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        },

        afterGo : function () {
            var base = this;

            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0);

            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();

                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        },

        stop : function () {
            var base = this;
            base.apStatus = "stop";
            window.clearInterval(base.autoPlayInterval);
        },

        checkAp : function () {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        },

        play : function () {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            window.clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = window.setInterval(function () {
                base.next(true);
            }, base.options.autoPlay);
        },

        swapSpeed : function (action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        },

        addCssSpeed : function (speed) {
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        },

        removeTransition : function () {
            return {
                "-webkit-transition": "",
                "-moz-transition": "",
                "-o-transition": "",
                "transition": ""
            };
        },

        doTranslate : function (pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        },

        transition3d : function (value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        },

        css2move : function (value) {
            var base = this;
            base.$owlWrapper.css({"left" : value});
        },

        css2slide : function (value, speed) {
            var base = this;

            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({
                "left" : value
            }, {
                duration : speed || base.options.slideSpeed,
                complete : function () {
                    base.isCssFinish = true;
                }
            });
        },

        checkBrowser : function () {
            var base = this,
                translate3D = "translate3d(0px, 0px, 0px)",
                tempElem = document.createElement("div"),
                regex,
                asSupport,
                support3d,
                isTouch;

            tempElem.style.cssText = "  -moz-transform:" + translate3D +
                                  "; -ms-transform:"     + translate3D +
                                  "; -o-transform:"      + translate3D +
                                  "; -webkit-transform:" + translate3D +
                                  "; transform:"         + translate3D;
            regex = /translate3d\(0px, 0px, 0px\)/g;
            asSupport = tempElem.style.cssText.match(regex);
            support3d = (asSupport !== null && asSupport.length === 1);

            isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

            base.browser = {
                "support3d" : support3d,
                "isTouch" : isTouch
            };
        },

        moveEvents : function () {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        },

        eventTypes : function () {
            var base = this,
                types = ["s", "e", "x"];

            base.ev_types = {};

            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl mousedown.owl",
                    "touchmove.owl mousemove.owl",
                    "touchend.owl touchcancel.owl mouseup.owl"
                ];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl",
                    "touchmove.owl",
                    "touchend.owl touchcancel.owl"
                ];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = [
                    "mousedown.owl",
                    "mousemove.owl",
                    "mouseup.owl"
                ];
            }

            base.ev_types.start = types[0];
            base.ev_types.move = types[1];
            base.ev_types.end = types[2];
        },

        disabledEvents :  function () {
            var base = this;
            base.$elem.on("dragstart.owl", function (event) { event.preventDefault(); });
            base.$elem.on("mousedown.disableTextSelect", function (e) {
                return $(e.target).is('input, textarea, select, option');
            });
        },

        gestures : function () {
            /*jslint unparam: true*/
            var base = this,
                locals = {
                    offsetX : 0,
                    offsetY : 0,
                    baseElWidth : 0,
                    relativePos : 0,
                    position: null,
                    minSwipe : null,
                    maxSwipe: null,
                    sliding : null,
                    dargging: null,
                    targetElement : null
                };

            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x : event.touches[0].pageX,
                        y : event.touches[0].pageY
                    };
                }

                if (event.touches === undefined) {
                    if (event.pageX !== undefined) {
                        return {
                            x : event.pageX,
                            y : event.pageY
                        };
                    }
                    if (event.pageX === undefined) {
                        return {
                            x : event.clientX,
                            y : event.clientY
                        };
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types.move, dragMove);
                    $(document).on(base.ev_types.end, dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types.move);
                    $(document).off(base.ev_types.end);
                }
            }

            function dragStart(event) {
                var ev = event.originalEvent || event || window.event,
                    position;

                if (ev.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }

                if (base.options.autoPlay !== false) {
                    window.clearInterval(base.autoPlayInterval);
                }

                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing");
                }

                base.newPosX = 0;
                base.newRelativeX = 0;

                $(this).css(base.removeTransition());

                position = $(this).position();
                locals.relativePos = position.left;

                locals.offsetX = getTouches(ev).x - position.left;
                locals.offsetY = getTouches(ev).y - position.top;

                swapEvents("on");

                locals.sliding = false;
                locals.targetElement = ev.target || ev.srcElement;
            }

            function dragMove(event) {
                var ev = event.originalEvent || event || window.event,
                    minSwipe,
                    maxSwipe;

                base.newPosX = getTouches(ev).x - locals.offsetX;
                base.newPosY = getTouches(ev).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;

                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }

                if ((base.newRelativeX > 8 || base.newRelativeX < -8) && (base.browser.isTouch === true)) {
                    if (ev.preventDefault !== undefined) {
                        ev.preventDefault();
                    } else {
                        ev.returnValue = false;
                    }
                    locals.sliding = true;
                }

                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }

                minSwipe = function () {
                    return base.newRelativeX / 5;
                };

                maxSwipe = function () {
                    return base.maximumPixels + base.newRelativeX / 5;
                };

                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var ev = event.originalEvent || event || window.event,
                    newPosition,
                    handlers,
                    owlStopEvent;

                ev.target = ev.target || ev.srcElement;

                locals.dragging = false;

                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }

                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left";
                } else {
                    base.dragDirection = base.owl.dragDirection = "right";
                }

                if (base.newRelativeX !== 0) {
                    newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
                        $(ev.target).on("click.disable", function (ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(ev.target).off("click.disable");
                        });
                        handlers = $._data(ev.target, "events").click;
                        owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }
            base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
        },

        getNewPosition : function () {
            var base = this,
                newPosition = base.closestItem();

            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition  = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        },
        closestItem : function () {
            var base = this,
                array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX,
                closest = null;

            $.each(array, function (i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                } else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        },

        moveDirection : function () {
            var base = this,
                direction;
            if (base.newRelativeX < 0) {
                direction = "right";
                base.playDirection = "next";
            } else {
                direction = "left";
                base.playDirection = "prev";
            }
            return direction;
        },

        customEvents : function () {
            /*jslint unparam: true*/
            var base = this;
            base.$elem.on("owl.next", function () {
                base.next();
            });
            base.$elem.on("owl.prev", function () {
                base.prev();
            });
            base.$elem.on("owl.play", function (event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function () {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function (event, item) {
                base.goTo(item);
            });
            base.$elem.on("owl.jumpTo", function (event, item) {
                base.jumpTo(item);
            });
        },

        stopOnHover : function () {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function () {
                    base.stop();
                });
                base.$elem.on("mouseout", function () {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        },

        lazyLoad : function () {
            var base = this,
                i,
                $item,
                itemNumber,
                $lazyImg,
                follow;

            if (base.options.lazyLoad === false) {
                return false;
            }
            for (i = 0; i < base.itemsAmount; i += 1) {
                $item = $(base.$owlItems[i]);

                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }

                itemNumber = $item.data("owl-item");
                $lazyImg = $item.find(".lazyOwl");

                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    $lazyImg.each(function() {
                        base.lazyPreload($item, $(this));
                    });
                }
            }
        },

        lazyPreload : function ($item, $lazyImg) {
            var base = this,
                iterations = 0,
                isBackgroundImg;

            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                if (base.options.lazyEffect === "fade") {
                    $lazyImg.fadeIn(400);
                } else {
                    $lazyImg.show();
                }
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) {//if image loads in less than 10 seconds 
                    window.setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            checkLazyImage();
        },

        autoHeight : function () {
            var base = this,
                $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
                iterations;

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    window.setTimeout(function () {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", ""); //Else remove height attribute
                }
            }

            if ($currentimg.get(0) !== undefined) {
                iterations = 0;
                checkImage();
            } else {
                addHeight();
            }
        },

        completeImg : function (img) {
            var naturalWidthType;

            if (!img.complete) {
                return false;
            }
            naturalWidthType = typeof img.naturalWidth;
            if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
                return false;
            }
            return true;
        },

        onVisibleItems : function () {
            var base = this,
                i;

            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
                base.visibleItems.push(i);

                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        },

        transitionTypes : function (className) {
            var base = this;
            //Currently available: "fade", "backSlide", "goDown", "fadeUp"
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        },

        singleItemTransition : function () {
            var base = this,
                outClass = base.outClass,
                inClass = base.inClass,
                $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
                animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

            base.isTransition = true;

            base.$owlWrapper
                .addClass('owl-origin')
                .css({
                    "-webkit-transform-origin" : origin + "px",
                    "-moz-perspective-origin" : origin + "px",
                    "perspective-origin" : origin + "px"
                });
            function transStyles(prevPos) {
                return {
                    "position" : "relative",
                    "left" : prevPos + "px"
                };
            }

            $prevItem
                .css(transStyles(prevPos, 10))
                .addClass(outClass)
                .on(animEnd, function () {
                    base.endPrev = true;
                    $prevItem.off(animEnd);
                    base.clearTransStyle($prevItem, outClass);
                });

            $currentItem
                .addClass(inClass)
                .on(animEnd, function () {
                    base.endCurrent = true;
                    $currentItem.off(animEnd);
                    base.clearTransStyle($currentItem, inClass);
                });
        },

        clearTransStyle : function (item, classToRemove) {
            var base = this;
            item.css({
                "position" : "",
                "left" : ""
            }).removeClass(classToRemove);

            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        },

        owlStatus : function () {
            var base = this;
            base.owl = {
                "userOptions"   : base.userOptions,
                "baseElement"   : base.$elem,
                "userItems"     : base.$userItems,
                "owlItems"      : base.$owlItems,
                "currentItem"   : base.currentItem,
                "prevItem"      : base.prevItem,
                "visibleItems"  : base.visibleItems,
                "isTouch"       : base.browser.isTouch,
                "browser"       : base.browser,
                "dragDirection" : base.dragDirection
            };
        },

        clearEvents : function () {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        },

        unWrap : function () {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem.attr({
                style: base.$elem.data("owl-originalStyles") || "",
                class: base.$elem.data("owl-originalClasses")
            });
        },

        destroy : function () {
            var base = this;
            base.stop();
            window.clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        },

        reinit : function (newOptions) {
            var base = this,
                options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        },

        addItem : function (htmlString, targetPosition) {
            var base = this,
                position;

            if (!htmlString) {return false; }

            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString);
            } else {
                base.$userItems.eq(position).before(htmlString);
            }

            base.setVars();
        },

        removeItem : function (targetPosition) {
            var base = this,
                position;

            if (base.$elem.children().length === 0) {
                return false;
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }

            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }

    };

    $.fn.owlCarousel = function (options) {
        return this.each(function () {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };

    $.fn.owlCarousel.options = {

        items : 5,
        itemsCustom : false,
        itemsDesktop : [1199, 4],
        itemsDesktopSmall : [979, 3],
        itemsTablet : [768, 2],
        itemsTabletSmall : false,
        itemsMobile : [479, 1],
        singleItem : false,
        itemsScaleUp : false,

        slideSpeed : 200,
        paginationSpeed : 800,
        rewindSpeed : 1000,

        autoPlay : false,
        stopOnHover : false,

        navigation : false,
        navigationText : ["prev", "next"],
        rewindNav : true,
        scrollPerPage : false,

        pagination : true,
        paginationNumbers : false,

        responsive : true,
        responsiveRefreshRate : 200,
        responsiveBaseWidth : window,

        baseClass : "owl-carousel",
        theme : "owl-theme",

        lazyLoad : false,
        lazyFollow : true,
        lazyEffect : "fade",

        autoHeight : false,

        jsonPath : false,
        jsonSuccess : false,

        dragBeforeAnimFinish : true,
        mouseDrag : true,
        touchDrag : true,

        addClassActive : false,
        transitionStyle : false,

        beforeUpdate : false,
        afterUpdate : false,
        beforeInit : false,
        afterInit : false,
        beforeMove : false,
        afterMove : false,
        afterAction : false,
        startDragging : false,
        afterLazyLoad: false
    };
}(jQuery, window, document));

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _owl = require("../../node_modules/owlcarousel/owl-carousel/owl.carousel");

var _owl2 = _interopRequireDefault(_owl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initCarousel() {
    $("#partners-carousel").owlCarousel();
}

exports.default = initCarousel;

},{"../../node_modules/owlcarousel/owl-carousel/owl.carousel":1}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _carousel = require("./_carousel");

var _carousel2 = _interopRequireDefault(_carousel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
    function App() {
        _classCallCheck(this, App);

        this._initElements();
        this.scrollDuration = 3000;

        this.findSectionPositions();
        this._initHeader();
        this._initMainMenu();
        this._initScrollNav();
    }

    _createClass(App, [{
        key: "_initElements",
        value: function _initElements() {
            this.$header = $(".page_header");
            this.headerHeight = this.$header.outerHeight();
            this.headerDefaultPos = this.$header.offset().top;

            this.$mainMenu = $(".main_menu");
            this.$mainMenuLink = this.$mainMenu.find(".main_menu__link");
            this.$mainMenuTrigger = this.$mainMenu.find(".trigger");
            this.$mainMenuActiveMarker = this.$mainMenu.find(".main_menu__marker");

            this.$sections = $(".section");
        }
    }, {
        key: "_initHeader",
        value: function _initHeader() {
            var _this = this;

            var headerFixed = false;
            $(window).scroll(function () {
                if ($(window).scrollTop() >= _this.headerDefaultPos) {
                    if (!headerFixed) {
                        _this.$header.addClass("fixed");
                        headerFixed = true;
                    }
                } else {
                    if (headerFixed) {
                        _this.$header.removeClass("fixed");
                        headerFixed = false;
                    }
                }
            });
        }
    }, {
        key: "_initMainMenu",
        value: function _initMainMenu() {
            var _this2 = this;

            var self = this;
            this.$mainMenuTrigger.on("click", function (e) {
                e.stopPropagation();
                _this2.$mainMenu.toggleClass("open");
            });
            this.$mainMenuLink.on("click", function () {
                var sectionID = $(this).attr("href").replace("#", "");
                self.scroll2Section(sectionID);
                self.setActiveMenuItem(sectionID);
                self.menuClicked = true;
                setTimeout(function () {
                    return self.menuClicked = false;
                }, 500);
            });
            $("body").on("click", function () {
                return _this2.$mainMenu.removeClass("open");
            });
        }
    }, {
        key: "findSectionPositions",
        value: function findSectionPositions() {
            var self = this;
            this.sectionPositions = {};
            this.sectionBreakPoints = [];
            this.$sections.each(function () {
                var sectionID = $(this).attr("id").replace("section_", ""),
                    bp = $(this).offset().top - self.headerHeight;
                self.sectionPositions[sectionID] = bp;
                self.sectionBreakPoints.push(bp);
            });
            self.sectionBreakPoints.sort(function (a, b) {
                return a - b;
            });
        }
    }, {
        key: "_initScrollNav",
        value: function _initScrollNav() {
            var _this3 = this;

            this.findSectionPositions();
            this.currentSection = '';
            this.menuClicked = false;
            var fp = $(window).height() / 4,
                newSection = '';
            $(window).scroll(function () {
                if (!_this3.menuClicked) {
                    (function () {
                        var _Math;

                        var scrollPosition = $(window).scrollTop();
                        var bp = (_Math = Math).max.apply(_Math, _toConsumableArray(_this3.sectionBreakPoints.filter(function (v) {
                            return v <= scrollPosition + fp;
                        })));
                        for (var s in _this3.sectionPositions) {
                            if (_this3.sectionPositions.hasOwnProperty(s)) {
                                if (_this3.sectionPositions[s] == bp) {
                                    newSection = s;
                                    break;
                                }
                            }
                        }
                        if (newSection != _this3.currentSection) {
                            _this3.setActiveMenuItem(newSection);
                            _this3.currentSection = newSection;
                        }
                    })();
                }
            });
            $(window).resize(function () {
                return _this3.findSectionPositions();
            });
        }
    }, {
        key: "scroll2Section",
        value: function scroll2Section(sectionID) {
            $("html,body").animate({
                scrollTop: this.sectionPositions[sectionID],
                duration: this.scrollDuration
            });
        }
    }, {
        key: "setActiveMenuItem",
        value: function setActiveMenuItem(sectionID) {
            var $menuItem = this.$mainMenuLink.filter("[href=\"#" + sectionID + "\"]");
            if ($menuItem.length > 0) {
                var menuItemWidth = $menuItem.width(),
                    menuItemLeft = $menuItem.offset().left - this.$mainMenu.offset().left;
                this.$mainMenuLink.removeClass("active");
                $menuItem.addClass("active");
                this.$mainMenuActiveMarker.removeClass("outside").css({
                    left: menuItemLeft,
                    width: menuItemWidth
                });
            } else {
                this.$mainMenuActiveMarker.addClass("outside");
            }
        }
    }]);

    return App;
}();

$(function () {
    new App();
    (0, _carousel2.default)();
});

},{"./_carousel":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvb3dsY2Fyb3VzZWwvb3dsLWNhcm91c2VsL293bC5jYXJvdXNlbC5qcyIsInNyYy9zY3JpcHRzL19jYXJvdXNlbC5qcyIsInNyYy9zY3JpcHRzL3NjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUMxK0NBLFNBQVMsWUFBVCxHQUF3QjtBQUNwQixNQUFFLG9CQUFGLEVBQXdCLFdBQXhCLEdBRG9CO0NBQXhCOztrQkFLZTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNMVDtBQUNGLGFBREUsR0FDRixHQUFjOzhCQURaLEtBQ1k7O0FBQ1YsYUFBSyxhQUFMLEdBRFU7QUFFVixhQUFLLGNBQUwsR0FBc0IsSUFBdEIsQ0FGVTs7QUFJVixhQUFLLG9CQUFMLEdBSlU7QUFLVixhQUFLLFdBQUwsR0FMVTtBQU1WLGFBQUssYUFBTCxHQU5VO0FBT1YsYUFBSyxjQUFMLEdBUFU7S0FBZDs7aUJBREU7O3dDQVdjO0FBQ1osaUJBQUssT0FBTCxHQUFlLEVBQUUsY0FBRixDQUFmLENBRFk7QUFFWixpQkFBSyxZQUFMLEdBQW9CLEtBQUssT0FBTCxDQUFhLFdBQWIsRUFBcEIsQ0FGWTtBQUdaLGlCQUFLLGdCQUFMLEdBQXdCLEtBQUssT0FBTCxDQUFhLE1BQWIsR0FBc0IsR0FBdEIsQ0FIWjs7QUFLWixpQkFBSyxTQUFMLEdBQWlCLEVBQUUsWUFBRixDQUFqQixDQUxZO0FBTVosaUJBQUssYUFBTCxHQUFxQixLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLGtCQUFwQixDQUFyQixDQU5ZO0FBT1osaUJBQUssZ0JBQUwsR0FBd0IsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixVQUFwQixDQUF4QixDQVBZO0FBUVosaUJBQUsscUJBQUwsR0FBNkIsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixvQkFBcEIsQ0FBN0IsQ0FSWTs7QUFVWixpQkFBSyxTQUFMLEdBQWlCLEVBQUUsVUFBRixDQUFqQixDQVZZOzs7O3NDQWFGOzs7QUFDVixnQkFBSSxjQUFjLEtBQWQsQ0FETTtBQUVWLGNBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsWUFBTTtBQUNuQixvQkFBRyxFQUFFLE1BQUYsRUFBVSxTQUFWLE1BQXlCLE1BQUssZ0JBQUwsRUFBdUI7QUFDL0Msd0JBQUcsQ0FBQyxXQUFELEVBQWE7QUFDWiw4QkFBSyxPQUFMLENBQWEsUUFBYixDQUFzQixPQUF0QixFQURZO0FBRVosc0NBQWMsSUFBZCxDQUZZO3FCQUFoQjtpQkFESixNQUtPO0FBQ0gsd0JBQUcsV0FBSCxFQUFlO0FBQ1gsOEJBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsT0FBekIsRUFEVztBQUVYLHNDQUFjLEtBQWQsQ0FGVztxQkFBZjtpQkFOSjthQURhLENBQWpCLENBRlU7Ozs7d0NBaUJFOzs7QUFDWixnQkFBSSxPQUFPLElBQVAsQ0FEUTtBQUVaLGlCQUFLLGdCQUFMLENBQXNCLEVBQXRCLENBQXlCLE9BQXpCLEVBQWtDLGFBQUs7QUFDbkMsa0JBQUUsZUFBRixHQURtQztBQUVuQyx1QkFBSyxTQUFMLENBQWUsV0FBZixDQUEyQixNQUEzQixFQUZtQzthQUFMLENBQWxDLENBRlk7QUFNWixpQkFBSyxhQUFMLENBQW1CLEVBQW5CLENBQXNCLE9BQXRCLEVBQStCLFlBQVU7QUFDckMsb0JBQUksWUFBWSxFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsTUFBYixFQUFxQixPQUFyQixDQUE2QixHQUE3QixFQUFrQyxFQUFsQyxDQUFaLENBRGlDO0FBRXJDLHFCQUFLLGNBQUwsQ0FBb0IsU0FBcEIsRUFGcUM7QUFHckMscUJBQUssaUJBQUwsQ0FBdUIsU0FBdkIsRUFIcUM7QUFJckMscUJBQUssV0FBTCxHQUFtQixJQUFuQixDQUpxQztBQUtyQywyQkFBVzsyQkFBTSxLQUFLLFdBQUwsR0FBbUIsS0FBbkI7aUJBQU4sRUFBZ0MsR0FBM0MsRUFMcUM7YUFBVixDQUEvQixDQU5ZO0FBYVosY0FBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0I7dUJBQU0sT0FBSyxTQUFMLENBQWUsV0FBZixDQUEyQixNQUEzQjthQUFOLENBQXRCLENBYlk7Ozs7K0NBZ0JPO0FBQ25CLGdCQUFJLE9BQU8sSUFBUCxDQURlO0FBRW5CLGlCQUFLLGdCQUFMLEdBQXdCLEVBQXhCLENBRm1CO0FBR25CLGlCQUFLLGtCQUFMLEdBQTBCLEVBQTFCLENBSG1CO0FBSW5CLGlCQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLFlBQVU7QUFDMUIsb0JBQUksWUFBWSxFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsSUFBYixFQUFtQixPQUFuQixDQUEyQixVQUEzQixFQUF1QyxFQUF2QyxDQUFaO29CQUNBLEtBQUssRUFBRSxJQUFGLEVBQVEsTUFBUixHQUFpQixHQUFqQixHQUF1QixLQUFLLFlBQUwsQ0FGTjtBQUcxQixxQkFBSyxnQkFBTCxDQUFzQixTQUF0QixJQUFtQyxFQUFuQyxDQUgwQjtBQUkxQixxQkFBSyxrQkFBTCxDQUF3QixJQUF4QixDQUE2QixFQUE3QixFQUowQjthQUFWLENBQXBCLENBSm1CO0FBVW5CLGlCQUFLLGtCQUFMLENBQXdCLElBQXhCLENBQTZCLFVBQUMsQ0FBRCxFQUFJLENBQUo7dUJBQVUsSUFBSSxDQUFKO2FBQVYsQ0FBN0IsQ0FWbUI7Ozs7eUNBYU47OztBQUNiLGlCQUFLLG9CQUFMLEdBRGE7QUFFYixpQkFBSyxjQUFMLEdBQXNCLEVBQXRCLENBRmE7QUFHYixpQkFBSyxXQUFMLEdBQW1CLEtBQW5CLENBSGE7QUFJYixnQkFBSSxLQUFLLEVBQUUsTUFBRixFQUFVLE1BQVYsS0FBcUIsQ0FBckI7Z0JBQ0wsYUFBYSxFQUFiLENBTFM7QUFNYixjQUFFLE1BQUYsRUFBVSxNQUFWLENBQWlCLFlBQU07QUFDbkIsb0JBQUksQ0FBQyxPQUFLLFdBQUwsRUFBa0I7Ozs7QUFDbkIsNEJBQUksaUJBQWlCLEVBQUUsTUFBRixFQUFVLFNBQVYsRUFBakI7QUFDSiw0QkFBSSxLQUFLLGVBQUssR0FBTCxpQ0FBWSxPQUFLLGtCQUFMLENBQXdCLE1BQXhCLENBQStCO21DQUFLLEtBQUssaUJBQWlCLEVBQWpCO3lCQUFWLEVBQTNDLENBQUw7QUFDSiw2QkFBSyxJQUFJLENBQUosSUFBUyxPQUFLLGdCQUFMLEVBQXVCO0FBQ2pDLGdDQUFHLE9BQUssZ0JBQUwsQ0FBc0IsY0FBdEIsQ0FBcUMsQ0FBckMsQ0FBSCxFQUE0QztBQUN4QyxvQ0FBSSxPQUFLLGdCQUFMLENBQXNCLENBQXRCLEtBQTRCLEVBQTVCLEVBQWdDO0FBQ2hDLGlEQUFhLENBQWIsQ0FEZ0M7QUFFaEMsMENBRmdDO2lDQUFwQzs2QkFESjt5QkFESjtBQVFBLDRCQUFJLGNBQWMsT0FBSyxjQUFMLEVBQXFCO0FBQ25DLG1DQUFLLGlCQUFMLENBQXVCLFVBQXZCLEVBRG1DO0FBRW5DLG1DQUFLLGNBQUwsR0FBc0IsVUFBdEIsQ0FGbUM7eUJBQXZDO3lCQVhtQjtpQkFBdkI7YUFEYSxDQUFqQixDQU5hO0FBd0JiLGNBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUI7dUJBQU0sT0FBSyxvQkFBTDthQUFOLENBQWpCLENBeEJhOzs7O3VDQTJCRixXQUFXO0FBQ3RCLGNBQUUsV0FBRixFQUFlLE9BQWYsQ0FBdUI7QUFDbkIsMkJBQVcsS0FBSyxnQkFBTCxDQUFzQixTQUF0QixDQUFYO0FBQ0EsMEJBQVUsS0FBSyxjQUFMO2FBRmQsRUFEc0I7Ozs7MENBT1IsV0FBVztBQUN6QixnQkFBSSxZQUFZLEtBQUssYUFBTCxDQUFtQixNQUFuQixlQUFxQyxpQkFBckMsQ0FBWixDQURxQjtBQUV6QixnQkFBRyxVQUFVLE1BQVYsR0FBbUIsQ0FBbkIsRUFBc0I7QUFDckIsb0JBQUksZ0JBQWdCLFVBQVUsS0FBVixFQUFoQjtvQkFDQSxlQUFlLFVBQVUsTUFBVixHQUFtQixJQUFuQixHQUEwQixLQUFLLFNBQUwsQ0FBZSxNQUFmLEdBQXdCLElBQXhCLENBRnhCO0FBR3JCLHFCQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FBK0IsUUFBL0IsRUFIcUI7QUFJckIsMEJBQVUsUUFBVixDQUFtQixRQUFuQixFQUpxQjtBQUtyQixxQkFBSyxxQkFBTCxDQUNLLFdBREwsQ0FDaUIsU0FEakIsRUFFSyxHQUZMLENBRVM7QUFDRCwwQkFBTSxZQUFOO0FBQ0EsMkJBQU8sYUFBUDtpQkFKUixFQUxxQjthQUF6QixNQVdPO0FBQ0gscUJBQUsscUJBQUwsQ0FBMkIsUUFBM0IsQ0FBb0MsU0FBcEMsRUFERzthQVhQOzs7O1dBMUdGOzs7QUE0SE4sRUFBRSxZQUFVO0FBQ1IsUUFBSSxHQUFKLEdBRFE7QUFFUiw4QkFGUTtDQUFWLENBQUYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqICBqUXVlcnkgT3dsQ2Fyb3VzZWwgdjEuMy4zXG4gKlxuICogIENvcHlyaWdodCAoYykgMjAxMyBCYXJ0b3N6IFdvamNpZWNob3dza2lcbiAqICBodHRwOi8vd3d3Lm93bGdyYXBoaWMuY29tL293bGNhcm91c2VsL1xuICpcbiAqICBMaWNlbnNlZCB1bmRlciBNSVRcbiAqXG4gKi9cblxuLypKUyBMaW50IGhlbHBlcnM6ICovXG4vKmdsb2JhbCBkcmFnTW92ZTogZmFsc2UsIGRyYWdFbmQ6IGZhbHNlLCAkLCBqUXVlcnksIGFsZXJ0LCB3aW5kb3csIGRvY3VtZW50ICovXG4vKmpzbGludCBub21lbjogdHJ1ZSwgY29udGludWU6dHJ1ZSAqL1xuXG5pZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgIT09IFwiZnVuY3Rpb25cIikge1xuICAgIE9iamVjdC5jcmVhdGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGZ1bmN0aW9uIEYoKSB7fVxuICAgICAgICBGLnByb3RvdHlwZSA9IG9iajtcbiAgICAgICAgcmV0dXJuIG5ldyBGKCk7XG4gICAgfTtcbn1cbihmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCkge1xuXG4gICAgdmFyIENhcm91c2VsID0ge1xuICAgICAgICBpbml0IDogZnVuY3Rpb24gKG9wdGlvbnMsIGVsKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UuJGVsZW0gPSAkKGVsKTtcbiAgICAgICAgICAgIGJhc2Uub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkLmZuLm93bENhcm91c2VsLm9wdGlvbnMsIGJhc2UuJGVsZW0uZGF0YSgpLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgYmFzZS51c2VyT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICBiYXNlLmxvYWRDb250ZW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZENvbnRlbnQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsIHVybDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RGF0YShkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGksIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmpzb25TdWNjZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmpzb25TdWNjZXNzLmFwcGx5KHRoaXMsIFtkYXRhXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpIGluIGRhdGEub3dsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5vd2wuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50ICs9IGRhdGEub3dsW2ldLml0ZW07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5odG1sKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiYXNlLmxvZ0luKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmJlZm9yZUluaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5iZWZvcmVJbml0LmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmpzb25QYXRoID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gYmFzZS5vcHRpb25zLmpzb25QYXRoO1xuICAgICAgICAgICAgICAgICQuZ2V0SlNPTih1cmwsIGdldERhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLmxvZ0luKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9nSW4gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UuJGVsZW0uZGF0YSh7XG4gICAgICAgICAgICAgICAgXCJvd2wtb3JpZ2luYWxTdHlsZXNcIjogYmFzZS4kZWxlbS5hdHRyKFwic3R5bGVcIiksXG4gICAgICAgICAgICAgICAgXCJvd2wtb3JpZ2luYWxDbGFzc2VzXCI6IGJhc2UuJGVsZW0uYXR0cihcImNsYXNzXCIpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYmFzZS4kZWxlbS5jc3Moe29wYWNpdHk6IDB9KTtcbiAgICAgICAgICAgIGJhc2Uub3JpZ25hbEl0ZW1zID0gYmFzZS5vcHRpb25zLml0ZW1zO1xuICAgICAgICAgICAgYmFzZS5jaGVja0Jyb3dzZXIoKTtcbiAgICAgICAgICAgIGJhc2Uud3JhcHBlcldpZHRoID0gMDtcbiAgICAgICAgICAgIGJhc2UuY2hlY2tWaXNpYmxlID0gbnVsbDtcbiAgICAgICAgICAgIGJhc2Uuc2V0VmFycygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFZhcnMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5jaGlsZHJlbigpLmxlbmd0aCA9PT0gMCkge3JldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgYmFzZS5iYXNlQ2xhc3MoKTtcbiAgICAgICAgICAgIGJhc2UuZXZlbnRUeXBlcygpO1xuICAgICAgICAgICAgYmFzZS4kdXNlckl0ZW1zID0gYmFzZS4kZWxlbS5jaGlsZHJlbigpO1xuICAgICAgICAgICAgYmFzZS5pdGVtc0Ftb3VudCA9IGJhc2UuJHVzZXJJdGVtcy5sZW5ndGg7XG4gICAgICAgICAgICBiYXNlLndyYXBJdGVtcygpO1xuICAgICAgICAgICAgYmFzZS4kb3dsSXRlbXMgPSBiYXNlLiRlbGVtLmZpbmQoXCIub3dsLWl0ZW1cIik7XG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyID0gYmFzZS4kZWxlbS5maW5kKFwiLm93bC13cmFwcGVyXCIpO1xuICAgICAgICAgICAgYmFzZS5wbGF5RGlyZWN0aW9uID0gXCJuZXh0XCI7XG4gICAgICAgICAgICBiYXNlLnByZXZJdGVtID0gMDtcbiAgICAgICAgICAgIGJhc2UucHJldkFyciA9IFswXTtcbiAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAwO1xuICAgICAgICAgICAgYmFzZS5jdXN0b21FdmVudHMoKTtcbiAgICAgICAgICAgIGJhc2Uub25TdGFydHVwKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TdGFydHVwIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS51cGRhdGVJdGVtcygpO1xuICAgICAgICAgICAgYmFzZS5jYWxjdWxhdGVBbGwoKTtcbiAgICAgICAgICAgIGJhc2UuYnVpbGRDb250cm9scygpO1xuICAgICAgICAgICAgYmFzZS51cGRhdGVDb250cm9scygpO1xuICAgICAgICAgICAgYmFzZS5yZXNwb25zZSgpO1xuICAgICAgICAgICAgYmFzZS5tb3ZlRXZlbnRzKCk7XG4gICAgICAgICAgICBiYXNlLnN0b3BPbkhvdmVyKCk7XG4gICAgICAgICAgICBiYXNlLm93bFN0YXR1cygpO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnRyYW5zaXRpb25TdHlsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnRyYW5zaXRpb25UeXBlcyhiYXNlLm9wdGlvbnMudHJhbnNpdGlvblN0eWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYXV0b1BsYXkgPSA1MDAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5wbGF5KCk7XG5cbiAgICAgICAgICAgIGJhc2UuJGVsZW0uZmluZChcIi5vd2wtd3JhcHBlclwiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG5cbiAgICAgICAgICAgIGlmICghYmFzZS4kZWxlbS5pcyhcIjp2aXNpYmxlXCIpKSB7XG4gICAgICAgICAgICAgICAgYmFzZS53YXRjaFZpc2liaWxpdHkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5jc3MoXCJvcGFjaXR5XCIsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5vbnN0YXJ0dXAgPSBmYWxzZTtcbiAgICAgICAgICAgIGJhc2UuZWFjaE1vdmVVcGRhdGUoKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmFmdGVySW5pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmFmdGVySW5pdC5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGVhY2hNb3ZlVXBkYXRlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmxhenlMb2FkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5sYXp5TG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hdXRvSGVpZ2h0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5hdXRvSGVpZ2h0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLm9uVmlzaWJsZUl0ZW1zKCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmFmdGVyQWN0aW9uID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYWZ0ZXJBY3Rpb24uYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVWYXJzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYmVmb3JlVXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYmVmb3JlVXBkYXRlLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLndhdGNoVmlzaWJpbGl0eSgpO1xuICAgICAgICAgICAgYmFzZS51cGRhdGVJdGVtcygpO1xuICAgICAgICAgICAgYmFzZS5jYWxjdWxhdGVBbGwoKTtcbiAgICAgICAgICAgIGJhc2UudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGJhc2UudXBkYXRlQ29udHJvbHMoKTtcbiAgICAgICAgICAgIGJhc2UuZWFjaE1vdmVVcGRhdGUoKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmFmdGVyVXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYWZ0ZXJVcGRhdGUuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZWxvYWQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFzZS51cGRhdGVWYXJzKCk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICB3YXRjaFZpc2liaWxpdHkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLiRlbGVtLmlzKFwiOnZpc2libGVcIikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5jc3Moe29wYWNpdHk6IDB9KTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmF1dG9QbGF5SW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuY2hlY2tWaXNpYmxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5jaGVja1Zpc2libGUgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLiRlbGVtLmlzKFwiOnZpc2libGVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5hbmltYXRlKHtvcGFjaXR5OiAxfSwgMjAwKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5jaGVja1Zpc2libGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd3JhcEl0ZW1zIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS4kdXNlckl0ZW1zLndyYXBBbGwoXCI8ZGl2IGNsYXNzPVxcXCJvd2wtd3JhcHBlclxcXCI+XCIpLndyYXAoXCI8ZGl2IGNsYXNzPVxcXCJvd2wtaXRlbVxcXCI+PC9kaXY+XCIpO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5maW5kKFwiLm93bC13cmFwcGVyXCIpLndyYXAoXCI8ZGl2IGNsYXNzPVxcXCJvd2wtd3JhcHBlci1vdXRlclxcXCI+XCIpO1xuICAgICAgICAgICAgYmFzZS53cmFwcGVyT3V0ZXIgPSBiYXNlLiRlbGVtLmZpbmQoXCIub3dsLXdyYXBwZXItb3V0ZXJcIik7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBiYXNlQ2xhc3MgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaGFzQmFzZUNsYXNzID0gYmFzZS4kZWxlbS5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYmFzZUNsYXNzKSxcbiAgICAgICAgICAgICAgICBoYXNUaGVtZUNsYXNzID0gYmFzZS4kZWxlbS5oYXNDbGFzcyhiYXNlLm9wdGlvbnMudGhlbWUpO1xuXG4gICAgICAgICAgICBpZiAoIWhhc0Jhc2VDbGFzcykge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmJhc2VDbGFzcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaGFzVGhlbWVDbGFzcykge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uYWRkQ2xhc3MoYmFzZS5vcHRpb25zLnRoZW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVJdGVtcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcywgd2lkdGgsIGk7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucmVzcG9uc2l2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnNpbmdsZUl0ZW0gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9yaWduYWxJdGVtcyA9IDE7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zQ3VzdG9tID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3BTbWFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFNtYWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zTW9iaWxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aWR0aCA9ICQoYmFzZS5vcHRpb25zLnJlc3BvbnNpdmVCYXNlV2lkdGgpLndpZHRoKCk7XG5cbiAgICAgICAgICAgIGlmICh3aWR0aCA+IChiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wWzBdIHx8IGJhc2Uub3JpZ25hbEl0ZW1zKSkge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3JpZ25hbEl0ZW1zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5pdGVtc0N1c3RvbSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAvL1Jlb3JkZXIgYXJyYXkgYnkgc2NyZWVuIHNpemVcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNDdXN0b20uc29ydChmdW5jdGlvbiAoYSwgYikge3JldHVybiBhWzBdIC0gYlswXTsgfSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYmFzZS5vcHRpb25zLml0ZW1zQ3VzdG9tLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuaXRlbXNDdXN0b21baV1bMF0gPD0gd2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtc0N1c3RvbVtpXVsxXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA8PSBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wWzBdICYmIGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3AgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3BbMV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDw9IGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3BTbWFsbFswXSAmJiBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wU21hbGwgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3BTbWFsbFsxXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPD0gYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0WzBdICYmIGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0WzFdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA8PSBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXRTbWFsbFswXSAmJiBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXRTbWFsbCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0U21hbGxbMV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDw9IGJhc2Uub3B0aW9ucy5pdGVtc01vYmlsZVswXSAmJiBiYXNlLm9wdGlvbnMuaXRlbXNNb2JpbGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtc01vYmlsZVsxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vaWYgbnVtYmVyIG9mIGl0ZW1zIGlzIGxlc3MgdGhhbiBkZWNsYXJlZFxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5pdGVtcyA+IGJhc2UuaXRlbXNBbW91bnQgJiYgYmFzZS5vcHRpb25zLml0ZW1zU2NhbGVVcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2UuaXRlbXNBbW91bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzcG9uc2UgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc21hbGxEZWxheSxcbiAgICAgICAgICAgICAgICBsYXN0V2luZG93V2lkdGg7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucmVzcG9uc2l2ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3RXaW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuXG4gICAgICAgICAgICBiYXNlLnJlc2l6ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQod2luZG93KS53aWR0aCgpICE9PSBsYXN0V2luZG93V2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hdXRvUGxheSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuYXV0b1BsYXlJbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChzbWFsbERlbGF5KTtcbiAgICAgICAgICAgICAgICAgICAgc21hbGxEZWxheSA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RXaW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS51cGRhdGVWYXJzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGJhc2Uub3B0aW9ucy5yZXNwb25zaXZlUmVmcmVzaFJhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkKHdpbmRvdykucmVzaXplKGJhc2UucmVzaXplcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlUG9zaXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLmp1bXBUbyhiYXNlLmN1cnJlbnRJdGVtKTtcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5jaGVja0FwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kSXRlbXNTaXplcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICByb3VuZFBhZ2VzID0gMCxcbiAgICAgICAgICAgICAgICBsYXN0SXRlbSA9IGJhc2UuaXRlbXNBbW91bnQgLSBiYXNlLm9wdGlvbnMuaXRlbXM7XG5cbiAgICAgICAgICAgIGJhc2UuJG93bEl0ZW1zLmVhY2goZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICAkdGhpc1xuICAgICAgICAgICAgICAgICAgICAuY3NzKHtcIndpZHRoXCI6IGJhc2UuaXRlbVdpZHRofSlcbiAgICAgICAgICAgICAgICAgICAgLmRhdGEoXCJvd2wtaXRlbVwiLCBOdW1iZXIoaW5kZXgpKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAlIGJhc2Uub3B0aW9ucy5pdGVtcyA9PT0gMCB8fCBpbmRleCA9PT0gbGFzdEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoaW5kZXggPiBsYXN0SXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdW5kUGFnZXMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKFwib3dsLXJvdW5kUGFnZXNcIiwgcm91bmRQYWdlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmRXcmFwcGVyU2l6ZXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgd2lkdGggPSBiYXNlLiRvd2xJdGVtcy5sZW5ndGggKiBiYXNlLml0ZW1XaWR0aDtcblxuICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5jc3Moe1xuICAgICAgICAgICAgICAgIFwid2lkdGhcIjogd2lkdGggKiAyLFxuICAgICAgICAgICAgICAgIFwibGVmdFwiOiAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuYXBwZW5kSXRlbXNTaXplcygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGN1bGF0ZUFsbCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuY2FsY3VsYXRlV2lkdGgoKTtcbiAgICAgICAgICAgIGJhc2UuYXBwZW5kV3JhcHBlclNpemVzKCk7XG4gICAgICAgICAgICBiYXNlLmxvb3BzKCk7XG4gICAgICAgICAgICBiYXNlLm1heCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGN1bGF0ZVdpZHRoIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5pdGVtV2lkdGggPSBNYXRoLnJvdW5kKGJhc2UuJGVsZW0ud2lkdGgoKSAvIGJhc2Uub3B0aW9ucy5pdGVtcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWF4IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG1heGltdW0gPSAoKGJhc2UuaXRlbXNBbW91bnQgKiBiYXNlLml0ZW1XaWR0aCkgLSBiYXNlLm9wdGlvbnMuaXRlbXMgKiBiYXNlLml0ZW1XaWR0aCkgKiAtMTtcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuaXRlbXMgPiBiYXNlLml0ZW1zQW1vdW50KSB7XG4gICAgICAgICAgICAgICAgYmFzZS5tYXhpbXVtSXRlbSA9IDA7XG4gICAgICAgICAgICAgICAgbWF4aW11bSA9IDA7XG4gICAgICAgICAgICAgICAgYmFzZS5tYXhpbXVtUGl4ZWxzID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5tYXhpbXVtSXRlbSA9IGJhc2UuaXRlbXNBbW91bnQgLSBiYXNlLm9wdGlvbnMuaXRlbXM7XG4gICAgICAgICAgICAgICAgYmFzZS5tYXhpbXVtUGl4ZWxzID0gbWF4aW11bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXhpbXVtO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1pbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvb3BzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHByZXYgPSAwLFxuICAgICAgICAgICAgICAgIGVsV2lkdGggPSAwLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgICAgICByb3VuZFBhZ2VOdW07XG5cbiAgICAgICAgICAgIGJhc2UucG9zaXRpb25zSW5BcnJheSA9IFswXTtcbiAgICAgICAgICAgIGJhc2UucGFnZXNJbkFycmF5ID0gW107XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBiYXNlLml0ZW1zQW1vdW50OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBlbFdpZHRoICs9IGJhc2UuaXRlbVdpZHRoO1xuICAgICAgICAgICAgICAgIGJhc2UucG9zaXRpb25zSW5BcnJheS5wdXNoKC1lbFdpZHRoKTtcblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtID0gJChiYXNlLiRvd2xJdGVtc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHJvdW5kUGFnZU51bSA9IGl0ZW0uZGF0YShcIm93bC1yb3VuZFBhZ2VzXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm91bmRQYWdlTnVtICE9PSBwcmV2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLnBhZ2VzSW5BcnJheVtwcmV2XSA9IGJhc2UucG9zaXRpb25zSW5BcnJheVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYgPSByb3VuZFBhZ2VOdW07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRDb250cm9scyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubmF2aWdhdGlvbiA9PT0gdHJ1ZSB8fCBiYXNlLm9wdGlvbnMucGFnaW5hdGlvbiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2Uub3dsQ29udHJvbHMgPSAkKFwiPGRpdiBjbGFzcz1cXFwib3dsLWNvbnRyb2xzXFxcIi8+XCIpLnRvZ2dsZUNsYXNzKFwiY2xpY2thYmxlXCIsICFiYXNlLmJyb3dzZXIuaXNUb3VjaCkuYXBwZW5kVG8oYmFzZS4kZWxlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnBhZ2luYXRpb24gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLmJ1aWxkUGFnaW5hdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5uYXZpZ2F0aW9uID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5idWlsZEJ1dHRvbnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZEJ1dHRvbnMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYnV0dG9uc1dyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz1cXFwib3dsLWJ1dHRvbnNcXFwiLz5cIik7XG4gICAgICAgICAgICBiYXNlLm93bENvbnRyb2xzLmFwcGVuZChidXR0b25zV3JhcHBlcik7XG5cbiAgICAgICAgICAgIGJhc2UuYnV0dG9uUHJldiA9ICQoXCI8ZGl2Lz5cIiwge1xuICAgICAgICAgICAgICAgIFwiY2xhc3NcIiA6IFwib3dsLXByZXZcIixcbiAgICAgICAgICAgICAgICBcImh0bWxcIiA6IGJhc2Uub3B0aW9ucy5uYXZpZ2F0aW9uVGV4dFswXSB8fCBcIlwiXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYmFzZS5idXR0b25OZXh0ID0gJChcIjxkaXYvPlwiLCB7XG4gICAgICAgICAgICAgICAgXCJjbGFzc1wiIDogXCJvd2wtbmV4dFwiLFxuICAgICAgICAgICAgICAgIFwiaHRtbFwiIDogYmFzZS5vcHRpb25zLm5hdmlnYXRpb25UZXh0WzFdIHx8IFwiXCJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBidXR0b25zV3JhcHBlclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoYmFzZS5idXR0b25QcmV2KVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoYmFzZS5idXR0b25OZXh0KTtcblxuICAgICAgICAgICAgYnV0dG9uc1dyYXBwZXIub24oXCJ0b3VjaHN0YXJ0Lm93bENvbnRyb2xzIG1vdXNlZG93bi5vd2xDb250cm9sc1wiLCBcImRpdltjbGFzc149XFxcIm93bFxcXCJdXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYnV0dG9uc1dyYXBwZXIub24oXCJ0b3VjaGVuZC5vd2xDb250cm9scyBtb3VzZXVwLm93bENvbnRyb2xzXCIsIFwiZGl2W2NsYXNzXj1cXFwib3dsXFxcIl1cIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcyhcIm93bC1uZXh0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UubmV4dCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UucHJldigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkUGFnaW5hdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgYmFzZS5wYWdpbmF0aW9uV3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJvd2wtcGFnaW5hdGlvblxcXCIvPlwiKTtcbiAgICAgICAgICAgIGJhc2Uub3dsQ29udHJvbHMuYXBwZW5kKGJhc2UucGFnaW5hdGlvbldyYXBwZXIpO1xuXG4gICAgICAgICAgICBiYXNlLnBhZ2luYXRpb25XcmFwcGVyLm9uKFwidG91Y2hlbmQub3dsQ29udHJvbHMgbW91c2V1cC5vd2xDb250cm9sc1wiLCBcIi5vd2wtcGFnZVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmIChOdW1iZXIoJCh0aGlzKS5kYXRhKFwib3dsLXBhZ2VcIikpICE9PSBiYXNlLmN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuZ29UbyhOdW1iZXIoJCh0aGlzKS5kYXRhKFwib3dsLXBhZ2VcIikpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVQYWdpbmF0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvdW50ZXIsXG4gICAgICAgICAgICAgICAgbGFzdFBhZ2UsXG4gICAgICAgICAgICAgICAgbGFzdEl0ZW0sXG4gICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uLFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b25Jbm5lcjtcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFzZS5wYWdpbmF0aW9uV3JhcHBlci5odG1sKFwiXCIpO1xuXG4gICAgICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgICAgIGxhc3RQYWdlID0gYmFzZS5pdGVtc0Ftb3VudCAtIGJhc2UuaXRlbXNBbW91bnQgJSBiYXNlLm9wdGlvbnMuaXRlbXM7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBiYXNlLml0ZW1zQW1vdW50OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSAlIGJhc2Uub3B0aW9ucy5pdGVtcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0UGFnZSA9PT0gaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEl0ZW0gPSBiYXNlLml0ZW1zQW1vdW50IC0gYmFzZS5vcHRpb25zLml0ZW1zO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b24gPSAkKFwiPGRpdi8+XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NcIiA6IFwib3dsLXBhZ2VcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbklubmVyID0gJChcIjxzcGFuPjwvc3Bhbj5cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0ZXh0XCI6IGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uTnVtYmVycyA9PT0gdHJ1ZSA/IGNvdW50ZXIgOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc1wiOiBiYXNlLm9wdGlvbnMucGFnaW5hdGlvbk51bWJlcnMgPT09IHRydWUgPyBcIm93bC1udW1iZXJzXCIgOiBcIlwiXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uLmFwcGVuZChwYWdpbmF0aW9uQnV0dG9uSW5uZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b24uZGF0YShcIm93bC1wYWdlXCIsIGxhc3RQYWdlID09PSBpID8gbGFzdEl0ZW0gOiBpKTtcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbi5kYXRhKFwib3dsLXJvdW5kUGFnZXNcIiwgY291bnRlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgYmFzZS5wYWdpbmF0aW9uV3JhcHBlci5hcHBlbmQocGFnaW5hdGlvbkJ1dHRvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5jaGVja1BhZ2luYXRpb24oKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2hlY2tQYWdpbmF0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXIuZmluZChcIi5vd2wtcGFnZVwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoJCh0aGlzKS5kYXRhKFwib3dsLXJvdW5kUGFnZXNcIikgPT09ICQoYmFzZS4kb3dsSXRlbXNbYmFzZS5jdXJyZW50SXRlbV0pLmRhdGEoXCJvd2wtcm91bmRQYWdlc1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnBhZ2luYXRpb25XcmFwcGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluZChcIi5vd2wtcGFnZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNoZWNrTmF2aWdhdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5uYXZpZ2F0aW9uID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucmV3aW5kTmF2ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLmN1cnJlbnRJdGVtID09PSAwICYmIGJhc2UubWF4aW11bUl0ZW0gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25QcmV2LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uTmV4dC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5jdXJyZW50SXRlbSA9PT0gMCAmJiBiYXNlLm1heGltdW1JdGVtICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uUHJldi5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvbk5leHQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UuY3VycmVudEl0ZW0gPT09IGJhc2UubWF4aW11bUl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25QcmV2LnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uTmV4dC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5jdXJyZW50SXRlbSAhPT0gMCAmJiBiYXNlLmN1cnJlbnRJdGVtICE9PSBiYXNlLm1heGltdW1JdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uUHJldi5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvbk5leHQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlQ29udHJvbHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZVBhZ2luYXRpb24oKTtcbiAgICAgICAgICAgIGJhc2UuY2hlY2tOYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICBpZiAoYmFzZS5vd2xDb250cm9scykge1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuaXRlbXMgPj0gYmFzZS5pdGVtc0Ftb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm93bENvbnRyb2xzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm93bENvbnRyb2xzLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVzdHJveUNvbnRyb2xzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3dsQ29udHJvbHMpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm93bENvbnRyb2xzLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG5leHQgOiBmdW5jdGlvbiAoc3BlZWQpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKGJhc2UuaXNUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtICs9IGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlID8gYmFzZS5vcHRpb25zLml0ZW1zIDogMTtcbiAgICAgICAgICAgIGlmIChiYXNlLmN1cnJlbnRJdGVtID4gYmFzZS5tYXhpbXVtSXRlbSArIChiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSA/IChiYXNlLm9wdGlvbnMuaXRlbXMgLSAxKSA6IDApKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5yZXdpbmROYXYgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHNwZWVkID0gXCJyZXdpbmRcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gYmFzZS5tYXhpbXVtSXRlbTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuZ29UbyhiYXNlLmN1cnJlbnRJdGVtLCBzcGVlZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJldiA6IGZ1bmN0aW9uIChzcGVlZCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5pc1RyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSAmJiBiYXNlLmN1cnJlbnRJdGVtID4gMCAmJiBiYXNlLmN1cnJlbnRJdGVtIDwgYmFzZS5vcHRpb25zLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gLT0gYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUgPyBiYXNlLm9wdGlvbnMuaXRlbXMgOiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2UuY3VycmVudEl0ZW0gPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5yZXdpbmROYXYgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICAgICAgICAgIHNwZWVkID0gXCJyZXdpbmRcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuZ29UbyhiYXNlLmN1cnJlbnRJdGVtLCBzcGVlZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ29UbyA6IGZ1bmN0aW9uIChwb3NpdGlvbiwgc3BlZWQsIGRyYWcpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBnb1RvUGl4ZWw7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLmlzVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmJlZm9yZU1vdmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5iZWZvcmVNb3ZlLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocG9zaXRpb24gPj0gYmFzZS5tYXhpbXVtSXRlbSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gYmFzZS5tYXhpbXVtSXRlbTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPD0gMCkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGJhc2Uub3dsLmN1cnJlbnRJdGVtID0gcG9zaXRpb247XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnRyYW5zaXRpb25TdHlsZSAhPT0gZmFsc2UgJiYgZHJhZyAhPT0gXCJkcmFnXCIgJiYgYmFzZS5vcHRpb25zLml0ZW1zID09PSAxICYmIGJhc2UuYnJvd3Nlci5zdXBwb3J0M2QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnN3YXBTcGVlZCgwKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5icm93c2VyLnN1cHBvcnQzZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnRyYW5zaXRpb24zZChiYXNlLnBvc2l0aW9uc0luQXJyYXlbcG9zaXRpb25dKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNzczJzbGlkZShiYXNlLnBvc2l0aW9uc0luQXJyYXlbcG9zaXRpb25dLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmFzZS5hZnRlckdvKCk7XG4gICAgICAgICAgICAgICAgYmFzZS5zaW5nbGVJdGVtVHJhbnNpdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdvVG9QaXhlbCA9IGJhc2UucG9zaXRpb25zSW5BcnJheVtwb3NpdGlvbl07XG5cbiAgICAgICAgICAgIGlmIChiYXNlLmJyb3dzZXIuc3VwcG9ydDNkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5pc0NzczNGaW5pc2ggPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChzcGVlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnN3YXBTcGVlZChcInBhZ2luYXRpb25TcGVlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5pc0NzczNGaW5pc2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9LCBiYXNlLm9wdGlvbnMucGFnaW5hdGlvblNwZWVkKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IFwicmV3aW5kXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5zd2FwU3BlZWQoYmFzZS5vcHRpb25zLnJld2luZFNwZWVkKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5pc0NzczNGaW5pc2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9LCBiYXNlLm9wdGlvbnMucmV3aW5kU3BlZWQpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5zd2FwU3BlZWQoXCJzbGlkZVNwZWVkXCIpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmlzQ3NzM0ZpbmlzaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0sIGJhc2Uub3B0aW9ucy5zbGlkZVNwZWVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmFzZS50cmFuc2l0aW9uM2QoZ29Ub1BpeGVsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3NzMnNsaWRlKGdvVG9QaXhlbCwgYmFzZS5vcHRpb25zLnBhZ2luYXRpb25TcGVlZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gXCJyZXdpbmRcIikge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNzczJzbGlkZShnb1RvUGl4ZWwsIGJhc2Uub3B0aW9ucy5yZXdpbmRTcGVlZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jc3Myc2xpZGUoZ29Ub1BpeGVsLCBiYXNlLm9wdGlvbnMuc2xpZGVTcGVlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5hZnRlckdvKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAganVtcFRvIDogZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5iZWZvcmVNb3ZlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYmVmb3JlTW92ZS5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uID49IGJhc2UubWF4aW11bUl0ZW0gfHwgcG9zaXRpb24gPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBiYXNlLm1heGltdW1JdGVtO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5zd2FwU3BlZWQoMCk7XG4gICAgICAgICAgICBpZiAoYmFzZS5icm93c2VyLnN1cHBvcnQzZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UudHJhbnNpdGlvbjNkKGJhc2UucG9zaXRpb25zSW5BcnJheVtwb3NpdGlvbl0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLmNzczJzbGlkZShiYXNlLnBvc2l0aW9uc0luQXJyYXlbcG9zaXRpb25dLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBiYXNlLm93bC5jdXJyZW50SXRlbSA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgYmFzZS5hZnRlckdvKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWZ0ZXJHbyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgYmFzZS5wcmV2QXJyLnB1c2goYmFzZS5jdXJyZW50SXRlbSk7XG4gICAgICAgICAgICBiYXNlLnByZXZJdGVtID0gYmFzZS5vd2wucHJldkl0ZW0gPSBiYXNlLnByZXZBcnJbYmFzZS5wcmV2QXJyLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgYmFzZS5wcmV2QXJyLnNoaWZ0KDApO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5wcmV2SXRlbSAhPT0gYmFzZS5jdXJyZW50SXRlbSkge1xuICAgICAgICAgICAgICAgIGJhc2UuY2hlY2tQYWdpbmF0aW9uKCk7XG4gICAgICAgICAgICAgICAgYmFzZS5jaGVja05hdmlnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBiYXNlLmVhY2hNb3ZlVXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9QbGF5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNoZWNrQXAoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5hZnRlck1vdmUgPT09IFwiZnVuY3Rpb25cIiAmJiBiYXNlLnByZXZJdGVtICE9PSBiYXNlLmN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmFmdGVyTW92ZS5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3AgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLmFwU3RhdHVzID0gXCJzdG9wXCI7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmF1dG9QbGF5SW50ZXJ2YWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNoZWNrQXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS5hcFN0YXR1cyAhPT0gXCJzdG9wXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnBsYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwbGF5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5hcFN0YXR1cyA9IFwicGxheVwiO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hdXRvUGxheSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmF1dG9QbGF5SW50ZXJ2YWwpO1xuICAgICAgICAgICAgYmFzZS5hdXRvUGxheUludGVydmFsID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm5leHQodHJ1ZSk7XG4gICAgICAgICAgICB9LCBiYXNlLm9wdGlvbnMuYXV0b1BsYXkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN3YXBTcGVlZCA6IGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09IFwic2xpZGVTcGVlZFwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5jc3MoYmFzZS5hZGRDc3NTcGVlZChiYXNlLm9wdGlvbnMuc2xpZGVTcGVlZCkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09IFwicGFnaW5hdGlvblNwZWVkXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmNzcyhiYXNlLmFkZENzc1NwZWVkKGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uU3BlZWQpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFjdGlvbiAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKGJhc2UuYWRkQ3NzU3BlZWQoYWN0aW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkQ3NzU3BlZWQgOiBmdW5jdGlvbiAoc3BlZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgXCItd2Via2l0LXRyYW5zaXRpb25cIjogXCJhbGwgXCIgKyBzcGVlZCArIFwibXMgZWFzZVwiLFxuICAgICAgICAgICAgICAgIFwiLW1vei10cmFuc2l0aW9uXCI6IFwiYWxsIFwiICsgc3BlZWQgKyBcIm1zIGVhc2VcIixcbiAgICAgICAgICAgICAgICBcIi1vLXRyYW5zaXRpb25cIjogXCJhbGwgXCIgKyBzcGVlZCArIFwibXMgZWFzZVwiLFxuICAgICAgICAgICAgICAgIFwidHJhbnNpdGlvblwiOiBcImFsbCBcIiArIHNwZWVkICsgXCJtcyBlYXNlXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlVHJhbnNpdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgXCItd2Via2l0LXRyYW5zaXRpb25cIjogXCJcIixcbiAgICAgICAgICAgICAgICBcIi1tb3otdHJhbnNpdGlvblwiOiBcIlwiLFxuICAgICAgICAgICAgICAgIFwiLW8tdHJhbnNpdGlvblwiOiBcIlwiLFxuICAgICAgICAgICAgICAgIFwidHJhbnNpdGlvblwiOiBcIlwiXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGRvVHJhbnNsYXRlIDogZnVuY3Rpb24gKHBpeGVscykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNmb3JtXCI6IFwidHJhbnNsYXRlM2QoXCIgKyBwaXhlbHMgKyBcInB4LCAwcHgsIDBweClcIixcbiAgICAgICAgICAgICAgICBcIi1tb3otdHJhbnNmb3JtXCI6IFwidHJhbnNsYXRlM2QoXCIgKyBwaXhlbHMgKyBcInB4LCAwcHgsIDBweClcIixcbiAgICAgICAgICAgICAgICBcIi1vLXRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZTNkKFwiICsgcGl4ZWxzICsgXCJweCwgMHB4LCAwcHgpXCIsXG4gICAgICAgICAgICAgICAgXCItbXMtdHJhbnNmb3JtXCI6IFwidHJhbnNsYXRlM2QoXCIgKyBwaXhlbHMgKyBcInB4LCAwcHgsIDBweClcIixcbiAgICAgICAgICAgICAgICBcInRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZTNkKFwiICsgcGl4ZWxzICsgXCJweCwgMHB4LDBweClcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB0cmFuc2l0aW9uM2QgOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKGJhc2UuZG9UcmFuc2xhdGUodmFsdWUpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjc3MybW92ZSA6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5jc3Moe1wibGVmdFwiIDogdmFsdWV9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjc3Myc2xpZGUgOiBmdW5jdGlvbiAodmFsdWUsIHNwZWVkKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UuaXNDc3NGaW5pc2ggPSBmYWxzZTtcbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuc3RvcCh0cnVlLCB0cnVlKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBcImxlZnRcIiA6IHZhbHVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gOiBzcGVlZCB8fCBiYXNlLm9wdGlvbnMuc2xpZGVTcGVlZCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5pc0Nzc0ZpbmlzaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hlY2tCcm93c2VyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZTNEID0gXCJ0cmFuc2xhdGUzZCgwcHgsIDBweCwgMHB4KVwiLFxuICAgICAgICAgICAgICAgIHRlbXBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICByZWdleCxcbiAgICAgICAgICAgICAgICBhc1N1cHBvcnQsXG4gICAgICAgICAgICAgICAgc3VwcG9ydDNkLFxuICAgICAgICAgICAgICAgIGlzVG91Y2g7XG5cbiAgICAgICAgICAgIHRlbXBFbGVtLnN0eWxlLmNzc1RleHQgPSBcIiAgLW1vei10cmFuc2Zvcm06XCIgKyB0cmFuc2xhdGUzRCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI7IC1tcy10cmFuc2Zvcm06XCIgICAgICsgdHJhbnNsYXRlM0QgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOyAtby10cmFuc2Zvcm06XCIgICAgICArIHRyYW5zbGF0ZTNEICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjsgLXdlYmtpdC10cmFuc2Zvcm06XCIgKyB0cmFuc2xhdGUzRCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI7IHRyYW5zZm9ybTpcIiAgICAgICAgICsgdHJhbnNsYXRlM0Q7XG4gICAgICAgICAgICByZWdleCA9IC90cmFuc2xhdGUzZFxcKDBweCwgMHB4LCAwcHhcXCkvZztcbiAgICAgICAgICAgIGFzU3VwcG9ydCA9IHRlbXBFbGVtLnN0eWxlLmNzc1RleHQubWF0Y2gocmVnZXgpO1xuICAgICAgICAgICAgc3VwcG9ydDNkID0gKGFzU3VwcG9ydCAhPT0gbnVsbCAmJiBhc1N1cHBvcnQubGVuZ3RoID09PSAxKTtcblxuICAgICAgICAgICAgaXNUb3VjaCA9IFwib250b3VjaHN0YXJ0XCIgaW4gd2luZG93IHx8IHdpbmRvdy5uYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cztcblxuICAgICAgICAgICAgYmFzZS5icm93c2VyID0ge1xuICAgICAgICAgICAgICAgIFwic3VwcG9ydDNkXCIgOiBzdXBwb3J0M2QsXG4gICAgICAgICAgICAgICAgXCJpc1RvdWNoXCIgOiBpc1RvdWNoXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVFdmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLm1vdXNlRHJhZyAhPT0gZmFsc2UgfHwgYmFzZS5vcHRpb25zLnRvdWNoRHJhZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBiYXNlLmdlc3R1cmVzKCk7XG4gICAgICAgICAgICAgICAgYmFzZS5kaXNhYmxlZEV2ZW50cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50VHlwZXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdHlwZXMgPSBbXCJzXCIsIFwiZVwiLCBcInhcIl07XG5cbiAgICAgICAgICAgIGJhc2UuZXZfdHlwZXMgPSB7fTtcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5tb3VzZURyYWcgPT09IHRydWUgJiYgYmFzZS5vcHRpb25zLnRvdWNoRHJhZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHR5cGVzID0gW1xuICAgICAgICAgICAgICAgICAgICBcInRvdWNoc3RhcnQub3dsIG1vdXNlZG93bi5vd2xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaG1vdmUub3dsIG1vdXNlbW92ZS5vd2xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaGVuZC5vd2wgdG91Y2hjYW5jZWwub3dsIG1vdXNldXAub3dsXCJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLm9wdGlvbnMubW91c2VEcmFnID09PSBmYWxzZSAmJiBiYXNlLm9wdGlvbnMudG91Y2hEcmFnID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdHlwZXMgPSBbXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2hzdGFydC5vd2xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaG1vdmUub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2hlbmQub3dsIHRvdWNoY2FuY2VsLm93bFwiXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5vcHRpb25zLm1vdXNlRHJhZyA9PT0gdHJ1ZSAmJiBiYXNlLm9wdGlvbnMudG91Y2hEcmFnID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHR5cGVzID0gW1xuICAgICAgICAgICAgICAgICAgICBcIm1vdXNlZG93bi5vd2xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJtb3VzZW1vdmUub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwibW91c2V1cC5vd2xcIlxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2UuZXZfdHlwZXMuc3RhcnQgPSB0eXBlc1swXTtcbiAgICAgICAgICAgIGJhc2UuZXZfdHlwZXMubW92ZSA9IHR5cGVzWzFdO1xuICAgICAgICAgICAgYmFzZS5ldl90eXBlcy5lbmQgPSB0eXBlc1syXTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlZEV2ZW50cyA6ICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwiZHJhZ3N0YXJ0Lm93bFwiLCBmdW5jdGlvbiAoZXZlbnQpIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfSk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwibW91c2Vkb3duLmRpc2FibGVUZXh0U2VsZWN0XCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQoZS50YXJnZXQpLmlzKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgb3B0aW9uJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXN0dXJlcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qanNsaW50IHVucGFyYW06IHRydWUqL1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGxvY2FscyA9IHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0WCA6IDAsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldFkgOiAwLFxuICAgICAgICAgICAgICAgICAgICBiYXNlRWxXaWR0aCA6IDAsXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlUG9zIDogMCxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG1pblN3aXBlIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbWF4U3dpcGU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRpbmcgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBkYXJnZ2luZzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RWxlbWVudCA6IG51bGxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBiYXNlLmlzQ3NzRmluaXNoID0gdHJ1ZTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0VG91Y2hlcyhldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC50b3VjaGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHggOiBldmVudC50b3VjaGVzWzBdLnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICAgICAgeSA6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWdlWCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggOiBldmVudC5wYWdlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5IDogZXZlbnQucGFnZVlcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhZ2VYID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeCA6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA6IGV2ZW50LmNsaWVudFlcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHN3YXBFdmVudHModHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSBcIm9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oYmFzZS5ldl90eXBlcy5tb3ZlLCBkcmFnTW92ZSk7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKGJhc2UuZXZfdHlwZXMuZW5kLCBkcmFnRW5kKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwib2ZmXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKGJhc2UuZXZfdHlwZXMubW92ZSk7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihiYXNlLmV2X3R5cGVzLmVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmFnU3RhcnQoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXYgPSBldmVudC5vcmlnaW5hbEV2ZW50IHx8IGV2ZW50IHx8IHdpbmRvdy5ldmVudCxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb247XG5cbiAgICAgICAgICAgICAgICBpZiAoZXYud2hpY2ggPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5pdGVtc0Ftb3VudCA8PSBiYXNlLm9wdGlvbnMuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5pc0Nzc0ZpbmlzaCA9PT0gZmFsc2UgJiYgIWJhc2Uub3B0aW9ucy5kcmFnQmVmb3JlQW5pbUZpbmlzaCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiYXNlLmlzQ3NzM0ZpbmlzaCA9PT0gZmFsc2UgJiYgIWJhc2Uub3B0aW9ucy5kcmFnQmVmb3JlQW5pbUZpbmlzaCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hdXRvUGxheSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5hdXRvUGxheUludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5icm93c2VyLmlzVG91Y2ggIT09IHRydWUgJiYgIWJhc2UuJG93bFdyYXBwZXIuaGFzQ2xhc3MoXCJncmFiYmluZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmFkZENsYXNzKFwiZ3JhYmJpbmdcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYmFzZS5uZXdQb3NYID0gMDtcbiAgICAgICAgICAgICAgICBiYXNlLm5ld1JlbGF0aXZlWCA9IDA7XG5cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhiYXNlLnJlbW92ZVRyYW5zaXRpb24oKSk7XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9ICQodGhpcykucG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICBsb2NhbHMucmVsYXRpdmVQb3MgPSBwb3NpdGlvbi5sZWZ0O1xuXG4gICAgICAgICAgICAgICAgbG9jYWxzLm9mZnNldFggPSBnZXRUb3VjaGVzKGV2KS54IC0gcG9zaXRpb24ubGVmdDtcbiAgICAgICAgICAgICAgICBsb2NhbHMub2Zmc2V0WSA9IGdldFRvdWNoZXMoZXYpLnkgLSBwb3NpdGlvbi50b3A7XG5cbiAgICAgICAgICAgICAgICBzd2FwRXZlbnRzKFwib25cIik7XG5cbiAgICAgICAgICAgICAgICBsb2NhbHMuc2xpZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxvY2Fscy50YXJnZXRFbGVtZW50ID0gZXYudGFyZ2V0IHx8IGV2LnNyY0VsZW1lbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYWdNb3ZlKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ID0gZXZlbnQub3JpZ2luYWxFdmVudCB8fCBldmVudCB8fCB3aW5kb3cuZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIG1pblN3aXBlLFxuICAgICAgICAgICAgICAgICAgICBtYXhTd2lwZTtcblxuICAgICAgICAgICAgICAgIGJhc2UubmV3UG9zWCA9IGdldFRvdWNoZXMoZXYpLnggLSBsb2NhbHMub2Zmc2V0WDtcbiAgICAgICAgICAgICAgICBiYXNlLm5ld1Bvc1kgPSBnZXRUb3VjaGVzKGV2KS55IC0gbG9jYWxzLm9mZnNldFk7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXdSZWxhdGl2ZVggPSBiYXNlLm5ld1Bvc1ggLSBsb2NhbHMucmVsYXRpdmVQb3M7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5zdGFydERyYWdnaW5nID09PSBcImZ1bmN0aW9uXCIgJiYgbG9jYWxzLmRyYWdnaW5nICE9PSB0cnVlICYmIGJhc2UubmV3UmVsYXRpdmVYICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2Fscy5kcmFnZ2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5zdGFydERyYWdnaW5nLmFwcGx5KGJhc2UsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKChiYXNlLm5ld1JlbGF0aXZlWCA+IDggfHwgYmFzZS5uZXdSZWxhdGl2ZVggPCAtOCkgJiYgKGJhc2UuYnJvd3Nlci5pc1RvdWNoID09PSB0cnVlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXYucHJldmVudERlZmF1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9jYWxzLnNsaWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICgoYmFzZS5uZXdQb3NZID4gMTAgfHwgYmFzZS5uZXdQb3NZIDwgLTEwKSAmJiBsb2NhbHMuc2xpZGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKFwidG91Y2htb3ZlLm93bFwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtaW5Td2lwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2UubmV3UmVsYXRpdmVYIC8gNTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgbWF4U3dpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLm1heGltdW1QaXhlbHMgKyBiYXNlLm5ld1JlbGF0aXZlWCAvIDU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGJhc2UubmV3UG9zWCA9IE1hdGgubWF4KE1hdGgubWluKGJhc2UubmV3UG9zWCwgbWluU3dpcGUoKSksIG1heFN3aXBlKCkpO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLmJyb3dzZXIuc3VwcG9ydDNkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UudHJhbnNpdGlvbjNkKGJhc2UubmV3UG9zWCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jc3MybW92ZShiYXNlLm5ld1Bvc1gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZHJhZ0VuZChldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBldiA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQgfHwgZXZlbnQgfHwgd2luZG93LmV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMsXG4gICAgICAgICAgICAgICAgICAgIG93bFN0b3BFdmVudDtcblxuICAgICAgICAgICAgICAgIGV2LnRhcmdldCA9IGV2LnRhcmdldCB8fCBldi5zcmNFbGVtZW50O1xuXG4gICAgICAgICAgICAgICAgbG9jYWxzLmRyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5icm93c2VyLmlzVG91Y2ggIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5yZW1vdmVDbGFzcyhcImdyYWJiaW5nXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLm5ld1JlbGF0aXZlWCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5kcmFnRGlyZWN0aW9uID0gYmFzZS5vd2wuZHJhZ0RpcmVjdGlvbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuZHJhZ0RpcmVjdGlvbiA9IGJhc2Uub3dsLmRyYWdEaXJlY3Rpb24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2UubmV3UmVsYXRpdmVYICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uID0gYmFzZS5nZXROZXdQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmdvVG8obmV3UG9zaXRpb24sIGZhbHNlLCBcImRyYWdcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbHMudGFyZ2V0RWxlbWVudCA9PT0gZXYudGFyZ2V0ICYmIGJhc2UuYnJvd3Nlci5pc1RvdWNoICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKGV2LnRhcmdldCkub24oXCJjbGljay5kaXNhYmxlXCIsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChldi50YXJnZXQpLm9mZihcImNsaWNrLmRpc2FibGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzID0gJC5fZGF0YShldi50YXJnZXQsIFwiZXZlbnRzXCIpLmNsaWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3dsU3RvcEV2ZW50ID0gaGFuZGxlcnMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5zcGxpY2UoMCwgMCwgb3dsU3RvcEV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2FwRXZlbnRzKFwib2ZmXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihiYXNlLmV2X3R5cGVzLnN0YXJ0LCBcIi5vd2wtd3JhcHBlclwiLCBkcmFnU3RhcnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldE5ld1Bvc2l0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uID0gYmFzZS5jbG9zZXN0SXRlbSgpO1xuXG4gICAgICAgICAgICBpZiAobmV3UG9zaXRpb24gPiBiYXNlLm1heGltdW1JdGVtKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb24gID0gYmFzZS5tYXhpbXVtSXRlbTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5uZXdQb3NYID49IDApIHtcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3UG9zaXRpb247XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3Nlc3RJdGVtIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFycmF5ID0gYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUgPyBiYXNlLnBhZ2VzSW5BcnJheSA6IGJhc2UucG9zaXRpb25zSW5BcnJheSxcbiAgICAgICAgICAgICAgICBnb2FsID0gYmFzZS5uZXdQb3NYLFxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBudWxsO1xuXG4gICAgICAgICAgICAkLmVhY2goYXJyYXksIGZ1bmN0aW9uIChpLCB2KSB7XG4gICAgICAgICAgICAgICAgaWYgKGdvYWwgLSAoYmFzZS5pdGVtV2lkdGggLyAyMCkgPiBhcnJheVtpICsgMV0gJiYgZ29hbCAtIChiYXNlLml0ZW1XaWR0aCAvIDIwKSA8IHYgJiYgYmFzZS5tb3ZlRGlyZWN0aW9uKCkgPT09IFwibGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSB2O1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAkLmluQXJyYXkoY2xvc2VzdCwgYmFzZS5wb3NpdGlvbnNJbkFycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChnb2FsICsgKGJhc2UuaXRlbVdpZHRoIC8gMjApIDwgdiAmJiBnb2FsICsgKGJhc2UuaXRlbVdpZHRoIC8gMjApID4gKGFycmF5W2kgKyAxXSB8fCBhcnJheVtpXSAtIGJhc2UuaXRlbVdpZHRoKSAmJiBiYXNlLm1vdmVEaXJlY3Rpb24oKSA9PT0gXCJyaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGFycmF5W2kgKyAxXSB8fCBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAkLmluQXJyYXkoY2xvc2VzdCwgYmFzZS5wb3NpdGlvbnNJbkFycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBhcnJheVtpICsgMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBiYXNlLmN1cnJlbnRJdGVtO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVEaXJlY3Rpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uO1xuICAgICAgICAgICAgaWYgKGJhc2UubmV3UmVsYXRpdmVYIDwgMCkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgICAgICBiYXNlLnBsYXlEaXJlY3Rpb24gPSBcIm5leHRcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgYmFzZS5wbGF5RGlyZWN0aW9uID0gXCJwcmV2XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aW9uO1xuICAgICAgICB9LFxuXG4gICAgICAgIGN1c3RvbUV2ZW50cyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qanNsaW50IHVucGFyYW06IHRydWUqL1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm93bC5uZXh0XCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm5leHQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm93bC5wcmV2XCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnByZXYoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm93bC5wbGF5XCIsIGZ1bmN0aW9uIChldmVudCwgc3BlZWQpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYXV0b1BsYXkgPSBzcGVlZDtcbiAgICAgICAgICAgICAgICBiYXNlLnBsYXkoKTtcbiAgICAgICAgICAgICAgICBiYXNlLmhvdmVyU3RhdHVzID0gXCJwbGF5XCI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wuc3RvcFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5zdG9wKCk7XG4gICAgICAgICAgICAgICAgYmFzZS5ob3ZlclN0YXR1cyA9IFwic3RvcFwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwib3dsLmdvVG9cIiwgZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5nb1RvKGl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwib3dsLmp1bXBUb1wiLCBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBiYXNlLmp1bXBUbyhpdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3BPbkhvdmVyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5zdG9wT25Ib3ZlciA9PT0gdHJ1ZSAmJiBiYXNlLmJyb3dzZXIuaXNUb3VjaCAhPT0gdHJ1ZSAmJiBiYXNlLm9wdGlvbnMuYXV0b1BsYXkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uuc3RvcCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlLmhvdmVyU3RhdHVzICE9PSBcInN0b3BcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBsYXp5TG9hZCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgICRpdGVtLFxuICAgICAgICAgICAgICAgIGl0ZW1OdW1iZXIsXG4gICAgICAgICAgICAgICAgJGxhenlJbWcsXG4gICAgICAgICAgICAgICAgZm9sbG93O1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmxhenlMb2FkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBiYXNlLml0ZW1zQW1vdW50OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAkaXRlbSA9ICQoYmFzZS4kb3dsSXRlbXNbaV0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCRpdGVtLmRhdGEoXCJvd2wtbG9hZGVkXCIpID09PSBcImxvYWRlZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGl0ZW1OdW1iZXIgPSAkaXRlbS5kYXRhKFwib3dsLWl0ZW1cIik7XG4gICAgICAgICAgICAgICAgJGxhenlJbWcgPSAkaXRlbS5maW5kKFwiLmxhenlPd2xcIik7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mICRsYXp5SW1nLmRhdGEoXCJzcmNcIikgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW0uZGF0YShcIm93bC1sb2FkZWRcIiwgXCJsb2FkZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoJGl0ZW0uZGF0YShcIm93bC1sb2FkZWRcIikgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAkbGF6eUltZy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtLmFkZENsYXNzKFwibG9hZGluZ1wiKS5kYXRhKFwib3dsLWxvYWRlZFwiLCBcImNoZWNrZWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubGF6eUZvbGxvdyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBmb2xsb3cgPSBpdGVtTnVtYmVyID49IGJhc2UuY3VycmVudEl0ZW07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9sbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGZvbGxvdyAmJiBpdGVtTnVtYmVyIDwgYmFzZS5jdXJyZW50SXRlbSArIGJhc2Uub3B0aW9ucy5pdGVtcyAmJiAkbGF6eUltZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgJGxhenlJbWcuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UubGF6eVByZWxvYWQoJGl0ZW0sICQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGF6eVByZWxvYWQgOiBmdW5jdGlvbiAoJGl0ZW0sICRsYXp5SW1nKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaXRlcmF0aW9ucyA9IDAsXG4gICAgICAgICAgICAgICAgaXNCYWNrZ3JvdW5kSW1nO1xuXG4gICAgICAgICAgICBpZiAoJGxhenlJbWcucHJvcChcInRhZ05hbWVcIikgPT09IFwiRElWXCIpIHtcbiAgICAgICAgICAgICAgICAkbGF6eUltZy5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwidXJsKFwiICsgJGxhenlJbWcuZGF0YShcInNyY1wiKSArIFwiKVwiKTtcbiAgICAgICAgICAgICAgICBpc0JhY2tncm91bmRJbWcgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkbGF6eUltZ1swXS5zcmMgPSAkbGF6eUltZy5kYXRhKFwic3JjXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93SW1hZ2UoKSB7XG4gICAgICAgICAgICAgICAgJGl0ZW0uZGF0YShcIm93bC1sb2FkZWRcIiwgXCJsb2FkZWRcIikucmVtb3ZlQ2xhc3MoXCJsb2FkaW5nXCIpO1xuICAgICAgICAgICAgICAgICRsYXp5SW1nLnJlbW92ZUF0dHIoXCJkYXRhLXNyY1wiKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmxhenlFZmZlY3QgPT09IFwiZmFkZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICRsYXp5SW1nLmZhZGVJbig0MDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRsYXp5SW1nLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYWZ0ZXJMYXp5TG9hZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hZnRlckxhenlMb2FkLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja0xhenlJbWFnZSgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRpb25zICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuY29tcGxldGVJbWcoJGxhenlJbWcuZ2V0KDApKSB8fCBpc0JhY2tncm91bmRJbWcgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0ltYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVyYXRpb25zIDw9IDEwMCkgey8vaWYgaW1hZ2UgbG9hZHMgaW4gbGVzcyB0aGFuIDEwIHNlY29uZHMgXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNoZWNrTGF6eUltYWdlLCAxMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dJbWFnZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hlY2tMYXp5SW1hZ2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhdXRvSGVpZ2h0IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgICRjdXJyZW50aW1nID0gJChiYXNlLiRvd2xJdGVtc1tiYXNlLmN1cnJlbnRJdGVtXSkuZmluZChcImltZ1wiKSxcbiAgICAgICAgICAgICAgICBpdGVyYXRpb25zO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRIZWlnaHQoKSB7XG4gICAgICAgICAgICAgICAgdmFyICRjdXJyZW50SXRlbSA9ICQoYmFzZS4kb3dsSXRlbXNbYmFzZS5jdXJyZW50SXRlbV0pLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgIGJhc2Uud3JhcHBlck91dGVyLmNzcyhcImhlaWdodFwiLCAkY3VycmVudEl0ZW0gKyBcInB4XCIpO1xuICAgICAgICAgICAgICAgIGlmICghYmFzZS53cmFwcGVyT3V0ZXIuaGFzQ2xhc3MoXCJhdXRvSGVpZ2h0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2Uud3JhcHBlck91dGVyLmFkZENsYXNzKFwiYXV0b0hlaWdodFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja0ltYWdlKCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbnMgKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5jb21wbGV0ZUltZygkY3VycmVudGltZy5nZXQoMCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZEhlaWdodCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlcmF0aW9ucyA8PSAxMDApIHsgLy9pZiBpbWFnZSBsb2FkcyBpbiBsZXNzIHRoYW4gMTAgc2Vjb25kcyBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2hlY2tJbWFnZSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLndyYXBwZXJPdXRlci5jc3MoXCJoZWlnaHRcIiwgXCJcIik7IC8vRWxzZSByZW1vdmUgaGVpZ2h0IGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCRjdXJyZW50aW1nLmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0aW9ucyA9IDA7XG4gICAgICAgICAgICAgICAgY2hlY2tJbWFnZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRIZWlnaHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjb21wbGV0ZUltZyA6IGZ1bmN0aW9uIChpbWcpIHtcbiAgICAgICAgICAgIHZhciBuYXR1cmFsV2lkdGhUeXBlO1xuXG4gICAgICAgICAgICBpZiAoIWltZy5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5hdHVyYWxXaWR0aFR5cGUgPSB0eXBlb2YgaW1nLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgICAgIGlmIChuYXR1cmFsV2lkdGhUeXBlICE9PSBcInVuZGVmaW5lZFwiICYmIGltZy5uYXR1cmFsV2lkdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblZpc2libGVJdGVtcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmFkZENsYXNzQWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsSXRlbXMucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLnZpc2libGVJdGVtcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChpID0gYmFzZS5jdXJyZW50SXRlbTsgaSA8IGJhc2UuY3VycmVudEl0ZW0gKyBiYXNlLm9wdGlvbnMuaXRlbXM7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGJhc2UudmlzaWJsZUl0ZW1zLnB1c2goaSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmFkZENsYXNzQWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICQoYmFzZS4kb3dsSXRlbXNbaV0pLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2Uub3dsLnZpc2libGVJdGVtcyA9IGJhc2UudmlzaWJsZUl0ZW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyYW5zaXRpb25UeXBlcyA6IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIC8vQ3VycmVudGx5IGF2YWlsYWJsZTogXCJmYWRlXCIsIFwiYmFja1NsaWRlXCIsIFwiZ29Eb3duXCIsIFwiZmFkZVVwXCJcbiAgICAgICAgICAgIGJhc2Uub3V0Q2xhc3MgPSBcIm93bC1cIiArIGNsYXNzTmFtZSArIFwiLW91dFwiO1xuICAgICAgICAgICAgYmFzZS5pbkNsYXNzID0gXCJvd2wtXCIgKyBjbGFzc05hbWUgKyBcIi1pblwiO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpbmdsZUl0ZW1UcmFuc2l0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG91dENsYXNzID0gYmFzZS5vdXRDbGFzcyxcbiAgICAgICAgICAgICAgICBpbkNsYXNzID0gYmFzZS5pbkNsYXNzLFxuICAgICAgICAgICAgICAgICRjdXJyZW50SXRlbSA9IGJhc2UuJG93bEl0ZW1zLmVxKGJhc2UuY3VycmVudEl0ZW0pLFxuICAgICAgICAgICAgICAgICRwcmV2SXRlbSA9IGJhc2UuJG93bEl0ZW1zLmVxKGJhc2UucHJldkl0ZW0pLFxuICAgICAgICAgICAgICAgIHByZXZQb3MgPSBNYXRoLmFicyhiYXNlLnBvc2l0aW9uc0luQXJyYXlbYmFzZS5jdXJyZW50SXRlbV0pICsgYmFzZS5wb3NpdGlvbnNJbkFycmF5W2Jhc2UucHJldkl0ZW1dLFxuICAgICAgICAgICAgICAgIG9yaWdpbiA9IE1hdGguYWJzKGJhc2UucG9zaXRpb25zSW5BcnJheVtiYXNlLmN1cnJlbnRJdGVtXSkgKyBiYXNlLml0ZW1XaWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgYW5pbUVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgb0FuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBhbmltYXRpb25lbmQnO1xuXG4gICAgICAgICAgICBiYXNlLmlzVHJhbnNpdGlvbiA9IHRydWU7XG5cbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXJcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ293bC1vcmlnaW4nKVxuICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNmb3JtLW9yaWdpblwiIDogb3JpZ2luICsgXCJweFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi1tb3otcGVyc3BlY3RpdmUtb3JpZ2luXCIgOiBvcmlnaW4gKyBcInB4XCIsXG4gICAgICAgICAgICAgICAgICAgIFwicGVyc3BlY3RpdmUtb3JpZ2luXCIgOiBvcmlnaW4gKyBcInB4XCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRyYW5zU3R5bGVzKHByZXZQb3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uXCIgOiBcInJlbGF0aXZlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwibGVmdFwiIDogcHJldlBvcyArIFwicHhcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRwcmV2SXRlbVxuICAgICAgICAgICAgICAgIC5jc3ModHJhbnNTdHlsZXMocHJldlBvcywgMTApKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhvdXRDbGFzcylcbiAgICAgICAgICAgICAgICAub24oYW5pbUVuZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmVuZFByZXYgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAkcHJldkl0ZW0ub2ZmKGFuaW1FbmQpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNsZWFyVHJhbnNTdHlsZSgkcHJldkl0ZW0sIG91dENsYXNzKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJGN1cnJlbnRJdGVtXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGluQ2xhc3MpXG4gICAgICAgICAgICAgICAgLm9uKGFuaW1FbmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5lbmRDdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgJGN1cnJlbnRJdGVtLm9mZihhbmltRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jbGVhclRyYW5zU3R5bGUoJGN1cnJlbnRJdGVtLCBpbkNsYXNzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhclRyYW5zU3R5bGUgOiBmdW5jdGlvbiAoaXRlbSwgY2xhc3NUb1JlbW92ZSkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaXRlbS5jc3Moe1xuICAgICAgICAgICAgICAgIFwicG9zaXRpb25cIiA6IFwiXCIsXG4gICAgICAgICAgICAgICAgXCJsZWZ0XCIgOiBcIlwiXG4gICAgICAgICAgICB9KS5yZW1vdmVDbGFzcyhjbGFzc1RvUmVtb3ZlKTtcblxuICAgICAgICAgICAgaWYgKGJhc2UuZW5kUHJldiAmJiBiYXNlLmVuZEN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLnJlbW92ZUNsYXNzKCdvd2wtb3JpZ2luJyk7XG4gICAgICAgICAgICAgICAgYmFzZS5lbmRQcmV2ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5lbmRDdXJyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5pc1RyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvd2xTdGF0dXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLm93bCA9IHtcbiAgICAgICAgICAgICAgICBcInVzZXJPcHRpb25zXCIgICA6IGJhc2UudXNlck9wdGlvbnMsXG4gICAgICAgICAgICAgICAgXCJiYXNlRWxlbWVudFwiICAgOiBiYXNlLiRlbGVtLFxuICAgICAgICAgICAgICAgIFwidXNlckl0ZW1zXCIgICAgIDogYmFzZS4kdXNlckl0ZW1zLFxuICAgICAgICAgICAgICAgIFwib3dsSXRlbXNcIiAgICAgIDogYmFzZS4kb3dsSXRlbXMsXG4gICAgICAgICAgICAgICAgXCJjdXJyZW50SXRlbVwiICAgOiBiYXNlLmN1cnJlbnRJdGVtLFxuICAgICAgICAgICAgICAgIFwicHJldkl0ZW1cIiAgICAgIDogYmFzZS5wcmV2SXRlbSxcbiAgICAgICAgICAgICAgICBcInZpc2libGVJdGVtc1wiICA6IGJhc2UudmlzaWJsZUl0ZW1zLFxuICAgICAgICAgICAgICAgIFwiaXNUb3VjaFwiICAgICAgIDogYmFzZS5icm93c2VyLmlzVG91Y2gsXG4gICAgICAgICAgICAgICAgXCJicm93c2VyXCIgICAgICAgOiBiYXNlLmJyb3dzZXIsXG4gICAgICAgICAgICAgICAgXCJkcmFnRGlyZWN0aW9uXCIgOiBiYXNlLmRyYWdEaXJlY3Rpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXJFdmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9mZihcIi5vd2wgb3dsIG1vdXNlZG93bi5kaXNhYmxlVGV4dFNlbGVjdFwiKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihcIi5vd2wgb3dsXCIpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZihcInJlc2l6ZVwiLCBiYXNlLnJlc2l6ZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuV3JhcCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLiRlbGVtLmNoaWxkcmVuKCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci51bndyYXAoKTtcbiAgICAgICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMudW53cmFwKCkudW53cmFwKCk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3dsQ29udHJvbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmNsZWFyRXZlbnRzKCk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLmF0dHIoe1xuICAgICAgICAgICAgICAgIHN0eWxlOiBiYXNlLiRlbGVtLmRhdGEoXCJvd2wtb3JpZ2luYWxTdHlsZXNcIikgfHwgXCJcIixcbiAgICAgICAgICAgICAgICBjbGFzczogYmFzZS4kZWxlbS5kYXRhKFwib3dsLW9yaWdpbmFsQ2xhc3Nlc1wiKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVzdHJveSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2Uuc3RvcCgpO1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5jaGVja1Zpc2libGUpO1xuICAgICAgICAgICAgYmFzZS51bldyYXAoKTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ucmVtb3ZlRGF0YSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlaW5pdCA6IGZ1bmN0aW9uIChuZXdPcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBiYXNlLnVzZXJPcHRpb25zLCBuZXdPcHRpb25zKTtcbiAgICAgICAgICAgIGJhc2UudW5XcmFwKCk7XG4gICAgICAgICAgICBiYXNlLmluaXQob3B0aW9ucywgYmFzZS4kZWxlbSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkSXRlbSA6IGZ1bmN0aW9uIChodG1sU3RyaW5nLCB0YXJnZXRQb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgICAgICBpZiAoIWh0bWxTdHJpbmcpIHtyZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICAgICAgaWYgKGJhc2UuJGVsZW0uY2hpbGRyZW4oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmFwcGVuZChodG1sU3RyaW5nKTtcbiAgICAgICAgICAgICAgICBiYXNlLnNldFZhcnMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLnVuV3JhcCgpO1xuICAgICAgICAgICAgaWYgKHRhcmdldFBvc2l0aW9uID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0UG9zaXRpb24gPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSAtMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbiA+PSBiYXNlLiR1c2VySXRlbXMubGVuZ3RoIHx8IHBvc2l0aW9uID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGJhc2UuJHVzZXJJdGVtcy5lcSgtMSkuYWZ0ZXIoaHRtbFN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuJHVzZXJJdGVtcy5lcShwb3NpdGlvbikuYmVmb3JlKGh0bWxTdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYXNlLnNldFZhcnMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVJdGVtIDogZnVuY3Rpb24gKHRhcmdldFBvc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcG9zaXRpb247XG5cbiAgICAgICAgICAgIGlmIChiYXNlLiRlbGVtLmNoaWxkcmVuKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhcmdldFBvc2l0aW9uID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0UG9zaXRpb24gPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSAtMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFzZS51bldyYXAoKTtcbiAgICAgICAgICAgIGJhc2UuJHVzZXJJdGVtcy5lcShwb3NpdGlvbikucmVtb3ZlKCk7XG4gICAgICAgICAgICBiYXNlLnNldFZhcnMoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICQuZm4ub3dsQ2Fyb3VzZWwgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmRhdGEoXCJvd2wtaW5pdFwiKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQodGhpcykuZGF0YShcIm93bC1pbml0XCIsIHRydWUpO1xuICAgICAgICAgICAgdmFyIGNhcm91c2VsID0gT2JqZWN0LmNyZWF0ZShDYXJvdXNlbCk7XG4gICAgICAgICAgICBjYXJvdXNlbC5pbml0KG9wdGlvbnMsIHRoaXMpO1xuICAgICAgICAgICAgJC5kYXRhKHRoaXMsIFwib3dsQ2Fyb3VzZWxcIiwgY2Fyb3VzZWwpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJC5mbi5vd2xDYXJvdXNlbC5vcHRpb25zID0ge1xuXG4gICAgICAgIGl0ZW1zIDogNSxcbiAgICAgICAgaXRlbXNDdXN0b20gOiBmYWxzZSxcbiAgICAgICAgaXRlbXNEZXNrdG9wIDogWzExOTksIDRdLFxuICAgICAgICBpdGVtc0Rlc2t0b3BTbWFsbCA6IFs5NzksIDNdLFxuICAgICAgICBpdGVtc1RhYmxldCA6IFs3NjgsIDJdLFxuICAgICAgICBpdGVtc1RhYmxldFNtYWxsIDogZmFsc2UsXG4gICAgICAgIGl0ZW1zTW9iaWxlIDogWzQ3OSwgMV0sXG4gICAgICAgIHNpbmdsZUl0ZW0gOiBmYWxzZSxcbiAgICAgICAgaXRlbXNTY2FsZVVwIDogZmFsc2UsXG5cbiAgICAgICAgc2xpZGVTcGVlZCA6IDIwMCxcbiAgICAgICAgcGFnaW5hdGlvblNwZWVkIDogODAwLFxuICAgICAgICByZXdpbmRTcGVlZCA6IDEwMDAsXG5cbiAgICAgICAgYXV0b1BsYXkgOiBmYWxzZSxcbiAgICAgICAgc3RvcE9uSG92ZXIgOiBmYWxzZSxcblxuICAgICAgICBuYXZpZ2F0aW9uIDogZmFsc2UsXG4gICAgICAgIG5hdmlnYXRpb25UZXh0IDogW1wicHJldlwiLCBcIm5leHRcIl0sXG4gICAgICAgIHJld2luZE5hdiA6IHRydWUsXG4gICAgICAgIHNjcm9sbFBlclBhZ2UgOiBmYWxzZSxcblxuICAgICAgICBwYWdpbmF0aW9uIDogdHJ1ZSxcbiAgICAgICAgcGFnaW5hdGlvbk51bWJlcnMgOiBmYWxzZSxcblxuICAgICAgICByZXNwb25zaXZlIDogdHJ1ZSxcbiAgICAgICAgcmVzcG9uc2l2ZVJlZnJlc2hSYXRlIDogMjAwLFxuICAgICAgICByZXNwb25zaXZlQmFzZVdpZHRoIDogd2luZG93LFxuXG4gICAgICAgIGJhc2VDbGFzcyA6IFwib3dsLWNhcm91c2VsXCIsXG4gICAgICAgIHRoZW1lIDogXCJvd2wtdGhlbWVcIixcblxuICAgICAgICBsYXp5TG9hZCA6IGZhbHNlLFxuICAgICAgICBsYXp5Rm9sbG93IDogdHJ1ZSxcbiAgICAgICAgbGF6eUVmZmVjdCA6IFwiZmFkZVwiLFxuXG4gICAgICAgIGF1dG9IZWlnaHQgOiBmYWxzZSxcblxuICAgICAgICBqc29uUGF0aCA6IGZhbHNlLFxuICAgICAgICBqc29uU3VjY2VzcyA6IGZhbHNlLFxuXG4gICAgICAgIGRyYWdCZWZvcmVBbmltRmluaXNoIDogdHJ1ZSxcbiAgICAgICAgbW91c2VEcmFnIDogdHJ1ZSxcbiAgICAgICAgdG91Y2hEcmFnIDogdHJ1ZSxcblxuICAgICAgICBhZGRDbGFzc0FjdGl2ZSA6IGZhbHNlLFxuICAgICAgICB0cmFuc2l0aW9uU3R5bGUgOiBmYWxzZSxcblxuICAgICAgICBiZWZvcmVVcGRhdGUgOiBmYWxzZSxcbiAgICAgICAgYWZ0ZXJVcGRhdGUgOiBmYWxzZSxcbiAgICAgICAgYmVmb3JlSW5pdCA6IGZhbHNlLFxuICAgICAgICBhZnRlckluaXQgOiBmYWxzZSxcbiAgICAgICAgYmVmb3JlTW92ZSA6IGZhbHNlLFxuICAgICAgICBhZnRlck1vdmUgOiBmYWxzZSxcbiAgICAgICAgYWZ0ZXJBY3Rpb24gOiBmYWxzZSxcbiAgICAgICAgc3RhcnREcmFnZ2luZyA6IGZhbHNlLFxuICAgICAgICBhZnRlckxhenlMb2FkOiBmYWxzZVxuICAgIH07XG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwiaW1wb3J0IG93bENhcm91c2VsIGZyb20gJy4uLy4uL25vZGVfbW9kdWxlcy9vd2xjYXJvdXNlbC9vd2wtY2Fyb3VzZWwvb3dsLmNhcm91c2VsJ1xuXG5cbmZ1bmN0aW9uIGluaXRDYXJvdXNlbCgpIHtcbiAgICAkKFwiI3BhcnRuZXJzLWNhcm91c2VsXCIpLm93bENhcm91c2VsKCk7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgaW5pdENhcm91c2VsXG4iLCJpbXBvcnQgaW5pdENhcm91c2VsIGZyb20gJy4vX2Nhcm91c2VsJ1xuXG5cbmNsYXNzIEFwcCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2luaXRFbGVtZW50cygpO1xuICAgICAgICB0aGlzLnNjcm9sbER1cmF0aW9uID0gMzAwMDtcblxuICAgICAgICB0aGlzLmZpbmRTZWN0aW9uUG9zaXRpb25zKCk7XG4gICAgICAgIHRoaXMuX2luaXRIZWFkZXIoKTtcbiAgICAgICAgdGhpcy5faW5pdE1haW5NZW51KCk7XG4gICAgICAgIHRoaXMuX2luaXRTY3JvbGxOYXYoKTtcbiAgICB9XG5cbiAgICBfaW5pdEVsZW1lbnRzKCkge1xuICAgICAgICB0aGlzLiRoZWFkZXIgPSAkKFwiLnBhZ2VfaGVhZGVyXCIpO1xuICAgICAgICB0aGlzLmhlYWRlckhlaWdodCA9IHRoaXMuJGhlYWRlci5vdXRlckhlaWdodCgpO1xuICAgICAgICB0aGlzLmhlYWRlckRlZmF1bHRQb3MgPSB0aGlzLiRoZWFkZXIub2Zmc2V0KCkudG9wO1xuXG4gICAgICAgIHRoaXMuJG1haW5NZW51ID0gJChcIi5tYWluX21lbnVcIik7XG4gICAgICAgIHRoaXMuJG1haW5NZW51TGluayA9IHRoaXMuJG1haW5NZW51LmZpbmQoXCIubWFpbl9tZW51X19saW5rXCIpO1xuICAgICAgICB0aGlzLiRtYWluTWVudVRyaWdnZXIgPSB0aGlzLiRtYWluTWVudS5maW5kKFwiLnRyaWdnZXJcIik7XG4gICAgICAgIHRoaXMuJG1haW5NZW51QWN0aXZlTWFya2VyID0gdGhpcy4kbWFpbk1lbnUuZmluZChcIi5tYWluX21lbnVfX21hcmtlclwiKTtcblxuICAgICAgICB0aGlzLiRzZWN0aW9ucyA9ICQoXCIuc2VjdGlvblwiKTtcbiAgICB9XG5cbiAgICBfaW5pdEhlYWRlcigpIHtcbiAgICAgICAgbGV0IGhlYWRlckZpeGVkID0gZmFsc2U7XG4gICAgICAgICQod2luZG93KS5zY3JvbGwoKCkgPT4ge1xuICAgICAgICAgICAgaWYoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID49IHRoaXMuaGVhZGVyRGVmYXVsdFBvcykge1xuICAgICAgICAgICAgICAgIGlmKCFoZWFkZXJGaXhlZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGhlYWRlci5hZGRDbGFzcyhcImZpeGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJGaXhlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihoZWFkZXJGaXhlZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGhlYWRlci5yZW1vdmVDbGFzcyhcImZpeGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJGaXhlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRNYWluTWVudSgpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLiRtYWluTWVudVRyaWdnZXIub24oXCJjbGlja1wiLCBlID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLiRtYWluTWVudS50b2dnbGVDbGFzcyhcIm9wZW5cIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRtYWluTWVudUxpbmsub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IHNlY3Rpb25JRCA9ICQodGhpcykuYXR0cihcImhyZWZcIikucmVwbGFjZShcIiNcIiwgXCJcIik7XG4gICAgICAgICAgICBzZWxmLnNjcm9sbDJTZWN0aW9uKHNlY3Rpb25JRCk7XG4gICAgICAgICAgICBzZWxmLnNldEFjdGl2ZU1lbnVJdGVtKHNlY3Rpb25JRCk7XG4gICAgICAgICAgICBzZWxmLm1lbnVDbGlja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2VsZi5tZW51Q2xpY2tlZCA9IGZhbHNlLCA1MDApO1xuICAgICAgICB9KTtcbiAgICAgICAgJChcImJvZHlcIikub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLiRtYWluTWVudS5yZW1vdmVDbGFzcyhcIm9wZW5cIikpO1xuICAgIH1cblxuICAgIGZpbmRTZWN0aW9uUG9zaXRpb25zKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuc2VjdGlvblBvc2l0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLnNlY3Rpb25CcmVha1BvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLiRzZWN0aW9ucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgc2VjdGlvbklEID0gJCh0aGlzKS5hdHRyKFwiaWRcIikucmVwbGFjZShcInNlY3Rpb25fXCIsIFwiXCIpLFxuICAgICAgICAgICAgICAgIGJwID0gJCh0aGlzKS5vZmZzZXQoKS50b3AgLSBzZWxmLmhlYWRlckhlaWdodDtcbiAgICAgICAgICAgIHNlbGYuc2VjdGlvblBvc2l0aW9uc1tzZWN0aW9uSURdID0gYnA7XG4gICAgICAgICAgICBzZWxmLnNlY3Rpb25CcmVha1BvaW50cy5wdXNoKGJwKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGYuc2VjdGlvbkJyZWFrUG9pbnRzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICB9XG5cbiAgICBfaW5pdFNjcm9sbE5hdigpIHtcbiAgICAgICAgdGhpcy5maW5kU2VjdGlvblBvc2l0aW9ucygpO1xuICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gJyc7XG4gICAgICAgIHRoaXMubWVudUNsaWNrZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGZwID0gJCh3aW5kb3cpLmhlaWdodCgpIC8gNCxcbiAgICAgICAgICAgIG5ld1NlY3Rpb24gPSAnJztcbiAgICAgICAgJCh3aW5kb3cpLnNjcm9sbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWVudUNsaWNrZWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgc2Nyb2xsUG9zaXRpb24gPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICAgICAgbGV0IGJwID0gTWF0aC5tYXgoLi4udGhpcy5zZWN0aW9uQnJlYWtQb2ludHMuZmlsdGVyKHYgPT4gdiA8PSBzY3JvbGxQb3NpdGlvbiArIGZwKSk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcyBpbiB0aGlzLnNlY3Rpb25Qb3NpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5zZWN0aW9uUG9zaXRpb25zLmhhc093blByb3BlcnR5KHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWN0aW9uUG9zaXRpb25zW3NdID09IGJwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U2VjdGlvbiA9IHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5ld1NlY3Rpb24gIT0gdGhpcy5jdXJyZW50U2VjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZU1lbnVJdGVtKG5ld1NlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gbmV3U2VjdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkKHdpbmRvdykucmVzaXplKCgpID0+IHRoaXMuZmluZFNlY3Rpb25Qb3NpdGlvbnMoKSk7XG4gICAgfVxuXG4gICAgc2Nyb2xsMlNlY3Rpb24oc2VjdGlvbklEKSB7XG4gICAgICAgICQoXCJodG1sLGJvZHlcIikuYW5pbWF0ZSh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IHRoaXMuc2VjdGlvblBvc2l0aW9uc1tzZWN0aW9uSURdLFxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuc2Nyb2xsRHVyYXRpb25cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0QWN0aXZlTWVudUl0ZW0oc2VjdGlvbklEKSB7XG4gICAgICAgIGxldCAkbWVudUl0ZW0gPSB0aGlzLiRtYWluTWVudUxpbmsuZmlsdGVyKGBbaHJlZj1cIiMke3NlY3Rpb25JRH1cIl1gKTtcbiAgICAgICAgaWYoJG1lbnVJdGVtLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxldCBtZW51SXRlbVdpZHRoID0gJG1lbnVJdGVtLndpZHRoKCksXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1MZWZ0ID0gJG1lbnVJdGVtLm9mZnNldCgpLmxlZnQgLSB0aGlzLiRtYWluTWVudS5vZmZzZXQoKS5sZWZ0O1xuICAgICAgICAgICAgdGhpcy4kbWFpbk1lbnVMaW5rLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgJG1lbnVJdGVtLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgdGhpcy4kbWFpbk1lbnVBY3RpdmVNYXJrZXJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoXCJvdXRzaWRlXCIpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IG1lbnVJdGVtTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IG1lbnVJdGVtV2lkdGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJG1haW5NZW51QWN0aXZlTWFya2VyLmFkZENsYXNzKFwib3V0c2lkZVwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4kKGZ1bmN0aW9uKCl7XG4gICAgbmV3IEFwcCgpO1xuICAgIGluaXRDYXJvdXNlbCgpO1xufSk7XG4iXX0=
