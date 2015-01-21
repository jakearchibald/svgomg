"use strict"

var utils = require('../utils');
var Slider = require('./material-slider');

class Settings extends (require('events').EventEmitter) {
  constructor() {
    super();

    utils.domReady.then(_ => {
      this._pluginInputs = utils.toArray(
        document.querySelectorAll('.settings .plugins input')
      );
      this._globalInputs = utils.toArray(
        document.querySelectorAll('.settings .global input')
      );

      utils.toArray(
        document.querySelectorAll('.settings input[type=range]')
      ).forEach(el => new Slider(el));

      this.container = document.querySelector('.settings');

      this.container.addEventListener('change', e => this._onChange(e));
      this.container.addEventListener('input', e => this._onChange(e));
      this.container.addEventListener('wheel', e => this._onMouseWheel(e));
      
      // Stop double-tap text selection.
      // This stops all text selection which is kinda sad.
      // I think this code will bite me.
      this.container.addEventListener('mousedown', e => {
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

    this.emit('change');
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

  activate() {
    return utils.transitionToClass(this.container);
  }
}

module.exports = Settings;