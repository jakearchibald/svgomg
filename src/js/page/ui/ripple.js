import { strToEl } from '../utils.js';

export default class Ripple {
  constructor() {
    this.container = strToEl('<span class="ripple"></span>');
  }

  animate() {
    this.container.classList.remove('animate');
    this.container.offsetLeft;
    this.container.classList.add('animate');
  }
}
