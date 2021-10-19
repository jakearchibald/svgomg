import { strToEl } from '../utils.js';

export default class MaterialSlider {
  constructor(rangeElement) {
    // prettier-ignore
    this.container = strToEl(
      '<span class="material-slider">' +
        '<span class="track">' +
          '<span class="track-on"></span>' +
          '<span class="handle">' +
            '<span class="arrow"></span>' +
            '<span class="val"></span>' +
          '</span>' +
        '</span>' +
      '</span>'
    );

    this._range = rangeElement;
    this._handle = this.container.querySelector('.handle');
    this._trackOn = this.container.querySelector('.track-on');
    this._val = this.container.querySelector('.val');

    this._range.parentNode.insertBefore(this.container, this._range);
    this.container.insertBefore(this._range, this.container.firstChild);

    this._range.addEventListener('input', () => this._update());
    this._range.addEventListener('mousedown', () => this._onRangeMouseDown());
    this._range.addEventListener('touchstart', () => this._range.focus());
    this._range.addEventListener('touchend', () => this._range.blur());

    this._setPosition();
  }

  // eslint-disable-next-line accessor-pairs
  set value(newValue) {
    this._range.value = newValue;
    this._update();
  }

  _onRangeMouseDown() {
    this._range.classList.add('active');

    const upListener = () => {
      requestAnimationFrame(() => {
        this._range.blur();
      });
      this._range.classList.remove('active');
      document.removeEventListener('mouseup', upListener);
    };

    document.addEventListener('mouseup', upListener);
  }

  _update() {
    requestAnimationFrame(() => this._setPosition());
  }

  _setPosition() {
    const { min, max, value } = this._range;
    const percent = (Number(value) - min) / (max - min);

    this._trackOn.style.width = this._handle.style.left = `${percent * 100}%`;
    this._val.textContent = value;
  }
}
