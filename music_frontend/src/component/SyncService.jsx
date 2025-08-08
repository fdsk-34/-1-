import { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { debounce } from 'lodash';
import { getAllLyricsFromDB, deleteLyricsFromDB, getAllFilesFromDB, deleteFileFromDB, getAllPlaylistsFromDB, savePlaylistToDB, deletePlaylistFromDB } from '../utils/indexedDB';

const SyncService = () => {
  const { user, logout } = useContext(AuthContext);
  const [isSyncing, setIsSyncing] = useState(false);
  const [failedSyncs, setFailedSyncs] = useState({ lyrics: [], files: [], playlists: [] });
  const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
  const SYNC_INTERVAL = 300000;
  const RETRY_INTERVAL = 60000;

  const retry = useCallback(async (fn, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }, []);

  const syncLyric = useCallback(async (lyric) => {
    if (!user?.token) throw new Error('인증 토큰이 없습니다.');
    try {
      await axios.post(
        `${API_URL}/api/lyrics/admin`,
        { songId: lyric.songId, language: lyric.language, lyrics: lyric.lyrics },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await deleteLyricsFromDB(lyric.id);
      window.showToast(`가사 동기화 성공: ${lyric.songId}`, 'success');
      setFailedSyncs(prev => ({ ...prev, lyrics: prev.lyrics.filter(id => id !== lyric.id) }));
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.showToast('인증 오류가 발생했습니다. 다시 로그인하세요.', 'error');
        logout();
        throw error;
      }
      setFailedSyncs(prev => ({ ...prev, lyrics: [...new Set([...prev.lyrics, lyric.id])] }));
      throw error;
    }
  }, [user, logout, API_URL]);

  const syncFile = useCallback(async (file) => {
    if (!user?.token || user.role !== 'ADMIN') throw new Error('관리자 권한이 필요합니다.');
    try {
      const formData = new FormData();
      formData.append('audio', file.fileData);
      if (file.coverFile) formData.append('cover', file.coverFile);
      formData.append('name', file.name);
      formData.append('artist', file.artist || '관리자 업로드');
      const response = await axios.post(
        `${API_URL}/api/admin/files/upload`,
        formData,
        { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } }
      );
      await deleteFileFromDB(file.id);
      window.showToast(`파일 동기화 성공: ${file.name}`, 'success');
      setFailedSyncs(prev => ({ ...prev, files: prev.files.filter(id => id !== file.id) }));
      return response.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.showToast('인증 오류가 발생했습니다. 다시 로그인하세요.', 'error');
        logout();
        throw error;
      }
      setFailedSyncs(prev => ({ ...prev, files: [...new Set([...prev.files, file.id])] }));
      throw error;
    }
  }, [user, logout, API_URL]);

  const syncPlaylist = useCallback(async (playlist) => {
    if (!user?.token) throw new Error('인증 토큰이 없습니다.');
    try {
      await axios.post(
        `${API_URL}/api/playlists`,
        { name: playlist.name, songs: playlist.songs },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await deletePlaylistFromDB(playlist.id);
      window.showToast(`플레이리스트 동기화 성공: ${playlist.name}`, 'success');
      setFailedSyncs(prev => ({ ...prev, playlists: prev.playlists.filter(id => id !== playlist.id) }));
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.showToast('인증 오류가 발생했습니다. 다시 로그인하세요.', 'error');
        logout();
        throw error;
      }
      await savePlaylistToDB(playlist);
      setFailedSyncs(prev => ({ ...prev, playlists: [...new Set([...prev.playlists, playlist.id])] }));
      throw error;
    }
  }, [user, logout, API_URL]);

  const syncBatch = useCallback(async (type, items, batchSize) => {
    const BATCH_SIZE = { lyrics: 10, files: 2, playlists: 5 }; // 내부 정의로 의존성 제거
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    for (const batch of batches) {
      await Promise.all(
        batch.map(item =>
          retry(() => (type === 'lyrics' ? syncLyric(item) : type === 'files' ? syncFile(item) : syncPlaylist(item))).catch(err => {
            console.error(`${type} 동기화 실패: ${item.id}`, err);
            window.showToast(`${type} 동기화 실패: ${item.name || item.songId}`, 'error');
          })
        )
      );
    }
  }, [retry, syncLyric, syncFile, syncPlaylist]);

  const checkServerAndSync = useCallback(async () => {
    const BATCH_SIZE = { lyrics: 10, files: 2, playlists: 5 }; // 내부 정의로 의존성 제거
    if (!navigator.onLine) {
      window.showToast('오프라인 상태입니다. 네트워크 연결 후 동기화됩니다.', 'info');
      return;
    }
    if (!user?.token) {
      console.log('로그인되지 않음, 동기화 중단');
      return;
    }
    setIsSyncing(true);
    try {
      await axios.get(`${API_URL}/api/ping`, { headers: { Authorization: `Bearer ${user.token}` } });
      
      const lyrics = await getAllLyricsFromDB();
      const targetLyrics = failedSyncs.lyrics.length > 0 ? lyrics.filter(l => failedSyncs.lyrics.includes(l.id)) : lyrics;
      if (targetLyrics.length > 0) {
        await syncBatch('lyrics', targetLyrics, BATCH_SIZE.lyrics);
      }

      if (user.role === 'ADMIN') {
        const files = await getAllFilesFromDB();
        const targetFiles = failedSyncs.files.length > 0 ? files.filter(f => failedSyncs.files.includes(f.id)) : files;
        if (targetFiles.length > 0) {
          await syncBatch('files', targetFiles, BATCH_SIZE.files);
        }
      }

      const playlists = await getAllPlaylistsFromDB();
      const targetPlaylists = failedSyncs.playlists.length > 0 ? playlists.filter(p => failedSyncs.playlists.includes(p.id)) : playlists;
      if (targetPlaylists.length > 0) {
        await syncBatch('playlists', targetPlaylists, BATCH_SIZE.playlists);
      }

      if (failedSyncs.lyrics.length === 0 && failedSyncs.files.length === 0 && failedSyncs.playlists.length === 0) {
        window.showToast('모든 데이터가 서버와 동기화되었습니다.', 'success');
      } else {
        window.showToast('일부 데이터 동기화에 실패했습니다. 다음 시도에 재시도합니다.', 'warning');
      }
    } catch (error) {
      console.error('서버 연결 또는 동기화 실패:', error);
      window.showToast('서버 연결에 실패했습니다. 다음 시도에 재시도합니다.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [user, syncBatch, failedSyncs, API_URL]);

  useEffect(() => {
    const debouncedShowToast = debounce((message, type) => {
      window.showToast(message, type);
    }, 1000);

    const handleOnline = () => {
      console.log('온라인 상태 감지, 동기화 시도');
      checkServerAndSync();
    };

    window.addEventListener('online', handleOnline);
    const intervalId = setInterval(
      () => checkServerAndSync(),
      failedSyncs.lyrics.length > 0 || failedSyncs.files.length > 0 || failedSyncs.playlists.length > 0 ? RETRY_INTERVAL : SYNC_INTERVAL
    );

    if (isSyncing) {
      debouncedShowToast(`데이터를 서버와 동기화 중... (${failedSyncs.lyrics.length + failedSyncs.files.length + failedSyncs.playlists.length}개 남음)`, 'info');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(intervalId);
      debouncedShowToast.cancel();
    };
  }, [isSyncing, checkServerAndSync, failedSyncs]);

  return null;
};

export default SyncService;