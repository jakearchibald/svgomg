"use strict";

var utils = require('../utils');

class MainMenu extends (require('events').EventEmitter) {
  constructor() {
    super();

    this.allowHide = false;

    utils.domReady.then(_ => {
      this.container = document.querySelector('.main-menu');
      this._selectFileInput = document.querySelector('.select-file-input');
      this._pasteInput = document.querySelector('.paste-input');

      document.querySelector('.select-file')
        .addEventListener('click', e => this._onSelectFileClick(e));

      document.querySelector('.load-demo')
        .addEventListener('click', e => this._onLoadDemoClick(e));

      document.querySelector('.menu-btn')
        .addEventListener('click', e => this._onMenuButtonClick(e));

      this.container.querySelector('.overlay')
        .addEventListener('click', e => this._onOverlayClick(e));

      this._selectFileInput.addEventListener('change', e => this._onFileInputChange(e));
      this._pasteInput.addEventListener('input', e => this._onTextInputChange(e));
    });
  }

  show() {
    this.container.classList.remove('hidden');
  }

  hide() {
    if (!this.allowHide) {
      return;
    }
    this.container.classList.add('hidden');
  }

  _onOverlayClick(event) {
    event.preventDefault();
    this.hide();
  }

  _onMenuButtonClick(event) {
    event.preventDefault();
    this.show();
  }

  _onTextInputChange(event) {
    var val = this._pasteInput.value;

    if (val.indexOf('</svg>') != -1) {
      this._pasteInput.value = '';

      this.emit('svgDataLoad', {
        data: val,
        filename: 'image.svg'
      });
    }
  }

  _onSelectFileClick(event) {
    event.preventDefault();
    event.target.blur();
    this._selectFileInput.click();
  }

  async _onFileInputChange(event) {
    var file = this._selectFileInput.files[0];

    if (!file) {
      return;
    }

    this.emit('svgDataLoad', {
      data: await utils.readFileAsText(file),
      filename: file.name
    });
  }

  async _onLoadDemoClick(event) {
    event.preventDefault();
    event.target.blur();
    this.emit('svgDataLoad', {
      data: await utils.get('test-svgs/car.svg'),
      filename: 'car.svg'
    });
  }
}

module.exports = MainMenu;