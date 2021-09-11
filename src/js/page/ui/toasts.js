import { strToEl, transitionToClass } from '../utils.js';

class Toast {
  constructor(message, duration, buttons) {
    this.container = strToEl(String('<div class="toast"><div class="toast-content"></div></div>'));

    const content = this.container.querySelector('.toast-content');
    content.textContent = message;

    this._answerResolve = null;
    this._hideTimeout = null;

    this.answer = new Promise(resolve => {
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

  show(message, { duration = 0, buttons = ['dismiss'] } = {}) {
    const toast = new Toast(message, duration, buttons);
    this.container.append(toast.container);

    toast.answer.then(() => toast.hide()).then(() => {
      toast.container.remove();
    });

    return toast;
  }
}
