// src/pages/SubscriptionManagement.jsx
import React, { useState, useEffect } from 'react';
import LoadingToast from '../component/LoadingToast';
import '../styles/SubscriptionManagement.css';
//import axios from 'axios';

// 모의 데이터
const mockSubscriptions = [
  { userId: 'user1', nickname: '김철수', subscriptionTier: 'premium' },
  { userId: 'user2', nickname: '이영희', subscriptionTier: 'pro' },
  { userId: 'user3', nickname: '박민수', subscriptionTier: 'basic' },
  { userId: 'user4', nickname: '최유리', subscriptionTier: 'pro' },
  { userId: 'user5', nickname: '정우성', subscriptionTier: 'premium' },
];

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 실제 API 호출 (주석 처리)
    const fetchSubscriptions = async () => {
      try {
        window.showToast('구독 데이터를 불러오는 중...', 'info');

        // 모의 데이터 사용
        setTimeout(() => {
          setSubscriptions(mockSubscriptions);
          setLoading(false);
          window.showToast('구독 데이터를 성공적으로 불러왔습니다.', 'success');
        }, 1000);
      } catch (err) {
        setError('구독 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        window.showToast(err , '구독 데이터를 불러오지 못했습니다.', 'error');
      }
    };
    fetchSubscriptions();
  }, []);

  const handleTierChange = (userId, newTier) => {
    // 실제 API 호출 로직 (주석 처리)
    // axios.put(...)
    setSubscriptions(prevSubs => 
      prevSubs.map(sub => 
        sub.userId === userId ? { ...sub, subscriptionTier: newTier } : sub
      )
    );
    window.showToast(`${userId}의 구독 등급이 ${newTier}로 변경되었습니다.`, 'success');
  };

  return (
    <div className="subscription-management-container">
      <h2 className="subscription-management-title">구독 관리</h2>
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      {error && <p className="subscription-management-error">{error}</p>}

      <div className="subscription-tiers-info">
        <h3>구독 등급 및 권한</h3>
        <ul>
          <li><strong>Basic:</strong> 기본 기능 (무제한 스트리밍)</li>
          <li><strong>Pro:</strong> 고품질 음악 스트리밍, 매월 5곡 무결제 다운로드</li>
          <li><strong>Premium:</strong> 고품질 음악 스트리밍, 재생목록/재생기록 관리, 무제한 무결제 다운로드</li>
        </ul>
      </div>

      <div className="subscription-list">
        <h3>사용자 구독 현황</h3>
        {subscriptions.length === 0 ? (
          <p className="subscription-empty">표시할 구독자가 없습니다.</p>
        ) : (
          subscriptions.map(sub => (
            <div key={sub.userId} className="subscription-item">
              <p><strong>{sub.nickname}</strong> ({sub.userId})</p>
              <div className="subscription-tier-select">
                <label htmlFor={`tier-select-${sub.userId}`}>등급 변경:</label>
                <select
                  id={`tier-select-${sub.userId}`}
                  value={sub.subscriptionTier}
                  onChange={(e) => handleTierChange(sub.userId, e.target.value)}
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;