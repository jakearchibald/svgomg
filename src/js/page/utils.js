import { createNanoEvents } from 'nanoevents';

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
  return String(str).replace(/[&<>"'/]/g, s => entityMap[s]);
}

export function escapeHtmlTag(strings, ...values) {
  values = values.map(s => escapeHTML(s));
  return strings.reduce((str, val, i) => str += val + (values[i] || ''), '');
}

export function readFileAsText(file) {
  return new Response(file).text();
}

function transitionClassFunc({removeClass = false}={}) {
  return function(el, className = 'active', transitionClass = 'transition') {
    if (removeClass) {
      if (!el.classList.contains(className)) return Promise.resolve();
    }
    else {
      if (el.classList.contains(className)) return Promise.resolve();
    }

    const transitionEnd = new Promise(resolve => {
      const listener = event => {
        if (event.target != el) return;
        el.removeEventListener('transitionend', listener);
        el.classList.remove(transitionClass);
        resolve();
      };

      el.classList.add(transitionClass);

      requestAnimationFrame(() => {
        el.addEventListener('transitionend', listener);
        el.classList[removeClass ? 'remove' : 'add'](className);
      });
    });

    const transitionTimeout = new Promise(resolve => setTimeout(resolve, 1000));

    return Promise.race([transitionEnd, transitionTimeout]);
  };
}

export const transitionToClass = transitionClassFunc();
export const transitionFromClass = transitionClassFunc({removeClass: true});

export function trackFocusMethod() {
  var focusMethod = 'mouse';

  document.body.addEventListener('focus', event => {
    event.target.classList.add(focusMethod == 'key' ? 'key-focused' : 'mouse-focused');
  }, true);

  document.body.addEventListener('blur', event => {
    event.target.classList.remove('key-focused', 'mouse-focused');
  }, true);

  document.body.addEventListener('keydown', () => {
    focusMethod = 'key';
  }, true);

  document.body.addEventListener('mousedown', () => {
    focusMethod = 'mouse';
  }, true);
}
export const copyUtils = {
  _text: '',
  _pre: document.createElement('pre'),
  setCopyText(text) {
    this._text = text;
  },
  copyText() {
    if (!this._text) return false;
  
    this._pre.textContent = this._text;
    document.body.appendChild(this._pre);
    getSelection().removeAllRanges();

    const range = document.createRange();
    range.selectNode(this._pre);

    window.getSelection().addRange(range);

    document.execCommand('copy');
    getSelection().removeAllRanges();
    document.body.removeChild(this._pre);
    
    return true;
  }
};
export const loadUtils = {
  emitter: createNanoEvents(),
  loadClipboardSVG(val) {
    if (val.includes("</svg>")) {
      this.loadSvg(val, "image.svg");
    }
  },
  loadSvg(data, filename) {
    this.emitter.emit("svgDataLoad", {
      data,
      filename,
    });
  },
};
