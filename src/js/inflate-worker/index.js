import { ungzip } from 'pako/lib/inflate';

self.onmessage = (event) => {
  try {
    const result = ungzip(event.data.data);
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
