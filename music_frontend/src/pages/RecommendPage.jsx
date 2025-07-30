// src/pages/RecommendPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import SongFilterBar from '../component/SongFilterBar';
import FilterButtons from '../component/FilterButtons';
import PlaylistDrawer from '../component/PlaylistDrawer'; // PlaylistDrawer 임포트 확인

import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/RecommendPage.css'; // 최종 수정된 CSS 임포트

// --- 더미 데이터 (K52-K72, DUMMY_GENRES, DUMMY_ARTISTS, DUMMY_ALBUMS, DUMMY_SONGS, DUMMY_FEATURED_PLAYLISTS) ---
// Note: K55 is assumed to be K-055.jpg based on previous context.
const DUMMY_GENRES = [
  { id: 'dg1', name: '발라드', imageUrl: '/images/K-057.jpg' },
  { id: 'dg2', name: '댄스', imageUrl: '/images/K-058.jpg' },
  { id: 'dg3', name: '힙합', imageUrl: '/images/K-059.jpg' },
  { id: 'dg4', name: '재즈', imageUrl: '/images/K-051.jpg' },
  { id: 'dg5', name: '락', imageUrl: '/images/K-052.jpg' },
  { id: 'dg6', name: '트로트', imageUrl: '/images/K-053.jpg' },
  { id: 'dg7', name: '팝', imageUrl: '/images/K-054.jpg' },
  { id: 'dg8', name: 'R&B', imageUrl: '/images/K-055.jpg' },
  { id: 'dg9', name: '클래식', imageUrl: '/images/K-056.jpg' },
  { id: 'dg10', name: 'EDM', imageUrl: '/images/K-010.jpg' },
  { id: 'dg11', name: '컨트리', imageUrl: '/images/K-011.jpg' },
  { id: 'dg12', name: '레게', imageUrl: '/images/K-015.jpg' },
];

const DUMMY_ARTISTS = [
  { id: 'da_a1', name: '별빛가수', profileImageUrl: '/images/K-051.jpg', genre: '발라드', origin: '국내' },
  { id: 'da_a2', name: '댄스신', profileImageUrl: '/images/K-052.jpg', genre: '댄스', origin: '해외' },
  { id: 'da_a3', name: '하늘가수', profileImageUrl: '/images/K-053.jpg', genre: '발라드', origin: '국내' },
  { id: 'da_a4', name: '리듬킹', profileImageUrl: '/images/K-054.jpg', genre: '댄스', origin: '해외' },
  { id: 'da_a5', name: '달빛가수', profileImageUrl: '/images/K-055.jpg', genre: '힙합', origin: '국내' },
  { id: 'da_a6', name: '비트마스터', profileImageUrl: '/images/K-056.jpg', genre: '댄스', origin: '해외' },
  { id: 'da_a7', name: '별하늘', profileImageUrl: '/images/K-057.jpg', genre: '발라드', origin: '국내' },
  { id: 'da_a8', name: '댄스퀸', profileImageUrl: '/images/K-058.jpg', genre: '댄스', origin: '해외' },
  { id: 'da_a9', name: '바다노래', profileImageUrl: '/images/K-059.jpg', genre: '힙합', origin: '국내' },
  { id: 'da_a10', name: '재즈킹', profileImageUrl: '/images/K-011.jpg', genre: '재즈', origin: '국내' },
  { id: 'da_a11', name: '락스타', profileImageUrl: '/images/K-012.jpg', genre: '락', origin: '해외' },
  { id: 'da_a12', name: '트로트왕', profileImageUrl: '/images/K-013.jpg', genre: '트로트', origin: '국내' },
  { id: 'da_a13', name: '팝프린스', profileImageUrl: '/images/K-010.jpg', genre: '팝', origin: '해외' },
  { id: 'da_a14', name: 'R&B소울', profileImageUrl: '/images/K-015.jpg', genre: 'R&B', origin: '국내' },
];

