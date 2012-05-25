/*jslint browser: true, sloppy: true, white: true, nomen: true, plusplus:true, maxerr: 50, indent: 2 */
/*global jQuery:false, iScroll:false */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true,
         undef:true, curly:true, browser:true, jquery:true, indent:2, maxerr:50,
         white:false, nomen:false */

//-------------------------------------------------------
// Pull-Up and Pull-Down callbacks for "Pull" page
//-------------------------------------------------------

(function($) {  // Self-invoking function to keep definitions local
  "use strict";
  var pullDownGeneratedCount = 0,
      pullUpGeneratedCount = 0,
      listSelector = "div.pull-demo-page ul.ui-listview",
      lastItemSelector = listSelector + " > li:last-child";
    
  // This function represents the callback from jQuery.ajax() etc. that will insert retrieved
  // data into the page. For demo, we just generate 3 items and add them to the top of the list.
  function gotPullDownData(e,d) {
    var i,
        $list = $(listSelector); // Get a jQuery object for the list element
    for (i=0; i<3; i+=1) {  // Add some items to the list
      $list.prepend("<li>Pulldown-generated row " + (++pullDownGeneratedCount) + "</li>");
      }
    $list.listview("refresh");  // Refresh the listview
    d.iscrollview.refresh();    // Refresh the iscrollview
    }
  
  function gotPullUpData(e,d) {
    var i,
        $list = $(listSelector);
    for (i=0; i<3; i+=1) { 
      $list.append("<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>");
      }
  
    // The refresh is a bit different for the pull-up, because I want to demonstrate the use
    // of refresh() callbacks. The refresh() function has optional pre and post-refresh callbacks.
    // Here, I use a post-refresh callback to do a timed scroll to the bottom of the list
    // after the new elements are added. The scroller will smoothly scroll to the bottom over
    // a 400mSec period. It's important to use the refresh() callback to insure that the scroll
    // isn't started until the scroller has first been refreshed.
    //
    // A pre-refresh callback is used here, as well, though it really isn't necessary
    // in this case. A pre-refresh callback is typically used to refresh jQuery Mobile widgets,
    // such as a listview. This needs to be done BEFORE the scroller refreshes. You could just
    // do this before calling refresh(), as done above for the pull-down. The advantage of using
    // a pre-refresh callback is that if you update some page that is cached and isn't the
    // active page, iscrollview defers refresh until just before the page is shown. If there
    // are multiple calls to refresh() while the page isn't shown, only a single refresh() call
    // is done. By using a pre-refresh callback, you can take advantage of this to also avoid
    // unnecessarily refreshing widgets that are inside the scroller.
    //
    // In this particular case, it doesn't matter, because when the user does a pull-up gesture,
    // obviously the page IS the active page. It's just done here for demo.
    
    // Refresh the iscrollview. After refresh, scroll to the end of the list using callback
    // 400mSec scroll to last list element for nice visual effect
    d.iscrollview.refresh(
      null,                                                                  // Optional delay value
      function() { $list.listview("refresh"); },                             // Pre-refresh
      function() { d.iscrollview.scrollToElement(lastItemSelector, 400);} ); // Post-refresh  
    }
  
  // This is the callback that is called when the user has completed the pull-down gesture.
  // Your code should initiate retrieving data from a server, local database, etc.
  // Typically, you will call some function like jQuery.ajax() that will make a callback
  // once data has been retrieved.
  //
  // For demo, we just use timeout to simulate the time required to complete the operation.
  function onPullDown (e,d) { setTimeout(function () {gotPullDownData(e,d);}, 1500); }    

  // Called when the user completes the pull-up gesture.
  function onPullUp (e,d) { setTimeout(function () {gotPullUpData(e,d);}, 1500); }    
  
  // Set-up jQuery event callbacks
  $(document).delegate("div.pull-demo-page", "pageinit", function(e) {
      $(".iscroll-wrapper", this).bind( {
      "iscroll_onpulldown" : onPullDown,
      "iscroll_onpullup"   : onPullUp
      });
    });  

  }(jQuery));

//-------------------------------------------------------
// Pull-down and Pull-up callbacks for "Short Pull" page
//-------------------------------------------------------

(function($) { 
  "use strict";
  var pullDownGeneratedCount = 0,
    pullUpGeneratedCount = 0,
    listSelector = "div.short-pull-demo-page ul.ui-listview",
    lastItemSelector = listSelector + " > li:last-child";
      
  function gotPullDownData(e,d) {
    var i,
        $list = $(listSelector);
    for (i=0; i<3; i+=1) {
      $list.prepend("<li>Pulldown-generated row " + (++pullDownGeneratedCount) + "</li>");
      }
    $list.listview("refresh");
    d.iscrollview.refresh();
    }

  function gotPullUpData(e,d) {
    var i,
        $list = $(listSelector);
    for (i=0; i<3; i+=1) {
      $list.append("<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>");
      }
    $list.listview("refresh");          
    d.iscrollview.refresh(
      null, 
      function() { $list.listview("refresh"); },
      function() {d.iscrollview.scrollToElement(lastItemSelector, 400);} );
    }
  
  function onPullDown (e,d) { setTimeout(function() { gotPullDownData(e,d); }, 1500); }   
  function onPullUp (e,d)   { setTimeout(function() { gotPullUpData(e,d);   }, 1500); }   
  
  $(document).delegate("div.short-pull-demo-page", "pageinit", function(e) {
      $(".iscroll-wrapper", this).bind( {
      "iscroll_onpulldown" : onPullDown,
      "iscroll_onpullup"   : onPullUp
      });
    });  

  }(jQuery));
