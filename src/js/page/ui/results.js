import { strToEl } from '../utils';

function round(num, places) {
  const mult = Math.pow(10, places);
  return Math.floor(Math.round(num * mult)) / mult;
}

function humanSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' bytes';
  }
  else {
    return round(bytes / 1024, 2) + 'k';
  }
}

export default class Results {
  constructor() {
    this.container = strToEl(
      '<div class="results">' +
        '<span class="size"></span>' +
        '<span class="diff"></span>' +
      '</div>' +
    '');

    this._sizeEl = this.container.querySelector('.size');
    this._diffEl = this.container.querySelector('.diff');
  }

  update({ size, comparisonSize }) {
    this._sizeEl.textContent = humanSize(size);

    // just displaying a single size?
    if (!comparisonSize) {
      this._diffEl.textContent = '';
      return;
    }
    else if (size == comparisonSize) {
      this._diffEl.textContent = ' - no change';
    }
    else if (size > comparisonSize) {
      this._diffEl.textContent = ' - ' + round(size / comparisonSize * 100 - 100, 2) + '% increase';
    }
    else {
      this._diffEl.textContent = ' - ' + round(100 - size / comparisonSize * 100, 2) + '% saving';
    }
  }
}
