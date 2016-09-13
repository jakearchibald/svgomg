var utils = require('../utils');

class FileDrop extends (require('events').EventEmitter) {
  constructor() {
    super();
    this.container = utils.strToEl(
      '<div class="drop-overlay">Drop it!</div>' +
    '');

    // drag events are horrid
    this._activeEnters = 0;
    this._currentEnteredElement = null;

    utils.domReady.then(_ => {
      document.addEventListener('dragover', event => event.preventDefault());
      document.addEventListener('dragenter', event => this._onDragEnter(event));
      document.addEventListener('dragleave', event => this._onDragLeave(event));
      document.addEventListener('drop', event => this._onDrop(event));
    });
  }

  _onDragEnter(event) {
    // firefox double-fires on window enter, this works around it
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1124645
    if (this._currentEnteredElement == event.target) return;
    this._currentEnteredElement = event.target;

    if (!this._activeEnters++) {
      utils.transitionToClass(this.container);
    }
  }

  _onDragLeave(event) {
    this._currentEnteredElement = null;

    if (!--this._activeEnters) {
      utils.transitionFromClass(this.container);
    }
  }

  async _onDrop(event) {
    event.preventDefault();

    this._activeEnters = 0;
    utils.transitionFromClass(this.container);
    var file = event.dataTransfer.files[0];

    this.emit('svgDataLoad', {
      data: await utils.readFileAsText(file),
      filename: file.name
    });
  }
}

module.exports = FileDrop;
