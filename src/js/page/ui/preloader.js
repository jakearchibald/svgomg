import { domReady, transitionFromClass } from '../utils.js';

export default class Preloader {
  constructor() {
    domReady.then(() => {
      this.container = document.querySelector('.preloader');
      this.activated = this.container.classList.contains('active');
      this.hide();
    });
  }

  async hide() {
    await transitionFromClass(this.container, 'active');
    this.container.style.display = 'none';
  }
}
