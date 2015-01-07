var utils = require('../utils');

class Spinner {
  constructor() {
    this.container = utils.strToEl(
      '<div class="spinner">' +
        '<div class="spinner-container">' +
          '<div class="spinner-layer">' +
            '<div class="circle-clipper left">' +
              '<div class="circle"></div>' +
            '</div>' +
            '<div class="gap-patch">' +
              '<div class="circle"></div>' +
            '</div>' +
            '<div class="circle-clipper right">' +
              '<div class="circle"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '');

    this._showTimeout = null;
    this.container.style.display = 'none';

    var animEndListener = event => {
      if (event.target == this.container) {
        this.container.style.display = 'none';
      }
    };

    this.container.addEventListener('webkitAnimationEnd', animEndListener);
    this.container.addEventListener('animationend', animEndListener);
  }

  show(delay = 300) {
    clearTimeout(this._showTimeout);
    this.container.style.display = 'none';
    this.container.classList.remove('cooldown');
    this._showTimeout = setTimeout(_ => {
      this.container.style.display = '';
    }, delay);
  }

  hide() {
    clearTimeout(this._showTimeout);
    this.container.classList.add('cooldown');
  }
}

module.exports = Spinner;