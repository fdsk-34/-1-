import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';

import 'react-toastify/dist/ReactToastify.css';

// IndexedDB 관련 헬퍼 함수들
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

const getFileFromDB = async (fileId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(fileId);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const MusicPlayerProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);

    // Blob URL 관리 및 오디오 소스 설정 로직을 분리
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        // 이전 Blob URL 해제 클린업
        const prevSongUrl = audio.src;
        return () => {
            if (prevSongUrl && prevSongUrl.startsWith('blob:')) {
                URL.revokeObjectURL(prevSongUrl);
            }
        };
    }, [currentSong]);

    const playSong = useCallback(async (song) => {
        if (!song) {
            window.showToast("선택된 곡이 없습니다.");
            return;
        }

        setIsPlaying(false); // 재생 로직 시작 전 잠시 정지

        try {
            let songUrl = song.url;
            if (song.isLocal) {
                const fileData = await getFileFromDB(song.id);
                if (fileData && fileData.fileData) {
                    songUrl = URL.createObjectURL(fileData.fileData);
                } else {
                    window.showToast("재생할 파일을 찾을 수 없습니다.");
                    return;
                }
            }
            
            // 오디오 소스 업데이트
            audioRef.current.src = songUrl;
            setCurrentSong({ ...song, url: songUrl });
            
            // 재생 로직
            await audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error("Audio playback failed:", error);
                window.showToast("음악 재생에 실패했습니다. 플레이 버튼을 눌러주세요.");
                setIsPlaying(false);
            });
            
        } catch (error) {
            console.error("Failed to load file:", error);
            window.showToast("파일 로딩 중 오류가 발생했습니다.");
            setCurrentSong(null);
            setIsPlaying(false);
        }
    }, []);

    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!currentSong) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(error => {
                console.error("Autoplay failed:", error);
                window.showToast("재생이 실패했습니다. 다시 시도해주세요.");
            });
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying, currentSong]);

    const nextSong = useCallback(() => {
        setPlaylist(prevPlaylist => {
            if (!currentSong || prevPlaylist.length <= 1) return prevPlaylist;
            
            const currentIndex = prevPlaylist.findIndex(song => song.id === currentSong.id);
            const nextIndex = (currentIndex + 1) % prevPlaylist.length;
            
            playSong(prevPlaylist[nextIndex]);
            return prevPlaylist;
        });
    }, [currentSong, playSong]);

    const prevSong = useCallback(() => {
        setPlaylist(prevPlaylist => {
            if (!currentSong || prevPlaylist.length <= 1) return prevPlaylist;
            
            const currentIndex = prevPlaylist.findIndex(song => song.id === currentSong.id);
            const prevIndex = (currentIndex - 1 + prevPlaylist.length) % prevPlaylist.length;
            
            playSong(prevPlaylist[prevIndex]);
            return prevPlaylist;
        });
    }, [currentSong, playSong]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        audio.addEventListener('ended', nextSong);
        return () => {
            audio.removeEventListener('ended', nextSong);
        };
    }, [nextSong]);

    const addSongToPlaylist = useCallback((song) => {
        setPlaylist((prevPlaylist) => {
            if (prevPlaylist.some(s => s.id === song.id)) {
                window.showToast(`${song.name}은(는) 이미 재생목록에 있습니다.`);
                return prevPlaylist;
            }
            const newPlaylist = [...prevPlaylist, song];
            if (!currentSong) {
                playSong(song); // 재생목록에 곡이 없을 때 바로 재생
            }
            return newPlaylist;
        });
        window.showToast(`${song.name}이(가) 현재 재생목록에 추가되었습니다.`);
    }, [currentSong, playSong]);

    const removeSongFromPlaylist = useCallback((songId) => {
        setPlaylist((prevPlaylist) => {
            const updatedPlaylist = prevPlaylist.filter(song => song.id !== songId);
            window.showToast('재생목록에서 곡이 삭제되었습니다.');
            if (currentSong?.id === songId) {
                if (updatedPlaylist.length > 0) {
                    const nextSongIndex = prevPlaylist.findIndex(song => song.id === songId) % updatedPlaylist.length;
                    playSong(updatedPlaylist[nextSongIndex]);
                } else {
                    setCurrentSong(null);
                    setIsPlaying(false);
                }
            }
            return updatedPlaylist;
        });
    }, [currentSong, playSong]);

    const value = useMemo(() => ({
        currentSong, isPlaying, playlist, playSong, pauseSong: () => {}, togglePlayPause,
        nextSong, prevSong, addSongToPlaylist, removeSongFromPlaylist, audioRef,
    }), [currentSong, isPlaying, playlist, playSong, togglePlayPause, nextSong, prevSong, addSongToPlaylist, removeSongFromPlaylist]);

    return (
        <MusicPlayerContext.Provider value={value}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export { MusicPlayerProvider };