/* ==========================================================================
   DEFRULE MUSIC — Persistencia con IndexedDB
   Stores: favs (favoritos) · meta (descuento bienvenida, vistas)
   ========================================================================== */
const DB = (function () {
  const NAME = 'defrule-music-db';
  const VER = 1;
  let _db = null;

  function open() {
    return new Promise((resolve, reject) => {
      if (_db) return resolve(_db);
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB no soportado'));
      const req = indexedDB.open(NAME, VER);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains('favs')) d.createObjectStore('favs', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'key' });
      };
      req.onsuccess = () => { _db = req.result; resolve(_db); };
      req.onerror = () => reject(req.error);
    });
  }

  function tx(store, mode) { return open().then(d => d.transaction(store, mode).objectStore(store)); }

  function get(store, key) {
    return tx(store, 'readonly').then(s => new Promise((res, rej) => {
      const r = s.get(key);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
  }
  function put(store, val) {
    return tx(store, 'readwrite').then(s => new Promise((res, rej) => {
      const r = s.put(val);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error);
    }));
  }
  function del(store, key) {
    return tx(store, 'readwrite').then(s => new Promise((res, rej) => {
      const r = s.delete(key);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error);
    }));
  }
  function all(store) {
    return tx(store, 'readonly').then(s => new Promise((res, rej) => {
      const r = s.getAll();
      r.onsuccess = () => res(r.result || []);
      r.onerror = () => rej(r.error);
    }));
  }

  return {
    open,
    // favoritos
    getFavs: () => all('favs').then(rows => rows.map(r => r.id)),
    isFav: id => get('favs', id).then(r => !!r),
    async toggleFav(id) {
      const has = await get('favs', id);
      if (has) { await del('favs', id); return false; }
      await put('favs', { id, t: Date.now() }); return true;
    },
    // meta
    getMeta: k => get('meta', k).then(r => r && r.value),
    setMeta: (k, v) => put('meta', { key: k, value: v }),
    // vistas recientes
    async trackView(id) {
      let recent = await get('meta', 'recent');
      recent = (recent && recent.value) || [];
      recent = [id, ...recent.filter(x => x !== id)].slice(0, 8);
      await put('meta', { key: 'recent', value: recent });
      return recent;
    },
    getRecent: () => get('meta', 'recent').then(r => (r && r.value) || [])
  };
})();
