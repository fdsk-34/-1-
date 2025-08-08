import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
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
import axios from 'axios';

const dbName = 'musicPlayerDB';
const fileStoreName = 'uploadedFiles';
const lyricsStoreName = 'lyrics';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(fileStoreName)) {
                db.createObjectStore(fileStoreName, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(lyricsStoreName)) {
                db.createObjectStore(lyricsStoreName, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const saveFileToDB = async (fileObj) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(fileStoreName, 'readwrite');
        const store = transaction.objectStore(fileStoreName);
        const request = store.put(fileObj);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const _saveLyricsToDB = async (lyricsObj) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readwrite');
        const store = transaction.objectStore(lyricsStoreName);
        const request = store.put(lyricsObj);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

const getLyricsFromDB = async (songId, language) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(lyricsStoreName, 'readonly');
        const store = transaction.objectStore(lyricsStoreName);
        const id = `${songId}-${language}`;
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
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

const _syncLyricsToServer = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const lyrics = await getAllLyricsFromDB();
    for (const lyric of lyrics) {
        try {
            await axios.post('http://localhost:8080/api/lyrics/admin', {
                songId: lyric.songId,
                language: lyric.language,
                lyrics: lyric.lyrics
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await deleteLyricsFromDB(lyric.id);
            window.showToast(`가사 동기화 성공: ${lyric.songId}`, 'success');
        } catch (err) {
            console.error(`가사 동기화 실패: ${lyric.id}`, err);
        }
    }
};

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
        console.error(`localStorage 읽기 오류 (${key}):`, error);
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
        console.error(`localStorage 쓰기 오류 (${key}):`, error);
    }
};

const searchLyrics = async (songId, language = 'ko') => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/lyrics?songId=${songId}&language=${language}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.lyrics.split('\n').map((text, index) => ({
            text: text.trim(),
            startTime: index * 5
        }));
    } catch (error) {
        const localLyrics = await getLyricsFromDB(songId, language);
        if (localLyrics) {
            return localLyrics.lyrics.split('\n').map((text, index) => ({
                text: text.trim(),
                startTime: index * 5
            }));
        }
        throw new Error(error.response?.data?.error || `[${songId}] 가사 표시에 실패했습니다.`);
    }
};

const getLyricsFromMetadata = async (song) => {
    if (!song || !song.id) {
        return { text: '재생 중인 곡이 없습니다.', isError: true };
    }

    try {
        if (song.isLocal) {
            throw new Error('로컬 파일은 가사 검색을 지원하지 않습니다.');
        }

        const lyrics = await searchLyrics(song.id, 'ko');
        return { lyrics, isError: false };
    } catch (error) {
        console.error(`가사 검색 실패 (${song.name}):`, error);
        window.showToast(error.message, 'error');
        return { text: error.message, isError: true };
    }
};

