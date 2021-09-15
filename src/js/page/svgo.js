import WorkerMessenger from './worker-messenger.js';
import SvgFile from './svg-file.js';

export default class Svgo extends WorkerMessenger {
  constructor() {
    super('js/svgo-worker.js');
    this._currentJob = Promise.resolve();
  }

  async wrapOriginal(svgText) {
    const { width, height } = await this.requestResponse({
      action: 'wrapOriginal',
      data: svgText,
    });

    return new SvgFile(svgText, width, height);
  }

  process(svgText, settings) {
    this.abort();

    this._currentJob = this._currentJob
      .catch(() => {})
      .then(async () => {
        const { data, dimensions } = await this.requestResponse({
          action: 'process',
          settings,
          data: svgText,
        });

        // return final result
        return new SvgFile(data, dimensions.width, dimensions.height);
      });

    return this._currentJob;
  }
}
