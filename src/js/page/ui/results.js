var utils = require('../utils');

function round(num, places) {
  var mult = Math.pow(10, places);
  return Math.floor(Math.round(num * mult)) / mult;
}

function humanSize(bytes) { // TODO: I'm sure there's a better version of this
  if (bytes < 1024) {
    return bytes + ' bytes';
  }
  else {
    return round(bytes / 1024, 2) + 'k';
  }
}

class Results {
  constructor() {
    this.container = utils.strToEl(`
      <div class="results">
        <span class="size"></span>
        <span class="diff"></span>
      </div>
    `);
    this._sizeEl = this.container.querySelector('.size');
    this._diffEl = this.container.querySelector('.diff');
  }

  update(originalSize, finalSize) {
    this._sizeEl.textContent = humanSize(finalSize);

    if (!finalSize) {
      this._diffEl.textContent = '';
    }
    else if (finalSize == originalSize) {
      this._diffEl.textContent = 'no change';
    }
    else if (finalSize > originalSize) {
      this._diffEl.textContent = round(finalSize / originalSize * 100 - 100, 2) + '% increase';
    }
    else {
      this._diffEl.textContent = round(100 - finalSize / originalSize * 100, 2) + '% saving';
    }
  }

  working() {
    this._sizeEl.textContent = 'Working…';
    this._diffEl.textContent = '';
  }
}

module.exports = Results;