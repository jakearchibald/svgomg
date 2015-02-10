var utils = require('../utils');

class MainUi {
  constructor(...elements) {
    this._activated = false;
    this._toActivate = elements;
  }

  activate() {
    if (this._activated) return;
    this._activated = true;

    return Promise.all(
      this._toActivate.map(el => utils.transitionToClass(el))
    );
  }
}

module.exports = MainUi;