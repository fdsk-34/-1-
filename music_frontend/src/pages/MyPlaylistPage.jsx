// src/pages/MyPlaylistsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchMyPlaylists, deletePlaylist, togglePlaylistVisibility } from '../api/playlistApi';
import PlaylistCard from '../components/PlaylistCard.jsx'; // 🆕
// import EditPlaylistModal from '../components/EditPlaylistModal.jsx'; // 플레이리스트 수정 모달 (추가 필요 시)

import '../styles/MyPlaylistsPage.css';

const MyPlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyPlaylists();
      setPlaylists(data);
    } catch (err) {
      console.error('내 플레이리스트 불러오기 실패:', err);
      setError('플레이리스트를 불러오는 데 실패했습니다.');
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // 플레이리스트 삭제 핸들러
  const handleDeletePlaylist = async (playlistId) => {
    if (window.confirm('정말로 이 플레이리스트를 삭제하시겠습니까?')) {
      try {
        await deletePlaylist(playlistId);
        alert('플레이리스트가 삭제되었습니다.');
        loadPlaylists(); // 목록 갱신
      } catch (err) {
        console.error('플레이리스트 삭제 실패:', err);
        alert('플레이리스트 삭제에 실패했습니다.');
      }
    }
  };

  // 공개/비공개 전환 핸들러
  const handleToggleVisibility = async (playlistId, currentIsPublic) => {
    try {
      await togglePlaylistVisibility(playlistId, !currentIsPublic);
      alert(`플레이리스트가 ${!currentIsPublic ? '공개' : '비공개'}로 전환되었습니다.`);
      loadPlaylists(); // 목록 갱신
    } catch (err) {
      console.error('공개/비공개 전환 실패:', err);
      alert('공개/비공개 전환에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="my-playlists-loading">
        플레이리스트를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="my-playlists-container">
      <h2 className="my-playlists-title">내 플레이리스트</h2>
      <div className="my-playlists-grid">
        {error ? (
          <p className="my-playlists-message my-playlists-error-message">{error}</p>
        ) : playlists.length === 0 ? (
          <p className="my-playlists-message my-playlists-empty-message">
            생성된 플레이리스트가 없습니다. 재생 기록에서 만들어보세요!
          </p>
        ) : (
          playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onDelete={handleDeletePlaylist}
              onToggleVisibility={handleToggleVisibility}
              // onEdit 등 필요한 핸들러 추가
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyPlaylistsPage;