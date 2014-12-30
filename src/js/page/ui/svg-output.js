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
    return this._nextLoadPromise();
  }

  _nextLoadPromise() {
    return new Promise(resolve => {
      var onload = _ => {
        this._svgContainer.removeEventListener('load', onload);
        resolve();
      }
      this._svgContainer.addEventListener('load', onload);
    });
  }
}

module.exports = SvgOutput;