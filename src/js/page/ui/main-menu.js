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
      this._filenames = [];
      this._fileItemTemplate = document.querySelector('.file-item-template');
      this._fileItemEls = [];
      this._fileItemElsContainerEl = this._fileItemTemplate.parentNode;
      this._fileItemElsInsertBeforeEl = this._fileItemTemplate.nextSibling;
      this._loadFileInput = document.querySelector('.load-file-input');
      this._pasteInput = document.querySelector('.paste-input');
      this._loadDemoBtn = document.querySelector('.load-demo');
      this._loadFileBtn = document.querySelector('.load-file');
      this._pasteLabel = document.querySelector('.menu-input');
      this._overlay = this.container.querySelector('.overlay');
      this._menu = this.container.querySelector('.menu');

      document.querySelector('.menu-btn')
        .addEventListener('click', e => this._onMenuButtonClick(e));

      this._overlay.addEventListener('click', e => this._onOverlayClick(e));

      this._loadFileBtn.addEventListener('click', e => this._onLoadFileClick(e));
      this._loadDemoBtn.addEventListener('click', e => this._onLoadDemoClick(e));
      this._loadFileInput.addEventListener('change', e => this._onFileInputChange(e));
      this._pasteInput.addEventListener('input', e => this._onTextInputChange(e));
    });
  }

  show() {
    this.container.classList.remove('hidden');
    utils.transitionFromClass(this._overlay, 'hidden');
    utils.transitionFromClass(this._menu, 'hidden');
  }

  hide() {
    if (!this.allowHide) {
      return;
    }
    this.stopSpinner();
    this.container.classList.add('hidden');
    utils.transitionToClass(this._overlay, 'hidden');
    utils.transitionToClass(this._menu, 'hidden');
  }

  stopSpinner() {
    this._spinner.hide();
  }

  setFilenames(filenames) {
    var compact = (filenames.length >= 10);
    var fileItemEls = filenames.map((filename, filenameIndex) => {
      var fileItemEl = this._fileItemTemplate.cloneNode(true);
      var fileItemButtonEl = fileItemEl.querySelector('.file-item');
      var fileItemIconNumberEl = fileItemEl.querySelector('.file-item-icon-number');
      var fileItemNameEl = fileItemEl.querySelector('.file-item-name');
      fileItemIconNumberEl.textContent = String(filenameIndex + 1);
      fileItemNameEl.innerText = filename;
      if (compact) {
        fileItemButtonEl.classList.add('menu-item-compact');
      }
      fileItemEl.removeAttribute('class');
      fileItemEl.removeAttribute('style');
      fileItemButtonEl.addEventListener('click', e => this._onFilenameClick(e, filenameIndex));
      return fileItemEl;
    });
    var container = this._fileItemElsContainerEl;
    var insertBeforeEl = this._fileItemElsInsertBeforeEl;
    this._fileItemEls.forEach((fileItemEl) => {
      container.removeChild(fileItemEl);
    });
    fileItemEls.forEach((fileItemEl) => {
      container.insertBefore(fileItemEl, insertBeforeEl);
    });
    this._filenames = filenames;
    this._fileItemEls = fileItemEls;
  }

  setSelectedFilename(filenameIndex) {
    this._fileItemEls.forEach((fileItemEl, fileItemElIndex) => {
      var fileItemButtonEl = fileItemEl.querySelector('.file-item');
      if (fileItemElIndex === filenameIndex) {
        fileItemButtonEl.classList.add('menu-item-selected');
      }
      else {
        fileItemButtonEl.classList.remove('menu-item-selected');
      }
    });
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
    var val = this._pasteInput.value.trim();

    if (val.indexOf('</svg>') != -1) {
      this._pasteInput.value = '';
      this._pasteInput.blur();

      this._pasteLabel.appendChild(this._spinner.container);
      this._spinner.show();

      this.emit('svgDataLoad', {
        items: [
          {
            data: val,
            filename: 'image.svg'
          }
        ]
      });
    }
  }

  _onLoadFileClick(event) {
    event.preventDefault();
    event.target.blur();
    this._loadFileInput.click();
  }

  _onFilenameClick(event, filenameIndex) {
    event.preventDefault();
    event.target.blur();
    this.emit('filenameClick', {
      filename: this._filenames[filenameIndex],
      filenameIndex: filenameIndex
    });
  }

  async _onFileInputChange(event) {
    var files = this._loadFileInput.files;
    if (files.length <= 0) {
      return;
    }

    this._loadFileBtn.appendChild(this._spinner.container);
    this._spinner.show();

    var items = await utils.handleFileInput(files);

    this.emit('svgDataLoad', {
      items: items
    });
  }

  async _onLoadDemoClick(event) {
    event.preventDefault();
    event.target.blur();
    this._loadDemoBtn.appendChild(this._spinner.container);
    this._spinner.show();

    try {
      var items = [
        {
          data: await utils.get('test-svgs/car-lite.svg'),
          filename: 'car-lite.svg'
        },
        {
          data: await utils.get('test-svgs/car-lite-green.svg'),
          filename: 'car-lite-green.svg'
        }
      ];
      this.emit('svgDataLoad', {
        items: items
      });
    }
    catch (error) {
      this.stopSpinner();

      var e;

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        e = Error("Demo not available offline");
      }
      else {
        e = Error("Couldn't fetch demo SVG");
      }

      this.emit('error', {
        error: e
      });
    }
  }
}

module.exports = MainMenu;
