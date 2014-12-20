var utils = require('../utils');

class DownloadButton {
  constructor() {
    this.container = utils.strToEl(
      '<div class="download-button"><a>Download</a></div>'
    );
    this._downloadLink = this.container.querySelector('a');
  }

  setDownload(filename, content) {
    this._downloadLink.download = filename;

    if (this._downloadLink.href) {
      URL.revokeObjectURL(this._downloadLink.href);
    }

    this._downloadLink.href = URL.createObjectURL(
      new Blob([content], {type: "image/svg+xml"})
    );
  }
}

module.exports = DownloadButton;