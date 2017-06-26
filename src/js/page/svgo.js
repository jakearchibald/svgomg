"use strict";

var SvgFile = require('./svg-file');

class Svgo extends require('./worker-messenger') {
  constructor() {
    super('js/svgo-worker.js');
    this._abortOnNextIteration = false;
    this._currentJob = Promise.resolve();
  }

  load(svgText) {
    return this._requestResponse({
      action: 'load',
      data: svgText
    }).then(({width, height}) => {
      return new SvgFile(svgText, width, height);
    });
  }

  process(settings, iterationCallback) {
    return this._currentJob = this.abortCurrent().then(async _ => {
      this._abortOnNextIteration = false;

      var result = await this._requestResponse({
        action: 'process',
        settings
      });

      var resultFile = new SvgFile(result.data, result.dimensions.width, result.dimensions.height);

      iterationCallback(this, resultFile);

      if (settings.multipass) {
        while (result = await this.nextPass()) {
          if (this._abortOnNextIteration) {
            throw Error('abort');
          }
          resultFile = new SvgFile(result.data, result.dimensions.width, result.dimensions.height);
          iterationCallback(this, resultFile);
        }
      }

      // return final result
      return resultFile;
    });
  }

  nextPass() {
    return this._requestResponse({
      action: 'nextPass'
    });
  }

  async abortCurrent() {
    this._abortOnNextIteration = true;

    try {
      await this._currentJob;
    } catch(e) {
      console.error("Svgo.abortCurrent: ", e);
    }
  }

  async release() {
    await this.abortCurrent().then(() => super.release());
  }
}

module.exports = Svgo;
