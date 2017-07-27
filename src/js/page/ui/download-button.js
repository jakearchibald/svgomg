import FloatingActionButton from './floating-action-button';

export default class DownloadButton extends FloatingActionButton {
  constructor({ minor }) {
    const title = 'Download';

    super({
      title,
      minor,
      href: './',
      iconSvg: (
        '<svg viewBox="0 0 24 24" class="icon">' +
          `<title>${title}</title>` +
          '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>' +
        '</svg>'
      )
    });

    this._fileInfo = null;
  }

  _onClick(event) {
    if (!this._fileInfo) {
      event.preventDefault();
      return;
    }

    super._onClick(event);

    // IE compat
    if ('msSaveBlob' in navigator) {
      event.preventDefault();
      navigator.msSaveBlob(this._fileInfo.blob, this._fileInfo.filename);
    }
  }

  setDownload(fileInfo) {
    this._fileInfo = fileInfo;

    const download = (fileInfo ? fileInfo.filename : '');
    const href = (fileInfo ? fileInfo.url : './');
    const title = (fileInfo ? 'Download: ' + fileInfo.filename : 'Nothing to download');

    this.container.download = download;
    this.container.href = href;
    this.container.setAttribute('title', title);
    this.container.querySelector('svg.icon > title').textContent = title;
  }
}
