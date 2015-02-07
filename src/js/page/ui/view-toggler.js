var utils = require('../utils');

class ViewToggler extends (require('events').EventEmitter) {
  constructor() {
    this.container = null;

    utils.domReady.then(_ => {
      this.container = document.querySelector('.view-toggler');
      this.container.addEventListener('change', e => this._onChange(e));
    });
  }

  _onChange(event) {
    this.emit("change", {
      value: this.container.output.value
    });
  }
}

module.exports = ViewToggler;