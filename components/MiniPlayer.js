import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlayer } from '../PlayerContext';
import { Play, Pause, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import MOCK_DATA from '../screens/MOCK_DATA';

// Remove allSongs; use currentPlaylist from context

const MiniPlayer = () => {
  const navigation = useNavigation();
  const { currentTrack, isPlaying, togglePlayback, nextTrack, prevTrack, currentPlaylist, playTrack } = usePlayer();
  const [isFavorite, setIsFavorite] = useState(false);
  const [translateX] = useState(new Animated.Value(0));

  useEffect(() => {
    const checkIsFavorite = async () => {
      const favorites = JSON.parse(await AsyncStorage.getItem('favorites')) || [];
      setIsFavorite(favorites.some(fav => fav.id === currentTrack?.id));
    };
    if (currentTrack) checkIsFavorite();
  }, [currentTrack]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    let favorites = JSON.parse(await AsyncStorage.getItem('favorites')) || [];
    if (isFavorite) {
      favorites = favorites.filter(fav => fav.id !== currentTrack.id);
    } else {
      favorites.push(currentTrack);
    }
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -60) {
        // Swipe left: play a random next track
        if (currentPlaylist && currentPlaylist.length > 1) {
          let randomIndex = Math.floor(Math.random() * currentPlaylist.length);
          // Avoid playing the same song
          if (currentPlaylist[randomIndex].id === currentTrack.id) {
            randomIndex = (randomIndex + 1) % currentPlaylist.length;
          }
          const randomTrack = currentPlaylist[randomIndex];
          // Use playTrack to set the new track and playlist
          playTrack(randomTrack, currentPlaylist);
        }
      } else if (translationX > 60) {
        // Swipe right: previous track
        prevTrack(currentPlaylist);
      }
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  if (!currentTrack) return null;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[styles.container, { transform: [{ translateX }] }]}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Player', { playlist: currentPlaylist })}
          style={styles.innerContainer}
          activeOpacity={0.95}
        >
          <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
              <Heart color={isFavorite ? SPOTIFY_GREEN : 'white'} size={24} fill={isFavorite ? SPOTIFY_GREEN : 'none'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.playButton]} 
              onPress={(e) => { e.stopPropagation(); togglePlayback(); }}
            >
              {isPlaying ? <Pause color="white" size={28} fill="white" /> : <Play color="white" size={28} fill="white" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const SPOTIFY_GREEN = '#1DB954';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 64,
    left: 12,
    right: 12,
    height: 72,
    backgroundColor: 'rgba(24, 24, 24, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  playButton: {
    backgroundColor: SPOTIFY_GREEN,
    padding: 10,
    shadowColor: SPOTIFY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default MiniPlayer;