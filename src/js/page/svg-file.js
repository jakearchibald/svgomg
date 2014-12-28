"use strict";

var gzip = new (require('./gzip'));

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
  // TODO: nah, this shouldn't be here, move to utils?
  /*static async fromFile(file) {
    var text = await readFileAsText(file);
    return new SvgFile(text, name);
  }*/

  constructor(text, width, height) {
    this.text = text;
    this._compressedSize = null;
    this._url = null;
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
      this._url = URL.createObjectURL(
        new Blob([this.text], {type: "image/svg+xml"})
      );
    }

    return this._url;
  }

  release() {
    if (!this._url) {
      return;
    }

    URL.revokeObjectURL(this._url);
  }
}

module.exports = SvgFile;