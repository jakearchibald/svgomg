var utils = require('../utils');

class MaterialSlider {
  constructor(rangeEl) {
    this.container = utils.strToEl(`
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

    // events
    // thanks IE
    var rangeChangeEvent = utils.isIe ? 'change' : 'input';

    rangeEl.addEventListener(rangeChangeEvent, e => this._onInputChange(e));
    this.range.addEventListener('mousedown', e => this._onRangeMouseDown(e));
    this.range.addEventListener('touchstart', e => this._onRangeTouchStart(e));
    this.range.addEventListener('touchend', e => this._onRangeTouchEnd(e));

    this._setPosition();
  }

  _onRangeTouchStart(event) {
    this.range.focus();
  }

  _onRangeTouchEnd(event) {
    this.range.blur();
  }

  _onRangeMouseDown(event) {
    this.range.classList.add('active');

    var upListener = e => {
      // IE requires me to do this. Pah.
      requestAnimationFrame(_ => {
        this.range.blur();
      })
      this.range.classList.remove('active');
      document.removeEventListener('mouseup', upListener);
    }
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
    requestAnimationFrame(_ => this._setPosition());
  }

  _setPosition() {
    var { min, max, value } = this.range;
    var percent = (Number(value) - min) / (max - min);
    this._trackOn.style.width = 
      this._handle.style.left = percent * 100 + "%";

    this._val.textContent = value;
  }
}

module.exports = MaterialSlider;