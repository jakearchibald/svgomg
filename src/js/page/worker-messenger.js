"use strict";

class WorkerMessenger {
  constructor(url) {
    this._requestId = 0;
    this._worker = new Worker(url);

    // worker jobs awaiting response {callId: [resolve, reject]}
    this._pending = {};

    this._worker.onmessage = event => this._onMessage(event);
  }

  _onMessage(event) {
    if (!event.data.id) {
      console.log("Unexpected message", event);
      return;
    }

    var resolver = this._pending[event.data.id];

    if (!resolver) {
      console.log("No resolver for", event);
      return;
    }

    delete this._pending[event.data.id];

    if (event.data.error) {
      resolver[1](new Error(event.data.error));
      return;
    }

    resolver[0](event.data.result);
  }

  _requestResponse(message) {
    var workerMessenger = this;
    var requestId = ++this._requestId;
    message.id = requestId;

    return new Promise(function(resolve, reject) {
      workerMessenger._pending[requestId] = [resolve, reject];
      workerMessenger._worker.postMessage(message);
    });
  }
}

module.exports = WorkerMessenger;