const DUMMY_ALBUMS = [
  { id: 'da1', title: '봄날의 멜로디', artist: '플로이', coverUrl: '/images/K-051.jpg', songCount: 10, updatedAt: '2024.07.10', genre: '발라드', origin: '국내', isHighQuality: true },
  { id: 'da2', title: '어느 맑은 날', artist: '클로버', coverUrl: '/images/K-052.jpg', songCount: 12, updatedAt: '2024.07.08', genre: '댄스', origin: '해외', isHighQuality: false },
  { id: 'da3', title: '향기로운 기억', artist: '레몬트리', coverUrl: '/images/K-053.jpg', songCount: 8, updatedAt: '2024.07.05', genre: '힙합', origin: '국내', isHighQuality: true },
  { id: 'da4', title: '밤거리 가로등', artist: '레몬트리', coverUrl: '/images/K-054.jpg', songCount: 9, updatedAt: '2024.07.05', genre: '재즈', origin: '국내', isHighQuality: false },
  { id: 'da5', title: '밥먹는 시간', artist: '레몬트리', coverUrl: '/images/K-055.jpg', songCount: 11, updatedAt: '2024.07.05', genre: '락', origin: '해외', isHighQuality: true },
  { id: 'da6', title: '퇴근 길', artist: '레몬트리', coverUrl: '/images/K-056.jpg', songCount: 13, updatedAt: '2024.07.05', genre: '트로트', origin: '국내', isHighQuality: false },
  { id: 'da7', title: '새벽의 노래', artist: '플로이', coverUrl: '/images/K-057.jpg', songCount: 10, updatedAt: '2024.07.04', genre: '발라드', origin: '국내', isHighQuality: true },
  { id: 'da8', title: '여름 바람', artist: '클로버', coverUrl: '/images/K-058.jpg', songCount: 12, updatedAt: '2024.07.03', genre: '댄스', origin: '해외', isHighQuality: false },
  { id: 'da9', title: '추억의 길', artist: '레몬트리', coverUrl: '/images/K-059.jpg', songCount: 8, updatedAt: '2024.07.02', genre: '힙합', origin: '국내', isHighQuality: true },
  { id: 'da10', title: '달빛 소나타', artist: '레몬트리', coverUrl: '/images/K-011.jpg', songCount: 9, updatedAt: '2024.07.01', genre: '재즈', origin: '국내', isHighQuality: false },
  { id: 'da11', title: '아침 햇살', artist: '레몬트리', coverUrl: '/images/K-012.jpg', songCount: 11, updatedAt: '2024.06.30', genre: '락', origin: '해외', isHighQuality: true },
  { id: 'da12', title: '저녁 풍경', artist: '레몬트리', coverUrl: '/images/K-013.jpg', songCount: 13, updatedAt: '2024.06.29', genre: '트로트', origin: '국내', isHighQuality: false },
  { id: 'da13', title: '별빛 아래', artist: '플로이', coverUrl: '/images/K-014.jpg', songCount: 10, updatedAt: '2024.06.28', genre: '발라드', origin: '국내', isHighQuality: true },
];

const DUMMY_SONGS = [
  { id: 'ds1', title: '환상속의 그대', artist: '플로아', coverUrl: '/images/K-055.jpg', isHighQuality: true, songCount: 1, updatedAt: '2024.07.10', genre: '발라드', origin: '국내' },
  { id: 'ds2', title: '고요한 숲', artist: '멜로디온', coverUrl: '/images/K-056.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.08', genre: '댄스', origin: '해외' },
  { id: 'ds3', title: '길가는 중', artist: '멜로디온', coverUrl: '/images/K-057.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.08', genre: '댄스', origin: '해외' },
  { id: 'ds4', title: '밤거리 가로등', artist: '멜로디온', coverUrl: '/images/K-054.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.08', genre: '댄스', origin: '해외' },
  { id: 'ds5', title: '밥먹는 시간', artist: '멜로디온', coverUrl: '/images/K-058.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.08', genre: '댄스', origin: '해외' },
  { id: 'ds6', title: '퇴근길', artist: '멜로디온', coverUrl: '/images/K-059.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.08', genre: '댄스', origin: '국내' },
  { id: 'ds7', title: '아침 안개', artist: '플로아', coverUrl: '/images/K-010.jpg', isHighQuality: true, songCount: 1, updatedAt: '2024.07.07', genre: '발라드', origin: '국내' },
  { id: 'ds8', title: '달빛 댄스', artist: '멜로디온', coverUrl: '/images/K-011.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.06', genre: '댄스', origin: '해외' },
  { id: 'ds9', title: '바다의 노래', artist: '플로아', coverUrl: '/images/K-012.jpg', isHighQuality: true, songCount: 1, updatedAt: '2024.07.05', genre: '발라드', origin: '국내' },
  { id: 'ds10', title: '도시의 밤', artist: '멜로디온', coverUrl: '/images/K-013.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.04', genre: '댄스', origin: '해외' },
  { id: 'ds11', title: '숨결', artist: '플로아', coverUrl: '/images/K-014.jpg', isHighQuality: true, songCount: 1, updatedAt: '2024.07.03', genre: '발라드', origin: '국내' },
  { id: 'ds12', title: '리듬의 시작', artist: '멜로디온', coverUrl: '/images/K-015.jpg', isHighQuality: false, songCount: 1, updatedAt: '2024.07.02', genre: '댄스', origin: '해외' },
  { id: 'ds13', title: '고요한 밤', artist: '플로아', coverUrl: '/images/K-016.jpg', isHighQuality: true, songCount: 1, updatedAt: '2024.07.01', genre: '발라드', origin: '국내' },
];

