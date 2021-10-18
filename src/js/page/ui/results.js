import { strToEl } from '../utils.js';

function round(num, places) {
  const mult = 10 ** places;
  return Math.floor(Math.round(num * mult)) / mult;
}

function humanSize(bytes) {
  return bytes < 1024 ? `${bytes} bytes` : `${round(bytes / 1024, 2)}k`;
}

export default class Results {
  constructor() {
    // prettier-ignore
    this.container = strToEl(
      '<div class="results">' +
        '<span class="size"></span> ' +
        '<span class="diff"></span>' +
      '</div>'
    );

    this._sizeEl = this.container.querySelector('.size');
    this._diffEl = this.container.querySelector('.diff');
  }

  update({ size, comparisonSize }) {
    this._sizeEl.textContent = comparisonSize
      ? `${humanSize(comparisonSize)} → ${humanSize(size)}`
      : humanSize(size);

    this._diffEl.classList.remove('decrease', 'increase');

    // just displaying a single size?
    if (!comparisonSize) {
      this._diffEl.textContent = '';
    } else if (size === comparisonSize) {
      this._diffEl.textContent = '100%';
    } else {
      this._diffEl.textContent = `${round((size / comparisonSize) * 100, 2)}%`;
      this._diffEl.classList.add(
        size > comparisonSize ? 'increase' : 'decrease',
      );
    }
  }
}
