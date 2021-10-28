import { createNanoEvents } from 'nanoevents';
import { domReady } from '../utils.js';
import MaterialSlider from './material-slider.js';
import Ripple from './ripple.js';

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
      const resetBtn = this.container.querySelector('.setting-reset');
      const ranges = this.container.querySelectorAll('input[type=range]');

      this._resetRipple = new Ripple();
      resetBtn.append(this._resetRipple.container);

      // map real range elements to Slider instances
      this._sliderMap = new WeakMap();

      // enhance ranges
      for (const range of ranges) {
        this._sliderMap.set(range, new MaterialSlider(range));
      }

      this.container.addEventListener('input', (event) =>
        this._onChange(event),
      );
      scroller.addEventListener('wheel', (event) => this._onMouseWheel(event));
      resetBtn.addEventListener('click', () => this._onReset());

      // TODO: revisit this
      // Stop double-tap text selection.
      // This stops all text selection which is kinda sad.
      // I think this code will bite me.
      scroller.addEventListener('mousedown', (event) => {
        if (event.target.closest('input[type=range]')) return;
        event.preventDefault();
      });
    });
  }

  _onMouseWheel(event) {
    // Prevents bounce effect on desktop.
    // Firefox uses pixels on a mouse wheel, ignore it
    // 1 is "lines", 0 is "pixels"
    if (event.deltaMode === 0) {
      event.preventDefault();
      event.currentTarget.scrollTop += event.deltaY;
    }
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
    const overrides = this.getSettingsOverride();

    // Set all inputs according to their initial attributes
    for (const inputEl of this._globalInputs) {
      if (inputEl.type === 'checkbox') {
        inputEl.checked = Object.prototype.hasOwnProperty.call(
          overrides,
          inputEl.name,
        )
          ? overrides[inputEl.name]
          : inputEl.hasAttribute('checked');
      } else if (inputEl.type === 'range') {
        this._sliderMap.get(inputEl).value =
          Object.prototype.hasOwnProperty.call(overrides, inputEl.name)
            ? overrides[inputEl.name]
            : inputEl.getAttribute('value');
      }
    }

    for (const inputEl of this._pluginInputs) {
      inputEl.checked = Object.prototype.hasOwnProperty.call(
        overrides.plugins,
        inputEl.name,
      )
        ? overrides.plugins[inputEl.name]
        : inputEl.hasAttribute('checked');
    }

    this.emitter.emit('reset', oldSettings);
    this.emitter.emit('change');
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

  getSettingsOverride() {
    const searchParams = new URLSearchParams(window.location.search);

    const overrides = {
      plugins: {},
    };

    for (const inputEl of this._globalInputs) {
      if (!searchParams.has(inputEl.name) || inputEl.name === 'original')
        continue;

      const value = searchParams.get(inputEl.name);
      if (inputEl.type === 'checkbox' && ['true', 'false'].includes(value)) {
        overrides[inputEl.name] = value === 'true';
      } else if (inputEl.type === 'range') {
        const rangeValue = Number.parseInt(value, 10);
        if (rangeValue < inputEl.min || inputEl.max < rangeValue) continue;
        overrides[inputEl.name] = rangeValue;
      }
    }

    for (const inputEl of this._pluginInputs) {
      const value = searchParams.get(inputEl.name);
      if (!['true', 'false'].includes(value)) continue;
      overrides.plugins[inputEl.name] = value === 'true';
    }

    return overrides;
  }
}
