import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';

const DEV_MODE = true;
const mockUser = {
  id: 1,
  email: 'mockuser@example.com',
  nickname: '테스트유저',
  isSubscribed: true,
};
const mockSubscriptionDetails = {
  planId: 'plan_premium',
  planName: 'Premium',
  expiryDate: '2025-07-01',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileBgImage, setProfileBgImage] = useState('/images/K-045.jpg'); // 배경 이미지 상태

  useEffect(() => {
    if (DEV_MODE) {
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      setLoading(false);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      console.log('[AUTH_PROVIDER_EFFECT] DEV_MODE: user', mockUser, 'subscriptionDetails', mockSubscriptionDetails, 'loading', false);
      return;
    }
    const verifyAuth = async () => {
      setLoading(true);
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        try {
          // API 호출 주석 처리
          /*
          const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          setUser(response.data.user);
          setIsSubscribed(response.data.user.isSubscribed || false);
          setSubscriptionDetails(response.data.subscriptionDetails || null);
          setProfileBgImage(response.data.profileBgImage || '/images/K-045.jpg');
          */
          setUser(mockUser);
          setIsSubscribed(mockUser.isSubscribed);
          setSubscriptionDetails(mockSubscriptionDetails);
          setProfileBgImage('/images/K-045.jpg'); // DEV_MODE에서 기본값
        } catch {
          localStorage.removeItem('jwt');
          setUser(null);
          setIsSubscribed(false);
          setSubscriptionDetails(null);
          setProfileBgImage('/images/K-045.jpg');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = useCallback(async ({ identifier, password }) => {
    if (DEV_MODE) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      setLoading(false);
      console.log('[AUTH_PROVIDER_LOGIN] DEV_MODE: user', mockUser, 'identifier', identifier, 'password', password, 'loading', false);
      return true;
    }
    setLoading(true);
    try {
      // API 호출 주석 처리
      /*
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/auth/login`,
        { identifier, password }
      );
      const { token, user: userData, subscriptionDetails } = response.data;
      localStorage.setItem('jwt', token);
      setUser(userData);
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(subscriptionDetails || null);
      setProfileBgImage(userData.profileBgImage || '/images/K-045.jpg');
      */
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      return true;
    } catch {
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
    isSubscribed,
    setIsSubscribed,
    subscriptionDetails,
    login,
    logout,
    loading,
    profileBgImage,
    setProfileBgImage,
  }), [user, isSubscribed, subscriptionDetails, login, logout, loading, profileBgImage]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};