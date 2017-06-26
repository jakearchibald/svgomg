"use strict";

var utils = require('./utils');
var storage = require('../utils/storage');

var Svgo = require('./svgo');
var SvgFile = require('./svg-file');
var ZipFile = require('./zip-file');

class MainController {
  constructor() {
    this._container = null;

    // ui components
    this._mainUi = null;
    this._outputUi = new (require('./ui/output'));
    this._downloadAllButtonUi = new (require('./ui/download-button'))({ minor: false });
    this._downloadButtonUi = new (require('./ui/download-button'))({ minor: true });
    this._copyButtonUi = new (require('./ui/copy-button'));
    this._bgFillUi = new (require('./ui/bg-fill'));
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
    this._mainMenuUi.on('filenameClick', e => this._onFileSelectionChange(e));
    this._dropUi.on('svgDataLoad', e => this._onInputChange(e));
    this._mainMenuUi.on('error', ({error}) => this._handleError(error));
    this._viewTogglerUi.on('change', e => this._onViewSelectionChange(e));

    // state
    this._selectedItemIndex = 0;
    this._inputItems = [];
    this._resultItems = [];
    this._cache = new (require('./results-cache'))(10);
    this._compressSettings = null;
    this._latestCompressJobId = 0;
    this._userHasInteracted = false;
    this._reloading = false;

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

      const actionContainer = document.querySelector('.action-button-container');
      const minorActionContainer = document.querySelector('.minor-action-container');

      minorActionContainer.appendChild(this._bgFillUi.container);

      if (this._copyButtonUi.isSupported()) {
        minorActionContainer.appendChild(this._copyButtonUi.container);
      }

      minorActionContainer.appendChild(this._downloadButtonUi.container);

      actionContainer.appendChild(this._downloadAllButtonUi.container);
      document.querySelector('.output').appendChild(this._outputUi.container);
      this._container.appendChild(this._toastsUi.container);
      this._container.appendChild(this._dropUi.container);
      document.querySelector('.menu-extra').appendChild(this._changelogUi.container);

      // load previous settings
      this._loadSettings();

      // someone managed to hit the preloader, aww
      if (this._preloaderUi.activated) {
        this._toastsUi.show("Ready now!", {
          duration: 3000
        });
      }

      // for testing
      if (false) {
        (async _ => {
          var items = [
            {
              data: await utils.get('test-svgs/car-lite.svg'),
              filename: 'car-lite.svg'
            },
            {
              data: await utils.get('test-svgs/car-lite-green.svg'),
              filename: 'car-lite-green.svg'
            }
          ];
          this._onInputChange({
            items: items
          });
        })();
      }
    });
  }

  _onViewSelectionChange(event) {
    this._outputUi.set(event.value);
  }

  _onFileSelectionChange(event) {
    this._selectedItemIndex = event.filenameIndex;
    this._updateUi();
    this._mainMenuUi.hide();
  }

  _onUpdateFound(registration) {
    var newWorker = registration.installing;

    registration.installing.addEventListener('statechange', async _ => {
      if (this._reloading) return;

      // the very first activation!
      // tell the user stuff works offline
      if (newWorker.state == 'activated' && !navigator.serviceWorker.controller) {
        this._toastsUi.show("Ready to work offline", {
          duration: 5000
        });
        return;
      }

      if (newWorker.state == 'activated' && navigator.serviceWorker.controller) {
        // if the user hasn't interacted yet, do a sneaky reload
        if (!this._userHasInteracted) {
          this._reloading = true;
          location.reload();
          return;
        }

        // otherwise, show the user an alert
        var toast = this._toastsUi.show("Update available", {
          buttons: ['reload', 'dismiss']
        });

        var answer = await toast.answer;

        if (answer == 'reload') {
          this._reloading = true;
          location.reload();
        }
      }
    });
  }

  _onSettingsChange() {
    var settings = this._settingsUi.getSettings();
    this._compressSettings = settings;
    this._saveSettings(settings);
    this._compressSvg();
  }

  async _onInputChange(event) {
    var settings = this._settingsUi.getSettings();
    this._compressSettings = settings;
    this._userHasInteracted = true;

    try {
      await this._releaseAll();

      this._inputItems = event.items.map((item) => {
        return Object.assign({}, item, {
          svgo: new Svgo(),
          svgFile: null
        });
      });

      this._selectedItemIndex = 0;

      var svgFiles = await this._loadAll();

      this._inputItems.forEach((item, itemIndex) => {
        item.svgFile = svgFiles[itemIndex];
      });

      this._resultItems = this._inputItems.map((item) => Object.assign({}, item));

      this._mainMenuUi.setFilenames(this._inputItems.map((item) => item.filename));
      this._mainMenuUi.setSelectedFilename(this._selectedItemIndex);
    }
    catch(e) {
      var error = new Error("Load failed: " + e.message);
      error.inner = e;
      this._mainMenuUi.stopSpinner();
      this._handleError(error);
      return;
    }

    this._cache.purge();

    var firstIteration = true;

    const compressed = () => {
      if (firstIteration) {
        this._outputUi.reset();
        this._mainUi.activate();
        this._mainMenuUi.allowHide = true;
        this._mainMenuUi.hide();
        firstIteration = false;
      }
    }

    this._compressSvg(() => compressed());

    if (firstIteration) {
      compressed();
    }
  }

  _handleError(e) {
    this._toastsUi.show(e.message);
    console.error(e);
  }

  async _loadSettings() {
    var settings = await storage.get('settings');
    if (settings) this._settingsUi.setSettings(settings);
  }

  _saveSettings(settings) {
    const copy = Object.assign({}, settings);
    // doesn't make sense to retain the "show original" option
    delete copy.original;
    storage.set('settings', copy);
  }

  _loadAll() {
    return Promise.all(this._inputItems.map((item) => item.svgo.load(item.data)));
  }

  _abortCurrentAll() {
    return Promise.all(this._inputItems.map((item) => item.svgo.abortCurrent()));
  }

  _processAll(settings, iterationCallback) {
    return Promise.all(this._inputItems.map((item) => item.svgo.process(settings, iterationCallback)));
  }

  _releaseAll() {
    return Promise.all(this._inputItems.map((item) => item.svgo.release()));
  }

  async _compressSvg(iterationCallback = function(){}) {
    var thisJobId = this._latestCompressJobId = Math.random();

    await this._abortCurrentAll();

    if (thisJobId != this._latestCompressJobId) {
      // while we've been waiting, there's been a newer call
      // to _compressSvg, we don't need to do anything
      return;
    }

    var settings = this._compressSettings;

    if (settings.original) {
      this._updateUi();
      this._latestCompressJobId = 0;
      return;
    }

    var cachedItems = this._cache.match(settings.fingerprint);
    if (cachedItems) {
      this._resultItems = cachedItems;
      this._updateUi();
      this._latestCompressJobId = 0;
      return;
    }

    this._downloadButtonUi.working();
    this._downloadAllButtonUi.working();

    try {
      this._resultItems = this._inputItems.map((item) => Object.assign({}, item));
      await this._processAll(settings, (svgo, resultFile) => {
        var itemIndex = this._inputItems.map((item) => item.svgo).indexOf(svgo);
        var item = this._inputItems[itemIndex];
        var resultItem = Object.assign({}, item, { svgFile: resultFile });
        this._resultItems[itemIndex] = resultItem;
        iterationCallback(item, resultItem);
        this._updateUi();
      });
      this._cache.add(settings.fingerprint, this._resultItems);
      this._updateUi();
    }
    catch(e) {
      if (e.message != "abort") { // TODO: should really be switching on error type
        e.message = "Minifying error: " + e.message;
        this._handleError(e);
      }
    }

    this._downloadButtonUi.done();
    this._downloadAllButtonUi.done();

    this._latestCompressJobId = 0;
  }

  async _updateUi() {
    var settings = this._compressSettings;
    var items = (settings.original ? this._inputItems : this._resultItems);

    this._mainMenuUi.setSelectedFilename(this._selectedItemIndex);

    await this._updateResultsUi({
      items: items,
      compareToItems: this._inputItems,
      selectedItemIndex: this._selectedItemIndex,
      gzip: settings.gzip,
      original: settings.original
    });

    this._downloadButtonUi.container.style.display = (items.length > 1 ? '' : 'none');
  }

  async _updateResultsUi({ items, compareToItems, selectedItemIndex, gzip, original }) {
    var measureItemSize = (item) => item.svgFile.size({ compress: gzip });
    var sumSize = (accu, x) => (accu + x);
    var sizeTotal = (await Promise.all(items.map(measureItemSize))).reduce(sumSize, 0);
    var compareToSizeTotal = (await Promise.all(compareToItems.map(measureItemSize))).reduce(sumSize, 0);

    var itemSelected = items[selectedItemIndex];
    var compareToItemSelected = compareToItems[selectedItemIndex];
    var sizeSelected = await measureItemSize(itemSelected);
    var compareToSizeSelected = (compareToItemSelected && (await measureItemSize(compareToItemSelected)));

    this._resultsUi.update({
      sizeTotal: sizeTotal,
      compareToSizeTotal: (original ? null : compareToSizeTotal),
      sizeSelected: sizeSelected,
      compareToSizeSelected: (original ? null : compareToSizeSelected)
    });

    this._outputUi.update(itemSelected.svgFile);

    this._copyButtonUi.setCopyText(itemSelected.svgFile.text, itemSelected.filename);

    this._downloadButtonUi.setDownload({
      filename: itemSelected.filename,
      url: itemSelected.svgFile.url,
      blob: itemSelected.svgFile.blob
    });

    if (items.length > 1) {
      this._downloadAllButtonUi.working();
      var zipFile = new ZipFile();
      items.forEach((item) => {
        zipFile.jszip.file(item.filename, item.svgFile.text);
      });
      await zipFile.compress();
      this._downloadAllButtonUi.done();
      this._downloadAllButtonUi.setDownload({
        filename: 'compressed.zip',
        url: zipFile.url,
        blob: zipFile.blob
      });
    }
    else {
      this._downloadAllButtonUi.setDownload({
        filename: itemSelected.filename,
        url: itemSelected.svgFile.url,
        blob: itemSelected.svgFile.blob
      });
    }
  }
}

module.exports = MainController;
