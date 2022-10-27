import { strToEl } from '../utils.js';
import Ripple from './ripple.js';

export default class FloatingActionButton {
  constructor({ title, href, iconSvg, major = false }) {
    // prettier-ignore
    this.container = strToEl(
      (href ? '<a>' : '<button class="unbutton" type="button">') +
        iconSvg +
      (href ? '</a>' : '</button>')
    );

    const classes = ['floating-action-button'];

    if (href) this.container.href = href;
    if (title) this.container.setAttribute('title', title);
    if (major) classes.push('major-floating-action-button');

    this.container.classList.add(...classes);

    this._ripple = new Ripple();
    this.container.append(this._ripple.container);
    this.container.addEventListener('click', () => this.onClick());
  }

  onClick() {
    this._ripple.animate();
  }
}
