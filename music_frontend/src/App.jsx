import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './main';

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) return <div className="admin-loading">로딩 중...</div>;

  return <RouterProvider router={router} />;
}

export default App;