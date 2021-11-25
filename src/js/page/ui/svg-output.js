import { domReady, strToEl } from '../utils.js';
import PanZoom from './pan-zoom.js';

export default class SvgOutput {
  constructor() {
    // prettier-ignore
    this.container = strToEl(
      '<div class="svg-output">' +
        '<div class="svg-container">' +
          '<iframe class="svg-frame" sandbox="allow-scripts" scrolling="no" title="Loaded SVG file"></iframe>' +
        '</div>' +
      '</div>'
    );

    this._svgFrame = this.container.querySelector('.svg-frame');
    this._svgContainer = this.container.querySelector('.svg-container');

    domReady.then(() => {
      this._panZoom = new PanZoom(this._svgContainer, {
        eventArea: this.container,
      });
    });
  }

  setSvg({ text, width, height }) {
    // TODO: revisit this
    // I would rather use blob urls, but they don't work in Firefox
    // All the internal refs break.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1125667
    const nextLoad = this._nextLoadPromise();
    this._svgFrame.src = `data:image/svg+xml,${encodeURIComponent(text)}`;
    this._svgFrame.style.width = `${width}px`;
    this._svgFrame.style.height = `${height}px`;
    return nextLoad;
  }

  reset() {
    this._svgFrame.src = 'about:blank';
    this._panZoom.reset();
  }

  _nextLoadPromise() {
    return new Promise((resolve) => {
      const onload = () => {
        this._svgFrame.removeEventListener('load', onload);
        resolve();
      };

      this._svgFrame.addEventListener('load', onload);
    });
  }
}
