export const idbKeyval = (() => {
  let db;

  function getDB() {
    if (!db) {
      db = new Promise((resolve, reject) => {
        const openreq = indexedDB.open('svgo-keyval', 1);

        openreq.onerror = () => {
          reject(openreq.error);
        };

        openreq.onupgradeneeded = () => {
          // First time setup: create an empty object store
          openreq.result.createObjectStore('keyval');
        };

        openreq.onsuccess = () => {
          resolve(openreq.result);
        };
      });
    }
    return db;
  }

  async function withStore(type, callback) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('keyval', type);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      callback(transaction.objectStore('keyval'));
    });
  }

  return {
    async get(key) {
      let req;
      await withStore('readonly', store => {
        req = store.get(key);
      });
      return req.result;
    },
    set(key, value) {
      return withStore('readwrite', store => {
        store.put(value, key);
      });
    },
    delete(key) {
      return withStore('readwrite', store => {
        store.delete(key);
      });
    }
  };
})();
