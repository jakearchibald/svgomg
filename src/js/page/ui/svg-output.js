var utils = require('../utils');

class SvgOutput {
  constructor() {
    if (utils.isIe) {
      // IE doesn't support blob URLs in iframes.
      // Using img works around it, but means scripting doesn't work.
      this.container = utils.strToEl(
        '<div class="svg-output">' +
          '<img class="svg-container">' +
        '</div>' +
      '');
    }
    else {
      this.container = utils.strToEl(
        '<div class="svg-output">' +
          '<iframe class="svg-container" sandbox="allow-scripts"></iframe>' +
        '</div>' +
      '');
    }

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
  
  activate() {
    return utils.transitionToClass(this.container);
  }
}

module.exports = SvgOutput;