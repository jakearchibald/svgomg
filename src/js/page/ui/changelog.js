import { strToEl, escapeHtmlTag, transitionToClass, domReady } from '../utils';

export default class Changelog {
  constructor(loadedVersion) {
    this.container = strToEl('<section class="changelog"></section>');
    this._loadedVersion = loadedVersion;
  }

  async showLogFrom(lastLoadedVersion) {
    if (lastLoadedVersion == this._loadedVersion) return;
    const changelog = await fetch('changelog.json').then(r => r.json());
    let startIndex = 0;
    let endIndex = 0;

    for (var i = 0; i < changelog.length; i++) {
      const entry = changelog[i];

      if (entry.version === this._loadedVersion) {
        startIndex = i;
      }
      else if (entry.version === lastLoadedVersion) {
        break;
      }
      endIndex = i + 1;
    }

    const changeLis = changelog.slice(startIndex, endIndex)
      .reduce((arr, entry) => arr.concat(entry.changes), [])
      .map(change => escapeHtmlTag`<li>${change}</li>`);

    this.container.appendChild(strToEl('<h1>Updated!</h1>'));
    this.container.appendChild(strToEl(
      '<ul>' +
        changeLis.join('') +
      '</ul>' +
    ''));

    await domReady;
    transitionToClass(this.container);
  }
}
