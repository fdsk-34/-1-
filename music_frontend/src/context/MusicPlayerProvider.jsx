
import React, { useRef, useState } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';
import noSongImage from '../assets/default-cover.jpg';

export const MusicPlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const audioRef = useRef(new Audio());

  const playSong = (index) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentIndex(index);
      updateAudioSrc(playlist[index].audioUrl);
      console.log('playSong:', { index, song: playlist[index] });
    } else {
      console.warn('Invalid index or empty playlist:', { index, playlistLength: playlist.length });
    }
  };

  const updateAudioSrc = (src) => {
    if (audioRef.current && src) {
      audioRef.current.src = src;
      audioRef.current.load();
      console.log('updateAudioSrc:', src);
    } else {
      console.warn('Invalid audio source or audioRef:', { src, audioRef: !!audioRef.current });
    }
  };

  const initializeTestSong = () => {
    const testSong = {
      id: 'song1',
      title: 'Test Song',
      artist: 'Test Artist',
      duration: 180,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      coverUrl: noSongImage,
    };
    setPlaylist([testSong]);
    setCurrentIndex(0);
    updateAudioSrc(testSong.audioUrl);
    console.log('Test song initialized:', testSong);
  };

  const addSongToPlaylist = (playlistId, song, userPlaylists, setUserPlaylists, sharedPlaylists, setSharedPlaylists, user, isShared = false) => {
    // 더미 사용자 환경 처리
    const userId = user?.id || 'test-user'; // 더미 user.id 설정
    console.log('addSongToPlaylist called:', { playlistId, song, userId, isShared });

    const songData = {
      id: song.id || crypto.randomUUID(),
      title: song.title || 'Unknown Title',
      artist: song.artist || 'Unknown Artist',
      duration: song.duration || 0,
      audioUrl: song.audioUrl || '',
      coverUrl: song.coverUrl || noSongImage,
    };

    const playlist = isShared
      ? sharedPlaylists.find(p => p.id === playlistId)
      : userPlaylists.find(p => p.id === playlistId);
    if (!playlist) {
      console.warn('Playlist not found:', playlistId);
      return { success: false, message: '플레이리스트를 찾을 수 없습니다.' };
    }
    if (playlist.songs.some(s => s.id === songData.id)) {
      console.warn('Song already exists in playlist:', songData.id);
      return { success: false, message: '이미 플레이리스트에 있는 곡입니다.' };
    }

    const updatedPlaylists = isShared
      ? sharedPlaylists.map(p =>
          p.id === playlistId ? { ...p, songs: [...p.songs, songData] } : p
        )
      : userPlaylists.map(p =>
          p.id === playlistId ? { ...p, songs: [...p.songs, songData] } : p
        );

    const LOCAL_STORAGE_KEY = isShared
      ? `myMusicApp_sharedPlaylists_${userId}`
      : `myMusicApp_userPlaylists_${userId}`;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlaylists));
      console.log('Saved to localStorage:', updatedPlaylists);
    } catch (error) {
      console.error(`Error writing to localStorage (${LOCAL_STORAGE_KEY}):`, error);
      return { success: false, message: '로컬 저장소 저장 실패' };
    }

    if (isShared) {
      setSharedPlaylists(updatedPlaylists);
    } else {
      setUserPlaylists(updatedPlaylists);
    }

    if (currentPlaylistId === playlistId) {
      setPlaylist(updatedPlaylists.find(p => p.id === playlistId).songs);
      console.log('Updated current playlist:', playlistId);
    }

    return { success: true, message: `'${songData.title}'이 플레이리스트에 추가되었습니다.` };
  };

  const loadPlaylist = (playlistId, songs) => {
    setCurrentPlaylistId(playlistId);
    setPlaylist(songs);
    playSong(0);
    console.log('Loaded playlist:', { playlistId, songs });
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        currentIndex,
        playSong,
        audioRef,
        updateAudioSrc,
        currentPlaylistId,
        setCurrentPlaylistId,
        loadPlaylist,
        addSongToPlaylist,
        initializeTestSong,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

