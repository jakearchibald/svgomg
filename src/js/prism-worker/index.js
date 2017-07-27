// Hide addEventListener from prism - I want to add my own listener
import './prism-hack-start';
import Prism from 'prismjs';
import './prism-hack-end';

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