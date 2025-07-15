import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);

  // Accepts: playTrack(track, playlist)
  const playTrack = (track, playlist) => {
    setCurrentTrack(track);
    if (playlist && Array.isArray(playlist)) {
      setCurrentPlaylist(playlist);
    }
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };

  // New: next/prev track logic
  const nextTrack = (trackList) => {
    const list = trackList && trackList.length ? trackList : currentPlaylist;
    if (!currentTrack || !list?.length) return;
    const idx = list.findIndex(t => t.id === currentTrack.id);
    if (idx !== -1 && idx < list.length - 1) {
      setCurrentTrack(list[idx + 1]);
      setIsPlaying(true);
    }
  };

  const prevTrack = (trackList) => {
    const list = trackList && trackList.length ? trackList : currentPlaylist;
    if (!currentTrack || !list?.length) return;
    const idx = list.findIndex(t => t.id === currentTrack.id);
    if (idx > 0) {
      setCurrentTrack(list[idx - 1]);
      setIsPlaying(true);
    }
  };

  const value = {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayback,
    nextTrack,
    prevTrack,
    currentPlaylist,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);