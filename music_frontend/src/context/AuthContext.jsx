import React from 'react';

export const AuthContext = React.createContext({
  user: null,
  setUser: () => {}, // setUser 추가
  isSubscribed: false,
  setIsSubscribed: () => {},
  subscriptionDetails: null,
  login: async () => {},
  logout: () => {},
  loading: false,
  profileBgImage: '/images/K-045.jpg',
  setProfileBgImage: () => {},
});

export const useAuth = () => React.useContext(AuthContext);