var utils = require('../utils');

class CodeOutput {
  constructor() {
    this.container = utils.strToEl(
      '<div class="code-output">' +
        '<pre><code></code></pre>' +
      '</div>' +
    '');
    this._codeEl = this.container.querySelector('code');
  }

  setSvg(svgFile) {
    this._codeEl.textContent = svgFile.text;
  }
}

module.exports = CodeOutput;