var utils = require('../utils');

class Preloader {
  constructor() {
    utils.domReady.then(_ => {
      this.container = document.querySelector('.preloader');
      this.activated = this.container.classList.contains('active');
      this.hide();
    });
  }

  async hide() {
    await utils.transitionFromClass(this.container, 'active');
    this.container.style.display = 'none';
  }
}

module.exports = Preloader;