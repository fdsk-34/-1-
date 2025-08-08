// src/components/UserPlaylistsSidebar.jsx
import React from 'react'; // ✨ useState, useEffect, useCallback 제거
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import SidebarMiniCard from '../component/SidebarMiniCard'; // SidebarMiniCard 컴포넌트 사용

// 더미 이미지 경로 (SidebarContent와 중복되지 않도록 별도 정의 또는 외부에서 받아야 함)
import K52 from '../assets/K-052.jpg';
import K53 from '../assets/K-053.jpg';

// 더미 데이터
let imageIndexUserPlaylists = 0;
const getNextLocalImageUserPlaylists = () => {
  const paths = [K52, K53]; // 사용자 정의 더미 이미지가 필요합니다
  const path = paths[imageIndexUserPlaylists % paths.length];
  imageIndexUserPlaylists++;
  return path;
};

const mockHistoryItems = Array.from({ length: 4 }, (_, i) => ({
  id: `history_${i + 1}`,
  title: `재생곡 ${i + 1}`,
  artist: `재생 아티스트 ${i + 1}`,
  coverUrl: getNextLocalImageUserPlaylists(),
  link: `/song/${i + 1}`,
  type: 'song',
}));

const mockUserPlaylistsAndLikes = Array.from({ length: 4 }, (_, i) => ({
  id: `mypl_${i + 1}`,
  title: `내 플리 ${i + 1}`,
  artist: `내 취향`, // 플레이리스트는 아티스트 대신 다른 정보 가능
  coverUrl: getNextLocalImageUserPlaylists(),
  link: `/playlist/${i + 1}`,
  type: 'playlist',
}));


import '../styles/UserPlaylistsSidebar.css'; // ✨ 전용 CSS

const UserPlaylistsSidebarPage = ({ onPlay }) => {
  // onPlay는 SidebarContent로부터 전달받음
  // 실제 앱에서는 이곳에서 사용자 재생 기록, 플레이리스트, 좋아요 정보를 API를 통해 가져옵니다.
  // const [history, setHistory] = useState([]); // 주석 처리된 부분으로 ESLint 경고
  // const [userPlaylists, setUserPlaylists] = useState([]);

  // ✨ 플레이리스트 목록 렌더링을 위한 컴포넌트
  const PlaylistsSection = ({ title, items, linkText, linkTo }) => (
    <div className="user-playlists-section">
      <div className="subsection-header">
        <h4 className="user-playlists-section-title">{title}</h4>
        {linkTo && <Link to={linkTo} className="user-playlists-more-link">{linkText}</Link>}
      </div>
      <div className="user-playlists-grid">
        {items.map(item => (
          <SidebarMiniCard 
            key={item.id} 
            item={item} 
            onPlay={onPlay} 
          />
        ))}
      </div>
    </div>
  );
  PlaylistsSection.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    linkText: PropTypes.string,
    linkTo: PropTypes.string,
  };


  return (
    <div className="user-playlists-sidebar-container">
      {/* 1. 최근 감상 목록 (History Section) */}
      <PlaylistsSection 
        title="최근 감상"
        items={mockHistoryItems} 
        linkText="더보기"
        linkTo="/recent-history"
      />

      {/* 2. 내 플레이리스트 및 좋아요 목록 (My Playlists & Likes) */}
      <PlaylistsSection 
        title="내 플레이리스트 & 좋아요" 
        items={mockUserPlaylistsAndLikes}
        linkText="더보기"
        linkTo="/my-playlists"
      />
    </div>
  );
};
UserPlaylistsSidebarPage.propTypes = {
  onPlay: PropTypes.func,
};

export default UserPlaylistsSidebarPage;