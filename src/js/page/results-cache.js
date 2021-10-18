// TODO: switch to Map/Set

export default class ResultsCache {
  constructor(size) {
    this._size = size;
    this.purge();
  }

  purge() {
    this._fingerprints = [];
    this._items = [];
    this._index = 0;
  }

  add(fingerprint, svgFile) {
    const oldItem = this._items[this._index];

    if (oldItem) {
      // gc blob url
      oldItem.release();
    }

    this._fingerprints[this._index] = fingerprint;
    this._items[this._index] = svgFile;

    this._index = (this._index + 1) % this._size;
  }

  match(fingerprint) {
    return this._items[this._fingerprints.indexOf(fingerprint)];
  }
}
