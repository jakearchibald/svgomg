var Idb = require('./indexeddouchbag');
var idb;

// avoid opening idb until first call
function getIdb() {
  if (!idb) {
    idb = new Idb('svgo-keyval', 1, function(db) {
      db.createObjectStore('keyval');
    });
  }
  return idb;
}

if (self.indexedDB) {
  module.exports = {
    get: key => getIdb().get('keyval', key),
    set: (key, val) => getIdb().put('keyval', key, val),
    delete: key => getIdb().delete('keyval', key)
  };
}
else {
  module.exports = {
    get: key => Promise.resolve(localStorage.getItem(key)),
    set: (key, val) => Promise.resolve(localStorage.setItem(key, val)),
    delete: key => Promise.resolve(localStorage.removeItem(key))
  };
}