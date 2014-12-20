var utils = require('../utils');

class CodeOutput {
  constructor() {
    this.container = utils.strToEl(`
      <div class="code-output">
        <pre><code></code></pre>
      </div>
    `);
    this._codeEl = this.container.querySelector('code');
  }

  setCode(str) {
    this._codeEl.textContent = str;
  }
}

module.exports = CodeOutput;