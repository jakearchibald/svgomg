"use strict";

var SvgFile = require('./svg-file');

class Svgo extends require('./worker-messenger') {
  constructor() {
    super('js/svgo-worker.js');
    this._multiPass = false;
    this._abortMultiPassResolver = null;
  }

  load(svgText) {
    return this._requestResponse({
      action: 'load',
      data: svgText
    }).then(({width, height}) => {
      return new SvgFile(svgText, width, height);
    });
  }

  async process(settings, itterationCallback) {
    await this.abortCurrent();
    this._multiPass = settings.multipass;

    var result = await this._requestResponse({
      action: 'process',
      settings
    });
    var resultFile = new SvgFile(result.data, result.dimensions.width, result.dimensions.height);

    itterationCallback(resultFile);

    if (settings.multipass) {
      while (result = await this.nextPass()) {
        if (this._abortMultiPassResolver) {
          this._multiPass = false;
          this._abortMultiPassResolver();
          this._abortMultiPassResolver = null;
          throw Error('Abort');
        }
        resultFile = new SvgFile(result.data, result.dimensions.width, result.dimensions.height);
        itterationCallback(resultFile);
      }
      this._multiPass = false;

      if (this._abortMultiPassResolver) {
        this._abortMultiPassResolver();
        this._abortMultiPassResolver = null;
      }
    }

    // return final result
    return resultFile;
  }

  nextPass() {
    return this._requestResponse({
      action: 'nextPass'
    });
  }

  async abortCurrent() {
    if (!this._multiPass) {
      return;
    }

    new Promise(r => this._abortMultiPassResolver = r);
  }
}

module.exports = Svgo;