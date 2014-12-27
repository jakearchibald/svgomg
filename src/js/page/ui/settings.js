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
      
      // Stop double-tap text selection.
      // This stops all text selection which is kinda sad.
      settingsEl.addEventListener('mousedown', e => e.preventDefault());
    });
  }

  _onChange(event) {
    this.emit('change');
  }

  getSettings() {
    var ouput = {
      plugins: {}
    };
    
    this._miscInputs.forEach(function(inputEl) {
      ouput[inputEl.name] = inputEl.checked;
    });

    this._pluginInputs.forEach(function(inputEl) {
      ouput.plugins[inputEl.name] = inputEl.checked;
    });

    return ouput;
  }
}

module.exports = Settings;