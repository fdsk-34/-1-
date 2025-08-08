import React, { useState, useEffect, useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import '../styles/AdminDashboard.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const AdminDashboard = () => {
  const { user, logout, apiClient } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalSongs: 0,
    totalComments: 0,
    subscriptionBreakdown: { Free: 0, Premium: 0, Pro: 0 },
    genreBreakdown: { Pop: 0, Rock: 0, HipHop: 0, Jazz: 0, Classical: 0, Electronic: 0, Ballad: 0 },
    artistBreakdown: { 'Artist A': 0, 'Artist B': 0, 'Artist C': 0, 'Artist D': 0, 'Artist E': 0, 'Artist F': 0, 'Artist G': 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      window.showToast('관리자 권한이 필요합니다.', 'error');
      logout();
      return;
    }

    const fetchStats = async () => {
      try {
        window.showToast('대시보드 데이터를 불러오는 중...', 'info');
        if (DEV_MODE) {
          setTimeout(() => {
            setStats({
              totalUsers: 150,
              activeSubscriptions: 75,
              totalSongs: 345,
              totalComments: 520,
              subscriptionBreakdown: { Free: 75, Premium: 50, Pro: 25 },
              genreBreakdown: {
                Pop: 100,
                Rock: 80,
                HipHop: 60,
                Jazz: 40,
                Classical: 30,
                Electronic: 20,
                Ballad: 15
              },
              artistBreakdown: {
                'Artist A': 50,
                'Artist B': 40,
                'Artist C': 30,
                'Artist D': 25,
                'Artist E': 20,
                'Artist F': 15,
                'Artist G': 10
              }
            });
            console.log('개발자 모드: 더미 데이터 로드', {
              totalUsers: 150,
              activeSubscriptions: 75,
              totalSongs: 345,
              totalComments: 520,
              subscriptionBreakdown: { Free: 75, Premium: 50, Pro: 25 },
              genreBreakdown: { Pop: 100, Rock: 80, HipHop: 60, Jazz: 40, Classical: 30, Electronic: 20, Ballad: 15 },
              artistBreakdown: { 'Artist A': 50, 'Artist B': 40, 'Artist C': 30, 'Artist D': 25, 'Artist E': 20, 'Artist F': 15, 'Artist G': 10 }
            });
            window.showToast('모의 데이터를 성공적으로 불러왔습니다.', 'success');
            setLoading(false);
          }, 1000);
          return;
        }

        const response = await apiClient.get('/api/admin/stats');
        setStats(response.data);
        window.showToast('대시보드 데이터를 성공적으로 불러왔습니다.', 'success');
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        if (DEV_MODE) {
          window.showToast('API 연결 실패로 모의 데이터를 사용합니다.', 'warning');
          setTimeout(() => {
            setStats({
              totalUsers: 150,
              activeSubscriptions: 75,
              totalSongs: 345,
              totalComments: 520,
              subscriptionBreakdown: { Free: 75, Premium: 50, Pro: 25 },
              genreBreakdown: {
                Pop: 100,
                Rock: 80,
                HipHop: 60,
                Jazz: 40,
                Classical: 30,
                Electronic: 20,
                Ballad: 15
              },
              artistBreakdown: {
                'Artist A': 50,
                'Artist B': 40,
                'Artist C': 30,
                'Artist D': 25,
                'Artist E': 20,
                'Artist F': 15,
                'Artist G': 10
              }
            });
            setLoading(false);
          }, 1000);
        } else {
          setError(error.response?.data?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
          window.showToast('데이터를 불러오지 못했습니다.', 'error');
        }
      } finally {
        if (!DEV_MODE) setLoading(false);
      }
    };
    fetchStats();
  }, [user, logout, apiClient]);

  const handleMenuClick = (menuName) => {
    console.log(`${menuName} 메뉴를 클릭했습니다.`);
  };

  // 막대 차트: 사용자 대비 구독자 비율
  const subscriptionRatioChart = {
    data: {
      labels: ['구독자', '비구독자'],
      datasets: [{
        label: '사용자 수',
        data: [stats.activeSubscriptions, stats.totalUsers - stats.activeSubscriptions],
        backgroundColor: ['#36A2EB', '#FF6384'],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: '사용자 대비 구독자 비율' },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: '사용자 수' } },
      },
    },
  };

  // 파이 차트: 장르별 등록곡 수
  const genreBreakdownChart = {
    data: {
      labels: Object.keys(stats.genreBreakdown),
      datasets: [{
        data: Object.values(stats.genreBreakdown),
        backgroundColor: [
          '#FF6384', // Pop
          '#36A2EB', // Rock
          '#FFCE56', // HipHop
          '#4BC0C0', // Jazz
          '#9966FF', // Classical
          '#FF9F40', // Electronic
          '#E7E9ED'  // Ballad
        ],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 } } },
        title: { display: true, text: '장르별 등록곡 수' },
      },
    },
  };

  // 파이 차트: 아티스트별 곡 수
  const artistBreakdownChart = {
    data: {
      labels: Object.keys(stats.artistBreakdown),
      datasets: [{
        data: Object.values(stats.artistBreakdown),
        backgroundColor: [
          '#FF6384', // Artist A
          '#36A2EB', // Artist B
          '#FFCE56', // Artist C
          '#4BC0C0', // Artist D
          '#9966FF', // Artist E
          '#FF9F40', // Artist F
          '#E7E9ED'  // Artist G
        ],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 } } },
        title: { display: true, text: '아티스트별 곡 수' },
      },
    },
  };

  // 막대 차트: 구독 등급별 사용자 수
  const subscriptionBreakdownChart = {
    data: {
      labels: Object.keys(stats.subscriptionBreakdown),
      datasets: [{
        label: '사용자 수',
        data: Object.values(stats.subscriptionBreakdown),
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384'],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: '구독 등급별 사용자 수' },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: '사용자 수' } },
      },
    },
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-content">
          <p className="loading-text">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="admin-content">
          <p className="admin-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h1 className="admin-title">관리자 대시보드</h1>
        <div className="admin-menu">
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
            <p>음악 업로드 & 유지 보수 관리</p>
            <small>{stats.totalSongs}개의 음악 등록 중</small>
          </Link>
        </div>
      </div>
      <div className="admin-content">
        <div className="admin-chart-grid">
          <div className="chart-card">
            <Bar data={subscriptionRatioChart.data} options={subscriptionRatioChart.options} />
          </div>
          <div className="chart-card">
            <Pie data={genreBreakdownChart.data} options={genreBreakdownChart.options} />
          </div>
          <div className="chart-card">
            <Pie data={artistBreakdownChart.data} options={artistBreakdownChart.options} />
          </div>
          <div className="chart-card">
            <Bar data={subscriptionBreakdownChart.data} options={subscriptionBreakdownChart.options} />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;