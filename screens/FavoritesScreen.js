import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayer } from '../PlayerContext';

const SPOTIFY_GREEN = '#1DB954';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const { playTrack } = usePlayer();

  const loadFavorites = async () => {
    const favs = JSON.parse(await AsyncStorage.getItem('favorites')) || [];
    setFavorites(favs);
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const handleSongPress = (song) => {
    playTrack(song, favorites);
    navigation.navigate('Player', { playlist: favorites });
  };

  // Marquee component for long song titles and artist names
  const MarqueeText = ({ children, style, containerWidth = 180, speed = 50 }) => {
    const textRef = useRef();
    const [textWidth, setTextWidth] = useState(0);
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (textWidth > containerWidth) {
        const distance = textWidth - containerWidth + 24;
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: -distance, duration: (distance / speed) * 1000, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.delay(1000),
          ])
        ).start();
      } else {
        anim.setValue(0);
      }
    }, [textWidth, containerWidth, children]);

    return (
      <View style={{ width: containerWidth, overflow: 'hidden', flexDirection: 'row' }}>
        <Animated.Text
          ref={textRef}
          onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
          style={[style, { transform: [{ translateX: anim }] }]}
          numberOfLines={1}
        >
          {children}
        </Animated.Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Your Favorites</Text>
        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.songItem} onPress={() => handleSongPress(item)}>
                <Image source={{ uri: item.artwork }} style={styles.artwork} />
                <View>
                  <MarqueeText style={styles.songTitle} containerWidth={200}>{item.title}</MarqueeText>
                  <MarqueeText style={styles.songArtist} containerWidth={200}>{item.artist}</MarqueeText>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.emptyText}>You haven't favorited any songs yet.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black', // Matches provided style
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 0,
  },
  header: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#222', // Matches provided style
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 16,
  },
  songTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  songArtist: {
    color: '#a3a3a3',
    fontSize: 14,
  },
  emptyText: {
    color: '#a3a3a3',
    textAlign: 'center',
    marginTop: 40,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 54, // Matches provided style
  },
});

export default FavoritesScreen;