var utils = require('../utils');

class SvgOutput {
  constructor() {
    if (utils.isIe) {
      // IE doesn't support datauris or blob urls in iframe :(
      // TODO: feature detect this & report bug
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

  setSvg(svgFile) {
    // I would rather use blob urls, but they don't work in Firefox
    // All the internal refs break.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1125667
    var nextLoad = this._nextLoadPromise();
    this._svgContainer.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgFile.text);
    this._svgContainer.width = svgFile.width;
    this._svgContainer.height = svgFile.height;
    return nextLoad;
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