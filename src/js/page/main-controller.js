import { idbKeyval as storage } from '../utils/storage';
import Svgo from './svgo';
import { domReady } from './utils';
import Output from './ui/output';
import DownloadButton from './ui/download-button';
import CopyButton from './ui/copy-button';
import { copySupported } from './ui/copy-button';
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

const svgo = new Svgo();

export default class MainController {
  constructor() {
    this._container = null;

    // ui components
    this._mainUi = null;
    this._outputUi = new Output();
    this._downloadButtonUi = new DownloadButton();
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
    this._settingsUi.emitter.on('change', () => this._onSettingsChange());
    this._settingsUi.emitter.on('reset', oldSettings => this._onSettingsReset(oldSettings));
    this._mainMenuUi.emitter.on('svgDataLoad', e => this._onInputChange(e));
    this._dropUi.emitter.on('svgDataLoad', e => this._onInputChange(e));
    this._mainMenuUi.emitter.on('error', ({error}) => this._handleError(error));
    this._viewTogglerUi.emitter.on('change', e => this._onViewSelectionChange(e));
    window.addEventListener('keydown', e => this._onGlobalKeyDown(e));

    // state
    this._inputItem = null;
    this._cache = new ResultsCache(10);
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

      if (copySupported) {
        minorActionContainer.appendChild(this._copyButtonUi.container);
      }

      actionContainer.appendChild(this._downloadButtonUi.container);

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
      // eslint-disable-next-line no-constant-condition
      if (false) {
        (async () => {
          this._onInputChange({
            data: await fetch('test-svgs/car-lite.svg').then(r => r.text()),
            filename: 'car-lite.svg'
          });
        })();
      }
    });
  }

  _onGlobalKeyDown(event) {
    if (event.key === 'o' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this._mainMenuUi.showFilePicker();
    }
  }

  _onViewSelectionChange(event) {
    this._outputUi.set(event.value);
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
    this._saveSettings(settings);
    this._compressSvg(settings);
  }

  async _onSettingsReset(oldSettings) {
    const toast = this._toastsUi.show("Settings reset", {
      buttons: ['undo', 'dismiss'],
      duration: 5000
    });

    if ((await toast.answer) === 'undo') {
      this._settingsUi.setSettings(oldSettings);
      this._onSettingsChange();
    }
  }

  async _onInputChange(event) {
    const settings = this._settingsUi.getSettings();
    this._userHasInteracted = true;

    try {
      this._inputItem = await svgo.wrapOriginal(event.data);
      this._inputFilename = event.filename;
    }
    catch(e) {
      const error = new Error("Load failed: " + e.message);
      this._mainMenuUi.stopSpinner();
      this._handleError(error);
      return;
    }

    this._cache.purge();

    this._compressSvg(settings);
    this._outputUi.reset();
    this._mainUi.activate();
    this._mainMenuUi.allowHide = true;
    this._mainMenuUi.hide();
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

  async _compressSvg(settings) {
    const thisJobId = this._latestCompressJobId = Math.random();

    await svgo.abort();

    if (thisJobId != this._latestCompressJobId) {
      // while we've been waiting, there's been a newer call
      // to _compressSvg, we don't need to do anything
      return;
    }

    if (settings.original) {
      this._updateForFile(this._inputItem, {
        compress: settings.gzip
      });
      return;
    }

    const cacheMatch = this._cache.match(settings.fingerprint);

    if (cacheMatch) {
      this._updateForFile(cacheMatch, {
        compareToFile: this._inputItem,
        compress: settings.gzip
      });
      return;
    }

    this._downloadButtonUi.working();

    try {
      const finalResultFile = await svgo.process(this._inputItem.text, settings);

      this._updateForFile(finalResultFile, {
        compareToFile: this._inputItem,
        compress: settings.gzip
      });

      this._cache.add(settings.fingerprint, finalResultFile);
    }
    catch (e) {
      if (e.name === "AbortError") return;
      e.message = "Minifying error: " + e.message;
      this._handleError(e);
    }
    finally {
      this._downloadButtonUi.done();
    }
  }

  async _updateForFile(svgFile, { compareToFile, compress }) {
    this._outputUi.update(svgFile);
    this._downloadButtonUi.setDownload(this._inputFilename, svgFile);
    this._copyButtonUi.setCopyText(svgFile.text);

    this._resultsUi.update({
      comparisonSize: compareToFile && (await compareToFile.size({ compress })),
      size: await svgFile.size({ compress })
    });
  }
}

