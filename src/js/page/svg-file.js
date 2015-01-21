"use strict";

var gzip = new (require('./gzip'));

class SvgFile {
  constructor(text, width, height) {
    this.text = text;
    this._compressedSize = null;
    this._url = '';
    this._urlBlob = null;
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

  get url() {
    if (!this._url) {
      // IE GCs blobs once they're out of reference, even if they
      // have an object url, so we have to keep in in reference.
      this._urlBlob = new Blob([this.text], {type: "image/svg+xml"});
      this._url = URL.createObjectURL(this._urlBlob);
    }

    return this._url;
  }

  release() {
    if (!this._url) {
      return;
    }

    this._urlBlob = null;
    URL.revokeObjectURL(this._url);
  }
}

module.exports = SvgFile;