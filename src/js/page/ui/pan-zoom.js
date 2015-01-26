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

class PanZoom {
  constructor(target, {
    eventArea = target,
    shouldCaptureFunc = function(el){ return true; }
  }={}) {
    this._target = target;
    this._shouldCaptureFunc = shouldCaptureFunc;
    this._dx = 0;
    this._dy = 0;
    this._active = false;
    this._pointerStart = null;
    this._dStart = null;

    // bind
    [
      '_onPointerDown',
      '_onPointerMove',
      '_onPointerUp'
    ].forEach(funcName => {
      this[funcName] = this[funcName].bind(this);
    })

    eventArea.addEventListener('mousedown', this._onPointerDown);
    eventArea.addEventListener('touchstart', this._onPointerDown);
  }

  _onFirstPointerDown(event) {
    this._active = true;
    this._pointerStart = getXYFromEvent(event);
    this._dStart = {
      x: this._dx,
      y: this._dy
    }

    document.addEventListener('mousemove', this._onPointerMove);
    document.addEventListener('mouseup', this._onPointerUp);
    document.addEventListener('touchmove', this._onPointerMove);
    document.addEventListener('touchend', this._onPointerUp);
  }

  _onPointerDown(event) {
    if (!this._shouldCaptureFunc(event.target)) return;
    event.preventDefault();
    
    if (!this._active) this._onFirstPointerDown(event);
  }

  _onPointerMove(event) {
    event.preventDefault();
    var {x, y} = getXYFromEvent(event);
    this._dx = x - this._pointerStart.x + this._dStart.x;
    this._dy = y - this._pointerStart.y + this._dStart.y;
    this._target.style.WebkitTransform = this._target.style.transform
      = 'translate3d(' + this._dx + 'px, ' + this._dy + 'px, 0)';
  }

  _onPointerUp(event) {
    event.preventDefault();
    document.removeEventListener('mousemove', this._onPointerMove);
    document.removeEventListener('mouseup', this._onPointerUp);
    document.removeEventListener('touchmove', this._onPointerMove);
    document.removeEventListener('touchend', this._onPointerUp);
    this._active = false;
  }
}

module.exports = PanZoom;