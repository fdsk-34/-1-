// src/component/Navbar.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      // ✨ 검색 실행 후 포커스를 풀고 싶다면 (input 요소에 ref를 사용하여 blur() 호출)
      // 예시: searchInputRef.current.blur();
    }
  };

  if (loading) {
    return (
      <nav className="app-navbar">
        <span className="navbar-loading">로딩 중...</span>
        <form className="navbar-search-container" onSubmit={handleSearch} role="search" aria-label="음악 검색">
          <input
            type="text"
            placeholder="자유롭게 검색해보세요."
            className="navbar-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="음악 검색 입력"
          />
          {/* ✨ 아이콘 SVG 요소 완전히 제거 ✨ */}
          <button type="submit" className="navbar-search-button" aria-label="검색 실행">
            검색 {/* ✨ 필요시 '검색' 텍스트 추가 */}
          </button>
        </form>
        <Link to="/advanced-search" className="navbar-advanced-search-button">
          여러 곡 한 번에 찾기
        </Link>
      </nav>
    );
  }

  return (
    <nav className="app-navbar">
      <Link to="/explore" className="navbar-link">랭킹 차트</Link>
      
      {user ? (
        user.role === 'ADMIN' ? (
          <Link to="/admin" className="navbar-link">사이트 관리</Link>
        ) : (
          <Link to="/myPage" className="navbar-link">마이 페이지</Link>
        )
      ) : null}

      <Link to="/subscription-plans" className="navbar-link">구독 요금제 안내</Link>
      
      <form className="navbar-search-container" onSubmit={handleSearch} role="search" aria-label="음악 검색">
        <input
          type="text"
          placeholder="자유롭게 검색해보세요."
          className="navbar-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="음악 검색 입력"
        />      
      </form>

      <Link to="/advanced-search" className="navbar-advanced-search-button">
        여러 곡 한 번에 찾기
      </Link>
    </nav>
  );
};

export default Navbar;