import React, { useEffect, useRef, useState, useCallback, useContext, useMemo } from 'react';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/MusicPlayer.css';
import noSongImage from '../assets/default-cover.jpg';
import Equalizer from './Equalizer';
import {
    FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom,
    FaVolumeUp, FaVolumeMute, FaListUl, FaPlus, FaTimes, FaPen, FaTrash
} from 'react-icons/fa';
import { MdRepeat, MdRepeatOne } from 'react-icons/md';

// IndexedDB 관련 헬퍼 함수들 (기존 로직 유지)
const dbName = 'musicPlayerDB';
const storeName = 'uploadedFiles';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const saveFileToDB = async (fileObj) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(fileObj);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

// Helper for localStorage
const LOCAL_STORAGE_KEY_USER_PLAYLISTS = 'myMusicApp_userPlaylists';
const LOCAL_STORAGE_KEY_SHARED_PLAYLISTS = 'myMusicApp_sharedPlaylists';

const getPlaylistsFromLocalStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        const playlists = data ? JSON.parse(data) : [];
        return playlists.map(p => ({
            ...p,
            ownerId: String(p.ownerId || '임시 목록'),
            songs: Array.isArray(p.songs) ? p.songs : [],
            isPublic: p.isPublic || false
        }));
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return [];
    }
};

const savePlaylistsToLocalStorage = (key, playlists) => {
    try {
        const normalizedPlaylists = playlists.map(p => ({
            ...p,
            ownerId: String(p.ownerId || '임시 목록'),
            songs: Array.isArray(p.songs) ? p.songs : [],
            isPublic: p.isPublic || false
        }));
        localStorage.setItem(key, JSON.stringify(normalizedPlaylists));
    } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
    }
};

// 가사 데이터 (더미용)
const lyricsData = {
    "곡1": "가사1 입니다...",
    "곡2": "가사2 입니다...",
    "곡3": "가사3 입니다...",
};

