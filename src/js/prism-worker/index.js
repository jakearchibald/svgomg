// prism likes to terminate if it thinks it's inside
// a worker, I don't want it to do that, so this
// is all trickery-foolery:
var addEventListener = self.addEventListener;
self.addEventListener = null;
var Prism = require('prismjs');
self.addEventListener = addEventListener;

self.onmessage = function(event) {
  try {
    self.postMessage({
      id: event.data.id,
      result: Prism.highlight(event.data.data, Prism.languages.markup)
    });
  }
  catch (error) {
    self.postMessage({
      id: event.data.id,
      error: error.message
    });
  }
};