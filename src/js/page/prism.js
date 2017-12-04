import WorkerMessenger from './worker-messenger';

export default class Prism extends WorkerMessenger {
  constructor() {
    super('js/prism-worker.js');
  }

  highlight(svgData) {
    return this._requestResponse({
      data: svgData
    });
  }
}
