var utils = require('../utils');

function SvgOutput() {
  this.container = utils.strToEl('<div class="download-button"></div>');
  this._downloadLink = utils.strToEl('<a>Download</a>');

  this.container.appendChild(this._downloadLink);
}

var SvgOutputProto = SvgOutput.prototype;

SvgOutputProto.setDownload = function(filename, content) {
  this._downloadLink.download = filename;

  if (this._downloadLink.href) {
    URL.revokeObjectURL(this._downloadLink.href);
  }

  this._downloadLink.href = URL.createObjectURL(
    new Blob([content], {type: "image/svg+xml"})
  );
};

module.exports = SvgOutput;