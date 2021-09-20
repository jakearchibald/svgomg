// This needs to be an import so it executes before Prism
import './prism-config';
import Prism from 'prismjs';

self.onmessage = (event) => {
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
