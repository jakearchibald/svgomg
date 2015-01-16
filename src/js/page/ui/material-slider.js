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
    rangeEl.addEventListener('input', e => this._onInputChange(e));
    this.container.addEventListener('mousedown', e => this._onMouseDown(e));

    this._setPosition();
  }

  _onMouseDown(event) {
    var upListener = e => {
      this.range.blur();
      document.removeEventListener('mouseup', upListener);
    }
    document.addEventListener('mouseup', upListener);
  }

  _onInputChange(event) {
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