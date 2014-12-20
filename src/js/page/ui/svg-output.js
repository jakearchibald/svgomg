var utils = require('../utils');

class SvgOutput {
  constructor() {
    this.container = utils.strToEl(`
      <div class="svg-output">
        <div class="svg-container"></div>
      </div>
    `);
    this._svgContainer = this.container.querySelector('.svg-container');
  }

  setSvg(svgStr) {
    this._svgContainer.innerHTML = svgStr;
  }
}

module.exports = SvgOutput;