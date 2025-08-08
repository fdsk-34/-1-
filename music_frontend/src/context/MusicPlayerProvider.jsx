import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';

// IndexedDB 관련 헬퍼 함수들
const dbName = 'musicPlayerDB';
const storeName = 'uploadedFiles';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
            // 플레이리스트 저장소도 필요하면 추가
            if (!db.objectStoreNames.contains('playlists')) {
                db.createObjectStore('playlists', { keyPath: 'id' });
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
    const [repeatMode, setRepeatMode] = useState('none'); // none, one, all

    // Blob URL 관리를 위한 현재 URL 추적
    const [currentBlobUrl, setCurrentBlobUrl] = useState(null);

    // Blob URL 정리 함수
    const cleanupBlobUrl = useCallback((url) => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }, []);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (currentBlobUrl) {
                cleanupBlobUrl(currentBlobUrl);
            }
        };
    }, [currentBlobUrl, cleanupBlobUrl]);

    const playSong = useCallback(async (song) => {
        if (!song) {
            window.showToast("선택된 곡이 없습니다.", 'error');
            return;
        }

        // 동일한 곡이면 src 변경 및 load 생략하고 재생 상태만 토글
        if (currentSong?.id === song.id && audioRef.current.src) {
            if (audioRef.current.paused) {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (error) {
                    console.error("재생 실패:", error);
                    window.showToast("재생에 실패했습니다. 플레이 버튼을 눌러주세요.", 'error');
                    setIsPlaying(false);
                }
            }
            return;
        }

        setIsPlaying(false); // 재생 로직 시작 전 잠시 정지

        try {
            let songUrl = song.url;
            
            // 로컬 파일인 경우 IndexedDB에서 파일 데이터 가져오기
            if (song.isLocal) {
                const fileData = await getFileFromDB(song.id);
                if (fileData && fileData.fileData) {
                    // 이전 Blob URL 정리
                    if (currentBlobUrl) {
                        cleanupBlobUrl(currentBlobUrl);
                    }
                    
                    songUrl = URL.createObjectURL(fileData.fileData);
                    setCurrentBlobUrl(songUrl);
                } else {
                    window.showToast("재생할 파일을 찾을 수 없습니다.", 'error');
                    return;
                }
            } else {
                // 서버 파일인 경우 이전 Blob URL 정리
                if (currentBlobUrl) {
                    cleanupBlobUrl(currentBlobUrl);
                    setCurrentBlobUrl(null);
                }
            }

            // 오디오 소스 업데이트
            audioRef.current.src = songUrl;
            setCurrentSong({ ...song, url: songUrl });

            // 재생 로직
            try {
                audioRef.current.load(); // 명시적 로드
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error("Audio playback failed:", error);
                window.showToast("음악 재생에 실패했습니다. 플레이 버튼을 눌러주세요.", 'error');
                setIsPlaying(false);
            }
        } catch (error) {
            console.error("Failed to load file:", error);
            window.showToast("파일 로딩 중 오류가 발생했습니다.", 'error');
            setCurrentSong(null);
            setIsPlaying(false);
        }
    }, [currentSong, currentBlobUrl, cleanupBlobUrl]);

    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!currentSong) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(error => {
                console.error("Autoplay failed:", error);
                window.showToast("재생이 실패했습니다. 다시 시도해주세요.", 'error');
            });
            setIsPlaying(true);
        }
    }, [isPlaying, currentSong]);

    const nextSong = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        if (repeatMode === 'one') {
            // 1곡 반복: 현재 곡 재생
            audioRef.current.currentTime = 0;
            playSong(currentSong);
        } else {
            const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
            const nextIndex = (currentIndex + 1) % playlist.length;
            playSong(playlist[nextIndex]);
        }
    }, [currentSong, playlist, repeatMode, playSong]);

    const prevSong = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        if (repeatMode === 'one') {
            // 1곡 반복: 현재 곡 재생
            audioRef.current.currentTime = 0;
            playSong(currentSong);
        } else {
            const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
            const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            playSong(playlist[prevIndex]);
        }
    }, [currentSong, playlist, repeatMode, playSong]);

    const addSongToPlaylist = useCallback(async (song) => {
        return new Promise((resolve, reject) => {
            try {
                setPlaylist((prevPlaylist) => {
                    if (prevPlaylist.some(s => s.id === song.id)) {
                        window.showToast(`${song.name}은(는) 이미 재생목록에 있습니다.`, 'warning');
                        reject(new Error('Song already in playlist'));
                        return prevPlaylist;
                    }
                    
                    const newPlaylist = [...prevPlaylist, song];
                    
                    // 재생목록에 곡이 없었다면 바로 재생
                    if (prevPlaylist.length === 0 && !currentSong) {
                        playSong(song);
                    }
                    
                    resolve();
                    return newPlaylist;
                });
                
                window.showToast(`${song.name}이(가) 현재 재생목록에 추가되었습니다.`, 'success');
            } catch (error) {
                reject(error);
            }
        });
    }, [currentSong, playSong]);

    const removeSongFromPlaylist = useCallback((songId) => {
        setPlaylist((prevPlaylist) => {
            const updatedPlaylist = prevPlaylist.filter(song => song.id !== songId);
            
            // 삭제된 곡이 현재 재생 중인 곡인 경우
            if (currentSong?.id === songId) {
                if (updatedPlaylist.length > 0) {
                    // 다음 곡이 있으면 다음 곡 재생
                    const currentIndex = prevPlaylist.findIndex(song => song.id === songId);
                    const nextSongIndex = currentIndex < updatedPlaylist.length ? currentIndex : 0;
                    playSong(updatedPlaylist[nextSongIndex]);
                } else {
                    // 재생목록이 비어있으면 정지
                    audioRef.current.pause();
                    setCurrentSong(null);
                    setIsPlaying(false);
                    if (currentBlobUrl) {
                        cleanupBlobUrl(currentBlobUrl);
                        setCurrentBlobUrl(null);
                    }
                }
            }
            
            window.showToast('재생목록에서 곡이 삭제되었습니다.', 'success');
            return updatedPlaylist;
        });
    }, [currentSong, playSong, currentBlobUrl, cleanupBlobUrl]);

    // 플레이리스트의 모든 곡을 현재 재생목록으로 로드
    const loadPlaylistSongs = useCallback(async (songs) => {
        try {
            // 현재 재생목록 초기화
            setPlaylist([]);
            
            // 새로운 곡들을 하나씩 추가
            for (const song of songs) {
                await addSongToPlaylist(song);
            }
            
            window.showToast(`${songs.length}곡이 재생목록에 로드되었습니다.`, 'success');
        } catch (error) {
            console.error('플레이리스트 로드 실패:', error);
            window.showToast('플레이리스트 로드에 실패했습니다.', 'error');
        }
    }, [addSongToPlaylist]);

    // 재생목록 전체 교체 (플레이리스트 재생 시 사용)
    const replacePlaylist = useCallback(async (songs) => {
        try {
            // 현재 재생 정지 및 정리
            audioRef.current.pause();
            setIsPlaying(false);
            if (currentBlobUrl) {
                cleanupBlobUrl(currentBlobUrl);
                setCurrentBlobUrl(null);
            }
            
            // 재생목록 교체
            setPlaylist(songs);
            
            // 첫 번째 곡부터 재생
            if (songs.length > 0) {
                await playSong(songs[0]);
            } else {
                setCurrentSong(null);
            }
            
            return true;
        } catch (error) {
            console.error('재생목록 교체 실패:', error);
            window.showToast('재생목록 교체에 실패했습니다.', 'error');
            return false;
        }
    }, [currentBlobUrl, cleanupBlobUrl, playSong]);

    // 현재 재생목록 초기화
    const clearPlaylist = useCallback(() => {
        audioRef.current.pause();
        setIsPlaying(false);
        setPlaylist([]);
        setCurrentSong(null);
        
        if (currentBlobUrl) {
            cleanupBlobUrl(currentBlobUrl);
            setCurrentBlobUrl(null);
        }
        
        window.showToast('재생목록이 초기화되었습니다.', 'info');
    }, [currentBlobUrl, cleanupBlobUrl]);

    // 오디오 이벤트 리스너 설정
    useEffect(() => {
        const audio = audioRef.current;
        
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleError = (e) => {
            console.error('Audio error:', e);
            setIsPlaying(false);
            window.showToast('오디오 재생 중 오류가 발생했습니다.', 'error');
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    const value = useMemo(() => ({
        currentSong,
        isPlaying,
        playlist,
        playSong,
        pauseSong: () => audioRef.current.pause(),
        togglePlayPause,
        nextSong,
        prevSong,
        addSongToPlaylist,
        removeSongFromPlaylist,
        loadPlaylistSongs,
        replacePlaylist,
        clearPlaylist,
        audioRef,
        repeatMode,
        setRepeatMode,
    }), [
        currentSong,
        isPlaying,
        playlist,
        playSong,
        togglePlayPause,
        nextSong,
        prevSong,
        addSongToPlaylist,
        removeSongFromPlaylist,
        loadPlaylistSongs,
        replacePlaylist,
        clearPlaylist,
        repeatMode,
    ]);

    return (
        <MusicPlayerContext.Provider value={value}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export { MusicPlayerProvider };