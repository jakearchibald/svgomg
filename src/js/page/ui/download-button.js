var utils = require('../utils');
var Spinner = require('./spinner');

class DownloadButton {
  constructor() {
    this.container = utils.strToEl(
      '<a href="./" class="floating-action-button">' +
        '<svg viewBox="0 0 24 24" class="icon">' +
          '<title>Download output</title>' +
          '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>' +
        '</svg>' +
      '</a>' +
    '');
    this._spinner = new Spinner();
    this.container.appendChild(this._spinner.container);
    this._spinner.show();
  }

  setDownload(filename, url) {
    this.container.download = filename;
    this.container.href = url;
  }

  activate() {
    return utils.transitionToClass(this.container);
  }

  working() {
    this._spinner.show(500);
  }

  done() {
    this._spinner.hide();
  }
}

module.exports = DownloadButton;