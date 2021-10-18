import { strToEl } from '../utils.js';

export default class Ripple {
  constructor() {
    this.container = strToEl('<span class="ripple"></span>');
  }

  animate() {
    this.container.classList.remove('animate');
    this.container.offsetLeft; // eslint-disable-line no-unused-expressions
    this.container.classList.add('animate');
  }
}
