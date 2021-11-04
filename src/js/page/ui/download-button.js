import FloatingActionButton from './floating-action-button.js';
import Spinner from './spinner.js';

export default class DownloadButton extends FloatingActionButton {
  constructor() {
    const title = 'Download';

    super({
      title,
      href: './',
      iconSvg:
        // prettier-ignore
        '<svg aria-hidden="true" class="icon" viewBox="0 0 24 24">' +
          '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>' +
        '</svg>',
      major: true,
    });

    this._spinner = new Spinner();
    this.container.append(this._spinner.container);
  }

  setDownload(filename, { url }) {
    this.container.download = filename;
    this.container.href = url;
  }

  working() {
    this._spinner.show(500);
  }

  done() {
    this._spinner.hide();
  }
}
