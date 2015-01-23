var utils = require('../utils');

class Toast {
  constructor(message, duration, buttons) {
    this.container = utils.strToEl(
      '<div class="toast"><div class="toast-content"></div></div>' +
    '');

    this._content = this.container.querySelector('.toast-content');
    this._content.textContent = message;
    this._answerResolve;
    this._hideTimeout;

    this.answer = new Promise(r => this._answerResolve = r);

    buttons.forEach(button => {
      var buttonEl = document.createElement('button');
      buttonEl.className = 'unbutton';
      buttonEl.textContent = button;
      buttonEl.addEventListener('click', event => {
        this._answerResolve(button);
      });
      this.container.appendChild(buttonEl);
    });

    if (duration) {
      this._hideTimeout = setTimeout(_ => this.hide(), duration);
    }
  }

  hide() {
    clearTimeout(this._hideTimeout);
    this._answerResolve();
    return utils.transitionToClass(this.container, 'hide');
  }
}

class Toasts {
  constructor() {
    this.container = utils.strToEl("<div class='toasts'></div>");
  }

  show(message, {
    duration = 0,
    buttons = ['dismiss']
  }={}) {
    var toast = new Toast(message, duration, buttons);
    this.container.appendChild(toast.container);

    toast.answer.then(_ => toast.hide()).then(_ => {
      this.container.removeChild(toast.container);
    });

    return toast;
  }
}

module.exports = Toasts;