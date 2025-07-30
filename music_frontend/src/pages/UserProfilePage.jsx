import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Equalizer from '../component/Equalizer';
import '../styles/UserProfilePage.css';

const UserProfilePage = () => {
  const {
    user,
    isSubscribed,
    setIsSubscribed,
    subscriptionDetails,
    logout,
    profileBgImage,
    setProfileBgImage,
    loading: authLoading
  } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt');

  const fetchProfile = useCallback(() => {
    if (!jwt) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setProfile({
        email: user.email,
        nickname: user.nickname,
        subscriptionStatus: isSubscribed ? 'active' : 'inactive',
      });
      setNickname(user.nickname);
    } catch {
      setError('프로필을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [jwt, user, isSubscribed]);

  const fetchHistory = useCallback(() => {
    if (!jwt) return;
    setHistory([
      {
        id: 'sub_001',
        planName: 'Premium',
        subscribedAt: '2025-06-01T00:00:00Z',
        expiresAt: '2025-07-01T00:00:00Z',
        price: 14900,
      },
    ]);
  }, [jwt]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHistory();
    } else {
      setLoading(false);
      setError('로그인 후 프로필을 확인할 수 있습니다.');
    }
  }, [user, fetchProfile, fetchHistory]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setProfile({ ...profile, nickname });
      setEditMode(false);
      setPassword('');
      alert('프로필이 업데이트되었습니다!');
    } catch (err) {
      alert('업데이트 실패: ' + err.message);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsSubscribed(false);
      setProfile({ ...profile, subscriptionStatus: 'inactive' });
      alert('구독 해지 완료');
      navigate('/subscription');
    } catch (err) {
      alert('구독 해지 실패: ' + err.message);
    }
  };

  const handleExtend = () => {
    if (subscriptionDetails?.planId) {
      navigate(`/payment/${subscriptionDetails.planId}`);
    } else {
      navigate('/subscription-plans');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileBgImage(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  if (loading || authLoading) {
    return <div className="user-profile-page-loading">프로필을 불러오는 중입니다...</div>;
  }

  if (error || !profile) {
    return (
      <div className="user-profile-page-loading user-profile-page-error">
        {error || '로그인 상태를 확인해주세요.'}
      </div>
    );
  }

  return (
    <div className="user-profile-page-container">
      <div className="user-profile-glass-background">
        <div className="user-profile-columns">
          {/* 프로필 편집 영역 */}
          <div className="user-profile-column">
            <div
              className="user-profile-box"
              style={{ backgroundImage: `url(${profileBgImage})` }}
            >
              <div className="user-profile-overlay-dark">
                <h2 className="user-profile-title">내 프로필</h2>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title">프로필 정보</h3>
                  {editMode ? (
                    <form className="user-profile-form" onSubmit={handleUpdate}>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="user-profile-input"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="새 비밀번호"
                        className="user-profile-input"
                      />
                      <div className="user-profile-button-row">
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="btn-default"
                        >
                          취소
                        </button>
                        <button type="submit" className="btn-default">
                          저장
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p>
                        <strong>이메일:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>닉네임:</strong> {profile.nickname}
                      </p>
                      <button onClick={() => setEditMode(true)} className="btn-default">
                        프로필 수정
                      </button>
                    </>
                  )}
                </div>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title">이미지 변경</h3>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title">기타 기능</h3>
                  <h5>다양한 설정과 관리가 가능합니다.</h5>
                  <button onClick={handleLogout} className="btn-default">
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 구독 정보 영역 */}
          
          <div className="user-profile-column">
            
            <div
              className="user-profile-box"
              style={{ backgroundImage: `url(${profileBgImage})` }}
            >
              <div className="user-profile-overlay-dark">
                <h3 className="user-profile-section-title green">구독 정보</h3>
                <p
                  className={`user-profile-subscription-status ${
                    profile.subscriptionStatus === 'active' ? 'active' : 'inactive'
                  }`}
                >
                  {profile.subscriptionStatus === 'active'
                    ? '활성화 : 구독 중'
                    : '비활성화 : 구독 없음'}
                </p>
                <Equalizer isPlaying={profile.subscriptionStatus === 'active'} />
                {profile.subscriptionStatus === 'active' && (
                  <div className="user-profile-button-row">
                    <button onClick={handleExtend} className="btn-green">
                      구독 연장
                    </button>
                    <button onClick={handleUnsubscribe} className="btn-red">
                      구독 해지
                    </button>
                  </div>
                )}
                <button onClick={() => navigate('/subscription')} className="btn-default">
                  구독 상태 확인
                </button>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title green">구독 이력</h3>
                  <ul className="subscription-history-list">
                    {history.length === 0 ? (
                      <li>이력이 없습니다.</li>
                    ) : (
                      history.map((h, idx) => (
                        <li key={h.id || idx}>
                          <strong>{h.planName}</strong>
                          <br />
                          {new Date(h.subscribedAt).toLocaleDateString()} ~{' '}
                          {new Date(h.expiresAt).toLocaleDateString()}
                          <br />
                          ₩{h.price.toLocaleString()}
                        </li>
                      ))
                    )}
                  </ul>
                  <button
                    onClick={() => navigate('/my-subscription')}
                    className="btn-default"
                  >
                    전체 이력 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
