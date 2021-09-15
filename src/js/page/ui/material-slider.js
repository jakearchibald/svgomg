import { strToEl } from '../utils.js';

export default class MaterialSlider {
  constructor(rangeElement) {
    // prettier-ignore
    this.container = strToEl(
      '<div class="material-slider">' +
        '<div class="track">' +
          '<div class="track-on"></div>' +
          '<div class="handle">' +
            '<div class="arrow"></div>' +
            '<div class="val"></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    this.range = rangeElement;
    this._handle = this.container.querySelector('.handle');
    this._trackOn = this.container.querySelector('.track-on');
    this._val = this.container.querySelector('.val');

    rangeElement.parentNode.insertBefore(this.container, rangeElement);
    this.container.insertBefore(rangeElement, this.container.firstChild);

    rangeElement.addEventListener('input', () => this._onInputChange());
    this.range.addEventListener('mousedown', () => this._onRangeMouseDown());
    this.range.addEventListener('touchstart', () => this._onRangeTouchStart());
    this.range.addEventListener('touchend', () => this._onRangeTouchEnd());

    this._setPosition();
  }

  // eslint-disable-next-line accessor-pairs
  set value(newValue) {
    this.range.value = newValue;
    this._update();
  }

  _onRangeTouchStart() {
    this.range.focus();
  }

  _onRangeTouchEnd() {
    this.range.blur();
  }

  _onRangeMouseDown() {
    this.range.classList.add('active');

    const upListener = () => {
      requestAnimationFrame(() => {
        this.range.blur();
      });
      this.range.classList.remove('active');
      document.removeEventListener('mouseup', upListener);
    };

    document.addEventListener('mouseup', upListener);
  }

  _onInputChange() {
    this._update();
  }

  _update() {
    requestAnimationFrame(() => this._setPosition());
  }

  _setPosition() {
    const { min, max, value } = this.range;
    const percent = (Number(value) - min) / (max - min);

    this._trackOn.style.width = this._handle.style.left = `${percent * 100}%`;
    this._val.textContent = value;
  }
}
