import { createNanoEvents } from 'nanoevents';
import { domReady } from '../utils.js';

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

      this.container.addEventListener('change', () => {
        this.emitter.emit('change', {
          value: this.container.output.value,
        });
      });
    });
  }
}
