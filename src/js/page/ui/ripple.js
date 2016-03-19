var utils = require('../utils');

class Ripple {
  constructor() {
    this.container = utils.strToEl('<div class="ripple"></div>');
  }

  animate() {
    this.container.classList.remove('animate');
    this.container.offsetLeft;
    this.container.classList.add('animate');
  }
}

module.exports = Ripple;
