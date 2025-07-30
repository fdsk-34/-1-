// // src/components/RankingChart.jsx
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import '../styles/RankingPage.css';

// function formatLength(seconds) {
//   const m = Math.floor(seconds / 60);
//   const s = seconds % 60;
//   return `${m}:${s.toString().padStart(2, '0')}`;
// }

// const RankingChart = () => {
//   const [rankingList, setRankingList] = useState([]);
//   const [hoveredId, setHoveredId] = useState(null);
//   const [liked, setLiked] = useState({});
//   const [followed, setFollowed] = useState({});
//   const [added, setAdded] = useState({});

//   useEffect(() => {
//     // 실제 API 경로에 맞게 변경
//     axios.get('/api/ranking')
//       .then(res => {
//         setRankingList(res.data);
//       })
//       .catch(err => {
//         console.error('랭킹 데이터 로드 실패:', err);
//       });
//   }, []);

//   const toggleLike = (id) => setLiked(prev => ({ ...prev, [id]: !prev[id] }));
//   const toggleFollow = (id) => setFollowed(prev => ({ ...prev, [id]: !prev[id] }));
//   const toggleAdd = (id) => setAdded(prev => ({ ...prev, [id]: !prev[id] }));

//   return (
//     <div className="ranking-page-container">
//       <h1>랭킹 차트 (백엔드 연동)</h1>

//       <div className="ranking-list">
//         {rankingList.length === 0 && <p>데이터가 없습니다.</p>}

//         {rankingList.map((album, idx) => (
//           <div
//             className="ranking-item"
//             key={album.id}
//             onMouseEnter={() => setHoveredId(album.id)}
//             onMouseLeave={() => setHoveredId(null)}
//           >
//             <div className="ranking-rank">{idx + 1}</div>
//             <img src={album.coverUrl} alt={`${album.title} 커버`} className="ranking-cover" />

//             <div className="album-artist-info">
//               <div className="album-title" title={album.title}>{album.title}</div>
//               <div className="artist-name" title={album.artist}>{album.artist}</div>
//             </div>

//             <div className="play-button-container">
//               {hoveredId === album.id && (
//                 <button
//                   className="play-button"
//                   onClick={() => alert(`재생: ${album.title}`)}
//                   aria-label="재생"
//                 >
//                   ▶
//                 </button>
//               )}
//             </div>

//             <div className="song-info">
//               곡수: {album.songCount} / 길이: {formatLength(album.length)}
//             </div>

//             <div className="action-buttons">
//               <button className={`action-button ${liked[album.id] ? 'active' : ''}`} onClick={() => toggleLike(album.id)} aria-label="좋아요">
//                 ❤️ {album.likes}
//               </button>
//               <button className={`action-button ${followed[album.id] ? 'active' : ''}`} onClick={() => toggleFollow(album.id)} aria-label="팔로우">
//                 👥 {album.followers}
//               </button>
//               <button className={`action-button ${added[album.id] ? 'active' : ''}`} onClick={() => toggleAdd(album.id)} aria-label="담기">
//                 ➕ 담기
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RankingChart;
