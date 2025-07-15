import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };

  // New: next/prev track logic
  const nextTrack = (trackList) => {
    if (!currentTrack || !trackList?.length) return;
    const idx = trackList.findIndex(t => t.id === currentTrack.id);
    if (idx !== -1 && idx < trackList.length - 1) {
      setCurrentTrack(trackList[idx + 1]);
      setIsPlaying(true);
    }
  };

  const prevTrack = (trackList) => {
    if (!currentTrack || !trackList?.length) return;
    const idx = trackList.findIndex(t => t.id === currentTrack.id);
    if (idx > 0) {
      setCurrentTrack(trackList[idx - 1]);
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
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);