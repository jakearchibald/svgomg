var utils = require('../utils');
var prism = new (require('../prism'));

class CodeOutput {
  constructor() {
    this.container = utils.strToEl(
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

module.exports = CodeOutput;