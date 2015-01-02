"use strict";

var utils = require('./utils');

class IntroController extends (require('events').EventEmitter) {
  constructor() {
    this.container = null;

    utils.domReady.then(_ => {
      this.container = document.querySelector('.app-input');
      this._svgFileInput = document.querySelector('.svg-file-input');

      this._svgFileInput.addEventListener('change', e => this._onFileSelected(e));
      
      document.querySelector('.select-file-btn')
        .addEventListener('click', e => this._onSelectFileClick(e));

      document.querySelector('.load-demo')
        .addEventListener('click', e => this._onLoadDemoClick(e));
    });
  }

  _onSelectFileClick(event) {
    event.preventDefault();
    this._svgFileInput.click();
  }

  async _onLoadDemoClick(event) {
    event.preventDefault();
    this.emit('load', {
      data: await utils.get('test-svgs/car.svg'),
      filename: 'car.svg'
    });
  }

  async _onFileSelected(event) {
    var file = this._svgFileInput.files[0];

    if (!file) {
      return;
    }

    this.emit('load', {
      data: await utils.readFileAsText(file),
      filename: file.name
    });
  }
}

module.exports = IntroController;