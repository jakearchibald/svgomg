"use strict"

var utils = require('../utils');
var Slider = require('./material-slider');

class Settings extends (require('events').EventEmitter) {
  constructor() {
    super();

    this._throttleTimeout = null;

    utils.domReady.then(_ => {
      this._pluginInputs = utils.toArray(
        document.querySelectorAll('.settings .plugins input')
      );
      this._globalInputs = utils.toArray(
        document.querySelectorAll('.settings .global input')
      );

      // map real range elements to Slider instances
      this._sliderMap = new WeakMap();

      // enhance ranges
      utils.toArray(
        document.querySelectorAll('.settings input[type=range]')
      ).forEach(el => this._sliderMap.set(el, new Slider(el)));

      this.container = document.querySelector('.settings');
      this._scroller = document.querySelector('.settings-scroller');

      this.container.addEventListener('change', e => this._onChange(e));
      this.container.addEventListener('input', e => this._onChange(e));
      this._scroller.addEventListener('wheel', e => this._onMouseWheel(e));

      // Stop double-tap text selection.
      // This stops all text selection which is kinda sad.
      // I think this code will bite me.
      this._scroller.addEventListener('mousedown', e => {
        if (utils.closest(e.target, 'input[type=range]')) return;
        e.preventDefault();
      });
    });
  }

  _onMouseWheel(event) {
    // Prevents bounce effect on desktop.
    // Firefox uses DELTA_LINE on a mouse wheel, ignore it
    if (!event.deltaMode) { // 0 is "pixels"
      event.preventDefault();
      event.currentTarget.scrollTop += event.deltaY;
    }
  }

  _onChange(event) {
    // IE fires the change event rather than input for ranges
    if (!utils.isIe && event.type == 'change' && event.target.type == 'range') {
      // for ranges, the change event is just a dupe of the
      // final input event
      return;
    }

    clearTimeout(this._throttleTimeout);

    // throttle range
    if (event.target.type == 'range') {
      this._throttleTimeout = setTimeout(_ => this.emit('change'), 150);
    }
    else {
      this.emit('change');
    }
  }

  setSettings(settings) {
    this._globalInputs.forEach(inputEl => {
      if (inputEl.type == 'checkbox') {
        inputEl.checked = settings[inputEl.name];
      }
      else if (inputEl.type == 'range') {
        this._sliderMap.get(inputEl).value = settings[inputEl.name];
      }
    });

    this._pluginInputs.forEach(inputEl => {
      inputEl.checked = settings.plugins[inputEl.name];
    });
  }

  getSettings() {
    // fingerprint is used for cache lookups
    var fingerprint = [];

    var output = {
      plugins: {}
    };

    this._globalInputs.forEach(function(inputEl) {
      if (inputEl.name != 'gzip' && inputEl.name != 'original') {
        if (inputEl.type == 'checkbox') {
          fingerprint.push(Number(inputEl.checked));
        }
        else {
          fingerprint.push('|' + inputEl.value + '|');
        }
      }

      if (inputEl.type == 'checkbox') {
        output[inputEl.name] = inputEl.checked;
      }
      else {
        output[inputEl.name] = inputEl.value;
      }
    });

    this._pluginInputs.forEach(function(inputEl) {
      fingerprint.push(Number(inputEl.checked));
      output.plugins[inputEl.name] = inputEl.checked;
    });

    output.fingerprint = fingerprint.join();

    return output;
  }
}

module.exports = Settings;
