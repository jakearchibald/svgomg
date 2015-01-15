"use strict";

var SvgFile = require('./svg-file');

class Svgo extends require('./worker-messenger') {
  constructor() {
    super('js/svgo-worker.js');
    this._multiPass = false;
    this._abortOnNextItter = false;
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

  process(settings, itterationCallback) {
    return this._currentJob = this.abortCurrent().then(async _ => {
      this._abortOnNextItter = false;

      var result = await this._requestResponse({
        action: 'process',
        settings
      });

      var resultFile = new SvgFile(result.data, result.dimensions.width, result.dimensions.height);

      itterationCallback(resultFile);

      if (settings.multipass) {
        while (result = await this.nextPass()) {
          if (this._abortOnNextItter) {
            throw Error('abort');
          }
          resultFile = new SvgFile(result.data, result.dimensions.width, result.dimensions.height);
          itterationCallback(resultFile);
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
    this._abortOnNextItter = true;

    try {
      await this._currentJob;
    } catch(e){}
  }
}

module.exports = Svgo;