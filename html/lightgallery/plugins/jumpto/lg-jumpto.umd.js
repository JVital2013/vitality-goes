/*!
 * LightGallery JumpTo
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * 2022 Jamie Vital
 * @license GPLv3
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.lgJumpTo = factory());
}(this, (function () { 'use strict';

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

    var jumptoSettings = {};

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

    var JumpTo = /** @class */ (function () {
        function JumpTo(instance, $LG) {
            // get lightGallery core plugin instance
            this.core = instance;
            this.$LG = $LG;
            this.settings = __assign(__assign({}, jumptoSettings), this.core.settings);
            return this;
        }
        // Append Jump to control
        JumpTo.prototype.buildTemplates = function () {
            var jumptoIcons = "<button id=\"" + this.core.getIdName('lg-jumpto') + "\" type=\"button\" aria-label=\"Jump to...\" class=\"lg-jumptobutton\"></button>";
            this.core.$toolbar.first().append(jumptoIcons);
        };
        
        JumpTo.prototype.init = function () {
			this.buildTemplates();
			
            var _this = this;
			var _maxZ = Math.max(...Array.from(document.querySelectorAll('body *'), el => parseFloat(window.getComputedStyle(el).zIndex),).filter(zIndex => !Number.isNaN(zIndex)), 0,);
			var _simplePicker = new SimplePicker(_this.core.$content.firstElement, {zIndex: _maxZ, compactMode: true});
			var _timestamps = _this.core.galleryItems.map(item => item.timestamp);
			
			_simplePicker.on('submit', function(date, readableDate) {
				var dateToFind = date.getTime() / 1000;
				_this.core.slide(_timestamps.indexOf(_timestamps.reduce(function(prev, curr) {return (Math.abs(curr - dateToFind) < Math.abs(prev - dateToFind) ? curr : prev);})));
			});
			
            this.core.getElementById('lg-jumpto').on('click.lg', function () {
				_simplePicker.reset(new Date(_this.core.galleryItems[_this.core.index].timestamp * 1000));
				_simplePicker.open();
            });
        };
        
        JumpTo.prototype.destroy = function (){};
        return JumpTo;
    }());

    return JumpTo;

})));
