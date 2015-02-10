"use strict";

class Prism extends require('./worker-messenger') {
  constructor() {
    super('js/prism-worker.js');
  }

  highlight(svgData) {
    return this._requestResponse({
      data: svgData
    });
  }
}

module.exports = Prism;