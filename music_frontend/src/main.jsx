import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthProvider';
import { MusicPlayerProvider } from './context/MusicPlayerProvider';

// Core Layout & Routing Components
import MainLayout from './component/MainLayout';
import PrivateRoute from './component/PrivateRoute';
import AdminPrivateRoute from './component/AdminPrivateRoute';
import SubscriptionRouter from './component/SubscriptionRouter';

// Page Components
import MainPage from './pages/MainPage';
import RecommendPage from './pages/RecommendPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import ArtistPage from './pages/ArtistPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AlbumArtPage from './pages/AlbumIconPage';
import CommentsPage from './pages/CommentsPage';
import HistoryPage from './pages/HistoryPage';
import LikesFollowsPage from './pages/LikesFollowsPage';
import PaymentFailPage from './pages/PaymentFailPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { PurchasePage } from './pages/PurchasePage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { UserSubscriptionHistory } from './pages/UserSubscriptionHistoryPage';
import MyPage from './pages/MyPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import RankingPage from './pages/RankingPage';
import PlaylistDrawer from './component/PlaylistDrawer';
import PlaylistPage from './pages/PlaylistPage';
import FindPasswordPage from './pages/FindPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './component/AdminDashboard';
import UserManagement from './component/UserManagement';
import CommentManagement from './component/CommentManagement';
import FileManagement from './component/FileManagement';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// CSS Files
import './styles/index.css';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <MainPage /> },
        { path: 'explore', element: <RankingPage /> },
        { path: 'advanced-search', element: <AdvancedSearchPage /> },
        { path: 'playlists/featured', element: <PlaylistDrawer title="추천 테마 플레이리스트" /> },
        { path: 'recommend', element: <RecommendPage /> },
        { path: 'album/:id', element: <AlbumDetailPage /> },
        { path: 'artist/:id', element: <ArtistPage /> },
        { path: 'art', element: <AlbumArtPage /> },
        { path: 'likes', element: <LikesFollowsPage /> },
        { path: 'comments', element: <CommentsPage /> },
        { path: 'payment/success', element: <PaymentSuccessPage /> },
        { path: 'payment/fail', element: <PaymentFailPage /> },
        {
          element: <PrivateRoute />,
          children: [
            { path: 'myPage', element: <MyPage /> },
            { path: 'my-playlists', element: <PlaylistPage /> },
            { path: 'subscription-plans', element: <SubscriptionPage /> },
            { path: 'subscription', element: <SubscriptionRouter /> },
            { path: 'my-subscription', element: <SubscriptionRouter /> },
            { path: 'profile', element: <UserProfilePage /> },
            { path: 'history', element: <HistoryPage /> },
            { path: 'purchase', element: <PurchasePage /> },
            { path: 'payment/:planId', element: <PaymentPage /> },
          ],
        },
        {
          element: <AdminPrivateRoute />,
          children: [
            { path: 'admin', element: <AdminDashboard /> },
            { path: 'admin/users', element: <UserManagement /> },
            { path: 'admin/comments', element: <CommentManagement /> },
            { path: 'admin/contents', element: <div>콘텐츠 관리 (미구현)</div> },
            { path: 'admin/subscriptions', element: <div>구독 관리 (미구현)</div> },
            { path: 'admin/files', element: <FileManagement /> },
          ],
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
    { path: '/find-password', element: <FindPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MusicPlayerProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </MusicPlayerProvider>
    </AuthProvider>
  </React.StrictMode>
);