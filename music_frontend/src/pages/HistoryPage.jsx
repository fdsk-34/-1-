// src/pages/HistoryPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import Songcard from '../component/Songcard.jsx';
// import CreatePlaylistModal from '../components/CreatePlaylistModal.jsx'; // 🆕 새로 추가
import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/HistoryPage.css';

const HistoryPage = () => {
  const { playSong } = useContext(MusicPlayerContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]); // 🆕 선택된 곡들 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 🆕 모달 열림/닫힘 상태

  const token = localStorage.getItem('token');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
      console.log("🌐 재생 기록 데이터 로드 성공:", res.data);
    } catch (err) {
      console.error('🌐 재생 기록 가져오기 실패:', err);
      setError('재생 기록을 불러오는 데 실패했습니다.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 🆕 노래 선택/선택 해제 핸들러
  const handleSongSelect = (song) => {
    setSelectedSongs((prevSelected) =>
      prevSelected.find((s) => s.id === song.id)
        ? prevSelected.filter((s) => s.id !== song.id)
        : [...prevSelected, song]
    );
  };

  // 🆕 "선택된 곡으로 플레이리스트 만들기" 버튼 클릭 핸들러
  const handleCreatePlaylistClick = () => {
    if (selectedSongs.length > 0) {
      setIsModalOpen(true);
    } else {
      alert('플레이리스트를 만들 곡을 선택해주세요.'); // 사용자 피드백
    }
  };

  // 🆕 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSongs([]); // 모달 닫으면 선택 초기화
  };

  if (loading) {
    return (
      <div className="history-page-loading">
        재생 기록을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="history-page-container">
      <h2 className="history-page-title">재생 기록</h2>

      {history.length > 0 && ( // 🆕 선택 버튼은 기록이 있을 때만 표시
        <div className="history-actions">
          <button
            onClick={handleCreatePlaylistClick}
            className="create-playlist-btn"
            disabled={selectedSongs.length === 0} // 선택된 곡이 없으면 비활성화
          >
            선택된 곡으로 플레이리스트 만들기 ({selectedSongs.length})
          </button>
        </div>
      )}

      <div className="history-page-grid">
        {error ? (
          <p className="history-page-message history-page-error-message">{error}</p>
        ) : history.length === 0 ? (
          <p className="history-page-message history-page-empty-message">
            재생 기록이 없습니다.
          </p>
        ) : (
          history.map((song) => (
            // 🆕 Songcard에 선택 상태 및 핸들러 전달
            <Songcard
              key={song.id}
              song={song}
              onPlay={playSong}
              onSelect={handleSongSelect} // 곡 선택 기능 추가
              isSelected={selectedSongs.find((s) => s.id === song.id) ? true : false} // 선택 여부 전달
            />
          ))
        )}
      </div>

      {/* 🆕 플레이리스트 생성 모달 */}
      {isModalOpen && (
        <CreatePlaylistModal
          selectedSongs={selectedSongs}
          onClose={handleCloseModal}
          onPlaylistCreated={() => {
            handleCloseModal();
            // 플레이리스트 생성 후 MyPlaylistsPage 등으로 이동하거나 상태 업데이트
            // 예: alert('플레이리스트가 성공적으로 생성되었습니다!');
          }}
        />
      )}
    </div>
  );
};

export default HistoryPage;