const MusicPlayer = () => {
    const {
        playlist, playSong, audioRef, removeSongFromPlaylist,
        currentSong, togglePlayPause, isPlaying, nextSong, prevSong, addSongToPlaylist
    } = useContext(MusicPlayerContext);
    const { user } = useContext(AuthContext);

    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [repeatMode, setRepeatMode] = useState('none');
    const [shuffleMode, setShuffleMode] = useState(false);
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
    const [progress, setProgress] = useState(0);

    const [userPlaylists, setUserPlaylists] = useState([]);
    const [sharedPlaylists, setSharedPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isEditingName, setIsEditingName] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [lyrics, setLyrics] = useState('');

    const fileInputRef = useRef(null);
    const popupRef = useRef(null);

    // 메타데이터에서 가사를 가져오는 함수 (시뮬레이션)
    const getLyricsFromMetadata = (song) => {
        if (!song) return '재생 중인 곡이 없습니다.';
        if (song.isLocal) {
            // 실제로는 여기에 노래 파일 메타데이터(예: ID3 태그)를 파싱하는 로직이 들어갑니다.
            // 여기서는 로컬 파일임을 표시하는 더미 가사를 반환합니다.
            return `[로컬 파일] ${song.name} - 가사 메타데이터를 불러오는 중...`;
        }
        // 로컬 파일이 아니면 더미 데이터에서 가사를 찾습니다.
        return lyricsData[song.name] || '가사가 없습니다.';
    };

    useEffect(() => {
        setUserPlaylists(getPlaylistsFromLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS));
        setSharedPlaylists(getPlaylistsFromLocalStorage(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS));
    }, []);

    // 팝업 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target) && !document.querySelector('.playlist-toggle-button').contains(event.target)) {
                setShowPlaylistPopup(false);
            }
        };

        if (showPlaylistPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPlaylistPopup]);

    // 가사 업데이트 훅
    useEffect(() => {
        setLyrics(getLyricsFromMetadata(currentSong));
    }, [currentSong]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (!isNaN(audio.duration) && audio.duration > 0) {
                setProgress((audio.currentTime / audio.duration) * 100);
            } else {
                setProgress(0);
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
        };
    }, [audioRef, currentSong]);

    const formatTime = (time) => {
        if (isNaN(time) || time < 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e) => {
        const newProgress = parseFloat(e.target.value);
        setProgress(newProgress);
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
        }
    };

    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    }, [audioRef, volume]);

    const handleToggleMute = useCallback(() => {
        const newMuteState = !isMuted;
        setIsMuted(newMuteState);
        if (audioRef.current) {
            audioRef.current.volume = newMuteState ? 0 : volume;
        }
    }, [isMuted, volume, audioRef]);

    const handleLocalFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const songId = `local-${Date.now()}`;
            const newSong = {
                id: songId,
                name: file.name,
                artist: '로컬 파일',
                coverUrl: noSongImage,
                url: '',
                isLocal: true,
            };

            try {
                await saveFileToDB({ id: songId, fileData: file });
                addSongToPlaylist(newSong);
                window.showToast(`${file.name} (로컬 파일)이 재생목록에 추가되었습니다.`, 'success');
            } catch (error) {
                window.showToast("파일 저장에 실패했습니다.", 'error');
                console.error("IndexedDB save failed:", error);
            }
        }
    };

    const handleCreatePlaylist = () => {
        if (!user) {
            window.showToast('로그인이 필요합니다.', 'error');
            return;
        }
        if (newPlaylistName.trim() === '') {
            window.showToast('플레이리스트 이름을 입력해주세요.', 'error');
            return;
        }
        if (playlist.length === 0) {
            window.showToast('플레이리스트에 담을 곡이 없습니다.', 'warning');
            return;
        }

        const newPlaylist = {
            id: `playlist-${Date.now()}`,
            name: newPlaylistName,
            isPublic: false,
            songs: playlist,
            ownerId: user.id,
        };
        const updatedPlaylists = [...userPlaylists, newPlaylist];
        setUserPlaylists(updatedPlaylists);
        setNewPlaylistName('');
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
        window.showToast('새 플레이리스트가 생성되었습니다!', 'success');
    };

    const handleTogglePublic = (playlistId) => {
        const updatedPlaylists = userPlaylists.map(pl =>
            pl.id === playlistId ? { ...pl, isPublic: !pl.isPublic } : pl
        );
        setUserPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
        window.showToast('플레이리스트 공개 상태가 변경되었습니다.', 'info');
    };

    const handleSearch = () => {
        if (searchTerm.trim() === '') return;
        try {
            const allPublicPlaylists = userPlaylists.filter(pl => pl.isPublic);
            const results = allPublicPlaylists.filter(pl => pl.name.includes(searchTerm));
            setSearchResults(results);
            window.showToast('플레이리스트 검색 완료!', 'success');
        } catch (error) {
            window.showToast(error.message || '플레이리스트 검색에 실패했습니다.', 'error');
        }
    };

    const handleReceiveSharedPlaylist = async (sharedPlaylist) => {
        const updatedSharedPlaylists = [...sharedPlaylists, sharedPlaylist];
        setSharedPlaylists(updatedSharedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS, updatedSharedPlaylists);
        window.showToast(`'${sharedPlaylist.name}' 플레이리스트를 공유받았습니다.`, 'success');
    };

    const handleRenamePlaylist = (playlistId, newName) => {
        const updatedPlaylists = userPlaylists.map(pl =>
            pl.id === playlistId ? { ...pl, name: newName } : pl
        );
        setUserPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
        setIsEditingName(null);
    };

    const handleDeletePlaylist = (playlistId) => {
        const updatedPlaylists = userPlaylists.filter(pl => pl.id !== playlistId);
        setUserPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS, updatedPlaylists);
    };

    const handleDeleteSharedPlaylist = (playlistId) => {
        const updatedPlaylists = sharedPlaylists.filter(pl => pl.id !== playlistId);
        setSharedPlaylists(updatedPlaylists);
        savePlaylistsToLocalStorage(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS, updatedPlaylists);
    };

    const safeDuration = useMemo(() => audioRef.current?.duration || 0, [audioRef.current?.duration, audioRef]);
    const safeCurrentTime = useMemo(() => audioRef.current?.currentTime || 0, [audioRef.current?.currentTime, audioRef]);

    return (
        <div className="music-player">
            <div className="music-player-bar">
                <div className="music-player-left">
                    <img src={currentSong?.coverUrl || noSongImage} alt="Album Cover" className="music-player-album-cover" />
                    <div className="music-player-text-details">
                        <span className="music-player-song-title">{currentSong?.name || '재생 중인 곡 없음'}</span>
                        <span className="music-player-song-artist">{currentSong?.artist || '선택해주세요'}</span>
                    </div>
                </div>

                <div className="music-player-lyrics-box">
                    <span>{lyrics}</span>
                </div>

                <div className="music-player-controls-area">
                    <div className="music-player-buttons">
                        <button onClick={() => setShuffleMode(!shuffleMode)} className={`control-button ${shuffleMode ? 'shuffle active' : ''}`}>
                            <FaRandom className="icon-style" />
                        </button>
                        <button onClick={prevSong} className="control-button">
                            <FaStepBackward className="icon-style" />
                        </button>
                        <button onClick={togglePlayPause} className={`control-button play-button`}>
                            {isPlaying ? <FaPause className="icon-style" /> : <FaPlay className="icon-style" />}
                        </button>
                        <button onClick={nextSong} className="control-button">
                            <FaStepForward className="icon-style" />
                        </button>
                        <button onClick={() => setRepeatMode(prev => (prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none'))} className={`control-button ${repeatMode !== 'none' ? 'repeat active' : ''}`}>
                            {repeatMode === 'one' ? <MdRepeatOne className="icon-style" /> : <MdRepeat className="icon-style" />}
                        </button>
                    </div>

                    <div className="music-player-progress">
                        <span className="time-current">{formatTime(safeCurrentTime)}</span>
                        <input
                            type="range"
                            className="music-player-progress-bar"
                            value={progress}
                            onChange={handleProgressChange}
                        />
                        <span className="time-duration">{formatTime(safeDuration)}</span>
                    </div>
                </div>

                <div className="music-player-extra-controls">
                    <Equalizer isPlaying={isPlaying} type="linked" />
                    <div className="volume-control-wrapper">
                        <button onClick={handleToggleMute} className="volume-toggle-button">
                            {isMuted ? <FaVolumeMute className="icon-style" /> : <FaVolumeUp className="icon-style" />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                    </div>
                    <button onClick={() => setShowPlaylistPopup(!showPlaylistPopup)} className="playlist-toggle-button">
                        <FaListUl className="icon-style" />
                    </button>
                </div>
            </div>

            {showPlaylistPopup && (
                <div className="playlist-popup" ref={popupRef}>
                    <div className="playlist-header">
                        <button onClick={() => setShowPlaylistPopup(false)} className="popup-button">
                            <FaTimes className="icon-style-popup" />
                        </button>
                    </div>

                    {/* 현재 재생목록 섹션 */}
                    <div className="playlist-section">
                        <h5>현재 재생목록</h5>
                        <div className="playlist-add-form">
                            <button onClick={() => fileInputRef.current.click()} className="playlist-import-button">로컬 파일 추가</button>
                            <input
                                type="file"
                                accept="audio/*"
                                ref={fileInputRef}
                                onChange={handleLocalFileUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <ul className="track-list">
                            {playlist.length > 0 ? (
                                playlist.map(song => (
                                    <li key={song.id} className={currentSong?.id === song.id ? 'active' : ''}>
                                        <div className="playlist-item-title-wrapper" onClick={() => playSong(song)}>{song.name}</div>
                                        <div className="playlist-item-buttons">
                                            <button onClick={() => removeSongFromPlaylist(song.id)} className="playlist-item-delete-button">
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p>재생목록이 비어있습니다.</p>
                            )}
                        </ul>
                    </div>

                    {/* 내 플레이리스트 섹션 */}
                    <div className="playlist-section">
                        <h5>내 플레이리스트</h5>
                        <div className="playlist-add-form">
                            <input
                                type="text"
                                className="playlist-input"
                                placeholder="새 플레이리스트 이름"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                            />
                            <button onClick={handleCreatePlaylist} className="playlist-import-button">생성</button>
                        </div>
                        <ul>
                            {userPlaylists.map(pl => (
                                <li key={pl.id}>
                                    {isEditingName === pl.id ? (
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onBlur={() => handleRenamePlaylist(pl.id, editingName)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRenamePlaylist(pl.id, editingName);
                                            }}
                                        />
                                    ) : (
                                        <span onClick={() => { setIsEditingName(pl.id); setEditingName(pl.name); }}>{pl.name}</span>
                                    )}
                                    <div className="playlist-item-buttons">
                                        <button onClick={() => handleTogglePublic(pl.id)} className={`playlist-visibility-toggle ${pl.isPublic ? 'public' : ''}`}>
                                            {pl.isPublic ? '공개' : '비공개'}
                                        </button>
                                        <button onClick={() => handleDeletePlaylist(pl.id)} className="playlist-item-delete-button">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 공개된 플레이리스트 검색 섹션 */}
                    <div className="playlist-search-section">
                        <h5>공개된 플레이리스트 검색</h5>
                        <div className="playlist-search-input-group">
                            <input
                                type="text"
                                className="playlist-search-input"
                                placeholder="플레이리스트 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button onClick={handleSearch} className="playlist-import-button">검색</button>
                        </div>
                        <div className="playlist-search-results">
                            <ul>
                                {searchResults.length > 0 ? (
                                    searchResults.map(pl => (
                                        <li key={pl.id}>
                                            <span>{pl.name} (by {pl.ownerId})</span>
                                            <div className="playlist-item-buttons">
                                                <span>{pl.ownerId === user?.id ? '임시목록' : 'Linked'}</span>
                                                <button onClick={() => handleReceiveSharedPlaylist(pl)} className="playlist-item-add-song-button">
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p className="no-search-results-message">검색 결과가 없습니다.</p>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* 공유받은 목록 섹션 */}
                    <div className="playlist-section">
                        <h5>공유받은 목록</h5>
                        <ul>
                            {sharedPlaylists.map(pl => (
                                <li key={pl.id}>
                                    <span>{pl.name}</span>
                                    <div className="playlist-item-buttons">
                                        <button onClick={() => handleDeleteSharedPlaylist(pl.id)} className="playlist-item-delete-button">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MusicPlayer;