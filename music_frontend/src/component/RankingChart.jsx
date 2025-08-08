// src/components/RankingChart.jsx
import React, { useState } from 'react';
import '../styles/RankingPage.css';

function formatLength(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// props로 rankingList, liked, followed, added, toggle 함수들을 받습니다.
const RankingChart = ({ rankingList, liked, followed, added, toggleLike, toggleFollow, toggleAdd }) => {
  const [hoveredId, setHoveredId] = useState(null);

  if (!rankingList || rankingList.length === 0) {
    return (
      <div className="ranking-chart-container">
        <p className="no-data-text">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="ranking-chart-container">
      <div className="ranking-list">
        {rankingList.map((item) => (
          <div
            className="ranking-item"
            key={item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="ranking-rank">{item.rank}</div>
            
            {item.type === 'album' && (
              <img src={item.coverUrl} alt={`${item.title} 커버`} className="ranking-cover" />
            )}
            {item.type === 'artist' && (
              <div className="ranking-artist-placeholder">아티스트</div>
            )}

            <div className="album-artist-info">
              <div className="album-title" title={item.title}>{item.title}</div>
              <div className="artist-name" title={item.artist}>{item.artist}</div>
            </div>

            <div className="play-button-container">
              {hoveredId === item.id && item.type === 'album' && (
                <button
                  className="play-button"
                  onClick={() => alert(`재생: ${item.title}`)}
                  aria-label="재생"
                >
                  ▶
                </button>
              )}
            </div>

            <div className="song-info">
              {item.type === 'album' && `곡수: ${item.songCount} / 길이: ${formatLength(item.length)}`}
              {item.type === 'artist' && `팔로워: ${item.followers}`}
            </div>

            <div className="action-buttons">
              <button className={`action-button ${liked[item.entityId] ? 'active' : ''}`} onClick={() => toggleLike(item.entityId, item.type)} aria-label="좋아요">
                ❤️ {item.likes}
              </button>
              <button className={`action-button ${followed[item.entityId] ? 'active' : ''}`} onClick={() => toggleFollow(item.entityId, item.type)} aria-label="팔로우">
                👥 {item.followers}
              </button>
              {item.type === 'album' && (
                <button className={`action-button ${added[item.entityId] ? 'active' : ''}`} onClick={() => toggleAdd(item.entityId)} aria-label="담기">
                  ➕ 담기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingChart;