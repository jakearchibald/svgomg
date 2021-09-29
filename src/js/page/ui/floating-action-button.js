import { strToEl } from '../utils';
import Ripple from './ripple';
import Spinner from './spinner';

export default class FloatingActionButton {
  constructor({ title, href, iconSvg, classList, major = false }) {
    this.container = strToEl(
      (href ? '<a>' : '<div role="button" tabindex="0">') +
        iconSvg +
      (href ? '</a>' : '</div>') +
    '');

    if (href) {
      this.container.href = href;
    }
    if (title) {
      this.container.setAttribute('title', title);
    }
    this.container.classList.add(major ? 'floating-action-button' : 'minor-floating-action-button');
    if (classList) {
      classList.forEach((className) => { this.container.classList.add(className); });
    }

    this._ripple = new Ripple();
    this.container.appendChild(this._ripple.container);

    this._spinner = new Spinner();
    this.container.appendChild(this._spinner.container);

    this.container.addEventListener('click', () => this.onClick());
  }

  onClick() {
    this._ripple.animate();
  }

  working() {
    this._spinner.show(500);
  }

  done() {
    this._spinner.hide();
  }
}
