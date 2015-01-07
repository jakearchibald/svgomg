"use strict";

var utils = require('../utils');
var Spinner = require('./spinner');

class MainMenu extends (require('events').EventEmitter) {
  constructor() {
    super();

    this.allowHide = false;
    this._spinner = new Spinner();

    utils.domReady.then(_ => {
      this.container = document.querySelector('.main-menu');
      this._selectFileInput = document.querySelector('.select-file-input');
      this._pasteInput = document.querySelector('.paste-input');
      this._loadDemoBtn = document.querySelector('.load-demo');
      this._selectFileBtn = document.querySelector('.select-file');

      document.querySelector('.menu-btn')
        .addEventListener('click', e => this._onMenuButtonClick(e));

      this.container.querySelector('.overlay')
        .addEventListener('click', e => this._onOverlayClick(e));

      this._selectFileBtn.addEventListener('click', e => this._onSelectFileClick(e));
      this._loadDemoBtn.addEventListener('click', e => this._onLoadDemoClick(e));
      this._selectFileInput.addEventListener('change', e => this._onFileInputChange(e));
      this._pasteInput.addEventListener('input', e => this._onTextInputChange(e));

      //document.querySelector('.load-demo').appendChild(new Spinner().container);
    });
  }

  show() {
    this.container.classList.remove('hidden');
  }

  hide() {
    if (!this.allowHide) {
      return;
    }
    this.stopSpinner();
    this.container.classList.add('hidden');
  }

  stopSpinner() {
    this._spinner.hide();
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

    this._selectFileBtn.appendChild(this._spinner.container);
    this._spinner.show();

    this.emit('svgDataLoad', {
      data: await utils.readFileAsText(file),
      filename: file.name
    });
  }

  async _onLoadDemoClick(event) {
    event.preventDefault();
    event.target.blur();
    this._loadDemoBtn.appendChild(this._spinner.container);
    this._spinner.show();

    this.emit('svgDataLoad', {
      data: await utils.get('test-svgs/car.svg'),
      filename: 'car.svg'
    });
  }
}

module.exports = MainMenu;