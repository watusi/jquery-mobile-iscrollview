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
/*global jQuery:false, iScroll:false, console:false*/

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

(function ($, window, document, undefined) { // Ignore jslint warning on undefined
  "use strict";

  //----------------------------------
  // "class constants"
  //----------------------------------
  var IsWebkit =  (/webkit/i).test(navigator.appVersion),
      IsAndroid = (/android/gi).test(navigator.appVersion),
      IsFirefox = (/firefox/i).test(navigator.userAgent),
         
      IsIDevice = (/(iPhone|iPad|iPod).*AppleWebKit/).test(navigator.appVersion),
      IsIPad = (/iPad.*AppleWebKit.*Safari/).test(navigator.appVersion),      
      // IDevice running Mobile Safari - not embedded UIWebKit or Standalone (= saved to desktop)
      IsMobileSafari = (/(iPhone|iPad|iPod).*AppleWebKit.*Safari/).test(navigator.appVersion),
      // IDevice native app using embedded UIWebView
      IsUIWebView = (/(iPhone|iPad|iPod).*AppleWebKit.(?!.*Safari)/).test(navigator.appVersion),
      // Standalone is when running a website saved to the desktop (SpringBoard)
      IsIDeviceStandalone = IsIDevice && window.navigator.Standalone,       
              
      IScrollHasDimensionFunctions = iScroll.prototype._clientWidth !== undefined;

  //===============================================================================
  // We need to add an iscrollview member to iScroll, so that we can efficiently
  // pass the iscrollview when triggering jQuery events. Otherwise, we'd have to
  // make a call to $(wrapper).jqmData() on each event trigger, which could have an impact
  // on performance for high-frequency events.
  //
  // We can't do that after construction, because iScroll triggers the refresh
  // event during construction. So, it's necessary to subclass iScroll.
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
    // Override width/height functions (if present in patched
    // iScroll) with our own. These use jquery.actual to get the
    // height/width while a page is loaded but hidden. So, refresh()
    // will work at the time of construction at pagecreate
    this._clientWidth  = function(ele) { return $(ele).actual("innerWidth"); };
    this._clientHeight = function(ele) { return $(ele).actual("innerHeight"); };
    this._offsetWidth  = function(ele) { return $(ele).actual("outerWidth"); };
    this._offsetHeight = function(ele) { return $(ele).actual("outerHeight"); };    
    // Event proxies will use this
    this.iscrollview = iscrollview;    
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

  iscroll:     null,  // The underlying iScroll object
  $wrapper:    null,  // The wrapper element
  $scroller:   null,  // The scroller element (first child of wrapper)
  $pullDown:   null,  // The pull-down element (if any)
  $pullUp:     null,  // The pull-up element (if any)
  $page:       null,  // The page element that contains the wrapper

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
        
    debug:false,                          // Enable some messages to console
    
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
    // Best performance on iOS is only orientationchange
    // Refresh can be 200mSec on iPhone 4, so it's a significant performance difference
    // Experimentation with other devices would be useful
    resizeEvents: IsIDevice ? "orientationchange": "resize",

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
    _widget_only_options: [
      "emulateBottomoffset",       
      "pageClass",
      "wrapperClass",
      "scrollerClass",
      "pullDownClass",
      "pullUpClass",  
      "scrollerContentClass",
      "pullUpLabelClass",
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
       
    // The following functions are called from the proxy event functions. These are things
    // we always want to do on certain iScroll4 events. 
     
    // Emulate bottomOffset functionality in case iScroll doesn't have patch for bottomOffset 
    // Note that this is first called in the context of iscroll, because it is called during
    // instantiation of iscroll.  So, the widget doesn't have a reference to the iscroll
    // yet - it is still null.  
    _emulateBottomOffset: function(e) {
      var that = this.iscrollview;
      if (that.options.emulateBottomOffset) {
        this.maxScrollY = this.wrapperH - this.scrollerH + this.minScrollY + 
          that.options.bottomOffset; 
        }       
    },
    
    // Allow events through to input elements
    _fixInput: function(e) {
     if (this.options.fixInput ) { 
       var tagName,
           target = e.target;
       while (target.nodeType !== 1) { target = target.parentNode; }
         tagName = target.tagName.toLowerCase();
         if (tagName === "select" || tagName === "input" || tagName === "textarea") { 
           return; 
         }
       }
      e.preventDefault();     
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
        var that = this.iscrollview;
        that._emulateBottomOffset.call(this);
        that._pullOnRefresh.call(that, e);
        that._trigger("onrefresh",e,{"iscrollview":that});
        },

      onBeforeScrollStart: function(e) {
        var that = this.iscrollview;
        that._fixInput.call(that, e);     
        that._trigger("onbeforescrollstart",e,{"iscrollview":that});
        },

      onScrollStart: function(e) {
        var that = this.iscrollview;
        that._trigger("onscrollstart",e,{"iscrollview":that});
        },
        
      onBeforeScrollMove:  function(e) {
        var that = this.iscrollview;
        that._trigger("onbeforescrollmove",e,{"iscrollview":that});
        },

      onScrollMove: function(e) {
        var that = this.iscrollview;
        that._pullOnScrollMove.call(that, e); 
        that._trigger("onscrollmove",e,{"iscrollview":that});
        },

      onBeforeScrollEnd:   function(e) {
        var that = this.iscrollview;
        that._trigger("onbeforescrollend",e,{"iscrollview":that});
        },
     
      onScrollEnd: function(e) {
        var that = this.iscrollview;
        that._pullOnScrollEnd.call(that, e);
        this.iscrollview._trigger("onscrollend",e,{"iscrollview":that});
        },
        
      onTouchEnd:          function(e) {
        var that = this.iscrollview;
        that._trigger("ontouchend",e,{"iscrollview":that});
        },
        
      onDestroy:           function(e) {
        var that = this.iscrollview;
        that._trigger("ondestroy",e,{"iscrollview":that});
        },
        
      onZoomStart:         function(e) {
        var that = this.iscrollview;
        that._trigger("onzoomstart",e,{"iscrollview":that});
        },
        
      onZoom:              function(e) {
        var that = this.iscrollview;
        that._trigger("onzoom",e,{"iscrollview":that});
        },
        
      onZoomEnd:           function(e) {
        var that = this.iscrollview;
        that._trigger("onzoomend",e,{"iscrollview":that});
        }
        
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
    $.each(this._widget_only_options, function(i,v) {delete options[v];});
    // Remove widget event options
    $.each(this._event_map, function(k,v) {delete options[k];});
    if (this.options.emulateBottomOffset) { delete options.bottomOffset; }  
    // Add proxy event functions
    return $.extend(options, this._proxy_event_funcs);
    },
    
  // Formats number with fixed digits
  _pad: function(num, digits, char) {
    var str = num.toString(),
        padChar = char || "0";
    while (str.length < digits) {
      str = padChar + str;
      }
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
  _log: function(text) {
    if (!this.options.debug) { return; }
    var id = this.$wrapper.attr("id"),
        idStr = id ? "#" + id : ""; 
    console.log(this._toTime(new Date()) + " " + 
                $.mobile.path.parseUrl(this.$page.jqmData("url")).filename + idStr + " " +
                text );
  },
    
  // Log elapsed time from then to now
  _logTiming: function(text, then) {
    if (!this.options.debug) { return; }
    var now = new Date();
    this._log(text + " " + (now - then) + "mS from " + this._toTime(then) );        
    }, 
    
  // Log elapsed time from then to now and later to now 
  _logTiming2: function(text, then, later) {
    if (!this.options.debug) { return; }
    var now = new Date();
    this._log(text + " " + 
              (now - later) + "mS from " + this._toTime(later) + 
              " (" + (now - then) + "mS from " + this._toTime(then) + ")" );
    }, 
    
  _startTiming: function() {
    if (!this.options.debug) { return null; }
    return new Date();
    }, 
    
  //-------------------------------------------------------------------
  // Returns status of dirty flag, indicating that refresh() was called
  // while the page was not active, and refresh will be deferred until
  // pagebeforeshow.
  //-------------------------------------------------------------------  
  isDirty: function() {
    return this._dirty;
    },

  //------------------------------------------------------------------------------
  // Functions that we bind to. They are declared as named members rather than as
  // inline closures so we can properly unbind them.
  //------------------------------------------------------------------------------
  // generic preventDefault func
  _preventDefaultFunc: function(e) {
    e.preventDefault();
    },

  _pageBeforeShowFunc: function(e) {
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
   },

  // Called on resize events
  _windowResizeFunc: function(e) { 
    if (this.options.deferNonActiveResize && !this.$page.hasClass("ui-page-active"))  {
      this._sizeDirty = true;
      this._log("resizeWrapper (deferred)");
      }
    else {     
      this.resizeWrapper();
      this.expandScrollerToFillWrapper();
      }
    this.refresh();
    },
    
  // On some platforms (iOS, for example) you need to scroll back to top after orientation change,
  // because the address bar pushed the window down. jQuery Mobile handles this for page links,
  // but doesn't for orientationchange  
  _orientationChangeFunc: function(e) {
    if (this.options.scrollTopOnOrientationChange) {
      $.mobile.silentScroll(0);
      }
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
    this._origPageStyle = this.$page.attr("style");  // Save for later restore
    this.$page.css({overflow: "hidden"});
    this._raiseFixedHeightElements();

    // Prevent moving the page with touch. Should be optional?
    // (Maybe you want a scrollview within a scrollable page)
    this.$page.bind("touchmove", $.proxy(this._preventDefaultFunc, this));
    },

  _undoAdaptPage: function() {
    this.$page.unbind("touchmove", this._preventDefaultFunc);
    this._undoRaiseFixedHeightElements();
    this.$page.attr("style", this._origPageStyle); 
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
    this._origWrapperStyle = this.$wrapper.attr("style");            
    this.$wrapper.css({ 
                        "z-index"  : 1,         // Lower the wrapper
                        "overflow" : "hidden"   // hide overflow
                        }); 
    this._removeWrapperPadding();
    this._correctWrapperPosition();
    },
  
  _undoModifyWrapperCSS: function() {
    this.$wrapper.attr("style", this._origWrapperStyle);                 
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
    var $scrollerContent = this.$scroller.children()
                                         .not("." + this.options.pullDownClass)
                                         .not("." + this.options.pullUpClass)
                                         .not("." + this.options.pullUpSpacerClass),
        $scrollerContentWrapper;
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
        this._origScrollerStyle = this.$scroller.attr("style");
        this._firstScrollerExpand = false;
        }
      this.$scroller.css("min-height", 
        this.$wrapper.actual("height") + 
        this.$pullDown.actual("outerHeight",{includeMargin:true}) + 
        this.$pullUp.actual("outerHeight",{includeMargin:true})
        );  
      } 
    },
  
  _undoExpandScrollerToFillWrapper: function() {
    if (this._origScrollerStyle !== undefined) {
      this.$scroller.attr("style", this._origScrollerStyle);
      } 
    },     
  
  //--------------------------------------------------------
  //Resize the wrapper for the scrolled region to fill the
  // viewport remaining after all fixed-height elements
  //--------------------------------------------------------
  resizeWrapper: function() {
    var adjust, 
        then;   
    if (!this.options.resizeWrapper) { return; }
    then = this._startTiming();    
    adjust = this._getHeightAdjustForBoxModel(this.$wrapper) ;
    this.$wrapper.height(
    $(window).height() -         // Height of the window
    this._barsHeight -           // Height of fixed bars or "other stuff" outside of the wrapper
    adjust +                     // Make adjustment based on content-box model
    (IsMobileSafari && !IsIPad ? 60 : 0) +  // Add 60px for space recovered from Mobile Safari address bar
    this.options.wrapperAdd      // User-supplied fudge-factor if needed
    );
    // The first time we resize, save the size of the wrapper
    if (this._firstWrapperResize) {
      this._origWrapperHeight = this.$wrapper.height() - adjust;
      this._firstWrapperResize = false;
      }          
    this._logTiming("resizeWrapper" + (this._sizeDirty ? " (dirty)" : ""), then);      
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
      $(window).bind(this.options.resizeEvents, $.proxy(this._windowResizeFunc, this));
      if (this.options.scrollTopOnOrientationChange) {
        $(window).bind("orientationchange", $.proxy(this._orientationChangeFunc, this));
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
    this._origPullUpStyle = this.$pullUp.attr("style");
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
    this.$pullUp.attr("style", this._origPullUpStyle);   
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
  
    var _this, _delay, _callbackBefore, _callbackAfter, _context, _noDefer, then, later, latest;
  
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
      this._log("refresh (deferred)");
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
      var later = _this._startTiming(),
          latest;
          
      if (_callbackBefore) { _callbackBefore(_context); }      
      _this._trigger("onbeforerefresh",  null, {"iscrollview":_this});
      _this._logTiming("onbeforerefresh", later);     
      
      _this.iscroll.refresh();
      
      latest = _this._startTiming();
      if (_callbackAfter) { _callbackAfter(_context); }
      _this._trigger("onafterrefresh", null, {"iscrollview":_this});
      _this._logTiming("onafterrefresh", latest);

      _this._logTiming2("refresh" + (_noDefer ? " (dirty)" : ""), then, later);
      }, _delay);
      
    this._log("refresh will occur after " + _delay + "mS");
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
    this.$wrapper = this.element;                                 // JQuery object containing the element we are creating this widget for
    this.$page = this.$wrapper.parents(":jqmData(role='page')");  // The page containing the wrapper                                                              
    this._createScroller();
    this.$scroller = this.$wrapper.children(":first");            // Get the first child of the wrapper, which is the
                                                                  //   element that we will scroll  
    if (!this.$scroller) { return; }                                                                     
 
    // Find the scroller content elements. These are the direct descendants of the scroller
    this.$scrollerContentElements = $("> *", this.$scroller);
       
    // Find pull elements, if present
    this.$pullDown = $("." + this.options.pullDownClass, this.$scroller);
    this.$pullUp = $("." + this.options.pullUpClass, this.$scroller);  
    this._modifyPullDown();
    this._modifyPullUp();  
       
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
    this.$wrapper.bind("touchmove", $.proxy(this._preventDefaultFunc, this));

    //if (this.options.refreshOnPageBeforeShow) {
      this.$page.bind("pagebeforeshow", $.proxy(this._pageBeforeShowFunc, this));
   //   }
        
    this._setTopOffsetForPullDown();  // If there's a pull-down, set the top offset
    this._setBottomOffsetForPullUp(); // If there's a pull-up, set the bottom offset 
    this.expandScrollerToFillWrapper(); // Make empty scroller content draggable    
    this._create_iscroll_object(); 
    this._merge_from_iscroll_options();     // Merge iscroll options into widget options      
    },

  //----------------------------------------------------------
  // Destroy an instantiated plugin and clean up modifications
  // the widget has made to the DOM
  //----------------------------------------------------------
  destroy: function () {
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
    this.$wrapper.unbind("touchmove", this._preventDefaultFunc);
    this.$page.unbind("pagebeforeshow", this._pageBeforeShowFunc);
    $(window).unbind(this.options.resizeEvents, this._windowResizeFunc);
    $(window).unbind("orientationchange", this._orientationChangeFunc);

    // For UI 1.8, destroy must be invoked from the
    // base widget
    $.Widget.prototype.destroy.call(this);
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
      return this.$pullDown.hasClass(this.options.pullPulledClass);    
      },  
 
    // Is pull-up in "pulled" state?  
    _pullUpIsPulled: function () {
      return this.$pullUp.hasClass(this.options.pullPulledClass);    
      },     

    // Replace the text in a pull block
    _replacePullText: function ($pull, text) {
      var $label;
      if (text) {
        $label = $("." + this.options.pullLabelClass, $pull);
        if ($label) {
          // On some browsers, the text will not be shown unless it is first hidden
          // and then shown after it is changed.
          $label.hide().text(text);
          setTimeout(function() { $label.show(); }, 0);  // Give the browser time to think...
          }
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
      this._pullSetStateReset(this.$pullDown, this.options.pullDownResetText);
      this._trigger("onpulldownreset", e, {"iscrollview":this} );      
      },      
      
    _pullUpSetStateReset: function(e) {
      this._pullSetStateReset(this.$pullUp, this.options.pullUpResetText);
      this._trigger("onpullupreset", e, {"iscrollview":this} );       
      },
      
    // Set a pull block to pulled state
    _pullSetStatePulled: function($pull, text) {
      $pull.removeClass(this.options.pullLoadingClass).addClass(this.options.pullPulledClass);
      this._replacePullText($pull, text);
      },
      
    _pullDownSetStatePulled: function(e) {
      this._pullSetStatePulled(this.$pullDown, this.options.pullDownPulledText);
      this._trigger("onpulldownpulled", e, {"iscrollview":this} );       
      },
    
    _pullUpSetStatePulled: function (e) {
      this._pullSetStatePulled(this.$pullUp, this.options.pullUpPulledText);
      this._trigger("onpulluppulled", e, {"iscrollview":this} );       
      },

    // Set a pull block to the loading state
    _pullSetStateLoading: function($pull, text) {
      $pull.removeClass(this.options.pullPulledClass).addClass(this.options.pullLoadingClass);
      this._replacePullText($pull, text);
      },
    
    _pullDownSetStateLoading: function (e) {
      this._pullSetStateLoading(this.$pullDown, this.options.pullDownLoadingText);
      this._trigger("onpulldownloading", e, {"iscrollview":this} );         
      },
    
    _pullUpSetStateLoading: function(e) {
      this._pullSetStateLoading(this.$pullUp, this.options.pullUpLoadingText); 
      this._trigger("onpulluploading", e, {"iscrollview":this} );          
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
      this._pullDownSetStateReset(e);
      this._pullUpSetStateReset(e);
      },

    _pullOnScrollMove: function (e) {
      var pullDownIsPulled = this._pullDownIsPulled(),
          pullUpIsPulled = this._pullUpIsPulled(),
          pullDownHeight = this.options.topOffset,
          // User needs to pull down past the top edge of the pulldown element. To prevent false
          // triggers from aggressive scrolling, they should have to pull down some additional 
          // amount. Half the height of the pulldown seems reasonable, but adjust per preference.     
          pullDownPast = pullDownHeight / 2,   
          pullUpHeight = this.options.bottomOffset,
          pullUpPast = pullUpHeight / 2,
          y = this.y();
  
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
  
     // Repeat for pull-up
     else if (!pullUpIsPulled && y < this.maxScrollY() - pullUpHeight - pullUpPast ) {
       this._pullUpSetStatePulled(e);
       this.maxScrollY(this.wrapperH() - this.scrollerH() + this.minScrollY()); 
       }
 
      else if (pullUpIsPulled && y >= this.maxScrollY() ) {
        this._pullUpSetStateReset(e);
        this.maxScrollY(this.wrapperH() - this.scrollerH() + this.minScrollY() + pullUpHeight);             
        }
      },

    _pullOnScrollEnd: function (e) {
      if (this._pullDownIsPulled(e)) { 
        this._pullDownSetStateLoading(e);
        this._trigger("onpulldown", e, {"iscrollview":this} );    
        }
      else if (this._pullUpIsPulled(e)) { 
        this._pullUpSetStateLoading(e); 
        this._trigger("onpullup", e, {"iscrollview":this} );    
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
  // enumerate these and call the widget _create() fucntion for each member of the array.
  // If the array is of zero length, then no _create() fucntion is called.
  jQuery(e.target).find(":jqmData(iscroll)").iscrollview();
  });


