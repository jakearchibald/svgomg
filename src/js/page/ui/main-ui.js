import { transitionToClass } from '../utils';

export default class MainUi {
  constructor(...elements) {
    this._activated = false;
    this._toActivate = elements;
  }

  activate() {
    if (this._activated) return;
    this._activated = true;

    return Promise.all(
      this._toActivate.map(el => transitionToClass(el))
    );
  }
}
