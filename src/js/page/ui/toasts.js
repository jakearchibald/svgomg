import { strToEl, transitionToClass } from '../utils.js';

class Toast {
  constructor(message, duration, buttons, isError) {
    this.container = strToEl(
      '<div class="toast"><div class="toast-content"></div></div>',
    );
    const content = this.container.querySelector('.toast-content');
    this._answerResolve = null;
    this._hideTimeout = null;

    if (isError) {
      content.insertAdjacentHTML('afterbegin', '<pre><code></code></pre>');
      content.querySelector('code').textContent = message;
    } else {
      content.textContent = message;
    }

    this.answer = new Promise((resolve) => {
      this._answerResolve = resolve;
    });

    for (const button of buttons) {
      const buttonElement = document.createElement('button');
      buttonElement.className = 'unbutton';
      buttonElement.textContent = button;
      buttonElement.type = 'button';
      buttonElement.addEventListener('click', () => {
        this._answerResolve(button);
      });
      this.container.append(buttonElement);
    }

    if (duration) {
      this._hideTimeout = setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    clearTimeout(this._hideTimeout);
    this._answerResolve();
    return transitionToClass(this.container, 'hide');
  }
}

export default class Toasts {
  constructor() {
    this.container = strToEl('<div class="toasts"></div>');
  }

  show(message, { duration = 0, buttons = ['dismiss'], isError = false } = {}) {
    const toast = new Toast(message, duration, buttons, isError);
    this.container.append(toast.container);

    toast.answer
      .then(() => toast.hide())
      .then(() => {
        toast.container.remove();
      });

    return toast;
  }
}
