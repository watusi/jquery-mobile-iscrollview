// Hack to remove annoying "layerX/Y is deprecated" messages when using jQuery 1.6.4
// This has been fixed in jQuery 1.7.2 and later
// See: http://stackoverflow.com/questions/7825448/webkit-issues-with-event-layerx-and-event-layery
//
// The demo loads this file only for the JQuery Mobile 1.1/jQuery 1.6.4 build
//
// This modifies a list of property names inside of jQuery. These are the event properties
// that jQuery copies when it normalizes events. Referencing layerX and layerY generates
// warning messages in some WebKit browsers. By removing their names from this list,
// jQuery will not copy these properties, and thus will not generate the warning messages
// on the console.
//
// Starting with jQuery 1.7.2, layerX and layerY are no longer copied.

(function(){
    // remove layerX and layerY
    var all = $.event.props,
        len = all.length,
        res = [];
    while (len--) {
      var el = all[len];
      if (el != "layerX" && el != "layerY") res.push(el);
    }
    $.event.props = res;
}());
