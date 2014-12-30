var utils = require('../utils');

class DownloadButton {
  constructor() {
    this.container = utils.strToEl(`
      <a href="./" class="floating-action-button">
        <svg viewBox="0 0 24 24" class="icon"><path d="M19 9h-4v-6h-6v6h-4l7 7 7-7zm-14 9v2h14v-2h-14z"/></svg>
      </a>
    `);
  }

  setDownload(filename, content) {
    this.container.download = filename;

    if (this.container.href) {
      URL.revokeObjectURL(this.container.href);
    }

    this.container.href = URL.createObjectURL(
      new Blob([content], {type: "image/svg+xml"})
    );
  }
}

module.exports = DownloadButton;