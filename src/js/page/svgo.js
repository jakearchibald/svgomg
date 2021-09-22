import WorkerMessenger from './worker-messenger';
import SvgFile from './svg-file';

export default class Svgo extends WorkerMessenger {
  constructor() {
    super('js/svgo-worker.js');
    this._currentJob = Promise.resolve();
  }

  async wrapOriginal(svgText) {
    const {width, height} = await this._requestResponse({
      action: 'wrapOriginal',
      data: svgText
    });

    return new SvgFile(svgText, width, height);
  }

  process(svgText, settings) {
    this.abort();

    return this._currentJob = this._currentJob.catch(() => {}).then(async () => {
      const result = await this._requestResponse({
        action: 'process',
        settings,
        data: svgText,
      });

      // return final result
      return new SvgFile(result.data, result.dimensions.width, result.dimensions.height);
    });
  }
}
