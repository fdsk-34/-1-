// src/component/ToastNotification.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/ToastNotification.css';

const ToastNotification = () => {
  const [toasts, setToasts] = useState([]); // 실시간 토스트용 (1초 후 사라짐)
  const [persistentToasts, setPersistentToasts] = useState([]); // 카드창용 (영구 보관)
  const [showToasts, setShowToasts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const iconRef = useRef(null);
  const toastContainerRef = useRef(null);

  // 전역 토스트 함수 등록
  useEffect(() => {
    window.showToast = (message, type = 'info') => {
      // 중복 알림 확인
      const isDuplicate =
        toasts.some(toast => toast.message === message) ||
        persistentToasts.some(toast => toast.message === message);
      if (isDuplicate) return;

      const id = Date.now() + Math.random();
      const newToast = { id, message, type, timestamp: new Date() };

      // 실시간 토스트에 추가 (1초 후 자동 제거)
      setToasts(prev => [...prev, newToast]);

      // 영구 토스트에 추가 (카드창용 - 자동 제거 안됨)
      setPersistentToasts(prev => [...prev, newToast]);

      // 읽지 않은 개수 증가
      setUnreadCount(prev => prev + 1);

      // 실시간 토스트만 1초 후 제거
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 1000);
    };

    return () => {
      window.showToast = null;
    };
  }, [toasts, persistentToasts]);

  // 아이콘 클릭 시 토스트 표시 및 읽음 처리
  const handleIconClick = () => {
    if (showToasts) {
      // 카드창 닫히면 알림 초기화
      setShowToasts(false);
      setPersistentToasts([]);
      setUnreadCount(0);
    } else {
      setShowToasts(true);
    }
  };



  // 외부 클릭 시 토스트 닫기 및 초기화
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        iconRef.current &&
        !iconRef.current.contains(event.target) &&
        toastContainerRef.current &&
        !toastContainerRef.current.contains(event.target)
      ) {
        setShowToasts(false);
        setPersistentToasts([]);
        setUnreadCount(0);
      }
    };

    if (showToasts) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToasts]);

  return (
    <>
      {/* 토스트 알림 아이콘 */}
      <div
        ref={iconRef}
        className="toast-notification-icon"
        onClick={handleIconClick}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
        {/* 읽지 않은 알림 개수는 영구 토스트 기준 */}
        {unreadCount > 0 && (
          <span className="toast-notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* 토스트 카드 컨테이너 */}
      {showToasts && (
        <div ref={toastContainerRef} className="toast-cards-container">
          <div className="toast-cards-header">
            <h4>알림</h4>           
          </div>

          <div className="toast-cards-list">
            {persistentToasts.length > 0 ? (
              persistentToasts.slice(-10).map(toast => (
                <div
                  key={toast.id}
                  className={`toast-card toast-card-${toast.type}`}
                >
                  <div className="toast-card-content">
                    <div className="toast-card-message">{toast.message}</div>
                    <div className="toast-card-time">
                      {toast.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div
                    className={`toast-card-indicator toast-indicator-${toast.type}`}
                  ></div>
                </div>
              ))
            ) : (
              <div className="toast-card-empty">알림이 없습니다</div>
            )}
          </div>
        </div>
      )}

      {/* 실시간 토스트 (우측에서 슬라이드인 후 위로 슬라이드아웃) */}
      <div className="live-toast-container">
        {toasts.slice(-3).map(toast => (
          <div
            key={toast.id}
            className={`live-toast live-toast-${toast.type}`}
          >
            <div className="live-toast-content">
              <div className="live-toast-message">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastNotification;
