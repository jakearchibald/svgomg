var utils = require('../utils');

class DownloadButton {
  constructor() {
    this.container = utils.strToEl(`
      <a href="./" class="floating-action-button">
        <title>Download output</title>
        <svg viewBox="0 0 24 24" class="icon"><path d="M19 9h-4v-6h-6v6h-4l7 7 7-7zm-14 9v2h14v-2h-14z"/></svg>
      </a>
    `);
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