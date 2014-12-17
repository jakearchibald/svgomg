var WorkerMessenger = require('./worker-messenger');

function Svgo() {
  WorkerMessenger.call(this, 'js/svgo-worker.js');
}

var SvgoProto = Svgo.prototype = Object.create(WorkerMessenger.prototype);

SvgoProto.process = function(svgData) {
  return this._requestResponse({
    data: svgData
  });
};

module.exports = new Svgo();