const DUMMY_FEATURED_PLAYLISTS = [
  { id: 'fp1', title: 'FLO 추천! 힐링 음악', artist: 'Various Artists', coverUrl: '/images/K-051.jpg', songCount: 20, updatedAt: '2024.07.10', genre: '발라드', origin: '국내', isHighQuality: true },
  { id: 'fp2', title: '드라이브 히트', artist: 'Drive Sound', coverUrl: '/images/K-052.jpg', songCount: 18, updatedAt: '2024.07.10', genre: '댄스', origin: '해외', isHighQuality: false },
  { id: 'fp3', title: '환상속의 그대', artist: 'Drive Sound', coverUrl: '/images/K-053.jpg', songCount: 21, updatedAt: '2024.07.10', genre: '트로트', origin: '해외', isHighQuality: true },
  { id: 'fp4', title: '밤거리 소나타', artist: 'Drive Sound', coverUrl: '/images/K-054.jpg', songCount: 22, updatedAt: '2024.07.10', genre: '발라드', origin: '해외', isHighQuality: false },
  { id: 'fp5', title: '트로피컬 팝비트', artist: 'Drive Sound', coverUrl: '/images/K-055.jpg', songCount: 23, updatedAt: '2024.07.10', genre: '락', origin: '해외', isHighQuality: true },
  { id: 'fp6', title: '사우전드 나이트', artist: 'Drive Sound', coverUrl: '/images/K-056.jpg', songCount: 24, updatedAt: '2024.07.10', genre: '재즈', origin: '해외', isHighQuality: false },
  { id: 'fp7', title: '봄의 선율', artist: 'Various Artists', coverUrl: '/images/K-057.jpg', songCount: 20, updatedAt: '2024.07.09', genre: '발라드', origin: '국내', isHighQuality: true },
  { id: 'fp8', title: '여름 파티', artist: 'Drive Sound', coverUrl: '/images/K-058.jpg', songCount: 18, updatedAt: '2024.07.09', genre: '댄스', origin: '해외', isHighQuality: false },
  { id: 'fp9', title: '가을 낭만', artist: 'Various Artists', coverUrl: '/images/K-059.jpg', songCount: 21, updatedAt: '2024.07.08', genre: '트로트', origin: '국내', isHighQuality: true },
  { id: 'fp10', title: '겨울의 꿈', artist: 'Drive Sound', coverUrl: '/images/K-010.jpg', songCount: 22, updatedAt: '2024.07.08', genre: '발라드', origin: '해외', isHighQuality: false },
  { id: 'fp11', title: '록 페스티벌', artist: 'Drive Sound', coverUrl: '/images/K-011.jpg', songCount: 23, updatedAt: '2024.07.07', genre: '락', origin: '해외', isHighQuality: true },
  { id: 'fp12', title: '재즈 나이트', artist: 'Various Artists', coverUrl: '/images/K-012.jpg', songCount: 24, updatedAt: '2024.07.07', genre: '재즈', origin: '국내', isHighQuality: false },
  { id: 'fp13', title: '힙합 비트', artist: 'Drive Sound', coverUrl: '/images/K-013.jpg', songCount: 20, updatedAt: '2024.07.06', genre: '힙합', origin: '해외', isHighQuality: true },
];

