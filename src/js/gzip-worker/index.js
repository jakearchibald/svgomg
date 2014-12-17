var gzip = require('pako/lib/deflate').gzip;

self.onmessage = function(event) {
  try {
    var result = gzip(event.data.data).buffer;
    self.postMessage({
      _id: event.data._id,
      result: result
    }, [result]);
  }
  catch (error) {
    self.postMessage({
      _id: event.data._id,
      error: error.message
    });
  }
};