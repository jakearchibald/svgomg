var utils = require('../utils');

class ResultsContainer {
  constructor(results) {
    this._results = results;

    utils.domReady.then(_ => {
      this._mobileContainer = document.querySelector('.results-container-mobile');
      this._container = document.querySelector('.results-container');
      this._query = matchMedia('(min-width: 640px)');

      this._query.addListener(_ => this._positionResults());
      this._positionResults();
    });
  }

  _positionResults() {
    if (this._query.matches) {
      this._container.appendChild(this._results.container);
    }
    else {
      this._mobileContainer.appendChild(this._results.container);
    }
  }
}

module.exports = ResultsContainer;