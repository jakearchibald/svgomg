var utils = require('../utils');

class DownloadButton {
  constructor() {
    this.container = utils.strToEl(
      '<a href="./" class="floating-action-button">' +
        '<title>Download output</title>' +
        '<svg viewBox="0 0 24 24" class="icon"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>' +
      '</a>' +
    '');
  }

  setDownload(filename, url) {
    this.container.download = filename;
    this.container.href = url;
  }

  activate() {
    return utils.transitionToClass(this.container);
  }
}

module.exports = DownloadButton;