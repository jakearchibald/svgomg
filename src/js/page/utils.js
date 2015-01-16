"use strict";

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

exports.closest = function(el, selector) {
  if (el.closest) {
    return el.closest(selector);
  }

  var matches = el.matches || el.msMatchesSelector;

  do {
    if (el.nodeType != 1) continue;
    if (matches.call(el, selector)) return el;
  } while (el = el.parentNode);

  return undefined;
};