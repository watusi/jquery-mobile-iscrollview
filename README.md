watusi/jquery-mobile-iscrollview, Version 1.1+
==============================================
JQuery Mobile widget plug-in for easy use of the [iScroll](https://github.com/cubiq/iscroll)
scroller in [JQuery Mobile](https://github.com/jquery/jquery-mobile)
projects.

This is a full JQuery [Widget Factory](https://github.com/scottgonzalez/jquery-ui-1.8-widget-factory)
widget implementation. It follows the *widget-factory-mobile*
[Widget Factory Pattern](https://github.com/addyosmani/jquery-plugin-patterns).

---

Usage
-----
The most basic usage of this widget is simple: just add a `data-iscroll`
attribute to a container. All content inside this container will be scrolled.

Note that iScroll scrolls only the first child of it's wrapper. However, by
default, this widget automatically creates a protective `<div>` around all
children of the wrapper. If, for some reason, you do not want the widget to create
this protective container, set the `createScroller` option to `false`.

The widget does not use the typical JQuery Mobile `data-role="something"` attribute,
because a common use case would be to use a `data-role="content"` `<div>` as the
container, and, of course, you can't have two `data-role` attributes on the
same element.

This widget has only been tested with a single scroller on a page.
The widget will (normally) re-size the container to take up all available height
within the viewport after fixed headers/footers are taken into account,
and will make necessary adjustments to the page CSS. This can be disabled,
and should only be enabled for one scroller on a given page.

The widget has been designed to
support multiple scrolling regions on a page - for example, you might
want a second, gallery-like horizontal scroll region. So, all
data related to a scroller is stored in the scroller's container, not the page.
Feel free to experiment with multiple scrollers - I just haven't had the
need so haven't put the effort into testing and supporting that scenario.


You can use either `data-position="inline"` or `data-position="fixed"` for headers/footers.
However, with `data-position="fixed"`, and some versions of JQuery Mobile on some browsers, 
the headers/footers will fade in/out. Since this widget resizes the scrolling region, there is 
no need for fixed positioning of header/footer.

Additional fixed-height elements (which are not headers or footers)
outside of the scrolling region should be given the `iscroll-foreground`
class, if they would add to the height of the page. (Do not add the `iscroll-foreground` class
to sidebars.)

---

Example
-------
```html
  <div data-role="page" id="index">

    <div data-role="header" data-position="inline">
      <h1>INDEX PAGE</h1>
    </div>

    <div data-role="content" class='example-wrapper' data-iscroll>
      <div>
        some content that will be scrolled.
      </div>
      <div> 
        Some more content that will be scrolled.
      </div>
    </div>

    <div data-role="footer" class="ui-bar" data-position="inline">
      <div data-role="navbar" class="ui-navbar">
        <ul class="ui-grid-b">
          <li class="ui-block-a"><a href="#home">home</a></li>
          <li class="ui-block-a"><a href="#timeline">timeline</a></li>
          <li class="ui-block-a"><a href="#message">message</a></li>
          <li class="ui-block-a"><a href="#bookmark">bookmark</a></li>
          <li class="ui-block-a"><a href="#config">config</a></li>
        </ul>
      </div>
    </div>

  </div>
```

---

Padding Issues
--------------
Previous versions of this widget had some issues involving the way jQuery Mobile standard CSS
applies padding and margin to content divs and listviews. The widget now handles this for you in
the most common use cases.

By default, the widget removes any padding from your wrapper. It then adds a `<div>` inside the
scroller, around your content (exclusive of any pull-down/pull-up block) and adds the padding
that was removed from the wrapper. This provides correct padding for both normal and inset
listviews.

The padding needs to be moved to *inside* the scroller (and to not include pull-down/pull-up)
so that you will not see padding around the scroller itself.

There are two options that allow you to override this default behavior: `removeWrapperPadding`
and `addScrollerPadding`. 

---

Pull-to-Refresh
---------------
This widget supports "pull-to-refresh" functionality. You can have a block of HTML that is 
positioned above the top or below the bottom of the scroller that the user can pull down or pull up.
These blocks can be revealed by scrolling, but the scroller will "snap back" after the user
stops scrolling to again hide the block. If the user pulls past this block by a certain amount,
(1/2 the height of the pull block) and then releases, some action that you specify will be 
performed. That action can be anything, but typically will be to perform some AJAX action to 
retrieve data from a server and refresh or add some content within the scroller.

In order to implement pull-to-refresh, you need to add a small amount of HTML markup to your page
and either supply a function as an option value or else (recommended) bind or delegate to
a jQuery event callback function. 

You also need to include the file `iscroll-pull-css` in your
<head>. Finally, `iscroll-pull.css` references an image file that contains an arrow icon and a
spinner icon. You can replace this with your own image file. If you rename or move this file, make
sure to edit `iscroll-pull.css`.

### Pull Block

To implement pull-up and/or pull-down, structure your HTML similar to the following:

```html
    <div data-role="content" data-iscroll>
      <div class="iscroll-pulldown">
        <span class="iscroll-pull-icon"></span>
        <span class="iscroll-pull-label"></span>
      </div> 
      <ul data-role="listview">
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <div class="iscroll-pullup">
        <span class="iscroll-pull-icon"></span>
         span class="iscroll-pull-label"></span>
      </div>
    </div>
```
    
This is all you have to do to implement the pull-up and/or pull-down UI.
The widget doesn't create the pull blocks for you, in order to provide you with the flexibility
to format them as you please. The pull blocks can contain other elements, and the spans for
the icon and/or label can be omitted.

All of the class names used for pull-down and pull-up are configurable in options. The example
above uses the default class names.

Note: in order for correct pull-up appearance (with the pull-up block hidden, even for short
content), make sure that the `expandScrollerToFillWrapper` option is set to `true` 
(the default value).

### Pull States

A pull block can be in one of three states:

* `Reset` This is the initial state of the pull block
* `Pulled` This is when the bock has been pulled, but not yet released
* `Loading` This is when the block has been released, and some action is being performed

If the user scrolls back (without lifing) while in the `Pulled` state, then the block
returns to the `Reset` state.

If the user pulls past the edge of the pull block (by 1/2 the height of the pull block), then
the block will enter the Loading state.

After the action has been performed, and the scroller is refreshed, then the block returns
to the `Reset` state.

### Pull Label Text

The widget has default text values that are inserted into the pull label element when the
block enters each state. Each of these text values is a configurable widget option. The
applicable options, and their default values are:

* pullDownResetText `"Pull down to refresh..."`
* pullDownPulledText `"Release to refresh..."`
* pullDownLoadingText `"Loading..."`
* pullUpResetText `"Pull up to refresh..."`
* pullUpPulledText `"Release to refresh..."`
* pullUpLoadingText `"Loading..."`

To change these options programatically, see the options documentation.

Alternately, you can change the default values in your HTML. When you change the defaults
in HTML, it changes the corresponding option value.

To change the `Reset` text, simply insert it in the pull block's label `<span>`. 

To change the `Pulled` text, use a `data-iscroll-pulled-text` attribute.

To change the `Loading` test, use a `data-iscroll-loading-text` attribute. 

Example:

```html
    <span data-iscroll-pulled-text="Now let er go, and we'll get some refresh action!"
          data-iscroll-loading-text="Ye-haw! Waiting for the data to come through the pipes!"
          class="iscroll-pull-label">Pull this here thing down to refresh!</span>
```

### Fancier Pull States

If you want to do something more elaborate when a pull block enters each state, you can either
provide a callback option or (recommended) bind or delegate to a jQuery event callback function. 
The associated events are:

* `iscroll_onpulldownreset`
* `iscroll_onpulldownpulled`
* `iscroll_onpulldownloading`
* `iscroll_onpullupreset`
* `iscroll_onpulluppulled`
* `iscroll_onpulluploading`   

#### Event and Callback Option Functions

In order to implement the pull-down and/or pull-up action, you need to supply a function. You
can either supply this function as an option value or (recommended) bind or delegate to
a jQuery event callback function.

The example code below is from the demo:

```javascript
    $(document).delegate("div.pull-demo-page", "pageinit", function(event) {
        $(".iscroll-wrapper", this).bind( { 
        "iscroll_onpulldown" : onPullDown,    
        "iscroll_onpullup"   : onPullUp
        });
      });
``` 
   
#### Callbacks

Your callback function receives two parameters:

##### e

This is the event object that originally gave rise to the callback. This is probably not very
useful to you.

##### d

This is map containing one member, `iscrollview`. This is a reference to the iscrollview object
that made the callback.

Your callback should take whatever action you want when the user activates the pull-up/pull-down.
This might typically involve retrieving some data from a server and inserting it into the scroller
content. See the demo for an example. 

---

Calling methods
---------------
The standard way of calling widget methods is by passing a sub-method name
as a string parameter to the widget function. Any parameters to the method
should follow.

For example, to call the `refresh` method:

```javascript
    $(".example-wrapper").iscrollview("refresh");
```

The widget factory allows you to access widget methods directly, by
accessing a data variable stored in the widget's element:

```javascript
    $(".example-wrapper").jqmData('iscrollview').refresh();
```

While this is a bit awkward, it is also more conventional. It is
handy in case you need to make a series of calls to different widget
methods. You can first get the instance into a variable:

```javascript
    var myView = $(".example-wrapper").jqmData("iscrollview");
    myView.refresh();
```

This means, as well, you can easily call any underlying iScroll method
through the exposed `iscroll` member variable. For example,

```javascript
    $(".example-wrapper").jqmData('iscrollview').iscroll.scrollTo(0,10,200,true);
```

So, if you replace iscroll.js with a newer version that has new methods,
or if you need to call iScroll private methods,  or access iScroll
member variables, you can call them without any need to modify this widget.

This widget wraps all current iScroll public methods,
so the above example can also be called like this:

```javascript
    $(".example-wrapper").iscrollview("scrollTo", 0, 10, 200, true);
```

The exceptions are the `destroy`, `refresh`, `enable`, and `disable` methods.

`destroy` is a standard widget factory method. In this widget, it
calls the iScroll `destroy` method and then calls the base widget
destroy. If you need direct access to iScroll's `destroy` method,
you can access it directly using the `iscroll` member variable.

The widget's `refresh` method insures that the underlying iScroll
refresh method is called with the proper timing. If you need to call
the iScroll refresh method directly, do so using the `iscroll` member
variable.

`enable` and `disable` are standard widget methods. Each of these calls
iScroll's corresponding method and then calls the underlying widget
method.

---

Methods
-------
###Standard Widget Methods

These are methods that are typically implemented for ALL widgets:

####option(key, [value_or_object])

See "Options", below.

####destroy()

Destroys the iScroll instance and removes page modifications. Also calls the
underlying widget `destroy()` code.

###Custom Widget Methods

These are additional methods implemented in this widget which do
not have corresponding iScroll methods.

####resizeWrapper()

This will resize the wrapper to use all available viewport space
after accounting for headers, footers, and other fixed-height elements
outside of the wrapper. This is normally done for you automatically,
but the automatic resize can be overriden with an option. Call this
if you have change the page structure and so need to resize the wrapper.
This is also normally called for you when page orientation or page
size changes.

####calculateBarsHeight()

This will re-calculate the height of header/footer etc. bars on the
page. Call this prior to calling `resizeWrapper()`, if you change the
height of header/footer etc. after the widget has been created.


####expandScrollerToFillWrapper()

This will expand the size of the scroller to fill the wrapper. Call this after calling
`resizeWrapper()`, or if you manually resize the wrapper after instantiation.

### iScroll Methods

These are methods that exist in iScroll. They are available on
the widget as a convenience. See "calling methods" for information
on how to access any iScroll methods that are not implemented in
the widget. (For example, because you have updated iScroll to
a newer version, and this widget has not been updated yet.)

Please see the iScroll documentation for details on using these
methods.

####refresh(timeout, beforeCallback, afterCallback, context, noDefer)

Note that this performs the proper timing for the iScroll `refresh()`
function using `setTimeout`. If you want to call the iScroll `refresh()`
method directly, please see "calling methods" above.

If the timeout value is present, then the internal call of iScroll `refresh()` will be delayed
by this value. If the value is `null` or `undefined`, then the value of the `refreshDelay`
option will be used.

If present, the optional `beforeCallback` function will be called (with the supplied optional context
parameter) just prior to refreshing iScroll. This is useful if you have updated content inside the 
scroller, and need to refresh widgets inside the scroller (such as a listview) prior to iScroll 
refresh. While this is similar to the `iscroll_onbeforerefresh`, the callback is specific to 
a particular call to `refresh()`.

If present, the  optional `afterCallback` function will be called (with the supplied optional context
parameter) just after refreshing iScroll. This is useful if you want to perform some action on
the scroller after updating content. For example, this might be used to scroll to a particular
position or element within the scroller after updating content. This is particularly useful
when adding content to the *end* of the scroller, when you might like to scroll the new content
into view.

Calls made to `refresh()` for an iscrollview which is on a cached page that is not the active page 
are normally (depending on the value of the `deferNonActiveRefresh` option) deferred until the 
next `iscroll_onbeforepagerefresh` event for the page. This avoids unnecessary refreshes. Note 
that if the `refreshOnPageBeforeChange` option is true, then the scroller will *always* be 
refreshed on `iscroll_pagebeforefresh()`.

The `context` parameter is passed to any callbacks that you provide. You might pass a reference
to some object of yours, or you might pass a convenient reference to the iscrollview, so that
the callback doesn't have to fish it out of the DOM with a selector and `jqmData()`.

Each deferred call to `refresh()` overwrites the callback and context values from any previous
deferred `refresh()` call for the same iscrollview. This means that you should not use refresh
callbacks to modify content, because there is no guarantee that any particular callback will
be called - only that the callbacks for the *last* deferred `refresh()` will be called.

Deferred calls only occur when the scroller being refreshed is *not* the active page. You
might do this if you are caching pages, and some data arrives that you want to update on
a page that is not currently the active page. 

This is particularly useful in environments such
as PhoneGap, Titanium, or Rhodes, where a controller is able to update pages asynchronously.

Deferring `refresh()` calls avoids a cascade of unnecessary refreshes when the document is
resized in a desktop environment, or when a mobile device's orientation is changed. The refreshes
for those pages that are cached in the DOM but not the active page are deferred until the next time
they become the active page, and then only a single refresh will be performed.

As well, if content is updated while a page is not the active page, then deferring `refresh()`
avoids unnecessary duplicate refreshes. If content were to be updated several times while the
page is not active, only a single refresh will be performed.

If you want to force a refresh to a scroller on a non-active page to be performed immediately,
you can set the `noDefer` parameter to `true`.

You can disable deferred refreshes completely by setting the `deferNonActiveRefresh` widget
option to `false`.

####scrollTo(x, y, time, relative)

Scroll to a particular `x`, `y` pixel position within the scroller.

The `time` parameter is the time in milliseconds over which to perform a smooth scroll. If omitted,
the scroll is immediate.

The `relative` parameter is `true`, then the `x`, `y` position is relative to the current scroll
position. 

####scrollToElement(el, time)

Scroll to a particular element within the scroller. The `el` parameter can be either a reference
to a DOM node object (*not* a jQuery object) or a CSS3 selector. jQuery selector extensions
cannot be used here.

The `time` parameter is the time in milliseconds over which to perform a smooth scroll. If omitted,
the scroll is immediate.

####scrollToPage(pageX, pageY, time)

####disable()

Note that this method also calls the default widget `disable()` method.
If you want to call the iScroll `disable()`
method directly, please see "calling methods" above.

####enable()

Note that this method also calls the default widget `enable()` method.
If you want to call the iScroll `enable()`
method directly, please see "calling methods" above.

####stop()

####zoom(x, y, scale, time)

### iScroll Getters

This widget provides getters for some iScroll internal variables that might be useful
to an application. These are all read-only.

For example, let's say you are adding elements to the end of a scrolled list.
You'd like to scroll up (using scrollToElement) if the new element would be
below the visible area. But if the list is intially empty, you'd want to avoid
this until the scrolling area is initially full. So you need to compare the
scroller height (scrollerH) to the wrapper height (wrapperH).

While wrapper and scroller height can be easily obtained using JQuery functions,
these functions can still be useful because they reflect the precise internal
state of  the scroller.

#### x()

Current x origin (top) of the scroller.

#### y()

Current y origin (left) of the scroller.

#### wrapperW()

The width, in pixels, of the wrapper. This is the visible width of the scrolling area.

#### wrapperH()

The height, in pixels, of the wrapper. This is the visible height of the scrolling area.

#### scrollerW()

The width, in pixels, of the scroller. This is the total width of the scroller, including
visible and non-visible portions.

#### scrollerH()

The height, in pixels, of the scroller. This is the total height of the scroller, including
visible and non-visible portions.

### iScroll Getters/Setters

This widget provides getters with options setter functionality for some iScroll internal
variables that might be useful to an application. If a value is provided, then the
functions act as setters. In any case, they return the value of the associated internal
variable.

#### minScrollX(val)

The minimum X scroll position. This defines the left-most position of scroll. The user
can scroll past the minimum X, but then the scroller will snap-back to the mimimum X
position.

#### minScrollY(val)

The minimum Y scroll position. This defines the top-most position of the scroll. The
user can scroll past the minimum Y, but then the scroller will snap-back to the minimum
Y position.

#### maxScrollX(val)

The maximum X scroll position. This defines the right-most position of scroll. The user
can scroll past the maximum X, but then the scroller will snap-back to the maximum X
position.

#### maxScrollY(val)

The maximum Y scroll position. This defines the bottom-most position of the scroll. The
user can drag past the maximum Y, but then the scroller will snap-back to the maximum
Y position.

---

Options
-------

### Overriding Option Defaults

You can override the default options for new instances of this widget by setting the 
prototype options in `$.mobile.iscrollview.prototype.options`.

Any options that you set programatically or using `data-` attributes will override the defaults.

Example: for all new instances of `$.mobile.iscrollview`, set the `refreshDelay` option to the
value `100`.

    $.mobile.iscrollview.prototype.options.refreshDelay = 100;
    
If you want to override options for all instances of the widget, a good place to do that is
at the same time that you override any jQuery Mobile default options.

```html
    <script>
      $(document).bind("mobileinit", function(){
        $.mobile.defaultPageTransition = "slide";
        $.mobile.iscrollview.prototype.options.refreshDelay = 100;
      });
    </script>  
```  

### Programatic access

This widget supports programmatic access to options using standard widget factory
syntax:

    .iscrollview("option");                   Returns an object with all options
    .iscrollview("option", "hScroll");        Returns value of option
    .iscrollview("option", "hScroll", true);  Sets option
    .iscrollview("option", {hScroll: true});  Sets option, alternative syntax
    .iscrollview("option", {hScroll: true, vScroll:true}; Set multiple options

The widget handles copying widget options to the iScroll object options and
vice-versa.

### Setting options in the data-iscroll attribute

This widget also supports setting options directly in the `data-iscroll`
attribute. The options need to be in **strict** JSON format. This means that keys
and string values need to be enclosed in **double** quotes **only**. Numeric and
boolean values should **not** be enclosed in quotation marks.

#### Example:

```html
    <div data-role="content" data-iscroll='{"hScroll":true,"vScroll":false,"resizeEvents":"orientationchange"}' data-theme="c">
```

### Modifying options after instantiation

If you modify an option after a scroller has been instantiated, the underlying
iScroll object will be destroyed and re-created. This is because iScroll does
not currently support modifying options after the object has been created.

However, unofficially, some options can be changed without destroying and
re-creating the object. It is unclear exactly which options these are, and
so this widget does not attempt it. There is skeletal code in the source
that is commented-out to do this if you wish to experiment.

###Emulated Options

The following option is emulated by the widget:

####bottomOffset

Offset at the bottom of the scroller. Complementary to the iScroll `topOffset` option. The number
of pixels specified by `bottomOffset` will apper below the bottom of the scroll range. You can
scroll into this area, but then the scroller will snap back. (This is needed to support the
pull-up funcitonality.)

Also, see the `emulateBottomOffset` option.

Default: `0`

###Widget Options

The following options are available which affect the widget itself. These are
not iScroll options.

####debug

Enables performance logging. Please see the documentation section on performance logging. There
are a number of additional options which allow you to control what is logged. These are documented
in the section on performance logging.

Default: `false`

####pageClass
A CSS class, or a space-separated list of classes, which will be added to the page
containing the wrapper.

Default: `"iscroll-page"`

####wrapperClass

A CSS class, or a space-separated list of classes, which will be added to the wrapper.

Default: `"iscroll-wrapper"`

####scrollerClass

A CSS class, or a space-separated list of classes, which will be added to the scroller.
(The scroller is the first child of the wrapper, and is the element that will
be scrolled.)

Default: `"iscroll-scroller"`

####pullDownClass

If this class is found within the scroller, and the `topOffset` option value is not set or is zero, 
then the `topOffset` will be set to the height of the pull-down element. As well, the widget makes
modifications to the pulldown element's CSS.

Default: `"iscroll-pulldown"`

####pullUpClass

If this class is found within the scroller, and the `bottomOffset` option value is not set or is 
zero, then the `bottomOffset` will be set to the height of the pull-up element. As well, the widget 
makes modifications to the pullup element's CSS.

Default: `"iscroll-pullup"`

####pullUpSpacerClass

If you use a pull-up block, then the widget will create a special pull-up spacer, to insure
that the pull-up appears hidden below the bottom of the scroller window until manually scrolled,
even if the content is shorter than the height of the wrapper.

In case you need to apply some CSS to this spacer, it's assigned a class.

Default: `"iscroll-pullup-spacer`"

####scrollerContentClass

Normally (unless override with `createScroller="false"`) the widget creates a protective `<div>`
around your scroller content. It also wraps the pull-down and/or pull-up blocks, if present.
This is so that you don't have to create this `<div>` in your HTML
if you are scrolling multiple elements. The widget adds a class to this `<div>`.

Default: `"iscroll-content"`

####adaptPage

If true, necessary adaptations will be made to the page to accommodate iScroll. If false,
the adaptations will not be made. If multiple scrollers are used on the same page, only
one of them should have `adaptPage` set to true. You can also set this false if you
want to make the adaptations yourself.

Default: `true`

####fixedHeightSelector

A JQuery selector which selects the fixed-height elements on the page which are outside
of the scrolling area. The heights of these elements will be added-up, and subtracted
from the total viewport height to arrive at the wrapper height.

Default: `":jqmData(role='header'), :jqmData(role='footer'), .iscroll-foreground"`

####resizeWrapper

If true, the wrapper will be resized to the height remaining after accounting for
fixed-height elements.

Default: `true`

####resizeEvents

A space-separated list of events which will cause a resize of the wrapper.

Note: This defaults to `"orientationchange"` for iDevices. If you have the `Safari/Advanced/Debug
Console` system Settings option set, you may wish to change this to `"resize orientationchange"`.

Default: `"orientationchange"` for iDevices, `resize` for others

####refreshOnPageBeforeShow

If true, the scroller will be refreshed on every JQuery Mobile `pagebeforeshow` event.
This should be set to true if scroller content might have changed asynchronously while
the page was loaded into the DOM but not shown, as might happen in some native
application environment. *This usage is obsoleted by the widget's deferred `refresh()` feature.*

Default: `false`

####fixInput

If true, applies a fix to allow input elements to work within a scroller. This is optional
because there is an alternative fix that patches iScroll itself. You should disable this
option if you are using a patched verison of iScroll that has a input-element fix incorporated, 
or in case it causes some sort of trouble.

Default: `false`

####wrapperAdd

Number of additional pixels to add to the wrapper height. This can be a positive or
negative value. This is an "escape hatch" in case the calculation of wrapper height
is not correct for some particular scenario.

Default: 0

####refreshDelay

Number of mSec to permit browser to render before performing `refresh()`.

When you call `refresh()`, the call to iScroll's internal `refresh()` is delayed by this amount,
to allow the browser to complete any rendering, prior to refreshing the scroller. If this value
is 0, then a `setTimeout()` call is still used. This causes the script to relinquish control
to the renderer, and may be sufficient for many browsers.

This value may need to be experimentally determined.

Alternately, you can specify a timeout value when calling `refresh()`. This is useful in case you
have done some update which you know will require a lengthy render.

Default: `200` for Android, otherwise `0`

####expandScrollerToFillWrapper

If true, the widget will set the minimum height of the scroller so that it fills the wrapper
(exclusive of any pull-down/pull-up elements). This is necessary in order to be able to drag
the scroller up/down to activate pull-down/pull-up in case the scroller content is either empty
or shorter than the wrapper. 

Default: `true`

####emulateBottomOffset

If true, the widget will emulate a `bottomOffset` iScroll option. This option is present in
the Watusiware iScroll4 fork (`watusi` branch). This needs to be set `true` if using an 
unmodified iScroll4 that doesn't have this option.

There's really no need to disable this option.

Default: `true`

####removeWrapperPadding

If true, the widget will remove any padding from the wrapper. Normally, there should be no
padding on the wrapper element. If there is padding, then it isn't possible to drag within the
padding, and pull-down/pull-up elements will not be 100% width.
`
Default `true'

####addScrollerPadding

If true, the widget will add any padding removed from the wrapper to the protective `<div>` it
places around your scrolled content.

Default: `true`

####createScroller

iScroll scrolls only the first child of the wrapper. So that you don't have to wrap multiple
content elements with a `<div>` the widget does this for you. This `<div>` is always needed if you
have a pull-up or pull-down block. 

Default: `true`

####scrollTopOnResize

On some platforms (for example, iOS) when orientation is changed, the address bar pushes the
page down. jQuery Mobile scroll the pgae back up on hash changes, but doesn't do so for 
orientation changes. So, the page is left scrolled-down.

Since `orientationchange` seems unreliable on iOS, we actually do this on resize. (Though
you can change the event(s) on which the widget resizes...)

This will only be done if you also have `resizeWrapper` set to `true`.

Default: `true`

####deferNonActiveRefresh

If this options is set to `true`, then calls to `refresh()` for pages that are not the
active page will be deferred to the next `pagebeforeshow` event for the page. This avoids
unnecessary refreshes when the browser window is resized or device orientation is changed.
As well, it avoids unnecessary refreshes when multiple updates are made to content in a scroller
on a non-active page.

Please see the discussion in the documentation on the `refresh()` function for further details.

Default: `true`

####deferNonActiveResize

If this option is set to `true`, then calls to `resizeWrapper()` for pages that are not the
active page will be deferred to the next `pagebeforeshow` event for the page. This avoids
unnecessary resizing when the browser window is resized or device orientation is changed.

Default: `true`
   
####preventTouchHover

If `true`, prevent hover in scroller on touch devices.  

If this is `false`, you will get "piano keyboard" effect if using jQuery Mobile 1.0 or 1.0.1 
when scrolling due to mouseover events, which is both time-consuming and distracting. If this
is `true`, the widget will prevent the piano-keyboard effect.

This really is a jQuery Mobile problem with listviews, and is solved in jQuery Mobile 1.1.

One negative is that with the current implementation, you will never get a "hover" visual 
effect within a scroller on touch devices, even when not scrolling. But you still will on desktop 
browser with mouse, and you will still get "down" effect when a link is selected. However, it
probably isn't desirable to get hover in a listview, because it is distracting.

Default: `true` for touch devices if jQuery Mobile < 1.1, `false` for jQuery Mobile >= 1.1

####bindIscrollUsingJqueryEvents

If `true`, iScroll will be bound using jQuery event binding, rather than using `addEventListener()`. 
As well, iScroll will use jQuery `mouseleave` event instead of `mouseout`.

This is an experimental feature, and is not yet completely functional. The code is present to
permit further experimentation.

Default: `false`

###fastDestroy

If `true`, an assumption is made that you will not call the widget's `destroy()` method to
un-enhance the widget while retaining the page. The assumption is that `destroy()` will only 
be called internally by the page plugin when the page is removed from the DOM. This saves
the overhead of un-enhancing the page.

Default: `true`

#### pullDownResetText

Default: `"Pull down to refresh..."`

#### pullDownPulledText

Default: `"Release to refresh..."`

#### pullDownLoadingText

Default: `"Loading..."`

#### pullUpResetText

Default: `"Pull up to refresh..."`

#### pullUpPulledText

Default: `"Release to refresh..."`

#### pullUpLoadingText

default: `"Loading..."`
     
#### pullPulledClass

Default: `"iscroll-pull-pulled"`

#### pullLoadingClass

Default: `"iscroll-pull-loading"`

---

Events
------
There are two ways to be notified when some event occurs in the widget: by binding/delegating
jQuery events, or by specifying a callback in the widget's `options` object.

When an event is triggered it will call the callback if defined in options, and, as well, trigger 
any bound events.

### jQuery Event Callbacks

The widget exposes jQuery events that can be bound like any other event.
The names are prepended with the string `iscroll_`. So, the `onrefresh`
event for this widget is actually `iscroll_onrefresh`. (Note also that widget event names
are different than iScroll event names. iScroll event names are in mixed case. Widget event
names are in all lower case - this is a limitation of jQuery widgets.)


### Option Callbacks

Alternately, you can add callback functions to the widget's `options` object. The key
of the option corresponds to the event name **without** the widget name
prefix. So, you can add a callback function for the refresh event
with the key `onrefresh`.


### Bound Callback parameters

Bound event callbacks receive two parameters:

* event - The underlying DOM event (if any) associated with this event
* data -  A map containing data passed to the event by this widget
 * :iscrollview reference to the iscrollview object associated with this event

As well, when a bound event callback is called, `this` will be the DOM
object that triggered the event. (e.g. the wrapper).

###Example event delegation:

```javascript
    $(document).delegate("div.my-content", "iscroll_onrefresh", function(event, data) {
        var v = data.iscrollview;  // In case we need to reference the iscrollview
        console.write("iscroll_onrefresh occured");
        }
```

###Supported Events

####iscroll_onrefresh

This event is triggered when iScroll's internal `refresh()` function is called. It is
called after iScroll has calculated the scroll range, but before it has updated the scroll
bar. 

*This event is of dubious value to applications. The widget uses this internally to 
support pull-down/pull-up. (It seems it was put just where it is just for that purpose -
to support pull-up/pull-down.)*

If you want to do some refresh of jQuery Mobile structures (such as listview) contained within
the scroller prior to scroller refresh, see the `iscroll_onbeforerefresh` event and the optional
`callbackBefore` parameter to the `refresh()` function.

####iscroll_onbeforerefresh

This event is triggered before the widget calls iScroll's `refresh()` function. It is useful
if you need to do some refresh of jQuery Mobile widgets (such as `listview`) contained within
the scroller. It is important to do this *before* iScroll's `refresh()` has been called. Do
not use `iscroll_onrefresh()` for this.

You can also use the optional `callbackBefore` callback parameter to the widget's `refresh()` 
function for this.

####iscroll_onafterrefresh

This event is triggered after the widget calls iScroll's `refresh()` function. It is useful
if you want to perform some action, such as scrolling, after changing content in the scroller.
This has to be done *after* the scroller is refreshed.

You can also use the optional `callbackAfter` callback parameter to the widget's `refresh()` 
function for this.

####iscroll_onbeforescrollstart

Triggered by iScroll's `onBeforeScrollStart` event.

####iscroll_onscrollstart

Triggered by iScroll's `onScrollStart` event.

####iscroll_onbeforescrollmove

Triggered by iScroll's `onBeforeScrollMove` event.

####iscroll_onscrollmove

Triggered by iScroll's `onScrollMove` event.

####iscroll_onbeforescrollend

Triggered by iScroll's onBeforeScrollEnd event.

####iscroll_ontouchend

Triggered by iScroll's `onTouchEnd` event.

####iscroll_ondestroy

Triggered by iScroll's `onDestroy` event.

####iscroll_onzoomstart

Triggered by iScroll's `onZoomStart` event.

####iscroll_onzoom

Triggered by iScroll's `onZoom` event.

####iscroll_onzoomend

Triggered by iScroll's `onZoomEnd` event.

####iscroll_onpulldown

This event is triggered when the user has completed a pull-down sequence. Your event callback
should perform the pull-down action. (For example, getting data from a server in order to refresh
text shown within the scroller.)

You can also use this event for complex customization of pull-down feedback to the user. The
UI should indicate that the pull-down action is being performed.

####iscroll_onpulldownreset

This event is triggered when the user has aborted a pull-down sequence by scrolling back up, or
after completion of the pull-down action and `refresh()`. You can use this event for complex
customization of pull-down feedback to the user. The UI should indicate that the user may
initiate a pull-down sequence.

####iscroll_onpulldownpulled

This event is triggered when the user has completed the first half of a pull-down sequence.
i.e. they have pulled-down, but not yet released. You can use this event for complex 
customization of pull-down feedback to the user. The UI should indicate that the user may
complete a pull-down sequence by releasing.

####iscroll_onpullup

This event is triggered when the user has completed a pull-up sequence. Your event callback
should perform the pull-up action. (For example, getting data from a server in order to refresh
text shown within the scroller.)

You can also use this event for complex customization of pull-up feedback to the user. The
UI should indicate that the pull-up action is being performed.

####iscroll_onpullupreset

This event is triggered when the user has aborted a pull-up sequence by scrolling back down, or
after completion of the pull-up action and `refresh()`. You can use this event for complex
customization of pull-up feedback to the user. The UI should indicate that the user may
initiate a pull-up sequence.

####iscroll_onpulluppulled

This event is triggered when the user has completed the first half of a pull-up sequence.
i.e. they have pulled-up, but not yet released. You can use this event for complex 
customization of pull-up feedback to the user. The UI should indicate that the user may
complete a pull-up sequence by releasing.


---

Scroll Bars
-----------

### Wrapper Positioning Requirement

iScroll requires that the wrapper be CSS-positioned either `absolute` or `relative`. If the
wrapper is positioned `static` (the default, if positioning is not specified), then the 
scroll bars will incorrectly be created relative to the page, rather than the wrapper. The
symptom is that the scroll bar will be the full height of the window. (Though the widget
will hide the scrollbar under any header/footer.)

This widget will correct static positioning for you. If your wrapper is positioned either
`absolute` or `relative` it will be unchanged. If it is positioned `static`, the widget
will change the positioning to `relative`. This will have no effect on the wrapper position,
assuming no position coordinates were given. (Which wouldn't make sense for static positioned
content.) 

Either `absolute` or `relative` positioning of the wrapper will cause elements inside the
wrapper which themselves have `absolute` positioning to be positioned relative to the wrapper.
iScroll depends on this behaviour for positioning of the scrollbar.

### Customization of Position

iScroll gives you the ability to customize scroll bars. See the iScroll4 documentation
for full details. You can customize the height, width, position, color, etc. etc. of
the scrollbar. To do so, you need to set the `scrollbarClass` option and then provide
CSS to customize the scrollbar.

However, in many cases, all that is really desired is to set the position
of the scrollbar. In this case, you can add some very minimal CSS.

In this case, do NOT set the `scrollbarClass` option. Setting this option causes
iScroll to omit quite a bit of it's initialization of the scrollbar, and then you
are required to supply a considerable amount of CSS.

Instead, you can usually use a CSS rule similar to this:

```css
    div.my-iscroll-wrapper > div:last-child {
      top: 46px !important;
      bottom: 22px !important;
    }
```

iScroll appends the scrollbar to the end of your wrapper. Unless you have appended something
else yourself, you can target the last child of the wrapper, and so you don't need the
`scrollbarClass` to identify the scrollbar. So, iScroll will still do all of it's usual
initialization. By using the `!important` modifier, your CSS will override the top and
bottom locations that iScroll itself sets.

---

Multiple Scrolling Areas
------------------------
If you wish to have multiple scrolling areas, please note the following:

- The `adaptPage` option should be set to `true` for no more than one of
your scrollers. Since it defaults to `true`, you will need to set it to
false for all but (a maximum of) one of your scrollers.

- The `resizeWrapper` option should be set to `true` for no more than one
of your scrollers. If you have multiple scrollers one above the other,
then at most one of them can be auto-sized. If you have multiple scrollers
side-by-side, then you will probably have to size all them yourself.
Since `resizeWrapper` is `true` by default, you will need to set the option
to `false` for all but (a maximum) of one of your scrollers.

- You should set the `resizeEvents` option to an empty string for those
scrollers for which you have set `resizeWrapper` to `false`.

- iScroll will not work correctly if scrollbars from multiple scrollers
overlap. It will fail to scroll in all but one of the scrollers that
have overlapping scrollbars. Please see the documentation on scrollbar
customization, above.

---

Listviews With List Items That Are Buttons
------------------------------------------
Listviews that have list items that are buttons (i.e. the items are clickable,
because they are wrapped in an `<a>` tag)
can be very slow on touchscreen devices. This is not an iScroll or
jquery.mobile.iscrollview problem per-se - it is inherent to JQuery Mobile.

There is a discussion of this issue here:

  http://forum.jquery.com/topic/why-jqm-touchscreen-list-scrolling-performance-stinks-and-what-to-do-about-it

The gist of it is that as you scroll a list, your finger slips from one list
item to the next, causing a "piano key" visual effect. The effect is both
distracting to the user and slow.

A work-around is to insure that up/down/hover states for your scrollable
listviews are identical, so that there is no *hover* effect and no *selected*
effect. If you're developing exclusively for a touch-screen mobile device,
there's little to no need for these effects. Users don't expect them: they
expect something to happen when they tap, but not a useless effect.

This is an *example* of CSS overrides that will remove the hover and selected effects.
You will need to modify this CSS to match your theme. The important thing is that
the up, down, and hover states must have identical CSS, so that there is no transition
between states.

```css
    /*
      Sane overrides for buttons in lists

      JQM default styling has up/down/hover/select styles for buttons. This is nice for real
      buttons, but slows list scrolling to a crawl. This can be avoided by styling the
      up/down/hover states identically.
    */

    ul.ui-listview *.ui-btn-up-c,
    ul.ui-listview *.ui-btn-down-c,
    ul.ui-listview *.ui-btn-hover-c
       {
       border-color: #ccc;
       background: #eee;
       font-weight: bold;
       color: #444;
       text-shadow: 0 1px 1px #f6f6f6;
       background-image: -webkit-gradient(linear, left top, left bottom, from( #fdfdfd), to( #eee));
       }

    ul.ui-listview *.ui-btn-up-c a.ui-link-inherit,
    ul.ui-listview *.ui-btn-down-c a.ui-link-inherit,
    ul.ui-listview *.ui-btn-hover-c a.ui-link-inherit
      { color: #444; }
```
      
---

Caching List Items
------------------
Webkit-based browsers can exhibit a "flicker" effect wwhen scrolling
toward the bottom of the list, as well as exhibit slow and jerky movement until the first
time the user has reached the bottom of the list.. Once you have scrolled down to the bottom of 
the list, the flicker will typically stop. This does not seem to be an issue with non-Webkit
browsers.

This issue is discussed here: http://cubiq.org/you-shall-not-flicker

A work-around for this issue to to force list items to be pre-cached. See
the above link for a discussion of why this works. Basically, the flicker occurs
when each element is first encountered and hardware acceleration is enabled for
the element. By pre-setting a null 3D transform (which triggers hardware accelation on WebKit
browsers) on each element, the flicker is avoided, and the content is added to the hardware cache.

This has been reported to cause bluring of text during transform on Android platforms. You will
need to decide which of two evils you want to live with.
   
If this IS used, then the browser may be forced to cache the content in advance, resulting
in smoother scrolling, but with the side-effect of increasing initial rendering time.
   
This can more than DOUBLE initial rendering time if you are not careful with the selector. The
ecommended CSS at the above link is NOT optimal.
      
You need to apply this judiciously. For example, if you know your scroller content consists
of list items, use "li" not "*' to select. * as the right-most component of a select is
horribly expensive. A small additional performance gain can be made by selecting 
iscroll-content instead of iscroll-scroller. You might get a 
glitch on a pull-up if you have one, but it's a small price to pay for doubling speed.
   
It is important NOT to apply this to .iscroll-scroller itself. This will result in a huge
performance loss. The second rule below gives performance on iOS devices very close to not 
using this at all.
   
The demo uses this CSS:

```css
   .iscroll-content li  {
     -webkit-transform: translateZ(0);
   }
```       
---

Mobile Safari Address Bar
-------------------------
The Mobile Safari address bar is a 60px area at the top of the browser. The address bar is fixed
on iPad, but on iPhone and iPad, it can be made to scroll off-screen by scrolling content.
jQuery Mobile normally does this, but the address bar is always present at the time that a page
loads. jQuery Mobile then scrolls in order to push the address bar back up.

It doesn't appear possible to consistently detect the real window height, though it is possible
to consistently detect the window height assuming that the address bar is present. So, this
widget adds 60px to page height in this situation. This addition is not applied for iPad, nor for 
iPhone/iPod if running a native app in a  UIWebView, or when running in "full screen" mode 
(web page saved to home screen).

If you are testing using desktop Safari's `Develop` `User Agent` option, please note that this
adaptation will fail. It depends on specific behaviour of the real Mobile Safari browser. If
you want to use desktop Safari to test pages designed to run on iPhone, either use the standard
Safari User Agent, or else use a custom User Agent. From the iPhone user agent setting, remove
the string "Safari". This will fool the widget into thinking you are running in "full screen"
mode, without the disappearing address bar.


---

Demo
----
The demo directory contains a simple example with 5 pages. You can switch between
the pages using the tabbar at the bottom. The three tabs demonstrate scrolling a listview,
an inset listview, a listview with pull-down and pull-up blocks, a listview with a short
list and pull-down/pull-up blocks, and a form. 

To demo, simply open the `index.html` file in your browser. Note that the page transitions will 
not work with some browsers when loading from a local file - for those browsers, you will have 
to load the demo from a server. (It does work with local files for Safari and Firefox.)

### Special Demo Borders

The demo has headers and footer styled with a 1px red border at top and bottom. This facilitates
a quick visual indication of correct sizing of the page. You should not see any white
space above the header or below the footer. (Note that Retina devices will show a 2px border,
rather than 1px.) Use your OS's accessibility features to magnify and inspect. On mobile
devices, there is usually a way to capture the screen contents to an image file that you can
later examine. (iPhone: Home+On/Off)

The iScroll wrapper is styled with a 1px green border at top and bottom. You should see no gap
or different color between the top of the wrapper and the bottom of the header, or between
the bottom of the wrapper and the top of the footer.

### Demo Content

As a convenience, the demo directory is self-contained (except for the widget, `iscroll-pull-js`
and pull icon files, which are expected to be found in the parent directory), and contains the
following additional components:

* jQuery 1.6.4
* jQuery 1.7.1
* JQuery Mobile 1.0.1
* jQuery Mobile 1.1.0, patched for listview link bug (very long delay when clicking on list items
in unpatched version - due for fix in 1.1.1).
$ iscroll4, master commit a8b8720296 6/4/2012


Please obtain these components independently for your projects, so that
you can be sure of what version you are getting, and avail yourself
of any updates/improvements.

---

Performance Logging
-------------------
This widget can log events and performance data to the Javascript console when the `debug` option 
is set to `true`. A number of additional options control what is logged. Setting `debug` false will 
disable all logging.

These log entries are useful both to monitor performance and to understand the sequence of events
that occur as the widget is used.

There is a log entry at the start and end of each traced function, event, or callback. Each
entry shows the time, file name, function, event, or callback name, and (at end) elapsed mSec that
the operation took. 

For some functions, a second set of elapsed mSec and start time are logged (in parenthesis).
This is for functions that were queued using a SetTimeout or that were initially triggered by
some event. So, you can see how long the function took to run, as well as the elapsed time from when 
the function was queued.

The `debug` option must be `true` in order for any of the trace options to be enabled.

Performance logging can generate a large amount of data. You can use trace options to narrow
the logging to items of interest.

### traceCreateDestroy

If `true`, creation and destruction of the widget is traced.

### traceRefresh

If this option option is `true`, calls to the widget's `refresh()` function are traced.

In the case of `refresh()` there is an initial log entry when the `refresh()` is queued, which 
will also indicate the timeout value that was used. A second, separate, log entry shows the elapsed
time that `refresh()` ran as well as elapsed time from when it was queued. The time value shown
lets you match-up the first and second entries. This will help you evaluate the impact of
browser rendering time. (A 0mSec timeout will first allow all rendering to complete.)

If a refresh is occuring on an `iscroll_onpagebeforerefresh` event because a page is "dirty"
the log entry will indicate "(dirty)". "Dirty" pages are pages that have had `refresh()` called
while they were not the active page. Normally (depending on the `DeferNonActiveRefresh` option)
such pages have their `refresh()` deferred until the page is about to be shown.

### traceResizeWrapper

If this option is `true`, calls to the widget's `resizeWrapper()` function
are traced.

### traceIscrollEvents

If this option is `true`, events handled by iScroll are traced.

### tracedIscrollEvents

This is a list of iScroll events to trace. If the list is empty, all iScroll events will be
traced. List items are strings, example: `touchstart`.

### traceWidgetEvents

If this option is `true` events handled by the widget (not by iScroll) are traced.

### tracedWidgetEvents

This is a list of widget events to trace. If the list is empty, all widget events will be
traced. List items are strings. Events that iScroll itself handles are *not* traced when this
option is `true`.

### traceIscrollCallbacks

If this option is `true`, callbacks issued by iScroll are traced.

### tracedIscrollCallbacks

This is a list of iScroll callbacks to trace. If the list is empty, all iScroll callbacks will
be traced. List items are strings. Example: `onRefresh`.

### traceWidgetCallbacks

If this option is `true`, callbacks issed by the widget are traced. This does not include
callbacks issued by iScroll itself (which application code may also bind to.)

### tracedWidgetCallbacks

This is a list of widget callbacks to trace. If the list is empty, all widget callbacks will
be traced. List items are strings. Do not include the `iscroll_` prefix. Example: `onpulldown`.







---

Testing
-------
This widget has only undergone ad-hoc testing, primarily with the components
included in the demo directory. Contribution of a test suite would be most
welcome. :)

Most testing has been done using JQuery 1.6.4/JQuery Mobile 1.0.1. Some
rudimentary testing has been done using JQuery 1.7.1/JQuery Mobile 1.1.0,
with no obvious problems noted.

---

Variable names
--------------
The source code code follows the following conventions:

* Upper-case first letter: constant
* $ first letter: variable contains a JQuery object
* (underscore) first letter: Private method

---

Bugs and Enhancements
---------------------
Please submit bug and enhancement requests via [jquery.mobile.iscrollview gitHub Issues](https://github.com/watusi/jquery-mobile-iscrollview/issues)
If you have developed code that you would like to have incorporated in a future release
of this widget, please submit it for consideration via a gitHub pull request.

---

License
-------
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
