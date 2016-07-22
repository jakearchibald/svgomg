var utils = require('../utils');
var Ripple = require('./ripple');

class BgFillButton {
  constructor() {
    this.container = utils.strToEl(
      '<div role="button" tabindex="0" class="fillAB minor-floating-action-button">' +
        '<svg viewBox="0 0 24 24" class="icon">' +
          '<title>Background Fill</title>' +
          '<path d="M21.143 9.667c-.733-1.392-1.914-3.05-3.617-4.753-2.977-2.978-5.478-3.914-6.785-3.914-.414 0-.708.094-.86.246l-1.361 1.36c-1.899-.236-3.42.106-4.294.983-.876.875-1.164 2.159-.792 3.523.492 1.806 2.305 4.049 5.905 5.375.038.323.157.638.405.885.588.588 1.535.586 2.121 0s.588-1.533.002-2.119c-.588-.587-1.537-.588-2.123-.001l-.17.256c-2.031-.765-3.395-1.828-4.232-2.9l3.879-3.875c.496 2.73 6.432 8.676 9.178 9.178l-7.115 7.107c-.234.153-2.798-.316-6.156-3.675-3.393-3.393-3.175-5.271-3.027-5.498l1.859-1.856c-.439-.359-.925-1.103-1.141-1.689l-2.134 2.131c-.445.446-.685 1.064-.685 1.82 0 1.634 1.121 3.915 3.713 6.506 2.764 2.764 5.58 4.243 7.432 4.243.648 0 1.18-.195 1.547-.562l8.086-8.078c.91.874-.778 3.538-.778 4.648 0 1.104.896 1.999 2 1.999 1.105 0 2-.896 2-2 0-3.184-1.425-6.81-2.857-9.34zm-16.209-5.371c.527-.53 1.471-.791 2.656-.761l-3.209 3.206c-.236-.978-.049-1.845.553-2.445zm9.292 4.079l-.03-.029c-1.292-1.292-3.803-4.356-3.096-5.063.715-.715 3.488 1.521 5.062 3.096.862.862 2.088 2.247 2.937 3.458-1.717-1.074-3.491-1.469-4.873-1.462z"/>' +
        '</svg>' +
      '</div>' +
    '');

    this._ripple = new Ripple();
    this.container.appendChild(this._ripple.container);

    this.container.addEventListener('click', event => this._onClick(event));
  }

  _onClick(event) {
    // event adds a background color
    if (this.container.classList.contains('active')) {
      this.container.classList.remove('active');
      this.setColor('transparent');
    } else {
      this.container.classList.add('active');
      this.setColor('#f444fe');
    }
    this._ripple.animate();
  }

  setColor(color) {
    document.documentElement.style.backgroundColor = color;
  }
}

module.exports = BgFillButton;
