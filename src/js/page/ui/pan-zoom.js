var utils = require('../utils');

function getXY(obj) {
  return {
    x: obj.pageX,
    y: obj.pageY
  };
}

function touchDistance(touch1, touch2) {
  var dx = Math.abs(touch2.x - touch1.x);
  var dy = Math.abs(touch2.y - touch1.y);
  return Math.sqrt(dx*dx + dy*dy);
}

function getMidpoint(point1, point2) {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2
  };
}

function getPoints(event) {
  if (event.touches) {
    return Array.prototype.map.call(event.touches, getXY);
  }
  else {
    return [getXY(event)];
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
    this._scale = 1;
    this._active = 0;
    this._lastPoints = [];

    // bind
    [
      '_onPointerDown',
      '_onPointerMove',
      '_onPointerUp'
    ].forEach(funcName => {
      this[funcName] = this[funcName].bind(this);
    })

    // bound events
    eventArea.addEventListener('mousedown', this._onPointerDown);
    eventArea.addEventListener('touchstart', this._onPointerDown);

    // unbonud
    eventArea.addEventListener('wheel', e => this._onWheel(e));
  }

  reset() {
    this._dx = 0;
    this._dy = 0;
    this._scale = 1;
    this._update();
  }

  _onWheel(event) {
    if (!this._shouldCaptureFunc(event.target)) return;
    event.preventDefault();

    var boundingRect = this._target.getBoundingClientRect();
    var delta = event.deltaY;

    if (event.deltaMode === 1) { // 1 is "lines", 0 is "pixels"
      // Firefox uses "lines" when mouse is connected
      delta *= 15;
    }

    // stop mouse wheel producing huge values
    delta = Math.max(Math.min(delta, 60), -60);

    var scaleDiff = (delta / 300) + 1;

    // avoid to-small values
    if (this._scale * scaleDiff < 0.05) return;

    this._scale *= scaleDiff;
    this._dx -= (event.pageX - boundingRect.left) * (scaleDiff - 1);
    this._dy -= (event.pageY - boundingRect.top) * (scaleDiff - 1);
    this._update();
  }

  _onFirstPointerDown(event) {
    document.addEventListener('mousemove', this._onPointerMove);
    document.addEventListener('mouseup', this._onPointerUp);
    document.addEventListener('touchmove', this._onPointerMove);
    document.addEventListener('touchend', this._onPointerUp);
  }

  _onPointerDown(event) {
    if (event.type == 'mousedown' && event.which != 1) return;
    if (!this._shouldCaptureFunc(event.target)) return;
    event.preventDefault();

    this._lastPoints = getPoints(event);
    this._active++;
    
    if (this._active === 1) {
      this._onFirstPointerDown(event);
    }
  }

  _onPointerMove(event) {
    event.preventDefault();
    var points = getPoints(event);
    var averagePoint = points.reduce(getMidpoint);
    var averageLastPoint = this._lastPoints.reduce(getMidpoint);
    var boundingRect = this._target.getBoundingClientRect();

    this._dx += averagePoint.x - averageLastPoint.x;
    this._dy += averagePoint.y - averageLastPoint.y;

    if (points[1]) {
      var scaleDiff = touchDistance(points[0], points[1]) / touchDistance(this._lastPoints[0], this._lastPoints[1]);
      this._scale *= scaleDiff;
      this._dx -= (averagePoint.x - boundingRect.left) * (scaleDiff - 1);
      this._dy -= (averagePoint.y - boundingRect.top) * (scaleDiff - 1);
    }

    this._update();
    this._lastPoints = points;
  }

  _update() {
    this._target.style.WebkitTransform = this._target.style.transform
      = 'translate3d(' + this._dx + 'px, ' + this._dy + 'px, 0) scale(' + this._scale + ')';
  }

  _onPointerUp(event) {
    event.preventDefault();
    this._active--;
    this._lastPoints.pop();

    if (this._active) {
      this._lastPoints = getPoints(event);
      return;
    }

    document.removeEventListener('mousemove', this._onPointerMove);
    document.removeEventListener('mouseup', this._onPointerUp);
    document.removeEventListener('touchmove', this._onPointerMove);
    document.removeEventListener('touchend', this._onPointerUp);
  }
}

module.exports = PanZoom;