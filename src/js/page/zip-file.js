"use strict";

var JSZip = require('jszip');

class ZipFile {
  constructor() {
    this.jszip = new JSZip();
    this._url = '';
    this._blob = null;
  }

  async compress() {
    // IE GCs blobs once they're out of reference, even if they
    // have an object url, so we have to keep in in reference.
    this._blob = await this.jszip.generateAsync({ type: 'blob' });
    this._url = URL.createObjectURL(this._blob);
  }

  get blob() {
    if (!this._blob) throw new Error('ZipFile: Call `compress` before accessing `blob`.');
    return this._blob;
  }

  get url() {
    if (!this._url) throw new Error('ZipFile: Call `compress` before accessing `url`.');
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

module.exports = ZipFile;
