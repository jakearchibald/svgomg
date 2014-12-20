"use strict";

class Svgo extends require('./worker-messenger') {
  constructor() {
    super('js/svgo-worker.js');
  }

  process(svgData) {
    return this._requestResponse({
      data: svgData
    });
  }
}

module.exports = new Svgo();