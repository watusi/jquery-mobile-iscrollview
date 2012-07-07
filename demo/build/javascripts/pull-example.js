/*jslint browser: true, sloppy: true, white: true, nomen: true, plusplus:true, maxerr: 50, indent: 2 */
/*global jQuery:false, iScroll:false */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true,
         undef:true, curly:true, browser:true, jquery:true, indent:2, maxerr:50,
         white:false, nomen:false */

//-------------------------------------------------------
// Pull-Up and Pull-Down callbacks for "Pull" page
//-------------------------------------------------------
(function pullPagePullImplementation($) {
  "use strict";
  var pullDownGeneratedCount = 0,
      pullUpGeneratedCount = 0,
      listSelector = "div.pull-demo-page ul.ui-listview",
      lastItemSelector = listSelector + " > li:last-child";
    
  /* For this example, I prepend three rows to the list with the pull-down, and append
   * 3 rows to the list with the pull-up. This is only to make a clear illustration that the
   * action has been performed. A pull-down or pull-up might prepend, append, replace or modify
   * the list in some other way, modify some other page content, or may not change the page 
   * at all. It just performs whatever action you'd like to perform when the gesture has been 
   * completed by the user.
   */
  function gotPullDownData(event, data) {
    var i,
        newContent = "";        
    for (i=0; i<3; i+=1) {  // Generate some fake new content
      newContent = "<li>Pulldown-generated row " + (++pullDownGeneratedCount) + "</li>" + newContent;
      }
    $(listSelector).prepend(newContent).listview("refresh");  // Prepend new content and refresh listview
    data.iscrollview.refresh();    // Refresh the iscrollview
    }
  
  function gotPullUpData(event, data) {
    var i,
        iscrollview = data.iscrollview,
        newContent = "";
    for (i=0; i<3; i+=1) { 
      newContent += "<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>";
      }
    $(listSelector).append(newContent).listview("refresh");
  
    // The refresh is a bit different for the pull-up, because I want to demonstrate the use
    // of refresh() callbacks. The refresh() function has optional pre and post-refresh callbacks.
    // Here, I use a post-refresh callback to do a timed scroll to the bottom of the list
    // after the new elements are added. The scroller will smoothly scroll to the bottom over
    // a 400mSec period. It's important to use the refresh() callback to insure that the scroll
    // isn't started until the scroller has first been refreshed.
    iscrollview.refresh(null, null,
      $.proxy(function afterRefreshCallback(iscrollview) { 
        this.scrollToElement(lastItemSelector, 400); 
        }, iscrollview) ); 
    }
  
  // This is the callback that is called when the user has completed the pull-down gesture.
  // Your code should initiate retrieving data from a server, local database, etc.
  // Typically, you will call some function like jQuery.ajax() that will make a callback
  // once data has been retrieved.
  //
  // For demo, we just use timeout to simulate the time required to complete the operation.
  function onPullDown (event, data) { 
    setTimeout(function fakeRetrieveDataTimeout() {
      gotPullDownData(event, data);
      }, 
      1500); 
    }    

  // Called when the user completes the pull-up gesture.
  function onPullUp (event, data) { 
    setTimeout(function fakeRetrieveDataTimeout() {
      gotPullUpData(event, data);
      }, 
      1500); 
    }    
  
  // Set-up jQuery event callbacks
  $(document).delegate("div.pull-demo-page", "pageinit", 
    function bindPullPagePullCallbacks(event) {
      $(".iscroll-wrapper", this).bind( {
      iscroll_onpulldown : onPullDown,
      iscroll_onpullup   : onPullUp
      } );
    } );  

  }(jQuery));

//-------------------------------------------------------
// Pull-down and Pull-up callbacks for "Short Pull" page
//-------------------------------------------------------

(function shortPullPagePullImplementation($) { 
  "use strict";
  var pullDownGeneratedCount = 0,
    pullUpGeneratedCount = 0,
    listSelector = "div.short-pull-demo-page ul.ui-listview",
    lastItemSelector = listSelector + " > li:last-child";
      
  function gotPullDownData(event, data) {
    var i,
        newContent = "";
    for (i=0; i<3; i+=1) {
      newContent = "<li>Pulldown-generated row " + (++pullDownGeneratedCount) + "</li>" + newContent;
      }
    $(listSelector).prepend(newContent).listview("refresh");
    data.iscrollview.refresh();
    }

  function gotPullUpData(event, data) {
    var i,
        iscrollview = data.iscrollview,
        newContent = "";
    for (i=0; i<3; i+=1) {
      newContent += "<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>";
      }
    $(listSelector).append(newContent).listview("refresh");  
    iscrollview.refresh(null, null,
      $.proxy(function afterRefreshCallback() { 
        this.scrollToElement(lastItemSelector, 400);
        }, iscrollview) );
    }
  
  function onPullDown (event, data) { 
    setTimeout(function fakeRetrieveDataTimeout() { 
      gotPullDownData(event, data); }, 
      1500); }  
  
  function onPullUp (event, data) { 
    setTimeout(function fakeRetrieveDataTimeout() { 
      gotPullUpData(event, data);   
      }, 1500); }   
  
  $(document).delegate("div.short-pull-demo-page", "pageinit", 
    function bindShortPullPagePullCallbacks(event) {
      $(".iscroll-wrapper", this).bind( {
      iscroll_onpulldown : onPullDown,
      iscroll_onpullup   : onPullUp
      } );
    }); 
 
  }(jQuery));
