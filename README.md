watusi/jquery-mobile-iscrollview, Version 1.3.6
===============================================
JQuery Mobile widget plug-in for easy use of the [iScroll](https://github.com/cubiq/iscroll)
scroller in [JQuery Mobile](https://github.com/jquery/jquery-mobile)
projects.

iScroll is a javascript that can scroll content in a window within a web browser with very
similar behaviour to native scrolling on mobile devices such as iPhone and Android. This means you
can scroll a *window* within the browser using native-like scrollbars and physics.

jquery.mobile.iscrollview adapts the iScroll javascript to the jQuery Mobile environment.

It is an implementation of a JQuery [Widget Factory](https://github.com/scottgonzalez/jquery-ui-1.8-widget-factory)
widget. It follows the *widget-factory-mobile*
[Widget Factory Pattern](https://github.com/addyosmani/jquery-plugin-patterns).

---

Release Notes
-------------
Please see releaseNotes.txt for information on changes in this and prior releases.

iScroll Version 4.2.5
---------------------
This widget is not yet compatible with iScroll version 4.2.1 through 4.2.5. Please stick with iScroll 4.2 for
now. Some investigation and testing is needed due to changes in iScroll event code.

Also, iScroll 4.2.1 introduced and change that may not be desirable. Scrolling continues
when your finger leaves the wrapper. While this is a nice feature for small scrollers,
this is not always desirable. It is very odd on desktop browsers, as scroll continues
when you drag with the mouse, even outside of the browser! It should be optional. (It will be in iScroll5).

Roadmap
-------
1.4 - Fully implement usejQueryEvents

? - Option to un-enhance widget temporarily (and optionally hide headers/footers) during
virtual-keyboard input on select devices (iOS first),  to eliminate all form input problems
when using a virtual keyboard.

? iOS keyboard handing for inputs. Guess keyboard height based on device/orientation/fullscreen.
Resize wrapper to fit page in space above keyboard, center focused element.


? - Better support for collapsible content (scroll on expand if expanded content below window)

Plug for jquery.mobile.simultaneous-transitions
-----------------------------------------------
This plugin works best when used with
[jquery.mobile.simultaneous-transitions](https://github.com/watusi/jquery.mobile.simultaneous-transitions)

It puts back the old, simultaneous, non-scrolling transitions that everybody knew and loved
from jQuery Mobile 1.0. It's an ideal companion for jquery.mobile.iscrollview! Stop fighting the
goofy transitions in jQuery Mobile 1.1. If you're using iScroll, you probably don't need them.

What This is For
----------------
This widget is intended for use in any jQuery Mobile project, but it was designed to be especially
useful for some specific uses.

First and foremost are native mobile applications that use HTML/CSS/Javascript in a
webview for their user interface. It is especially desirable that such applications reproduce a
"native" look and feel. A native look and feel is impossible to achieve without an embeddable
scroller with native-like physics and scrollbar action.

While iScroll4 is useful to help achieve this goal, it is difficult to use along with
jQuery Mobile. It is not an easy task to integrate iScroll4 with jQuery Mobile - at least not
correctly and efficiently.

My intention is that this widget will handle 80% of use cases with very minimal effort.

The most common need for iScroll in jQuery Mobile projects is to have a fixed header and footer
with a single vertically-scrollable area in-between.

This can be accomplished by simply including the required files in the `<head>` and adding a
single `data-iscroll` attribute to your content `<div>`.

If you need to do something different than this, this widget will probably work for you, but
you will probably have to set some options and dig into the documentation a bit.

Because the primary target for this widget is native mobile applications, it has a large number of
configurable options, which may be usable only in certain target environments. I want you to be able
to tailor the widget to your specific needs when you are using it in specific, known environments.

Secondarily, it is intended to support websites that will be viewed on mobile browsers, and
"full-screen" websites and "web apps" for mobile devices (i.e. "Add to Home Screen" in
Mobile Safari).

Finally, it supports desktop browsers, and is regularly tested using current versions of
FireFox, Safari, Chrome, and Opera. It generally works well in these browsers, and fortunately
hasn't needed a lot of work to acheive compatability.

This widget is *not* well-tested on Android devices, and I very much appreciate assistance in
ferreting-out Android issues. It is tested regularly in all three modes (Mobile Safari, full-screen,
and UIWebView) on iPad 1(5.1), iPad 3(5.1), iPhone 4 (4.3.5) and iPhone 4S(5.1).

Usage
-----
The most basic usage of this widget is simple: just add a `data-iscroll`
attribute to a container. All content inside this container will be scrolled.

Note that `iscroll.js` itself scrolls only the first child of it's wrapper. However, by
default, this plugin automatically creates a protective `<div>` around all
children of the wrapper, and so unlike iscroll.js it will scroll *all* of the children of the
wrapper element - not just the first.

As well, you may have *no* content in the wrapper initially. You might do this, for example, if
you will be inserting dynamic content later. In this case, the plugin will create an empty
`<div>` for you.

If, for some reason, you do not want the widget to create
this protective container, set the `createScroller` option to `false`.

The widget does not use the typical JQuery Mobile `data-role="something"` attribute,
because a common use case would be to use a `data-role="content"` `<div>` as the
container, and, of course, you can't have two `data-role` attributes on the
same element.

The widget will (normally) re-size the container to take up all available height
within the viewport after fixed headers/footers are taken into account. This behaviour can be
disabled using the `resizeWrapper` option, which should be se `true` for no more than one widget
on a given page.

The widget has been designed to support multiple scrollers on a page - for example, you
might want a second, gallery-like horizontal scroller. So, all
data related to a scroller is stored in the scroller's container, not the page.
Feel free to experiment with multiple scrollers - I just haven't had the
need so haven't put the effort into testing and supporting that scenario.


Support for `data-position="fixed"` headers/footers is limited, but improved over previous
versions. Since this widget resizes the scroller to fit the page, there is no need for fixed
positioning of header/footer. Resizing is fast enough that the footer stays "glued" to the
bottom of the page fairly well.

Additional fixed-height elements (which are not headers or footers)
outside of the scrolling region should be given the `data-iscroll-fixed` attribute, if they
would add to the height of the page. (Do not add the `data-iscroll-fixed` attribute
to sidebars.)

---

Example
-------
```html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <title>Demo</title>

    <link rel="stylesheet" href="jquery.mobile-1.3.1.min.css"/>
    <link rel="stylesheet" href="jquery.mobile.iscrollview.css"/>
    <link rel="stylesheet" href="jquery.mobile.iscrollview-pull.css"/>
    <link rel="stylesheet" href="additional-site-specific-styles.css"/>

    <script src="jquery-1.9.1.min.js"></script>
    <script src="jquery.mobile-1.3.1.min.js"></script>
    <script src="iscroll.js"></script>
    <script src="jquery.mobile.iscrollview.js"></script>
    <script src="additional-site-specific-scripts.js"></script>
  </head>

  <body>
    <div data-role="page" class="index-page">

      <div data-role="header" data-position="fixed" data-tap-toggle="false" data-transition="none" data-id="header">
        <h1>INDEX PAGE</h1>
      </div>

      <div data-role="content" class="example-wrapper" data-iscroll>
        <p>some content that will be scrolled</p>
        <p>Some more content that will be scrolled</p>
        <ul data-role="listview">
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <p>Even more content. It will scroll whatever is in the data-iscroll div.</p>
      </div>

      <div data-role="footer" data-position="fixed" data-tap-toggle="false" data-transition="none" data-id="footer">
        <h1>My Footer</h1>
      </div>

    </div>
  </body>
</html>
```

---

Fixed and persistent Toolbars (Headers/Footers)
-----------------------------------------------
This plugin now works fairly well with both fixed and persistent toolbars, as long as you use
jQuery Mobile 1.1.1 or later.

Make sure you use `data-tap-toggle="false"` if you don't want goofy disppearing tolbars when the
user taps on the toolbar!

Note, however: *do not use `data-tap-toggle="false"` for Navbars!* This is an apparent bug
in jQuery Mobile. `data-tap-toggle` is not possible for NavBars in any case, because the buttons
cover the entire toolbar surface. There isn't anywhere for the user to tap-to-toggle.

If you add `data-tap-toggle="false"` to a Navbar, the Navbar will fail to
work in certain circumstances when using certain browsers (Mobile Safari/iOS 5.1.1 on iPhone,
but not on iPad or iOS 4.3.5). After a window resize (for example, orientation change), the Navbar
will become non-responsive if `data-tap-toggle` is present. In this case, just leave this option out
completely.

You can also use persistent toolbars. The JQM documentation has in the past been ambiguous
as to whether these can be used with toolbars other than Navbars. They can: at least with
jQuery Mobile 1.1.1. The demo now uses fixed, persistent toolbars for both header and footer.

To use a persistent toolbar, assign the same `data-id` value to the toolbar in each page in
which it appears. jQuery Mobile will move the toolbar out of the page temporarily during
transitions, so that it will appear fixed. A "none" transition is used to transition the toolbars,
so that elements that are positioned in the same place within the toolbar will appear to not
change during the transition.

Because the page height is restricted to the viewport height (at least by default) when using
this plugin, jQuery Mobile (1.1.1) will not fade the toolbar during transitions.

Bear in mind, though, that the combination of fixed toolbars and a page size that equals the
viewport height (the default when using this plugin) may cause unwanted results in some
enviroments. In particular, in Mobile Safari, this will cause the browser's navigation bar
to show during page transitions. So, fixed toolbars are most appropriate only in a native
environment (such as when using a WebView with PhoneGap.)

I am seeking feedback on how well fixed and persistent toolbars work (or don't) in different
browsers and environments. So, I have enabled fixed/persistent toolbars in the demo. If this causes
issues in your environment, please try with `data-position="inline"`.

In the demo, you can use see the difference
between how jQuery Mobile 1.0.1 and 1.1.1 handle this. You can see that the
header is fixed with 1.1.1 but slides with the page with 1.0.1. JQM *tries* to keep the footer
fixed in 1.0.1 but is not completely successful. You will see that sometimes it stays fixed
and sometimes it slides with the page transition. Ths seems related to queued transitions.

Additionally, you may notice that the footer is shown briefly in the wrong position during
transitions. If this is a problem in your environment, you can use an inline footer, and the
plugin will insure it always appears in the right place. However, you cannot implement a persistent
toolbar in JQM 1.1 with an inline footer.

Dynamic Content
---------------
If you will be adding dynamic content that you want to have scrolled, you first need to understand
the HTML structure that the plugin creates for you.

If you supply initial content, the plugin will create two `<div>`s around that content.

The outermost `<div>` is called the scroller, and contains everything that will be scrolled
by iScroll. It is given a class of `iscroll-scroller`.

If you supplied pull-down and/or pull-up blocks, they are moved to inside the scroller, after
the scroller is created.

An additional `<div>` is also added around the scrolled content, sandwiched between the
(possibly absent) pull-down and/or pull-up blocks. This `<div>` is given a class of
`iscroll-content`. This contains everthing that the scroller scrolls, *other* than any
pull-down and/or pull-up blocks.

When you add dynamic content, make sure to add it inside the `<div>` that has class `iscroll-content`.

What you wrote:

```html
    <div data-role="content" data-iscroll>
      <p>This is some content that I want to scroll</p>
      <p>This is some more content</p>
    </div>
```

What the plugin produces:

```html
    <div data-role="content" data-iscroll class="iscroll-wrapper">
      <div class="iscroll-scroller">
        <!-- If you included a pull-down under the wrapper, it will wind-up here -->
        <div class="iscroll-content">
          <!-- If you included no content above under the content div, then this div is empty -->
          <p>This is some content that I want to scroll</p>
          <p>This is some more content</p>
        </div>
        <!-- If you included a pull-up under the wrapper, it will wind-up here -->
      </div>
    </div>
```

### Refreshing

Any time you alter the content of a scroller, in such a way that the dimensions of the scrolled
content might be changed, you need to refresh the scroller widget using the `refresh()` function.

The `refresh()` function has optional pre and post-refresh function arguments that can be used
to perform some action before and/or after the refresh. For example, you might also refresh some other
widget, such as a listview, prior to refreshing the scroller, or you might want to scroll to
a particular position after the refresh has been performed. The callbacks are necessary because
refresh is not performed immediately, but after a timeout that insures that the DOM has been fully
updated with your new content.

Please see the section on the `refresh()` function for full details.

Alternately, you can trigger an `updatelayout` event on the element whose dimensions you changed.
The widget listens for any `updatelayout` events triggered on elements inside a scroller and
refreshes automatically. `updatelayout` is triggered by jQuery Mobile on certain jQuery Mobile
widgets, such as, for example, collapsibles. So, it is not necessary to call `refresh()` when
collapsibles are expanded or collapsed.

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

You also need to include the file `jquery.mobile.iscrollview-pull-css` in your
`<head>`. Finally, this CSS file references an image file that contains an arrow icon and a
spinner icon. You can replace this with your own image file. If you rename or move this file, make
sure to edit the CSS file or override the rule in your own CSS file.

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
        <span class="iscroll-pull-label"></span>
      </div>
    </div>

```

This is all you have to do to implement the pull-up and/or pull-down UI.
The widget doesn't create the pull blocks for you, in order to provide you with the flexibility
to format them as you please. The pull blocks can contain other elements, and the spans for
the icon and/or label can be omitted.

All of the class names used for pull-down and pull-up are configurable in options. The example
above uses the default class names.

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

Calling functions
-----------------
The standard way of calling widget functions is by passing a sub-function name
as a string parameter to the widget function. Any parameters to the function
should follow.

Note: This method works for all versions of jQuery Mobile from 1.0 to 1.4.x. See
below, though, for differences when using an alternative way of calling fucntions.

For example, to call the `refresh` function:

```javascript
    $(".example-wrapper").iscrollview("refresh");
```

The widget factory allows you to access widget functions directly, by
accessing a data variable stored in the widget's element. For jQuery
Mobile versions < 1.3:

```javascript
    $(".example-wrapper").jqmData("iscrollview").refresh();
```

The Widget Factory changed in jQuery Mobile version 1.3. Starting
with this version, you can access this variable like this:

```javascript
    $(".example-wrapper").data("mobileIscrollview").refresh();
```

While this is a bit awkward, it is also more conventional. It is
handy in case you need to make a series of calls to different widget
functions. You can first get the instance into a variable.

```javascript
    // JQM < 1.3
    var myView = $(".example-wrapper").jqmData("iscrollview");
    myView.refresh();
```

```javascript
    // JQM >= 1.3
    var myView = $(".example-wrapper").data("mobileIscrollview");
    myView.refresh();
```

This means, as well, you can easily call any underlying iScroll function
through the exposed `iscroll` member variable. For example,

```javascript
    // JQM < 1.3
    $(".example-wrapper").jqmData("iscrollview").iscroll.scrollTo(0,10,200,true);
```

```javascript
    // JQM >= 1.3
    $(".example-wrapper").data("mobileIscrollview").iscroll.scrollTo(0,10,200,true);
```

So, if you replace iscroll.js with a newer version that has new functions,
or if you need to call iScroll private functions,  or access iScroll
member variables, you can call them without any need to modify this widget.

This widget wraps all current iScroll public functions,
so the above example can also be called like this:

```javascript
    $(".example-wrapper").iscrollview("scrollTo", 0, 10, 200, true);
```

The exceptions are the `destroy`, `refresh`, `enable`, and `disable` functions.

`destroy` is a standard widget factory function. In this widget, it
calls the iScroll `destroy` function and then calls the base widget
destroy. If you need direct access to iScroll's `destroy` function,
you can access it directly using the `iscroll` member variable.

The widget's `refresh` function insures that the underlying iScroll
refresh function is called with the proper timing. If you need to call
the iScroll refresh function directly, do so using the `iscroll` member
variable.

`enable` and `disable` are standard widget functions. Each of these calls
iScroll's corresponding function and then calls the underlying widget
function.

---

Functions
---------
###Standard Widget Functions

These are functions that are typically implemented for ALL widgets:

####option(key, [value_or_object])

See "Options", below.

####destroy()

Destroys the iScroll instance and removes page modifications. Also calls the
underlying widget `destroy()` code.

###Custom Widget Functions

These are additional functions implemented in this widget which do
not have corresponding iScroll functions.

####resizeWrapper()

This will resize the wrapper to use all available viewport space
after accounting for headers, footers, and other fixed-height elements
outside of the wrapper. This is normally done for you automatically,
but the automatic resize can be overriden with an option. Call this
if you have change the page structure and so need to resize the wrapper.
This is also normally called for you when page orientation or page
size changes.

###iScroll Functions

These are functions that exist in iScroll. They are available on
the widget as a convenience. See "calling functions" for information
on how to access any iScroll functions that are not implemented in
the widget. (For example, because you have updated iScroll to
a newer version, and this widget has not been updated yet.)

Please see the iScroll documentation for details on using these
functions.

####refresh(timeout, beforeCallback, afterCallback, noDefer)

Note that this performs the proper timing for the iScroll `refresh()`
function using `setTimeout`. If you want to call the iScroll `refresh()`
function directly, please see "calling functions" above.

If the timeout value is present, then the internal call of iScroll `refresh()` will be delayed
by this value. If the value is `null` or `undefined`, then the value of the `refreshDelay`
option will be used.

##### Refresh Callbacks

If present, the optional `beforeCallback` function will be called just prior to refreshing iScroll.
This is useful if you have updated content inside the
scroller, and need to refresh widgets inside the scroller (such as a listview) prior to iScroll
refresh. While this is similar to the `iscroll_onbeforerefresh`, the callback is specific to
a particular call to `refresh()`.

If your callback requires some context, you should use jQuery's $.proxy() function to provide a
`this` reference that will be available when the callback executes.

If present, the  optional `afterCallback` function will be called just after refreshing iScroll.
This is useful if you want to perform some action on
the scroller after updating content. For example, this might be used to scroll to a particular
position or element within the scroller after updating content. This is particularly useful
when adding content to the *end* of the scroller, when you might like to scroll the new content
into view.

##### Deferred Refresh

Calls made to `refresh()` for an iscrollview which is on a cached page that is not the active page
are normally (depending on the value of the `deferNonActiveRefresh` option) deferred until the
next `iscroll_onbeforepagerefresh` event for the page. This avoids unnecessary refreshes. Note
that if the `refreshOnPageBeforeChange` option is true, then the scroller will *always* be
refreshed on `iscroll_pagebeforefresh()`.

Each deferred call to `refresh()` overwrites the callback values from any previous
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

##### NoDefer Argument
If you want to force a refresh to a scroller on a non-active page to be performed immediately,
you can set the `noDefer` parameter to `true`. Note that the `noDefer` parameter is intended
for the widget's internal use, and you should not normally set it to `true`. You should normally
just leave this parameter out of your call.

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
the default iScroll `scrollToElement()` time value is used. This is based on larger of x and x
pixels scrolled, times 2. For example, if it will scroll 500px vertically (and less than 500px
horizontally), then the scroll will take place over a period of 1000mSec.

####scrollToPage(pageX, pageY, time)

The default time value, if not specified, is 400mSec. (Default iScroll.js value)

####disable()

Note that this function also calls the default widget `disable()` function.

Note: This has not been tested, and probably doesn't work correctly. Further, the iscroll-internal
`disable()` probably doesn't do what you wish it would do. You can't re-enable iScroll by calling
`enable()` after calling `disable()`.

If you do want to call the iScroll `disable()` function directly, please see "calling functions" above.

####enable()

Note that this function also calls the default widget `enable()` function.
If you want to call the iScroll `enable()`
function directly, please see "calling functions" above.

####stop()

####zoom(x, y, scale, time)

The default time value, if not specified, is 200mSec (Default iScroll.js value)

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

####x()

Current x origin (left) of the scroller.

####y()

Current y origin top of the scroller.

####wrapperW()

The width, in pixels, of the wrapper. This is the visible width of the scrolling area.

####wrapperH()

The height, in pixels, of the wrapper. This is the visible height of the scrolling area.

####scrollerW()

The width, in pixels, of the scroller. This is the total width of the scroller, including
visible and non-visible portions.

####scrollerH()

The height, in pixels, of the scroller. This is the total height of the scroller, including
visible and non-visible portions.

###iScroll Getters/Setters

This widget provides getters with options setter functionality for some iScroll internal
variables that might be useful to an application. If a value is provided, then the
functions act as setters. In any case, they return the value of the associated internal
variable.

####minScrollX(val)

The minimum X scroll position. This defines the left-most position of scroll. The user
can scroll past the minimum X, but then the scroller will snap-back to the mimimum X
position.

####minScrollY(val)

The minimum Y scroll position. This defines the top-most position of the scroll. The
user can scroll past the minimum Y, but then the scroller will snap-back to the minimum
Y position.

####maxScrollX(val)

The maximum X scroll position. This defines the right-most position of scroll. The user
can scroll past the maximum X, but then the scroller will snap-back to the maximum X
position.

####maxScrollY(val)

The maximum Y scroll position. This defines the bottom-most position of the scroll. The
user can drag past the maximum Y, but then the scroller will snap-back to the maximum
Y position.

---

Public Members
--------------
The widget maintains several public data members that may be useful to you:

###iscroll

This is a reference the iScroll object.

###$window

A jQuery collection object containing the window (viewport).

###$wrapper

A jQuery collection object containing the iscrollview wrapper element.

###$scroller

A jQuery collection object containing the scroller element.

###$scrollerContent

a jQuery collection object containing the scroller content element.

###$pullDown

a jQuery collection object containing any pull-down element. If there is no pull-down element, then the
length of the collection will be zero.

###$pullUp

A jQuery collection object containing any pull-up element. If there is no pull-up element, then
the length of the collection will be zero.

###$page

A jQuery collection object containing the page that the widget is contained in.

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
at the same time that you override any jQuery Mobile default options. `jquery.mobile.iscrollview`
triggers an `iscrollview_init` event that is triggered once it has loaded, and you may set any
global options here.

Note that when `iscrollview_init` is triggered, this does *not* mean that any scroller(s)
have been initialized. It only means that the iscrollview library is loaded, and so you may
now set any global options.

It's common to bind to `mobileinit` after jQuery is loaded, but before loading jQuery Mobile.
You can bind to `iscroll_init` in the same place. Alternately, you can make changes to
global options any time after `jquery.mobile.iscrollview` is loaded.

Note: `iscroll_init` is ONLY available as a jQuery Event. There is no corresponding
iscrollview callback function.

```html
    <script>
      $(document).on("mobileinit", function(){
        $.mobile.defaultPageTransition = "slide";
      });

      $(document).on("iscroll_init", function() {
      $.mobile.iscrollview.prototype.options.refreshDelay = 100;
      });
    </script>
```

###Programatic access

This widget supports programmatic access to options using standard widget factory
syntax:

    .iscrollview("option");                   Returns an object with all options
    .iscrollview("option", "hScroll");        Returns value of option
    .iscrollview("option", "hScroll", true);  Sets option
    .iscrollview("option", {hScroll: true});  Sets option, alternative syntax
    .iscrollview("option", {hScroll: true, vScroll:true}; Set multiple options

The widget handles copying widget options to the iScroll object options and
vice-versa.

###Setting options in the data-iscroll attribute

This widget also supports setting options directly in the `data-iscroll`
attribute. The options need to be in **strict** JSON format. This means that keys
and string values need to be enclosed in **double** quotes **only**. Numeric and
boolean values should **not** be enclosed in quotation marks.

####Example:

```html
    <div data-role="content" data-iscroll='{"hScroll":true,"vScroll":false,"resizeEvents":"orientationchange"}' data-theme="c">
```

###Modifying options after instantiation

If you modify an iScroll option after a scroller has been instantiated, the underlying
iScroll object will be destroyed and re-created. This is because iScroll does
not currently support modifying options after the object has been created.

However, unofficially, some options can be changed without destroying and
re-creating the object. It is unclear exactly which options these are, and
so this widget does not attempt it. There is skeletal code in the source
that is commented-out to do this if you wish to experiment.

If you modify a widget option (which is not also an iScroll option) after instantiation,
behaviour depends on the specific option. (Like iScroll) the widget does not currently
specifically support changing options after instantiation. Generally, if you change an
option after instantiation. If the option only has an effect at instantiation, then changing
the option after instantion will do nothing. (And might confuse the widget.)

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

####topSpacerClass

A CSS class, or a space-separated list of classes, which will be added to the top spacer
`<div>`.

####bottomSpacerClass

A CSS class, or a space-separated list of classes, which will be added to the bottom spacer
`<div>`.

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

####fixedHeightSelector

A JQuery selector which selects the fixed-height elements on the page which are outside
of the scrolling area. The heights of these elements will be added-up, and subtracted
from the total viewport height to arrive at the wrapper height.

Note: these elements are ignored for purposes of determining scroller height when
they occur inside of a Popup or Panel.

Default: `":jqmData(role='header'), :jqmData(role='footer'), :jqmData(iscroll-fixed)"`

####fixedHeightClass

The widget adds this class to elements that have the `data-iscroll-fixed` attribute.

Default: `"iscroll-fixed"`

####resizeWrapper

If true, the wrapper will be resized to the height remaining after accounting for
fixed-height elements. You should only set this to "true" for one scroller on a page.

Default: `true`

####resizeEvents

A space-separated list of events which will cause a resize of the wrapper.

Note that mobile devices are very inconsistent in regard to `orientationchange` and `resize` events.
There is no consistency as to whether just one or both event are fired, and multiple events
of each type are fired on some devices. They are also inconsistent as to which fired event
first reflects the new width and height values.

Default: `"resize orientationchange"` if device supports orientation. Otherwise, `"resize"`.

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

Default: `true`

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

####scrollShortContent

If true, the widget will set the minimum height of the scroller so that it fills the wrapper
(exclusive of any pull-down/pull-up elements).

Note that if you have a pull-down or pull-up, then this is done regardless of this setting,
since otherwise there would be no way to access the pull-down or pull-up if there is no
content. (If there were some content but it was shorter than the wrapper, then you wouldn't
be able to drag in the empty space.)

Set this to `false` if you want scrollers that do not have a pull-down or pull-up to not display
a scrollbar and not be draggable if they are shorter than the wrapper. Recommended setting is
`true` because it provides a more consistent UI experience.

Default: `true`

####emulateBottomOffset

If true, the widget will emulate a `bottomOffset` iScroll option. This option needs to be set
`true` if you are using a pull-up block.

Default: `true`

####removeWrapperPadding

If true, the widget will remove any padding from the wrapper. Normally, there should be no
padding on the wrapper element. If there is padding, then it isn't possible to drag within the
padding, and pull-down/pull-up elements will not be 100% width.
`
Default `true`

####addScrollerPadding

If true, the widget will add any padding removed from the wrapper to the protective `<div>` it
places around your scrolled content.

Default: `true`

####createScroller

iScroll scrolls only the first child of the wrapper. So that you don't have to wrap multiple
content elements with a `<div>` the widget does this for you. This `<div>` is always needed if you
have a pull-up or pull-down block.

Default: `true`

####addSpacers

If true, spacer `<div>`s will be added before and after the `.iscroll-content` div.
The height of these spacer `<div>`s will default to 0.

These spacers can be used as a substitute for top/bottom padding in situations where
top/bottom padding is ineffective, and collapses into the document.

Default: `true`

####scrollTopOnResize

On some platforms (for example, iOS) when orientation is changed, the address bar pushes the
page down. jQuery Mobile scroll the pgae back up on hash changes, but doesn't do so for
orientation changes. So, the page is left scrolled-down.

Since `orientationchange` seems unreliable on iOS, the widget actually does this on resize. (Though
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

If `true`, an assumption is made that you will not call the widget's `destroy()` function to
un-enhance the widget while retaining the page. The assumption is that `destroy()` will only
be called internally by the page plugin when the page is removed from the DOM. This saves
the overhead of un-enhancing the page.

Default: `false`

###preventPageScroll

If `true` prevent scrolling the page by grabbing areas outside of the scroller.
Normally, this should be true. Set this false if you are NOT using a fixed-height page,
but instead are using iScroll to scroll an area within a scollable page. If you have
multiple scrollers on a scrollable page, then set this false for all of them.
Note that scrolling of the page by dragging inside the scroller is *always* prevented.

Default: `true`

####pullDownResetText

Default: `"Pull down to refresh..."`

####pullDownPulledText

Default: `"Release to refresh..."`

####pullDownLoadingText

Default: `"Loading..."`

####pullUpResetText

Default: `"Pull up to refresh..."`

####pullUpPulledText

Default: `"Release to refresh..."`

####pullUpLoadingText

default: `"Loading..."`

####pullPulledClass

Default: `"iscroll-pull-pulled"`

####pullLoadingClass

Default: `"iscroll-pull-loading"`

---

Events
------
There are two ways to be notified when some event occurs in the widget: by binding/delegating
jQuery events, or by specifying a callback in the widget's `options` object.

When an event is triggered it will call the callback if defined in options, and, as well, trigger
any bound events.

###jQuery Event Callbacks

The widget exposes jQuery events that can be bound like any other event.
The names are prepended with the string `iscroll_`. So, the `onrefresh`
event for this widget is actually `iscroll_onrefresh`. (Note also that widget event names
are different than iScroll event names. iScroll event names are in mixed case. Widget event
names are in all lower case - this is a limitation of jQuery widgets.)


###Option Callbacks

Alternately, you can add callback functions to the widget's `options` object. The key
of the option corresponds to the event name **without** the widget name
prefix. So, you can add a callback function for the refresh event
with the key `onrefresh`.

I don't recommend using option callbacks. They are supported because they are required by
the jQuery Widget Factory.

Note that the `iscrollview_init` event has no corresponding Widget Factory callback.


###Bound Callback parameters

Bound event callbacks receive two parameters:

* `event` - The underlying DOM event (if any) associated with this event
* `data` -  A map containing data passed to the event by this widget
 * `:iscrollview` - a reference to the iscrollview object associated with this event

As well, when a bound event callback is called, `this` will be the DOM
object that triggered the event. (e.g. the wrapper).


###Binding to Events

All events triggered by this widget trigger on the wrapper element. This includes events generated
by iScroll itself (and reflected to jQuery events) as well as those triggered by the widget.

It is most efficient, then, to bind directly to the wrapper element. If you bind from a script
within an HTML page, make sure that the script is at the *end* of the page, within the `<body>`
element.

Do not put code to bind to events directly in `<head>` on a particular page, because jQuery Mobile
ignores the content of `<head>` on all but the first page encountered. (Thus the content of
`<head>` should be identical for every page.)

In this case, you can locate the wrapper element with:

```javascript

    $.mobile.activePage.find(".iscroll-wrapper")

```

or

```javascript

    (".iscroll-wrapper", $.mobile.activepage)

```

If you have multiple scrollers on a page, you will need to assign an ID or class to individual
wrappers so that you can locate them.

So, within a page, you can bind simply, such as:

```javascript

    $.mobile.activePage.find(".iscroll-wrapper").bind("iscroll_onpulldown", function () {
      alert("Pull-down gesture was completed");
      } );

```

To bind in common code called from `<head>`, you will need to first delegate a function to the
`pageinit` event. This event is triggered whenever a page is first created. You can test (using
an ID or class) to see if that page has a scroller you want to bind to, and then bind from
within the delegated function. The file `pull-example.js` in the demo uses this technique.

```javascript

    $(document).delegate("div.contacts-page", "pageinit", function () {
      this.find(".iscroll-wrapper").bind("iscroll_onpulldown", function () {
        alert("Pull-down gesture was completed");
        });
    });

```

You can also use a delegation at the document level. This is shorter, but somewhat less efficient,
since events will bubble-up to the document:

```javascript

    $(document).delegate("div.contacts-wrapper", "iscroll_onpulldown", function () {
      alert("Pull-down gesture was completed");
      });

```

Finally, if you have a reference to an `iscrollview` object, you can use it's public `$wrapper`
member to bind:

```javascript
    // JQM < 1.3
    var view = $('.some-wrapper').jqmData('iscrollview');
    view.$wrapper.bind("iscroll_onpulldown", function ()  {
      alert("Pull-down gesture was completed");
      });
```

```javascript
    // JQM >= 1.3
    var view = $('.some-wrapper').data('mobileIscrollview');
    view.$wrapper.bind("iscroll_onpulldown", function ()  {
      alert("Pull-down gesture was completed");
      });
```

###Supported Events

#### iscroll_init

This event is triggered when jquery.mobile.iscrollview has been loaded. This does *not*
mean that any iscrollview widgets have been initialized. The purpose of this event is to
allow you to set global options after the library is loaded, but before any widgets have
been initialized.

This event does NOT have a corresponding Widget Factory callback option.

####iscroll_onrefresh

This event is triggered when iScroll's internal `refresh()` function is called. It is
called after iScroll has calculated the scroll range, but before it has updated the scroll
bar.

*This event is of dubious value to applications. The widget uses this internally to
support pull-down/pull-up. (It seems it was put just where it is just for that purpose.)*

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

This event is triggered when the user has completed a pull-down gesture. Your event callback
should perform the pull-down action. (For example, getting data from a server in order to refresh
text shown within the scroller.)

You can also use this event for complex customization of pull-down feedback to the user. The
UI should indicate that the pull-down action is being performed.

####iscroll_onpulldownreset

This event is triggered when the user has aborted a pull-down gesture by scrolling back up, or
after completion of the pull-down action and `refresh()`. You can use this event for complex
customization of pull-down feedback to the user. The UI should indicate that the user may
initiate a pull-down sequence.

####iscroll_onpulldownpulled

This event is triggered when the user has completed the first half of a pull-down gesture.
i.e. they have pulled-down, but not yet released. You can use this event for complex
customization of pull-down feedback to the user. The UI should indicate that the user may
complete a pull-down sequence by releasing.

####iscroll_onpullup

This event is triggered when the user has completed a pull-up gesture. Your event callback
should perform the pull-up action. (For example, getting data from a server in order to refresh
text shown within the scroller.)

You can also use this event for complex customization of pull-up feedback to the user. The
UI should indicate that the pull-up action is being performed.

####iscroll_onpullupreset

This event is triggered when the user has aborted a pull-up gesture by scrolling back down, or
after completion of the pull-up action and `refresh()`. You can use this event for complex
customization of pull-up feedback to the user. The UI should indicate that the user may
initiate a pull-up sequence.

####iscroll_onpulluppulled

This event is triggered when the user has completed the first half of a pull-up gesture.
i.e. they have pulled-up, but not yet released. You can use this event for complex
customization of pull-up feedback to the user. The UI should indicate that the user may
complete a pull-up sequence by releasing.


---

Scroll Bars
-----------

### Wrapper Positioning Requirement

iScroll requires that the wrapper be CSS-positioned either `absolute` or `relative`. If the
wrapper is positioned `static` (the default, if positioning is not specified), then the
scroll bars will (incorrectly) be created relative to the page, rather than the wrapper. The
symptom is that the scroll bar will be the full height of the window. (Though the widget
will hide the scrollbar under any header/footer.)

The standard CSS file for the widget sets relative positioning on the wrapper.

Either `absolute` or `relative` positioning of the wrapper will cause elements inside the
wrapper which themselves have `absolute` positioning to be positioned relative to the wrapper.
iScroll depends on this behaviour for positioning of the scrollbar.

### Customizing Scrollbar Position

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

Multiple Scrollers
------------------
If you wish to have multiple scrollers, please note the following:

- The `resizeWrapper` option should be set to `true` for no more than one
of your scrollers. If you have multiple scrollers one above the other,
then at most one of them can be auto-sized. If you have multiple scrollers
side-by-side, then you will probably have to size all them yourself.
Since `resizeWrapper` is `true` by default, you will need to set the option
to `false` for all but (a maximum) of one of your scrollers.

- iScroll will not work correctly if scrollbars from multiple scrollers
overlap. It will fail to scroll in all but one of the scrollers that
have overlapping scrollbars. Please see the documentation on scrollbar
customization, above.

---

Listviews Containing Links
--------------------------
*(Note: this discussion is somewhat obsoleted by changes in version 1.2 of this widget and
version 1.1 of jQuery Mobile. By default, the widget prevents this annoying list behaviour
when you are using it with jQuery Mobile 1.0 or 1.0.1 with the `preventTouchHover` option. jQuery
Mobile 1.1 prevents it inherently.)*

Listviews that have list items that are buttons (i.e. the items are clickable,
because they are wrapped in an `<a>` tag) can be very slow on touchscreen devices. This is not an
iScroll or widget problem per-se - it is inherent to JQuery Mobile 1.0 and 1.0.1.

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

If this *is* used, then the browser may be forced to cache the content in advance, resulting
in smoother scrolling, but with the side-effect of increasing initial rendering time.

This can more than *double* initial rendering time if you are not careful with the selector. The
recommended CSS at the above link is NOT optimal.

You need to apply this judiciously. For example, if you know your scroller content consists
of list items, use `li` not `*` to select. `*` as the right-most component of a select is
horribly expensive. A small additional performance gain can be made by selecting
iscroll-content instead of iscroll-scroller. You might get a
glitch on a pull-up if you have one, but it's a small price to pay for doubling speed.

It is important NOT to apply this to `.iscroll-scroller` itself. This will result in a huge
performance loss. The rule below gives performance on iOS devices very close to not
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

jQuery Mobile 1.1 handles the address bar better than jQuery Mobile 1.0 or 1.0.1. With 1.1, the
address bar usually will not appear during a page transition.

It doesn't appear possible to consistently detect the real window height, though it is possible
to consistently detect the window height assuming that the address bar is present. So, this
widget adds 60px to page height in this situation. This addition is not applied for iPad, nor for
iPhone/iPod if running a native app in a  UIWebView, or when running in "full screen" mode
(web page saved to home screen).

If you are testing using desktop Safari's `Develop` `User Agent` option, please note that this
adaptation will fail. It depends on specific behaviour of the real Mobile Safari browser. If
you want to use desktop Safari to test pages designed to run on iPhone, either use the standard
Safari User Agent, or else use an "Other" User Agent:

First, set the User Agent to `Safari ... iPhone`. then, select `User Agent` `Other`. The user-agent
string will be pre-populated with the Mobile Safari user-agent string. Remove `Safari` from the
user agent. This will fool the widget into thinking you are running in "full screen" mode, without
the disappearing address bar which is not present on desktop Safari.

---

Demo
----
The demo contains a simple example with 5 pages. The demo can be found in `/demo/build`. It is built
using a static site generator (written in Ruby) called Middleman, but the demo has already been
built for you. If you do wish to build the demo yourself, you will need to install Middleman 3.0 or
higher.

Just copy the contents of `/demo/build` to your web server, or open the index.html file directly
from `/demo/build`.

You can switch between the pages using the tabbar at the bottom. The pages demonstrate:

* a listview
* an inset listview (also has two expandible elements)
* a listview with pull-down and pull-up blocks
* a listview with a short list and pull-down/pull-up blocks
* a form

To demo, simply open the `index.html` file in your browser. Note that the page transitions will
not work with some browsers when loading from a local file - for those browsers, you will have
to load the demo from a server. (It does work with local files for Safari and Firefox.)

You can switch between jQuery Mobile 1.0.1 and 1.1 using the buttons in the headers.

The demo illustrates the use of different-sized headers and footers for portrait and landscape
orientations. In landscape, the header and footer are shorter, and the header omits the buttons
for switching between jQuery Mobile versions.

###Special Demo Borders

The demo has headers and footer styled with a 1px red border at top and bottom. This facilitates
a quick visual indication of correct sizing of the page. You should not see any white
space above the header or below the footer. (Note that Retina devices will show a 2px border,
rather than 1px.) Use your OS's accessibility features to magnify and inspect. On mobile
devices, there is usually a way to capture the screen contents to an image file that you can
later examine. (iPhone: Home+On/Off)

The iScroll wrapper is styled with a 1px green border at top and bottom. You should see no gap
or different color between the top of the wrapper and the bottom of the header, or between
the bottom of the wrapper and the top of the footer.

###Demo Content

As a convenience, the demo directory is self-contained (except for the widget, `iscroll-pull-js`
and pull icon files, which are expected to be found in the parent directory), and contains the
following additional components:

* jQuery 1.6.4
* jQuery 1.7.1
* JQuery Mobile 1.0.1
* jQuery Mobile 1.1.1
* iscroll4, version 4.2


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

You can use `jsconsole.js` or other similar solutions to do remote logging from mobile devices.
It is important to narrow the focus of your logging when using such solutions.

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

###traceResizeWrapper

If this option is `true`, calls to the widget's `resizeWrapper()` function
are traced.

###traceIscrollEvents

If this option is `true`, events handled by iScroll are traced.

###tracedIscrollEvents

This is a list of iScroll events to trace. If the list is empty, all iScroll events will be
traced. List items are strings, example: `touchstart`.

###traceWidgetEvents

If this option is `true` events handled by the widget (not by iScroll) are traced.

###tracedWidgetEvents

This is a list of widget events to trace. If the list is empty, all widget events will be
traced. List items are strings. Events that iScroll itself handles are *not* traced when this
option is `true`. As well, callbacks bound to `touchmove` only for the purpose of preventing
the page from scrolling are not traced, because they occur very frequently.

###traceIscrollCallbacks

If this option is `true`, callbacks issued by iScroll are traced.

###tracedIscrollCallbacks

This is a list of iScroll callbacks to trace. If the list is empty, all iScroll callbacks will
be traced. List items are strings. Example: `onRefresh`.

###traceWidgetCallbacks

If this option is `true`, callbacks issed by the widget are traced. This does not include
callbacks issued by iScroll itself (which application code may also bind to.)

###tracedWidgetCallbacks

This is a list of widget callbacks to trace. If the list is empty, all widget callbacks will
be traced. List items are strings. Do not include the `iscroll_` prefix. Example: `onpulldown`.

---

Variable names
--------------
The source code code follows the following conventions:

* Upper-case first letter: constant
* $ first letter: variable contains a JQuery object
* (underscore) first letter: Private funcion

---

Minified Version
----------------
As a convenience, I have added YUI and Google Closure-compressed versions of the JS file. You
will find these in the /lib directory along with the uncompressed version.

You should evaluate your own needs for compression, and use the compressor and options that are
appropriate for your own site.

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
