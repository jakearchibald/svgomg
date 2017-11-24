import FloatingActionButton from './floating-action-button';

export default class DownloadButton extends FloatingActionButton {
  constructor() {
    const title = 'Download';

    super({
      title,
      href: './',
      iconSvg: (
        '<svg viewBox="0 0 24 24" class="icon">' +
          `<title>${title}</title>` +
          '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>' +
        '</svg>'
      )
    });

    this._svgFile = null;
  }

  _onClick(event) {
    super._onClick(event);

    // IE compat
    if ('msSaveBlob' in navigator) {
      event.preventDefault();
      navigator.msSaveBlob(this._svgFile.blob, this._svgFile.filename);
    }
  }

  setDownload(filename, svgFile) {
    this.container.download = filename;
    this.container.href = svgFile.url;

    // for IE compat
    this._svgFile = svgFile;
  }
}
