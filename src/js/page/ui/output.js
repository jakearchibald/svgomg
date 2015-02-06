var utils = require('../utils');

class Output {
  constructor() {
    this.container = utils.strToEl(
      '<div class="output-switcher"></div>' +
    '');
    this._svgOutput = new (require('./svg-output'));
    this._codeOutput = new (require('./code-output'));
    this.container.appendChild(this._svgOutput.container);
  }

  update(svgFile) {
    return this._svgOutput.setSvg(svgFile);
  }

  reset() {
    this._svgOutput.reset();
  }
}

module.exports = Output;