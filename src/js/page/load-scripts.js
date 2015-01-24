"use strict";

// This is in its own file rather than utils.js because it's used for loading polyfills,
// and promises, is one of the things that gets polyfilled, hence the callbacks
module.exports = function loadScript(urls, yeyCallback, neyCallback) {
  var count = urls.length;
  var errored = false;

  if (urls.length == 0) return yeyCallback();

  urls.forEach(url => {
    var script = document.createElement('script');
    script.onload = function() {
      if (errored) return;
      if (!--count) yeyCallback();
    };
    script.onerror = function() {
      if (errored) return;
      neyCallback();
      errored = true;
    };
    script.src = url;
    document.head.insertBefore(script, document.head.firstChild);
  });
};