import { strToEl } from '../utils';
import Prism from '../prism';
const prism = new Prism();

export default class CodeOutput {
  constructor() {
    this.container = strToEl(
      '<div class="code-output">' +
        '<pre><code></code></pre>' +
      '</div>' +
    '');
    this._codeEl = this.container.querySelector('code');
  }

  async setSvg(svgFile) {
    this._codeEl.innerHTML = await prism.highlight(svgFile.text);
  }

  reset() {
    this._codeEl.innerHTML = '';
  }
}
