import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlayer } from '../PlayerContext';
import { Play, Pause, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const { currentTrack, isPlaying, togglePlayback } = usePlayer();
  const [isFavorite, setIsFavorite] = useState(false);

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

  if (!currentTrack) return null;

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Player')}
      style={styles.container}
      activeOpacity={0.95}
    >
      <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{currentTrack.title}</Text>
        <Text style={styles.artist}>{currentTrack.artist}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
          <Heart color={isFavorite ? '#10b981' : 'white'} size={24} fill={isFavorite ? '#10b981' : 'none'} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.playButton]} onPress={(e) => { e.stopPropagation(); togglePlayback(); }}>
          {isPlaying ? <Pause color="white" size={28} fill="white" /> : <Play color="white" size={28} fill="white" />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const SPOTIFY_GREEN = '#1DB954';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 8,
    right: 8,
    height: 68,
    backgroundColor: '#181818',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 14,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  playButton: {
    marginLeft: 8,
    backgroundColor: SPOTIFY_GREEN,
    borderRadius: 999,
    padding: 8,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default MiniPlayer;