function getXY(obj) {
  return {
    x: obj.pageX,
    y: obj.pageY,
  };
}

function touchDistance(touch1, touch2) {
  const dx = Math.abs(touch2.x - touch1.x);
  const dy = Math.abs(touch2.y - touch1.y);
  return Math.hypot(dx, dy);
}

function getMidpoint(point1, point2) {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
}

function getPoints(event) {
  return event.touches
    ? [...event.touches].map((touch) => getXY(touch))
    : [getXY(event)];
}

export default class PanZoom {
  constructor(
    target,
    { eventArea = target, shouldCaptureFunc = () => true } = {},
  ) {
    this._target = target;
    this._shouldCaptureFunc = shouldCaptureFunc;
    this._dx = 0;
    this._dy = 0;
    this._scale = 1;
    this._active = 0;
    this._lastPoints = [];

    // TODO: revisit this later
    // Ideally these would use public class fields, but around 1.7% of users
    // are on old Safari versions that don't support them. We should be able
    // to switch over soon.
    this._onPointerDown = (event) => {
      if (event.type === 'mousedown' && event.button !== 0) return;
      if (!this._shouldCaptureFunc(event.target)) return;
      event.preventDefault();

      this._lastPoints = getPoints(event);
      this._active++;

      if (this._active === 1) this._onFirstPointerDown();
    };

    this._onPointerMove = (event) => {
      event.preventDefault();
      const points = getPoints(event);
      /* eslint-disable unicorn/no-array-reduce, unicorn/no-array-callback-reference */
      const averagePoint = points.reduce(getMidpoint);
      const averageLastPoint = this._lastPoints.reduce(getMidpoint);
      /* eslint-enable unicorn/no-array-reduce, unicorn/no-array-callback-reference */
      const { left, top } = this._target.getBoundingClientRect();

      this._dx += averagePoint.x - averageLastPoint.x;
      this._dy += averagePoint.y - averageLastPoint.y;

      if (points[1]) {
        const scaleDiff =
          touchDistance(points[0], points[1]) /
          touchDistance(this._lastPoints[0], this._lastPoints[1]);
        this._scale *= scaleDiff;
        this._dx -= (averagePoint.x - left) * (scaleDiff - 1);
        this._dy -= (averagePoint.y - top) * (scaleDiff - 1);
      }

      this._update();
      this._lastPoints = points;
    };

    this._onPointerUp = (event) => {
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
    };

    // bound events
    eventArea.addEventListener('mousedown', this._onPointerDown);
    eventArea.addEventListener('touchstart', this._onPointerDown);

    // unbound
    eventArea.addEventListener('wheel', (event) => this._onWheel(event));
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

    const { left, top } = this._target.getBoundingClientRect();
    let delta = event.deltaY;

    // 1 is "lines", 0 is "pixels"
    // Firefox uses "lines" when mouse is connected
    if (event.deltaMode === 1) {
      delta *= 15;
    }

    // stop mouse wheel producing huge values
    delta = Math.max(Math.min(delta, 60), -60);

    const scaleDiff = delta / 300 + 1;

    // avoid to-small values
    if (this._scale * scaleDiff < 0.05) return;

    this._scale *= scaleDiff;
    this._dx -= (event.pageX - left) * (scaleDiff - 1);
    this._dy -= (event.pageY - top) * (scaleDiff - 1);
    this._update();
  }

  _onFirstPointerDown() {
    document.addEventListener('mousemove', this._onPointerMove);
    document.addEventListener('mouseup', this._onPointerUp);
    document.addEventListener('touchmove', this._onPointerMove);
    document.addEventListener('touchend', this._onPointerUp);
  }

  _update() {
    this._target.style.transform = `translate3d(${this._dx}px, ${this._dy}px, 0) scale(${this._scale})`;
  }
}
