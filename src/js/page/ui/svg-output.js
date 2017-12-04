import { domReady, strToEl } from '../utils';
import PanZoom from './pan-zoom';

export default class SvgOutput {
  constructor() {
    this.container = strToEl(
      '<div class="svg-output">' +
        '<div class="svg-container">' +
          '<iframe class="svg-frame" sandbox="allow-scripts"></iframe>' +
        '</div>' +
        // Stop touches going into the iframe.
        // pointer-events + touch + iframe doesn't work in Chrome :(
        '<div class="svg-clickjacker"></div>' +
      '</div>' +
    '');


    this._svgFrame = this.container.querySelector('.svg-frame');
    this._svgFrame.scrolling = 'no';

    this._svgContainer = this.container.querySelector('.svg-container');

    domReady.then(() => {
      this._panZoom = new PanZoom(this._svgContainer, {
        eventArea: this.container
      });
    });
  }

  setSvg(svgFile) {
    // I would rather use blob urls, but they don't work in Firefox
    // All the internal refs break.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1125667
    const nextLoad = this._nextLoadPromise();
    this._svgFrame.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgFile.text);
    this._svgFrame.width = svgFile.width;
    this._svgFrame.height = svgFile.height;
    return nextLoad;
  }

  reset() {
    this._svgFrame.src = "about:blank";
    this._panZoom.reset();
  }

  _nextLoadPromise() {
    return new Promise(resolve => {
      const onload = () => {
        this._svgFrame.removeEventListener('load', onload);
        resolve();
      }
      this._svgFrame.addEventListener('load', onload);
    });
  }
}
