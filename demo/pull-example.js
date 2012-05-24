/*jslint browser: true, sloppy: true, white: true, nomen: true, maxerr: 50, indent: 2 */
/*global jQuery:false, iScroll:false */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true,
         undef:true, curly:true, browser:true, jquery:true, indent:2, maxerr:50,
         white:false, nomen:false */

// Pull-Up and Pull-Down callbacks for "Pull" page

(function() {  // Self-invoking function to keep definitions local
  "use strict";
  var pullDownGeneratedCount = 0,
      pullUpGeneratedCount = 0,
      listSelector = "div.pull-demo-page ul.ui-listview",
      lastItemSelector = listSelector + " > li:last-child";

  $(document).delegate("div.pull-demo-page", "pageinit", function(event) {
      $(".iscroll-wrapper", this).bind( {
      "iscroll_onpulldown" : onPullDown,
      "iscroll_onpullup"   : onPullUp
      });
    });

  function onPullDown (e, d) {
    // SetTimeout here is simulating some action to typically retrieve data from a remote server.
    // Substitute call to .ajax(), etc. which will have a callback to handle the retrieved data.
    // From that callback (simulated by the function called by setTimeout, insert the data into
    // the scroller, then do any necessary jQuery Mobile refresh (as shown below for listview)
    // and then call refresh() on the iscrollview object as well.
    setTimeout(function() {
      var i,
          iscrollview = d.iscrollview,
          $list = $(listSelector);
      for (i=0; i<3; i++) {
        $list.prepend("<li>Pulldown-generated row " + (++pullDownGeneratedCount) + "</li>");
        }
      $list.jqmData("listview").refresh();
      iscrollview.refresh();
      }, 1500); // Simulate time to retrieve data from some server, etc.
    }

  function onPullUp (e, d) {
    setTimeout(function() {
      var i,
          iscrollview = d.iscrollview,
          $list = $(listSelector);
      for (i=0; i<3; i++) {
        $list.append("<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>");
        }
      $list.jqmData("listview").refresh();
      iscrollview.refresh(null, function() {    // Scroll is delayed until refresh completed
        iscrollview.scrollToElement(lastItemSelector, 400);
        }, this);
      }, 1500);
    }

  })();

// Pull-down and Pull-up callbacks for "Short Pull" page

(function() {  // Self-invoking function to keep definitions local
  "use strict";
  var pullDownGeneratedCount = 0,
    pullUpGeneratedCount = 0,
    listSelector = "div.short-pull-demo-page ul.ui-listview",
    lastItemSelector = listSelector + " > li:last-child";

    $(document).delegate("div.short-pull-demo-page", "pageinit", function(event) {
        $(".iscroll-wrapper", this).bind( {
        "iscroll_onpulldown" : onPullDown,
        "iscroll_onpullup"   : onPullUp
        });
      });

  function onPullDown (e, d) {
    // SetTimeout here is simulating some action to typically retrieve data from a remote server.
    // Substitute call to .ajax(), etc. which will have a callback to handle the retrieved data.
    // From that callback (simulated by the function called by setTimeout, insert the data into
    // the scroller, then do any necessary jQuery Mobile refresh (as shown below for listview)
    // and then call refresh() on the iscrollview object as well.
  setTimeout(function() {
    var i,
        iscrollview = d.iscrollview,
        $list = $(listSelector);
    for (i=0; i<3; i++) {
      $list.prepend("<li>Pulldown-generated row " + (++pullDownGeneratedCount) + "</li>");
        }
    $list.jqmData("listview").refresh();
    iscrollview.refresh();
    }, 1500); // Simulate time to retrieve data from some server, etc.
  }

  function onPullUp (e, d) {
    setTimeout(function() {
      var i,
        iscrollview = d.iscrollview,
        $list = $(listSelector);
        for (i=0; i<3; i++) {
          $list.append("<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>");
          }
        $list.jqmData("listview").refresh();
        iscrollview.refresh(null, function() {    // Scroll is delayed until refresh completed
          iscrollview.scrollToElement(lastItemSelector, 400);
          }, this);
        }, 1500);
      }

  })();
