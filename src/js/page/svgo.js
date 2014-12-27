"use strict";

class Svgo extends require('./worker-messenger') {
  constructor() {
    super('js/svgo-worker.js');
  }

  load(svgText) {
    return this._requestResponse({
      action: 'load',
      data: svgText
    });
  }

  async process(settings, itterationCallback) {
    var result = await this._requestResponse({
      action: 'process',
      settings
    });

    itterationCallback(result);

    if (settings.multipass) {
      while (result = await this.nextPass()) {
        itterationCallback(result);
      }
    }
  }

  nextPass() {
    return this._requestResponse({
      action: 'nextPass'
    });
  }
}

module.exports = Svgo;