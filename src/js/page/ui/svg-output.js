var utils = require('../utils');

class SvgOutput {
  constructor() {
    this.container = utils.strToEl(`
      <div class="svg-output">
        <iframe class="svg-container" sandbox="allow-scripts"></iframe>
      </div>
    `);
    this._svgContainer = this.container.querySelector('.svg-container');
  }

  setSvg(url, width, height) {
    this._svgContainer.src = url;
    this._svgContainer.width = width;
    this._svgContainer.height = height;
  }
}

module.exports = SvgOutput;