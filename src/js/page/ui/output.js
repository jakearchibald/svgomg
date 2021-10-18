import { strToEl, transitionToClass, transitionFromClass } from '../utils.js';
import SvgOutput from './svg-output.js';
import CodeOutput from './code-output.js';

export default class Output {
  constructor() {
    this.container = strToEl('<div class="output-switcher"></div>');

    this._types = {
      image: new SvgOutput(),
      code: new CodeOutput(),
    };

    this._svgFile = null;
    this._switchQueue = Promise.resolve();
    this.set('image', { noAnimate: true });
  }

  update(svgFile) {
    this._svgFile = svgFile;
    return this._types[this._activeType].setSvg(svgFile);
  }

  reset() {
    this._types[this._activeType].reset();
  }

  set(type, { noAnimate = false } = {}) {
    this._switchQueue = this._switchQueue.then(async () => {
      const toRemove =
        this._activeType && this._types[this._activeType].container;

      this._activeType = type;
      const toAdd = this._types[this._activeType].container;
      this.container.append(toAdd);

      if (this._svgFile) await this.update(this._svgFile);

      if (noAnimate) {
        toAdd.classList.add('active');
        if (toRemove) toRemove.classList.remove('active');
      } else {
        const transitions = [transitionToClass(toAdd)];

        if (toRemove) transitions.push(transitionFromClass(toRemove));

        await Promise.all(transitions);
      }

      if (toRemove) toRemove.remove();
    });

    return this._switchQueue;
  }
}
