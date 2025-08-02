// src/components/CreatePlaylistModal.jsx
import React, { useState } from 'react';
// import axios from 'axios';
import { createPlaylist } from '../api/playlistApi'; // 🆕 API 호출 함수 임포트

import '../styles/components.css'; // 모달 스타일 (예시)

const CreatePlaylistModalPage = ({ selectedSongs, onClose, onPlaylistCreated }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [isPublic, setIsPublic] = useState(true); // 공개/비공개 상태
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!playlistName.trim()) {
      alert('플레이리스트 이름을 입력해주세요.');
      return;
    }
    setCreating(true);
    setError(null);

    const songIds = selectedSongs.map(song => song.id); // 곡 ID만 전달

    try {
      await createPlaylist(playlistName, songIds, isPublic); // 🆕 playlistApi 사용
      onPlaylistCreated(); // 생성 성공 콜백
      alert('플레이리스트가 성공적으로 생성되었습니다!');
    } catch (err) {
      console.error('플레이리스트 생성 실패:', err);
      setError('플레이리스트 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>새 플레이리스트 만들기</h3>
        <div className="modal-body">
          <label htmlFor="playlistName">플레이리스트 이름:</label>
          <input
            type="text"
            id="playlistName"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="플레이리스트 이름"
          />

          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            공개 플레이리스트
          </label>

          <p>선택된 곡: {selectedSongs.length}개</p>

          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="modal-footer">
          <button onClick={handleCreate} disabled={creating}>
            {creating ? '생성 중...' : '만들기'}
          </button>
          <button onClick={onClose} disabled={creating}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModalPage;