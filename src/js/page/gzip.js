import WorkerMessenger from './worker-messenger.js';

class Gzip extends WorkerMessenger {
  constructor() {
    super('js/gzip-worker.js');
  }

  compress(data) {
    return this.requestResponse({ data });
  }
}

export const gzip = new Gzip();
