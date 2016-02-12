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
            $(window).resize(this.findSectionPositions);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvb3dsY2Fyb3VzZWwvb3dsLWNhcm91c2VsL293bC5jYXJvdXNlbC5qcyIsInNyYy9zY3JpcHRzL19jYXJvdXNlbC5qcyIsInNyYy9zY3JpcHRzL3NjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUMxK0NBLFNBQVMsWUFBVCxHQUF3QjtBQUNwQixNQUFFLG9CQUFGLEVBQXdCLFdBQXhCLEdBRG9CO0NBQXhCOztrQkFLZTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNMVDtBQUNGLGFBREUsR0FDRixHQUFjOzhCQURaLEtBQ1k7O0FBQ1YsYUFBSyxhQUFMLEdBRFU7QUFFVixhQUFLLGNBQUwsR0FBc0IsSUFBdEIsQ0FGVTs7QUFJVixhQUFLLG9CQUFMLEdBSlU7QUFLVixhQUFLLFdBQUwsR0FMVTtBQU1WLGFBQUssYUFBTCxHQU5VO0FBT1YsYUFBSyxjQUFMLEdBUFU7S0FBZDs7aUJBREU7O3dDQVdjO0FBQ1osaUJBQUssT0FBTCxHQUFlLEVBQUUsY0FBRixDQUFmLENBRFk7QUFFWixpQkFBSyxZQUFMLEdBQW9CLEtBQUssT0FBTCxDQUFhLFdBQWIsRUFBcEIsQ0FGWTtBQUdaLGlCQUFLLGdCQUFMLEdBQXdCLEtBQUssT0FBTCxDQUFhLE1BQWIsR0FBc0IsR0FBdEIsQ0FIWjs7QUFLWixpQkFBSyxTQUFMLEdBQWlCLEVBQUUsWUFBRixDQUFqQixDQUxZO0FBTVosaUJBQUssYUFBTCxHQUFxQixLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLGtCQUFwQixDQUFyQixDQU5ZO0FBT1osaUJBQUssZ0JBQUwsR0FBd0IsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixVQUFwQixDQUF4QixDQVBZO0FBUVosaUJBQUsscUJBQUwsR0FBNkIsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixvQkFBcEIsQ0FBN0IsQ0FSWTs7QUFVWixpQkFBSyxTQUFMLEdBQWlCLEVBQUUsVUFBRixDQUFqQixDQVZZOzs7O3NDQWFGOzs7QUFDVixnQkFBSSxjQUFjLEtBQWQsQ0FETTtBQUVWLGNBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsWUFBTTtBQUNuQixvQkFBRyxFQUFFLE1BQUYsRUFBVSxTQUFWLE1BQXlCLE1BQUssZ0JBQUwsRUFBdUI7QUFDL0Msd0JBQUcsQ0FBQyxXQUFELEVBQWE7QUFDWiw4QkFBSyxPQUFMLENBQWEsUUFBYixDQUFzQixPQUF0QixFQURZO0FBRVosc0NBQWMsSUFBZCxDQUZZO3FCQUFoQjtpQkFESixNQUtPO0FBQ0gsd0JBQUcsV0FBSCxFQUFlO0FBQ1gsOEJBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsT0FBekIsRUFEVztBQUVYLHNDQUFjLEtBQWQsQ0FGVztxQkFBZjtpQkFOSjthQURhLENBQWpCLENBRlU7Ozs7d0NBaUJFOzs7QUFDWixnQkFBSSxPQUFPLElBQVAsQ0FEUTtBQUVaLGlCQUFLLGdCQUFMLENBQXNCLEVBQXRCLENBQXlCLE9BQXpCLEVBQWtDLGFBQUs7QUFDbkMsa0JBQUUsZUFBRixHQURtQztBQUVuQyx1QkFBSyxTQUFMLENBQWUsV0FBZixDQUEyQixNQUEzQixFQUZtQzthQUFMLENBQWxDLENBRlk7QUFNWixpQkFBSyxhQUFMLENBQW1CLEVBQW5CLENBQXNCLE9BQXRCLEVBQStCLFlBQVU7QUFDckMsb0JBQUksWUFBWSxFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsTUFBYixFQUFxQixPQUFyQixDQUE2QixHQUE3QixFQUFrQyxFQUFsQyxDQUFaLENBRGlDO0FBRXJDLHFCQUFLLGNBQUwsQ0FBb0IsU0FBcEIsRUFGcUM7QUFHckMscUJBQUssaUJBQUwsQ0FBdUIsU0FBdkIsRUFIcUM7QUFJckMscUJBQUssV0FBTCxHQUFtQixJQUFuQixDQUpxQztBQUtyQywyQkFBVzsyQkFBTSxLQUFLLFdBQUwsR0FBbUIsS0FBbkI7aUJBQU4sRUFBZ0MsR0FBM0MsRUFMcUM7YUFBVixDQUEvQixDQU5ZO0FBYVosY0FBRSxNQUFGLEVBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0I7dUJBQU0sT0FBSyxTQUFMLENBQWUsV0FBZixDQUEyQixNQUEzQjthQUFOLENBQXRCLENBYlk7Ozs7K0NBZ0JPO0FBQ25CLGdCQUFJLE9BQU8sSUFBUCxDQURlO0FBRW5CLGlCQUFLLGdCQUFMLEdBQXdCLEVBQXhCLENBRm1CO0FBR25CLGlCQUFLLGtCQUFMLEdBQTBCLEVBQTFCLENBSG1CO0FBSW5CLGlCQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLFlBQVU7QUFDMUIsb0JBQUksWUFBWSxFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsSUFBYixFQUFtQixPQUFuQixDQUEyQixVQUEzQixFQUF1QyxFQUF2QyxDQUFaO29CQUNBLEtBQUssRUFBRSxJQUFGLEVBQVEsTUFBUixHQUFpQixHQUFqQixHQUF1QixLQUFLLFlBQUwsQ0FGTjtBQUcxQixxQkFBSyxnQkFBTCxDQUFzQixTQUF0QixJQUFtQyxFQUFuQyxDQUgwQjtBQUkxQixxQkFBSyxrQkFBTCxDQUF3QixJQUF4QixDQUE2QixFQUE3QixFQUowQjthQUFWLENBQXBCLENBSm1CO0FBVW5CLGlCQUFLLGtCQUFMLENBQXdCLElBQXhCLENBQTZCLFVBQUMsQ0FBRCxFQUFJLENBQUo7dUJBQVUsSUFBSSxDQUFKO2FBQVYsQ0FBN0IsQ0FWbUI7Ozs7eUNBYU47OztBQUNiLGlCQUFLLG9CQUFMLEdBRGE7QUFFYixpQkFBSyxjQUFMLEdBQXNCLEVBQXRCLENBRmE7QUFHYixpQkFBSyxXQUFMLEdBQW1CLEtBQW5CLENBSGE7QUFJYixnQkFBSSxLQUFLLEVBQUUsTUFBRixFQUFVLE1BQVYsS0FBcUIsQ0FBckI7Z0JBQ0wsYUFBYSxFQUFiLENBTFM7QUFNYixjQUFFLE1BQUYsRUFBVSxNQUFWLENBQWlCLFlBQU07QUFDbkIsb0JBQUksQ0FBQyxPQUFLLFdBQUwsRUFBa0I7Ozs7QUFDbkIsNEJBQUksaUJBQWlCLEVBQUUsTUFBRixFQUFVLFNBQVYsRUFBakI7QUFDSiw0QkFBSSxLQUFLLGVBQUssR0FBTCxpQ0FBWSxPQUFLLGtCQUFMLENBQXdCLE1BQXhCLENBQStCO21DQUFLLEtBQUssaUJBQWlCLEVBQWpCO3lCQUFWLEVBQTNDLENBQUw7QUFDSiw2QkFBSyxJQUFJLENBQUosSUFBUyxPQUFLLGdCQUFMLEVBQXVCO0FBQ2pDLGdDQUFHLE9BQUssZ0JBQUwsQ0FBc0IsY0FBdEIsQ0FBcUMsQ0FBckMsQ0FBSCxFQUE0QztBQUN4QyxvQ0FBSSxPQUFLLGdCQUFMLENBQXNCLENBQXRCLEtBQTRCLEVBQTVCLEVBQWdDO0FBQ2hDLGlEQUFhLENBQWIsQ0FEZ0M7QUFFaEMsMENBRmdDO2lDQUFwQzs2QkFESjt5QkFESjtBQVFBLDRCQUFJLGNBQWMsT0FBSyxjQUFMLEVBQXFCO0FBQ25DLG1DQUFLLGlCQUFMLENBQXVCLFVBQXZCLEVBRG1DO0FBRW5DLG1DQUFLLGNBQUwsR0FBc0IsVUFBdEIsQ0FGbUM7eUJBQXZDO3lCQVhtQjtpQkFBdkI7YUFEYSxDQUFqQixDQU5hO0FBd0JiLGNBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsS0FBSyxvQkFBTCxDQUFqQixDQXhCYTs7Ozt1Q0EyQkYsV0FBVztBQUN0QixjQUFFLFdBQUYsRUFBZSxPQUFmLENBQXVCO0FBQ25CLDJCQUFXLEtBQUssZ0JBQUwsQ0FBc0IsU0FBdEIsQ0FBWDtBQUNBLDBCQUFVLEtBQUssY0FBTDthQUZkLEVBRHNCOzs7OzBDQU9SLFdBQVc7QUFDekIsZ0JBQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsZUFBcUMsaUJBQXJDLENBQVosQ0FEcUI7QUFFekIsZ0JBQUcsVUFBVSxNQUFWLEdBQW1CLENBQW5CLEVBQXNCO0FBQ3JCLG9CQUFJLGdCQUFnQixVQUFVLEtBQVYsRUFBaEI7b0JBQ0EsZUFBZSxVQUFVLE1BQVYsR0FBbUIsSUFBbkIsR0FBMEIsS0FBSyxTQUFMLENBQWUsTUFBZixHQUF3QixJQUF4QixDQUZ4QjtBQUdyQixxQkFBSyxhQUFMLENBQW1CLFdBQW5CLENBQStCLFFBQS9CLEVBSHFCO0FBSXJCLDBCQUFVLFFBQVYsQ0FBbUIsUUFBbkIsRUFKcUI7QUFLckIscUJBQUsscUJBQUwsQ0FDSyxXQURMLENBQ2lCLFNBRGpCLEVBRUssR0FGTCxDQUVTO0FBQ0QsMEJBQU0sWUFBTjtBQUNBLDJCQUFPLGFBQVA7aUJBSlIsRUFMcUI7YUFBekIsTUFXTztBQUNILHFCQUFLLHFCQUFMLENBQTJCLFFBQTNCLENBQW9DLFNBQXBDLEVBREc7YUFYUDs7OztXQTFHRjs7O0FBNEhOLEVBQUUsWUFBVTtBQUNSLFFBQUksR0FBSixHQURRO0FBRVIsOEJBRlE7Q0FBVixDQUFGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiAgalF1ZXJ5IE93bENhcm91c2VsIHYxLjMuM1xuICpcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTMgQmFydG9zeiBXb2pjaWVjaG93c2tpXG4gKiAgaHR0cDovL3d3dy5vd2xncmFwaGljLmNvbS9vd2xjYXJvdXNlbC9cbiAqXG4gKiAgTGljZW5zZWQgdW5kZXIgTUlUXG4gKlxuICovXG5cbi8qSlMgTGludCBoZWxwZXJzOiAqL1xuLypnbG9iYWwgZHJhZ01vdmU6IGZhbHNlLCBkcmFnRW5kOiBmYWxzZSwgJCwgalF1ZXJ5LCBhbGVydCwgd2luZG93LCBkb2N1bWVudCAqL1xuLypqc2xpbnQgbm9tZW46IHRydWUsIGNvbnRpbnVlOnRydWUgKi9cblxuaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBmdW5jdGlvbiBGKCkge31cbiAgICAgICAgRi5wcm90b3R5cGUgPSBvYmo7XG4gICAgICAgIHJldHVybiBuZXcgRigpO1xuICAgIH07XG59XG4oZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQpIHtcblxuICAgIHZhciBDYXJvdXNlbCA9IHtcbiAgICAgICAgaW5pdCA6IGZ1bmN0aW9uIChvcHRpb25zLCBlbCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBiYXNlLiRlbGVtID0gJChlbCk7XG4gICAgICAgICAgICBiYXNlLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJC5mbi5vd2xDYXJvdXNlbC5vcHRpb25zLCBiYXNlLiRlbGVtLmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGJhc2UudXNlck9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICAgICAgYmFzZS5sb2FkQ29udGVudCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRDb250ZW50IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLCB1cmw7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldERhdGEoZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBpLCBjb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5qc29uU3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5qc29uU3VjY2Vzcy5hcHBseSh0aGlzLCBbZGF0YV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSBpbiBkYXRhLm93bCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEub3dsLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCArPSBkYXRhLm93bFtpXS5pdGVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uaHRtbChjb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmFzZS5sb2dJbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5iZWZvcmVJbml0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYmVmb3JlSW5pdC5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5qc29uUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHVybCA9IGJhc2Uub3B0aW9ucy5qc29uUGF0aDtcbiAgICAgICAgICAgICAgICAkLmdldEpTT04odXJsLCBnZXREYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5sb2dJbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvZ0luIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBiYXNlLiRlbGVtLmRhdGEoe1xuICAgICAgICAgICAgICAgIFwib3dsLW9yaWdpbmFsU3R5bGVzXCI6IGJhc2UuJGVsZW0uYXR0cihcInN0eWxlXCIpLFxuICAgICAgICAgICAgICAgIFwib3dsLW9yaWdpbmFsQ2xhc3Nlc1wiOiBiYXNlLiRlbGVtLmF0dHIoXCJjbGFzc1wiKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJhc2UuJGVsZW0uY3NzKHtvcGFjaXR5OiAwfSk7XG4gICAgICAgICAgICBiYXNlLm9yaWduYWxJdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtcztcbiAgICAgICAgICAgIGJhc2UuY2hlY2tCcm93c2VyKCk7XG4gICAgICAgICAgICBiYXNlLndyYXBwZXJXaWR0aCA9IDA7XG4gICAgICAgICAgICBiYXNlLmNoZWNrVmlzaWJsZSA9IG51bGw7XG4gICAgICAgICAgICBiYXNlLnNldFZhcnMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRWYXJzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2UuJGVsZW0uY2hpbGRyZW4oKS5sZW5ndGggPT09IDApIHtyZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIGJhc2UuYmFzZUNsYXNzKCk7XG4gICAgICAgICAgICBiYXNlLmV2ZW50VHlwZXMoKTtcbiAgICAgICAgICAgIGJhc2UuJHVzZXJJdGVtcyA9IGJhc2UuJGVsZW0uY2hpbGRyZW4oKTtcbiAgICAgICAgICAgIGJhc2UuaXRlbXNBbW91bnQgPSBiYXNlLiR1c2VySXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgYmFzZS53cmFwSXRlbXMoKTtcbiAgICAgICAgICAgIGJhc2UuJG93bEl0ZW1zID0gYmFzZS4kZWxlbS5maW5kKFwiLm93bC1pdGVtXCIpO1xuICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlciA9IGJhc2UuJGVsZW0uZmluZChcIi5vd2wtd3JhcHBlclwiKTtcbiAgICAgICAgICAgIGJhc2UucGxheURpcmVjdGlvbiA9IFwibmV4dFwiO1xuICAgICAgICAgICAgYmFzZS5wcmV2SXRlbSA9IDA7XG4gICAgICAgICAgICBiYXNlLnByZXZBcnIgPSBbMF07XG4gICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gMDtcbiAgICAgICAgICAgIGJhc2UuY3VzdG9tRXZlbnRzKCk7XG4gICAgICAgICAgICBiYXNlLm9uU3RhcnR1cCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU3RhcnR1cCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UudXBkYXRlSXRlbXMoKTtcbiAgICAgICAgICAgIGJhc2UuY2FsY3VsYXRlQWxsKCk7XG4gICAgICAgICAgICBiYXNlLmJ1aWxkQ29udHJvbHMoKTtcbiAgICAgICAgICAgIGJhc2UudXBkYXRlQ29udHJvbHMoKTtcbiAgICAgICAgICAgIGJhc2UucmVzcG9uc2UoKTtcbiAgICAgICAgICAgIGJhc2UubW92ZUV2ZW50cygpO1xuICAgICAgICAgICAgYmFzZS5zdG9wT25Ib3ZlcigpO1xuICAgICAgICAgICAgYmFzZS5vd2xTdGF0dXMoKTtcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy50cmFuc2l0aW9uU3R5bGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS50cmFuc2l0aW9uVHlwZXMoYmFzZS5vcHRpb25zLnRyYW5zaXRpb25TdHlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9QbGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmF1dG9QbGF5ID0gNTAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UucGxheSgpO1xuXG4gICAgICAgICAgICBiYXNlLiRlbGVtLmZpbmQoXCIub3dsLXdyYXBwZXJcIikuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xuXG4gICAgICAgICAgICBpZiAoIWJhc2UuJGVsZW0uaXMoXCI6dmlzaWJsZVwiKSkge1xuICAgICAgICAgICAgICAgIGJhc2Uud2F0Y2hWaXNpYmlsaXR5KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uY3NzKFwib3BhY2l0eVwiLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2Uub25zdGFydHVwID0gZmFsc2U7XG4gICAgICAgICAgICBiYXNlLmVhY2hNb3ZlVXBkYXRlKCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5hZnRlckluaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hZnRlckluaXQuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlYWNoTW92ZVVwZGF0ZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5sYXp5TG9hZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UubGF6eUxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b0hlaWdodCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuYXV0b0hlaWdodCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5vblZpc2libGVJdGVtcygpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5hZnRlckFjdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmFmdGVyQWN0aW9uLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlVmFycyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmJlZm9yZVVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmJlZm9yZVVwZGF0ZS5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS53YXRjaFZpc2liaWxpdHkoKTtcbiAgICAgICAgICAgIGJhc2UudXBkYXRlSXRlbXMoKTtcbiAgICAgICAgICAgIGJhc2UuY2FsY3VsYXRlQWxsKCk7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZUNvbnRyb2xzKCk7XG4gICAgICAgICAgICBiYXNlLmVhY2hNb3ZlVXBkYXRlKCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5hZnRlclVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmFmdGVyVXBkYXRlLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVsb2FkIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhc2UudXBkYXRlVmFycygpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2F0Y2hWaXNpYmlsaXR5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5pcyhcIjp2aXNpYmxlXCIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uY3NzKHtvcGFjaXR5OiAwfSk7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5hdXRvUGxheUludGVydmFsKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmNoZWNrVmlzaWJsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuY2hlY2tWaXNpYmxlID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5pcyhcIjp2aXNpYmxlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uYW5pbWF0ZSh7b3BhY2l0eTogMX0sIDIwMCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuY2hlY2tWaXNpYmxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdyYXBJdGVtcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuJHVzZXJJdGVtcy53cmFwQWxsKFwiPGRpdiBjbGFzcz1cXFwib3dsLXdyYXBwZXJcXFwiPlwiKS53cmFwKFwiPGRpdiBjbGFzcz1cXFwib3dsLWl0ZW1cXFwiPjwvZGl2PlwiKTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0uZmluZChcIi5vd2wtd3JhcHBlclwiKS53cmFwKFwiPGRpdiBjbGFzcz1cXFwib3dsLXdyYXBwZXItb3V0ZXJcXFwiPlwiKTtcbiAgICAgICAgICAgIGJhc2Uud3JhcHBlck91dGVyID0gYmFzZS4kZWxlbS5maW5kKFwiLm93bC13cmFwcGVyLW91dGVyXCIpO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmFzZUNsYXNzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGhhc0Jhc2VDbGFzcyA9IGJhc2UuJGVsZW0uaGFzQ2xhc3MoYmFzZS5vcHRpb25zLmJhc2VDbGFzcyksXG4gICAgICAgICAgICAgICAgaGFzVGhlbWVDbGFzcyA9IGJhc2UuJGVsZW0uaGFzQ2xhc3MoYmFzZS5vcHRpb25zLnRoZW1lKTtcblxuICAgICAgICAgICAgaWYgKCFoYXNCYXNlQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5iYXNlQ2xhc3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWhhc1RoZW1lQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmFkZENsYXNzKGJhc2Uub3B0aW9ucy50aGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlSXRlbXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsIHdpZHRoLCBpO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnJlc3BvbnNpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5zaW5nbGVJdGVtID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcmlnbmFsSXRlbXMgPSAxO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc0N1c3RvbSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wU21hbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXRTbWFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc01vYmlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2lkdGggPSAkKGJhc2Uub3B0aW9ucy5yZXNwb25zaXZlQmFzZVdpZHRoKS53aWR0aCgpO1xuXG4gICAgICAgICAgICBpZiAod2lkdGggPiAoYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFswXSB8fCBiYXNlLm9yaWduYWxJdGVtcykpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9yaWduYWxJdGVtcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuaXRlbXNDdXN0b20gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgLy9SZW9yZGVyIGFycmF5IGJ5IHNjcmVlbiBzaXplXG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zQ3VzdG9tLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtyZXR1cm4gYVswXSAtIGJbMF07IH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJhc2Uub3B0aW9ucy5pdGVtc0N1c3RvbS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLml0ZW1zQ3VzdG9tW2ldWzBdIDw9IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNDdXN0b21baV1bMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPD0gYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFswXSAmJiBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wWzFdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA8PSBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wU21hbGxbMF0gJiYgYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFNtYWxsICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wU21hbGxbMV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDw9IGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFswXSAmJiBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFsxXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPD0gYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0U21hbGxbMF0gJiYgYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0U21hbGwgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFNtYWxsWzFdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA8PSBiYXNlLm9wdGlvbnMuaXRlbXNNb2JpbGVbMF0gJiYgYmFzZS5vcHRpb25zLml0ZW1zTW9iaWxlICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNNb2JpbGVbMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2lmIG51bWJlciBvZiBpdGVtcyBpcyBsZXNzIHRoYW4gZGVjbGFyZWRcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuaXRlbXMgPiBiYXNlLml0ZW1zQW1vdW50ICYmIGJhc2Uub3B0aW9ucy5pdGVtc1NjYWxlVXAgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLml0ZW1zQW1vdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlc3BvbnNlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHNtYWxsRGVsYXksXG4gICAgICAgICAgICAgICAgbGFzdFdpbmRvd1dpZHRoO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnJlc3BvbnNpdmUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0V2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcblxuICAgICAgICAgICAgYmFzZS5yZXNpemVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSAhPT0gbGFzdFdpbmRvd1dpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmF1dG9QbGF5SW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoc21hbGxEZWxheSk7XG4gICAgICAgICAgICAgICAgICAgIHNtYWxsRGVsYXkgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0V2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UudXBkYXRlVmFycygpO1xuICAgICAgICAgICAgICAgICAgICB9LCBiYXNlLm9wdGlvbnMucmVzcG9uc2l2ZVJlZnJlc2hSYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShiYXNlLnJlc2l6ZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5qdW1wVG8oYmFzZS5jdXJyZW50SXRlbSk7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9QbGF5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuY2hlY2tBcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZEl0ZW1zU2l6ZXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcm91bmRQYWdlcyA9IDAsXG4gICAgICAgICAgICAgICAgbGFzdEl0ZW0gPSBiYXNlLml0ZW1zQW1vdW50IC0gYmFzZS5vcHRpb25zLml0ZW1zO1xuXG4gICAgICAgICAgICBiYXNlLiRvd2xJdGVtcy5lYWNoKGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgJHRoaXNcbiAgICAgICAgICAgICAgICAgICAgLmNzcyh7XCJ3aWR0aFwiOiBiYXNlLml0ZW1XaWR0aH0pXG4gICAgICAgICAgICAgICAgICAgIC5kYXRhKFwib3dsLWl0ZW1cIiwgTnVtYmVyKGluZGV4KSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggJSBiYXNlLm9wdGlvbnMuaXRlbXMgPT09IDAgfHwgaW5kZXggPT09IGxhc3RJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghKGluZGV4ID4gbGFzdEl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3VuZFBhZ2VzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YShcIm93bC1yb3VuZFBhZ2VzXCIsIHJvdW5kUGFnZXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kV3JhcHBlclNpemVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHdpZHRoID0gYmFzZS4kb3dsSXRlbXMubGVuZ3RoICogYmFzZS5pdGVtV2lkdGg7XG5cbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKHtcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHdpZHRoICogMixcbiAgICAgICAgICAgICAgICBcImxlZnRcIjogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmFwcGVuZEl0ZW1zU2l6ZXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxjdWxhdGVBbGwgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLmNhbGN1bGF0ZVdpZHRoKCk7XG4gICAgICAgICAgICBiYXNlLmFwcGVuZFdyYXBwZXJTaXplcygpO1xuICAgICAgICAgICAgYmFzZS5sb29wcygpO1xuICAgICAgICAgICAgYmFzZS5tYXgoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxjdWxhdGVXaWR0aCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuaXRlbVdpZHRoID0gTWF0aC5yb3VuZChiYXNlLiRlbGVtLndpZHRoKCkgLyBiYXNlLm9wdGlvbnMuaXRlbXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1heCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBtYXhpbXVtID0gKChiYXNlLml0ZW1zQW1vdW50ICogYmFzZS5pdGVtV2lkdGgpIC0gYmFzZS5vcHRpb25zLml0ZW1zICogYmFzZS5pdGVtV2lkdGgpICogLTE7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLml0ZW1zID4gYmFzZS5pdGVtc0Ftb3VudCkge1xuICAgICAgICAgICAgICAgIGJhc2UubWF4aW11bUl0ZW0gPSAwO1xuICAgICAgICAgICAgICAgIG1heGltdW0gPSAwO1xuICAgICAgICAgICAgICAgIGJhc2UubWF4aW11bVBpeGVscyA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UubWF4aW11bUl0ZW0gPSBiYXNlLml0ZW1zQW1vdW50IC0gYmFzZS5vcHRpb25zLml0ZW1zO1xuICAgICAgICAgICAgICAgIGJhc2UubWF4aW11bVBpeGVscyA9IG1heGltdW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF4aW11bTtcbiAgICAgICAgfSxcblxuICAgICAgICBtaW4gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSxcblxuICAgICAgICBsb29wcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBwcmV2ID0gMCxcbiAgICAgICAgICAgICAgICBlbFdpZHRoID0gMCxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgcm91bmRQYWdlTnVtO1xuXG4gICAgICAgICAgICBiYXNlLnBvc2l0aW9uc0luQXJyYXkgPSBbMF07XG4gICAgICAgICAgICBiYXNlLnBhZ2VzSW5BcnJheSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYmFzZS5pdGVtc0Ftb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZWxXaWR0aCArPSBiYXNlLml0ZW1XaWR0aDtcbiAgICAgICAgICAgICAgICBiYXNlLnBvc2l0aW9uc0luQXJyYXkucHVzaCgtZWxXaWR0aCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbSA9ICQoYmFzZS4kb3dsSXRlbXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICByb3VuZFBhZ2VOdW0gPSBpdGVtLmRhdGEoXCJvd2wtcm91bmRQYWdlc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdW5kUGFnZU51bSAhPT0gcHJldikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5wYWdlc0luQXJyYXlbcHJldl0gPSBiYXNlLnBvc2l0aW9uc0luQXJyYXlbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gcm91bmRQYWdlTnVtO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkQ29udHJvbHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLm5hdmlnYXRpb24gPT09IHRydWUgfHwgYmFzZS5vcHRpb25zLnBhZ2luYXRpb24gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm93bENvbnRyb2xzID0gJChcIjxkaXYgY2xhc3M9XFxcIm93bC1jb250cm9sc1xcXCIvPlwiKS50b2dnbGVDbGFzcyhcImNsaWNrYWJsZVwiLCAhYmFzZS5icm93c2VyLmlzVG91Y2gpLmFwcGVuZFRvKGJhc2UuJGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5idWlsZFBhZ2luYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubmF2aWdhdGlvbiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuYnVpbGRCdXR0b25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRCdXR0b25zIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGJ1dHRvbnNXcmFwcGVyID0gJChcIjxkaXYgY2xhc3M9XFxcIm93bC1idXR0b25zXFxcIi8+XCIpO1xuICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5hcHBlbmQoYnV0dG9uc1dyYXBwZXIpO1xuXG4gICAgICAgICAgICBiYXNlLmJ1dHRvblByZXYgPSAkKFwiPGRpdi8+XCIsIHtcbiAgICAgICAgICAgICAgICBcImNsYXNzXCIgOiBcIm93bC1wcmV2XCIsXG4gICAgICAgICAgICAgICAgXCJodG1sXCIgOiBiYXNlLm9wdGlvbnMubmF2aWdhdGlvblRleHRbMF0gfHwgXCJcIlxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJhc2UuYnV0dG9uTmV4dCA9ICQoXCI8ZGl2Lz5cIiwge1xuICAgICAgICAgICAgICAgIFwiY2xhc3NcIiA6IFwib3dsLW5leHRcIixcbiAgICAgICAgICAgICAgICBcImh0bWxcIiA6IGJhc2Uub3B0aW9ucy5uYXZpZ2F0aW9uVGV4dFsxXSB8fCBcIlwiXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYnV0dG9uc1dyYXBwZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKGJhc2UuYnV0dG9uUHJldilcbiAgICAgICAgICAgICAgICAuYXBwZW5kKGJhc2UuYnV0dG9uTmV4dCk7XG5cbiAgICAgICAgICAgIGJ1dHRvbnNXcmFwcGVyLm9uKFwidG91Y2hzdGFydC5vd2xDb250cm9scyBtb3VzZWRvd24ub3dsQ29udHJvbHNcIiwgXCJkaXZbY2xhc3NePVxcXCJvd2xcXFwiXVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJ1dHRvbnNXcmFwcGVyLm9uKFwidG91Y2hlbmQub3dsQ29udHJvbHMgbW91c2V1cC5vd2xDb250cm9sc1wiLCBcImRpdltjbGFzc149XFxcIm93bFxcXCJdXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoXCJvd2wtbmV4dFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm5leHQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnByZXYoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZFBhZ2luYXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz1cXFwib3dsLXBhZ2luYXRpb25cXFwiLz5cIik7XG4gICAgICAgICAgICBiYXNlLm93bENvbnRyb2xzLmFwcGVuZChiYXNlLnBhZ2luYXRpb25XcmFwcGVyKTtcblxuICAgICAgICAgICAgYmFzZS5wYWdpbmF0aW9uV3JhcHBlci5vbihcInRvdWNoZW5kLm93bENvbnRyb2xzIG1vdXNldXAub3dsQ29udHJvbHNcIiwgXCIub3dsLXBhZ2VcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoTnVtYmVyKCQodGhpcykuZGF0YShcIm93bC1wYWdlXCIpKSAhPT0gYmFzZS5jdXJyZW50SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmdvVG8oTnVtYmVyKCQodGhpcykuZGF0YShcIm93bC1wYWdlXCIpKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlUGFnaW5hdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb3VudGVyLFxuICAgICAgICAgICAgICAgIGxhc3RQYWdlLFxuICAgICAgICAgICAgICAgIGxhc3RJdGVtLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbixcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uSW5uZXI7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucGFnaW5hdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXIuaHRtbChcIlwiKTtcblxuICAgICAgICAgICAgY291bnRlciA9IDA7XG4gICAgICAgICAgICBsYXN0UGFnZSA9IGJhc2UuaXRlbXNBbW91bnQgLSBiYXNlLml0ZW1zQW1vdW50ICUgYmFzZS5vcHRpb25zLml0ZW1zO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYmFzZS5pdGVtc0Ftb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgJSBiYXNlLm9wdGlvbnMuaXRlbXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFBhZ2UgPT09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RJdGVtID0gYmFzZS5pdGVtc0Ftb3VudCAtIGJhc2Uub3B0aW9ucy5pdGVtcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uID0gJChcIjxkaXYvPlwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzXCIgOiBcIm93bC1wYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b25Jbm5lciA9ICQoXCI8c3Bhbj48L3NwYW4+XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGV4dFwiOiBiYXNlLm9wdGlvbnMucGFnaW5hdGlvbk51bWJlcnMgPT09IHRydWUgPyBjb3VudGVyIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NcIjogYmFzZS5vcHRpb25zLnBhZ2luYXRpb25OdW1iZXJzID09PSB0cnVlID8gXCJvd2wtbnVtYmVyc1wiIDogXCJcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbi5hcHBlbmQocGFnaW5hdGlvbkJ1dHRvbklubmVyKTtcblxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uLmRhdGEoXCJvd2wtcGFnZVwiLCBsYXN0UGFnZSA9PT0gaSA/IGxhc3RJdGVtIDogaSk7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b24uZGF0YShcIm93bC1yb3VuZFBhZ2VzXCIsIGNvdW50ZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXIuYXBwZW5kKHBhZ2luYXRpb25CdXR0b24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuY2hlY2tQYWdpbmF0aW9uKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNoZWNrUGFnaW5hdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucGFnaW5hdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLnBhZ2luYXRpb25XcmFwcGVyLmZpbmQoXCIub3dsLXBhZ2VcIikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcykuZGF0YShcIm93bC1yb3VuZFBhZ2VzXCIpID09PSAkKGJhc2UuJG93bEl0ZW1zW2Jhc2UuY3VycmVudEl0ZW1dKS5kYXRhKFwib3dsLXJvdW5kUGFnZXNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5wYWdpbmF0aW9uV3JhcHBlclxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoXCIub3dsLXBhZ2VcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjaGVja05hdmlnYXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubmF2aWdhdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnJld2luZE5hdiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5jdXJyZW50SXRlbSA9PT0gMCAmJiBiYXNlLm1heGltdW1JdGVtID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uUHJldi5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvbk5leHQuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UuY3VycmVudEl0ZW0gPT09IDAgJiYgYmFzZS5tYXhpbXVtSXRlbSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvblByZXYuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25OZXh0LnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLmN1cnJlbnRJdGVtID09PSBiYXNlLm1heGltdW1JdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uUHJldi5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvbk5leHQuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UuY3VycmVudEl0ZW0gIT09IDAgJiYgYmFzZS5jdXJyZW50SXRlbSAhPT0gYmFzZS5tYXhpbXVtSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvblByZXYucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25OZXh0LnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZUNvbnRyb2xzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS51cGRhdGVQYWdpbmF0aW9uKCk7XG4gICAgICAgICAgICBiYXNlLmNoZWNrTmF2aWdhdGlvbigpO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3dsQ29udHJvbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLml0ZW1zID49IGJhc2UuaXRlbXNBbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3lDb250cm9scyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLm93bENvbnRyb2xzKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0IDogZnVuY3Rpb24gKHNwZWVkKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLmlzVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSArPSBiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSA/IGJhc2Uub3B0aW9ucy5pdGVtcyA6IDE7XG4gICAgICAgICAgICBpZiAoYmFzZS5jdXJyZW50SXRlbSA+IGJhc2UubWF4aW11bUl0ZW0gKyAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUgPyAoYmFzZS5vcHRpb25zLml0ZW1zIC0gMSkgOiAwKSkge1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucmV3aW5kTmF2ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBzcGVlZCA9IFwicmV3aW5kXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmdvVG8oYmFzZS5jdXJyZW50SXRlbSwgc3BlZWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXYgOiBmdW5jdGlvbiAoc3BlZWQpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKGJhc2UuaXNUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUgJiYgYmFzZS5jdXJyZW50SXRlbSA+IDAgJiYgYmFzZS5jdXJyZW50SXRlbSA8IGJhc2Uub3B0aW9ucy5pdGVtcykge1xuICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtIC09IGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlID8gYmFzZS5vcHRpb25zLml0ZW1zIDogMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLmN1cnJlbnRJdGVtIDwgMCkge1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucmV3aW5kTmF2ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBiYXNlLm1heGltdW1JdGVtO1xuICAgICAgICAgICAgICAgICAgICBzcGVlZCA9IFwicmV3aW5kXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmdvVG8oYmFzZS5jdXJyZW50SXRlbSwgc3BlZWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdvVG8gOiBmdW5jdGlvbiAocG9zaXRpb24sIHNwZWVkLCBkcmFnKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZ29Ub1BpeGVsO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5pc1RyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5iZWZvcmVNb3ZlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYmVmb3JlTW92ZS5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uID49IGJhc2UubWF4aW11bUl0ZW0pIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uIDw9IDApIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBiYXNlLm93bC5jdXJyZW50SXRlbSA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy50cmFuc2l0aW9uU3R5bGUgIT09IGZhbHNlICYmIGRyYWcgIT09IFwiZHJhZ1wiICYmIGJhc2Uub3B0aW9ucy5pdGVtcyA9PT0gMSAmJiBiYXNlLmJyb3dzZXIuc3VwcG9ydDNkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5zd2FwU3BlZWQoMCk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5zdXBwb3J0M2QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS50cmFuc2l0aW9uM2QoYmFzZS5wb3NpdGlvbnNJbkFycmF5W3Bvc2l0aW9uXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jc3Myc2xpZGUoYmFzZS5wb3NpdGlvbnNJbkFycmF5W3Bvc2l0aW9uXSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJhc2UuYWZ0ZXJHbygpO1xuICAgICAgICAgICAgICAgIGJhc2Uuc2luZ2xlSXRlbVRyYW5zaXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnb1RvUGl4ZWwgPSBiYXNlLnBvc2l0aW9uc0luQXJyYXlbcG9zaXRpb25dO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5icm93c2VyLnN1cHBvcnQzZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuaXNDc3MzRmluaXNoID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3BlZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5zd2FwU3BlZWQoXCJwYWdpbmF0aW9uU3BlZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuaXNDc3MzRmluaXNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgYmFzZS5vcHRpb25zLnBhZ2luYXRpb25TcGVlZCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSBcInJld2luZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uuc3dhcFNwZWVkKGJhc2Uub3B0aW9ucy5yZXdpbmRTcGVlZCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuaXNDc3MzRmluaXNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgYmFzZS5vcHRpb25zLnJld2luZFNwZWVkKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uuc3dhcFNwZWVkKFwic2xpZGVTcGVlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5pc0NzczNGaW5pc2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9LCBiYXNlLm9wdGlvbnMuc2xpZGVTcGVlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJhc2UudHJhbnNpdGlvbjNkKGdvVG9QaXhlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzcGVlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNzczJzbGlkZShnb1RvUGl4ZWwsIGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uU3BlZWQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IFwicmV3aW5kXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jc3Myc2xpZGUoZ29Ub1BpeGVsLCBiYXNlLm9wdGlvbnMucmV3aW5kU3BlZWQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3NzMnNsaWRlKGdvVG9QaXhlbCwgYmFzZS5vcHRpb25zLnNsaWRlU3BlZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuYWZ0ZXJHbygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGp1bXBUbyA6IGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYmVmb3JlTW92ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmJlZm9yZU1vdmUuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbiA+PSBiYXNlLm1heGltdW1JdGVtIHx8IHBvc2l0aW9uID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gYmFzZS5tYXhpbXVtSXRlbTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPD0gMCkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2Uuc3dhcFNwZWVkKDApO1xuICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5zdXBwb3J0M2QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnRyYW5zaXRpb24zZChiYXNlLnBvc2l0aW9uc0luQXJyYXlbcG9zaXRpb25dKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5jc3Myc2xpZGUoYmFzZS5wb3NpdGlvbnNJbkFycmF5W3Bvc2l0aW9uXSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gYmFzZS5vd2wuY3VycmVudEl0ZW0gPSBwb3NpdGlvbjtcbiAgICAgICAgICAgIGJhc2UuYWZ0ZXJHbygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFmdGVyR28gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UucHJldkFyci5wdXNoKGJhc2UuY3VycmVudEl0ZW0pO1xuICAgICAgICAgICAgYmFzZS5wcmV2SXRlbSA9IGJhc2Uub3dsLnByZXZJdGVtID0gYmFzZS5wcmV2QXJyW2Jhc2UucHJldkFyci5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgIGJhc2UucHJldkFyci5zaGlmdCgwKTtcblxuICAgICAgICAgICAgaWYgKGJhc2UucHJldkl0ZW0gIT09IGJhc2UuY3VycmVudEl0ZW0pIHtcbiAgICAgICAgICAgICAgICBiYXNlLmNoZWNrUGFnaW5hdGlvbigpO1xuICAgICAgICAgICAgICAgIGJhc2UuY2hlY2tOYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgYmFzZS5lYWNoTW92ZVVwZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hdXRvUGxheSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jaGVja0FwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYWZ0ZXJNb3ZlID09PSBcImZ1bmN0aW9uXCIgJiYgYmFzZS5wcmV2SXRlbSAhPT0gYmFzZS5jdXJyZW50SXRlbSkge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hZnRlck1vdmUuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5hcFN0YXR1cyA9IFwic3RvcFwiO1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5hdXRvUGxheUludGVydmFsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjaGVja0FwIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2UuYXBTdGF0dXMgIT09IFwic3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGxheSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuYXBTdGF0dXMgPSBcInBsYXlcIjtcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5hdXRvUGxheUludGVydmFsKTtcbiAgICAgICAgICAgIGJhc2UuYXV0b1BsYXlJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXh0KHRydWUpO1xuICAgICAgICAgICAgfSwgYmFzZS5vcHRpb25zLmF1dG9QbGF5KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzd2FwU3BlZWQgOiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSBcInNsaWRlU3BlZWRcIikge1xuICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKGJhc2UuYWRkQ3NzU3BlZWQoYmFzZS5vcHRpb25zLnNsaWRlU3BlZWQpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSBcInBhZ2luYXRpb25TcGVlZFwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5jc3MoYmFzZS5hZGRDc3NTcGVlZChiYXNlLm9wdGlvbnMucGFnaW5hdGlvblNwZWVkKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhY3Rpb24gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmNzcyhiYXNlLmFkZENzc1NwZWVkKGFjdGlvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFkZENzc1NwZWVkIDogZnVuY3Rpb24gKHNwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwiLXdlYmtpdC10cmFuc2l0aW9uXCI6IFwiYWxsIFwiICsgc3BlZWQgKyBcIm1zIGVhc2VcIixcbiAgICAgICAgICAgICAgICBcIi1tb3otdHJhbnNpdGlvblwiOiBcImFsbCBcIiArIHNwZWVkICsgXCJtcyBlYXNlXCIsXG4gICAgICAgICAgICAgICAgXCItby10cmFuc2l0aW9uXCI6IFwiYWxsIFwiICsgc3BlZWQgKyBcIm1zIGVhc2VcIixcbiAgICAgICAgICAgICAgICBcInRyYW5zaXRpb25cIjogXCJhbGwgXCIgKyBzcGVlZCArIFwibXMgZWFzZVwiXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVRyYW5zaXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwiLXdlYmtpdC10cmFuc2l0aW9uXCI6IFwiXCIsXG4gICAgICAgICAgICAgICAgXCItbW96LXRyYW5zaXRpb25cIjogXCJcIixcbiAgICAgICAgICAgICAgICBcIi1vLXRyYW5zaXRpb25cIjogXCJcIixcbiAgICAgICAgICAgICAgICBcInRyYW5zaXRpb25cIjogXCJcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBkb1RyYW5zbGF0ZSA6IGZ1bmN0aW9uIChwaXhlbHMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgXCItd2Via2l0LXRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZTNkKFwiICsgcGl4ZWxzICsgXCJweCwgMHB4LCAwcHgpXCIsXG4gICAgICAgICAgICAgICAgXCItbW96LXRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZTNkKFwiICsgcGl4ZWxzICsgXCJweCwgMHB4LCAwcHgpXCIsXG4gICAgICAgICAgICAgICAgXCItby10cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGUzZChcIiArIHBpeGVscyArIFwicHgsIDBweCwgMHB4KVwiLFxuICAgICAgICAgICAgICAgIFwiLW1zLXRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZTNkKFwiICsgcGl4ZWxzICsgXCJweCwgMHB4LCAwcHgpXCIsXG4gICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGUzZChcIiArIHBpeGVscyArIFwicHgsIDBweCwwcHgpXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJhbnNpdGlvbjNkIDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmNzcyhiYXNlLmRvVHJhbnNsYXRlKHZhbHVlKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3NzMm1vdmUgOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKHtcImxlZnRcIiA6IHZhbHVlfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3NzMnNsaWRlIDogZnVuY3Rpb24gKHZhbHVlLCBzcGVlZCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBiYXNlLmlzQ3NzRmluaXNoID0gZmFsc2U7XG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLnN0b3AodHJ1ZSwgdHJ1ZSkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgXCJsZWZ0XCIgOiB2YWx1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uIDogc3BlZWQgfHwgYmFzZS5vcHRpb25zLnNsaWRlU3BlZWQsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuaXNDc3NGaW5pc2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNoZWNrQnJvd3NlciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUzRCA9IFwidHJhbnNsYXRlM2QoMHB4LCAwcHgsIDBweClcIixcbiAgICAgICAgICAgICAgICB0ZW1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICAgICAgcmVnZXgsXG4gICAgICAgICAgICAgICAgYXNTdXBwb3J0LFxuICAgICAgICAgICAgICAgIHN1cHBvcnQzZCxcbiAgICAgICAgICAgICAgICBpc1RvdWNoO1xuXG4gICAgICAgICAgICB0ZW1wRWxlbS5zdHlsZS5jc3NUZXh0ID0gXCIgIC1tb3otdHJhbnNmb3JtOlwiICsgdHJhbnNsYXRlM0QgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOyAtbXMtdHJhbnNmb3JtOlwiICAgICArIHRyYW5zbGF0ZTNEICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjsgLW8tdHJhbnNmb3JtOlwiICAgICAgKyB0cmFuc2xhdGUzRCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI7IC13ZWJraXQtdHJhbnNmb3JtOlwiICsgdHJhbnNsYXRlM0QgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOyB0cmFuc2Zvcm06XCIgICAgICAgICArIHRyYW5zbGF0ZTNEO1xuICAgICAgICAgICAgcmVnZXggPSAvdHJhbnNsYXRlM2RcXCgwcHgsIDBweCwgMHB4XFwpL2c7XG4gICAgICAgICAgICBhc1N1cHBvcnQgPSB0ZW1wRWxlbS5zdHlsZS5jc3NUZXh0Lm1hdGNoKHJlZ2V4KTtcbiAgICAgICAgICAgIHN1cHBvcnQzZCA9IChhc1N1cHBvcnQgIT09IG51bGwgJiYgYXNTdXBwb3J0Lmxlbmd0aCA9PT0gMSk7XG5cbiAgICAgICAgICAgIGlzVG91Y2ggPSBcIm9udG91Y2hzdGFydFwiIGluIHdpbmRvdyB8fCB3aW5kb3cubmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHM7XG5cbiAgICAgICAgICAgIGJhc2UuYnJvd3NlciA9IHtcbiAgICAgICAgICAgICAgICBcInN1cHBvcnQzZFwiIDogc3VwcG9ydDNkLFxuICAgICAgICAgICAgICAgIFwiaXNUb3VjaFwiIDogaXNUb3VjaFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5tb3VzZURyYWcgIT09IGZhbHNlIHx8IGJhc2Uub3B0aW9ucy50b3VjaERyYWcgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5nZXN0dXJlcygpO1xuICAgICAgICAgICAgICAgIGJhc2UuZGlzYWJsZWRFdmVudHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBldmVudFR5cGVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHR5cGVzID0gW1wic1wiLCBcImVcIiwgXCJ4XCJdO1xuXG4gICAgICAgICAgICBiYXNlLmV2X3R5cGVzID0ge307XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubW91c2VEcmFnID09PSB0cnVlICYmIGJhc2Uub3B0aW9ucy50b3VjaERyYWcgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaHN0YXJ0Lm93bCBtb3VzZWRvd24ub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2htb3ZlLm93bCBtb3VzZW1vdmUub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2hlbmQub3dsIHRvdWNoY2FuY2VsLm93bCBtb3VzZXVwLm93bFwiXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5vcHRpb25zLm1vdXNlRHJhZyA9PT0gZmFsc2UgJiYgYmFzZS5vcHRpb25zLnRvdWNoRHJhZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHR5cGVzID0gW1xuICAgICAgICAgICAgICAgICAgICBcInRvdWNoc3RhcnQub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2htb3ZlLm93bFwiLFxuICAgICAgICAgICAgICAgICAgICBcInRvdWNoZW5kLm93bCB0b3VjaGNhbmNlbC5vd2xcIlxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2Uub3B0aW9ucy5tb3VzZURyYWcgPT09IHRydWUgJiYgYmFzZS5vcHRpb25zLnRvdWNoRHJhZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgXCJtb3VzZWRvd24ub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwibW91c2Vtb3ZlLm93bFwiLFxuICAgICAgICAgICAgICAgICAgICBcIm1vdXNldXAub3dsXCJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYXNlLmV2X3R5cGVzLnN0YXJ0ID0gdHlwZXNbMF07XG4gICAgICAgICAgICBiYXNlLmV2X3R5cGVzLm1vdmUgPSB0eXBlc1sxXTtcbiAgICAgICAgICAgIGJhc2UuZXZfdHlwZXMuZW5kID0gdHlwZXNbMl07XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZWRFdmVudHMgOiAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcImRyYWdzdGFydC5vd2xcIiwgZnVuY3Rpb24gKGV2ZW50KSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm1vdXNlZG93bi5kaXNhYmxlVGV4dFNlbGVjdFwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkKGUudGFyZ2V0KS5pcygnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIG9wdGlvbicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2VzdHVyZXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKmpzbGludCB1bnBhcmFtOiB0cnVlKi9cbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBsb2NhbHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldFggOiAwLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRZIDogMCxcbiAgICAgICAgICAgICAgICAgICAgYmFzZUVsV2lkdGggOiAwLFxuICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZVBvcyA6IDAsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5Td2lwZSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG1heFN3aXBlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzbGlkaW5nIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZGFyZ2dpbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEVsZW1lbnQgOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgYmFzZS5pc0Nzc0ZpbmlzaCA9IHRydWU7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRvdWNoZXMoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4IDogZXZlbnQudG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgOiBldmVudC50b3VjaGVzWzBdLnBhZ2VZXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFnZVggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4IDogZXZlbnQucGFnZVgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA6IGV2ZW50LnBhZ2VZXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWdlWCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgOiBldmVudC5jbGllbnRZXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzd2FwRXZlbnRzKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gXCJvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKGJhc2UuZXZfdHlwZXMubW92ZSwgZHJhZ01vdmUpO1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbihiYXNlLmV2X3R5cGVzLmVuZCwgZHJhZ0VuZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm9mZlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihiYXNlLmV2X3R5cGVzLm1vdmUpO1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoYmFzZS5ldl90eXBlcy5lbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZHJhZ1N0YXJ0KGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ID0gZXZlbnQub3JpZ2luYWxFdmVudCB8fCBldmVudCB8fCB3aW5kb3cuZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgaWYgKGV2LndoaWNoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuaXRlbXNBbW91bnQgPD0gYmFzZS5vcHRpb25zLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuaXNDc3NGaW5pc2ggPT09IGZhbHNlICYmICFiYXNlLm9wdGlvbnMuZHJhZ0JlZm9yZUFuaW1GaW5pc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5pc0NzczNGaW5pc2ggPT09IGZhbHNlICYmICFiYXNlLm9wdGlvbnMuZHJhZ0JlZm9yZUFuaW1GaW5pc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuYXV0b1BsYXlJbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5pc1RvdWNoICE9PSB0cnVlICYmICFiYXNlLiRvd2xXcmFwcGVyLmhhc0NsYXNzKFwiZ3JhYmJpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5hZGRDbGFzcyhcImdyYWJiaW5nXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJhc2UubmV3UG9zWCA9IDA7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXdSZWxhdGl2ZVggPSAwO1xuXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoYmFzZS5yZW1vdmVUcmFuc2l0aW9uKCkpO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSAkKHRoaXMpLnBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgbG9jYWxzLnJlbGF0aXZlUG9zID0gcG9zaXRpb24ubGVmdDtcblxuICAgICAgICAgICAgICAgIGxvY2Fscy5vZmZzZXRYID0gZ2V0VG91Y2hlcyhldikueCAtIHBvc2l0aW9uLmxlZnQ7XG4gICAgICAgICAgICAgICAgbG9jYWxzLm9mZnNldFkgPSBnZXRUb3VjaGVzKGV2KS55IC0gcG9zaXRpb24udG9wO1xuXG4gICAgICAgICAgICAgICAgc3dhcEV2ZW50cyhcIm9uXCIpO1xuXG4gICAgICAgICAgICAgICAgbG9jYWxzLnNsaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsb2NhbHMudGFyZ2V0RWxlbWVudCA9IGV2LnRhcmdldCB8fCBldi5zcmNFbGVtZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmFnTW92ZShldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBldiA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQgfHwgZXZlbnQgfHwgd2luZG93LmV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBtaW5Td2lwZSxcbiAgICAgICAgICAgICAgICAgICAgbWF4U3dpcGU7XG5cbiAgICAgICAgICAgICAgICBiYXNlLm5ld1Bvc1ggPSBnZXRUb3VjaGVzKGV2KS54IC0gbG9jYWxzLm9mZnNldFg7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXdQb3NZID0gZ2V0VG91Y2hlcyhldikueSAtIGxvY2Fscy5vZmZzZXRZO1xuICAgICAgICAgICAgICAgIGJhc2UubmV3UmVsYXRpdmVYID0gYmFzZS5uZXdQb3NYIC0gbG9jYWxzLnJlbGF0aXZlUG9zO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuc3RhcnREcmFnZ2luZyA9PT0gXCJmdW5jdGlvblwiICYmIGxvY2Fscy5kcmFnZ2luZyAhPT0gdHJ1ZSAmJiBiYXNlLm5ld1JlbGF0aXZlWCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbHMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuc3RhcnREcmFnZ2luZy5hcHBseShiYXNlLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICgoYmFzZS5uZXdSZWxhdGl2ZVggPiA4IHx8IGJhc2UubmV3UmVsYXRpdmVYIDwgLTgpICYmIChiYXNlLmJyb3dzZXIuaXNUb3VjaCA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2LnByZXZlbnREZWZhdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldi5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxvY2Fscy5zbGlkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoKGJhc2UubmV3UG9zWSA+IDEwIHx8IGJhc2UubmV3UG9zWSA8IC0xMCkgJiYgbG9jYWxzLnNsaWRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihcInRvdWNobW92ZS5vd2xcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbWluU3dpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLm5ld1JlbGF0aXZlWCAvIDU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIG1heFN3aXBlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5tYXhpbXVtUGl4ZWxzICsgYmFzZS5uZXdSZWxhdGl2ZVggLyA1O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBiYXNlLm5ld1Bvc1ggPSBNYXRoLm1heChNYXRoLm1pbihiYXNlLm5ld1Bvc1gsIG1pblN3aXBlKCkpLCBtYXhTd2lwZSgpKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5icm93c2VyLnN1cHBvcnQzZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnRyYW5zaXRpb24zZChiYXNlLm5ld1Bvc1gpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3NzMm1vdmUoYmFzZS5uZXdQb3NYKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYWdFbmQoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXYgPSBldmVudC5vcmlnaW5hbEV2ZW50IHx8IGV2ZW50IHx8IHdpbmRvdy5ldmVudCxcbiAgICAgICAgICAgICAgICAgICAgbmV3UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLFxuICAgICAgICAgICAgICAgICAgICBvd2xTdG9wRXZlbnQ7XG5cbiAgICAgICAgICAgICAgICBldi50YXJnZXQgPSBldi50YXJnZXQgfHwgZXYuc3JjRWxlbWVudDtcblxuICAgICAgICAgICAgICAgIGxvY2Fscy5kcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5pc1RvdWNoICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIucmVtb3ZlQ2xhc3MoXCJncmFiYmluZ1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5uZXdSZWxhdGl2ZVggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuZHJhZ0RpcmVjdGlvbiA9IGJhc2Uub3dsLmRyYWdEaXJlY3Rpb24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmRyYWdEaXJlY3Rpb24gPSBiYXNlLm93bC5kcmFnRGlyZWN0aW9uID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLm5ld1JlbGF0aXZlWCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IGJhc2UuZ2V0TmV3UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5nb1RvKG5ld1Bvc2l0aW9uLCBmYWxzZSwgXCJkcmFnXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxzLnRhcmdldEVsZW1lbnQgPT09IGV2LnRhcmdldCAmJiBiYXNlLmJyb3dzZXIuaXNUb3VjaCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChldi50YXJnZXQpLm9uKFwiY2xpY2suZGlzYWJsZVwiLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldi5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZXYudGFyZ2V0KS5vZmYoXCJjbGljay5kaXNhYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVycyA9ICQuX2RhdGEoZXYudGFyZ2V0LCBcImV2ZW50c1wiKS5jbGljaztcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bFN0b3BFdmVudCA9IGhhbmRsZXJzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMuc3BsaWNlKDAsIDAsIG93bFN0b3BFdmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dhcEV2ZW50cyhcIm9mZlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oYmFzZS5ldl90eXBlcy5zdGFydCwgXCIub3dsLXdyYXBwZXJcIiwgZHJhZ1N0YXJ0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXROZXdQb3NpdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IGJhc2UuY2xvc2VzdEl0ZW0oKTtcblxuICAgICAgICAgICAgaWYgKG5ld1Bvc2l0aW9uID4gYmFzZS5tYXhpbXVtSXRlbSkge1xuICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBiYXNlLm1heGltdW1JdGVtO1xuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uICA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UubmV3UG9zWCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld1Bvc2l0aW9uO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZXN0SXRlbSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhcnJheSA9IGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlID8gYmFzZS5wYWdlc0luQXJyYXkgOiBiYXNlLnBvc2l0aW9uc0luQXJyYXksXG4gICAgICAgICAgICAgICAgZ29hbCA9IGJhc2UubmV3UG9zWCxcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gbnVsbDtcblxuICAgICAgICAgICAgJC5lYWNoKGFycmF5LCBmdW5jdGlvbiAoaSwgdikge1xuICAgICAgICAgICAgICAgIGlmIChnb2FsIC0gKGJhc2UuaXRlbVdpZHRoIC8gMjApID4gYXJyYXlbaSArIDFdICYmIGdvYWwgLSAoYmFzZS5pdGVtV2lkdGggLyAyMCkgPCB2ICYmIGJhc2UubW92ZURpcmVjdGlvbigpID09PSBcImxlZnRcIikge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gdjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gJC5pbkFycmF5KGNsb3Nlc3QsIGJhc2UucG9zaXRpb25zSW5BcnJheSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gaTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZ29hbCArIChiYXNlLml0ZW1XaWR0aCAvIDIwKSA8IHYgJiYgZ29hbCArIChiYXNlLml0ZW1XaWR0aCAvIDIwKSA+IChhcnJheVtpICsgMV0gfHwgYXJyYXlbaV0gLSBiYXNlLml0ZW1XaWR0aCkgJiYgYmFzZS5tb3ZlRGlyZWN0aW9uKCkgPT09IFwicmlnaHRcIikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBhcnJheVtpICsgMV0gfHwgYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gJC5pbkFycmF5KGNsb3Nlc3QsIGJhc2UucG9zaXRpb25zSW5BcnJheSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gYXJyYXlbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gYmFzZS5jdXJyZW50SXRlbTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRGlyZWN0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjtcbiAgICAgICAgICAgIGlmIChiYXNlLm5ld1JlbGF0aXZlWCA8IDApIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICAgICAgYmFzZS5wbGF5RGlyZWN0aW9uID0gXCJuZXh0XCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIGJhc2UucGxheURpcmVjdGlvbiA9IFwicHJldlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGlvbjtcbiAgICAgICAgfSxcblxuICAgICAgICBjdXN0b21FdmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKmpzbGludCB1bnBhcmFtOiB0cnVlKi9cbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wubmV4dFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXh0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wucHJldlwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5wcmV2KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wucGxheVwiLCBmdW5jdGlvbiAoZXZlbnQsIHNwZWVkKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmF1dG9QbGF5ID0gc3BlZWQ7XG4gICAgICAgICAgICAgICAgYmFzZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgYmFzZS5ob3ZlclN0YXR1cyA9IFwicGxheVwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwib3dsLnN0b3BcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhc2Uuc3RvcCgpO1xuICAgICAgICAgICAgICAgIGJhc2UuaG92ZXJTdGF0dXMgPSBcInN0b3BcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm93bC5nb1RvXCIsIGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIGJhc2UuZ29UbyhpdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm93bC5qdW1wVG9cIiwgZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5qdW1wVG8oaXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wT25Ib3ZlciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuc3RvcE9uSG92ZXIgPT09IHRydWUgJiYgYmFzZS5icm93c2VyLmlzVG91Y2ggIT09IHRydWUgJiYgYmFzZS5vcHRpb25zLmF1dG9QbGF5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5ob3ZlclN0YXR1cyAhPT0gXCJzdG9wXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGF6eUxvYWQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAkaXRlbSxcbiAgICAgICAgICAgICAgICBpdGVtTnVtYmVyLFxuICAgICAgICAgICAgICAgICRsYXp5SW1nLFxuICAgICAgICAgICAgICAgIGZvbGxvdztcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5sYXp5TG9hZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYmFzZS5pdGVtc0Ftb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgJGl0ZW0gPSAkKGJhc2UuJG93bEl0ZW1zW2ldKTtcblxuICAgICAgICAgICAgICAgIGlmICgkaXRlbS5kYXRhKFwib3dsLWxvYWRlZFwiKSA9PT0gXCJsb2FkZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpdGVtTnVtYmVyID0gJGl0ZW0uZGF0YShcIm93bC1pdGVtXCIpO1xuICAgICAgICAgICAgICAgICRsYXp5SW1nID0gJGl0ZW0uZmluZChcIi5sYXp5T3dsXCIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAkbGF6eUltZy5kYXRhKFwic3JjXCIpICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtLmRhdGEoXCJvd2wtbG9hZGVkXCIsIFwibG9hZGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCRpdGVtLmRhdGEoXCJvd2wtbG9hZGVkXCIpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgJGxhenlJbWcuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAkaXRlbS5hZGRDbGFzcyhcImxvYWRpbmdcIikuZGF0YShcIm93bC1sb2FkZWRcIiwgXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmxhenlGb2xsb3cgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9sbG93ID0gaXRlbU51bWJlciA+PSBiYXNlLmN1cnJlbnRJdGVtO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmb2xsb3cgJiYgaXRlbU51bWJlciA8IGJhc2UuY3VycmVudEl0ZW0gKyBiYXNlLm9wdGlvbnMuaXRlbXMgJiYgJGxhenlJbWcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICRsYXp5SW1nLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmxhenlQcmVsb2FkKCRpdGVtLCAkKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxhenlQcmVsb2FkIDogZnVuY3Rpb24gKCRpdGVtLCAkbGF6eUltZykge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbnMgPSAwLFxuICAgICAgICAgICAgICAgIGlzQmFja2dyb3VuZEltZztcblxuICAgICAgICAgICAgaWYgKCRsYXp5SW1nLnByb3AoXCJ0YWdOYW1lXCIpID09PSBcIkRJVlwiKSB7XG4gICAgICAgICAgICAgICAgJGxhenlJbWcuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBcInVybChcIiArICRsYXp5SW1nLmRhdGEoXCJzcmNcIikgKyBcIilcIik7XG4gICAgICAgICAgICAgICAgaXNCYWNrZ3JvdW5kSW1nID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGxhenlJbWdbMF0uc3JjID0gJGxhenlJbWcuZGF0YShcInNyY1wiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gc2hvd0ltYWdlKCkge1xuICAgICAgICAgICAgICAgICRpdGVtLmRhdGEoXCJvd2wtbG9hZGVkXCIsIFwibG9hZGVkXCIpLnJlbW92ZUNsYXNzKFwibG9hZGluZ1wiKTtcbiAgICAgICAgICAgICAgICAkbGF6eUltZy5yZW1vdmVBdHRyKFwiZGF0YS1zcmNcIik7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5sYXp5RWZmZWN0ID09PSBcImZhZGVcIikge1xuICAgICAgICAgICAgICAgICAgICAkbGF6eUltZy5mYWRlSW4oNDAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkbGF6eUltZy5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmFmdGVyTGF6eUxvYWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYWZ0ZXJMYXp5TG9hZC5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tMYXp5SW1hZ2UoKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0aW9ucyArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLmNvbXBsZXRlSW1nKCRsYXp5SW1nLmdldCgwKSkgfHwgaXNCYWNrZ3JvdW5kSW1nID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dJbWFnZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlcmF0aW9ucyA8PSAxMDApIHsvL2lmIGltYWdlIGxvYWRzIGluIGxlc3MgdGhhbiAxMCBzZWNvbmRzIFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjaGVja0xhenlJbWFnZSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaG93SW1hZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoZWNrTGF6eUltYWdlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXV0b0hlaWdodCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkY3VycmVudGltZyA9ICQoYmFzZS4kb3dsSXRlbXNbYmFzZS5jdXJyZW50SXRlbV0pLmZpbmQoXCJpbWdcIiksXG4gICAgICAgICAgICAgICAgaXRlcmF0aW9ucztcblxuICAgICAgICAgICAgZnVuY3Rpb24gYWRkSGVpZ2h0KCkge1xuICAgICAgICAgICAgICAgIHZhciAkY3VycmVudEl0ZW0gPSAkKGJhc2UuJG93bEl0ZW1zW2Jhc2UuY3VycmVudEl0ZW1dKS5oZWlnaHQoKTtcbiAgICAgICAgICAgICAgICBiYXNlLndyYXBwZXJPdXRlci5jc3MoXCJoZWlnaHRcIiwgJGN1cnJlbnRJdGVtICsgXCJweFwiKTtcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2Uud3JhcHBlck91dGVyLmhhc0NsYXNzKFwiYXV0b0hlaWdodFwiKSkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLndyYXBwZXJPdXRlci5hZGRDbGFzcyhcImF1dG9IZWlnaHRcIik7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tJbWFnZSgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRpb25zICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuY29tcGxldGVJbWcoJGN1cnJlbnRpbWcuZ2V0KDApKSkge1xuICAgICAgICAgICAgICAgICAgICBhZGRIZWlnaHQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZXJhdGlvbnMgPD0gMTAwKSB7IC8vaWYgaW1hZ2UgbG9hZHMgaW4gbGVzcyB0aGFuIDEwIHNlY29uZHMgXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNoZWNrSW1hZ2UsIDEwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS53cmFwcGVyT3V0ZXIuY3NzKFwiaGVpZ2h0XCIsIFwiXCIpOyAvL0Vsc2UgcmVtb3ZlIGhlaWdodCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkY3VycmVudGltZy5nZXQoMCkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgICAgICAgICAgIGNoZWNrSW1hZ2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRkSGVpZ2h0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29tcGxldGVJbWcgOiBmdW5jdGlvbiAoaW1nKSB7XG4gICAgICAgICAgICB2YXIgbmF0dXJhbFdpZHRoVHlwZTtcblxuICAgICAgICAgICAgaWYgKCFpbWcuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuYXR1cmFsV2lkdGhUeXBlID0gdHlwZW9mIGltZy5uYXR1cmFsV2lkdGg7XG4gICAgICAgICAgICBpZiAobmF0dXJhbFdpZHRoVHlwZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBpbWcubmF0dXJhbFdpZHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25WaXNpYmxlSXRlbXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaTtcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hZGRDbGFzc0FjdGl2ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuJG93bEl0ZW1zLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS52aXNpYmxlSXRlbXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSA9IGJhc2UuY3VycmVudEl0ZW07IGkgPCBiYXNlLmN1cnJlbnRJdGVtICsgYmFzZS5vcHRpb25zLml0ZW1zOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnZpc2libGVJdGVtcy5wdXNoKGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hZGRDbGFzc0FjdGl2ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAkKGJhc2UuJG93bEl0ZW1zW2ldKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLm93bC52aXNpYmxlSXRlbXMgPSBiYXNlLnZpc2libGVJdGVtcztcbiAgICAgICAgfSxcblxuICAgICAgICB0cmFuc2l0aW9uVHlwZXMgOiBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICAvL0N1cnJlbnRseSBhdmFpbGFibGU6IFwiZmFkZVwiLCBcImJhY2tTbGlkZVwiLCBcImdvRG93blwiLCBcImZhZGVVcFwiXG4gICAgICAgICAgICBiYXNlLm91dENsYXNzID0gXCJvd2wtXCIgKyBjbGFzc05hbWUgKyBcIi1vdXRcIjtcbiAgICAgICAgICAgIGJhc2UuaW5DbGFzcyA9IFwib3dsLVwiICsgY2xhc3NOYW1lICsgXCItaW5cIjtcbiAgICAgICAgfSxcblxuICAgICAgICBzaW5nbGVJdGVtVHJhbnNpdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvdXRDbGFzcyA9IGJhc2Uub3V0Q2xhc3MsXG4gICAgICAgICAgICAgICAgaW5DbGFzcyA9IGJhc2UuaW5DbGFzcyxcbiAgICAgICAgICAgICAgICAkY3VycmVudEl0ZW0gPSBiYXNlLiRvd2xJdGVtcy5lcShiYXNlLmN1cnJlbnRJdGVtKSxcbiAgICAgICAgICAgICAgICAkcHJldkl0ZW0gPSBiYXNlLiRvd2xJdGVtcy5lcShiYXNlLnByZXZJdGVtKSxcbiAgICAgICAgICAgICAgICBwcmV2UG9zID0gTWF0aC5hYnMoYmFzZS5wb3NpdGlvbnNJbkFycmF5W2Jhc2UuY3VycmVudEl0ZW1dKSArIGJhc2UucG9zaXRpb25zSW5BcnJheVtiYXNlLnByZXZJdGVtXSxcbiAgICAgICAgICAgICAgICBvcmlnaW4gPSBNYXRoLmFicyhiYXNlLnBvc2l0aW9uc0luQXJyYXlbYmFzZS5jdXJyZW50SXRlbV0pICsgYmFzZS5pdGVtV2lkdGggLyAyLFxuICAgICAgICAgICAgICAgIGFuaW1FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG9BbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgYW5pbWF0aW9uZW5kJztcblxuICAgICAgICAgICAgYmFzZS5pc1RyYW5zaXRpb24gPSB0cnVlO1xuXG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdvd2wtb3JpZ2luJylcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgXCItd2Via2l0LXRyYW5zZm9ybS1vcmlnaW5cIiA6IG9yaWdpbiArIFwicHhcIixcbiAgICAgICAgICAgICAgICAgICAgXCItbW96LXBlcnNwZWN0aXZlLW9yaWdpblwiIDogb3JpZ2luICsgXCJweFwiLFxuICAgICAgICAgICAgICAgICAgICBcInBlcnNwZWN0aXZlLW9yaWdpblwiIDogb3JpZ2luICsgXCJweFwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmdW5jdGlvbiB0cmFuc1N0eWxlcyhwcmV2UG9zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvblwiIDogXCJyZWxhdGl2ZVwiLFxuICAgICAgICAgICAgICAgICAgICBcImxlZnRcIiA6IHByZXZQb3MgKyBcInB4XCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkcHJldkl0ZW1cbiAgICAgICAgICAgICAgICAuY3NzKHRyYW5zU3R5bGVzKHByZXZQb3MsIDEwKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3Mob3V0Q2xhc3MpXG4gICAgICAgICAgICAgICAgLm9uKGFuaW1FbmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5lbmRQcmV2ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgJHByZXZJdGVtLm9mZihhbmltRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jbGVhclRyYW5zU3R5bGUoJHByZXZJdGVtLCBvdXRDbGFzcyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRjdXJyZW50SXRlbVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhpbkNsYXNzKVxuICAgICAgICAgICAgICAgIC5vbihhbmltRW5kLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuZW5kQ3VycmVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICRjdXJyZW50SXRlbS5vZmYoYW5pbUVuZCk7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY2xlYXJUcmFuc1N0eWxlKCRjdXJyZW50SXRlbSwgaW5DbGFzcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXJUcmFuc1N0eWxlIDogZnVuY3Rpb24gKGl0ZW0sIGNsYXNzVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGl0ZW0uY3NzKHtcbiAgICAgICAgICAgICAgICBcInBvc2l0aW9uXCIgOiBcIlwiLFxuICAgICAgICAgICAgICAgIFwibGVmdFwiIDogXCJcIlxuICAgICAgICAgICAgfSkucmVtb3ZlQ2xhc3MoY2xhc3NUb1JlbW92ZSk7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLmVuZFByZXYgJiYgYmFzZS5lbmRDdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5yZW1vdmVDbGFzcygnb3dsLW9yaWdpbicpO1xuICAgICAgICAgICAgICAgIGJhc2UuZW5kUHJldiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2UuZW5kQ3VycmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2UuaXNUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3dsU3RhdHVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5vd2wgPSB7XG4gICAgICAgICAgICAgICAgXCJ1c2VyT3B0aW9uc1wiICAgOiBiYXNlLnVzZXJPcHRpb25zLFxuICAgICAgICAgICAgICAgIFwiYmFzZUVsZW1lbnRcIiAgIDogYmFzZS4kZWxlbSxcbiAgICAgICAgICAgICAgICBcInVzZXJJdGVtc1wiICAgICA6IGJhc2UuJHVzZXJJdGVtcyxcbiAgICAgICAgICAgICAgICBcIm93bEl0ZW1zXCIgICAgICA6IGJhc2UuJG93bEl0ZW1zLFxuICAgICAgICAgICAgICAgIFwiY3VycmVudEl0ZW1cIiAgIDogYmFzZS5jdXJyZW50SXRlbSxcbiAgICAgICAgICAgICAgICBcInByZXZJdGVtXCIgICAgICA6IGJhc2UucHJldkl0ZW0sXG4gICAgICAgICAgICAgICAgXCJ2aXNpYmxlSXRlbXNcIiAgOiBiYXNlLnZpc2libGVJdGVtcyxcbiAgICAgICAgICAgICAgICBcImlzVG91Y2hcIiAgICAgICA6IGJhc2UuYnJvd3Nlci5pc1RvdWNoLFxuICAgICAgICAgICAgICAgIFwiYnJvd3NlclwiICAgICAgIDogYmFzZS5icm93c2VyLFxuICAgICAgICAgICAgICAgIFwiZHJhZ0RpcmVjdGlvblwiIDogYmFzZS5kcmFnRGlyZWN0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyRXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vZmYoXCIub3dsIG93bCBtb3VzZWRvd24uZGlzYWJsZVRleHRTZWxlY3RcIik7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoXCIub3dsIG93bFwiKTtcbiAgICAgICAgICAgICQod2luZG93KS5vZmYoXCJyZXNpemVcIiwgYmFzZS5yZXNpemVyKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1bldyYXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5jaGlsZHJlbigpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIudW53cmFwKCk7XG4gICAgICAgICAgICAgICAgYmFzZS4kdXNlckl0ZW1zLnVud3JhcCgpLnVud3JhcCgpO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLm93bENvbnRyb2xzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3dsQ29udHJvbHMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5jbGVhckV2ZW50cygpO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5hdHRyKHtcbiAgICAgICAgICAgICAgICBzdHlsZTogYmFzZS4kZWxlbS5kYXRhKFwib3dsLW9yaWdpbmFsU3R5bGVzXCIpIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgY2xhc3M6IGJhc2UuJGVsZW0uZGF0YShcIm93bC1vcmlnaW5hbENsYXNzZXNcIilcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3kgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLnN0b3AoKTtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuY2hlY2tWaXNpYmxlKTtcbiAgICAgICAgICAgIGJhc2UudW5XcmFwKCk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLnJlbW92ZURhdGEoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWluaXQgOiBmdW5jdGlvbiAobmV3T3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgYmFzZS51c2VyT3B0aW9ucywgbmV3T3B0aW9ucyk7XG4gICAgICAgICAgICBiYXNlLnVuV3JhcCgpO1xuICAgICAgICAgICAgYmFzZS5pbml0KG9wdGlvbnMsIGJhc2UuJGVsZW0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZEl0ZW0gOiBmdW5jdGlvbiAoaHRtbFN0cmluZywgdGFyZ2V0UG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjtcblxuICAgICAgICAgICAgaWYgKCFodG1sU3RyaW5nKSB7cmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgICAgIGlmIChiYXNlLiRlbGVtLmNoaWxkcmVuKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5hcHBlbmQoaHRtbFN0cmluZyk7XG4gICAgICAgICAgICAgICAgYmFzZS5zZXRWYXJzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS51bldyYXAoKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXRQb3NpdGlvbiA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldFBvc2l0aW9uID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gLTE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocG9zaXRpb24gPj0gYmFzZS4kdXNlckl0ZW1zLmxlbmd0aCB8fCBwb3NpdGlvbiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMuZXEoLTEpLmFmdGVyKGh0bWxTdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMuZXEocG9zaXRpb24pLmJlZm9yZShodG1sU3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFzZS5zZXRWYXJzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlSXRlbSA6IGZ1bmN0aW9uICh0YXJnZXRQb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5jaGlsZHJlbigpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXJnZXRQb3NpdGlvbiA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldFBvc2l0aW9uID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gLTE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2UudW5XcmFwKCk7XG4gICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMuZXEocG9zaXRpb24pLnJlbW92ZSgpO1xuICAgICAgICAgICAgYmFzZS5zZXRWYXJzKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICAkLmZuLm93bENhcm91c2VsID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5kYXRhKFwib3dsLWluaXRcIikgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkKHRoaXMpLmRhdGEoXCJvd2wtaW5pdFwiLCB0cnVlKTtcbiAgICAgICAgICAgIHZhciBjYXJvdXNlbCA9IE9iamVjdC5jcmVhdGUoQ2Fyb3VzZWwpO1xuICAgICAgICAgICAgY2Fyb3VzZWwuaW5pdChvcHRpb25zLCB0aGlzKTtcbiAgICAgICAgICAgICQuZGF0YSh0aGlzLCBcIm93bENhcm91c2VsXCIsIGNhcm91c2VsKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICQuZm4ub3dsQ2Fyb3VzZWwub3B0aW9ucyA9IHtcblxuICAgICAgICBpdGVtcyA6IDUsXG4gICAgICAgIGl0ZW1zQ3VzdG9tIDogZmFsc2UsXG4gICAgICAgIGl0ZW1zRGVza3RvcCA6IFsxMTk5LCA0XSxcbiAgICAgICAgaXRlbXNEZXNrdG9wU21hbGwgOiBbOTc5LCAzXSxcbiAgICAgICAgaXRlbXNUYWJsZXQgOiBbNzY4LCAyXSxcbiAgICAgICAgaXRlbXNUYWJsZXRTbWFsbCA6IGZhbHNlLFxuICAgICAgICBpdGVtc01vYmlsZSA6IFs0NzksIDFdLFxuICAgICAgICBzaW5nbGVJdGVtIDogZmFsc2UsXG4gICAgICAgIGl0ZW1zU2NhbGVVcCA6IGZhbHNlLFxuXG4gICAgICAgIHNsaWRlU3BlZWQgOiAyMDAsXG4gICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDgwMCxcbiAgICAgICAgcmV3aW5kU3BlZWQgOiAxMDAwLFxuXG4gICAgICAgIGF1dG9QbGF5IDogZmFsc2UsXG4gICAgICAgIHN0b3BPbkhvdmVyIDogZmFsc2UsXG5cbiAgICAgICAgbmF2aWdhdGlvbiA6IGZhbHNlLFxuICAgICAgICBuYXZpZ2F0aW9uVGV4dCA6IFtcInByZXZcIiwgXCJuZXh0XCJdLFxuICAgICAgICByZXdpbmROYXYgOiB0cnVlLFxuICAgICAgICBzY3JvbGxQZXJQYWdlIDogZmFsc2UsXG5cbiAgICAgICAgcGFnaW5hdGlvbiA6IHRydWUsXG4gICAgICAgIHBhZ2luYXRpb25OdW1iZXJzIDogZmFsc2UsXG5cbiAgICAgICAgcmVzcG9uc2l2ZSA6IHRydWUsXG4gICAgICAgIHJlc3BvbnNpdmVSZWZyZXNoUmF0ZSA6IDIwMCxcbiAgICAgICAgcmVzcG9uc2l2ZUJhc2VXaWR0aCA6IHdpbmRvdyxcblxuICAgICAgICBiYXNlQ2xhc3MgOiBcIm93bC1jYXJvdXNlbFwiLFxuICAgICAgICB0aGVtZSA6IFwib3dsLXRoZW1lXCIsXG5cbiAgICAgICAgbGF6eUxvYWQgOiBmYWxzZSxcbiAgICAgICAgbGF6eUZvbGxvdyA6IHRydWUsXG4gICAgICAgIGxhenlFZmZlY3QgOiBcImZhZGVcIixcblxuICAgICAgICBhdXRvSGVpZ2h0IDogZmFsc2UsXG5cbiAgICAgICAganNvblBhdGggOiBmYWxzZSxcbiAgICAgICAganNvblN1Y2Nlc3MgOiBmYWxzZSxcblxuICAgICAgICBkcmFnQmVmb3JlQW5pbUZpbmlzaCA6IHRydWUsXG4gICAgICAgIG1vdXNlRHJhZyA6IHRydWUsXG4gICAgICAgIHRvdWNoRHJhZyA6IHRydWUsXG5cbiAgICAgICAgYWRkQ2xhc3NBY3RpdmUgOiBmYWxzZSxcbiAgICAgICAgdHJhbnNpdGlvblN0eWxlIDogZmFsc2UsXG5cbiAgICAgICAgYmVmb3JlVXBkYXRlIDogZmFsc2UsXG4gICAgICAgIGFmdGVyVXBkYXRlIDogZmFsc2UsXG4gICAgICAgIGJlZm9yZUluaXQgOiBmYWxzZSxcbiAgICAgICAgYWZ0ZXJJbml0IDogZmFsc2UsXG4gICAgICAgIGJlZm9yZU1vdmUgOiBmYWxzZSxcbiAgICAgICAgYWZ0ZXJNb3ZlIDogZmFsc2UsXG4gICAgICAgIGFmdGVyQWN0aW9uIDogZmFsc2UsXG4gICAgICAgIHN0YXJ0RHJhZ2dpbmcgOiBmYWxzZSxcbiAgICAgICAgYWZ0ZXJMYXp5TG9hZDogZmFsc2VcbiAgICB9O1xufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsImltcG9ydCBvd2xDYXJvdXNlbCBmcm9tICcuLi8uLi9ub2RlX21vZHVsZXMvb3dsY2Fyb3VzZWwvb3dsLWNhcm91c2VsL293bC5jYXJvdXNlbCdcblxuXG5mdW5jdGlvbiBpbml0Q2Fyb3VzZWwoKSB7XG4gICAgJChcIiNwYXJ0bmVycy1jYXJvdXNlbFwiKS5vd2xDYXJvdXNlbCgpO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGluaXRDYXJvdXNlbFxuIiwiaW1wb3J0IGluaXRDYXJvdXNlbCBmcm9tICcuL19jYXJvdXNlbCdcblxuXG5jbGFzcyBBcHAge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9pbml0RWxlbWVudHMoKTtcbiAgICAgICAgdGhpcy5zY3JvbGxEdXJhdGlvbiA9IDMwMDA7XG5cbiAgICAgICAgdGhpcy5maW5kU2VjdGlvblBvc2l0aW9ucygpO1xuICAgICAgICB0aGlzLl9pbml0SGVhZGVyKCk7XG4gICAgICAgIHRoaXMuX2luaXRNYWluTWVudSgpO1xuICAgICAgICB0aGlzLl9pbml0U2Nyb2xsTmF2KCk7XG4gICAgfVxuXG4gICAgX2luaXRFbGVtZW50cygpIHtcbiAgICAgICAgdGhpcy4kaGVhZGVyID0gJChcIi5wYWdlX2hlYWRlclwiKTtcbiAgICAgICAgdGhpcy5oZWFkZXJIZWlnaHQgPSB0aGlzLiRoZWFkZXIub3V0ZXJIZWlnaHQoKTtcbiAgICAgICAgdGhpcy5oZWFkZXJEZWZhdWx0UG9zID0gdGhpcy4kaGVhZGVyLm9mZnNldCgpLnRvcDtcblxuICAgICAgICB0aGlzLiRtYWluTWVudSA9ICQoXCIubWFpbl9tZW51XCIpO1xuICAgICAgICB0aGlzLiRtYWluTWVudUxpbmsgPSB0aGlzLiRtYWluTWVudS5maW5kKFwiLm1haW5fbWVudV9fbGlua1wiKTtcbiAgICAgICAgdGhpcy4kbWFpbk1lbnVUcmlnZ2VyID0gdGhpcy4kbWFpbk1lbnUuZmluZChcIi50cmlnZ2VyXCIpO1xuICAgICAgICB0aGlzLiRtYWluTWVudUFjdGl2ZU1hcmtlciA9IHRoaXMuJG1haW5NZW51LmZpbmQoXCIubWFpbl9tZW51X19tYXJrZXJcIik7XG5cbiAgICAgICAgdGhpcy4kc2VjdGlvbnMgPSAkKFwiLnNlY3Rpb25cIik7XG4gICAgfVxuXG4gICAgX2luaXRIZWFkZXIoKSB7XG4gICAgICAgIGxldCBoZWFkZXJGaXhlZCA9IGZhbHNlO1xuICAgICAgICAkKHdpbmRvdykuc2Nyb2xsKCgpID0+IHtcbiAgICAgICAgICAgIGlmKCQod2luZG93KS5zY3JvbGxUb3AoKSA+PSB0aGlzLmhlYWRlckRlZmF1bHRQb3MpIHtcbiAgICAgICAgICAgICAgICBpZighaGVhZGVyRml4ZWQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRoZWFkZXIuYWRkQ2xhc3MoXCJmaXhlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyRml4ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYoaGVhZGVyRml4ZWQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRoZWFkZXIucmVtb3ZlQ2xhc3MoXCJmaXhlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyRml4ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0TWFpbk1lbnUoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy4kbWFpbk1lbnVUcmlnZ2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy4kbWFpbk1lbnUudG9nZ2xlQ2xhc3MoXCJvcGVuXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kbWFpbk1lbnVMaW5rLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxldCBzZWN0aW9uSUQgPSAkKHRoaXMpLmF0dHIoXCJocmVmXCIpLnJlcGxhY2UoXCIjXCIsIFwiXCIpO1xuICAgICAgICAgICAgc2VsZi5zY3JvbGwyU2VjdGlvbihzZWN0aW9uSUQpO1xuICAgICAgICAgICAgc2VsZi5zZXRBY3RpdmVNZW51SXRlbShzZWN0aW9uSUQpO1xuICAgICAgICAgICAgc2VsZi5tZW51Q2xpY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHNlbGYubWVudUNsaWNrZWQgPSBmYWxzZSwgNTAwKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoXCJib2R5XCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy4kbWFpbk1lbnUucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpKTtcbiAgICB9XG5cbiAgICBmaW5kU2VjdGlvblBvc2l0aW9ucygpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLnNlY3Rpb25Qb3NpdGlvbnMgPSB7fTtcbiAgICAgICAgdGhpcy5zZWN0aW9uQnJlYWtQb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy4kc2VjdGlvbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IHNlY3Rpb25JRCA9ICQodGhpcykuYXR0cihcImlkXCIpLnJlcGxhY2UoXCJzZWN0aW9uX1wiLCBcIlwiKSxcbiAgICAgICAgICAgICAgICBicCA9ICQodGhpcykub2Zmc2V0KCkudG9wIC0gc2VsZi5oZWFkZXJIZWlnaHQ7XG4gICAgICAgICAgICBzZWxmLnNlY3Rpb25Qb3NpdGlvbnNbc2VjdGlvbklEXSA9IGJwO1xuICAgICAgICAgICAgc2VsZi5zZWN0aW9uQnJlYWtQb2ludHMucHVzaChicCk7XG4gICAgICAgIH0pO1xuICAgICAgICBzZWxmLnNlY3Rpb25CcmVha1BvaW50cy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgfVxuXG4gICAgX2luaXRTY3JvbGxOYXYoKSB7XG4gICAgICAgIHRoaXMuZmluZFNlY3Rpb25Qb3NpdGlvbnMoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9ICcnO1xuICAgICAgICB0aGlzLm1lbnVDbGlja2VkID0gZmFsc2U7XG4gICAgICAgIGxldCBmcCA9ICQod2luZG93KS5oZWlnaHQoKSAvIDQsXG4gICAgICAgICAgICBuZXdTZWN0aW9uID0gJyc7XG4gICAgICAgICQod2luZG93KS5zY3JvbGwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1lbnVDbGlja2VkKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNjcm9sbFBvc2l0aW9uID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuICAgICAgICAgICAgICAgIGxldCBicCA9IE1hdGgubWF4KC4uLnRoaXMuc2VjdGlvbkJyZWFrUG9pbnRzLmZpbHRlcih2ID0+IHYgPD0gc2Nyb2xsUG9zaXRpb24gKyBmcCkpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHMgaW4gdGhpcy5zZWN0aW9uUG9zaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2VjdGlvblBvc2l0aW9ucy5oYXNPd25Qcm9wZXJ0eShzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VjdGlvblBvc2l0aW9uc1tzXSA9PSBicCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NlY3Rpb24gPSBzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuZXdTZWN0aW9uICE9IHRoaXMuY3VycmVudFNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVNZW51SXRlbShuZXdTZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IG5ld1NlY3Rpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZSh0aGlzLmZpbmRTZWN0aW9uUG9zaXRpb25zKTtcbiAgICB9XG5cbiAgICBzY3JvbGwyU2VjdGlvbihzZWN0aW9uSUQpIHtcbiAgICAgICAgJChcImh0bWwsYm9keVwiKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogdGhpcy5zZWN0aW9uUG9zaXRpb25zW3NlY3Rpb25JRF0sXG4gICAgICAgICAgICBkdXJhdGlvbjogdGhpcy5zY3JvbGxEdXJhdGlvblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRBY3RpdmVNZW51SXRlbShzZWN0aW9uSUQpIHtcbiAgICAgICAgbGV0ICRtZW51SXRlbSA9IHRoaXMuJG1haW5NZW51TGluay5maWx0ZXIoYFtocmVmPVwiIyR7c2VjdGlvbklEfVwiXWApO1xuICAgICAgICBpZigkbWVudUl0ZW0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IG1lbnVJdGVtV2lkdGggPSAkbWVudUl0ZW0ud2lkdGgoKSxcbiAgICAgICAgICAgICAgICBtZW51SXRlbUxlZnQgPSAkbWVudUl0ZW0ub2Zmc2V0KCkubGVmdCAtIHRoaXMuJG1haW5NZW51Lm9mZnNldCgpLmxlZnQ7XG4gICAgICAgICAgICB0aGlzLiRtYWluTWVudUxpbmsucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAkbWVudUl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB0aGlzLiRtYWluTWVudUFjdGl2ZU1hcmtlclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhcIm91dHNpZGVcIilcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbWVudUl0ZW1MZWZ0LFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogbWVudUl0ZW1XaWR0aFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kbWFpbk1lbnVBY3RpdmVNYXJrZXIuYWRkQ2xhc3MoXCJvdXRzaWRlXCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbiQoZnVuY3Rpb24oKXtcbiAgICBuZXcgQXBwKCk7XG4gICAgaW5pdENhcm91c2VsKCk7XG59KTtcbiJdfQ==
