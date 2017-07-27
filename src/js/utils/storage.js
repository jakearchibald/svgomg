import idb from 'idb-keyval';

export let idbKeyval = idb;

// iOS add-to-homescreen is missing IDB, or at least it used to.
// I haven't tested this in a while.
if (!self.indexedDB) {
  idbKeyval = {
    get: key => Promise.resolve(localStorage.getItem(key)),
    set: (key, val) => Promise.resolve(localStorage.setItem(key, val)),
    delete: key => Promise.resolve(localStorage.removeItem(key))
  };
}
