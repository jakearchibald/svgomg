import {
  strToEl,
  escapeHtmlTag,
  transitionToClass,
  domReady,
} from '../utils.js';

export default class Changelog {
  constructor(loadedVersion) {
    this.container = strToEl('<section class="changelog"></section>');
    this._loadedVersion = loadedVersion;
  }

  async showLogFrom(lastLoadedVersion) {
    if (lastLoadedVersion === this._loadedVersion) return;
    const changelog = await fetch('changelog.json').then((response) =>
      response.json(),
    );
    let startIndex = 0;
    let endIndex = 0;

    for (const [i, entry] of Object.entries(changelog)) {
      if (entry.version === this._loadedVersion) {
        startIndex = i;
      } else if (entry.version === lastLoadedVersion) {
        break;
      }

      endIndex = i + 1;
    }

    const changeList = changelog
      .slice(startIndex, endIndex)
      // TODO: remove `reduce`
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce((array, entry) => array.concat(entry.changes), [])
      .map((change) => escapeHtmlTag`<li>${change}</li>`);

    this.container.append(
      strToEl('<h1>Updated!</h1>'),
      strToEl(`<ul>${changeList.join('')}</ul>`),
    );

    await domReady;
    transitionToClass(this.container);
  }
}
