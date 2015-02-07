var utils = require('../utils');

class Output {
  constructor() {
    this.container = utils.strToEl(
      '<div class="output-switcher"></div>' +
    '');

    this._types = {
      image: new (require('./svg-output')),
      code: new (require('./code-output'))
    };

    this._svgFile = null;
    this.set('image');
  }

  update(svgFile) {
    this._svgFile = svgFile;
    return this._types[this._activeType].setSvg(svgFile);
  }

  reset() {
    this._types[this._activeType].reset();
  }

  set(type) {
    if (this._activeType) {
      this.container.removeChild(this._types[this._activeType].container);
    }

    this._activeType = type;
    this.container.appendChild(this._types[this._activeType].container);

    if (this._svgFile) this.update(this._svgFile);
  }
}

module.exports = Output;