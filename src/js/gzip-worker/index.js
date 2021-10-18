import { gzip } from 'pako/dist/pako_deflate.js';

self.onmessage = (event) => {
  try {
    const result = gzip(event.data.data).buffer;
    self.postMessage({
      id: event.data.id,
      result,
    });
  } catch (error) {
    self.postMessage({
      id: event.data.id,
      error: error.message,
    });
  }
};
