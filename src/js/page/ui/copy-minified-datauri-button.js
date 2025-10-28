import svgToMiniDataURI from 'mini-svg-data-uri';
import FloatingActionButton from './floating-action-button.js';

export default class CopyMinifiedDataUriButton extends FloatingActionButton {
  constructor() {
    const title = 'Copy as Minified Data URI';

    super({
      title,
      iconSvg:
        // prettier-ignore
        '<svg aria-hidden="true" class="icon" viewBox="0 -0.5 21 21">' +
          '<path fill-rule="evenodd" d="M3.4 8.949c-1.88-1.79-1.645-4.842.702-6.318 1.708-1.073 4.002-.75 5.449.627l.671.639a1.11 1.11 0 0 0 1.516 0 .985.985 0 0 0 0-1.443l-.567-.54C8.68-.457 4.59-.698 2.026 1.6c-2.653 2.38-2.7 6.357-.142 8.792l.758.721a1.11 1.11 0 0 0 1.516 0 .985.985 0 0 0 0-1.443zm15.577.397-.547-.52a1.11 1.11 0 0 0-1.516 0 .985.985 0 0 0 0 1.442l.671.64c1.448 1.377 1.785 3.561.659 5.187-1.55 2.235-4.757 2.457-6.636.668l-.758-.721a1.11 1.11 0 0 0-1.515 0 .985.985 0 0 0 0 1.443l.757.721c2.552 2.43 6.714 2.392 9.214-.115 2.437-2.442 2.173-6.363-.33-8.745M14.64 15.32 4.916 6.062a.99.99 0 0 1 0-1.444 1.11 1.11 0 0 1 1.516 0l9.724 9.258a.99.99 0 0 1 0 1.444 1.113 1.113 0 0 1-1.516 0"/>' +
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

    const dataUri = svgToMiniDataURI(this._text);
    this._pre.textContent = dataUri;
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
