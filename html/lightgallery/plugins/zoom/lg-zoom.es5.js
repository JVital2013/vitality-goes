/*!
 * lightgallery | 2.5.0-beta.2 | March 17th 2022
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var zoomSettings = {
    scale: 1,
    zoom: true,
    actualSize: true,
    showZoomInOutIcons: false,
    actualSizeIcons: {
        zoomIn: 'lg-zoom-in',
        zoomOut: 'lg-zoom-out',
    },
    enableZoomAfter: 300,
    zoomPluginStrings: {
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        viewActualSize: 'View actual size',
    },
};

/**
 * List of lightGallery events
 * All events should be documented here
 * Below interfaces are used to build the website documentations
 * */
var lGEvents = {
    afterAppendSlide: 'lgAfterAppendSlide',
    init: 'lgInit',
    hasVideo: 'lgHasVideo',
    containerResize: 'lgContainerResize',
    updateSlides: 'lgUpdateSlides',
    afterAppendSubHtml: 'lgAfterAppendSubHtml',
    beforeOpen: 'lgBeforeOpen',
    afterOpen: 'lgAfterOpen',
    slideItemLoad: 'lgSlideItemLoad',
    beforeSlide: 'lgBeforeSlide',
    afterSlide: 'lgAfterSlide',
    posterClick: 'lgPosterClick',
    dragStart: 'lgDragStart',
    dragMove: 'lgDragMove',
    dragEnd: 'lgDragEnd',
    beforeNextSlide: 'lgBeforeNextSlide',
    beforePrevSlide: 'lgBeforePrevSlide',
    beforeClose: 'lgBeforeClose',
    afterClose: 'lgAfterClose',
    rotateLeft: 'lgRotateLeft',
    rotateRight: 'lgRotateRight',
    flipHorizontal: 'lgFlipHorizontal',
    flipVertical: 'lgFlipVertical',
    autoplay: 'lgAutoplay',
    autoplayStart: 'lgAutoplayStart',
    autoplayStop: 'lgAutoplayStop',
};

