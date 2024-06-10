import { createNanoEvents } from 'nanoevents';
import { getActivePlugins } from '../../utils/settings.js';
import { domReady } from '../utils.js';
import MaterialSlider from './material-slider.js';
import Ripple from './ripple.js';

function createFileURL(data, type) {
  return window.URL.createObjectURL(new Blob([data], { type }));
}

export default class Settings {
  constructor() {
    this.emitter = createNanoEvents();
    this._throttleTimeout = null;

    domReady.then(() => {
      this.container = document.querySelector('.settings');
      this._pluginInputs = [
        ...this.container.querySelectorAll('.plugins input'),
      ];
      this._globalInputs = [
        ...this.container.querySelectorAll('.global input'),
      ];

      const scroller = this.container.querySelector('.settings-scroller');
      const exportBtn = this.container.querySelector('.setting-export');
      const resetBtn = this.container.querySelector('.setting-reset');
      const ranges = this.container.querySelectorAll('input[type=range]');

      this._resetRipple = new Ripple();
      resetBtn.append(this._resetRipple.container);

      this._exportLink = exportBtn;
      this._exportRipple = new Ripple();
      exportBtn.append(this._exportRipple.container);

      // map real range elements to Slider instances
      this._sliderMap = new WeakMap();

      // enhance ranges
      for (const range of ranges) {
        this._sliderMap.set(range, new MaterialSlider(range));
      }

      this.container.addEventListener('input', (event) =>
        this._onChange(event),
      );
      resetBtn.addEventListener('click', () => this._onReset());
      exportBtn.addEventListener('click', () => this._onExport());

      // TODO: revisit this
      // Stop double-tap text selection.
      // This stops all text selection which is kinda sad.
      // I think this code will bite me.
      scroller.addEventListener('mousedown', (event) => {
        if (event.target.closest('input[type=range]')) return;
        event.preventDefault();
      });

      this._onUpdateExportLink();
      this.emitter.on('change', () => this._onUpdateExportLink());
    });
  }

  _onChange(event) {
    clearTimeout(this._throttleTimeout);

    // throttle range
    if (event.target.type === 'range') {
      this._throttleTimeout = setTimeout(
        () => this.emitter.emit('change'),
        150,
      );
    } else {
      this.emitter.emit('change');
    }
  }

  _onReset() {
    this._resetRipple.animate();
    const oldSettings = this.getSettings();

    // Set all inputs according to their initial attributes
    for (const inputEl of this._globalInputs) {
      if (inputEl.type === 'checkbox') {
        inputEl.checked = inputEl.hasAttribute('checked');
      } else if (inputEl.type === 'range') {
        this._sliderMap.get(inputEl).value = inputEl.getAttribute('value');
      }
    }

    for (const inputEl of this._pluginInputs) {
      inputEl.checked = inputEl.hasAttribute('checked');
    }

    this.emitter.emit('reset', oldSettings);
    this.emitter.emit('change');
  }

  _onExport() {
    this._exportRipple.animate();
  }

  _onUpdateExportLink() {
    const { fingerprint, multipass, pretty, ...settings } = this.getSettings();

    const plugins = getActivePlugins(settings);

    const svgoConfig = {
      multipass,
      js2svg: {
        indent: 2,
        pretty,
      },
      plugins,
    };

    this._exportLink.setAttribute(
      'href',
      createFileURL(`module.exports = ${JSON.stringify(svgoConfig, null, 2)}`),
      'data:text/plain',
    );
    this._exportLink.setAttribute('download', 'svgo.config.js');
  }

  setSettings(settings) {
    for (const inputEl of this._globalInputs) {
      if (!(inputEl.name in settings)) continue;

      if (inputEl.type === 'checkbox') {
        inputEl.checked = settings[inputEl.name];
      } else if (inputEl.type === 'range') {
        this._sliderMap.get(inputEl).value = settings[inputEl.name];
      }
    }

    for (const inputEl of this._pluginInputs) {
      if (!(inputEl.name in settings.plugins)) continue;
      inputEl.checked = settings.plugins[inputEl.name];
    }

    this._onUpdateExportLink();
  }

  getSettings() {
    // fingerprint is used for cache lookups
    const fingerprint = [];
    const output = {
      plugins: {},
    };

    for (const inputEl of this._globalInputs) {
      if (inputEl.name !== 'gzip' && inputEl.name !== 'original') {
        if (inputEl.type === 'checkbox') {
          fingerprint.push(Number(inputEl.checked));
        } else {
          fingerprint.push(`|${inputEl.value}|`);
        }
      }

      output[inputEl.name] =
        inputEl.type === 'checkbox' ? inputEl.checked : inputEl.value;
    }

    for (const inputEl of this._pluginInputs) {
      fingerprint.push(Number(inputEl.checked));
      output.plugins[inputEl.name] = inputEl.checked;
    }

    output.fingerprint = fingerprint.join(',');

    return output;
  }
}
