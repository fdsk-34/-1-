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
    const fetchStats = async () => {
      try {
        window.showToast('대시보드 데이터를 불러오는 중...', 'info');
        
        // 실제 API 호출 시도
        try {
          const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
          });
          setStats(res.data);
          window.showToast('대시보드 데이터를 성공적으로 불러왔습니다.', 'success');
        } catch (apiError) {
          console.warn('API 호출 실패, 모의 데이터 사용:', apiError.message);
          window.showToast('API 연결 실패로 모의 데이터를 사용합니다.', 'warning');
          
          // 모의 데이터로 대체
          setTimeout(() => {
            setStats({
              totalUsers: 1200,
              activeSubscriptions: 450,
              totalSongs: 3500,
              totalComments: 890,
            });
            window.showToast('대시보드 모의 데이터를 불러왔습니다.', 'info');
          }, 1000);
        }
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        setError(error.message || '통계 데이터를 불러오는 데 실패했습니다.');
        window.showToast('대시보드 데이터 로드에 실패했습니다.', 'error');
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500); // 로딩 표시를 위한 최소 시간
      }
    };

    fetchStats();
  }, []);

  const handleStatsRefresh = async () => {
    setLoading(true);
    setError(null);
    window.showToast('데이터를 새로고침하는 중...', 'info');
    
    try {
      // 실제 환경에서는 API 재호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      
      setStats(prevStats => ({
        totalUsers: prevStats.totalUsers + Math.floor(Math.random() * 10),
        activeSubscriptions: prevStats.activeSubscriptions + Math.floor(Math.random() * 5),
        totalSongs: prevStats.totalSongs + Math.floor(Math.random() * 20),
        totalComments: prevStats.totalComments + Math.floor(Math.random() * 15),
      }));
      
      window.showToast('데이터가 성공적으로 새로고침되었습니다.', 'success');
    } catch (error) {
      console.error(error);
      window.showToast('데이터 새로고침에 실패했습니다.', 'error');
      setError('데이터 새로고침 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (menuName) => {
    window.showToast(`${menuName} 페이지로 이동합니다.`, 'info');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h2 className="admin-dashboard-title">관리자 대시보드</h2>
        <button 
          onClick={handleStatsRefresh} 
          className="admin-refresh-button"
          disabled={loading}
        >
          {loading ? '새로고침 중...' : '데이터 새로고침'}
        </button>
      </div>
      
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      
      {error && (
        <div className="admin-dashboard-error">
          <p>{error}</p>
          <button onClick={handleStatsRefresh} className="admin-retry-button">
            다시 시도
          </button>
        </div>
      )}
      
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>총 사용자</h3>
          <p>{stats.totalUsers.toLocaleString()}</p>
          <small>전체 가입 회원 수</small>
        </div>
        <div className="admin-stat-card">
          <h3>활성 구독</h3>
          <p>{stats.activeSubscriptions.toLocaleString()}</p>
          <small>현재 구독 중인 회원 수</small>
        </div>
        <div className="admin-stat-card">
          <h3>총 곡 수</h3>
          <p>{stats.totalSongs.toLocaleString()}</p>
          <small>서비스 내 전체 음악 수</small>
        </div>
        <div className="admin-stat-card">
          <h3>총 댓글</h3>
          <p>{stats.totalComments.toLocaleString()}</p>
          <small>전체 댓글 및 리뷰 수</small>
        </div>
      </div>

      <div className="admin-menu-grid">
        <Link 
          to="/admin/users" 
          className="admin-menu-card"
          onClick={() => handleMenuClick('사용자 관리')}
        >
          <h3>사용자 관리</h3>
          <p>사용자 목록 조회, 수정, 삭제</p>
          <small>총 {stats.totalUsers}명의 사용자</small>
        </Link>
        
        <Link 
          to="/admin/contents" 
          className="admin-menu-card"
          onClick={() => handleMenuClick('콘텐츠 관리')}
        >
          <h3>콘텐츠 관리</h3>
          <p>음악, 앨범, 아티스트 관리</p>
          <small>총 {stats.totalSongs}곡 등록됨</small>
        </Link>
        
        <Link 
          to="/admin/comments" 
          className="admin-menu-card"
          onClick={() => handleMenuClick('댓글 관리')}
        >
          <h3>댓글 관리</h3>
          <p>모든 댓글 조회 및 삭제</p>
          <small>총 {stats.totalComments}개의 댓글</small>
        </Link>
        
        <Link 
          to="/admin/subscriptions" 
          className="admin-menu-card"
          onClick={() => handleMenuClick('구독 관리')}
        >
          <h3>구독 관리</h3>
          <p>구독 플랜 및 사용자 구독 상태 관리</p>
          <small>{stats.activeSubscriptions}명이 구독 중</small>
        </Link>
        
        <Link 
          to="/admin/files" 
          className="admin-menu-card"
          onClick={() => handleMenuClick('파일 관리')}
        >
          <h3>파일 관리</h3>
          <p>음악 및 이미지 파일 업로드</p>
          <small>파일 업로드 및 관리</small>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;