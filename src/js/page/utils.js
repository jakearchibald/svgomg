export const domReady = new Promise((resolve) => {
  function checkState() {
    if (document.readyState !== 'loading') resolve();
  }

  document.addEventListener('readystatechange', checkState);
  checkState();
});

const range = document.createRange();
range.selectNode(document.documentElement);

export function strToEl(str) {
  return range.createContextualFragment(String(str)).children[0];
}

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

export function escapeHTML(str) {
  return String(str).replace(/[&<>"'/]/g, (s) => entityMap[s]);
}

export function escapeHtmlTag(strings, ...values) {
  values = values.map((s) => escapeHTML(s));
  return strings.reduce((str, val, i) => str + val + (values[i] || ''), '');
}

export function readFileAsText(file) {
  return new Response(file).text();
}

function transitionClassFunc({ removeClass = false } = {}) {
  return (element, className = 'active', transitionClass = 'transition') => {
    const hasClass = element.classList.contains(className);

    if (removeClass) {
      if (!hasClass) return Promise.resolve();
    } else if (hasClass) {
      return Promise.resolve();
    }

    const transitionEnd = new Promise((resolve) => {
      const listener = (event) => {
        if (event.target !== element) return;
        element.removeEventListener('transitionend', listener);
        element.classList.remove(transitionClass);
        resolve();
      };

      element.classList.add(transitionClass);

      requestAnimationFrame(() => {
        element.addEventListener('transitionend', listener);
        element.classList[removeClass ? 'remove' : 'add'](className);
      });
    });

    const transitionTimeout = new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    return Promise.race([transitionEnd, transitionTimeout]);
  };
}

export const transitionToClass = transitionClassFunc();
export const transitionFromClass = transitionClassFunc({ removeClass: true });

export function trackFocusMethod() {
  let focusMethod = 'mouse';

  document.body.addEventListener(
    'focus',
    (event) => {
      event.target.classList.add(
        focusMethod === 'key' ? 'key-focused' : 'mouse-focused',
      );
    },
    true,
  );

  document.body.addEventListener(
    'blur',
    (event) => {
      event.target.classList.remove('key-focused', 'mouse-focused');
    },
    true,
  );

  document.body.addEventListener(
    'keydown',
    () => {
      focusMethod = 'key';
    },
    true,
  );

  document.body.addEventListener(
    'mousedown',
    () => {
      focusMethod = 'mouse';
    },
    true,
  );
}
