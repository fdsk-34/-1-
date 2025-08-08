// src/component/MainLayout.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Header from './Header';
import MusicPlayer from './MusicPlayer';
import Footer from './Footer';
import LoadingToast from './LoadingToast';
import ToastNotification from './ToastNotification'; // 새로 추가

import { AuthContext } from '../context/AuthContext';

import '../styles/MainLayout.css';
import SidebarContent from './SidebarContent';

export default function MainLayout() {
  const { loading: authLoading } = useContext(AuthContext); 

  const [showToastManually, setShowToastManually] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setShowToastManually(true);
    } else {
      setShowToastManually(false);
    }
  }, [authLoading]);

  const handleDismissToast = () => {
    setShowToastManually(false);
  };

  return (
    <div className="main-layout-container">
      <Header />

      <div className="main-layout-content-wrapper">
        <main className="main-content-area">
          <Outlet />
        </main>

        <aside className="main-sidebar-area">
         
        </aside>
      </div>

      <div>
        <MusicPlayer />
        <Footer />
      </div>

      {/* 토스트 알림 시스템 추가 */}
      <ToastNotification />

      {/* 기존 로딩 토스트 */}
      {authLoading && showToastManually && (
        <LoadingToast isLoading={authLoading} onDismiss={handleDismissToast} />
      )}
    </div>
  );
}