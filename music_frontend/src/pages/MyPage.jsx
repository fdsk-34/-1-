import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MyPage.css';

const cardData = [
  {
    id: 1,
    title: '구독 상태',
    description: '남은 기간 및 등급 보기',
    image: '/images/K-017.jpg',
  //  icon: '/icons/subscription-status.png',
    link: '/subscription-plans',
  },
  {
    id: 2,
    title: '구독 관리',
    description: '구독 연장, 해지',
    image: '/images/K-027.jpg',
   // icon: '/icons/cancel-subscription.png',
    link: '/subscription',
  },
  {
    id: 3,
    title: '나만의 플레이리스트',
    description: '보관한 노래 목록',
    image: '/images/K-037.jpg',
   // icon: '/icons/playlist.png',
    link: '/my-playlists',
  },
  {
    id: 4,
    title: '커뮤니티',
    description: '작성한 댓글 보기',
    image: '/images/K-018.jpg',
   // icon: '/icons/comments.png',
    link: '/comments',
  },
  {
    id: 5,
    title: '즐겨찾기 음악',
    description: '좋아요 & 팔로잉',
    image: '/images/K-019.jpg',
  //  icon: '/icons/like.png',
    link: '/likes',
  },
  {
    id: 6,
    title: '재생 기록',
    description: '최근 들은 곡 보기',
    image: '/images/K-021.jpg',
  //  icon: '/icons/history.png',
    link: '/history',
  },
];

export default function MyPage() {
  return (
    <div className="mypage-container">
      {/* 타이틀 영역 */}
      <div className="mypage-title-area">
        <div
          className="title-card"
          style={{ backgroundImage: `url('/images/profile-bg.jpg')` }}
        >
          <div className="content-wrapper">
            <h1>마이 페이지</h1>
          </div>
        </div>
      </div>

      {/* 프로필과 카드 그리드 컨테이너 */}
      <div className="mypage-content">
        {/* 왼쪽 프로필 편집 영역 */}
        <div className="mypage-profile-area"> 
          <div
            className="profile-edit-card"
            style={{ backgroundImage: `url('/images/K-045.jpg')` }}
          >
            <div className="content-wrapper">
              <h2>프로필 편집</h2>
              <p>닉네임, 이미지, 비밀번호를 수정해보세요.</p>
              <Link to="/profile" className="profile-edit-link">
                프로필 수정
              </Link>
            </div>
          </div>

          {/* 이퀄라이저 바 */}
          <div className="equalizer-bar">
            {[...Array(30)].map((_, idx) => (
              <div key={idx} className="bar" style={{ '--i': idx }}></div>
            ))}
          </div>
        </div>

        {/* 오른쪽 카드 영역 */}
        <div className="mypage-grid">
          {cardData.map((card) => (
            <Link to={card.link} key={card.id} className="mypage-card">
              <div
                className="mypage-card-content"
                style={{
                  backgroundImage: `url(${card.image})`,
                }}
              >
                <div className="overlay">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <div className="card-icon-overlay">
                  <img src={card.icon} alt={card.title} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}