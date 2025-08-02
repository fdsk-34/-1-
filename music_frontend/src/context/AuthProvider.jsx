import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

// 🌐 개발 모드 변수
const DEV_MODE = true;

// 더미 데이터 (개발 모드에서만 사용)
const mockUser = {
  id: 1,
  email: 'mockuser@example.com',
  nickname: '테스트유저',
  isSubscribed: true,
  role: 'ADMIN',
  profileBgImage: '/images/K-045.jpg',
  purchasedItems: ['song1', 'album1'], // 구매한 항목 추가
};
const mockSubscriptionDetails = {
  planId: 'plan_premium',
  planName: 'Premium',
  expiryDate: '2025-07-01',
};

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileBgImage, setProfileBgImage] = useState('/images/K-045.jpg');

  // JWT 토큰을 모든 요청에 자동으로 포함시키는 인터셉터 설정
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => apiClient.interceptors.request.eject(requestInterceptor);
  }, []);

  // 페이지 로드 시 JWT 토큰으로 사용자 인증 상태 확인
  useEffect(() => {
    if (DEV_MODE) {
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      setLoading(false);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      return;
    }
    
    const verifyAuth = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/user/verify');
        const { user: userData, subscriptionDetails } = response.data;
        
        setUser(userData);
        setIsSubscribed(userData.isSubscribed || false);
        setSubscriptionDetails(subscriptionDetails || null);
        setProfileBgImage(userData.profileBgImage || '/images/K-045.jpg');
        console.log('[AUTH_PROVIDER_EFFECT] Token verified, user logged in:', userData);
      } catch (error) {
        console.error('[AUTH_PROVIDER_EFFECT] Token verification failed:', error);
        localStorage.removeItem('jwt');
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  // ✅ 일반 로그인 함수
  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      setLoading(false);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      return true;
    }

    try {
      const response = await apiClient.post('/user/doLogin', { identifier, password });
      const { token, user: userData, subscriptionDetails } = response.data;
      
      localStorage.setItem('jwt', token);
      
      setUser(userData);
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(subscriptionDetails || null);
      setProfileBgImage(userData.profileBgImage || '/images/K-045.jpg');
      
      console.log('[AUTH_PROVIDER_LOGIN] Login successful:', userData);
      return true;
    } catch (error) {
      console.error('[AUTH_PROVIDER_LOGIN] Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ✅ 소셜 로그인 후 토큰 처리 함수
  const handleSocialLoginToken = useCallback(async (token) => {
    localStorage.setItem('jwt', token);
    setLoading(true);
    try {
      const response = await apiClient.get('/user/verify');
      const { user: userData, subscriptionDetails } = response.data;
      
      setUser(userData);
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(subscriptionDetails || null);
      setProfileBgImage(userData.profileBgImage || '/images/K-045.jpg');
      console.log('[AUTH_PROVIDER_SOCIAL] Social login successful:', userData);
      return true;
    } catch (error) {
      console.error('[AUTH_PROVIDER_SOCIAL] Social login failed:', error);
      localStorage.removeItem('jwt');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setUser(null);
    setIsSubscribed(false);
    setSubscriptionDetails(null);
    setProfileBgImage('/images/K-045.jpg');
    console.log('[AUTH_PROVIDER_LOGOUT] user', null, 'subscriptionDetails', null, 'loading', false);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    setUser,
    isSubscribed,
    setIsSubscribed,
    subscriptionDetails,
    login,
    handleSocialLoginToken,
    logout,
    loading,
    profileBgImage,
    setProfileBgImage
  }), [user, isSubscribed, subscriptionDetails, login, handleSocialLoginToken, logout, loading, profileBgImage]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};