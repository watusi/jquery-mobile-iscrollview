watusi/jquery-mobile-iscrollview, Version 1.0
=============================================
JQuery Mobile widget plug-in for easy use of the [iscroll4.js](https://github.com/cubiq/iscroll)
scroller in [JQuery Mobile](https://github.com/jquery/jquery-mobile)
projects.

This is a full JQuery [Widget Factory](https://github.com/scottgonzalez/jquery-ui-1.8-widget-factory)
widget implementation. It follows the *widget-factory-mobile*
[Widget Factory Pattern](https://github.com/addyosmani/jquery-plugin-patterns).

---

Usage
-----
The most basic usage of this widget is simple: just add a `data-iscroll`
attribute to a container. This is the iscroll4 wrapper. The first child of the
wrapper will be scrolled.

It does not use the typical JQuery Mobile `data-role="something"` attribute,
because a common use case would be to use a `data-role="content"` div as the
container, and, of course, you can't have two `data-role` attributes on the
same element.

Currently, this widget supports a single scrolling region on a page.
The widget will re-size the container to take up all available height
within the viewport after fixed headers/footers are taken into account,
and will make necessary adjustments to the page CSS.

However, the architecture has been designed with the idea of ultimately
supporting multiple scrolling regions - for example, a future version
might support a secondary gallery-like horizontal scroll region. So, all
data is stored in the container, not the page.

Make sure to use a `data-position="inline"` attribute for headers and
footers, **not** `data-position="fixed"`. With `data-position="fixed"`, and
some versions of JQuery Mobile, the headers/footers will fade in/out.
Since this widget resizes the scrolling region, there is no need for
fixed positioning of header/footer.

Additional fixed-height elements (which are not headers or footers)
outside of the scrolling region should be given the `iscroll-foreground`
class.

---

Example
-------
  <div data-role="page" id="index">

    <div data-role="header" data-position="inline">
      <h1>INDEX PAGE</h1>
    </div>

    <div data-role="content" class='example-wrapper' data-iscroll>
      <div>
        some contents.
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

---

Calling methods
---------------
The standard way of calling widget methods is by passing a sub-method name
as a string parameter to the widget function. Any parameters to the method
should follow.

For example, to call the `refresh` method:

      $(".example-wrapper").iscrollview("refresh")

The widget factory allows you to access widget methods directly, by
accessing a data variable stored in the widget's element:

      $(".example-wrapper").jqmData('iscrollview').refresh();

While this is a bit awkward, it is also more conventional. It is
handy in case you need to make a series of calls to different widget
methods. You can first get the instance into a variable:

      var myView = $(".example-wrapper").jqmData("iscrollview");
      myView.refresh();

This means, as well, you can easily call any underlying iscroll4 method
through the exposed `iscroll` member variable. For example,

      $(".example-wrapper").jqmData('iscrollview').iscroll.scrollTo(0,10,200,true);

So, if you replace iscroll4.js with a newer version that has new methods,
or if you need to call iscroll4 private methods,  or access iscroll4
member variables, you can call them without any need to modify this widget.

This widget wraps all current iscroll4 public methods,
so the above example can also be called like this:

      $(".example-wrapper").iscrollview("scrollTo", 0, 10, 200, true);

The exceptions are the `destroy`, `refresh`, `enable`, and `disable` methods.

`destroy` is a standard widget factory method. In this widget, it
calls the iscroll `destroy` method and then calls the base widget
destroy. If you need direct access to iscroll's `destroy` method,
you can access it directly using the iscroll member variable.

The widget's `refresh` method insures that the underlying iscroll4
refresh method is called with the proper timing. If you need to call
the iscroll4 refresh method directly, do so using the iscroll member
variable.

`enable` and `disable` are standard widget methods. Each of these calls
iscroll4's corresponding method and then calls the underlying widget
method.

---

Methods
-------
###Standard Widget Methods

These are methods that are typically implemented for ALL widgets:

####option(key, [value_or_object])

See "Options", below.

####destroy()

Destroys the iscroll4 instance and removes page modifications. Also calls the
underlying widget `destroy()` code.

###Custom Widget Methods

These are additional methods implemented in this widget which do
not have corresponding iscroll4 methods.

####resizeWrapper()

This will resize the wrapper to use all available viewport space
after accounting for headers, footers, and other fixed-height elements
outside of the wrapper. This is normally done for you automatically,
but the automatic resize can be overriden with an option. Call this
if you have change the page structure and so need to resize the wrapper.
This is also normally called for you when page orientation or page
size changes.

####undoResizeWrapper()

Undoes the resize of the wrapper. Note that this can only change the
wrapper size to what it was initially, prior to the very first call
to `resizeWrapper()`.


### iscroll4 Methods

These are methods that exist in iscroll4. They are available on
the widget as a convenience. See "calling methods" for information
on how to access any iscroll4 methods that are not implemented in
the widget. (For example, because you have updated iscroll4 to
a newer version, and this widget has not been updated yet.)

Please see the iscroll4 documentation for details on using these
methods.

####refresh()

Note that this performs the proper timing for the iscroll4 `refresh()`
function using `setTimeout`. If you want to call the iscroll4 `refresh()`
method directly, please see "calling methods" above.

####scrollTo(x, y, time, relative)

####scrollToElement(el, time)

####scrollToPage(pageX, pageY, time)

####disable()

Note that this method also calls the default widget `disable()` method.
If you want to call the iscroll4 `disable()`
method directly, please see "calling methods" above.

####enable()

Note that this method also calls the default widget `enable()` method.
If you want to call the iscroll4 `enable()`
method directly, please see "calling methods" above.

####stop()

####zoom(x, y, scale, time)

---

Options
-------
This widget supports programmatic access to options using standard widget factory
syntax:

    .iscrollview("option");                   Returns an object with all options
    .iscrollview("option", "hScroll");        Returns value of option
    .iscrollview("option", "hScroll", true);  Sets option
    .iscrollview("option", {hScroll: true});  Sets option, alternative syntax
    .iscrollview("option", {hScroll: true, vScroll:true}; Set multiple options

The widget handles copying widget options to the iscroll object options and
vice-versa.

This widget also supports setting options directly in the `data-iscroll`
attribute. The options need to be in **strict** JSON format. This means that keys
and string values need to be enclosed in **double** quotes **only**. Numeric and
boolean values should **not** be enclosed in quotation marks.

###Example of options set in data-iscroll attribute:

    <div data-role="content" data-iscroll='{"hScroll":true,"vScroll":false,"resizeEvents":"orientationchange"}' data-theme="c">


###Widget Options

The following options are available which affect the widget itself. These are
not iscroll4 options.

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

####adaptPage

If true, necessary adaptations will be made to the page to accommodate iscroll4. If false,
the adaptations will not be made. If multiple scrollers are used on the same page, only
one of them should have `adaptPage` set to true. You can also set this false if you
want to make the adaptations yourself.

Default: `true`

####fixedHeightSelector

A JQuery selector which selects the fixed-height elements on the page which are outside
of the scrolling area. The heights of these elements will be added-up, and subtracted
from the total viewport height to arrive at the wrapper height.

Default: `".ui-header, .ui-footer, .iscroll-foreground"`

####resizeWrapper

If true, the wrapper will be resized to the height remaining after accounting for
fixed-height elements.

Default: `true`

####resizeEvents

A space-separated list of events which will cause a resize of the wrapper.

In some mobile environments, it may be desirable to either substitute or add
the `orientationchange` event. For iOS, however, the `resize` event works better,
because the `orientationchange` event occurs to late too be useful, resulting
in undesirable visual artifacts.

Default: `"resize"`

####refreshOnPageBeforeShow

If true, the scroller will be refreshed on every JQuery Mobile `beforepageshow` event.
This should be set to true if scroller content might have changed asynchronously while
the page was loaded into the DOM but not shown, as might happen in some native
application environments. As well, this is necessary in some desktop browser environments,
because it's not possible to determine the height of fixed-height elements prior to
this event.

Default: `true`

---

Events
------
There are two ways to be notified when some event occurs in the widget.
The widget exposes JQuery events that can be bound like any other event.
The names are prepended with the name of the widget. So, the `refresh`
event for this widget is actually `iscrollviewrefresh`.

Alternately, you can add callback functions to the options object. They key
of the option corresponds to the event name **without** the widget name
prefix. So, you can add a callback function for the refresh event
with the key `refresh`.

When an event is triggered it will call the callback if defined in options,
and, as well, trigger any bound events.

See the iscroll4 source code for a list of supported events.

###Example event delegation:

    $(document).delegate("div.my-content", "iscrollviewrefresh", function(event) {
        console.write("iscrollviewrefresh occured");
        }

###Supported Events

* `iscrollviewrefresh`
* `iscrollviewbeforescrollstart`
* `iscrollviewscrollstart`
* `iscrollviewbeforescrollmove`
* `iscrollviewscrollmove`
* `iscrollviewbeforescrollend`
* `iscrollviewtouchend`
* `iscrollviewdestroy`
* `iscrollviewzoomstart`
* `iscrollviewzoom`
* `iscrollviewzoomend`

---

Demo
----
The demo directory contains a simple example of a JQuery Mobile page using
a scrollview to scroll a long list of items. To demo, simply open the
`index.html` file in your browser.

As a convenience, the demo directory is self-contained (except for the widget,
which is expected to be found in the parent directory), and contains the
following additional components:

* JQuery 1.6.4
* JQuery Mobile 1.0.1
* iscroll4, commit 712640b7de..., Apr. 10, 2012
* jquery.actual, commit 0530ce5c64..., Feb 22, 2012

Please obtain these components independently for your projects, so that
you can be sure of what version you are getting, and avail yourself
of any updates/improvements.

---

Testing
-------
This widget has only undergone ad-hoc testing, primarily with the components
included in the demo directory. Contribution of a test suite would be most
welcome. :)

Most testing has been done using JQuery 1.6.4/JQuery Mobile 1.0.1. Some
rudimentary testing has been done using JQuery 1.7.2/JQuery Mobile 1.1.0-RC2,
with no obvious problems noted.

---

Variable names
--------------
The source code code follows the following conventions:

* Upper-case first letter: constant
* $ first letter: variable contains a JQuery object
* first letter: Private method

---

Bugs and Enhancements
---------------------
Please submit bug and enhancement requests via [jquery.mobile.iscrollview gitHub Issues](https://github.com/watusi/jquery-mobile-iscrollview/issues)
If you have developed code that you would like to have incorporated in a future release
of this widget, please submit it for consideration via a gitHub pull request.

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
