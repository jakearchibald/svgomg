var gzip = require('pako/lib/deflate').gzip;

self.onmessage = function(event) {
  try {
    var result = gzip(event.data.data).buffer;
    self.postMessage({
      id: event.data.id,
      result: result
    });
  }
  catch (error) {
    self.postMessage({
      id: event.data.id,
      error: error.message
    });
  }
};