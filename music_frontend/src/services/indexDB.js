export const openDB = (dbName = 'musicPlayerDB', version = 2) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('lyrics')) {
        db.createObjectStore('lyrics', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('uploadedFiles')) {
        db.createObjectStore('uploadedFiles', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getAllLyricsFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('lyrics', 'readonly');
    const store = transaction.objectStore('lyrics');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const deleteLyricsFromDB = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('lyrics', 'readwrite');
    const store = transaction.objectStore('lyrics');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

export const saveLyricsToDB = async (lyricsObj) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('lyrics', 'readwrite');
    const store = transaction.objectStore('lyrics');
    const request = store.put(lyricsObj);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getAllFilesFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('uploadedFiles', 'readonly');
    const store = transaction.objectStore('uploadedFiles');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const deleteFileFromDB = async (fileId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('uploadedFiles', 'readwrite');
    const store = transaction.objectStore('uploadedFiles');
    const request = store.delete(fileId);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

export const saveFileToDB = async (fileObj) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('uploadedFiles', 'readwrite');
    const store = transaction.objectStore('uploadedFiles');
    const request = store.put(fileObj);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getAllPlaylistsFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('playlists', 'readonly');
    const store = transaction.objectStore('playlists');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const savePlaylistToDB = async (playlistObj) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('playlists', 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.put(playlistObj);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

export const deletePlaylistFromDB = async (playlistId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('playlists', 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.delete(playlistId);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};