const MusicPlayer = () => {
    const {
        playlist, playSong, audioRef, removeSongFromPlaylist,
        currentSong, togglePlayPause, isPlaying, nextSong, prevSong, addSongToPlaylist,
        repeatMode, setRepeatMode
    } = useContext(MusicPlayerContext);
    const { user } = useContext(AuthContext);

    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [shuffleMode, setShuffleMode] = useState('none');
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
    const [progress, setProgress] = useState(0);
    const [playedSongs, setPlayedSongs] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [sharedPlaylists, setSharedPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isEditingName, setIsEditingName] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [lyricsData, setLyricsData] = useState({ text: '재생 중인 곡이 없습니다.', isError: true });
    const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
    const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);

    const fileInputRef = useRef(null);
    const popupRef = useRef(null);

    useEffect(() => {
        setUserPlaylists(getPlaylistsFromLocalStorage(LOCAL_STORAGE_KEY_USER_PLAYLISTS));
        setSharedPlaylists(getPlaylistsFromLocalStorage(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target) && !document.querySelector('.playlist-toggle-button')?.contains(event.target)) {
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

    useEffect(() => {
        const updateLyrics = async () => {
            setIsLoadingLyrics(true);
            setCurrentLyricIndex(-1);
            const result = await getLyricsFromMetadata(currentSong);
            setLyricsData(result);
            setIsLoadingLyrics(false);
        };

        updateLyrics();
    }, [currentSong]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !isPlaying || lyricsData.isError || !lyricsData.lyrics || !currentSong?.duration) return;

        const updateLyricIndex = () => {
            const currentTime = audio.currentTime;
            const totalDuration = currentSong.duration;
            const lines = lyricsData.lyrics.length;
            const interval = totalDuration / lines;

            let newIndex = -1;
            for (let i = 0; i < lines; i++) {
                if (currentTime >= i * interval) {
                    newIndex = i;
                } else {
                    break;
                }
            }
            setCurrentLyricIndex(newIndex);
        };

        const intervalId = setInterval(updateLyricIndex, 100);
        return () => clearInterval(intervalId);
    }, [audioRef, isPlaying, lyricsData, currentSong]);

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

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        const handleEnded = async () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                try {
                    await audio.play();
                } catch (error) {
                    console.error('1곡 반복 재생 실패:', error);
                    window.showToast('재생에 실패했습니다.', 'error');
                }
            } else if (repeatMode === 'all' || shuffleMode !== 'none') {
                let nextSongIndex;
                if (shuffleMode === 'random') {
                    nextSongIndex = Math.floor(Math.random() * playlist.length);
                } else if (shuffleMode === 'ordered') {
                    const unplayedSongs = playlist.filter(song => !playedSongs.includes(song.id));
                    if (unplayedSongs.length === 0) {
                        setPlayedSongs([]);
                        nextSongIndex = 0;
                    } else {
                        nextSongIndex = playlist.findIndex(song => song.id === unplayedSongs[0].id);
                    }
                } else {
                    const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
                    nextSongIndex = (currentIndex + 1) % playlist.length;
                }

                if (playlist[nextSongIndex]) {
                    setPlayedSongs(prev => shuffleMode === 'ordered' ? [...prev, playlist[nextSongIndex].id] : prev);
                    playSong(playlist[nextSongIndex]);
                }
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioRef, currentSong, playlist, repeatMode, shuffleMode, playSong, playedSongs]);

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
    }, [audioRef]);

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
                console.error("IndexedDB 저장 실패:", error);
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

    return (
        <div className="music-player">
            <div className="music-player-bar">
                <div className="music-player-left">
                    <img src={currentSong?.coverUrl || noSongImage} alt="앨범 커버" className="music-player-album-cover" />
                    <div className="music-player-text-details">
                        <span className="music-player-song-title">{currentSong?.name || '재생 중인 곡 없음'}</span>
                        <span className="music-player-song-artist">{currentSong?.artist || '선택해주세요'}</span>
                    </div>
                </div>

                <div className="music-player-lyrics-box">
                    {isLoadingLyrics ? (
                        <span className="lyrics-loading">가사 로드 중...</span>
                    ) : lyricsData.isError ? (
                        <span className="lyrics-error">{lyricsData.text}</span>
                    ) : (
                        <span className={`lyrics-line ${currentLyricIndex >= 0 ? 'active' : ''}`}>
                            {currentLyricIndex >= 0 ? lyricsData.lyrics[currentLyricIndex]?.text : ''}
                        </span>
                    )}
                </div>

                <div className="music-player-controls-area">
                    <div className="music-player-buttons">
                        <button 
                            onClick={() => {
                                setShuffleMode(prev => 
                                    prev === 'none' ? 'ordered' : 
                                    prev === 'ordered' ? 'random' : 'none'
                                );
                                setPlayedSongs([]);
                            }} 
                            className={`control-button ${shuffleMode !== 'none' ? 'shuffle active' : ''}`}
                            title={shuffleMode === 'ordered' ? '순차 셔플' : shuffleMode === 'random' ? '랜덤 셔플' : '셔플 끄기'}
                        >
                            <FaRandom className="icon-style" />
                            {shuffleMode === 'ordered' && <span className="mode-indicator">순차</span>}
                            {shuffleMode === 'random' && <span className="mode-indicator">랜덤</span>}
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
                        <button 
                            onClick={() => setRepeatMode(prev => 
                                prev === 'none' ? 'all' : 
                                prev === 'all' ? 'one' : 'none'
                            )} 
                            className={`control-button ${repeatMode !== 'none' ? 'repeat active' : ''}`}
                            title={repeatMode === 'one' ? '1곡 반복' : repeatMode === 'all' ? '전체 반복' : '반복 끄기'}
                        >
                            {repeatMode === 'one' ? 
                                <MdRepeatOne className="icon-style" /> : 
                                <MdRepeat className="icon-style" />
                            }
                            {repeatMode === 'one' && <span className="mode-indicator">1</span>}
                        </button>
                    </div>

                    <div className="music-player-progress">
                        <span className="time-current">{formatTime(audioRef.current?.currentTime || 0)}</span>
                        <input
                            type="range"
                            className="music-player-progress-bar"
                            value={progress}
                            onChange={handleProgressChange}
                        />
                        <span className="time-duration">{formatTime(audioRef.current?.duration || 0)}</span>
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