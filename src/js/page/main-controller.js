"use strict";

var utils = require('./utils');
var svgo = new (require('./svgo'));

var SvgFile = require('./svg-file');

class MainController {
  constructor() {
    this._container = null;

    // ui components
    this._svgOuputUi = new (require('./ui/svg-output'));
    this._codeOutputUi = new (require('./ui/code-output'));
    this._downloadButtonUi = new (require('./ui/download-button'));
    this._resultsUi = new (require('./ui/results'));
    this._settingsUi = new (require('./ui/settings'));
    this._mainMenuUi = new (require('./ui/main-menu'));
    this._toastsUi = new (require('./ui/toasts'));

    // ui events
    this._settingsUi.on('change', _ => this._onSettingsChange());
    this._mainMenuUi.on('svgDataLoad', e => this._onInputChange(e));

    // state
    this._inputFilename = 'image.svg';
    this._inputSvg = null;
    this._inputDimensions = null;
    this._cache = new (require('./results-cache'))(10);
    this._latestCompressJobId = 0;

    utils.domReady.then(_ => {
      var output = document.querySelector('.output');

      this._container = document.querySelector('.app-output');

      document.querySelector('.status').appendChild(this._resultsUi.container);
      output.appendChild(this._downloadButtonUi.container);
      output.appendChild(this._svgOuputUi.container);
      //document.body.appendChild(this._codeOutputUi.container);
      this._container.appendChild(this._toastsUi.container);
    });
  }

  _onSettingsChange() {
    this._compressSvg();
  }

  async _onInputChange(event) {
    try {
      this._inputSvg = await svgo.load(event.data);
      this._inputFilename = event.filename;
    }
    catch(e) {
      e.message = "Load failed: " + e.message;
      this._mainMenuUi.stopSpinner();
      this._handleError(e);
      return;
    }

    this._cache.purge();

    var firstItteration = true;
    this._compressSvg(_ => {
      if (firstItteration) {

        utils.transitionToClass(document.querySelector('.toolbar'));
        this._downloadButtonUi.activate();
        this._svgOuputUi.activate();
        this._settingsUi.activate();

        this._mainMenuUi.allowHide = true;
        this._mainMenuUi.hide();
        firstItteration = false;
      }
    });

  }

  _handleError(e) {
    this._toastsUi.show(e.message);
    console.error(e);
  }

  async _compressSvg(itterationCallback = function(){}) {
    var thisJobId = this._latestCompressJobId = Math.random();
    var settings = this._settingsUi.getSettings();

    await svgo.abortCurrent();

    if (thisJobId != this._latestCompressJobId) {
      // while we've been waiting, there's been a newer call
      // to _compressSvg, we don't need to do anything
      return;
    }

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
        itterationCallback(resultFile);
        this._updateForFile(resultFile, {
          compareToFile: this._inputSvg,
          gzip: settings.gzip
        });
      });
      this._cache.add(settings.fingerprint, finalResultFile);
    }
    catch(e) {
      if (e.message != "abort") { // TODO: should really be switching on error type
        e.message = "Minifying error: " + e.message;
        this._handleError(e);
      }
    }
  }

  async _updateForFile(svgFile, {compareToFile, gzip}) {
    this._svgOuputUi.setSvg(svgFile.url, svgFile.width, svgFile.height);

    this._codeOutputUi.setCode(svgFile.text);
    this._downloadButtonUi.setDownload(this._inputFilename, svgFile.url);

    this._resultsUi.update({
      comparisonSize: compareToFile && (await compareToFile.size({ compress: gzip })),
      size: await svgFile.size({ compress: gzip })
    });
  }
}

module.exports = MainController;