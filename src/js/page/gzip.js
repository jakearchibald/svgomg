var WorkerMessenger = require('./worker-messenger');

function Gzip() {
  WorkerMessenger.call(this, 'js/gzip-worker.js');
}

var GzipProto = Gzip.prototype = Object.create(WorkerMessenger.prototype);

GzipProto.compress = function(svgData) {
  return this._requestResponse({
    data: svgData
  });
};

module.exports = new Gzip();