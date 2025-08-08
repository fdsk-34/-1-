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
    profileBgImage, // AuthContext에서 가져온 profileBgImage
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
  const jwt = localStorage.getItem('jwt'); // JWT는 실제 백엔드 연동 시 필요

  // 사용자 프로필 정보를 가져오는 함수
  const fetchProfile = useCallback(() => {
    if (!user) { // user 객체가 없으면 로그인 필요
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // AuthContext의 user 객체에서 실제 이메일과 닉네임을 가져와 설정
      setProfile({
        email: user.email, // 로그인한 유저의 이메일 사용
        nickname: user.nickname, // 로그인한 유저의 닉네임 사용
        subscriptionStatus: isSubscribed ? 'active' : 'inactive', // AuthContext의 isSubscribed 사용
        profileImageUrl: profileBgImage || '/images/default-profile.jpg' // 기본 이미지 경로 추가
      });
      setNickname(user.nickname); // 닉네임 초기화 (편집 모드용)
    } catch (err) {
      setError('프로필을 불러오는 데 실패했습니다.');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isSubscribed, profileBgImage]); // 의존성 배열에 user, isSubscribed, profileBgImage 추가

  // 구독 이력을 가져오는 함수 (목업 데이터)
  const fetchHistory = useCallback(() => {
    if (!jwt) return; // 실제 API 호출 시 JWT 필요
    // 실제 API 호출 대신 목업 데이터 사용
    setHistory([
      {
        id: 'sub_001',
        planName: 'Premium',
        subscribedAt: '2025-06-01T00:00:00Z',
        expiresAt: '2025-07-01T00:00:00Z',
        price: 14900,
      },
      {
        id: 'sub_002',
        planName: 'Standard',
        subscribedAt: '2024-05-01T00:00:00Z',
        expiresAt: '2024-06-01T00:00:00Z',
        price: 9900,
      },
    ]);
  }, [jwt]);

  // 컴포넌트 마운트 시 프로필 및 이력 가져오기
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHistory();
    } else {
      setLoading(false);
      setError('로그인 후 프로필을 확인할 수 있습니다.');
    }
  }, [user, fetchProfile, fetchHistory]); // 의존성 배열 업데이트

  // 프로필 업데이트 처리
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // 실제 백엔드 연동 로직 (현재는 목업)
      setProfile({ ...profile, nickname });
      setEditMode(false);
      setPassword(''); // 비밀번호 초기화
      alert('프로필이 업데이트되었습니다!');
    } catch (err) {
      alert('업데이트 실패: ' + err.message);
    }
  };

  // 구독 해지 처리
  const handleUnsubscribe = async () => {
    try {
      // 실제 백엔드 연동 로직 (현재는 목업)
      setIsSubscribed(false); // AuthContext 업데이트
      setProfile(prev => ({ ...prev, subscriptionStatus: 'inactive' })); // 로컬 프로필 상태 업데이트
      alert('구독 해지 완료');
      navigate('/subscription'); // 구독 페이지로 이동
    } catch (err) {
      alert('구독 해지 실패: ' + err.message);
    }
  };

  // 구독 연장 처리
  const handleExtend = () => {
    if (subscriptionDetails?.planId) {
      navigate(`/payment/${subscriptionDetails.planId}`); // 특정 플랜 ID로 결제 페이지 이동
    } else {
      navigate('/subscription-plans'); // 구독 플랜 선택 페이지로 이동
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    logout(); // AuthContext의 logout 함수 호출
    navigate('/login'); // 로그인 페이지로 이동
  };

  // 프로필 이미지 업로드 처리
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileBgImage(reader.result); // AuthContext에 이미지 저장
      // 로컬 프로필 상태에도 업데이트 (즉시 반영을 위해)
      setProfile(prev => ({ ...prev, profileImageUrl: reader.result }));
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
      <div className="user-profile-main-wrapper">
        <div className="user-profile-columns">
          {/* 프로필 편집 영역 */}
          <div className="user-profile-column">
            <div className="user-profile-box profile-info-box" style={{ backgroundImage: `url(${profileBgImage})` }}>
              <div className="user-profile-overlay-dark">
                {/* 상단 프로필 이미지 및 닉네임 섹션 */}
                <div className="profile-image-section">
                  <div className="profile-image-circle">
                    {/* profile.profileImageUrl이 없거나 로드 실패 시 기본 이미지 사용 */}
                    <img src={profile.profileImageUrl} alt="프로필 이미지" onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-profile.jpg'; }} />
                  </div>
                  <h2 className="profile-nickname-display">{profile.nickname}</h2>
                  <p className="profile-email-display">{profile.email}</p>
                </div>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title">프로필 정보</h3>
                  {editMode ? (
                    <form className="user-profile-form" onSubmit={handleUpdate}>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="user-profile-input"
                        placeholder="새 닉네임"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="새 비밀번호 (선택 사항)"
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
                    <div className="user-profile-info-display">
                      <p>
                        <strong>이메일:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>닉네임:</strong> {profile.nickname}
                      </p>
                      <button onClick={() => setEditMode(true)} className="btn-default">
                        프로필 수정
                      </button>
                    </div>
                  )}
                </div>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title">프로필 이미지 변경</h3>
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
            <div className="user-profile-box">
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
                {/* 구독 중일 때만 이퀄라이저 활성화 */}
                {profile.subscriptionStatus === 'active' && (
                  <Equalizer isPlaying={true} />
                )}
                
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