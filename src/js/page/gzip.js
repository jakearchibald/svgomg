"use strict";

class Gzip extends require('./worker-messenger') {
  constructor() {
    super('js/gzip-worker.js');
  }

  compress(svgData) {
    return this._requestResponse({
      data: svgData
    });
  }
}

Gzip.singleton = new Gzip();

module.exports = Gzip;
