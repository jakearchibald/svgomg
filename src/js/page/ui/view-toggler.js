var utils = require('../utils');

class ViewToggler extends (require('events').EventEmitter) {
  constructor() {
    super();
    this.container = null;

    utils.domReady.then(_ => {
      this.container = document.querySelector('.view-toggler');

      // stop browsers remembering previous form state
      this.container.output[0].checked = true;

      this.container.addEventListener('change', e => this._onChange(e));
    });
  }

  _onChange(event) {
    var value = this.container.output.value;

    if (!value) { // some browsers don't support the nice shortcut above (eg Safari)
      value = utils.toArray(this.container.output).reduce((value, input) => {
        return value || (input.checked ? input.value : '');
      }, '');
    }

    this.emit("change", {
      value: value
    });
  }
}

module.exports = ViewToggler;