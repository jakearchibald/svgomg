var utils = require('../utils');

function getXYFromEvent(event) {
  if (event.touches) {
    return {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY
    };
  }
  else {
    return {
      x: event.pageX,
      y: event.pageY
    };
  }
}

class SvgOutput {
  constructor() {
    // IE doesn't support datauris or blob urls in iframe :(
    // TODO: feature detect this & report bug
    var frameHtml = utils.isIe ?
      '<img class="svg-frame">' :
      '<iframe class="svg-frame" sandbox="allow-scripts"></iframe>';

    this.container = utils.strToEl(
      '<div class="svg-output">' +
        '<div class="svg-container">' +
          frameHtml +
          // Stop touches going into the iframe.
          // pointer-events + touch + iframe doesn't work in Chrome :(
          '<div class="svg-clickjacker"></div>' +
        '</div>' +
      '</div>' +
    '');

    this._svgFrame = this.container.querySelector('.svg-frame');
    this._svgContainer = this.container.querySelector('.svg-container');
    this._dx = 0;
    this._dy = 0;

    utils.domReady.then(_ => {
      var main = document.querySelector('.main');
      main.addEventListener('mousedown', e => this._onPointerDown(e));
      main.addEventListener('touchstart', e => this._onPointerDown(e));
    });
  }

  _onPointerDown(event) {
    if (utils.closest(event.target, '.settings, a')) return;

    event.preventDefault();

    var mouseStart = getXYFromEvent(event);
    var startDx = this._dx;
    var startDy = this._dy;

    var pointerMove = event => {
      event.preventDefault();
      var {x, y} = getXYFromEvent(event);

      this._dx = x - mouseStart.x + startDx;
      this._dy = y - mouseStart.y + startDy;
      this._svgContainer.style.WebkitTransform = this._svgContainer.style.transform
        = 'translate3d(' + this._dx + 'px, ' + this._dy + 'px, 0)';
    };

    var pointerUp = event => {
      event.preventDefault();
      document.removeEventListener('mousemove', pointerMove);
      document.removeEventListener('mouseup', pointerUp);
      document.removeEventListener('touchmove', pointerMove);
      document.removeEventListener('touchend', pointerUp);
    };

    document.addEventListener('mousemove', pointerMove);
    document.addEventListener('mouseup', pointerUp);
    document.addEventListener('touchmove', pointerMove);
    document.addEventListener('touchend', pointerUp);
  }

  setSvg(svgFile) {
    // I would rather use blob urls, but they don't work in Firefox
    // All the internal refs break.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1125667
    var nextLoad = this._nextLoadPromise();
    this._svgFrame.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgFile.text);
    this._svgFrame.width = svgFile.width;
    this._svgFrame.height = svgFile.height;
    return nextLoad;
  }

  _nextLoadPromise() {
    return new Promise(resolve => {
      var onload = _ => {
        this._svgFrame.removeEventListener('load', onload);
        resolve();
      }
      this._svgFrame.addEventListener('load', onload);
    });
  }
  
  activate() {
    return utils.transitionToClass(this.container);
  }
}

module.exports = SvgOutput;