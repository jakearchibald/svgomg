"use strict"

var utils = require('../utils');

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

      var settingsEl = document.querySelector('.settings');

      settingsEl.addEventListener('change', e => this._onChange(e));
      settingsEl.addEventListener('wheel', e => this._onMouseWheel(e));
      
      // Stop double-tap text selection.
      // This stops all text selection which is kinda sad.
      settingsEl.addEventListener('mousedown', e => e.preventDefault());
    });
  }

  _onMouseWheel(event) {
    // prevents bounce effect on desktop
    event.preventDefault();
    event.currentTarget.scrollTop += event.deltaY;
  }

  _onChange(event) {
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
        fingerprint.push(Number(inputEl.checked));
      }
      
      output[inputEl.name] = inputEl.checked;
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