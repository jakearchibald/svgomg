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
        '<table>' +
          '<tbody>' +
            '<tr class="results-selected">' +
              '<th class="results-label">This file: </td>' +
              '<td class="results-size-selected"></td>' +
              '<td class="results-diff-selected"></td>' +
            '</tr>' +
            '<tr class="results-total">' +
              '<th class="results-label">All files: </td>' +
              '<td class="results-size-total"></td>' +
              '<td class="results-diff-total"></td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
    '');

    this._selectedEl = this.container.querySelector('.results-selected');
    this._sizeSelectedEl = this.container.querySelector('.results-size-selected');
    this._diffSelectedEl = this.container.querySelector('.results-diff-selected');

    this._totalEl = this.container.querySelector('.results-total');
    this._labelTotalEl = this._totalEl.querySelector('.results-label');
    this._sizeTotalEl = this.container.querySelector('.results-size-total');
    this._diffTotalEl = this.container.querySelector('.results-diff-total');
  }

  update({sizeTotal, compareToSizeTotal, sizeSelected, compareToSizeSelected}) {
    this._updateEl({ size: sizeSelected, compareToSize: compareToSizeSelected, sizeEl: this._sizeSelectedEl, diffEl: this._diffSelectedEl });
    this._updateEl({ size: sizeTotal, compareToSize: compareToSizeTotal, sizeEl: this._sizeTotalEl, diffEl: this._diffTotalEl });
    const selectedDisplay = (sizeSelected === sizeTotal && compareToSizeSelected === compareToSizeTotal ? 'none' : '');
    this._selectedEl.style.display = selectedDisplay;
    this._labelTotalEl.style.display = selectedDisplay;
  }

  _updateEl({size, compareToSize, sizeEl, diffEl}) {
    sizeEl.textContent = humanSize(size);

    // just displaying a single size?
    if (!compareToSize) {
      diffEl.textContent = '';
    }
    else if (size == compareToSize) {
      diffEl.textContent = ' – no change';
    }
    else if (size > compareToSize) {
      diffEl.textContent = ' – ' + round(size / compareToSize * 100 - 100, 2) + '% increase';
    }
    else {
      diffEl.textContent = ' – ' + round(100 - size / compareToSize * 100, 2) + '% saving';
    }
  }
}
