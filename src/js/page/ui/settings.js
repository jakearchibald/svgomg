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
      this._miscInputs = utils.toArray(
        document.querySelectorAll('.settings .misc input')
      );

      utils.toArray(
        document.querySelectorAll('.settings .material-slider')
      ).forEach(el => new Slider(el));

      var settingsEl = document.querySelector('.settings');

      settingsEl.addEventListener('change', e => this._onChange(e));
      settingsEl.addEventListener('input', e => this._onChange(e));
      settingsEl.addEventListener('wheel', e => this._onMouseWheel(e));
      
      // Stop double-tap text selection.
      // This stops all text selection which is kinda sad.
      // I think this code will bite me.
      settingsEl.addEventListener('mousedown', e => {
        if (utils.closest(e.target, 'input[type=range]')) return;
        e.preventDefault();
      });
    });
  }

  _onMouseWheel(event) {
    // prevents bounce effect on desktop
    event.preventDefault();
    event.currentTarget.scrollTop += event.deltaY;
  }

  _onChange(event) {
    if (event.type == 'change' && event.target.type == 'range') {
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
    
    this._miscInputs.forEach(function(inputEl) {
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