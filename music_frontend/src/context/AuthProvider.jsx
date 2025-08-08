import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
const mockUser = {
  id: 1,
  email: 'mockuser@example.com',
  nickname: '테스트유저',
  isSubscribed: true,
  role: 'ADMIN',
  profileBgImage: '/images/K-045.jpg',
  purchasedItems: ['song1', 'album1'],
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

  // 글로벌 에러 처리 인터셉터
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

    const responseInterceptor = apiClient.interceptors.response.use(
      response => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const refreshResponse = await axios.post(`${API_BASE_URL}/user/refresh-token`, {
              refreshToken: localStorage.getItem('refreshToken'),
            });
            const newToken = refreshResponse.data['jwt-auth-token'];
            localStorage.setItem('jwt', newToken);
            error.config.headers['Authorization'] = `Bearer ${newToken}`;
            setUser(prev => prev ? { ...prev, token: newToken } : null);
            return apiClient(error.config);
          } catch (_refreshError) {
            console.error('[AUTH_PROVIDER_INTERCEPTOR] Token refresh failed:', _refreshError);
            window.showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
            localStorage.removeItem('jwt');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsSubscribed(false);
            setSubscriptionDetails(null);
            window.location.href = '/login';
          }
        } else if (error.response?.status === 403) {
          window.showToast('권한이 없습니다.', 'error');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    if (DEV_MODE) {
      setUser({ ...mockUser, token: 'dummy_jwt_token_for_dev' });
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
        setUser({ ...userData, token });
        setIsSubscribed(userData.isSubscribed || false);
        setSubscriptionDetails(subscriptionDetails || null);
        setProfileBgImage(userData.profileBgImage || '/images/K-045.jpg');
        console.log('[AUTH_PROVIDER_EFFECT] Token verified, user logged in:', userData);
      } catch (error) {
        console.error('[AUTH_PROVIDER_EFFECT] Token verification failed:', error);
        localStorage.removeItem('jwt');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser({ ...mockUser, token: 'dummy_jwt_token_for_dev' });
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      setLoading(false);
      return true;
    }

    try {
      console.log('[AUTH_PROVIDER_LOGIN] Sending login request:', credentials);
      const response = await apiClient.post('/user/doLogin', {
        email: credentials.identifier,
        password: credentials.password,
      });
      const responseData = response.data;
      const token = responseData['jwt-auth-token'];
      const refreshToken = responseData['refresh-token'];
      const userData = {
        id: responseData.id,
        email: responseData.email,
        nickname: responseData.nickname,
        profileImage: responseData.profileImage,
        role: responseData.role,
        token,
      };

      localStorage.setItem('jwt', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(null);
      setProfileBgImage(userData.profileImage || '/images/K-045.jpg');
      console.log('[AUTH_PROVIDER_LOGIN] Login successful:', userData);
      return true;
    } catch (error) {
      console.error('[AUTH_PROVIDER_LOGIN] Login failed:', error);
      window.showToast(error.response?.data?.result || '로그인 중 오류가 발생했습니다.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSocialLoginToken = useCallback(async (token) => {
    localStorage.setItem('jwt', token);
    setLoading(true);
    try {
      const response = await apiClient.get('/user/verify');
      const { user: userData, subscriptionDetails } = response.data;
      setUser({ ...userData, token });
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(subscriptionDetails || null);
      setProfileBgImage(userData.profileImage || '/images/K-045.jpg');
      console.log('[AUTH_PROVIDER_SOCIAL] Social login successful:', userData);
      return true;
    } catch (error) {
      console.error('[AUTH_PROVIDER_SOCIAL] Social login failed:', error);
      localStorage.removeItem('jwt');
      window.showToast('소셜 로그인에 실패했습니다.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsSubscribed(false);
    setSubscriptionDetails(null);
    setProfileBgImage('/images/K-045.jpg');
    console.log('[AUTH_PROVIDER_LOGOUT] User logged out');
    window.showToast('로그아웃되었습니다.', 'success');
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
    setProfileBgImage,
  }), [user, isSubscribed, subscriptionDetails, login, handleSocialLoginToken, logout, loading, profileBgImage]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};