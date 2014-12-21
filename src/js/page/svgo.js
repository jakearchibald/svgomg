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

  process(svgData) {
    return this._requestResponse({
      action: 'process'
    });
  }
}

module.exports = new Svgo();