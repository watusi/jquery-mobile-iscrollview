/******************************************************************************
  jslint directives. In case you hate yourself, and need that reinforced...

  You will still get a few warnings that can't be turned off, or that I'm just
  too stubborn to "fix"

  sloppy, white: let me indent any way I damn please! I like to line things
                 up nice and purty.

  nomen: tolerate leading _ for variable names. Leading _ is a requirement for
         JQuery Widget Factory private members
*******************************************************************************/

/*jslint browser: true, sloppy: true, white: true, nomen: true, regexp: true, maxerr: 50, indent: 2 */
/*global jQuery:false, iScroll:false, console:false, Event:false*/

/*******************************************************************************
  But instead, be kind to yourself, and use jshint.

  Note jshint nomen and white options are opposite of jslint

  You can't specify an indent of you use white: false, otherwise it will
  still complain
*******************************************************************************/

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true,
         undef:true, curly:true, browser:true, jquery:true, indent:2, maxerr:50,
         white:false, nomen:false */

/*
jquery.mobile.iscrollview.js
Version: 1.1+
jQuery Mobile iScroll4 view widget
Copyright (c), 2012 Watusiware Corporation
Distributed under the MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following
conditions: NO ADDITIONAl CONDITIONS.

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

Derived in part from jquery.mobile.iscroll.js:
Portions Copyright (c) Kazuhiro Osawa
Dual licensed under the MIT or GPL Version 2 licenses.

Derived in part from (jQuery mobile) jQuery UI Widget-factory
plugin boilerplate (for 1.8/9+)
Author: @scottjehl
Further changes: @addyosmani
Licensed under the MIT license

dependency:  iScroll 4.1.9 https://github.com/cubiq/iscroll or later or,
             iScroll fork https://github.com/watusi/iscroll (watusi branch) preferably
             jquery.actual 1.0.6 https://github.com/dreamerslab/jquery.actual
             jQuery 1.6.4  (JQM 1.0.1) or 1.7.1 (JQM 1.1)
             JQuery Mobile = 1.0.1 or 1.1
*/

;   // Ignore jslint/jshint warning - for safety - terminate previous file if unterminated

