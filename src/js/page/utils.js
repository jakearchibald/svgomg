"use strict";

export const domReady = new Promise(resolve => {
  function checkState() {
    if (document.readyState != 'loading') resolve();
  }
  document.addEventListener('readystatechange', checkState);
  checkState();
});

const range = document.createRange();
range.selectNode(document.documentElement);

export function strToEl(str) {
  const frag = range.createContextualFragment(str);
  return frag.children[0];
}

const entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

export function escapeHTML(str) {
  return String(str).replace(/[&<>"'\/]/g, s => entityMap[s]);
}

export function escapeHtmlTag(strings, ...values) {
  values = values.map(s => escapeHTML(s));
  return strings.reduce((str, val, i) => str += val + (values[i] || ''), '');
};

export function readFileAsText(file) {
  return new Response(file).text();
};

export function handleFileInput(files) {
  const filesArray = Array.from(files);
  return Promise.all(
    filesArray.map(async file => {
      if (!file) {
        return null;
      }
      return {
        data: await readFileAsText(file),
        filename: file.name
      };
    }).filter(itemPromise => !!itemPromise)
  );
};

function transitionClassFunc({removeClass = false}={}) {
  return function(el, className = 'active', transitionClass = 'transition') {
    if (removeClass) {
      if (!el.classList.contains(className)) return Promise.resolve();
    }
    else {
      if (el.classList.contains(className)) return Promise.resolve();
    }

    return new Promise(resolve => {
      const listener = event => {
        if (event.target != el) return;
        el.removeEventListener('webkitTransitionEnd', listener);
        el.removeEventListener('transitionend', listener);
        el.classList.remove(transitionClass);
        resolve();
      };

      el.classList.add(transitionClass);

      requestAnimationFrame(() => {
        el.addEventListener('webkitTransitionEnd', listener);
        el.addEventListener('transitionend', listener);
        el.classList[removeClass ? 'remove' : 'add'](className);
      });
    });
  }
}

export const transitionToClass = transitionClassFunc();
export const transitionFromClass = transitionClassFunc({removeClass: true});

export function loadCss(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;

    link.addEventListener('load', () => resolve());
    link.addEventListener('error', () => reject());

    document.head.appendChild(link);
  });
};

export function trackFocusMethod() {
  var focusMethod = 'mouse';

  document.body.addEventListener('focus', event => {
    event.target.classList.add(focusMethod == 'key' ? 'key-focused' : 'mouse-focused');
  }, true);

  document.body.addEventListener('blur', event => {
    event.target.classList.remove('key-focused');
    event.target.classList.remove('mouse-focused');
  }, true);

  document.body.addEventListener('keydown', () => {
    focusMethod = 'key';
  }, true);

  document.body.addEventListener('mousedown', () => {
    focusMethod = 'mouse';
  }, true);
};

export function fetchText(request) {
  return fetch(request).then(r => r.text());
}
