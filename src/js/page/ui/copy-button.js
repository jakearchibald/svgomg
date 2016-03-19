var utils = require('../utils');
var Ripple = require('./ripple');

class CopyButton {
  constructor() {
    this.container = utils.strToEl(
      '<div role="button" tabindex="0" class="minor-floating-action-button">' +
        '<svg viewBox="0 0 24 24" class="icon">' +
          '<title>Copy</title>' +
          '<path d="M16 1H4C3 1 2 2 2 3v14h2V3h12V1zm3 4H8C7 5 6 6 6 7v14c0 1 1 2 2 2h11c1 0 2-1 2-2V7c0-1-1-2-2-2zm0 16H8V7h11v14z"/>' +
        '</svg>' +
      '</div>' +
    '');

    this._ripple = new Ripple();
    this.container.appendChild(this._ripple.container);

    this._svgFile = null;
    this._pre = document.createElement('pre');

    this.container.addEventListener('click', event => this._onClick(event));
  }

  _onClick(event) {
    this._pre.textContent = this._svgFile.text;
    document.body.appendChild(this._pre);
    getSelection().removeAllRanges();
    var range = document.createRange();
    range.selectNode(this._pre);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    getSelection().removeAllRanges();
    document.body.removeChild(this._pre);
    this._ripple.animate();
  }

  setSVG(svgFile) {
    this._svgFile = svgFile;
  }
}

module.exports = CopyButton;
