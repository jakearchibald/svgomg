import { strToEl } from '../utils';

export default class Ripple {
  constructor() {
    this.container = strToEl('<div class="ripple"></div>');
  }

  animate() {
    this.container.classList.remove('animate');
    this.container.offsetLeft;
    this.container.classList.add('animate');
  }
}
