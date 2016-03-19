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
};

exports.strToEl = (function () {
  var tmpEl = document.createElement('div');
  return function (str) {
    var r;
    tmpEl.innerHTML = str;
    r = tmpEl.children[0];
    while (tmpEl.firstChild) {
      tmpEl.removeChild(tmpEl.firstChild);
    }
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

function transitionClassFunc({removeClass = false}={}) {
  return function(el, className = 'active', transitionClass = 'transition') {
    if (removeClass) {
      if (!el.classList.contains(className)) return Promise.resolve();
    }
    else {
      if (el.classList.contains(className)) return Promise.resolve();
    }

    return new Promise(resolve => {
      var listener = event => {
        if (event.target != el) return;
        el.removeEventListener('webkitTransitionEnd', listener);
        el.removeEventListener('transitionend', listener);
        el.classList.remove(transitionClass);
        resolve();
      };

      el.classList.add(transitionClass);

      requestAnimationFrame(_ => {
        el.addEventListener('webkitTransitionEnd', listener);
        el.addEventListener('transitionend', listener);
        el.classList[removeClass ? 'remove' : 'add'](className);
      });
    });
  }
}

exports.transitionToClass = transitionClassFunc();
exports.transitionFromClass = transitionClassFunc({removeClass: true});

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

// I hate that I have to do this
exports.isIe = (navigator.userAgent.indexOf('Trident/') !== -1);

exports.loadCss = function(url) {
  return new Promise((resolve, reject) => {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;

    link.addEventListener('load', _ => resolve());
    link.addEventListener('error', _ => reject());

    document.head.appendChild(link);
  });
};

exports.trackFocusMethod = function() {
  var focusMethod = 'mouse';

  document.body.addEventListener('focus', event => {
    event.target.classList.add(focusMethod == 'key' ? 'key-focused' : 'mouse-focused');
  }, true);

  document.body.addEventListener('blur', event => {
    event.target.classList.remove('key-focused');
    event.target.classList.remove('mouse-focused');
  }, true);

  document.body.addEventListener('keydown', event => {
    focusMethod = 'key';
  }, true);

  document.body.addEventListener('mousedown', event => {
    focusMethod = 'mouse';
  }, true);
};
