function WorkerMessenger(url) {
  var workerMessenger = this;
  this._requestId = 0;
  this._worker = new Worker(url);

  // worker jobs awaiting response {callId: [resolve, reject]}
  this._pending = {};
  this._worker.onmessage = function(event) {
    if (!event.data._id) {
      console.log("Unexpected message", event);
      return;
    }

    var resolver = workerMessenger._pending[event.data._id];

    if (!resolver) {
      console.log("No resolver for", event);
      return;
    }

    delete workerMessenger._pending[event.data._id];

    if (event.data.error) {
      resolver[1](Error(event.data.error));
      return;
    }

    resolver[0](event.data.result);
  };
}

WorkerMessenger.prototype._requestResponse = function(message) {
  var workerMessenger = this;
  var requestId = ++this._requestId;
  message._id = requestId;

  return new Promise(function(resolve, reject) {
    workerMessenger._pending[requestId] = [resolve, reject];
    workerMessenger._worker.postMessage(message);
  });
};

module.exports = WorkerMessenger;