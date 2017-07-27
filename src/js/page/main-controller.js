import { idbKeyval as storage } from '../utils/storage';
import Svgo from './svgo';
import SvgFile from './svg-file';
import ZipFile from './zip-file';
import { domReady, fetchText } from './utils';
import Output from './ui/output';
import DownloadButton from './ui/download-button';
import CopyButton from './ui/copy-button';
import BgFillButton from './ui/bg-fill-button';
import Results from './ui/results';
import Settings from './ui/settings';
import MainMenu from './ui/main-menu';
import Toasts from './ui/toasts';
import FileDrop from './ui/file-drop';
import Preloader from './ui/preloader';
import Changelog from './ui/changelog';
import ResultsContainer from './ui/results-container';
import ViewToggler from './ui/view-toggler';
import ResultsCache from './results-cache';
import MainUi from './ui/main-ui';

export default class MainController {
  constructor() {
    this._container = null;

    // ui components
    this._mainUi = null;
    this._outputUi = new Output();
    this._downloadAllButtonUi = new DownloadButton({ minor: false });
    this._downloadButtonUi = new DownloadButton({ minor: true });
    this._copyButtonUi = new CopyButton();
    this._bgFillUi = new BgFillButton();
    this._resultsUi = new Results();
    this._settingsUi = new Settings();
    this._mainMenuUi = new MainMenu();
    this._toastsUi = new Toasts();
    this._dropUi = new FileDrop();
    this._preloaderUi = new Preloader();
    this._changelogUi = new Changelog(self.version);
    this._resultsContainerUi = new ResultsContainer(this._resultsUi);
    this._viewTogglerUi = new ViewToggler();

    // ui events
    this._settingsUi.on('change', () => this._onSettingsChange());
    this._mainMenuUi.on('svgDataLoad', e => this._onInputChange(e));
    this._mainMenuUi.on('filenameClick', e => this._onFileSelectionChange(e));
    this._dropUi.on('svgDataLoad', e => this._onInputChange(e));
    this._mainMenuUi.on('error', ({error}) => this._handleError(error));
    this._viewTogglerUi.on('change', e => this._onViewSelectionChange(e));

    // state
    this._selectedItemIndex = 0;
    this._inputItems = [];
    this._resultItems = [];
    this._cache = new ResultsCache(10);
    this._compressSettings = null;
    this._latestCompressJobId = 0;
    this._userHasInteracted = false;
    this._reloading = false;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js', {
        scope: './'
      }).then(registration => {
        registration.addEventListener('updatefound', () => this._onUpdateFound(registration));
      });
    }

    // tell the user about the latest update
    storage.get('last-seen-version').then(lastSeenVersion => {
      if (lastSeenVersion) {
        this._changelogUi.showLogFrom(lastSeenVersion);
      }
      storage.set('last-seen-version', self.version);
    });

    domReady.then(() => {
      this._container = document.querySelector('.app-output');

      // elements for intro anim
      this._mainUi = new MainUi(
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
        (async () => {
          const items = [
            {
              data: await fetchText('test-svgs/car-lite.svg'),
              filename: 'car-lite.svg'
            },
            {
              data: await fetchText('test-svgs/car-lite-green.svg'),
              filename: 'car-lite-green.svg'
            }
          ];
          this._onInputChange({ items });
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
    const newWorker = registration.installing;

    registration.installing.addEventListener('statechange', async () => {
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
        const toast = this._toastsUi.show("Update available", {
          buttons: ['reload', 'dismiss']
        });

        const answer = await toast.answer;

        if (answer == 'reload') {
          this._reloading = true;
          location.reload();
        }
      }
    });
  }

  _onSettingsChange() {
    const settings = this._settingsUi.getSettings();
    this._compressSettings = settings;
    this._saveSettings(settings);
    this._compressSvg();
  }

  async _onInputChange(event) {
    const settings = this._settingsUi.getSettings();
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

      const svgFiles = await this._loadAll();

      this._inputItems.forEach((item, itemIndex) => {
        item.svgFile = svgFiles[itemIndex];
      });

      this._resultItems = this._inputItems.map((item) => Object.assign({}, item));

      this._mainMenuUi.setFilenames(this._inputItems.map((item) => item.filename));
      this._mainMenuUi.setSelectedFilename(this._selectedItemIndex);
    }
    catch(e) {
      const error = new Error("Load failed: " + e.message);
      error.inner = e;
      this._mainMenuUi.stopSpinner();
      this._handleError(error);
      return;
    }

    this._cache.purge();

    let firstIteration = true;

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
    const settings = await storage.get('settings');
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
    const thisJobId = this._latestCompressJobId = Math.random();

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

    const cachedItems = this._cache.match(settings.fingerprint);

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
        const itemIndex = this._inputItems.map((item) => item.svgo).indexOf(svgo);
        const item = this._inputItems[itemIndex];
        const resultItem = Object.assign({}, item, { svgFile: resultFile });
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
    const settings = this._compressSettings;
    const items = (settings.original ? this._inputItems : this._resultItems);

    this._mainMenuUi.setSelectedFilename(this._selectedItemIndex);

    await this._updateResultsUi({
      items,
      compareToItems: this._inputItems,
      selectedItemIndex: this._selectedItemIndex,
      gzip: settings.gzip,
      original: settings.original
    });

    this._downloadButtonUi.container.style.display = (items.length > 1 ? '' : 'none');
  }

  async _updateResultsUi({ items, compareToItems, selectedItemIndex, gzip, original }) {
    const measureItemSize = (item) => item.svgFile.size({ compress: gzip });
    const sumSize = (accu, x) => (accu + x);
    const sizeTotal = (await Promise.all(items.map(measureItemSize))).reduce(sumSize, 0);
    const compareToSizeTotal = (await Promise.all(compareToItems.map(measureItemSize))).reduce(sumSize, 0);

    const itemSelected = items[selectedItemIndex];
    const compareToItemSelected = compareToItems[selectedItemIndex];
    const sizeSelected = await measureItemSize(itemSelected);
    const compareToSizeSelected = (compareToItemSelected && (await measureItemSize(compareToItemSelected)));

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
      const zipFile = new ZipFile();
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

