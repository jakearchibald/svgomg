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

module.exports = {
  get: key => getIdb().get('keyval', key),
  set: (key, val) => getIdb().put('keyval', key, val),
  delete: key => getIdb().delete('keyval', key)
};
