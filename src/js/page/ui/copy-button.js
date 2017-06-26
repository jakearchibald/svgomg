var FloatingActionButton = require('./floating-action-button');

class CopyButton extends FloatingActionButton {
  constructor() {
    var title = 'Copy as text';
    super({
      title: title,
      iconSvg: (
        '<svg viewBox="0 0 24 24" class="icon">' +
          '<title>' + title + '</title>' +
          '<path d="M16 1H4C3 1 2 2 2 3v14h2V3h12V1zm3 4H8C7 5 6 6 6 7v14c0 1 1 2 2 2h11c1 0 2-1 2-2V7c0-1-1-2-2-2zm0 16H8V7h11v14z"/>' +
        '</svg>'
      ),
      minor: true
    });

    this._text = null;
    this._pre = document.createElement('pre');
  }

  _onClick(event) {
    super._onClick(event);
    this._pre.textContent = this._text;
    document.body.appendChild(this._pre);
    getSelection().removeAllRanges();
    var range = document.createRange();
    range.selectNode(this._pre);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    getSelection().removeAllRanges();
    document.body.removeChild(this._pre);
  }

  isSupported() {
    return ( document.queryCommandSupported && document.queryCommandSupported('copy') );
  }

  setCopyText(text, filename) {
    var title = (filename ? 'Copy as text: ' + filename : 'Copy as text');

    this._text = text;

    this.container.setAttribute('title', title);
    this.container.querySelector('svg.icon > title').textContent = title;
  }
}

module.exports = CopyButton;
