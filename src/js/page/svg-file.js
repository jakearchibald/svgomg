"use strict";

var gzip = new (require('./gzip'));

class SvgFile {
  constructor(text, width, height) {
    this.text = text;
    this._compressedSize = null;
    this._url = '';
    this._blob = null;
    this.width = width;
    this.height = height;
  }

  async size({ compress }) {
    if (!compress) {
      return this.text.length;
    }

    if (!this._compressedSize) {
      this._compressedSize = gzip.compress(this.text)
        .then(r => r.byteLength);
    }

    return this._compressedSize;
  }

  _create() {
    // IE GCs blobs once they're out of reference, even if they
    // have an object url, so we have to keep in in reference.
    this._blob = new Blob([this.text], {type: "image/svg+xml"});
    this._url = URL.createObjectURL(this._blob);
  }

  get blob() {
    if (!this._blob) this._create();
    return this._blob;
  }

  get url() {
    if (!this._url) this._create();
    return this._url;
  }

  release() {
    if (!this._url) {
      return;
    }

    this._blob = null;
    URL.revokeObjectURL(this._url);
  }
}

module.exports = SvgFile;