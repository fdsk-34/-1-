import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingToast from '../component/LoadingToast';
import '../styles/AdminDashboard.css';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalSongs: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모의 데이터 로드
  useEffect(() => {
    // 실제 API 호출 (주석 처리)
    
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        });
        setStats(res.data);
      } catch (err) {
        setError(err.message || '통계 데이터를 불러오는 데 실패했습니다.');
        
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    
    
    setTimeout(() => {
      setStats({
        totalUsers: 1200,
        activeSubscriptions: 450,
        totalSongs: 3500,
        totalComments: 890,
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h2 className="admin-dashboard-title">관리자 대시보드</h2>
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      {error && <p className="admin-dashboard-error">{error}</p>}
      
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>총 사용자</h3>
          <p>{stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="admin-stat-card">
          <h3>활성 구독</h3>
          <p>{stats.activeSubscriptions.toLocaleString()}</p>
        </div>
        <div className="admin-stat-card">
          <h3>총 곡 수</h3>
          <p>{stats.totalSongs.toLocaleString()}</p>
        </div>
        <div className="admin-stat-card">
          <h3>총 댓글</h3>
          <p>{stats.totalComments.toLocaleString()}</p>
        </div>
      </div>

      <div className="admin-menu-grid">
        <Link to="/admin/users" className="admin-menu-card">
          <h3>사용자 관리</h3>
          <p>사용자 목록 조회, 수정, 삭제</p>
        </Link>
        <Link to="/admin/contents" className="admin-menu-card">
          <h3>콘텐츠 관리</h3>
          <p>음악, 앨범, 아티스트 관리</p>
        </Link>
        <Link to="/admin/comments" className="admin-menu-card">
          <h3>댓글 관리</h3>
          <p>모든 댓글 조회 및 삭제</p>
        </Link>
        <Link to="/admin/subscriptions" className="admin-menu-card">
          <h3>구독 관리</h3>
          <p>구독 플랜 및 사용자 구독 상태 관리</p>
        </Link>
        <Link to="/admin/files" className="admin-menu-card">
          <h3>파일 관리</h3>
          <p>음악 및 이미지 파일 업로드</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;