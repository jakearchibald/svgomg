import WorkerMessenger from './worker-messenger';

class Gzip extends WorkerMessenger {
  constructor() {
    super('js/gzip-worker.js');
  }

  compress(svgData) {
    return this._requestResponse({
      data: svgData
    });
  }
}

export const gzip = new Gzip();
