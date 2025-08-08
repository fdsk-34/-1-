import React, { useState, useEffect } from 'react';
import LoadingToast from '../component/LoadingToast';
import '../styles/ContentManagement.css';
import axios from 'axios';

const dbName = 'musicPlayerDB';
const lyricsStoreName = 'lyrics';

// 더미 데이터
const dummyData = {
  albums: [
    { id: 1, title: "IVE SWITCH", artist: "IVE", cover: "https://via.placeholder.com/150", likes: 15420, followers: 8920 },
    { id: 2, title: "UNFORGIVEN", artist: "LE SSERAFIM", cover: "https://via.placeholder.com/150", likes: 14850, followers: 9130 },
    { id: 3, title: "NewJeans 2nd EP", artist: "NewJeans", cover: "https://via.placeholder.com/150", likes: 13920, followers: 8750 },
    { id: 4, title: "MY WORLD", artist: "(G)I-DLE", cover: "https://via.placeholder.com/150", likes: 12340, followers: 7820 },
    { id: 5, title: "Born Pink", artist: "BLACKPINK", cover: "https://via.placeholder.com/150", likes: 11950, followers: 9540 },
    { id: 6, title: "SEVENTEEN", artist: "SEVENTEEN", cover: "https://via.placeholder.com/150", likes: 11420, followers: 8200 },
    { id: 7, title: "READY TO BE", artist: "TWICE", cover: "https://via.placeholder.com/150", likes: 10850, followers: 7930 },
    { id: 8, title: "The Name Chapter", artist: "TOMORROW X TOGETHER", cover: "https://via.placeholder.com/150", likes: 10320, followers: 6840 },
    { id: 9, title: "Face the Sun", artist: "SEVENTEEN", cover: "https://via.placeholder.com/150", likes: 9870, followers: 7120 },
    { id: 10, title: "Girls", artist: "aespa", cover: "https://via.placeholder.com/150", likes: 9420, followers: 6750 },
    { id: 11, title: "NOEASY", artist: "Stray Kids", cover: "https://via.placeholder.com/150", likes: 8950, followers: 6340 },
    { id: 12, title: "Formula of Love", artist: "TWICE", cover: "https://via.placeholder.com/150", likes: 8520, followers: 5920 },
    { id: 13, title: "Dimension", artist: "ENHYPEN", cover: "https://via.placeholder.com/150", likes: 8120, followers: 5640 },
    { id: 14, title: "Savage", artist: "aespa", cover: "https://via.placeholder.com/150", likes: 7850, followers: 5280 },
    { id: 15, title: "The Chaos Chapter", artist: "TOMORROW X TOGETHER", cover: "https://via.placeholder.com/150", likes: 7420, followers: 4950 },
    { id: 16, title: "LALISA", artist: "LISA", cover: "https://via.placeholder.com/150", likes: 7120, followers: 4630 }
  ],
  artists: [
    { id: 1, name: "IVE", avatar: "https://via.placeholder.com/150", likes: 25420, followers: 128920 },
    { id: 2, name: "LE SSERAFIM", avatar: "https://via.placeholder.com/150", likes: 24850, followers: 119130 },
    { id: 3, name: "NewJeans", avatar: "https://via.placeholder.com/150", likes: 23920, followers: 108750 },
    { id: 4, name: "(G)I-DLE", avatar: "https://via.placeholder.com/150", likes: 22340, followers: 97820 },
    { id: 5, name: "BLACKPINK", avatar: "https://via.placeholder.com/150", likes: 21950, followers: 195540 },
    { id: 6, name: "SEVENTEEN", avatar: "https://via.placeholder.com/150", likes: 21420, followers: 182200 },
    { id: 7, name: "TWICE", avatar: "https://via.placeholder.com/150", likes: 20850, followers: 177930 },
    { id: 8, name: "TOMORROW X TOGETHER", avatar: "https://via.placeholder.com/150", likes: 20320, followers: 146840 },
    { id: 9, name: "aespa", avatar: "https://via.placeholder.com/150", likes: 19420, followers: 136750 },
    { id: 10, name: "Stray Kids", avatar: "https://via.placeholder.com/150", likes: 18950, followers: 126340 },
    { id: 11, name: "ENHYPEN", avatar: "https://via.placeholder.com/150", likes: 18120, followers: 115640 },
    { id: 12, name: "LISA", avatar: "https://via.placeholder.com/150", likes: 17120, followers: 104630 },
    { id: 13, name: "Red Velvet", avatar: "https://via.placeholder.com/150", likes: 16850, followers: 98280 },
    { id: 14, name: "ITZY", avatar: "https://via.placeholder.com/150", likes: 16420, followers: 94950 },
    { id: 15, name: "MAMAMOO", avatar: "https://via.placeholder.com/150", likes: 15950, followers: 89340 },
    { id: 16, name: "OH MY GIRL", avatar: "https://via.placeholder.com/150", likes: 15520, followers: 84630 }
  ],
  songs: [
    { id: 1, title: "SWITCH", artistName: "IVE", lyrics: [{ id: "1-ko", language: "ko", lyrics: "스위치를 올려\n새로운 시작을 해봐" }] },
    { id: 2, title: "UNFORGIVEN", artistName: "LE SSERAFIM", lyrics: [{ id: "2-ko", language: "ko", lyrics: "용서받지 못한 자\n그래도 계속 갈 거야" }] },
    { id: 3, title: "ETA", artistName: "NewJeans", lyrics: [{ id: "3-ko", language: "ko", lyrics: "언제 올 거야\n너무 기다렸어" }] },
    { id: 4, title: "Queencard", artistName: "(G)I-DLE", lyrics: [{ id: "4-ko", language: "ko", lyrics: "I'm a Queencard\n여왕의 카드" }] },
    { id: 5, title: "Pink Venom", artistName: "BLACKPINK", lyrics: [{ id: "5-ko", language: "ko", lyrics: "Pink venom\n독이 퍼져가" }] }
  ]
};

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(lyricsStoreName)) {
                db.createObjectStore(lyricsStoreName, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const saveLyricsToDB = async (lyricsObj) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readwrite');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.put(lyricsObj);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const getAllLyricsFromDB = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readonly');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const deleteLyricsFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readwrite');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const ContentManagement = () => {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [songId, setSongId] = useState('');
  const [language, setLanguage] = useState('ko');
  const [lyricsInput, setLyricsInput] = useState('');
  const [editingLyricsId, setEditingLyricsId] = useState(null);
  const [activeTab, setActiveTab] = useState('lyrics');

  // 개발자 모드 체크
  const isDevelopmentMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        window.showToast && window.showToast('콘텐츠 데이터를 불러오는 중...', 'info');
        
        if (isDevelopmentMode) {
          // 개발자 모드에서는 더미 데이터 사용
          console.log('개발자 모드: 더미 데이터 로드', dummyData);
          setAlbums(dummyData.albums.sort((a, b) => b.likes - a.likes));
          setArtists(dummyData.artists.sort((a, b) => b.followers - a.followers));
          setSongs(dummyData.songs);
          
          // 로컬 가사와 병합
          const localLyrics = await getAllLyricsFromDB();
          const lyricsBySong = {};
          localLyrics.forEach(lyric => {
            if (!lyricsBySong[lyric.songId]) {
              lyricsBySong[lyric.songId] = [];
            }
            lyricsBySong[lyric.songId].push({
              id: lyric.id,
              language: lyric.language,
              lyrics: lyric.lyrics
            });
          });
          setSongs(prevSongs => prevSongs.map(song => ({
            ...song,
            lyrics: lyricsBySong[song.id] || song.lyrics || []
          })));
          
          setLoading(false);
          window.showToast && window.showToast('더미 데이터를 성공적으로 불러왔습니다.', 'success');
        } else {
          // 프로덕션 모드에서는 실제 API 호출
          const token = localStorage.getItem('token');
          const [albumResponse, artistResponse, songResponse] = await Promise.all([
            axios.get('http://localhost:8080/api/albums', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('http://localhost:8080/api/artists', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('http://localhost:8080/api/songs', {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
          setAlbums(albumResponse.data.sort((a, b) => b.likes - a.likes));
          setArtists(artistResponse.data.sort((a, b) => b.followers - a.followers));
          setSongs(songResponse.data);
          
          // 서버 가사와 로컬 가사 병합
          const localLyrics = await getAllLyricsFromDB();
          const lyricsBySong = {};
          localLyrics.forEach(lyric => {
            if (!lyricsBySong[lyric.songId]) {
              lyricsBySong[lyric.songId] = [];
            }
            lyricsBySong[lyric.songId].push({
              id: lyric.id,
              language: lyric.language,
              lyrics: lyric.lyrics
            });
          });
          setSongs(prevSongs => prevSongs.map(song => ({
            ...song,
            lyrics: lyricsBySong[song.id] || song.lyrics || []
          })));
          
          setLoading(false);
          window.showToast && window.showToast('콘텐츠 데이터를 성공적으로 불러왔습니다.', 'success');
        }
      } catch (err) {
        setError(err.message || '콘텐츠 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        window.showToast && window.showToast('콘텐츠 데이터를 불러오지 못했습니다.', 'error');
      }
    };
    fetchData();
  }, [isDevelopmentMode]);

  const handleLike = (id, type) => {
    if (type === 'album') {
      setAlbums(prevAlbums => prevAlbums.map(album => 
        album.id === id ? { ...album, likes: album.likes + 1 } : album
      ));
      window.showToast && window.showToast('앨범에 좋아요를 눌렀습니다.', 'success');
    } else if (type === 'artist') {
      setArtists(prevArtists => prevArtists.map(artist =>
        artist.id === id ? { ...artist, likes: artist.likes + 1 } : artist
      ));
      window.showToast && window.showToast('아티스트에 좋아요를 눌렀습니다.', 'success');
    }
  };

  const handleFollow = (id) => {
    setArtists(prevArtists => prevArtists.map(artist =>
      artist.id === id ? { ...artist, followers: artist.followers + 1 } : artist
    ));
    window.showToast && window.showToast('아티스트를 팔로우했습니다.', 'success');
  };

  const handleLyricsSubmit = async () => {
    if (!songId || !lyricsInput) {
      window.showToast && window.showToast('곡과 가사는 필수입니다.', 'error');
      return;
    }

    const lyricsData = { songId: parseInt(songId), language, lyrics: lyricsInput };
    const lyricsId = editingLyricsId || `${songId}-${language}`;
    
    try {
      if (!isDevelopmentMode) {
        const token = localStorage.getItem('token');
        const response = await axios({
          method: editingLyricsId ? 'PUT' : 'POST',
          url: editingLyricsId ? `http://localhost:8080/api/lyrics/admin/${editingLyricsId}` : 'http://localhost:8080/api/lyrics/admin',
          headers: { Authorization: `Bearer ${token}` },
          data: lyricsData
        });
        window.showToast && window.showToast(response.data.message || '가사가 저장되었습니다.', 'success');
      } else {
        // 개발자 모드에서는 로컬에만 저장
        await saveLyricsToDB({
          id: lyricsId,
          songId: parseInt(songId),
          language,
          lyrics: lyricsInput
        });
        window.showToast && window.showToast('가사가 로컬에 저장되었습니다.', 'success');
      }
      
      setSongs(prevSongs => prevSongs.map(song => 
        song.id === parseInt(songId) ? {
          ...song,
          lyrics: editingLyricsId 
            ? (song.lyrics || []).map(l => l.id === editingLyricsId ? { id: editingLyricsId, language, lyrics: lyricsInput } : l)
            : [...(song.lyrics || []), { id: lyricsId, language, lyrics: lyricsInput }]
        } : song
      ));
    } catch (err) {
      window.showToast && window.showToast(err.message || '서버에 가사를 저장하지 못했습니다. 로컬에 저장합니다.', 'warning');
      await saveLyricsToDB({
        id: lyricsId,
        songId: parseInt(songId),
        language,
        lyrics: lyricsInput
      });
      setSongs(prevSongs => prevSongs.map(song => 
        song.id === parseInt(songId) ? {
          ...song,
          lyrics: editingLyricsId 
            ? (song.lyrics || []).map(l => l.id === editingLyricsId ? { id: editingLyricsId, language, lyrics: lyricsInput } : l)
            : [...(song.lyrics || []), { id: lyricsId, language, lyrics: lyricsInput }]
        } : song
      ));
      window.showToast && window.showToast('가사가 로컬에 저장되었습니다.', 'success');
    }

    setSongId('');
    setLanguage('ko');
    setLyricsInput('');
    setEditingLyricsId(null);
  };

  const handleEditLyrics = async (songId, lyricsId) => {
    try {
      if (!isDevelopmentMode) {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/lyrics/admin/song/${songId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const lyricsData = response.data.find(lyric => lyric.id === lyricsId);
        if (lyricsData) {
          setEditingLyricsId(lyricsId);
          setSongId(songId);
          setLanguage(lyricsData.language);
          setLyricsInput(lyricsData.lyrics);
        } else {
          throw new Error('서버에서 가사를 찾을 수 없습니다.');
        }
      } else {
        // 개발자 모드에서는 로컬에서 찾기
        const localLyrics = await getAllLyricsFromDB();
        const lyricsData = localLyrics.find(lyric => lyric.id === lyricsId);
        if (lyricsData) {
          setEditingLyricsId(lyricsId);
          setSongId(songId);
          setLanguage(lyricsData.language);
          setLyricsInput(lyricsData.lyrics);
        } else {
          // 현재 songs에서 찾기
          const song = songs.find(s => s.id === songId);
          const lyric = song?.lyrics?.find(l => l.id === lyricsId);
          if (lyric) {
            setEditingLyricsId(lyricsId);
            setSongId(songId);
            setLanguage(lyric.language);
            setLyricsInput(lyric.lyrics);
          } else {
            throw new Error('가사를 찾을 수 없습니다.');
          }
        }
      }
    } catch (err) {
      window.showToast && window.showToast(err.message || '가사 데이터를 불러오지 못했습니다.', 'error');
    }
  };

  const handleDeleteLyrics = async (lyricsId) => {
    try {
      if (!isDevelopmentMode) {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/lyrics/admin/${lyricsId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        window.showToast && window.showToast('가사가 삭제되었습니다.', 'success');
      } else {
        await deleteLyricsFromDB(lyricsId);
        window.showToast && window.showToast('로컬 가사가 삭제되었습니다.', 'success');
      }
      
      setSongs(prevSongs => prevSongs.map(song => ({
        ...song,
        lyrics: song.lyrics ? song.lyrics.filter(lyric => lyric.id !== lyricsId) : []
      })));
    } catch (err) {
      await deleteLyricsFromDB(lyricsId);
      window.showToast && window.showToast(err.message || '로컬 가사가 삭제되었습니다.', 'success');
      setSongs(prevSongs => prevSongs.map(song => ({
        ...song,
        lyrics: song.lyrics ? song.lyrics.filter(lyric => lyric.id !== lyricsId) : []
      })));
    }
  };

  const resetForm = () => {
    setSongId('');
    setLanguage('ko');
    setLyricsInput('');
    setEditingLyricsId(null);
  };

  return (
    <div className="content-management-container">
      <div className="admin-header">
        <h2 className="admin-title">콘텐츠 관리 대시보드</h2>
        {isDevelopmentMode && (
          <div className="dev-mode-badge">개발자 모드</div>
        )}
      </div>
      
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'lyrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('lyrics')}
        >
          가사 관리
        </button>
        <button 
          className={`admin-tab ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => setActiveTab('albums')}
        >
          앨범 랭킹
        </button>
        <button 
          className={`admin-tab ${activeTab === 'artists' ? 'active' : ''}`}
          onClick={() => setActiveTab('artists')}
        >
          아티스트 랭킹
        </button>
      </div>

      {activeTab === 'lyrics' && (
        <div className="admin-section">
          <div className="admin-card">
            <h3 className="admin-section-title">가사 관리</h3>
            <div className="lyrics-form">
              <div className="form-row">
                <div className="form-group">
                  <label>곡 선택</label>
                  <select value={songId} onChange={(e) => setSongId(e.target.value)}>
                    <option value="">곡을 선택하세요</option>
                    {songs.map(song => (
                      <option key={song.id} value={song.id}>{song.title} - {song.artistName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>언어</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="ko">한국어</option>
                    <option value="en">영어</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>가사 (한 줄씩 입력)</label>
                <textarea
                  value={lyricsInput}
                  onChange={(e) => setLyricsInput(e.target.value)}
                  placeholder="가사를 줄 단위로 입력하세요"
                  rows={8}
                />
              </div>
              <div className="form-actions">
                <button onClick={handleLyricsSubmit} className="btn-primary">
                  {editingLyricsId ? '가사 수정' : '가사 추가'}
                </button>
                <button onClick={resetForm} className="btn-secondary">
                  초기화
                </button>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h4 className="admin-section-title">저장된 가사 목록</h4>
            <div className="lyrics-list">
              {songs.length === 0 ? (
                <div className="empty-state">노래 데이터가 없습니다.</div>
              ) : (
                songs.map((song, index) => (
                  <div key={song.id} className="lyrics-item">
                    <div className="song-info">
                      <div className="song-number">{index + 1}</div>
                      <div className="song-details">
                        <h5 className="song-title">{song.title}</h5>
                        <p className="song-artist">{song.artistName || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="lyrics-actions">
                      {song.lyrics && song.lyrics.length > 0 ? (
                        song.lyrics.map(lyric => (
                          <div key={lyric.id} className="lyric-item">
                            <span className="language-badge">{lyric.language === 'ko' ? '한국어' : '영어'}</span>
                            <button 
                              onClick={() => handleEditLyrics(song.id, lyric.id)} 
                              className="btn-edit"
                            >
                              수정
                            </button>
                            <button 
                              onClick={() => handleDeleteLyrics(lyric.id)} 
                              className="btn-delete"
                            >
                              삭제
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="no-lyrics">가사 없음</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'albums' && (
        <div className="admin-section">
          <div className="admin-card">
            <h3 className="admin-section-title">
              최근 인기 급상승 앨범 랭킹
              <span className="count-badge">{albums.length}개</span>
            </h3>
            <div className="ranking-grid">
              {albums.length === 0 ? (
                <div className="empty-state">앨범 데이터가 없습니다.</div>
              ) : (
                albums.map((album, index) => (
                  <div key={album.id} className="ranking-card">
                    <div className="ranking-number">{index + 1}</div>
                    <img src={album.cover} alt={album.title} className="item-cover" />
                    <div className="item-info">
                      <h4 className="item-title">{album.title}</h4>
                      <p className="item-subtitle">{album.artist}</p>
                      <div className="item-stats">
                        <span className="stat-item">❤ {album.likes.toLocaleString()}</span>
                        <span className="stat-item">👀 {album.followers.toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleLike(album.id, 'album')} className="btn-action">
                      좋아요
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'artists' && (
        <div className="admin-section">
          <div className="admin-card">
            <h3 className="admin-section-title">
              최근 인기 급상승 아티스트 랭킹
              <span className="count-badge">{artists.length}개</span>
            </h3>
            <div className="ranking-grid">
              {artists.length === 0 ? (
                <div className="empty-state">아티스트 데이터가 없습니다.</div>
              ) : (
                artists.map((artist, index) => (
                  <div key={artist.id} className="ranking-card">
                    <div className="ranking-number">{index + 1}</div>
                    <img src={artist.avatar} alt={artist.name} className="item-avatar" />
                    <div className="item-info">
                      <h4 className="item-title">{artist.name}</h4>
                      <div className="item-stats">
                        <span className="stat-item">❤ {artist.likes.toLocaleString()}</span>
                        <span className="stat-item">👀 {artist.followers.toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleFollow(artist.id)} className="btn-action">
                      팔로우
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;