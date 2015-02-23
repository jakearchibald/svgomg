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
    this._svgFile = null;

    // IE compat
    if ('msSaveBlob' in navigator) {
      this.container.addEventListener('click', event => {
        event.preventDefault();
        navigator.msSaveBlob(this._svgFile.blob, this.container.download);
      });
    }
  }

  setDownload(filename, svgFile) {
    this.container.download = filename;
    this.container.href = svgFile.url;

    // for IE compat
    this._svgFile = svgFile;
  }

  working() {
    this._spinner.show(500);
  }

  done() {
    this._spinner.hide();
  }
}

module.exports = DownloadButton;