(function ($, window, document) { 
  "use strict";

  //----------------------------------
  // "class constants"
  //----------------------------------
  var IsWebkit =  (/webkit/i).test(navigator.appVersion),
      IsAndroid = (/android/gi).test(navigator.appVersion),
      IsFirefox = (/firefox/i).test(navigator.userAgent),

      IsIDevice = (/(iPhone|iPad|iPod).*AppleWebKit/).test(navigator.appVersion),
      IsIPad = (/iPad.*AppleWebKit/).test(navigator.appVersion),
      // IDevice running Mobile Safari - not embedded UIWebKit or Standalone (= saved to desktop)
      IsMobileSafari = (/(iPhone|iPad|iPod).*AppleWebKit.*Safari/).test(navigator.appVersion),
      // IDevice native app using embedded UIWebView
      IsUIWebView = (/(iPhone|iPad|iPod).*AppleWebKit.(?!.*Safari)/).test(navigator.appVersion),
      // Standalone is when running a website saved to the desktop (SpringBoard)
      IsIDeviceStandalone = IsIDevice && window.navigator.Standalone,

      IScrollHasDimensionFunctions = iScroll.prototype._clientWidth !== undefined,

      // Kludgey way to seeing if we have JQM 1.1 or higher, since there apparently is no
      // way to access the version number!
      JQMIsLT11 = !$.fn.jqmEnhanceable;

  //===============================================================================
  // This essentially subclasses iScroll. Originally, this was just so that we could
  // inject an iscrollview variable at the time of construction (so that it is
  // available from the refresh callback which is first called during construction).
  // But now we override several iScroll methods, as well.
  //===============================================================================
    // See: www.golimojo.com/etc/js-subclass.html
  function _subclass(constructor, superConstructor) {
    function SurrogateConstructor() {}
    SurrogateConstructor.prototype = superConstructor.prototype;
    var prototypeObject = new SurrogateConstructor();
    prototypeObject.constructor = constructor;
    constructor.prototype = prototypeObject;
    }

  function IScroll(iscrollview, scroller, options) {

    // We need to add an iscrollview member to iScroll, so that we can efficiently
    // pass the iscrollview when triggering jQuery events. Otherwise, we'd have to
    // make a call to $(wrapper).jqmData() on each event trigger, which could have an impact
    // on performance for high-frequency events.
    this.iscrollview = iscrollview;

    // The following functions are called from the proxy event functions. These are things
    // we want to do in certain iScroll4 events.

    // Emulate bottomOffset functionality in case iScroll doesn't have patch for bottomOffset
    this._emulateBottomOffset =  function(e) {
      if (this.iscrollview.options.emulateBottomOffset) {
        this.maxScrollY = this.wrapperH - this.scrollerH +
          this.minScrollY + this.iscrollview.options.bottomOffset;
        }
    };

    // Allow events through to input elements
    this._fixInput = function(e) {
     if (this.iscrollview.options.fixInput ) {
       var tagName,
           target = e.target;
       while (target.nodeType !== 1) { target = target.parentNode; }
         tagName = target.tagName.toLowerCase();
         if (tagName === "select" || tagName === "input" || tagName === "textarea") {
           return;
         }
       }
      if (this.iscrollview.options.preventTouchHover) { e.stopImmediatePropagation(); }
      else                                            { e.preventDefault(); }
    };

    // Perform an iScroll callback.
    this._doCallback = function(callbackName, e, f) {
      var v = this.iscrollview,
          then = v._logCallback(callbackName, e);
      if (f) { f.call(this, e); }                          // Perform passed function if present
      v._trigger(callbackName.toLowerCase, e, {"iscrollview": v}); // Then trigger widget event
      v._logCallback(callbackName, e, then);
    };

    // Override _bind and _unbind functions in iScroll, so that we can monitor performance,
    // gain control over events reaching/not reaching iScroll, and potentially use jQuery events
    // instead of addEventListener().
    //
    // As of v1.2, using jQuery events is an experimental feature, and does not work in all
    // scenarios. For example, jQuery 1.7.1 breaks mousewheel support. This feature is left in
    // only to permit further experimentation.
    //
    // If using jQuery events, we ignore bubble (really, useCapture) parameter. Fortunately,
    // iScroll never uses it.
    //
    // If using jQuery events, we substitute jQuery's mouseleave for mouseout, to prevent iScroll
    // from getting a cascade of events when the mouse enters some inner element within the
    // scroller. iScroll is only interested in the mouse leaving the scroller to the OUTSIDE.
    // While iScroll doesn't spend much time in the callback if moving to an inner element,
    // the cascade of events is annoying when monitoring performance with the debug option.

    this._bind = function (type, el, bubble) {
      var jqEvents = this.iscrollview.options.bindIscrollUsingJqueryEvents,
          _type =  jqEvents && type === "mouseout" ? "mouseleave" : type;
      // Ignore attempt to bind to orientationchange or resize, since the widget handles that
      if (type === "orientationchange" || type === "resize") {
        this.iscrollview._logIscrollEvent("iScroll bind (ignored)", type);
        return;
      }
      this.iscrollview._logIscrollEvent("iScroll bind", type);
      if (jqEvents) { (el ? $(el) : this.iscrollview.$scroller).bind(_type, $.proxy(this.handleEvent, this)); }
      else          { (el || this.scroller).addEventListener(_type, this, !!bubble); }
    };

    this._unbind = function(type, el, bubble) {
      var jqEvents = this.iscrollview.options.bindIscrollUsingJqueryEvents,
          _type = jqEvents && type === "mouseout" ? "mouseleave" : type;
      if (type === "orientationchange" || type === "resize") {
        this.iscrollview._logIscrollEvent("iScroll unbind (ignored)");
        return;
      }
      this.iscrollview._logIscrollEvent("iScroll unbind", type);
      if (jqEvents) { $(el || this.iscrollview.$scroller).unbind(_type, this.handleEvent); }
      else          {  (el || this.scroller).removeEventListener(_type, this, !!bubble); }
    };

    // Save a reference to the original handleEvent in iScroll. We'll need to call it from our
    // override.
    this._origHandleEvent = iScroll.prototype.handleEvent;

    // Shim around iScroll.handleEvent, allows us to trace
    this.handleEvent = function(e) {
      var jqEvents = this.iscrollview.options.bindIscrollUsingJqueryEvents,
          then;
      then = this.iscrollview._logIscrollEvent("iScroll.handleEvent", e);
      // If jQuery mouseleave, make iScroll think we are handling a mouseout event
      if (jqEvents && e.type === "mouseleave") {
        e.type = "mouseout";
        this._origHandleEvent(e);
        e.type = "mouseleave";
        }
      else { this._origHandleEvent(e); }
      this.iscrollview._logIscrollEvent("iScroll.handleEvent", e, then);
    };

    // Override _resize function in iScroll, which calls refresh() and is only called on resize
    // and orientationchange events. We call refresh() when necessary, so these are redundant.
    // As well, some refreshes are deferred, and the user will need to refresh any jQuery Mobile
    // widgets using a callbackBefore. So, it makes no sense to have iScroll do event-based
    // refresh.
    this._resize = function() { };

    // Override width/height functions (if present in patched iScroll) with our own. These use
    // jquery.actual to get the height/width while a page is loaded but hidden. So, refresh()
    // will work at the time of construction at pagecreate, or at pagebeforeshow.
    //
    // jquery.actual is considerably slower than the direct DOM dimension functions
    // or jQuery's dimension functons, but this enables us to construct the iscrollview
    // while the page is initially hidden, avoiding visual distraction.
    //
    // Using the WatisiWare fork of jqery.actual is considerably faster than the original
    // jquery.actual. Originally, it saved and restored CSS properties of the element and
    // it's parents (if hidden). However, it is much faster to save and restore
    // the style attribute, as well as more proper.
    //
    // So, it is a reasonable tradeoff to use jquery.actual, while limiting it's use to
    // situations where it is actually necessary.

    this._clientWidth  = function(ele) {
      if (this.iscrollview.$page.is(":hidden")) { return $(ele).actual("innerWidth"); }
      return ele.clientWidth;
      };

    this._clientHeight = function(ele) {
      if (this.iscrollview.$page.is(":hidden")) { return $(ele).actual("innerHeight"); }
      return ele.clientHeight;
      };

    this._offsetWidth  = function(ele) {
      if (this.iscrollview.$page.is(":hidden")) { return $(ele).actual("outerWidth"); }
      return ele.offsetWidth;
      };

    this._offsetHeight = function(ele) {
      if (this.iscrollview.$page.is(":hidden")) { return $(ele).actual("outerHeight"); }
      return ele.offsetHeight;
      };

    iScroll.call(this, scroller, options);
    }

  _subclass(IScroll, iScroll);
  $.widget("mobile.iscrollview", $.mobile.widget, {

  widgetEventPrefix: "iscroll_",

  //=========================================================
  // All instance variables are declared here. This is not
  // strictly necessary, but is helpful to document the use
  // of instance variables.
  //=========================================================

  iscroll:            null,  // The underlying iScroll object
  $wrapper:           null,  // The wrapper element
  $scroller:          null,  // The scroller element (first child of wrapper)
  $pullDown:          null,  // The pull-down element (if any)
  $pullUp:            null,  // The pull-up element (if any)
  $pullUpSpacer:      null,
  $page:              null,  // The page element that contains the wrapper
  _wrapperHeightAdjustForBoxModel: 0,  // This is set in _create

  _firstWrapperResize:     true,  // True on first resize, so we can capture original wrapper height
  _firstScrollerExpand:    true,  // True on first scroller expand, so we can capture original CSS

  _barsHeight:       null,   // Total height of headers, footers, etc.

  // True if this scroller is "dirty" - i.e. needs refresh because refresh
  // was deferred when the page was not the active page.
  _dirty:               false,
  _dirtyCallbackBefore: null,
  _dirtyCallbackAfter:  null,
  _dirtyContext:        null,

  _sizeDirty:     false,  // True if wrapper resize is needed

  //----------------------------------------------------
  // Options to be used as defaults
  //----------------------------------------------------
  options: {
    // iScroll4 options
    // We only define those options here which have values that differ from
    // iscroll4 defaults.
    hScroll:    false,   // iScroll4 default is true
    hScrollbar: false,   // iScroll4 default is true

    // Additional iScroll4 options will be back-filled from iscroll4

    // iscrollview widget options

    debug: false,                      // Enable some messages to console
                                       // Debug true needed for any trace options
    traceResizeWrapper: false,         // Enable to trace resize wrapper
    traceRefresh: false,               // Enable to trace refresh
    traceCreateDestroy: false,         // Enable to trace create/destroy
    traceIscrollEvents: false,         // Enable to trace events handled by iScroll
    tracedIscrollEvents: [],           // List of specific iScroll events to trace, empty list for all
                                       // Items are strings, like "touchstart"
    traceWidgetEvents: false,          // Enable to trace events registered by widget
    // Note: in some cases we might bind to multiple events. You will have to include the multiple
    // events in one string to filter on such a bind. For example, "resize orientationchange"
    tracedWidgetEvents: [],            // List of specific widget events to trace
    traceIscrollCallbacks: false,      // Enable to trace iScroll callbacks to the widget
    tracedIscrollCallbacks: [],        // List of specific iScroll callbacks to trace, empty list for all
                                       // Items are strings, like "onRefresh"
    traceWidgetCallbacks: false,
    tracedWidgetCallbacks: [],


    // bottomOffset is currently only in Watusi-patched iScroll. We emulate it in case it isn't
    // there.
    bottomOffset: 0,
    emulateBottomOffset: true,

    pageClass:       "iscroll-page",        // Class to be applied to pages containing this widget
    wrapperClass:    "iscroll-wrapper",     // Class to be applied to wrapper containing this widget
    scrollerClass:   "iscroll-scroller",    // Class to be applied to scroller within wrapper
    pullDownClass:   "iscroll-pulldown",    // Class for pulldown element (if any)
    pullUpClass:     "iscroll-pullup",      // Class for pullup element (if any)
    pullLabelClass:  "iscroll-pull-label",  // Class for pull element label span
    pullUpSpacerClass: "iscroll-pullup-spacer", // Class added to generated pullup spacer
    scrollerContentClass: "iscroll-scroller-content", // Real content of scroller, not including pull-up, pull-down

    // true to adapt the page containing the widget. If false, the widget will not alter any
    // elements outside of the widget's container.
    adaptPage:      true,

    // JQuery selector for fixed-height elements on page.
    // Use iscroll-foreground class for arbitrary fixed-height elements other than
    // header/footer
    fixedHeightSelector: ":jqmData(role='header'), :jqmData(role='footer'), .iscroll-foreground",

    // true to resize the wrapper to take all viewport space after fixed-height elements
    // (typically header/footer)
    // false to not change the size of the wrapper
    // For example, if using multiple iscrollview widgets on the same page, a maximum
    // of one of them could resize to remaining space. You would need to explicitly
    // set the height of additional iscrollviews and give them the fixed height class.
    resizeWrapper:  true,

    // Space-separated list of events on which to resize/refresh iscroll4
    // On some mobile devices you may wish to add/substitute orientationchange event
    // iOS 4.x will trigger resize twice then orientationchange
    // iOS 5.x will trigger resize once then orientationchange
    // Experimentation with other devices would be useful
    resizeEvents:  "resize",

    // Refresh iscrollview on page show event. This should be true if content inside a
    // scrollview might change while the page is cached but not shown.
    // Default to false if we have a version of iScroll that we can patch with
    // jQuery.actual. Default to true otherwise.
    refreshOnPageBeforeShow: !IScrollHasDimensionFunctions,

    // true to fix iscroll4 input element focus problem in the widget.
    // false if you are using a patched iscroll4 with different fix or to
    // disable for some other reason
    fixInput: true,

    wrapperAdd: 0,      // Shouldn't be necessary, but in case user needs to fudge
                        // Can be + or -

    // Timeout to allow page to render prior to refresh()
    refreshDelay:  IsAndroid ? 200 : 0,   // Wild-ass guesses

    // true to set the minimum height of scroller content (not including
    // any pull-down or pull-up) to the height of the wrapper.. This allows
    // scrolling empty content e.g. if using pull down to refresh. As well,
    // this will displace any pull up to refresh so that it is not initially
    // visible.
    expandScrollerToFillWrapper: true,

    // Normally, we need the wrapper to have no padding. Otherwise, the result will look awkward,
    // you won't be able to grab the padded area to scroll, etc.
    removeWrapperPadding: true,

    // But we want to add that padding back inside the scroller. We add a div around the content
    // inside any pull-down/pull-up to replace the padding removed from the wrapper.
    addScrollerPadding: true,

    // On some platforms (iOS, for example) we need to scroll to top after orientation change,
    // because the address bar pushed the window down. jQuery Mobile handles this for page links,
    // but doesn't for orientationchange
    // If you have multiple scrollers, only enable this for one of them
    scrollTopOnOrientationChange: true,

    // iScroll scrolls the first child of the wrapper. I don't see a use case for having more
    // than one child. What kind of mess is going to be shown in that case? So, by default, we
    // just wrap ALL of the children of the wrapper with a new <div> that will be the scroller.
    // This way you don't need to worry about wrapping all the elements to be scrolled if there
    // is more than one. If there is only one child, we create this <div> unnecessarily, but -
    // big deal. If, for some reason, you want to create the markup for the scroller yourself,
    // set this to false.
    createScroller: true,

    // True to defer refresh() on non-active pages until pagebeforeshow. This avoids
    // unnecessary refresh in case of resize/orientation change when pages are cached,
    // as well as unnecessary refresh when pages are updated when they are not the active
    // page.
    deferNonActiveRefresh: true,

    // Same deal, for re-sizing the wrapper
    deferNonActiveResize: true,

    // True to prevent hover in scroller touch devices.  If this is false, you will get
    //  "piano keyboard" effect in JQM <1.1 when scrolling due to hover, which is both
    // time-consuming and distracting. A negative is that with the current implementation, you will
    // never get a "hover" visual effect within a scroller on touch devices, even when not scrolling.
    // But you still will on desktop browser with mouse, and you will still get "down" effect
    // when a link is selected. This really is a jQuery Mobile problem with listview, and is
    // fixed in JQM 1.1.
    preventTouchHover: JQMIsLT11,   // Enable is JQM version is < 1.1

    // This is an experimental feature under development and DOES NOT WORK completely!
    // For one, it breaks mousewheel with jQuery Mobile 1.1 (because jQuery Mobile 1.1 breaks
    // mousewheel...)
    bindIscrollUsingJqueryEvents: false,

    pullDownResetText   : "Pull down to refresh...",
    pullDownPulledText  : "Release to refresh...",
    pullDownLoadingText : "Loading...",
    pullUpResetText     : "Pull up to refresh...",
    pullUpPulledText    : "Release to refresh...",
    pullUpLoadingText   : "Loading...",

    pullPulledClass     : "iscroll-pull-pulled",
    pullLoadingClass    : "iscroll-pull-loading",

    //-------------------------------------------------------------
    // For better or worse, widgets have two mechanisms for dealing
    // with events. The needs to be a set of options that correspond
    // to each event. If present, the option is a function. As
    // well, the widget prepends the widget event prefix ("iscroll_")
    // to each event name and triggers a jQuery event by that name.
    // BOTH mechanisms can be used simultaneously, though not sure
    // why you'd want to. If you need to handle an event during
    // iScroll4 instantiation, (only one I know about that might be
    // called is refresh) then you have to use a function option.
    //-------------------------------------------------------------
    onrefresh:           null,
    onbeforescrollstart: null,
    onscrollstart:       null,
    onbeforescrollmove:  null,
    onscrollmove:        null,
    onbeforescrollend:   null,
    onscrollend:         null,
    ontouchend:          null,
    ondestroy:           null,
    onzoomstart:         null,
    onzoom:              null,
    onzoomend:           null,

    onpulldownreset:     null,
    onpulldownpulled:    null,
    onpulldown:          null,
    onpullupreset:       null,
    onpulluppulled:      null,
    onpullup:            null,

    onbeforerefresh:     null,
    onafterrefresh:      null
    },

    //---------------------------------------------------------------------------------------
    // Array of keys of options that are widget-only options (not options in iscroll4 object)
    //---------------------------------------------------------------------------------------
    _widgetOnlyOptions: [
      "debug",
      "traceIscrollEvents",
      "tracedIscrollEvents",
      "traceIscrollCallbacks",
      "tracedIscrollCallbacks",
      "traceWidgetEvents",
      "tracedWidgetEvents",
      "traceWidgetCallbacks",
      "tracedWidgetCallbacks",
      "traceResizeWrapper",
      "traceRefresh",
      "traceCreateDestroy",
      "bottomOffset",
      "emulateBottomOffset",
      "pageClass",
      "wrapperClass",
      "scrollerClass",
      "pullDownClass",
      "pullUpClass",
      "scrollerContentClass",
      "pullLabelClass",
      "pullUpSpacerClass",
      "adaptPage",
      "fixedHeightSelector",
      "resizeWrapper",
      "resizeEvents",
      "refreshOnPageBeforeShow",
      "fixInput",
      "wrapperAdd",
      "refreshDelay",
      "expandScrollerToFillWrapper",
      "removeWrapperPadding",
      "addScrollerPadding",
      "createScroller",
      "deferNonActiveRefresh",
      "preventTouchHover",
      "deferNonActiveResize",
      "bindIscrollUsingJqueryEvents",
      "scrollTopOnOrientationChange",
      "pullDownResetText",
      "pullDownPulledText",
      "pullDownLoadingText",
      "pullUpResetText",
      "pullUpPulledText",
      "pullUpLoadingText",
      "pullPulledClass",
      "pullLoadingClass",
      "onpulldownreset",
      "onpulldownpulled",
      "onpulldown",
      "onpullupreset",
      "onpulluppulled",
      "onpullup",
      "onbeforerefresh",
      "onafterrefresh"
      ],

    //-----------------------------------------------------------------------
    // Map of widget event names to corresponding iscroll4 object event names
    //-----------------------------------------------------------------------
    _event_map: {
      onrefresh:           "onRefresh",
      onbeforescrollstart: "onBeforeScrollStart",
      onscrollstart:       "onScrollStart",
      onbeforescrollmove:  "onBeforeScrollMove",
      onscrollmove:        'onScrollMove',
      onbeforescrollend:   'onBeforeScrollEnd',
      onscrollend:         "onScrollEnd",
      ontouchend:          "onTouchEnd",
      ondestroy:           "onDetroy",
      onzoomstart:         "onZoomStart",
      onzoom:              "onZoom",
      onzoomend:           "onZoomEnd"
      },

    //------------------------------------------------------------------------------
    // Functions that adapt iscroll callbacks to Widget Factory conventions.
    // These are copied to the iscroll object's options object on instantiation.
    // They  call the private _trigger method provided by the widget factory
    // base object. Normally, iscroll4 callbacks can be null or omitted. But since
    // we can't know in advance whether the corresponding widget events might be bound
    // or delegated in the future, we have set a callback for each that calls _trigger.
    // This will call the corresponding widget callback as well as trigger the
    // corresponding widget event if bound.
    //
    // Event callbacks are passed two values:
    //
    //  e   The underlying DOM event (if any) associated with this event
    //  d   Data map
    //        iscrollview : The iscrollview object
    //------------------------------------------------------------------------------

    _proxy_event_funcs: {

      onRefresh: function(e) {
        this._doCallback("onRefresh", e, function(e) {
          this._emulateBottomOffset();
          this.iscrollview._pullOnRefresh.call(this.iscrollview,e);
          });
        },

      onBeforeScrollStart: function(e) {
        this._doCallback("onBeforeScrollStart", e, function(e) {
          this._fixInput(e);
          });
        },

      onScrollStart:       function(e) { this._doCallback("onScrollStart",      e); },
      onBeforeScrollMove:  function(e) { this._doCallback("onBeforeScrollMove", e); },

      onScrollMove: function(e) {
        this._doCallback("onScrollMove", e, function(e) {
          this.iscrollview._pullOnScrollMove.call(this.iscrollview, e);
          });
        },

      onBeforeScrollEnd:   function(e) { this._doCallback("onBeforeScrollEnd", e); },

      onScrollEnd: function(e) {
        this._doCallback("onScrollEnd", e, function(e){
          this.iscrollview._pullOnScrollEnd.call(this.iscrollview, e);
          });
        },

      onTouchEnd:          function(e) { this._doCallback("onTouchEnd",  e); },
      onDestroy:           function(e) { this._doCallback("onDestroy",   e); },
      onZoomStart:         function(e) { this._doCallback("onZoomStart", e); },
      onZoom:              function(e) { this._doCallback("onZoom",      e); },
      onZoomEnd:           function(e) { this._doCallback("onZoomEnd",   e); }
      },

  // Merge options from the iscroll object into the widget options
  // So, this will backfill iscroll4 defaults that we don't set in
  // the widget, giving a full set of iscroll options, and leaving
  // widget-only options untouched.
  _merge_from_iscroll_options: function() {
    var options = $.extend(true, {}, this.iscroll.options);
    // Delete event options from the temp options
    $.each(this._proxy_event_funcs, function(k,v) {delete options[k];});
    if (this.options.emulateBottomOffset) { delete options.bottomOffset; }
    $.extend(this.options, options);   // Merge result into widget options
    },

  // Create a set of iscroll4 object options from the widget options.
  // We have to omit any widget-specific options that are
  // not also iscroll4 options. Also, copy the proxy event functions to the
  // iscroll4 options.
  _create_iscroll_options: function() {
    var options = $.extend(true, {}, this.options);  // temporary copy of widget options
    // Remove options that are widget-only options
    $.each(this._widgetOnlyOptions, function(i,v) {delete options[v];});
    // Remove widget event options
    $.each(this._event_map, function(k,v) {delete options[k];});
    if (this.options.emulateBottomOffset) { delete options.bottomOffset; }
    // Add proxy event functions
    return $.extend(options, this._proxy_event_funcs);
    },

  // Formats number with fixed digits
  _pad: function(num, digits, padChar) {
    var str = num.toString(),
        _padChar = padChar || "0";
    while (str.length < digits) { str = _padChar + str; }
    return str;
  },

  // Format time for logging
  _toTime: function(date) {
    return this._pad(date.getHours(), 2) + ":" +
           this._pad(date.getMinutes(), 2) + ":" +
           this._pad(date.getSeconds(), 2) + "." +
           this._pad(date.getMilliseconds(), 3);
  },

  // Log a message to console
  // text - message to log
  // now - optional timestamp, if missing generates new timestamp
  // Returns timestamp
  _log: function(text, now) {
    var _now, id, idStr;
    if (!this.options.debug) { return null; }
    _now = now || new Date();
    id = this.$wrapper.attr("id");
    idStr = id ? "#" + id : "";
    console.log(this._toTime(_now) + " " +
                $.mobile.path.parseUrl(this.$page.jqmData("url")).filename + idStr + " " +
                text );
    return _now;
  },

  // Log elapsed time from then to now
  _logInterval: function(text, then) {
    var now;
    if (!this.options.debug) { return null; }
    now = new Date();
    return this._log(text + " " + (now - then) + "mS from " + this._toTime(then), now );
    },

  // Log an event
  // Like _logInterval, but additional optional parameter e
  // If e is present, additionally show interval from original event to now
  _logEvent: function(text, e, then) {
    var now,
        eventTime,
        haveEvent = e && e instanceof Object,
        type = haveEvent ? e.type : e,
        _text = type + " " + text;

    if (!this.options.debug) { return null; }

    now = new Date();

    if (then) {
      _text += " end " + (+(now-then)) + "mS from " + this._toTime(then);
      }
    else if (haveEvent) {
      _text += " begin";
    }
    if (haveEvent) {
      eventTime = new Date(e.timeStamp);
      _text +=  " (" +  (now - eventTime) + "mS from " +e.type + " @ " + this._toTime(eventTime) + ")";
      }

    return this._log(_text, now);
  },

  // Log a callback issued by iScroll
  _logCallback: function(callbackName, e, then) {
    if (!this.options.debug ||
        !this.options.traceIscrollCallbacks ||
       (this.options.tracedIscrollCallbacks.length !== 0 &&
        $.inArray(callbackName, this.options.tracedIscrollCallbacks) === -1) ) {
      return null;
      }
    if (e)         { return this._logEvent(callbackName, e, then); }
    if (then)      { return this._logInterval(callbackName + " end", then); }
    return this._log(callbackName + " begin");
  },

  // Log an event handled by Iscroll
  // e can be Event or event name
  _logIscrollEvent: function(text, e, then) {
    var haveEvent = e instanceof Event,
        type = haveEvent ? e.type : e;
    if (!this.options.debug ||
        !this.options.traceIscrollEvents ||
        (this.options.tracedIscrollEvents.length !== 0 &&
         $.inArray(type, this.options.tracedIscrollEvents) === -1)) {
      return null;
      }
    return this._logEvent(text, e, then);
  },

  // Log an event handled by the widget
  _logWidgetEvent: function(text, e, then) {
    var haveEvent = e instanceof Object,
        type = haveEvent ? e.type : e;
    if (!this.options.debug ||
        !this.options.traceWidgetEvents ||
        (this.options.tracedWidgetEvents.length !== 0 &&
         $.inArray(type, this.options.tracedWidgetEvents) === -1)) {
      return null;
      }
    return this._logEvent(text, e, then);
  },

  // Log a callback issued by the widtet
  _logWidgetCallback: function(callbackName, e, then) {
    if (!this.options.debug ||
        !this.options.traceWidgetCallbacks ||
       (this.options.tracedWidgetCallbacks.length !== 0 &&
        $.inArray(callbackName, this.options.tracedWidgetCallbacks) === -1) ) {
      return null;
      }
    if (e)         { return this._logEvent(callbackName, e, then); }
    if (then)      { return this._logInterval(callbackName + " end", then); }
    return this._log(callbackName + " begin");
  },

  // Log elapsed time from then to now and later to now
  _logInterval2: function(text, then, later) {
    var now;
    if (!this.options.debug) { return; }
    now = new Date();
    this._log(text + " " +
              (now - later) + "mS from " + this._toTime(later) +
              " (" + (now - then) + "mS from " + this._toTime(then) + ")" );
    },

  _startTiming: function() {
    if (!this.options.debug) { return null; }
    return new Date();
    },

  // All bind/unbind/_trigger done by the widget goes through here, to permit logging
  _bind: function(obj, type, func, objName) {
    this._logWidgetEvent("bind " + objName, type);
    obj.bind(type, $.proxy(func, this));
  },

  _unbind: function(obj, type, func, objName) {
    this._logWidgetEvent("unbind " + objName, type);
    obj.unbind(type, func);
  },

  _triggerWidget: function(type, e, f) {
    var then = this._logWidgetCallback(type);
    if (f) { f.call(this); }  // Perform passed function if present
    this._trigger(type, e, {"iscrollview":this});
    this._logWidgetCallback(type, e, then);
  },

  //-------------------------------------------------------------------
  // Returns status of dirty flag, indicating that refresh() was called
  // while the page was not active, and refresh will be deferred until
  // pagebeforeshow.
  //-------------------------------------------------------------------
  isDirty: function() {
    return this._dirty;
    },

  //-----------------------------------------------------------------------------
  // Restore an element's styles to original

  // If the style was never modified by the widget, the value passed in
  // originalStyle will be undefined.
  //
  //If there originally was no style attribute, but styles were added by the
  // widget, the value passed in originalStyle will be null.
  //
  // If there originally was a style attribute, but the widget modified it
  // (actually, set some CSS, which changes the style, the value is a string in
  // originalStyle.
  //-----------------------------------------------------------------------------
  _restoreStyle: function($ele, originalStyle) {
    if (originalStyle === undefined) { return; }
    if (originalStyle === null)      { $ele.removeAttr("style"); }
    else                             { $ele.setAttr("style", originalStyle); }
    },

  //------------------------------------------------------------------------------
  // Functions that we bind to. They are declared as named members rather than as
  // inline closures so we can properly unbind them.
  //------------------------------------------------------------------------------
  // generic preventDefault func
  _preventDefaultFunc: function(e) {
    var then = this._logWidgetEvent("_preventDefaultFunc", e);
    e.preventDefault();
    this._logWidgetEvent("_preventDefaultFunc", e, then);
    },

  _pageBeforeShowFunc: function(e) {
   var then = this._logWidgetEvent("_pageBeforeShowFunc", e);
   if (this._sizeDirty) {
     this.resizeWrapper();
     this.expandScrollerToFillWrapper();
     this._sizeDirty = false;
      }
   if (this._dirty) {
     this.refresh(0, this._dirtyCallbackBefore, this._dirtyCallbackAfter, this._dirtyContext, true);
     this._dirty = false;
     this._dirtyCallbackBefore = null;
     this._dirtyCallbackAfter = null;
     this._dirtyContext = null;
     }
   else if (this.options.refreshOnPageBeforeShow) {
      this.refresh();
      }
   this._logWidgetEvent("_pageBeforeShowFunc", e, then);
   },

  // Called on resize events
  _windowResizeFunc: function(e) {
    var then = this._logWidgetEvent("_windowResizeFunc", e);
    if (this.options.deferNonActiveResize && !this.$page.hasClass("ui-page-active"))  {
      this._sizeDirty = true;
      if (this.options.traceResizeWrapper) { this._log("resizeWrapper() (deferred)"); }
      }
    else {
      this.resizeWrapper();
      this.expandScrollerToFillWrapper();
      }
    this.refresh();
   this._logWidgetEvent("_windowResizeFunc", e, then);
    },

  // On some platforms (iOS, for example) you need to scroll back to top after orientation change,
  // because the address bar pushed the window down. jQuery Mobile handles this for page links,
  // but doesn't for orientationchange
  _orientationChangeFunc: function(e) {
    var then = this._logWidgetEvent("_orientationChangeFunc", e);
    if (this.options.scrollTopOnOrientationChange) {
      $.mobile.silentScroll(0);
      }
    this._logWidgetEvent("_orientationChangeFunc", e, then);
    },

  //----------------------------
  // Raise fixed-height elements
  //----------------------------
  _raiseFixedHeightElements: function() {
    this.$page.find(this.options.fixedHeightSelector).each(function() {
      $(this).jqmData("iscrollviewOrigStyle", $(this).attr("style"));
      $(this).css("z-index", 1000);
       });
    },

  _undoRaiseFixedHeightElements: function() {
    this.$page.find(this.options.fixedHeightSelector).each(function() {
      $(this).attr("style", $(this).jqmData("iscrollviewOrigStyle"));
      $(this).jqmRemoveData("iscrollviewOrigStyle");
      });
    },

  //----------------------------------
  // Adapt the page for this widget
  // This should only be done for one
  // iscrollview widget per page.
  //----------------------------------
  _adaptPage: function() {
    if (!this.options.adaptPage) { return; }
    this.$page.addClass(this.options.pageClass);

    // XXX: fix crumbled css in transition changePage
    // for jquery mobile 1.0a3 in jquery.mobile.navigation.js changePage
    //  in loadComplete in removeContainerClasses in .removeClass(pageContainerClasses.join(" "));
    this._origPageStyle = this.$page.attr("style") || null;  // Save for later restore
    this.$page.css({overflow: "hidden"});
    this._raiseFixedHeightElements();

    // Prevent moving the page with touch. Should be optional?
    // (Maybe you want a scrollview within a scrollable page)
    this._bind(this.$page, "touchmove", this._preventDefaultFunc, "$page");
    },

  _undoAdaptPage: function() {
    this._unbind(this.$page, "touchmove", this._preventDefaultFunc, "$page");
    this._undoRaiseFixedHeightElements();
    this._restoreStyle(this.$page, this._origPageStyle);
    this.$page.removeClass(this.options.pageClass);
    },

  //--------------------------------------------------------
  // Calculate total bar heights.
  //--------------------------------------------------------
  calculateBarsHeight: function() {
    var barsHeight = 0;
    this.$page.find(this.options.fixedHeightSelector).each(function() {  // Iterate over headers/footers
        barsHeight += $(this).actual( "outerHeight", { includeMargin : true } );
        });
    this._barsHeight = barsHeight;
    },

  //-----------------------------------------------------------------------
  // Determine the box-sizing model of an element
  // While jQuery normalizes box-sizing models when retriving geometry,
  // it doesn't consider it when SETTING geometry. So, this is useful when
  // setting geometry. (e.g. the height of the wrapper)
  //-----------------------------------------------------------------------
  _getBoxSizing: function($elem) {
    var  boxSizing,
         prefix = "";

    if (IsFirefox)     { prefix = "-moz-"; }
    else if (IsWebkit) { prefix = "-webkit-"; } // note: can drop prefix for Chrome >=10, Safari >= 5.1 (534.12)
    boxSizing = $elem.css(prefix + "box-sizing");
    if (!boxSizing && prefix) { boxSizing = $elem.css("box-sizing"); }  // Not found, try again with standard CSS
    if (!boxSizing) {     // Still not found - no CSS property available to guide us.
      // See what JQuery thinks the global box model is
      if ($.boxModel) { boxSizing = "content-box"; }
      else            { boxSizing = "border-box"; }
      }
    return boxSizing;
    },

  //-----------------------------------------------------------------
  // Get the height adjustment for setting the height of an element,
  // based on the content-box model
  //-----------------------------------------------------------------
  _getHeightAdjustForBoxModel: function($elem) {
    // Take into account the box model. This defaults to either W3C or traditional
    // model for a given browser, but can be overridden with CSS
    var adjust;
    switch (this._getBoxSizing($elem)) {
      case "border-box":      // AKA traditional, or IE5 (old browsers and IE quirks mode)
        // only subtract margin
        adjust = $elem.actual("outerHeight", { includeMargin: true } ) -
                 $elem.actual( "outerHeight" );
        break;

      case "padding-box":    // Firefox-only
        // subtract margin and border
        adjust = $elem.actual( "outerHeight" ) -
                 $elem.actual( "height" );
        break;

      case "content-box":     // AKA W3C  Ignore jshint warning
      default:                // Ignore jslint warning
        // We will subtract padding, border, margin
        adjust = $elem.actual( "outerHeight", { includeMargin : true } ) -
                 $elem.actual( "height" );
        break;
      }
    return adjust;
    },

  //--------------------------------------------------------
  // If there's a pull-down element, we need to set the
  // topOffset to the height of that element. If user
  // specified a topOffset option, use that instead, though.
  //--------------------------------------------------------
  _setTopOffsetForPullDown: function() {
    if (this.$pullDown && !this.options.topOffset) {
      this.options.topOffset = this.$pullDown.actual("outerHeight",{includeMargin:true});
      }
    },

  //--------------------------------------------------------
  // If there's a pull-up element, we need to set the
  // bottomOffset to the height of that element. If user
  // specified a bottomOffset option, use that instead, though.
  //--------------------------------------------------------
  _setBottomOffsetForPullUp: function() {
    if (this.$pullUp && !this.options.bottomOffset) {
      this.options.bottomOffset = this.$pullUp.actual("outerHeight",{includeMargin:true});
      }
    },

  //---------------------------------------------------------
  // Correct the wrapper CSS position in case it is static.
  // We need relative or absolute for proper positioning of
  // the scrollbar. Either relative or absolute on the wrapper
  // will cause the absolute positioning of the scrollbar in
  // iScroll to be relative to the wrapper. iScroll examples
  // all work because they happen to use position:fixed on the
  // wrapper. Rather than force the user to set wrapper
  // positioning, just force it to relative if it is static
  // (which is CSS default.)
  //
  // Hopefully, user won't  set it to fixed, I dunno what
  // they'd be trying to do then!
  //---------------------------------------------------------
  _correctWrapperPosition: function() {
    if (this.$wrapper.css("position") === "static") {
      this.$wrapper.css("position", "relative");
      }
    },

   _removeWrapperPadding: function() {
     var $wrapper = this.$wrapper;
     if (this.options.removeWrapperPadding) {
       // Save padding so we can re-apply it to the iscroll-scroller-content div that we create
       this._origWrapperPaddingLeft   = $wrapper.css("padding-left");
       this._origWrapperPaddingRight  = $wrapper.css("padding-right");
       this._origWrapperPaddingTop    = $wrapper.css("padding-top");
       this._origWrapperPaddingBottom = $wrapper.css("padding-bottom");
       this.$wrapper.css("padding", 0);
       }
   },

  //---------------------------------------------------------
  // Modify some wrapper CSS
  //---------------------------------------------------------
  _modifyWrapperCSS: function() {
    this._origWrapperStyle = this.$wrapper.attr("style") || null;
    this.$wrapper.css({
                        "z-index"  : 1,         // Lower the wrapper
                        "overflow" : "hidden"   // hide overflow
                        });
    this._removeWrapperPadding();
    this._correctWrapperPosition();
    },

  _undoModifyWrapperCSS: function() {
    this._restoreStyle(this.$wrapper, this._origWrapperStyle);
    },

  //---------------------------------------------------------
  // Adds padding around scrolled content (not including
  // any pull-down or pull-up) using a div with padding
  // removed from wrapper.
  //---------------------------------------------------------
  _addScrollerPadding: function () {
  if (this.options.removeWrapperPadding && this.options.addScrollerPadding) {
    // We do not store $scrollerContent in the object, because elements might be added/deleted
    // after instantiation. When we undo, we need the CURRENT children in order to unwrap
    var $scrollerContentWrapper,
        $scrollerChildren = this.$scroller.children(),
        $scrollerContent = $scrollerChildren.not(this.$pullDown).not(this.$pullUp).not(this.$pullUpSpacer);
    $scrollerContent.wrapAll("<div/>");

    $scrollerContentWrapper = $scrollerContent.parent().addClass(this.options.scrollerContentClass);
    $scrollerContentWrapper.css({
      "padding-left"   : this._origWrapperPaddingLeft,
      "padding-right"  : this._origWrapperPaddingRight,
      "padding-top"    : this._origWrapperPaddingTop,
      "padding-bottom" : this._origWrapperPaddingBottom
      });
    }
  },

  _undoAddScrollerPadding: function () {
    if (this.options.removeWrapperPadding && this.options.addScrollerPadding) {
      $("." + this.options.scrollerContentClass, this.$scroller).children().unwrap();
      }
    },

  //---------------------------------------------------------
  // Add some convenient classes in case user wants to style
  // wrappers/scrollers that use iscroll.
  //---------------------------------------------------------
  _addWrapperClasses: function() {
    this.$wrapper.addClass(this.options.wrapperClass);
    this.$scroller.addClass(this.options.scrollerClass);
    },

  _undoAddWrapperClasses: function() {
    this.$scroller.removeClass(this.options.scrollerClass);
    this.$wrapper.removeClass(this.options.wrapperClass);
    },

  //--------------------------------------------------------
  // Expands the scroller to fill the wrapper. This permits
  // dragging an empty scroller, or one that is shorter than
  // the wrapper. Otherwise, you could never do pull to
  // refresh if some content wasn't initially present. As
  // well, this pushes any pull-up element down so that it
  // will not be visible until the user pulls up.
  //--------------------------------------------------------
  expandScrollerToFillWrapper: function() {
    if (this.options.expandScrollerToFillWrapper) {
      if (this._firstScrollerExpand) {
        this._origScrollerStyle = this.$scroller.attr("style") || null;
        this._firstScrollerExpand = false;
        }
      this.$scroller.css("min-height",
        this.$wrapper.actual("height") +
        (this.$pullDown ? this.$pullDown.actual("outerHeight",{includeMargin:true}) : 0) +
        (this.$pullUp ? this.$pullUp.actual("outerHeight",{includeMargin:true}) : 0)
        );
      }
    },

  _undoExpandScrollerToFillWrapper: function() {
    this._restoreStyle(this.$scroller, this._origScrollerStyle);
    },

  //--------------------------------------------------------
  //Resize the wrapper for the scrolled region to fill the
  // viewport remaining after all fixed-height elements
  //--------------------------------------------------------
  resizeWrapper: function() {
    var then;
    if (!this.options.resizeWrapper) { return; }
    if (this.options.traceResizeWrapper) {then = this._log("resizeWrapper() start"); }
    this.$wrapper.height(
    $(window).height() -         // Height of the window
    this._barsHeight -           // Height of fixed bars or "other stuff" outside of the wrapper
    this._wrapperHeightAdjustForBoxModel +   // Make adjustment based on content-box model
    // Note: the following will fail for Safari desktop with Develop/User Agent/iPhone
    (IsMobileSafari && !IsIPad ? 60 : 0) +  // Add 60px for space recovered from Mobile Safari address bar
    this.options.wrapperAdd      // User-supplied fudge-factor if needed
    );
    // The first time we resize, save the size of the wrapper
    if (this._firstWrapperResize) {
      this._origWrapperHeight = this.$wrapper.height() - this._wrapperHeightAdjustForBoxModel;
      this._firstWrapperResize = false;
      }
    if (this.options.traceResizeWrapper) {
      this._logInterval("resizeWrapper() end" + (this._sizeDirty ? " (dirty)" : ""), then);
      }
    },

  _undoResizeWrapper: function() {
    if (this.origWrapperHeight !== undefined) { this.$wrapper.height(this._origWrapperHeight); }
    },

  //---------------------------------------------------------
  // Make various modifications to the wrapper
  //---------------------------------------------------------
  _modifyWrapper: function() {
    this._addWrapperClasses();
    this._modifyWrapperCSS();

    this._wrapperHeightAdjustForBoxModel = this._getHeightAdjustForBoxModel(this.$wrapper);

    // Resize the wrapper and refresh iScroll on resize
    // You might want to do this on orientationchange on mobile
    // devices, but, on iOS, at least, resize event works better,
    // because orientationchange event happens too late and you will
    // see footer(s) being pushed down after the rotation
    //
    // iscroll4 has event handling for resize and orientation change,
    // but doesn't seem to work with JQuery Mobile, probably because
    // of it's page structure for AJAX loading. So, we have to do this
    // in the widget code. As well, we need to resize the wrapper in any
    // case.
    //
    // TODO: Consider using jquery-resize.js to rate-limit resize events
    if (this.options.resizeWrapper) {
      this.resizeWrapper();   // Resize wrapper to take remaining space after bars
      this._bind($(window), this.options.resizeEvents, this._windowResizeFunc, "$(window)");
      if (this.options.scrollTopOnOrientationChange) {
        this._bind($(window), "orientationchange", this._orientationChangeFunc, "$(window)");
        }
      }
    },

  _undoModifyWrapper: function() {
    this._undoResizeWrapper();
    this._undoModifyWrapperCSS();
    this._undoAddWrapperClasses();
    },

  //--------------------------------------------------------
  // Modify the pull-down (if any) with reset text
  // Also, read data-iscroll-release and data-iscroll-loading
  // values (if present ) into the corresponding options.
  //--------------------------------------------------------
  _modifyPullDown: function () {
    var $pullDownLabel, pulledText, loadingText;
    if (!this.$pullDown) { return; }
    $pullDownLabel = $("." + this.options.pullLabelClass, this.$pullDown);
    if ($pullDownLabel) {
      this._origPullDownLabelText = $pullDownLabel.text();
      if (this._origPullDownLabelText) { this.options.pullDownResetText = this._origPullDownLabelText; }
      else { $pullDownLabel.text(this.options.pullDownResetText); }
      pulledText = $pullDownLabel.jqmData("iscroll-pulled-text");
      if (pulledText) { this.options.pullDownPulledText = pulledText; }
      loadingText = $pullDownLabel.jqmData("iscroll-loading-text");
      if (loadingText) { this.options.pullDownLoadingText = loadingText; }
      }
    },

  _undoModifyPullDown: function () {
    if (!this.$pullDown) { return; }
    var $pullDownLabel = $("." + this.options.pullLabelClass, this.$pullDown);
    if (!$pullDownLabel) { return; }
    $pullDownLabel.text(this._origPullDownLabelText);
  },

  //--------------------------------------------------------
  // Modify the pullup element (if any) to prevent visual
  // glitching. Position at the bottom of the scroller.
  //
  // Modify the pull-up (if any) with reset text
  // Also, read data-iscroll-release and data-iscroll-loading
  // values (if present ) into the corresponding options.
  //--------------------------------------------------------
  _modifyPullUp: function () {
    var $pullUpLabel, pulledText, loadingText;

    if (!this.$pullUp) { return; }

    // Since we are positioning the pullUp element absolutely, it is pulled out of the
    // document flow. We need to add a dummy <div> with the same height as the pullUp.
    $("<div></div>").insertBefore(this.$pullUp).css(
      "height", this.$pullUp.actual("outerHeight",{includeMargin:true}) );
    this.$pullUp.prev().addClass(this.options.pullUpSpacerClass);

    // We need to position the pullup absolutely at the bottom of the scroller.
    // The scroller is position:relative, so the pullUp is positioned here relative
    // to the scroller, not the page. If we don't do this, the pullUp will initially appear
    // briefly at the bottom of content if content is shorter than the wrapper.
    this._origPullUpStyle = this.$pullUp.attr("style") || null;
    this.$pullUp.css({
      "position": "absolute",
      "bottom": 0,
      "width": "100%"
      });

    $pullUpLabel = $("." + this.options.pullLabelClass, this.$pullUp);
    if ($pullUpLabel) {
      this._origPullUpLabelText = $pullUpLabel.text();
      if (this._origPullUpLabelText) { this.options.pullUpResetText = this._origPullUpLabelText; }
      else { $pullUpLabel.text(this.options.pullUpResetText); }
      pulledText = $pullUpLabel.jqmData("iscroll-pulled-text");
      if (pulledText) { this.options.pullUpPulledText = pulledText; }
      loadingText = $pullUpLabel.jqmData("iscroll-loading-text");
      if (loadingText) { this.options.pullUpLoadingText = loadingText; }
      }

    },

  _undoModifyPullUp: function () {
    if (!this.$pullUp) { return; }
    this._restoreStyle(this.$pullUp, this._origPullUpStyle);
    this.$pullUp.prev().remove();  // Remove the dummy div
    if (this._origPullUpLabelText) {
      $("." + this.options.pullLabelClass, this.$pullUp).text(this._origPullUpLabelText);
      }
  },

  //----------------------------------------------------------------------
  // Refresh the iscroll object. Insure that refresh is called with proper
  // timing. Call optional before and after refresh callbacks and trigger
  // before and after refresh events.
  //-----------------------------------------------------------------------
  refresh: function(delay, callbackBefore, callbackAfter, context, noDefer) {

    var _this, _delay, _callbackBefore, _callbackAfter, _context, _noDefer, then;

    // If non-active-page refresh is deferred, make a note of it.
    // Note that each call to refresh() overwrites the callback and context variables.
    // Our expectation is that callback and context will be identical for all such refresh
    // calls. In any case, only the last callback and context will be used. This allows
    // refresh of jQuery Mobile widgets within the scroller to be deferred, as well.
    if (!noDefer && this.options.deferNonActiveRefresh && !this.$page.hasClass("ui-page-active")) {
      this._dirty = true;
      this._dirtyCallbackBefore = callbackBefore;
      this._dirtyCallbackAfter = callbackAfter;
      this._dirtyContext = context;
      if (this.options.traceRefresh) {
        this._log("refresh() (deferred)");
      }
      return;
    }

  // Let the browser complete rendering, then refresh the scroller
  //
  // Optional delay parameter for timeout before actually calling iscroll.refresh().
  // If missing (undefined) or null, use options.refreshDelay.
  //
  // Optional callback parameters are called if present before and after iScroll internal
  // refresh() is called.  While the caller might bind to the before or after refresh events,
  // this can be more convenient and avoids any ambiguity over WHICH call to refresh is involved.
    _this = this;
    _delay = delay;
    _callbackBefore = callbackBefore;
    _callbackAfter = callbackAfter;
    _context = context;
    _noDefer = noDefer;
    then = this._startTiming();
    if ((_delay === undefined) || (_delay === null) ) { _delay = this.options.refreshDelay; }

    setTimeout(function() {
      var later;

      if (_this.options.traceRefresh) {
       later =  _this._logInterval("refresh() start", then);
       }

      _this._triggerWidget("onbeforerefresh", null, function() {
        if (_callbackBefore) { _callbackBefore(_context); }
        });

      _this.iscroll.refresh();

      _this._triggerWidget("onafterrefresh", null, function() {
        if (_callbackAfter) { _callbackAfter(_context); }
        });

      if (_this.options.traceRefresh) {
        _this._logInterval2("refresh() end" + (_noDefer ? " (dirty)" : ""), then, later);
        }
      }, _delay);

    if (this.options.traceRefresh) {
      this._log("refresh() will occur after >= " + _delay + "mS");
      }

    },

   //---------------------------
   // Create the iScroll object
   //---------------------------
  _create_iscroll_object: function() {
    /*jslint newcap:true */
    this.iscroll = new IScroll(this, this.$wrapper.get(0), this._create_iscroll_options());
    /* jslint newcap:false */
    },

  //-----------------------------------------
  // Create scroller
  //-----------------------------------------
  _createScroller: function() {
    if (this.options.createScroller) {
    this.$wrapper.children().wrapAll("<div/>");
    }
  },

  _undoCreateScroller: function() {
    if (this.options.createScroller) {
      this.$scroller.children().unwrap();
    }
  },

  //-----------------------------------------
  // Automatically called on page creation
  //-----------------------------------------
  _create: function() {
    var $pullDown, 
        $pullUp,
        then;   
    this.$wrapper = this.element;  // JQuery object containing the element we are creating this widget for
    this.$page = this.$wrapper.parents(":jqmData(role='page')");  // The page containing the wrapper
    if (this.options.debug && this.options.traceCreateDestroy) {
      then = this._log("_create() start");
      }     
    this._createScroller();
    this.$scroller = this.$wrapper.children(":first");   // Get the first child of the wrapper, which is the
                                                         //   element that we will scroll                                                         
    if (!this.$scroller) { return; }

    // Find the scroller content elements. These are the direct descendants of the scroller
    this.$scrollerContentElements = $("> *", this.$scroller);
   
    // Find pull elements, if present
    $pullDown = $("." + this.options.pullDownClass, this.$scroller); 
    if ($pullDown.length) {
      this.$pullDown = $pullDown;
      this._modifyPullDown();
      }    
    $pullUp = $("." + this.options.pullUpClass, this.$scroller);    
    if ($pullUp.length) {
      this.$pullUp = $pullUp;
      this._modifyPullUp();    
      }     

    // Merge options from data-iscroll, if present
    $.extend(true, this.options, this.$wrapper.jqmData("iscroll"));   

    // Calculate height of headers, footers, etc.
    // We only do this at create time. If you change their height after creation,
    // please call calculateBarsHeight() yourself prior to calling resizeWrapper().
    // Calling this from resize events on desktop platforms is unreliable.
    // Some desktop platforms (example, Safari) will report unreliable element
    // heights during resize.
    this.calculateBarsHeight();    

    this._modifyWrapper();                 // Various changes to the wrapper    
    this._addScrollerPadding();            // Put back padding removed from wrapper     
    this._adaptPage();   

    // Prevent moving the wrapper with touch
    this._bind(this.$wrapper, "touchmove", this._preventDefaultFunc, "$wrapper");

    // Need this for deferred refresh processing
    this._bind(this.$page, "pagebeforeshow", this._pageBeforeShowFunc, "$page"); 

    this._setTopOffsetForPullDown();  // If there's a pull-down, set the top offset
    this._setBottomOffsetForPullUp(); // If there's a pull-up, set the bottom offset
    this.expandScrollerToFillWrapper(); // Make empty scroller content draggable   
    this._create_iscroll_object();   
    this._merge_from_iscroll_options();     // Merge iscroll options into widget options    
    if (this.options.debug && this.options.traceCreateDestroy) {
      this._logInterval("_create() end", then);
      }    
    },

  //----------------------------------------------------------
  // Destroy an instantiated plugin and clean up modifications
  // the widget has made to the DOM
  //----------------------------------------------------------
  destroy: function () {
    var then;
    if (this.options.debug && this.options.traceCreateDestroy) {
      then = this._log("destroy() start");
      }     
    this.iscroll.destroy();
    this.iscroll = null;

    this._undoExpandScrollerToFillWrapper();
    this._undoModifyPullDown();
    this._undoModifyPullUp();
    this._undoAdaptPage();
    this._undoAddScrollerPadding();
    this._undoModifyWrapper();

    // Remove the classes we added, since no longer using iscroll at
    // this point.
    this.$wrapper.removeClass(this.options.wrapperClass);
    this.$scroller.removeClass(this.options.scrollerClass);

    this._undoCreateScroller();

    // Unbind events
    this._unbind(this.$wrapper, "touchmove", this._preventDefaultFunc, "$wrapper");
    this._unbind(this.$page, "pagebeforeshow", this._pageBeforeshowFunc, "$page");
    this._unbind($(window), this.options.resizeEvents, this._orientationChangeFunc, "$(window)");
    this._unbind($(window), "orientationchange", this._orientationChangeFunc, "$(window)");

    // For UI 1.8, destroy must be invoked from the
    // base widget
    $.Widget.prototype.destroy.call(this);
    if (this.options.debug && this.options.traceCreateDestroy) {
      this._logInterval("destroy() end", then);
      }     
     // For UI 1.9, define _destroy instead and don't
     // worry about calling the base widget
    },

  // Enable the widget
  enable: function() {
    this.iscroll.enable();
    $.Widget.prototype.enable.call(this);
    },

  // Disable the widget
  disable: function() {
    this.iscroll.disable();
    $.Widget.prototype.disable.call(this);
    },

    //----------------------------------------------------------
    //Respond to any changes the user makes to the option method
    //----------------------------------------------------------
    _setOption: function( key, value ) {
      // iScroll4 doesn't officially support changing options after an iscroll object has been
      // instantiated. However, some changes will work if you do a refresh() after changing the
      // option. This is undocumented other than from user comments on the iscroll4 Google
      // Groups support group. If an option change doesn't work with refresh(), then it
      // is necessary to destroy and re-create the iscroll object. This is a functionality
      // that the author of iscroll4 intends to support in the future.
      //
      // TODO: Research which options can be successfully changed without destroying and
      //       re-creating the iscroll object. For now, I'm taking a safe approach and
      //       always destroying and re-creating the iscroll object.
      //switch (key) {
        //case "hScroll":
        //case "vScroll":
        //case "hScrollbar":
        //case "vScrollbar":
          //this.options[ key ] = value;          // Change our options object
          //this.iscroll.options[ key ] = value;  // ... and iscroll's options object
          //this.iscroll.refresh();               // Don't think we need the timing hack here
          //break;

        //default:
          this.options[ key ] = value;
          this.iscroll.destroy();
          this._create_iscroll_object();
          //break;
        //}
      // For UI 1.8, _setOption must be manually invoked from
      // the base widget
      $.Widget.prototype._setOption.apply(this, arguments);
      // For UI 1.9 the _super method can be used instead
      // this._super( "_setOption", key, value );
      },

    //----------------------------------------------------
    // Convenience wrappers around iscroll4 public methods
    // So, you can use:
    //
    // $(".some-class").iscrollview("scrollTo", x, y, time, relative);
    //
    // instead of:
    //
    // $(".some-class").jqmData("iscrollview").iscroll.scrollTo(x, y, time, relative);
    //
    //----------------------------------------------------
    scrollTo:        function(x,y,time,relative) { this.iscroll.scrollTo(x,y,time,relative); },
    scrollToElement: function(el,time)           { this.iscroll.scrollToElement(el,time); },
    scrollToPage:    function(pageX,pageY,time)  { this.iscroll.scrollToPage(pageX,pageY,time); },
    stop:            function()                  { this.iscroll.stop(); },
    zoom:            function(x,y,scale,time)    { this.iscroll.zoom(x,y,scale,time); },
    isReady:         function()                  { return this.iscroll.isReady(); },
    // See disable() enable() elsewhere above - they are standard widget methods

    //----------------------------------------------------------------------------------
    // Accessors for iscroll4 internal variables. These are sometimes useful externally.
    // For example, let's say you are adding elements to the end of a scrolled list.
    // You'd like to scroll up (using scrollToElement) if the new element would be
    // below the visible area. But if the list is intially empty, you'd want to avoid
    // this until the scrolling area is initially full. So you need to compare the
    // scroller height (scrollerH) to the wrapper height (wrapperH).
    //
    // These are also useful for creating "pull to refresh" functionality.
    //
    //-----------------------------------------------------------------------------------
    x:          function() { return this.iscroll.x; },
    y:          function() { return this.iscroll.y; },
    wrapperW:   function() { return this.iscroll.wrapperW; },
    wrapperH:   function() { return this.iscroll.wrapperH; },
    scrollerW:  function() { return this.iscroll.scrollerW; },
    scrollerH:  function() { return this.iscroll.scrollerH; },

    // These have setters. Useful for "pull to refresh".
    minScrollX: function(val) { if (val !== undefined) { this.iscroll.minScrollX = val; } return this.iscroll.minScrollX; },
    minScrollY: function(val) { if (val !== undefined) { this.iscroll.minScrollY = val; } return this.iscroll.minScrollY; },
    maxScrollX: function(val) { if (val !== undefined) { this.iscroll.maxScrollX = val; } return this.iscroll.maxScrollX; },
    maxScrollY: function(val) { if (val !== undefined) { this.iscroll.maxScrollY = val; } return this.iscroll.maxScrollY; },

    //-----------------------------------------------------------------------------------
    // Pull-down/Pull-up support
    //-----------------------------------------------------------------------------------
    // Is pull-down in "pulled" state?
    _pullDownIsPulled: function () {
      return this.$pullDown && this.$pullDown.hasClass(this.options.pullPulledClass);
      },

    // Is pull-up in "pulled" state?
    _pullUpIsPulled: function () {
      return this.$pullUp && this.$pullUp.hasClass(this.options.pullPulledClass);
      },

    // Replace the text in a pull block
    _replacePullText: function ($pull, text) {
      var $label;
      if (text) {
        $label = $("." + this.options.pullLabelClass, $pull);
        if ($label) { $label.text(text); }
        }
      },

    // Reset a pull block to the initial state
    _pullSetStateReset: function ($pull, text) {
      if ($pull.is("." + this.options.pullLoadingClass + ", ." + this.options.pullPulledClass)) {
        $pull.removeClass(this.options.pullPulledClass + " " + this.options.pullLoadingClass);
        this._replacePullText($pull, text);
        }
      },

    _pullDownSetStateReset: function(e) {
      this._triggerWidget("onpulldownreset", e, function() {
        this._pullSetStateReset(this.$pullDown, this.options.pullDownResetText);
        });
      },

    _pullUpSetStateReset: function(e) {
      this._triggerWidget("onpullupreset", e, function () {
        this._pullSetStateReset(this.$pullUp, this.options.pullUpResetText);
        });
      },

    // Set a pull block to pulled state
    _pullSetStatePulled: function($pull, text) {
      $pull.removeClass(this.options.pullLoadingClass).addClass(this.options.pullPulledClass);
      this._replacePullText($pull, text);
      },

    _pullDownSetStatePulled: function(e) {
      this._triggerWidget("onpulldownpulled", e, function() {
        this._pullSetStatePulled(this.$pullDown, this.options.pullDownPulledText);
        });
      },

    _pullUpSetStatePulled: function (e) {
      this._triggerWidget("onpulluppulled", e, function() {
        this._pullSetStatePulled(this.$pullUp, this.options.pullUpPulledText);
        });
      },

    // Set a pull block to the loading state
    _pullSetStateLoading: function($pull, text) {
      $pull.removeClass(this.options.pullPulledClass).addClass(this.options.pullLoadingClass);
      this._replacePullText($pull, text);
      },

    _pullDownSetStateLoading: function (e) {
      this._triggerWidget("onpulldownloading", e, function() {
        this._pullSetStateLoading(this.$pullDown, this.options.pullDownLoadingText);
        });
      },

    _pullUpSetStateLoading: function(e) {
      this._triggerWidget("onpulluploading", e, function() {
        this._pullSetStateLoading(this.$pullUp, this.options.pullUpLoadingText);
        });
     },

    _pullOnRefresh: function (e) {
      // It's debatable if this is the right place to do this. On one hand, it might be best
      // to do this in the pullup/down action function. We expect that we will always do a refresh
      // after the action, though (unless the action doesn't actually update anything, in which
      // case it can still call refresh().) On the other hand, it might be desirable to
      // "reset" the pull if a refresh comes along for some other reason. If the content were
      // updated because of something other than the user's pull action, then we consider the
      // pull moot.

      // Reset pull blocks to their initial state
      if (this.$pullDown) { this._pullDownSetStateReset(e); }
      if (this.$pullUp) { this._pullUpSetStateReset(e); }
      },

    _pullOnScrollMove: function (e) {
      var pullDownIsPulled, pullUpIsPulled, pullDownHeight, pullDownPast, pullUpHeight, pullUpPast,
          y = this.y();

      if (this.$pullDown) {
        pullDownIsPulled = this._pullDownIsPulled();
        pullDownHeight = this.options.topOffset;
        // User needs to pull down past the top edge of the pulldown element. To prevent false
        // triggers from aggressive scrolling, they should have to pull down some additional
        // amount. Half the height of the pulldown seems reasonable, but adjust per preference.
        pullDownPast = pullDownHeight / 2;

        // Set "pulled" state if not pulled and user has pulled past the pulldown element
        // by pullDownPast pixels
        if (!pullDownIsPulled && y > pullDownPast ) {
          this._pullDownSetStatePulled(e);
          this.minScrollY(0);   // Circumvent top offset so pull-down element doesn't rubber-band
          }

        // Allow user to "oopsie", and scroll back to cancel and avoid pull-down action
        // Cancel if pulled and user has scrolled back to top of pulldown element
        else if (pullDownIsPulled && y <= 0) {
          this._pullDownSetStateReset(e);
          this.minScrollY(-pullDownHeight);  // Re-instate top offset
          }
        }

     if (this.$pullUp) {
          pullUpIsPulled = this._pullUpIsPulled();
          pullUpHeight = this.options.bottomOffset;
          pullUpPast = pullUpHeight / 2;
       if (!pullUpIsPulled && y < this.maxScrollY() - pullUpHeight - pullUpPast ) {
         this._pullUpSetStatePulled(e);
         this.maxScrollY(this.wrapperH() - this.scrollerH() + this.minScrollY());
         }

        else if (pullUpIsPulled && y >= this.maxScrollY() ) {
          this._pullUpSetStateReset(e);
          this.maxScrollY(this.wrapperH() - this.scrollerH() + this.minScrollY() + pullUpHeight);
          }
       }

      },

    _pullOnScrollEnd: function (e) {
      if (this._pullDownIsPulled(e)) {
        this._triggerWidget("onpulldown", e, function() {
          this._pullDownSetStateLoading(e);
          });
        }
      else if (this._pullUpIsPulled(e)) {
        this._triggerWidget("onpullup", e, function() {
          this._pullUpSetStateLoading(e);
          });
        }
      }

    });

}( jQuery, window, document ));

// Self-init
jQuery(document).bind("pagecreate", function (e) {
  "use strict";
  // In here, e.target refers to the page that was created (it's the target of the pagecreate event)
  // So, we can simply find elements on this page that match a selector of our choosing, and call
  // our plugin on them.

  // The find() below returns an array of jQuery page objects. The Widget Factory will
  // enumerate these and call the widget _create() function for each member of the array.
  // If the array is of zero length, then no _create() fucntion is called.
  jQuery(e.target).find(":jqmData(iscroll)").iscrollview();
  });


