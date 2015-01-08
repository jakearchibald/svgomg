"use strict";

/*exports.defaults = function defaults(opts, defaultOpts) {
  var r = {};

  for (var key in defaultOpts) if (defaultOpts.hasOwnProperty(key)) {
    r[key] = defaultOpts[key];
  }

  if (!opts) { return r; }

  for (key in opts) if (opts.hasOwnProperty(key)) {
    r[key] = opts[key];
  }

  return r;
};*/

exports.toArray = function toArray(obj) {
  return Array.prototype.slice.apply(obj);
};

exports.domReady = new Promise(function(resolve) {
  function checkState() {
    if (document.readyState != 'loading') {
      resolve();
    }
  }
  document.addEventListener('readystatechange', checkState);
  checkState();
});

exports.get = function get(url) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    
    req.send();
  });
}

exports.strToEl = (function () {
  var tmpEl = document.createElement('div');
  return function (str) {
    var r;
    tmpEl.innerHTML = str;
    r = tmpEl.children[0];
    tmpEl.innerHTML = '';
    return r;
  };
}());

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

exports.escapeHtml = function escapeHTML(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
};

exports.escapeHtmlTag = function(strings, ...values) {
  values = values.map(exports.escapeHtml);
  return strings.reduce((str, val, i) => str += val + (values[i] || ''), '');
};

exports.readFileAsText = function readFileAsText(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onerror = function() {
      reject(reader.error);
    };
    reader.onload = function() {
      resolve(reader.result);
    };
  });
}

exports.transitionToClass = function(el, className) {
  return new Promise(resolve => {
    var listener = event => {
      if (event.target != el) return;
      el.removeEventListener('webkitTransitionEnd', listener);
      el.removeEventListener('transitionend', listener);
      resolve();
    };
    el.addEventListener('webkitTransitionEnd', listener);
    el.addEventListener('transitionend', listener);
    el.classList.add(className);
  })
};