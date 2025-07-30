import React, { useState } from 'react';
import RankingFilterBar from '../component/RankingFilterBar';
import '../styles/RankingPage.css';

const DUMMY_ALBUMS = [
  { id: 'da1', title: '봄날의 멜로디', artist: '플로이', coverUrl: '/images/K-051.jpg', songCount: 10, updatedAt: '2024.07.10', genre: '발라드', origin: '국내', length: 240, isHighQuality: true, likes: 120, followers: 500 },
  { id: 'da2', title: '어느 맑은 날', artist: '클로버', coverUrl: '/images/K-052.jpg', songCount: 12, updatedAt: '2024.07.08', genre: '댄스', origin: '해외', length: 215, isHighQuality: false, likes: 80, followers: 230 },
  { id: 'da3', title: '향기로운 기억', artist: '레몬트리', coverUrl: '/images/K-053.jpg', songCount: 8, updatedAt: '2024.07.05', genre: '힙합', origin: '국내', length: 198, isHighQuality: true, likes: 140, followers: 340 },
  { id: 'da4', title: '밤거리 가로등', artist: '레몬트리', coverUrl: '/images/K-054.jpg', songCount: 9, updatedAt: '2024.07.05', genre: '재즈', origin: '국내', length: 320, isHighQuality: false, likes: 40, followers: 100 },
  { id: 'da5', title: '밥먹는 시간', artist: '레몬트리', coverUrl: '/images/K-055.jpg', songCount: 11, updatedAt: '2024.07.05', genre: '락', origin: '해외', length: 275, isHighQuality: true, likes: 190, followers: 420 },
  { id: 'da6', title: '퇴근 길', artist: '레몬트리', coverUrl: '/images/K-056.jpg', songCount: 13, updatedAt: '2024.07.05', genre: '트로트', origin: '국내', length: 180, isHighQuality: false, likes: 60, followers: 190 },
];

function formatLength(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const RankingPage = () => {
  const [genreFilter, setGenreFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const [likedAlbums, setLikedAlbums] = useState({});
  const [followedAlbums, setFollowedAlbums] = useState({});
  const [addedAlbums, setAddedAlbums] = useState({});

  const [hoveredAlbumId, setHoveredAlbumId] = useState(null);

  const filteredAlbums = DUMMY_ALBUMS.filter(album => {
    if (genreFilter !== 'all' && album.genre !== genreFilter) return false;
    if (regionFilter === 'domestic' && album.origin !== '국내') return false;
    if (regionFilter === 'international' && album.origin !== '해외') return false;
    return true;
  });

  const toggleLike = (id) => {
    setLikedAlbums(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFollow = (id) => {
    setFollowedAlbums(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAdd = (id) => {
    setAddedAlbums(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="ranking-page">
      <h1>랭킹 차트</h1>

      <RankingFilterBar
        genreFilter={genreFilter}
        regionFilter={regionFilter}
        onGenreChange={setGenreFilter}
        onRegionChange={setRegionFilter}
      />

      <div className="ranking-list">
        {filteredAlbums.length === 0 && <p>검색 결과가 없습니다.</p>}

        {filteredAlbums.map((album, idx) => (
          <div
            key={album.id}
            className="ranking-item"
            onMouseEnter={() => setHoveredAlbumId(album.id)}
            onMouseLeave={() => setHoveredAlbumId(null)}
          >
            <div className="ranking-index">{idx + 1}</div>

            <div className="thumbnail-wrapper">
              <img src={album.coverUrl} alt={`${album.title} 앨범 커버`} className="album-thumbnail" />
              {hoveredAlbumId === album.id && (
                <button
                  className="play-button"
                  onClick={() => alert(`재생: ${album.title}`)}
                  aria-label="재생"
                >
                  ▶
                </button>
              )}
            </div>

            <div className="album-name-artist">
              <div className="album-name" title={album.title}>{album.title}</div>
              <div className="artist-name" title={album.artist}>{album.artist}</div>
            </div>

            <div className="song-info">
              곡수: {album.songCount} / 길이: {formatLength(album.length)}
            </div>

            <div className="action-buttons">
              <button
                className={`action-button ${likedAlbums[album.id] ? 'active' : ''}`}
                onClick={() => toggleLike(album.id)}
                aria-label="좋아요"
              >
                ❤️ <span className="count">{album.likes + (likedAlbums[album.id] ? 1 : 0)}</span>
              </button>

              <button
                className={`action-button ${followedAlbums[album.id] ? 'active' : ''}`}
                onClick={() => toggleFollow(album.id)}
                aria-label="팔로우"
              >
                👥 <span className="count">{album.followers + (followedAlbums[album.id] ? 1 : 0)}</span>
              </button>

              <button
                className={`action-button ${addedAlbums[album.id] ? 'active' : ''}`}
                onClick={() => toggleAdd(album.id)}
                aria-label="담기"
              >
                ➕ 담기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPage;
