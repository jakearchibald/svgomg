"use strict";

class ResultsCache {
  constructor(size) {
    this._size = size;
    this.purge();
  }

  purge() {
    this._fingerprints = [];
    this._files = [];
    this._index = 0;
  }

  add(fingerprint, file) {
    var oldItem = this._files[this._index];

    if (oldItem) {
      // gc blob url
      oldItem.release();
    }

    this._fingerprints[this._index] = fingerprint;
    this._files[this._index] = file;

    this._index = (this._index + 1) % this._size;
  }

  match(fingerprint) {
    return this._files[this._fingerprints.indexOf(fingerprint)];
  }
}

module.exports = ResultsCache;