"use strict";

var gzip = require('./gzip');

function readFileAsText(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onerror = function() {
      reject(reader.error);
    };
    reader.onload = function() {
      resolve(reader.result);
    };
  });
}

class SvgFile {
  constructor(file) {
    if (file instanceof File) {
      this.text = readFileAsText(file);
      this.name = file.name;
    }
    else { // text
      this.text = Promise.resolve(file);
      this.name = 'image.svg';
    }

    this._compressedSize = null;
    this._url = null;  
  }

  size(compress) {
    if (!compress) {
      return this.text.then(t => t.length);
    }

    if (!this._compressedSize) {
      this._compressedSize = this.text
        .then(t => gzip.compress(t))
        .then(r => r.byteLength);
    }

    return this._compressedSize;
  }

  url() {
    if (!this._url) {
      this._url = this.text.then(text => {
        return URL.createObjectURL(
          new Blob([text], {type: "image/svg+xml"})
        );
      });
    }

    return this._url;
  }

  async release() {
    if (!this._url) {
      return;
    }

    return URL.revokeObjectURL(await this._url);
  }
}

module.exports = SvgFile;