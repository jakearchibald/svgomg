import { strToEl, transitionToClass } from '../utils';

class Toast {
  constructor(message, duration, buttons) {
    this.container = strToEl(
      '<div class="toast"><div class="toast-content"></div></div>' +
    '');

    this._content = this.container.querySelector('.toast-content');
    this._content.textContent = message;
    this._answerResolve = null;
    this._hideTimeout = null;

    this.answer = new Promise(r => this._answerResolve = r);

    buttons.forEach(button => {
      var buttonEl = document.createElement('button');
      buttonEl.className = 'unbutton';
      buttonEl.textContent = button;
      buttonEl.addEventListener('click', () => {
        this._answerResolve(button);
      });
      this.container.appendChild(buttonEl);
    });

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
    this.container = strToEl("<div class='toasts'></div>");
  }

  show(message, {
    duration = 0,
    buttons = ['dismiss']
  }={}) {
    const toast = new Toast(message, duration, buttons);
    this.container.appendChild(toast.container);

    toast.answer.then(() => toast.hide()).then(() => {
      this.container.removeChild(toast.container);
    });

    return toast;
  }
}
