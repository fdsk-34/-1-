import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// 컨텍스트 임포트
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';

// 다른 컴포넌트 임포트
import Albumcard from './Albumcard';
import PlaylistPage from '../pages/UserPlaylistsSidebarPage';

// 사이드바 전용 CSS 임포트
import '../styles/SidebarContent.css';

// --- 더미 이미지 및 데이터 ---
const K52 = '/images/K-052.jpg';
const K53 = '/images/K-053.jpg';
const K54 = '/images/K-054.jpg';
const K55 = '/images/K-055.jpg';
const K56 = '/images/K-056.jpg';

let sidebarImageIndex = 0;
const getNextLocalImageSidebar = () => {
  const paths = [K52, K53, K54, K55, K56];
  const path = paths[sidebarImageIndex % paths.length];
  sidebarImageIndex++;
  return path;
};

// 🌐 1. 추천 앨범 섹션 더미 데이터 (Albumcard 사용)
const DUMMY_MOCK_ALBUMS = Array.from({ length: 6 }, (_, i) => ({
  id: `mock_album${i + 1}`,
  title: `추천앨범 ${i + 1}`,
  artist: `사이드 아티스트 ${i + 1}`,
  coverUrl: getNextLocalImageSidebar(),
  songCount: Math.floor(Math.random() * 10) + 3,
  updatedAt: `2024.0${(i % 6) + 1}.0${(i % 15) + 1}`,
}));

// 🌐 2. 광고 섹션 더미 데이터
const DUMMY_MOCK_ADS = [
  { id: 1, text: '프리미엄 구독, 지금 바로!', url: '/subscription-plans' },
  { id: 2, text: '최신 앨범 30% 할인!', url: '/promotion/new-album' },
  { id: 3, text: '앱 다운로드!', url: '/download-app' },
];

// ✨ 3. FLO 추천 플레이리스트 더미 데이터 (텍스트 목록용)
const DUMMY_FLO_RECOMMEND_PLAYLISTS_TEXT = Array.from({ length: 4 }, (_, i) => ({
  id: `flo_text_rec_pl${i + 1}`,
  name: `추천 앨범 ${i + 1}`,
  songs: [ // 내부 곡 더미
    { id: `rec_song_${i+1}_1`, title: `추천곡 ${i+1}-1`, artist: `추천가수 A` },
    { id: `rec_song_${i+1}_2`, title: `추천곡 ${i+1}-2`, artist: `추천가수 B` },
  ]
}));

// ✨ 4. 히스토리 더미 데이터
const DUMMY_HISTORY_SONGS = Array.from({ length: 5 }, (_, i) => ({
  id: `history_song_${i + 1}`,
  title: `최근 들은 곡 ${i + 1}`,
  artist: `히스토리 가수 ${i + 1}`,
  playedAt: `2024-01-${String(15 + i).padStart(2, '0')}`,
}));

// ✨ PlaylistSongItem 컴포넌트 (PlaylistPage와 동일한 역할)
const PlaylistSongItem = ({ song, onPlaySong }) => {
  return (
    <li className="playlist-song-item">
      <div className="song-info-wrapper">
        <Link to={`/song/${song.id}`}>
          <span className="song-title">{song.title}</span> - <span className="song-artist">{song.artist}</span>
        </Link>
        <button
          onClick={() => onPlaySong(song)}
          className="play-song-item-button"
          aria-label={`${song.title} 재생`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
        </button>
      </div>
    </li>
  );
};
PlaylistSongItem.propTypes = {
  song: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
  }).isRequired,
  onPlaySong: PropTypes.func.isRequired,
};

