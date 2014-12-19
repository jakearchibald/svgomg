var utils = require('../utils');

function CodeOutput() {
  this.container = utils.strToEl('<div class="code-output"><pre><code></code></pre></div>');
  this._codeEl = this.container.querySelector('code');
}

var CodeOutputProto = CodeOutput.prototype;

CodeOutputProto.setCode = function(str) {
  this._codeEl.textContent = str;
};

module.exports = CodeOutput;