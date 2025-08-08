import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Admin.css';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const AdminPrivateRoute = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      // ✅ 개발자 모드에서는 무조건 통과
      if (DEV_MODE) {
        console.log('[DEV_MODE] 관리자 인증 우회 허용됨');
        setIsAuthorized(true);
        return;
      }

      // 실제 인증 로직
      if (!user?.token) {
        setIsAuthorized(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/verify`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (response.data.role === 'ADMIN') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          window.showToast('관리자 권한이 없습니다.', 'error');
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
        setIsAuthorized(false);
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          window.showToast('인증 오류가 발생했습니다. 다시 로그인하세요.', 'error');
        }
      }
    };

    if (!loading) {
      verifyAdmin();
    }
  }, [user, loading, logout]);

  if (loading || isAuthorized === null) {
    return <div className="admin-loading">로딩 중...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminPrivateRoute;
