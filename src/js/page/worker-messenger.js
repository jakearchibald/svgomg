"use strict";

export default class WorkerMessenger {
  constructor(url) {
    this._requestId = 0;
    // worker jobs awaiting response { [requestId]: [ resolve, reject ] }
    this._pending = {};
    this._url = url;
    this._worker = new Worker(this._url);
    this._worker.onmessage = event => this._onMessage(event);
  }

  async release() {
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
    }
    for (const key of Object.keys(this._pending)) {
      this._fulfillPending(id, null, new Error("Worker terminated: " + this._url));
    }
  }

  _postMessage(message) {
    this._worker.postMessage(message);
  }

  _onMessage(event) {
    if (!event.data.id) {
      console.log("Unexpected message", event);
      return;
    }

    this._fulfillPending(event.data.id, event.data.result, event.data.error);
  }

  _fulfillPending(id, result, error) {
    const resolver = this._pending[id];

    if (!resolver) {
      console.log("No resolver for", { id, result, error });
      return;
    }

    delete this._pending[id];

    if (error) {
      resolver[1](new Error(error));
      return;
    }

    resolver[0](result);
  }

  _requestResponse(message) {
    return new Promise((resolve, reject) => {
      message.id = ++this._requestId;
      this._pending[message.id] = [resolve, reject];
      this._postMessage(message);
    });
  }
}
