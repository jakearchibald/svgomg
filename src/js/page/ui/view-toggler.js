import { createNanoEvents } from 'nanoevents';
import { domReady } from '../utils';

/**
 * Tabs that toggle between showing the SVG image and XML markup.
 */
export default class ViewToggler {
  constructor() {
    this.emitter = createNanoEvents();
    /** @type {HTMLFormElement | null} */
    this.container = null;

    domReady.then(() => {
      this.container = document.querySelector('.view-toggler');

      // stop browsers remembering previous form state
      this.container.output[0].checked = true;

      this.container.addEventListener('change', e => this._onChange(e));
    });
  }

  _onChange(event) {
    let value = this.container.output.value;

    if (!value) { // some browsers don't support the nice shortcut above (eg Safari)
      value = Array.from(this.container.output).reduce((value, input) => {
        return value || (input.checked ? input.value : '');
      }, '');
    }

    this.emitter.emit("change", { value });
  }
}
