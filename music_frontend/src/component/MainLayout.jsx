// src/component/MainLayout.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Header from './Header';
import MusicPlayer from './MusicPlayer';
import Footer from './Footer';
import LoadingToast from './LoadingToast';

import { AuthContext } from '../context/AuthContext';

import '../styles/MainLayout.css';
import SidebarContent from './SidebarContent';

export default function MainLayout() {
  // const { user, loading } = useContext(AuthContext); // <-- 이전 코드
  // const { user, loading: authLoading } = useContext(AuthContext); // <-- 이전 코드
  const { loading: authLoading } = useContext(AuthContext); // <-- 수정된 코드

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

      <MusicPlayer />
      <Footer />

      {authLoading && showToastManually && (
        <LoadingToast isLoading={authLoading} onDismiss={handleDismissToast} />
      )}
    </div>
  );
}