// ✨ 히스토리 섹션 컴포넌트
const HistorySection = ({ onPlaySong }) => {
  const [showAll, setShowAll] = useState(false);
  const displaySongs = showAll ? DUMMY_HISTORY_SONGS : DUMMY_HISTORY_SONGS.slice(0, 3);

  return (
    <div className="history-subsection">
      <div className="subsection-header">
        <h4 className="subsection-title">최근 재생</h4>
        <button 
          className="view-all-button"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? '접기' : '더보기'}
        </button>
      </div>
      <ul className="history-song-list">
        {displaySongs.map(song => (
          <PlaylistSongItem key={song.id} song={song} onPlaySong={onPlaySong} />
        ))}
        {DUMMY_HISTORY_SONGS.length === 0 && (
          <li className="playlist-song-item empty-song-list">최근 재생한 곡이 없습니다.</li>
        )}
      </ul>
    </div>
  );
};
HistorySection.propTypes = {
  onPlaySong: PropTypes.func.isRequired,
};

export default function SidebarContent() {
  const { user } = useContext(AuthContext); // 로그인 정보 가져오기
  const { playSong } = useContext(MusicPlayerContext); // 음악 재생 함수 가져오기

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedFloPlaylistId, setExpandedFloPlaylistId] = useState(null);
  const handleFloPlaylistToggle = (id) => {
    setExpandedFloPlaylistId(prevId => (prevId === id ? null : id));
  };

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (err) {
        setError("사이드바 데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
        console.error("Sidebar data fetch error:", err);
      }
    };
    fetchSidebarData();
  }, []);

  useEffect(() => {
    console.log('사이드바 - 사용자 상태 변경:', user ? '로그인됨' : '로그아웃됨');
    if (!user) {
      setExpandedFloPlaylistId(null);
    }
  }, [user]);

  const handlePlaySongInContext = useCallback((songItem) => {
    if (!user) {
      alert('로그인 후 사용 가능합니다.');
      return;
    }
    if (playSong) {
      playSong({
        id: songItem.id,
        title: songItem.title,
        artist: songItem.artist || songItem.name || 'Various Artists',
        coverUrl: songItem.coverUrl || songItem.profileImageUrl,
      });
      alert(`곡 재생: '${songItem.title || songItem.name}'`);
    }
  }, [user, playSong]);

  const handlePlayAllPlaylistInContext = useCallback((playlistAlbumItem) => {
    if (!user) {
      alert('로그인 후 사용 가능합니다.');
      return;
    }
    if (playSong) {
      let songsToPlay = [];
      const foundPlaylist = DUMMY_FLO_RECOMMEND_PLAYLISTS_TEXT.find(pl => pl.id === playlistAlbumItem.id);
      if (foundPlaylist && foundPlaylist.songs) {
        songsToPlay = foundPlaylist.songs;
      } else {
        songsToPlay = [{
            id: `dummy_${playlistAlbumItem.id}_1`,
            title: `(대표곡) ${playlistAlbumItem.name || playlistAlbumItem.title}`,
            artist: `알 수 없는 아티스트`,
            coverUrl: playlistAlbumItem.coverUrl || playlistAlbumItem.profileImageUrl,
        }];
      }

      if (songsToPlay.length > 0) {
          playSong(songsToPlay[0]);
      }
      alert(`플레이리스트 '${playlistAlbumItem.title || playlistAlbumItem.name}' 전체 재생! (첫 곡부터)`);
    }
  }, [user, playSong]);

  if (loading) {
    return (
      <div className="sidebar-container loading">
        <div className="loading-spinner">
          <p>사이드바를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sidebar-container error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-container">
      {/* === 로그인 상태에 따라 다른 섹션들을 렌더링 === */}
      {user ? (
        <>
          {/* ✨ 1. 추천 플레이리스트 섹션 (로그인 시 맨 위로 이동) */}
          <div className="sidebar-section card-section-wrapper featured-playlists-card-wrapper">
            <div className="styled-section-header">
              <h3>추천 플레이리스트</h3>
              <Link to="/playlists" className="view-all-button">더보기</Link>
            </div>
            <ul className="playlist-text-list">
              {DUMMY_FLO_RECOMMEND_PLAYLISTS_TEXT.map((pl) => (
                <li key={pl.id} className="playlist-list-item">
                  <div className="playlist-list-item-header">
                    <span className="playlist-name" onClick={() => handleFloPlaylistToggle(pl.id)}>{pl.name}</span>
                    <span className="toggle-icon" onClick={() => handleFloPlaylistToggle(pl.id)}>{expandedFloPlaylistId === pl.id ? '▲' : '▼'}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlayAllPlaylistInContext(pl); }}
                      className="play-album-button"
                      aria-label={`${pl.name} 전체 재생`}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    </button>
                  </div>
                  {expandedFloPlaylistId === pl.id && (
                    <ul className="playlist-song-list">
                      {pl.songs && pl.songs.length > 0 ? (
                        pl.songs.map(song => (
                          <PlaylistSongItem key={song.id} song={song} onPlaySong={handlePlaySongInContext} />
                        ))
                      ) : (
                        <li className="playlist-song-item empty-song-list">수록곡이 없습니다.</li>
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ✨ 2. 사용자 전용 섹션 - 히스토리와 플레이리스트 */}
          <div className="user-specific-section">
            <div className="sidebar-section-header">
              <h3 className="sidebar-title">내 음악</h3>
              <button
                onClick={() => handlePlayAllPlaylistInContext({ id: 'current_user_library', name: '내 라이브러리 전체' })}
                className="play-all-library-button"
                aria-label="라이브러리 전체 재생"
              >
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                <span>전체 재생</span>
              </button>
            </div>
            <HistorySection onPlaySong={handlePlaySongInContext} />
            <div className="library-subsection">
              <PlaylistPage
                onPlaySong={handlePlaySongInContext}
                onPlayAllPlaylist={handlePlayAllPlaylistInContext}
                onPlay={handlePlaySongInContext}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ✨ 1. 로그인 유도 섹션 */}
          <div className="sidebar-section auth-prompt">
            <h3 className="sidebar-title">무제한으로 맘껏 즐기려면</h3>
            <p className="sidebar-text">로그인하고 모든 기능을 경험해보세요.</p>
            <Link to="/login" className="sidebar-button primary">로그인</Link>
            <Link to="/signup" className="sidebar-button secondary">회원가입</Link>
          </div>

          {/* ✨ 2. 놓치지 마세요 섹션 (비로그인 전용) */}
          <div className="sidebar-section card-section-wrapper album-recommendation-card-wrapper">
            <div className="styled-section-header">
              <h3>놓치지 마세요</h3>
            </div>
            <div className="sidebar-album-list">
              {DUMMY_MOCK_ALBUMS.slice(0, 4).map(album => (
                <Albumcard key={album.id} album={album} size="sm" />
              ))}
            </div>
          </div>
        </>
      )}

      {/* === 공통 섹션 (로그인 여부와 관계없이 항상 표시) === */}
      {/* ✨ 광고 섹션 - 카드형 디자인 적용 */}
      <div className="sidebar-section card-section-wrapper ad-card-wrapper">
        <div className="styled-section-header">
          <h3>이벤트</h3>
        </div>
        <div className="sidebar-ad-list">
          {DUMMY_MOCK_ADS.map(ad => (
            <Link key={ad.id} to={ad.url} className="sidebar-ad-item">
              {ad.text}
            </Link>
          ))}
        </div>
      </div>
      
      {/* ✨ 하단 통합 서비스/바로가기 섹션 - 카드형 디자인 적용 */}
      <div className="sidebar-section card-section-wrapper bottom-links-card-wrapper">
        <div className="styled-section-header">
          <h3>주요 안내</h3>
        </div>
        <div className="sidebar-shortcut-list">
          <Link to="/explore" className="sidebar-shortcut-item">차트</Link>
          <Link to="/my-subscription" className="sidebar-shortcut-item">나의 이용권</Link>
          <Link to="/myPage" className="sidebar-shortcut-item">내 프로필</Link>
          <Link to="/notice" className="sidebar-shortcut-item">공지사항</Link>
        </div>
      </div>
    </div>
  );
}

SidebarContent.propTypes = {
  // PropTypes는 이 컴포넌트 내부에 props가 없으므로 생략
};