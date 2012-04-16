/*
jquery.mobile.iscrollview.js
Version: 1.0
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

dependency:  iScroll 4.1.9 https://cubiq.org/iscroll
             jquery.actual 1.0.6 https://github.com/dreamerslab/jquery.actual
             jQuery 1.6.4  (JQM 1.0.1) or 1.7.2 (JQM 1.1)
             JQuery Mobile >= 1.0.1 or 1.1rc2

*/

;(function ( $, window, document, undefined ) {

  //----------------------------------
  // "class constants"
  //----------------------------------
  var IsWebkit =  (/webkit/i).test(navigator.appVersion);
  var IsAndroid = (/android/gi).test(navigator.appVersion);

  // I have no frickin' idea what this mystery 34 pixels is about,
  // but it's necessary...
  var WebkitWindowHeightFix = 34;

  $.widget( "mobile.iscrollview", $.mobile.widget, {

  //-------------------------------------------
  // The iscroll4 object. Affords direct access
  // to iscroll4 methods
  //--------------------------------------------
  iscroll: null,

  // True on first resize, so we can capture original wrapper height
  _firstResize: true,

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
    pageClass:      "iscroll-page",      // Class to be applied to pages containing this widget
    wrapperClass:   "iscroll-wrapper",   // Class to be applied to wrapper containing this widget
    scrollerClass:  "iscroll-scroller",  // Class to be applied to scroller within wrapper

    // true to adapt the page containing the widget. If false, the widget will not alter any
    // elements outside of the widget's container.
    adaptPage:      true,

    // JQuery selector for fixed-height elements on page.
    // Use iscroll-foreground class for arbitrary fixed-height elements other than
    // header/footer
    fixedHeightSelector: ".ui-header, .ui-footer, .iscroll-foreground",

    // true to resize the wrapper to take all viewport space after fixed-height elements
    // (typically header/footer)
    // false to not change the size of the wrapper
    // For example, if using multiple iscrollview widgets on the same page, a maximum
    // of one of them could resize to remaining space. You would need to explicitly
    // set the height of additional iscrollviews and give them the fixed height class.
    resizeWrapper:  true,

    // Space-separated list of events on which to resize/refresh iscroll4
    // On some mobile devices you may wish to add/substitute orientationchange event
    // For iOS devices, resize works better, because the orientationchange event
    // occurs too late resulting is visual distraction.
    resizeEvents: "resize",

    // Refresh iscrollview on page show event. This should be true if content inside a
    // scrollview might change while the page is cached but not shown.
    refreshOnPageBeforeShow: true,

    // true to fix iscroll4 input element focus problem in the widget.
    // false if you are using a patched iscroll4 with different fix or to
    // disable for performance reasons
    fixInput: false,

    //-------------------------------------------------------------
    // Widget events. These correspond to events defined for the
    // iscroll object, but follow widget naming conventions.
    // These will be copied to the corresponding iscroll object
    // options, which follow different naming conventions, and
    // removed from the options passed to iscroll to avoid
    // pollution of the iscroll options object.
    //-------------------------------------------------------------
    refresh:           null,

    // iscroll4 requires that the user's onBeforeScrollStart function call preventDefault().
    // Additionally, form input can be fixed in this callback, and we do so if the
    // associated option is set. If you overwrite the callback make sure to save
    // the function reference and call after your code.
    beforescrollstart: function(e) {
      if ($(this).iscrollview("option", "fixInput")) {  // note we are not in iscrollview object context
       var target = e.target;
       while (target.nodeType != 1) target = target.parentNode;
       var tagName = target.tagName.toLowerCase();
       if (tagName == 'select' || tagName == 'input' || tagName != 'textarea')
          return;
       }
      e.preventDefault();
      },


    scrollstart:       null,
    beforescrollmove:  null,
    scrollmove:        null,
    beforescrollend:   null,
    scrollend:         null,
    touchend:          null,
    destroy:           null,
    zoomstart:         null,
    zoom:              null,
    zoomend:           null
    },

    //---------------------------------------------------------------------------------------
    // Array of keys of options that are widget-only options (not options in iscroll4 object)
    //---------------------------------------------------------------------------------------
    _widget_only_options: [
      "pageClass",
      "wrapperClass",
      "scrollerClass",
      "adaptPage",
      "fixedHeightSelector",
      "resizeWrapper",
      "resizeEvents",
      "refreshOnPageBeforeShow",
      "fixInput"
      ],

    //-----------------------------------------------------------------------
    // Map of widget event names to corresponding iscroll4 object event names
    //-----------------------------------------------------------------------
    _event_map: {
      refresh:           "onRefresh",
      beforescrollstart: "onBeforeScrollStart",
      scrollstart:       "onScrollStart",
      beforescrollmove:  "onBeforeScrollMove",
      scrollmove:        'onScrollMove',
      beforescrollend:   'onBeforeScrollEnd',
      scrollend:         "onScrollEnd",
      touchend:          "onTouchEnd",
      destroy:           "onDetroy",
      zoomstart:         "onZoomStart",
      zoom:              "onZoom",
      zoomend:           "onZoomEnd"
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
    //------------------------------------------------------------------------------
    _proxy_event_funcs: {
      onRefresh:           function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("refresh",e);},
      onBeforeScrollStart: function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("beforescrollstart",e);},
      onScrollStart:       function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("scrollstart",e);},
      onBeforeScrollMove:  function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("beforescrollmove",e);},
      onScrollMove:        function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("scrollmove",e);},
      onBeforeScrollEnd:   function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("beforescrollend", e);},
      onScrollEnd:         function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("scrollend",e);},
      onTouchEnd:          function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("touchend",e);},
      onDestroy:           function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("destroy",e);},
      onZoomStart:         function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("zoomstart",e);},
      onZoom:              function(e) {$(this,wrapper).jqmData("iscrollview")._trigger("zoom",e);},
      onZoomEnd:           function(e) {$(this.wrapper).jqmData("iscrollview")._trigger("zoomend",e);}
      },

  // Merge options from the iscroll object into the widget options
  // So, this will backfill iscroll4 defaults that we don't set in
  // the widget, giving a full set of iscroll options, and leaving
  // widget-only options untouched.
  _merge_from_iscroll_options: function() {
    var options = $.extend(true, {}, this.iscroll.options);
    // Delete event options from the temp options
    for (var key in this._proxy_event_funcs) delete options[key];
    $.extend(this.options, options);   // Merge result into widget options
    },

  // Create a set of iscroll4 object options from the widget options.
  // We have to omit any widget-specific options that are
  // not also iscroll4 options. Also, copy the proxy event functions to the
  // iscroll4 options.
  _create_iscroll_options: function() {
    var options = $.extend(true, {}, this.options);  // temporary copy of widget options
    // Remove options that are widget-only options
    for (var i in this._widget_only_options) delete options[this._widget_only_options[i]];
    // Remove widget event options
    for (var key in this._event_map) delete options[key];
    // Add proxy event functions
    return $.extend(options, this._proxy_event_funcs);
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
    this.refresh();
    },

  _windowResizeFunc: function(e) {
    this.resizeWrapper();
    this.refresh();
    },

  //----------------------------
  // Raise fixed-height elements
  //----------------------------
  _raiseFixedHeightElements: function() {
  var $page = this.element.parents(":jqmData(role='page')");  // The page containing the wrapper
    $page.find(this.options.fixedHeightSelector).each(function() {
      $(this).jqmData("iscrollviewOrigZindex", $(this).css("z-index"));
      $(this).css("z-index", 1000);
     });
  },

  _undoRaiseFixedHeightElements: function() {
  var $page = this.element.parents(":jqmData(role='page')");  // The page containing the wrapper
    $page.find(this.options.fixedHeightSelector).each(function() {
      var zIndex = $(this).jqmData("iscrollviewOrigZindex");
      if (zIndex != null) $(this).css("z-index", zIndex);
    });
  },

  //--------------------------------------------------------
  //Resize the wrapper for the scrolled region to fill the
  // viewport remaining after all fixed-height elements
  //--------------------------------------------------------
  resizeWrapper: function() {
    var $wrapper = this.element;
    var $page = $wrapper.parents(":jqmData(role='page')");
    var barsHeight = 0;

    // The first time we resize, save the size of the wrapper
    if (this._firstResize) {
      this._origWrapperHeight = $wrapper.height();
      this._firstResize = false;
      }

    $page.find(this.options.fixedHeightSelector).each(function() {  // Iterate over headers/footers
      barsHeight += $(this).actual("innerHeight");
      });

    windowHeightFix = IsWebkit ? WebkitWindowHeightFix : 0;
    $wrapper.height($(window).actual("height") - barsHeight - windowHeightFix);
    },

  undoResizeWrapper: function() {
    if ("_origWrapperHeight" in this) this.element.height(this._origWrapperHeight);
  },

  //-------------------------------------------------
  //Refresh the iscroll object
  // Insure that refresh is called with proper timing
  //-------------------------------------------------
  refresh: function(callback, context) {
    // Let the browser complete rendering, then refresh the scroller
  //
  // Optional callback parameter is called if present after iScroll internal
  // refresh() is called. This permits caller to perform some action
  // guranteed to occur after the refresh has occured. While the caller
  // might bind to the refresh event, this is more convenient and avoids
  // any ambiguity over WHICH call to refresh has completed.
    var _this = this;
    var _callback = callback;
    var _context = context;
    setTimeout(function() {
      _this.iscroll.refresh();
      if (_callback)
          _callback(_context);
      }, IsAndroid ? 200 : 0);
    },

  //-------------------------------
  // _create()
  //-------------------------------
  _create: function() {
    // _create will automatically run the first time this
    // widget is called. Put the initial widget set-up code
    // here, then you can access the element on which
    // the widget was called via this.element
    // The options defined above can be accessed via
    // this.options

  var $wrapper = this.element;                            // JQuery object containing the element we are creating this widget for
  var wrapper = $wrapper.get(0);                          // Raw DOM node for same
  var $page = $wrapper.parents(":jqmData(role='page')");  // The page containing the wrapper
  var $scroller = $wrapper.children(":first");            // Get the first child of the wrapper, which is the
                                                          //   element that we will scroll
  if (!$scroller) { return; }                             // If there isn't one, nothing to do

  // Merge options from data-iscroll, if present
  $.extend(true, this.options, $wrapper.jqmData("iscroll"));

  // Add some convenient classes in case user wants to style pages/wrappers/scrollers
  //  that use iscroll.
  $wrapper.addClass(this.options.wrapperClass);
  $scroller.addClass(this.options.scrollerClass);

  // Adapt the page containing the iscrollview widget
  if (this.options.adaptPage) {
    $page.addClass(this.options.pageClass);

    // XXX: fix crumbled css in transition changePage
    // for jquery mobile 1.0a3 in jquery.mobile.navigation.js changePage
    //  in loadComplete in removeContainerClasses in .removeClass(pageContainerClasses.join(" "));
    this._origPageOverflow = $page.css("overflow");  // Save for later restore
    $page.css({overflow: "hidden"});
    this._raiseFixedHeightElements();

    // Prevent moving the page with touch. Should be optional?
    // (Maybe you want a scrollview within a scrollable page)
    $page.bind("touchmove", $.proxy(this._preventDefaultFunc, this));
  }

  this._origWrapperZindex = $wrapper.css("z-index");     // Save for un-do in destroy()
  this._origWrapperOverflow = $wrapper.css("overflow");
  $wrapper.css({ "z-index" : 1,            // Lower the wrapper
                 "overflow" : "hidden" }); // hide overflow

  // Prevent moving the wrapper with touch
  $wrapper.bind("touchmove", $.proxy(this._preventDefaultFunc, this));

  //Refresh the iscroll object when the page is shown, in case content was changed
  // asynchronously while it was hidden. Applicable to mobile native app environments
  // such as PhoneGap, Rhodes, etc./We assume that fixed-height headers/footers
  // were not changed
  //
  // This also seems necessary for some desktop browsers even when not
  // changing content asynchronously. This is probably because we are
  // not able to determine fixed-height element heights prior to this,
  // even using jQuery.actual plugin.
  if (this.options.refreshOnPageBeforeShow)
    $page.bind("pagebeforeshow", $.proxy(this._pageBeforeShowFunc, this));

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
  // TODO: This doesn't seem to set the scrollbar range correctly in
  //       landscape orientation. It seems to be a bug in iscroll4 itself.
  //       I tried destroy/recreate iscroll object, but that doesn't
  //       help.
  //
  // TODO: Consider using jquery-resize.js to rate-limit resize events
  if (this.options.resizeWrapper) {
    this.resizeWrapper();   // Resize wrapper to take remaining space after bars
    $(window).bind(this.options.resizeEvents, $.proxy(this._windowResizeFunc, this));
    }

  // Create the iScroll object
  this.iscroll = new iScroll(wrapper, this._create_iscroll_options());
  this._merge_from_iscroll_options();     // Merge iscroll options into widget options
  },

  //----------------------------------------------------------
  // Destroy an instantiated plugin and clean up modifications
  // the widget has made to the DOM
  //----------------------------------------------------------
  destroy: function () {
    var $wrapper = this.element;                            // JQuery object containing the element we are creating this widget for
    var $page = $wrapper.parents(":jqmData(role='page')");  // The page containing the wrapper
    var $scroller = $wrapper.children(":first");            // Get the first child of the wrapper, which is the
                                                            //   element that we will scroll
    this.iscroll.destroy();
    this.iscroll = null;

    // Remove the classes we added, since no longer using iscroll at
    // this point.
    $wrapper.removeClass(this.options.wrapperClass);
    $scroller.removeClass(this.options.scrollerClass);
    $page.removeClass(this.options.pageClass);

    // Remove CSS modifications made to the DOM
    if ("_origPageOverflow" in this) $page.css("overflow", this._origPageOverflow);
    this._undoRaiseFixedHeightElements();
    if ("_origWrapperZindex" in this) $wrapper.css("z-index", this._origWrapperZindex);
    if ("_origWrapperOverflow" in this) $wrapper.css("overflow", this._origWrapperOverflow);

    // Unbind events
    $page.unbind("touchmove", this._preventDefaultFunc);
    $wrapper.unbind("touchmove", this._preventDefaultFunc);
    $page.unbind("pagebeforeshow", this._pageBeforeShowFunc);
    $(window).unbind(this.options.resizeEvents, this._windowResizeFunc);

    this.undoResizeWrapper();   // Resize wrapper back to original size

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
    _setOption: function ( key, value ) {
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
      switch (key) {
        //case "hScroll":
        //case "vScroll":
        //case "hScrollbar":
        //case "vScrollbar":
          //this.options[ key ] = value;          // Change our options object
          //this.iscroll.options[ key ] = value;  // ... and iscroll's options object
          //this.iscroll.refresh();               // Don't think we need the timing hack here
          //break;

        default:
          this.options[ key ] = value;
          var $wrapper = this.element;                            // JQuery object containing the element we are creating this widget for
          var wrapper = $wrapper.get(0);                          // Raw DOM node for same
          this.iscroll.destroy();
          this.iscroll = new iScroll(wrapper, this._create_iscroll_options());
          break;
        }
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
    disable:         function()                  { this.iscroll.disable(); },
    enable:          function()                  { this.iscroll.enable(); },
    stop:            function()                  { this.iscroll.stop(); },
    zoom:            function(x,y,scale,time)    { this.iscroll.zoom(x,y,scale,time); },
    isReady:         function()                  { return this.iscroll.isReady(); },


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
    // These methods give easy access to these variables. They are all read-only
    // accessors.
    //-----------------------------------------------------------------------------------
    x:          function() { return this.iscroll.x; },
    y:          function() { return this.iscroll.y; },
    wrapperW:   function() { return this.iscroll.wrapperW; },
    wrapperH:   function() { return this.iscroll.wrapperH; },
    scrollerW:  function() { return this.iscroll.scrollerW; },
    scrollerH:  function() { return this.iscroll.scrollerH; },
    minScrollX: function() { return this.iscroll.minScrollX; },
    minScrollY: function() { return this.iscroll.minScrollY; },
    maxScrollX: function() { return this.iscroll.maxScrollX; },
    maxScrollY: function() { return this.iscroll.maxScrollY; }

    });

})( jQuery, window, document );


// Self-init
$(document).bind("pagecreate", function (e) {
  // In here, e.target refers to the page that was created
  // (it's the target of the pagecreate event)
  // So, we can simply find elements on this page that match a
  // selector of our choosing, and call our plugin on them.
  $(e.target).find(":jqmData(iscroll)").iscrollview();
  });


