'use strict';
var loadScripts = require("./load-scripts");

function init() {
  require("regenerator/runtime");
  new (require('./main-controller'));
}

if (!window.Promise) { // IE :(
  loadScripts(['js/promise-polyfill.js'], init, function() {
    console.error("Failed to load polyfills");
  });
}
else {
  init();
}
