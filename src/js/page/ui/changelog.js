var utils = require('../utils');

class Changelog {
  constructor(loadedVersion) {
    this.container = utils.strToEl('<section class="changelog"></section>');
    this._loadedVersion = loadedVersion;
  }

  async showLogFrom(lastLoadedVersion) {
    if (lastLoadedVersion == this._loadedVersion) return;
    var changelog = await utils.get('changelog.json').then(JSON.parse);
    var startIndex = 0;
    var endIndex = 0;
    
    for (var i = 0; i < changelog.length; i++) {
      let entry = changelog[i];

      if (entry.version === this._loadedVersion) {
        startIndex = i;
      }
      else if (entry.version === lastLoadedVersion) {
        break;
      }
      endIndex = i + 1;
    }

    var changeLis = changelog.slice(startIndex, endIndex).reduce((arr, entry) => {
      return arr.concat(entry.changes);
    }, []).map(function(change) {
      return utils.escapeHtmlTag`<li>${change}</li>`;
    });

    this.container.appendChild(utils.strToEl('<h1>Updated!</h1>'));
    this.container.appendChild(utils.strToEl(
      '<ul>' +
        changeLis.join('') +
      '</ul>' +
    ''));

    await utils.domReady;
    utils.transitionToClass(this.container);
  }
}

module.exports = Changelog;