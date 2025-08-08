  // // src/routes.jsx
  // import React from 'react';
  // import { createBrowserRouter } from 'react-router-dom';

  // import MainLayout from './component/MainLayout';
  // import PrivateRoute from './component/PrivateRoute';

  // import MainPage from './pages/MainPage';
  // import LibraryPage from './pages/LibraryPage';
  // import LoginPage from './pages/LoginPage';
  // import PlaylistPage from './pages/UserPlaylistsSidebarPage';  // 플레이리스트 페이지 import

  // const router = createBrowserRouter([
  //   {
  //     path: '/',
  //     element: <MainLayout />,
  //     children: [
  //       { index: true, element: <MainPage /> },

  //       {
  //         path: 'library',
  //         element: (
  //           <PrivateRoute>
  //             <LibraryPage />
  //           </PrivateRoute>
  //         ),
  //       },

  //       {
  //         path: 'playlists',
  //         element: (
  //           <PrivateRoute>
  //             <PlaylistPage />  
  //           </PrivateRoute>
  //         ),
  //       },

  //     ],
  //   },
  //   {
  //     path: '/login',
  //     element: <LoginPage />,
  //   },
  // ]);

  // export default router;

  export { default } from './main';