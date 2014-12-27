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
    this._outputSvg = null;

    utils.domReady.then(_ => {
      document.querySelector('.status').appendChild(this._resultsUi.container);
      //document.body.appendChild(this._downloadButtonUi.container);
      document.querySelector('.output').appendChild(this._svgOuputUi.container);
      //document.body.appendChild(this._codeOutputUi.container);

      // TODO: replace this with sub-controller for file input
      utils.get('test-svgs/tiger.svg').then(text => {
        this._onInputChange({
          svgFile: new SvgFile(text)
        });
      });
    });
  }

  _onSettingsChange() {
    this._compressSvg();
  }

  async _onInputChange(event) {
    this._inputSvg = event.svgFile;

    // TODO: this will become part of the file input loader
    try {
      this._inputDimensions = await svgo.load(this._inputSvg.text);
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

    if (settings.original) {
      this._updateForFile(this._inputSvg, this._inputDimensions, {
        gzip: settings.gzip
      });
      return;
    }

    this._resultsUi.working();

    var svgoResult = await svgo.process(settings);

    var update = _ => {
      this._updateOutputFile(new SvgFile(svgoResult.data));
      this._updateForFile(this._outputSvg, svgoResult.dimensions, {
        compareToFile: this._inputSvg,
        gzip: settings.gzip
      }); 
    }

    update();

    if (settings.multipass) {
      while (svgoResult = await svgo.nextPass()) {
        update();
      }
    }
  }

  _updateOutputFile(newOutput) {
    if (this._outputSvg) this._outputSvg.release();
    this._outputSvg = newOutput;
  }

  async _updateForFile(svgFile, dimensions, {compareToFile, gzip}) {
    this._svgOuputUi.setSvg(svgFile.url, dimensions);
    this._codeOutputUi.setCode(svgFile.text);
    this._downloadButtonUi.setDownload(svgFile.name, svgFile.url);

    this._resultsUi.update({
      comparisonSize: compareToFile && (await compareToFile.size({ compress: gzip })),
      size: await svgFile.size({ compress: gzip })
    });
  }
}

module.exports = MainController;