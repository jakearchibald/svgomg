import { strToEl } from '../utils.js';
import Prism from '../prism.js';

const prism = new Prism();

export default class CodeOutput {
  constructor() {
    // prettier-ignore
    this.container = strToEl(
      '<div class="code-output">' +
        '<pre><code></code></pre>' +
      '</div>'
    );
    this._codeEl = this.container.querySelector('code');
  }

  async setSvg({ text }) {
    this._codeEl.innerHTML = await prism.highlight(text);
  }

  reset() {
    this._codeEl.innerHTML = '';
  }
}
