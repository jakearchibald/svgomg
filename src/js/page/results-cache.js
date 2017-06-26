"use strict";

class ResultsCache {
  constructor(size) {
    this._size = size;
    this.purge();
  }

  purge() {
    this._fingerprints = [];
    this._items = [];
    this._index = 0;
  }

  add(fingerprint, svgFiles) {
    var oldItem = this._items[this._index];

    if (oldItem) {
      oldItem.forEach((svgFile) => {
        // gc blob url
        svgFile.release();
      });
    }

    this._fingerprints[this._index] = fingerprint;
    this._items[this._index] = svgFiles;

    this._index = (this._index + 1) % this._size;
  }

  match(fingerprint) {
    return this._items[this._fingerprints.indexOf(fingerprint)];
  }
}

module.exports = ResultsCache;
