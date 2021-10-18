import WorkerMessenger from './worker-messenger.js';

export default class Prism extends WorkerMessenger {
  constructor() {
    super('js/prism-worker.js');
  }

  highlight(data) {
    return this.requestResponse({ data });
  }
}
