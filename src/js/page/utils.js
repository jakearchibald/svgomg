exports.defaults = function defaults(opts, defaultOpts) {
  var r = {};

  for (var key in defaultOpts) if (defaultOpts.hasOwnProperty(key)) {
    r[key] = defaultOpts[key];
  }

  if (!opts) { return r; }

  for (key in opts) if (opts.hasOwnProperty(key)) {
    r[key] = opts[key];
  }

  return r;
};

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

exports.setTransform = function setTransform(el, val) {
  el.style.WebkitTransform = el.style.transform = val;
};

exports.objToUrlParams = function objToUrlParams(obj) {
  return Object.keys(obj).reduce(function(str, key, i) {
    if (i) {
      str += '&';
    }
    str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    return str;
  }, '');
};


var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

exports.escapeHTML = function escapeHTML(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
};