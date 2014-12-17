var gzip = require('pako/lib/deflate').gzip;

self.onmessage = function(event) {
  try {
    var result = gzip(event.data.data).buffer;
    self.postMessage({
      result: result
    }, [result]);
  }
  catch (error) {
    self.postMessage({
      error: error.message
    });
  }
};