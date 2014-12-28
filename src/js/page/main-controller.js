"use strict";

var utils = require('./utils');
var svgo = new (require('./svgo'));

var SvgFile = require('./svg-file');

class MainController {
  constructor() {
    // ui components
    this._svgOuputUi = new (require('./ui/svg-output'));
    this._codeOutputUi = new (require('./ui/code-output'));
    this._downloadButtonUi = new (require('./ui/download-button'));
    this._resultsUi = new (require('./ui/results'));
    this._settingsUi = new (require('./ui/settings'));

    // ui events
    this._settingsUi.on('change', _ => this._onSettingsChange());

    // state
    this._inputSvg = null;
    this._inputDimensions = null;
    this._cache = new (require('./results-cache'))(10);

    utils.domReady.then(_ => {
      document.querySelector('.status').appendChild(this._resultsUi.container);
      //document.body.appendChild(this._downloadButtonUi.container);
      document.querySelector('.output').appendChild(this._svgOuputUi.container);
      //document.body.appendChild(this._codeOutputUi.container);

      // TODO: replace this with sub-controller for file input
      utils.get('test-svgs/tiger.svg').then(text => {
        this._onInputChange({
          data: text
        });
      });
    });
  }

  _onSettingsChange() {
    this._compressSvg();
  }

  async _onInputChange(event) {
    // TODO: this will become part of the file input loader
    try {
      this._inputSvg = await svgo.load(event.data);
    }
    catch(e) {
      this._handleError(e);
      return;
    }

    this._compressSvg();
  }

  _handleError(e) {
    // TODO: some UI for this
    console.error(e);
  }

  async _compressSvg() {
    var settings = this._settingsUi.getSettings();

    await svgo.abortCurrent();

    if (settings.original) {
      this._updateForFile(this._inputSvg, {
        gzip: settings.gzip
      });
      return;
    }

    var cacheMatch = this._cache.match(settings.fingerprint);

    if (cacheMatch) {
      this._updateForFile(cacheMatch, {
        compareToFile: this._inputSvg,
        gzip: settings.gzip
      });
      return;
    }

    this._resultsUi.working();

    try {
      var finalResultFile = await svgo.process(settings, resultFile => {
        this._updateForFile(resultFile, {
          compareToFile: this._inputSvg,
          gzip: settings.gzip
        });
      });

      this._cache.add(settings.fingerprint, finalResultFile);
    }
    catch(e) {
      if (e.message != "Abort") throw e;
    }
  }

  async _updateForFile(svgFile, {compareToFile, gzip}) {
    this._svgOuputUi.setSvg(svgFile.url, svgFile.width, svgFile.height);
    this._codeOutputUi.setCode(svgFile.text);
    this._downloadButtonUi.setDownload(svgFile.name, svgFile.url);

    this._resultsUi.update({
      comparisonSize: compareToFile && (await compareToFile.size({ compress: gzip })),
      size: await svgFile.size({ compress: gzip })
    });
  }
}

module.exports = MainController;