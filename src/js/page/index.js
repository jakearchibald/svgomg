'use strict';
var loadScripts = require("./load-scripts");
var polyfillsNeeded = [];

if (!window.Promise) { // IE :(
  polyfillsNeeded.push('js/promise-polyfill.js');
}

// I'm sure user-agent sniffing will be fiiiiine
if (/(iPhone|iPad);/.test(navigator.userAgent)) {
  polyfillsNeeded.push('js/fastclick.js');
}

loadScripts(polyfillsNeeded, function() {
  require('babelify/node_modules/babel-core/node_modules/regenerator/runtime');
  new (require('./main-controller'));
}, function() {
  console.error("Failed to load polyfills");
});