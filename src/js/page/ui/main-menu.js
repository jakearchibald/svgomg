import {
  domReady,
  transitionFromClass,
  transitionToClass,
  readFileAsText
} from '../utils';
import Spinner from './spinner';
import { EventEmitter } from 'events';

export default class MainMenu extends EventEmitter {
  constructor() {
    super();

    this.allowHide = false;
    this._spinner = new Spinner();

    domReady.then(() => {
      this.container = document.querySelector('.main-menu');
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
      this._loadFileInput.addEventListener('change', () => this._onFileInputChange());
      this._pasteInput.addEventListener('input', () => this._onTextInputChange());
    });
  }

  show() {
    this.container.classList.remove('hidden');
    transitionFromClass(this._overlay, 'hidden');
    transitionFromClass(this._menu, 'hidden');
  }

  hide() {
    if (!this.allowHide) return;
    this.stopSpinner();
    this.container.classList.add('hidden');
    transitionToClass(this._overlay, 'hidden');
    transitionToClass(this._menu, 'hidden');
  }

  stopSpinner() {
    this._spinner.hide();
  }

  showFilePicker() {
    this._loadFileInput.click();
  }

  _onOverlayClick(event) {
    event.preventDefault();
    this.hide();
  }

  _onMenuButtonClick(event) {
    event.preventDefault();
    this.show();
  }

  _onTextInputChange() {
    const val = this._pasteInput.value.trim();

    if (val.includes('</svg>')) {
      this._pasteInput.value = '';
      this._pasteInput.blur();

      this._pasteLabel.appendChild(this._spinner.container);
      this._spinner.show();

      this.emit('svgDataLoad', {
        data: val,
        filename: 'image.svg'
      });
    }
  }

  _onLoadFileClick(event) {
    event.preventDefault();
    event.target.blur();
    this.showFilePicker();
  }

  async _onFileInputChange() {
    const file = this._loadFileInput.files[0];

    if (!file) return;

    this._loadFileBtn.appendChild(this._spinner.container);
    this._spinner.show();

    this.emit('svgDataLoad', {
      data: await readFileAsText(file),
      filename: file.name
    });
  }

  async _onLoadDemoClick(event) {
    event.preventDefault();
    event.target.blur();
    this._loadDemoBtn.appendChild(this._spinner.container);
    this._spinner.show();

    try {
      this.emit('svgDataLoad', {
        data: await fetch('test-svgs/car-lite.svg').then(r => r.text()),
        filename: 'car-lite.svg'
      });
    }
    catch (err) {
      // This extra scope is working around a babel-minify bug.
      // It's fixed in Babel 7.
      {
        this.stopSpinner();

        let error;

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          error = Error("Demo not available offline");
        }
        else {
          error = Error("Couldn't fetch demo SVG");
        }

        this.emit('error', { error });
      }
    }
  }
}