var Zoom = /** @class */ (function () {
    function Zoom(instance, $LG) {
        // get lightGallery core plugin instance
        this.core = instance;
        this.$LG = $LG;
        this.settings = __assign(__assign({}, zoomSettings), this.core.settings);
        return this;
    }
    // Append Zoom controls. Actual size, Zoom-in, Zoom-out
    Zoom.prototype.buildTemplates = function () {
        var zoomIcons = this.settings.showZoomInOutIcons
            ? "<button id=\"" + this.core.getIdName('lg-zoom-in') + "\" type=\"button\" aria-label=\"" + this.settings.zoomPluginStrings['zoomIn'] + "\" class=\"lg-zoom-in lg-icon\"></button><button id=\"" + this.core.getIdName('lg-zoom-out') + "\" type=\"button\" aria-label=\"" + this.settings.zoomPluginStrings['zoomIn'] + "\" class=\"lg-zoom-out lg-icon\"></button>"
            : '';
        if (this.settings.actualSize) {
            zoomIcons += "<button id=\"" + this.core.getIdName('lg-actual-size') + "\" type=\"button\" aria-label=\"" + this.settings.zoomPluginStrings['viewActualSize'] + "\" class=\"" + this.settings.actualSizeIcons.zoomIn + " lg-icon\"></button>";
        }
        this.core.outer.addClass('lg-use-transition-for-zoom');
        this.core.$toolbar.first().append(zoomIcons);
    };
    /**
     * @desc Enable zoom option only once the image is completely loaded
     * If zoomFromOrigin is true, Zoom is enabled once the dummy image has been inserted
     *
     * Zoom styles are defined under lg-zoomable CSS class.
     */
    Zoom.prototype.enableZoom = function (event) {
        var _this = this;
        // delay will be 0 except first time
        var _speed = this.settings.enableZoomAfter + event.detail.delay;
        // set _speed value 0 if gallery opened from direct url and if it is first slide
        if (this.$LG('body').first().hasClass('lg-from-hash') &&
            event.detail.delay) {
            // will execute only once
            _speed = 0;
        }
        else {
            // Remove lg-from-hash to enable starting animation.
            this.$LG('body').first().removeClass('lg-from-hash');
        }
        this.zoomableTimeout = setTimeout(function () {
            if (!_this.isImageSlide()) {
                return;
            }
            _this.core.getSlideItem(event.detail.index).addClass('lg-zoomable');
            if (event.detail.index === _this.core.index) {
                _this.setZoomEssentials();
            }
        }, _speed + 30);
    };
    Zoom.prototype.enableZoomOnSlideItemLoad = function () {
        // Add zoomable class
        this.core.LGel.on(lGEvents.slideItemLoad + ".zoom", this.enableZoom.bind(this));
    };
    Zoom.prototype.getModifier = function (rotateValue, axis, el) {
        return 1;
    };
    Zoom.prototype.getImageSize = function ($image, rotateValue, axis) {
        var rect = $image.getBoundingClientRect();
        if (axis === 'x') {
            return rect.width;
        }
        else {
            return rect.height;
        }
    };
    Zoom.prototype.getDragCords = function (e, rotateValue) {
        if (rotateValue === 90) {
            return {
                x: e.pageY,
                y: e.pageX,
            };
        }
        else {
            return {
                x: e.pageX,
                y: e.pageY,
            };
        }
    };
    Zoom.prototype.getSwipeCords = function (e, rotateValue) {
        var x = e.targetTouches[0].pageX;
        var y = e.targetTouches[0].pageY;
        if (rotateValue === 90) {
            return {
                x: y,
                y: x,
            };
        }
        else {
            return {
                x: x,
                y: y,
            };
        }
    };
    /**
     *
     * @param scale When image portratit image is rotated and scaled, check the reset values
     * @returns
     */
    Zoom.prototype.getDragAllowedAxises = function (scale) {
        var $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-image')
            .first()
            .get();
        var height = 0;
        var width = 0;
        if (scale) {
            scale = scale || 1;
            height = $image.offsetHeight * scale;
            width = $image.offsetWidth * scale;
        }
        else {
            var rect = $image.getBoundingClientRect();
            height = rect.height;
            width = rect.width;
        }
        var allowY = height > this.containerRect.height;
        var allowX = width > this.containerRect.width;
        return {
            allowX: allowX,
            allowY: allowY,
        };
    };
    /**
     *
     * @param {Element} el
     * @return matrix(cos(X), sin(X), -sin(X), cos(X), 0, 0);
     * Get the current transform value
     */
    Zoom.prototype.getCurrentTransform = function (el) {
        if (!el) {
            return;
        }
        var st = window.getComputedStyle(el, null);
        var tm = st.getPropertyValue('-webkit-transform') ||
            st.getPropertyValue('-moz-transform') ||
            st.getPropertyValue('-ms-transform') ||
            st.getPropertyValue('-o-transform') ||
            st.getPropertyValue('transform') ||
            'none';
        if (tm !== 'none') {
            return tm.split('(')[1].split(')')[0].split(',');
        }
        return;
    };
    Zoom.prototype.getCurrentRotation = function (el) {
        if (!el) {
            return 0;
        }
        var values = this.getCurrentTransform(el);
        if (values) {
            return Math.round(Math.atan2(parseFloat(values[1]), parseFloat(values[0])) *
                (180 / Math.PI));
            // If you want rotate in 360
            //return (angle < 0 ? angle + 360 : angle);
        }
        return 0;
    };
    Zoom.prototype.setZoomEssentials = function () {
        var $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-image')
            .first();
        var rotateEl = this.core
            .getSlideItem(this.core.index)
            .find('.lg-img-rotate')
            .first()
            .get();
        this.rotateValue = 0;
        this.imageYSize = this.getImageSize($image.get(), this.rotateValue, 'y');
        this.imageXSize = this.getImageSize($image.get(), this.rotateValue, 'x');
        this.containerRect = this.core.$content.get().getBoundingClientRect();
        this.modifierX = this.getModifier(this.rotateValue, 'X', rotateEl);
        this.modifierY = this.getModifier(this.rotateValue, 'Y', rotateEl);
    };
    /**
     * @desc Image zoom
     * Translate the wrap and scale the image to get better user experience
     *
     * @param {String} scale - Zoom decrement/increment value
     */
    Zoom.prototype.zoomImage = function (scale, out) {
        // Find offset manually to avoid issue after zoom
        var offsetX = this.containerRect.width / 2 + this.containerRect.left;
        var _a = this.core.mediaContainerPosition; _a.top; _a.bottom;
        var offsetY = this.containerRect.height / 2 +
            this.containerRect.top +
            this.scrollTop;
        // (this.containerRect.height -
        //     this.imageYSize -
        //     topBottomSpacing * this.modifierX) /
        //     2 +
        // this.scrollTop +
        // this.containerRect.top;
        var originalX;
        var originalY;
        if (scale === 1) {
            this.positionChanged = false;
        }
        var dragAllowedAxises = this.getDragAllowedAxises(scale);
        console.log('dragAllowedAxises', dragAllowedAxises);
        var allowY = dragAllowedAxises.allowY, allowX = dragAllowedAxises.allowX;
        if (this.positionChanged) {
            originalX = this.left / this.scale;
            originalY = this.top / (out ? this.scale - 1 : this.scale - 1);
            this.pageX = offsetX - originalX;
            this.pageY = offsetY - originalY;
            this.positionChanged = false;
        }
        var possibleSwipeCords = this.getStaticPossibleSwipeDragCords(scale);
        var _x = offsetX - this.pageX;
        var _y = offsetY - this.pageY;
        var x = (scale - 1) * _x;
        var y = (scale - 1) * _y;
        console.log('possibleSwipeCords', possibleSwipeCords);
        console.log('y', y);
        if (allowX) {
            console.log('allox x');
            if (this.isBeyondPossibleLeft(x, possibleSwipeCords.minX)) {
                console.log('allox x min');
                x = possibleSwipeCords.minX;
            }
            else if (this.isBeyondPossibleRight(x, possibleSwipeCords.maxX)) {
                x = possibleSwipeCords.maxX;
            }
        }
        else {
            console.log('!allox');
            if (scale > 1) {
                if (x < possibleSwipeCords.minX) {
                    console.log('!allox x min');
                    x = possibleSwipeCords.minX;
                }
                else if (x > possibleSwipeCords.maxX) {
                    console.log('!allox x max');
                    x = possibleSwipeCords.maxX;
                }
            }
        }
        // @todo fix this
        if (allowY) {
            console.log('alloy y');
            if (this.isBeyondPossibleTop(y, possibleSwipeCords.minY)) {
                console.log('alloy y min');
                y = possibleSwipeCords.minY;
            }
            else if (this.isBeyondPossibleBottom(y, possibleSwipeCords.maxY)) {
                console.log('alloy y max');
                y = possibleSwipeCords.maxY;
            }
        }
        else {
            // If the translate value based on index of beyond the viewport, utilize the available space to prevent image being cut out
            if (scale > 1) {
                console.log('!alloy y');
                //If image goes beyond viewport top, use the minim possible translate value
                if (y < possibleSwipeCords.minY) {
                    console.log('!alloy y min');
                    y = possibleSwipeCords.minY;
                }
                else if (y > possibleSwipeCords.maxY) {
                    console.log('!alloy y max');
                    y = possibleSwipeCords.maxY;
                }
            }
        }
        this.setZoomStyles({
            x: x,
            y: y,
            scale: scale,
        }, possibleSwipeCords, dragAllowedAxises);
        // if (scale === actualSizeScale) {
        //     setTimeout(() => {
        //         if (possibleSwipeCords) {
        //             this.previousScale = scale;
        //             const $image = this.core
        //                 .getSlideItem(this.core.index)
        //                 .find('.lg-image')
        //                 .first();
        //             $image.addClass('reset-transition');
        //             setTimeout(() => {
        //                 if (allowX) {
        //                     x = Math.abs(possibleSwipeCords.minX);
        //                 } else {
        //                     x = Math.abs(possibleSwipeCords.minX)
        //                 }
        //                 if (allowY) {
        //                     const { top } = this.core.mediaContainerPosition;
        //                     y = Math.abs(possibleSwipeCords.minY) - top;
        //                 }
        //                 $image
        //                     .css('maxHeight', 'none')
        //                     .css('maxWidth', 'none')
        //                     .css(
        //                         'transform',
        //                         `translate3d(${Math.abs(x)}px, ${Math.abs(
        //                             y,
        //                         )}px, 0px)`,
        //                     );
        //             }, 10);
        //         }
        //     }, 600);
        // }
    };
    Zoom.prototype.resetImageTranslate = function () {
        var $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-image')
            .first();
        this.previousScale = false;
        $image.removeClass('reset-transition reset-transition-y reset-transition-x');
        $image.css('width', 'auto').css('height', 'auto');
        setTimeout(function () {
            $image.removeClass('no-transition');
        }, 10);
    };
    Zoom.prototype.setZoomImageSize = function (scale) {
        var _this = this;
        var $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-image')
            .first();
        setTimeout(function () {
            $image.addClass('no-transition');
        }, 500);
        setTimeout(function () {
            var dragAllowedAxises = _this.getDragAllowedAxises(_this.scale);
            // const translateX = dragAllowedAxises.allowX ? 50 : 0;
            // const translateY = dragAllowedAxises.allowY ? 50 : 0;
            // const resetTransformStyle = `scale3d(1, 1, 1) translate3d(-${translateX}%, -${translateY}%, 0px)`;
            // const leftStyle = `${translateX}%`;
            // const topStyle = `${translateY}%`;
            // $image
            //     .css('width', ($image.get() as any).naturalWidth + 'px')
            //     .css('height', ($image.get() as any).naturalHeight + 'px')
            //     .css('transform', resetTransformStyle)
            //     .css('left', leftStyle)
            //     .css('top', topStyle);
            $image
                .css('width', $image.get().naturalWidth + 'px')
                .css('height', $image.get().naturalHeight + 'px');
            if (dragAllowedAxises.allowX && dragAllowedAxises.allowY) {
                $image.addClass('reset-transition');
            }
            else if (dragAllowedAxises.allowX && !dragAllowedAxises.allowY) {
                $image.addClass('reset-transition-x');
            }
            else if (!dragAllowedAxises.allowX && dragAllowedAxises.allowY) {
                $image.addClass('reset-transition-y');
            }
        }, 550);
    };
    /**
     * @desc apply scale3d to image and translate to image wrap
     * @param {style} X,Y and scale
     */
    Zoom.prototype.setZoomStyles = function (style, possibleSwipeCords, dragAllowedAxises) {
        dragAllowedAxises.allowY; dragAllowedAxises.allowX;
        var $imageWrap = this.core
            .getSlideItem(this.core.index)
            .find('.lg-img-wrap')
            .first();
        var $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-image')
            .first();
        var $dummyImage = this.core.outer
            .find('.lg-current .lg-dummy-img')
            .first();
        this.scale = style.scale;
        $image.css('transform', 'scale3d(' + style.scale + ', ' + style.scale + ', 1)');
        $dummyImage.css('transform', 'scale3d(' + style.scale + ', ' + style.scale + ', 1)');
        var transform = 'translate3d(' + style.x + 'px, ' + style.y + 'px, 0)';
        $imageWrap.css('transform', transform);
        this.left = style.x;
        this.top = style.y;
    };
    /**
     * @param index - Index of the current slide
     * @param event - event will be available only if the function is called on clicking/taping the imags
     */
    Zoom.prototype.setActualSize = function (index, event) {
        var _this = this;
        var currentItem = this.core.galleryItems[this.core.index];
        this.resetImageTranslate();
        setTimeout(function () {
            // Allow zoom only on image
            if (!currentItem.src ||
                _this.core.outer.hasClass('lg-first-slide-loading')) {
                return;
            }
            var scale = _this.getCurrentImageActualSizeScale();
            if (_this.core.outer.hasClass('lg-zoomed')) {
                _this.scale = 1;
            }
            else {
                _this.scale = _this.getScale(scale);
            }
            _this.setPageCords(event);
            _this.beginZoom(_this.scale);
            _this.zoomImage(_this.scale);
            if (_this.scale >= scale) {
                _this.setZoomImageSize(_this.scale);
            }
            setTimeout(function () {
                _this.core.outer.removeClass('lg-grabbing').addClass('lg-grab');
            }, 10);
        }, 50);
    };
    Zoom.prototype.getNaturalWidth = function (index) {
        var $image = this.core.getSlideItem(index).find('.lg-image').first();
        var naturalWidth = this.core.galleryItems[index].width;
        return naturalWidth
            ? parseFloat(naturalWidth)
            : $image.get().naturalWidth;
    };
    Zoom.prototype.getActualSizeScale = function (naturalWidth, width) {
        var _scale;
        var scale;
        if (naturalWidth > width) {
            _scale = naturalWidth / width;
            scale = _scale || 2;
        }
        else {
            scale = 1;
        }
        return scale;
    };
    Zoom.prototype.getCurrentImageActualSizeScale = function () {
        var $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-image')
            .first();
        var width = $image.get().offsetWidth;
        var naturalWidth = this.getNaturalWidth(this.core.index) || width;
        return this.getActualSizeScale(naturalWidth, width);
    };
    Zoom.prototype.getPageCords = function (event) {
        var cords = {};
        if (event) {
            cords.x = event.pageX || event.targetTouches[0].pageX;
            cords.y = event.pageY || event.targetTouches[0].pageY;
        }
        else {
            var containerRect = this.core.$content
                .get()
                .getBoundingClientRect();
            cords.x = containerRect.width / 2 + containerRect.left;
            cords.y =
                containerRect.height / 2 + this.scrollTop + containerRect.top;
        }
        return cords;
    };
    Zoom.prototype.setPageCords = function (event) {
        var pageCords = this.getPageCords(event);
        this.pageX = pageCords.x;
        this.pageY = pageCords.y;
    };
    Zoom.prototype.manageActualPixelClassNames = function () {
        var $actualSize = this.core.getElementById('lg-actual-size');
        $actualSize
            .removeClass(this.settings.actualSizeIcons.zoomIn)
            .addClass(this.settings.actualSizeIcons.zoomOut);
    };
    // If true, zoomed - in else zoomed out
    Zoom.prototype.beginZoom = function (scale) {
        this.core.outer.removeClass('lg-zoom-drag-transition lg-zoom-dragging');
        if (scale > 1) {
            this.core.outer.addClass('lg-zoomed');
            this.manageActualPixelClassNames();
        }
        else {
            this.resetZoom();
        }
        return scale > 1;
    };
    Zoom.prototype.getScale = function (scale) {
        var actualSizeScale = this.getCurrentImageActualSizeScale();
        if (scale < 1) {
            scale = 1;
        }
        else if (scale > actualSizeScale) {
            scale = actualSizeScale;
        }
        return scale;
    };
    Zoom.prototype.init = function () {
        var _this = this;
        if (!this.settings.zoom) {
            return;
        }
        this.buildTemplates();
        this.enableZoomOnSlideItemLoad();
        var tapped = null;
        this.core.outer.on('dblclick.lg', function (event) {
            if (!_this.$LG(event.target).hasClass('lg-image')) {
                return;
            }
            _this.setActualSize(_this.core.index, event);
        });
        this.core.outer.on('touchstart.lg', function (event) {
            var $target = _this.$LG(event.target);
            if (event.targetTouches.length === 1 &&
                $target.hasClass('lg-image')) {
                if (!tapped) {
                    tapped = setTimeout(function () {
                        tapped = null;
                    }, 300);
                }
                else {
                    clearTimeout(tapped);
                    tapped = null;
                    event.preventDefault();
                    _this.setActualSize(_this.core.index, event);
                }
            }
        });
        // Update zoom on resize and orientationchange
        this.core.LGel.on(lGEvents.containerResize + ".zoom " + lGEvents.rotateRight + ".zoom " + lGEvents.rotateLeft + ".zoom " + lGEvents.flipHorizontal + ".zoom " + lGEvents.flipVertical + ".zoom", function () {
            if (!_this.core.lgOpened || !_this.isImageSlide())
                return;
            _this.setPageCords();
            _this.setZoomEssentials();
            if (_this.scale > 1) {
                _this.zoomImage(_this.scale);
            }
        });
        // Update zoom on resize and orientationchange
        this.$LG(window).on("scroll.lg.zoom.global" + this.core.lgId, function () {
            if (!_this.core.lgOpened)
                return;
            _this.scrollTop = _this.$LG(window).scrollTop();
        });
        this.core.getElementById('lg-zoom-out').on('click.lg', function () {
            if (_this.core.outer.find('.lg-current .lg-image').get()) {
                var scale = _this.scale - _this.settings.scale;
                scale = _this.getScale(scale);
                _this.beginZoom(scale);
                _this.zoomImage(scale, true);
            }
        });
        this.core.getElementById('lg-zoom-in').on('click.lg', function () {
            _this.zoomIn();
        });
        this.core.getElementById('lg-actual-size').on('click.lg', function () {
            _this.setActualSize(_this.core.index);
        });
        this.core.LGel.on(lGEvents.beforeOpen + ".zoom", function () {
            _this.core.outer.find('.lg-item').removeClass('lg-zoomable');
        });
        this.core.LGel.on(lGEvents.afterOpen + ".zoom", function () {
            _this.scrollTop = _this.$LG(window).scrollTop();
            // Set the initial value center
            _this.pageX = _this.core.outer.width() / 2;
            _this.pageY = _this.core.outer.height() / 2 + _this.scrollTop;
            _this.scale = 1;
        });
        // Reset zoom on slide change
        this.core.LGel.on(lGEvents.afterSlide + ".zoom", function (event) {
            var prevIndex = event.detail.prevIndex;
            _this.scale = 1;
            _this.positionChanged = false;
            _this.resetZoom(prevIndex);
            if (_this.isImageSlide()) {
                _this.setZoomEssentials();
            }
        });
        // Drag option after zoom
        this.zoomDrag();
        this.pinchZoom();
        this.zoomSwipe();
        // Store the zoomable timeout value just to clear it while closing
        this.zoomableTimeout = false;
        this.positionChanged = false;
    };
    Zoom.prototype.zoomIn = function () {
        // Allow zoom only on image
        if (!this.isImageSlide()) {
            return;
        }
        var scale = this.scale + this.settings.scale;
        scale = this.getScale(scale);
        this.beginZoom(scale);
        this.zoomImage(scale);
    };
    // Reset zoom effect
    Zoom.prototype.resetZoom = function (index) {
        this.core.outer.removeClass('lg-zoomed lg-zoom-drag-transition');
        var $actualSize = this.core.getElementById('lg-actual-size');
        var $item = this.core.getSlideItem(index !== undefined ? index : this.core.index);
        $actualSize
            .removeClass(this.settings.actualSizeIcons.zoomOut)
            .addClass(this.settings.actualSizeIcons.zoomIn);
        $item.find('.lg-img-wrap').first().removeAttr('style');
        $item.find('.lg-image').first().removeAttr('style');
        this.scale = 1;
        this.left = 0;
        this.top = 0;
        // Reset pagx pagy values to center
        this.setPageCords();
    };
    Zoom.prototype.getTouchDistance = function (e) {
        return Math.sqrt((e.targetTouches[0].pageX - e.targetTouches[1].pageX) *
            (e.targetTouches[0].pageX - e.targetTouches[1].pageX) +
            (e.targetTouches[0].pageY - e.targetTouches[1].pageY) *
                (e.targetTouches[0].pageY - e.targetTouches[1].pageY));
    };
    Zoom.prototype.pinchZoom = function () {
        var _this = this;
        var startDist = 0;
        var pinchStarted = false;
        var initScale = 1;
        var $item = this.core.getSlideItem(this.core.index);
        this.core.$inner.on('touchstart.lg', function (e) {
            $item = _this.core.getSlideItem(_this.core.index);
            if (!_this.isImageSlide()) {
                return;
            }
            if (e.targetTouches.length === 2 &&
                !_this.core.outer.hasClass('lg-first-slide-loading') &&
                (_this.$LG(e.target).hasClass('lg-item') ||
                    $item.get().contains(e.target))) {
                initScale = _this.scale || 1;
                _this.core.outer.removeClass('lg-zoom-drag-transition lg-zoom-dragging');
                _this.resetImageTranslate();
                _this.core.touchAction = 'pinch';
                startDist = _this.getTouchDistance(e);
            }
        });
        this.core.$inner.on('touchmove.lg', function (e) {
            if (e.targetTouches.length === 2 &&
                _this.core.touchAction === 'pinch' &&
                (_this.$LG(e.target).hasClass('lg-item') ||
                    $item.get().contains(e.target))) {
                e.preventDefault();
                var endDist = _this.getTouchDistance(e);
                var distance = startDist - endDist;
                if (!pinchStarted && Math.abs(distance) > 5) {
                    pinchStarted = true;
                }
                if (pinchStarted) {
                    _this.scale = Math.max(1, initScale + -distance * 0.008);
                    _this.zoomImage(_this.scale);
                }
            }
        });
        this.core.$inner.on('touchend.lg', function (e) {
            if (_this.core.touchAction === 'pinch' &&
                (_this.$LG(e.target).hasClass('lg-item') ||
                    $item.get().contains(e.target))) {
                pinchStarted = false;
                startDist = 0;
                if (_this.scale <= 1) {
                    _this.resetZoom();
                }
                else {
                    _this.scale = _this.getScale(_this.scale);
                    _this.zoomImage(_this.scale);
                    _this.manageActualPixelClassNames();
                    var actualSizeScale = _this.getCurrentImageActualSizeScale();
                    if (_this.scale >= actualSizeScale) {
                        _this.setZoomImageSize(_this.scale);
                    }
                    _this.core.outer.addClass('lg-zoomed');
                }
                _this.core.touchAction = undefined;
            }
        });
    };
    Zoom.prototype.touchendZoom = function (startCoords, endCoords, allowX, allowY, touchDuration, rotateValue) {
        var distanceXnew = endCoords.x - startCoords.x;
        var distanceYnew = endCoords.y - startCoords.y;
        var speedX = Math.abs(distanceXnew) / touchDuration + 1;
        var speedY = Math.abs(distanceYnew) / touchDuration + 1;
        if (speedX > 2) {
            speedX += 1;
        }
        if (speedY > 2) {
            speedY += 1;
        }
        distanceXnew = distanceXnew * speedX;
        distanceYnew = distanceYnew * speedY;
        var _LGel = this.core
            .getSlideItem(this.core.index)
            .find('.lg-img-wrap')
            .first();
        var distance = {};
        distance.x = this.left + distanceXnew * this.modifierX;
        distance.y = this.top + distanceYnew * this.modifierY;
        var possibleSwipeCords = this.getPossibleSwipeDragCords(rotateValue, 1);
        if (Math.abs(distanceXnew) > 15 || Math.abs(distanceYnew) > 15) {
            if (allowY) {
                if (this.isBeyondPossibleTop(distance.y, possibleSwipeCords.minY)) {
                    distance.y = possibleSwipeCords.minY;
                }
                else if (this.isBeyondPossibleBottom(distance.y, possibleSwipeCords.maxY)) {
                    distance.y = possibleSwipeCords.maxY;
                }
            }
            if (allowX) {
                if (this.isBeyondPossibleLeft(distance.x, possibleSwipeCords.minX)) {
                    distance.x = possibleSwipeCords.minX;
                }
                else if (this.isBeyondPossibleRight(distance.x, possibleSwipeCords.maxX)) {
                    distance.x = possibleSwipeCords.maxX;
                }
            }
            if (allowY) {
                this.top = distance.y;
            }
            else {
                distance.y = this.top;
            }
            if (allowX) {
                this.left = distance.x;
            }
            else {
                distance.x = this.left;
            }
            this.setZoomSwipeStyles(_LGel, distance);
            this.positionChanged = true;
        }
    };
    Zoom.prototype.getZoomSwipeCords = function (startCoords, endCoords, allowX, allowY, possibleSwipeCords) {
        var distance = {};
        if (allowY) {
            distance.y =
                this.top + (endCoords.y - startCoords.y) * this.modifierY;
            if (this.isBeyondPossibleTop(distance.y, possibleSwipeCords.minY)) {
                var diffMinY = possibleSwipeCords.minY - distance.y;
                distance.y = possibleSwipeCords.minY - diffMinY / 6;
            }
            else if (this.isBeyondPossibleBottom(distance.y, possibleSwipeCords.maxY)) {
                var diffMaxY = distance.y - possibleSwipeCords.maxY;
                distance.y = possibleSwipeCords.maxY + diffMaxY / 6;
            }
        }
        else {
            distance.y = this.top;
        }
        if (allowX) {
            distance.x =
                this.left + (endCoords.x - startCoords.x) * this.modifierX;
            if (this.isBeyondPossibleLeft(distance.x, possibleSwipeCords.minX)) {
                var diffMinX = possibleSwipeCords.minX - distance.x;
                distance.x = possibleSwipeCords.minX - diffMinX / 6;
            }
            else if (this.isBeyondPossibleRight(distance.x, possibleSwipeCords.maxX)) {
                var difMaxX = distance.x - possibleSwipeCords.maxX;
                distance.x = possibleSwipeCords.maxX + difMaxX / 6;
            }
        }
        else {
            distance.x = this.left;
        }
        return distance;
    };
    Zoom.prototype.isBeyondPossibleLeft = function (x, minX) {
        return x >= minX;
    };
    Zoom.prototype.isBeyondPossibleRight = function (x, maxX) {
        return x <= maxX;
    };
    Zoom.prototype.isBeyondPossibleTop = function (y, minY) {
        return y >= minY;
    };
    Zoom.prototype.isBeyondPossibleBottom = function (y, maxY) {
        return y <= maxY;
    };
    Zoom.prototype.isImageSlide = function () {
        var currentItem = this.core.galleryItems[this.core.index];
        return this.core.getSlideType(currentItem) === 'image';
    };
    Zoom.prototype.getPossibleSwipeDragCords = function (rotateValue, scale) {
        var dataScale = scale || this.scale || 1;
        var $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-image')
            .first();
        var elDataScale = $image.hasClass('no-transition')
            ? 1
            : Math.abs(dataScale);
        var _a = this.core.mediaContainerPosition; _a.top; var bottom = _a.bottom;
        // SCale should not conside if transition is reset
        this.imageYSize = this.getImageSize($image.get(), this.rotateValue, 'y');
        this.imageXSize = this.getImageSize($image.get(), this.rotateValue, 'x');
        var minY = (this.imageYSize * elDataScale - this.containerRect.height) / 2;
        var maxY = (this.containerRect.height - this.imageYSize * elDataScale) / 2 +
            bottom;
        var minX = (this.imageXSize * elDataScale - this.containerRect.width) / 2;
        var maxX = (this.containerRect.width - this.imageXSize * elDataScale) / 2;
        var possibleSwipeCords = {
            minY: minY,
            maxY: maxY,
            minX: minX,
            maxX: maxX,
        };
        return possibleSwipeCords;
    };
    Zoom.prototype.getStaticPossibleSwipeDragCords = function (scale) {
        var dataScale = scale || this.scale || 1;
        var $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-image')
            .first();
        var elDataScale = $image.hasClass('no-transition')
            ? 1
            : Math.abs(dataScale);
        var _a = this.core.mediaContainerPosition; _a.top; var bottom = _a.bottom;
        // SCale should not conside if transition is reset
        var imageYSize = $image.get().offsetHeight;
        var imageXSize = $image.get().offsetWidth;
        var minY = (imageYSize * elDataScale - this.containerRect.height) / 2;
        var maxY = (this.containerRect.height - imageYSize * elDataScale) / 2 + bottom;
        var minX = (imageXSize * elDataScale - this.containerRect.width) / 2;
        var maxX = (this.containerRect.width - imageXSize * elDataScale) / 2;
        var possibleSwipeCords = {
            minY: minY,
            maxY: maxY,
            minX: minX,
            maxX: maxX,
        };
        return possibleSwipeCords;
    };
    Zoom.prototype.setZoomSwipeStyles = function (LGel, distance) {
        LGel.css('transform', 'translate3d(' + distance.x + 'px, ' + distance.y + 'px, 0)');
    };
    Zoom.prototype.zoomSwipe = function () {
        var _this = this;
        var startCoords = {};
        var endCoords = {};
        var isMoved = false;
        // Allow x direction drag
        var allowX = false;
        // Allow Y direction drag
        var allowY = false;
        var startTime = new Date();
        var endTime = new Date();
        var possibleSwipeCords;
        var _LGel;
        var $item = this.core.getSlideItem(this.core.index);
        this.core.$inner.on('touchstart.lg', function (e) {
            // Allow zoom only on image
            if (!_this.isImageSlide()) {
                return;
            }
            $item = _this.core.getSlideItem(_this.core.index);
            if ((_this.$LG(e.target).hasClass('lg-item') ||
                $item.get().contains(e.target)) &&
                e.targetTouches.length === 1 &&
                _this.core.outer.hasClass('lg-zoomed')) {
                e.preventDefault();
                startTime = new Date();
                _this.core.touchAction = 'zoomSwipe';
                _LGel = _this.core
                    .getSlideItem(_this.core.index)
                    .find('.lg-img-wrap')
                    .first();
                var dragAllowedAxises = _this.getDragAllowedAxises();
                allowY = dragAllowedAxises.allowY;
                allowX = dragAllowedAxises.allowX;
                if (allowX || allowY) {
                    startCoords = _this.getSwipeCords(e, Math.abs(_this.rotateValue));
                }
                possibleSwipeCords = _this.getPossibleSwipeDragCords(_this.rotateValue, 1);
                // reset opacity and transition duration
                _this.core.outer.addClass('lg-zoom-dragging lg-zoom-drag-transition');
            }
        });
        this.core.$inner.on('touchmove.lg', function (e) {
            if (e.targetTouches.length === 1 &&
                _this.core.touchAction === 'zoomSwipe' &&
                (_this.$LG(e.target).hasClass('lg-item') ||
                    $item.get().contains(e.target))) {
                e.preventDefault();
                _this.core.touchAction = 'zoomSwipe';
                endCoords = _this.getSwipeCords(e, Math.abs(_this.rotateValue));
                var distance = _this.getZoomSwipeCords(startCoords, endCoords, allowX, allowY, possibleSwipeCords);
                if (Math.abs(endCoords.x - startCoords.x) > 15 ||
                    Math.abs(endCoords.y - startCoords.y) > 15) {
                    isMoved = true;
                    _this.setZoomSwipeStyles(_LGel, distance);
                }
            }
        });
        this.core.$inner.on('touchend.lg', function (e) {
            if (_this.core.touchAction === 'zoomSwipe' &&
                (_this.$LG(e.target).hasClass('lg-item') ||
                    $item.get().contains(e.target))) {
                _this.core.touchAction = undefined;
                _this.core.outer.removeClass('lg-zoom-dragging');
                if (!isMoved) {
                    return;
                }
                isMoved = false;
                endTime = new Date();
                var touchDuration = endTime.valueOf() - startTime.valueOf();
                _this.touchendZoom(startCoords, endCoords, allowX, allowY, touchDuration, _this.rotateValue);
            }
        });
    };
    Zoom.prototype.zoomDrag = function () {
        var _this = this;
        var startCoords = {};
        var endCoords = {};
        var isDragging = false;
        var isMoved = false;
        // Allow x direction drag
        var allowX = false;
        // Allow Y direction drag
        var allowY = false;
        var startTime;
        var endTime;
        var possibleSwipeCords;
        var _LGel;
        this.core.outer.on('mousedown.lg.zoom', function (e) {
            // Allow zoom only on image
            if (!_this.isImageSlide()) {
                return;
            }
            var $item = _this.core.getSlideItem(_this.core.index);
            if (_this.$LG(e.target).hasClass('lg-item') ||
                $item.get().contains(e.target)) {
                startTime = new Date();
                _LGel = _this.core
                    .getSlideItem(_this.core.index)
                    .find('.lg-img-wrap')
                    .first();
                var dragAllowedAxises = _this.getDragAllowedAxises();
                allowY = dragAllowedAxises.allowY;
                allowX = dragAllowedAxises.allowX;
                if (_this.core.outer.hasClass('lg-zoomed')) {
                    if (_this.$LG(e.target).hasClass('lg-object') &&
                        (allowX || allowY)) {
                        e.preventDefault();
                        startCoords = _this.getDragCords(e, Math.abs(_this.rotateValue));
                        possibleSwipeCords = _this.getPossibleSwipeDragCords(_this.rotateValue, 1);
                        isDragging = true;
                        // ** Fix for webkit cursor issue https://code.google.com/p/chromium/issues/detail?id=26723
                        _this.core.outer.get().scrollLeft += 1;
                        _this.core.outer.get().scrollLeft -= 1;
                        _this.core.outer
                            .removeClass('lg-grab')
                            .addClass('lg-grabbing lg-zoom-drag-transition lg-zoom-dragging');
                        // reset opacity and transition duration
                    }
                }
            }
        });
        this.$LG(window).on("mousemove.lg.zoom.global" + this.core.lgId, function (e) {
            if (isDragging) {
                isMoved = true;
                endCoords = _this.getDragCords(e, Math.abs(_this.rotateValue));
                var distance = _this.getZoomSwipeCords(startCoords, endCoords, allowX, allowY, possibleSwipeCords);
                _this.setZoomSwipeStyles(_LGel, distance);
            }
        });
        this.$LG(window).on("mouseup.lg.zoom.global" + this.core.lgId, function (e) {
            if (isDragging) {
                endTime = new Date();
                isDragging = false;
                _this.core.outer.removeClass('lg-zoom-dragging');
                // Fix for chrome mouse move on click
                if (isMoved &&
                    (startCoords.x !== endCoords.x ||
                        startCoords.y !== endCoords.y)) {
                    endCoords = _this.getDragCords(e, Math.abs(_this.rotateValue));
                    var touchDuration = endTime.valueOf() - startTime.valueOf();
                    _this.touchendZoom(startCoords, endCoords, allowX, allowY, touchDuration, _this.rotateValue);
                }
                isMoved = false;
            }
            _this.core.outer.removeClass('lg-grabbing').addClass('lg-grab');
        });
    };
    Zoom.prototype.closeGallery = function () {
        this.resetZoom();
    };
    Zoom.prototype.destroy = function () {
        // Unbind all events added by lightGallery zoom plugin
        this.$LG(window).off(".lg.zoom.global" + this.core.lgId);
        this.core.LGel.off('.lg.zoom');
        this.core.LGel.off('.zoom');
        clearTimeout(this.zoomableTimeout);
        this.zoomableTimeout = false;
    };
    return Zoom;
}());

export default Zoom;
//# sourceMappingURL=lg-zoom.es5.js.map
