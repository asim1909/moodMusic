import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, Heart, Play, Pause, SkipBack, SkipForward } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayer } from '../PlayerContext';
import MOCK_DATA from './MOCK_DATA';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const allSongs = Object.values(MOCK_DATA.playlists).flat();

const PlayerScreen = ({ navigation }) => {
  const { currentTrack, isPlaying, togglePlayback, nextTrack, prevTrack } = usePlayer();
  const [isFavorite, setIsFavorite] = useState(false);
  const [translateX] = useState(new Animated.Value(0));
  const [progress, setProgress] = useState(0); // 0 to 1
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const [artworkUrl, setArtworkUrl] = useState(null);
  const [loadingArtwork, setLoadingArtwork] = useState(false);
  const artworkCache = React.useRef({});

  // Simulate track duration (e.g., 30s)
  const DURATION = 30;

  // Helper to format seconds as mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const checkIsFavorite = async () => {
    const favorites = JSON.parse(await AsyncStorage.getItem('favorites')) || [];
    setIsFavorite(favorites.some(fav => fav.id === currentTrack.id));
  };

  const toggleFavorite = async () => {
    let favorites = JSON.parse(await AsyncStorage.getItem('favorites')) || [];
    if (isFavorite) {
      favorites = favorites.filter(fav => fav.id !== currentTrack.id);
    } else {
      favorites.push(currentTrack);
    }
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    setProgress(0);
    progressAnim.setValue(0);
  }, [currentTrack]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 1) {
            progressAnim.setValue(prev + 1 / DURATION);
            return prev + 1 / DURATION;
          } else {
            clearInterval(interval);
            return 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (currentTrack) {
      checkIsFavorite();
    }
  }, [currentTrack]);

  // Fetch artwork from iTunes API
  useEffect(() => {
    if (!currentTrack) return;
    const key = `${currentTrack.title}|${currentTrack.artist}`;
    if (artworkCache.current[key]) {
      setArtworkUrl(artworkCache.current[key]);
      setLoadingArtwork(false);
      return;
    }
    setLoadingArtwork(true);
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(currentTrack.title + ' ' + currentTrack.artist)}&entity=song&limit=1`)
      .then(res => res.json())
      .then(data => {
        const found = data.results && data.results[0] && data.results[0].artworkUrl100;
        if (found) {
          // Use higher-res version
          const url = found.replace('100x100bb', '500x500bb');
          artworkCache.current[key] = url;
          setArtworkUrl(url);
        } else {
          setArtworkUrl(null);
        }
      })
      .catch(() => setArtworkUrl(null))
      .finally(() => setLoadingArtwork(false));
  }, [currentTrack]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -60) {
        // Swipe left: next track
        nextTrack(allSongs);
      } else if (translationX > 60) {
        // Swipe right: previous track
        prevTrack(allSongs);
      }
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <LinearGradient colors={['#4c1d95', '#1e1b4b']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronDown color="white" size={30} />
          </TouchableOpacity>
          <Text style={styles.nowPlaying}>Now Playing</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Artwork with swipe gesture */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={[styles.artworkContainer, { transform: [{ translateX }] }]}> 
            {loadingArtwork ? (
              <View style={[styles.artwork, { justifyContent: 'center', alignItems: 'center' }]}> 
                <ActivityIndicator size="large" color="#1DB954" />
              </View>
            ) : (
              <Image
                source={artworkUrl ? { uri: artworkUrl } : { uri: currentTrack.artwork }}
                style={styles.artwork}
              />
            )}
          </Animated.View>
        </PanGestureHandler>

        {/* Song Info & Controls */}
        <View>
          <View style={styles.songInfoRow}>
            <View>
              <Text style={styles.songTitle}>{currentTrack.title}</Text>
              <Text style={styles.songArtist}>{currentTrack.artist}</Text>
            </View>
            <TouchableOpacity onPress={toggleFavorite}>
              <Heart color={isFavorite ? '#10b981' : 'white'} size={28} fill={isFavorite ? '#10b981' : 'none'} />
            </TouchableOpacity>
          </View>

          {/* Scrubber */}
          <View style={styles.scrubberBg}>
            <Animated.View style={[styles.scrubberFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
          {/* Timing */}
          <View style={styles.timingRow}>
            <Text style={styles.timingText}>{formatTime(progress * DURATION)}</Text>
            <Text style={styles.timingText}>{formatTime(DURATION)}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={() => prevTrack(allSongs)}>
              <SkipBack color="white" size={40} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              {isPlaying ? <Pause color="black" size={40} fill="black" /> : <Play color="black" size={40} fill="black" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => nextTrack(allSongs)}>
              <SkipForward color="white" size={40} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const SPOTIFY_GREEN = '#1DB954';

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    backgroundColor: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 40, // Increased for more space from top
  },
  nowPlaying: {
    color: '#b3b3b3',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 32,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  artwork: {
    width: 320,
    height: 320,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: '#181818',
  },
  songInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  songTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 18,
    marginTop: 2,
  },
  scrubberBg: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  scrubberFill: {
    height: 8,
    backgroundColor: SPOTIFY_GREEN,
    borderRadius: 8,
    width: '50%',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
  },
  playButton: {
    backgroundColor: SPOTIFY_GREEN,
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  timingText: {
    color: '#b3b3b3',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});

export default PlayerScreen;