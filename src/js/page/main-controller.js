"use strict";

var utils = require('./utils');
var svgo = new (require('./svgo'));
var storage = require('../utils/storage');

var SvgFile = require('./svg-file');

class MainController {
  constructor() {
    this._container = null;

    // ui components
    this._mainUi = null;
    this._outputUi = new (require('./ui/output'));
    this._downloadButtonUi = new (require('./ui/download-button'));
    this._resultsUi = new (require('./ui/results'));
    this._settingsUi = new (require('./ui/settings'));
    this._mainMenuUi = new (require('./ui/main-menu'));
    this._toastsUi = new (require('./ui/toasts'));
    this._dropUi = new (require('./ui/file-drop'));
    this._preloaderUi = new (require('./ui/preloader'));
    this._changelogUi = new (require('./ui/changelog'))(self.version);
    this._resultsContainerUi = new (require('./ui/results-container'))(this._resultsUi);
    this._viewTogglerUi = new (require('./ui/view-toggler'));

    // ui events
    this._settingsUi.on('change', _ => this._onSettingsChange());
    this._mainMenuUi.on('svgDataLoad', e => this._onInputChange(e));
    this._dropUi.on('svgDataLoad', e => this._onInputChange(e));
    this._mainMenuUi.on('error', ({error}) => this._handleError(error));
    this._viewTogglerUi.on('change', e => this._onViewSelectionChange(e));

    // state
    this._inputFilename = 'image.svg';
    this._inputSvg = null;
    this._cache = new (require('./results-cache'))(10);
    this._latestCompressJobId = 0;
    this._userHasInteracted = false;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js', {
        scope: './'
      }).then(registration => {
        registration.addEventListener('updatefound', _ => this._onUpdateFound(registration));
      });
    }

    // tell the user about the latest update
    storage.get('last-seen-version').then(lastSeenVersion => {
      if (lastSeenVersion) {
        this._changelogUi.showLogFrom(lastSeenVersion);
      }
      storage.set('last-seen-version', self.version);
    });

    utils.domReady.then(_ => {
      this._container = document.querySelector('.app-output');

      // elements for intro anim
      this._mainUi = new (require('./ui/main-ui'))(
        document.querySelector('.toolbar'),
        document.querySelector('.action-button-container'),
        this._outputUi.container,
        this._settingsUi.container
      );

      document.querySelector('.action-button-container').appendChild(this._downloadButtonUi.container);
      document.querySelector('.output').appendChild(this._outputUi.container);
      this._container.appendChild(this._toastsUi.container);
      this._container.appendChild(this._dropUi.container);
      document.querySelector('.menu-extra').appendChild(this._changelogUi.container);

      // someone managed to hit the preloader, aww
      if (this._preloaderUi.activated) {
        this._toastsUi.show("Ready now!", {
          duration: 3000
        });
      }

      /*
      // for testing
      async _ => {
        this._onInputChange({
          data: await utils.get('test-svgs/car-lite.svg'),
          filename: 'car.svg'
        });
      }();
      */
    });
  }

  _onViewSelectionChange(event) {
    this._outputUi.set(event.value);
  }

  _onUpdateFound(registration) {
    var newWorker = registration.installing;

    registration.installing.addEventListener('statechange', async _ => {
      // the very first activation!
      // tell the user stuff works offline
      if (newWorker.state == 'activated' && !navigator.serviceWorker.controller) {
        this._toastsUi.show("Ready to work offline", {
          duration: 5000
        });
        return;
      }

      if (newWorker.state == 'installed' && navigator.serviceWorker.controller) {
        var activeVersion = await storage.get('active-version');
        
        // activeVersion is undefined for sw-null
        // if the main version has changed, bail
        if (activeVersion && activeVersion.split('.')[0] != self.version.split('.')[0]) return;

        // if the user hasn't interacted yet, do a sneaky reload
        if (!this._userHasInteracted) {
          location.reload();
          return;
        }

        // otherwise, show the user an alert
        var toast = this._toastsUi.show("Update available", {
          buttons: ['reload', 'dismiss']
        });

        var answer = await toast.answer;

        if (answer == 'reload') {
          location.reload();
        }
      }
    });
  }

  _onSettingsChange() {
    this._compressSvg();
  }

  async _onInputChange(event) {
    this._userHasInteracted = true;

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
        this._outputUi.reset();
        this._mainUi.activate();
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

    this._downloadButtonUi.working();

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

    this._downloadButtonUi.done();
  }

  async _updateForFile(svgFile, {compareToFile, gzip}) {
    this._outputUi.update(svgFile);
    this._downloadButtonUi.setDownload(this._inputFilename, svgFile.url);

    this._resultsUi.update({
      comparisonSize: compareToFile && (await compareToFile.size({ compress: gzip })),
      size: await svgFile.size({ compress: gzip })
    });
  }
}

module.exports = MainController;