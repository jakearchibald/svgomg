import FloatingActionButton from './floating-action-button.js';

export default class CopyButton extends FloatingActionButton {
  constructor() {
    const title = 'Copy as text';

    super({
      title,
      iconSvg:
        // prettier-ignore
        '<svg aria-hidden="true" class="icon" viewBox="0 0 24 24">' +
          '<path d="M16 1H4C3 1 2 2 2 3v14h2V3h12V1zm3 4H8C7 5 6 6 6 7v14c0 1 1 2 2 2h11c1 0 2-1 2-2V7c0-1-1-2-2-2zm0 16H8V7h11v14z"/>' +
        '</svg>',
    });

    this._text = null;
    this._pre = document.createElement('pre');
  }

  onClick(event) {
    super.onClick(event);
    this.copyText();
  }

  copyText() {
    if (!this._text) return false;

    this._pre.textContent = this._text;
    document.body.append(this._pre);
    getSelection().removeAllRanges();

    const range = document.createRange();
    range.selectNode(this._pre);

    window.getSelection().addRange(range);

    document.execCommand('copy');
    getSelection().removeAllRanges();
    this._pre.remove();

    return true;
  }

  setCopyText(text) {
    this._text = text;
  }
}
