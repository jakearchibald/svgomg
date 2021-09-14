import { strToEl } from '../utils';

export default class MaterialSlider {
  constructor(rangeEl) {
    this.container = strToEl(`
      <div class="material-slider">
        <div class="track">
          <div class="track-on"></div>
          <div class="handle">
            <div class="arrow"></div>
            <div class="val"></div>
          </div>
        </div>
      </div>
    `);

    this.range = rangeEl;
    this._handle = this.container.querySelector('.handle');
    this._trackOn = this.container.querySelector('.track-on');
    this._val = this.container.querySelector('.val');

    rangeEl.parentNode.insertBefore(this.container, rangeEl);
    this.container.insertBefore(rangeEl, this.container.firstChild);

    rangeEl.addEventListener('input', () => this._onInputChange());
    this.range.addEventListener('mousedown', () => this._onRangeMouseDown());
    this.range.addEventListener('touchstart', () => this._onRangeTouchStart());
    this.range.addEventListener('touchend', () => this._onRangeTouchEnd());

    this._setPosition();
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

  set value(newVal) {
    this.range.value = newVal;
    this._update();
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

    this._trackOn.style.width =
      this._handle.style.left = percent * 100 + "%";

    this._val.textContent = value;
  }
}
