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

  process(settings) {
    return this._requestResponse({
      action: 'process',
      settings
    });
  }

  nextPass(settings) {
    return this._requestResponse({
      action: 'nextPass'
    });
  }
}

module.exports = new Svgo();