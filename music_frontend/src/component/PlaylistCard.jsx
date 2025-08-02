// src/components/PlaylistCard.jsx
import React, { useContext } from 'react';
import { MusicPlayerContext } from '../context/MusicPlayerContext'; // 재생 기능 연동
import { useNavigate } from 'react-router-dom'; // 플레이리스트 상세 페이지 이동 (추가 시)

const PlaylistCard = ({ playlist, onDelete, onToggleVisibility }) => {
  const { playPlaylist } = useContext(MusicPlayerContext); // 🆕 플레이리스트 재생 함수
  const navigate = useNavigate();

  // 플레이리스트 통째로 재생 (MusicPlayerContext에 playPlaylist 함수 필요)
  const handlePlayPlaylist = () => {
    // playlist.songs 배열을 MusicPlayerContext로 넘겨주어 재생 시작
    playPlaylist(playlist.songs);
    alert(`"${playlist.name}" 플레이리스트 재생 시작!`);
  };

  const handleViewDetails = () => {
    // 플레이리스트 상세 페이지로 이동 (예: /my-playlists/:id)
    navigate(`/my-playlists/${playlist.id}`);
  };

  return (
    <div className="playlist-card">
      <img src={playlist.thumbnailUrl || 'default_playlist_thumbnail.png'} alt={playlist.name} className="playlist-card-image" />
      <div className="playlist-card-info">
        <h4 className="playlist-card-title">{playlist.name}</h4>
        <p className="playlist-card-meta">곡 수: {playlist.songs.length}개</p>
        <p className="playlist-card-meta">상태: {playlist.isPublic ? '공개' : '비공개'}</p>
        <div className="playlist-card-actions">
          <button onClick={handlePlayPlaylist} className="play-btn">전체 재생</button>
          <button onClick={handleViewDetails} className="view-btn">상세 보기</button>
          <button onClick={() => onToggleVisibility(playlist.id, playlist.isPublic)} className="toggle-btn">
            {playlist.isPublic ? '비공개 전환' : '공개 전환'}
          </button>
          <button onClick={() => onDelete(playlist.id)} className="delete-btn">삭제</button>
          {/* 수정 버튼 등 추가 가능 */}
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;