const HOT_NEW_FILTERS = [
  { label: '종합', value: 'all' },
  { label: '국내', value: '국내' },
  { label: '해외', value: '해외' },
];
const POPULAR_ARTIST_FILTERS = HOT_NEW_FILTERS;

// ✨ 배경 스키마 리스트 정의 ✨
const BACKGROUND_SCHEMES = [
  'gradient-scheme-1', // 파란-핑크 계열
  'gradient-scheme-2', // 주황-보라 계열
  'gradient-scheme-3', // 초록-파랑 계열
  'gradient-scheme-4', // 빨강-노랑 계열
  'gradient-scheme-5', // 시원한 파랑-하늘색 계열
];


const RecommendPage = () => {
  const { playSong } = useContext(MusicPlayerContext);

  const [filterHighQuality, setFilterHighQuality] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [isFilterOptionsVisible, setIsFilterOptionsVisible] = useState(false);
  const [hotNewFilter, setHotNewFilter] = useState('all');
  const [popularArtistsFilter, setPopularArtistsFilter] = useState('all');

  const [todayAlbums, setTodayAlbums] = useState([]);
  const [hotNewSongs, setHotNewSongs] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);

  // ✨ 현재 활성 배경 스키마 상태 (단일 상태로 모든 섹션에 적용) ✨
  const [currentBgSchemeIndex, setCurrentBgSchemeIndex] = useState(0);

  const applyHighQualityFilter = useCallback(
    (data) => (filterHighQuality ? data.filter((item) => item.isHighQuality) : data),
    [filterHighQuality]
  );

  useEffect(() => {
    setTodayAlbums(
      applyHighQualityFilter(DUMMY_ALBUMS).filter((a) => !genreFilter || a.genre === genreFilter)
    );
    setHotNewSongs(
      applyHighQualityFilter(DUMMY_SONGS).filter((s) => !genreFilter || s.genre === genreFilter)
    );
    setPopularArtists(DUMMY_ARTISTS.filter((a) => !genreFilter || a.genre === genreFilter));
    setFeaturedPlaylists(
      applyHighQualityFilter(DUMMY_FEATURED_PLAYLISTS).filter(
        (p) => !genreFilter || p.genre === genreFilter
      )
    );
  }, [genreFilter, filterHighQuality, applyHighQualityFilter]);

  const filterSectionData = (data, filterValue, sectionType) => {
    if (!data || filterValue === 'all') return data;
    if (
      sectionType === 'hotNewSongs' ||
      sectionType === 'popularArtists' ||
      sectionType === 'featuredPlaylists' ||
      sectionType === 'todayAlbums'
    ) {
      return data.filter((item) => item.origin === filterValue);
    }
    return data;
  };

  const handleGenreFilterApply = (genre) => {
    setGenreFilter(genre);
    setIsFilterOptionsVisible(false);
  };

  const handleFilterButtonClick = () => {
    setIsFilterOptionsVisible((prev) => !prev);
  };

  const handlePlayTheme = (item) => {
    playSong({
      id: item.id,
      title: item.title,
      artist: item.artist || 'Various Artists',
      coverUrl: item.coverUrl,
    });
    alert(`${item.title} - ${item.artist || 'Various Artists'} 재생 시작!`);
  };

  // ✨ 배경 스키마를 다음으로 변경하는 함수 (캐러셀 페이지 이동 시 호출될 예정) ✨
  const handleNextBackgroundScheme = useCallback(() => {
    setCurrentBgSchemeIndex(prevIndex => (prevIndex + 1) % BACKGROUND_SCHEMES.length);
  }, []);


  return (
    <div className="recommend-page-container">
      {/* 📌 추가했던 '배경 변경' 버튼은 제거되어야 합니다. 페이지 이동 시 자동으로 바뀌도록 할 예정. */}

      <div className="song-filter-bar-container">
        <button className="genre-filter-toggle-btn" onClick={handleFilterButtonClick}>
          장르 필터 {isFilterOptionsVisible ? '▲' : '▼'}
        </button>

        {isFilterOptionsVisible && (
          <div className="genre-filter-options-popup">
            <div className="filter-options-content">
              <label className="filter-option-item">
                <input
                  type="radio"
                  name="genre"
                  value=""
                  checked={genreFilter === ''}
                  onChange={() => handleGenreFilterApply('')}
                />
                모든 장르
              </label>
              {DUMMY_GENRES.map((g) => (
                <label key={g.id} className="filter-option-item">
                  <input
                    type="radio"
                    name="genre"
                    value={g.name}
                    checked={genreFilter === g.name}
                    onChange={() => handleGenreFilterApply(g.name)}
                  />
                  {g.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <SongFilterBar
          filterHighQuality={filterHighQuality}
          setFilterHighQuality={setFilterHighQuality}
        />
      </div>

      {/* ✨ 각 PlaylistDrawer에 동적 containerClassName (현재 배경 스키마) 전달 ✨ */}
      {/* PlaylistDrawer 내부에서는 이 containerClassName을 recommend-section에 합쳐야 합니다. */}
      {/* PlaylistDrawer 내부의 캐러셀 이동 버튼 클릭 시 handleNextBackgroundScheme 함수 호출 필요. */}
      <PlaylistDrawer
        title="추천 테마 플레이리스트"
        sectionType="featuredPlaylists"
        initialData={filterSectionData(featuredPlaylists, hotNewFilter, 'featuredPlaylists')}
        filterButtons={
          <FilterButtons
            currentFilter={hotNewFilter}
            onFilterChange={setHotNewFilter}
            filters={HOT_NEW_FILTERS}
            className="hidden"
          />
        }
        onPlayTheme={handlePlayTheme}
        cardType="album"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]} /* ✨ 동적 클래스명 */
        onPageChange={handleNextBackgroundScheme} /* ✨ 페이지 이동 시 배경 스키마 변경 함수 전달 */
      />

      <PlaylistDrawer
        title="오늘 발매 음악"
        sectionType="todayAlbums"
        initialData={filterSectionData(todayAlbums, hotNewFilter, 'todayAlbums')}
        filterButtons={null}
        onPlayTheme={handlePlayTheme}
        cardType="album"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]} /* ✨ 동적 클래스명 */
        onPageChange={handleNextBackgroundScheme} /* ✨ 페이지 이동 시 배경 스키마 변경 함수 전달 */
      />

      <PlaylistDrawer
        title="HOT & NEW"
        sectionType="hotNewSongs"
        initialData={filterSectionData(hotNewSongs, hotNewFilter, 'hotNewSongs')}
        filterButtons={
          <FilterButtons
            currentFilter={hotNewFilter}
            onFilterChange={setHotNewFilter}
            filters={HOT_NEW_FILTERS}
          />
        }
        onPlayTheme={handlePlayTheme}
        cardType="album"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]} /* ✨ 동적 클래스명 */
        onPageChange={handleNextBackgroundScheme} /* ✨ 페이지 이동 시 배경 스키마 변경 함수 전달 */
      />

      <PlaylistDrawer
        title="장르"
        sectionType="genres"
        initialData={DUMMY_GENRES}
        filterButtons={null}
        onPlayTheme={null}
        cardType="genre"
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]} /* ✨ 동적 클래스명 */
        onPageChange={handleNextBackgroundScheme} /* ✨ 페이지 이동 시 배경 스키마 변경 함수 전달 */
      />

      <PlaylistDrawer
        title="인기 아티스트"
        sectionType="popularArtists"
        initialData={filterSectionData(popularArtists, popularArtistsFilter, 'popularArtists')}
        filterButtons={
          <FilterButtons
            currentFilter={popularArtistsFilter}
            onFilterChange={setPopularArtistsFilter}
            filters={POPULAR_ARTIST_FILTERS}
          />
        }
        onPlayTheme={null}
        cardType="artist"
        gridLayout={true}
        cardsPerPage={6}
        className="popular-artists" /* 기존 className 유지 */
        containerClassName={BACKGROUND_SCHEMES[currentBgSchemeIndex]} /* ✨ 동적 클래스명 */
        onPageChange={handleNextBackgroundScheme} /* ✨ 페이지 이동 시 배경 스키마 변경 함수 전달 */
      />
    </div>
  );
};

RecommendPage.propTypes = {};

export default RecommendPage;