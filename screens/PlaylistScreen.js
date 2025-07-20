import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { fetchSpotifyTracksByMood } from '../spotifyApi';
import { usePlayer } from '../PlayerContext';
import { useTheme } from '../ThemeContext';

const SPOTIFY_GREEN = '#1DB954';

export default function PlaylistScreen({ route, navigation }) {
  const { mood } = route.params;
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();
  const { theme } = useTheme();

  useEffect(() => {
    async function getTracks() {
      setLoading(true);
      try {
        const data = await fetchSpotifyTracksByMood(mood);
        setTracks(data);
      } catch (e) {
        setTracks([]);
      }
      setLoading(false);
    }
    getTracks();
  }, [mood]);

  const handleSongPress = (item) => {
    // Convert Spotify API track to the format expected by PlayerContext/PlayerScreen
    const formattedTrack = {
      id: item.id,
      title: item.name,
      artist: item.artists.map(a => a.name).join(', '),
      artwork: item.album.images[0]?.url,
      duration_ms: item.duration_ms,
    };
    const formattedTracks = tracks.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      artwork: t.album.images[0]?.url,
      duration_ms: t.duration_ms,
    }));
    playTrack(formattedTrack, formattedTracks);
    navigation.navigate('Player', { playlist: formattedTracks, section: mood });
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

  const renderSong = ({ item }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => handleSongPress(item)}>
      <Image source={{ uri: item.album.images[0]?.url }} style={styles.artwork} />
      <View>
        <MarqueeText style={styles.songTitle} containerWidth={200}>{item.name}</MarqueeText>
        <MarqueeText style={styles.songArtist} containerWidth={200}>{item.artists.map(a => a.name).join(', ')}</MarqueeText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.header, { color: theme.text }]}>{mood} Songs</Text>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={tracks}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.songItem, { backgroundColor: theme.card }]} onPress={() => handleSongPress(item)}>
                <Image source={{ uri: item.album?.images[0]?.url || item.artwork }} style={styles.artwork} />
                <View>
                  <Text style={[styles.songTitle, { color: theme.text }]}>{item.name || item.title}</Text>
                  <Text style={[styles.songArtist, { color: theme.secondaryText }]}>{item.artists ? item.artists.map(a => a.name).join(', ') : item.artist}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.secondaryText }]}>No songs found.</Text>}
            contentContainerStyle={[
              styles.listContent,
              tracks.length === 0 ? { flex: 1, justifyContent: 'center' } : null,
            ]}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

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
    textAlign: 'left',
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
    paddingBottom: 54, 
  },
});