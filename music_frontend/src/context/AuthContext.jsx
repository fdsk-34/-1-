import React from 'react';

// 초기값을 명확히 정의하는 게 좋아요
export const AuthContext = React.createContext({
  user: null,
  isSubscribed: false,
  loading: false,
  login: async () => {},
  logout: () => {},
  setIsSubscribed: () => {},
  setProfileBgImage: () => {},
});

// 커스텀 훅으로 쉽게 사용
export const useAuth = () => React.useContext(AuthContext);