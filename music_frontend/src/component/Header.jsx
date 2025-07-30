import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SidebarContent from './SidebarContent';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('jwt');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // 사이드바 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="header-logo-link">
            <img src="/images/logo.png" alt="Logo" className="header-logo-image" />
            <h2 className="header-app-title">Music App</h2>
          </Link>
        </div>

        <div className="header-center">
          <Navbar />
        </div>

        <div className="header-right">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="header-button header-button-login">
              로그아웃
            </button>
          ) : (
            <Link to="/login" className="header-button header-button-login">로그인</Link>
          )}

          {!isLoggedIn && (
            <Link to="/signup" className="header-button header-button-signup signup-adjust">
              회원가입
            </Link>
          )}

          <button className="header-button hamburger-button" onClick={toggleSidebar}>☰</button>
        </div>
      </header>

      {/* 슬라이드 사이드바 (헤더 아래에서 나타남) */}
      <div
        className={`sidebar-slide-wrapper ${sidebarOpen ? 'open' : ''}`}
        ref={sidebarRef}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Header;
