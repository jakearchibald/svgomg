"use strict";

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
    });
  }

  async process(settings, itterationCallback) {
    await this.abortCurrent();
    this._multiPass = settings.multipass;

    var result = await this._requestResponse({
      action: 'process',
      settings
    });

    itterationCallback(result);

    if (settings.multipass) {
      while (result = await this.nextPass()) {
        if (this._abortMultiPassResolver) {
          this._multiPass = false;
          this._abortMultiPassResolver();
          this._abortMultiPassResolver = null;
          break;
        }
        itterationCallback(result);
      }
      this._multiPass = false;
      
      if (this._abortMultiPassResolver) {
        this._abortMultiPassResolver();
        this._abortMultiPassResolver = null;
        break;
      }
    }
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