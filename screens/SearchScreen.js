import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Animated } from 'react-native';
import MOCK_DATA from './MOCK_DATA';
import { usePlayer } from '../PlayerContext';
import { fetchSpotifyTracksByMood, fetchSpotifyNewReleases } from '../spotifyApi';

const SPOTIFY_GREEN = '#1DB954';

// Gather all songs from all playlists
const allSongs = Object.values(MOCK_DATA.playlists).flat();

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playTrack } = usePlayer();

  // Fetch new releases on mount
  React.useEffect(() => {
    let cancelled = false;
    const fetchReleases = async () => {
      setLoading(true);
      try {
        const tracks = await fetchSpotifyNewReleases();
        const formatted = tracks.map(item => ({
          id: item.id,
          title: item.name,
          artist: item.artists.map(a => a.name).join(', '),
          artwork: item.images && item.images[0]?.url ? item.images[0].url : (item.album?.images[0]?.url || ''),
          duration_ms: item.duration_ms,
        }));
        if (!cancelled) setNewReleases(formatted);
      } catch (e) {
        if (!cancelled) setNewReleases([]);
      }
      if (!cancelled) setLoading(false);
    };
    fetchReleases();
    return () => { cancelled = true; };
  }, []);

  // Search Spotify API only when query changes
  React.useEffect(() => {
    let cancelled = false;
    const search = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const tracks = await fetchSpotifyTracksByMood(query);
        // Format API tracks
        const apiResults = tracks.map(item => ({
          id: item.id,
          title: item.name,
          artist: item.artists.map(a => a.name).join(', '),
          artwork: item.album.images[0]?.url,
          duration_ms: item.duration_ms,
        }));
        if (!cancelled) setResults(apiResults);
      } catch (e) {
        if (!cancelled) setResults([]);
      }
      if (!cancelled) setLoading(false);
    };
    search();
    return () => { cancelled = true; };
  }, [query]);

  const handleSongPress = (song, playlist) => {
    playTrack(song, playlist);
    navigation.navigate('Player', { playlist });
  };

  // Marquee component for long song titles
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <TouchableOpacity style={styles.songItem} onPress={() => handleSongPress(item, results)}>
      <Image source={{ uri: item.artwork }} style={styles.artwork} />
      <View>
        <MarqueeText style={styles.songTitle} containerWidth={200}>{item.title}</MarqueeText>
        <MarqueeText style={styles.songArtist} containerWidth={200}>{item.artist}</MarqueeText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Search</Text>
        <TextInput
          style={styles.input}
          placeholder="What do you want to listen to?"
          placeholderTextColor="#a3a3a3"
          value={query}
          onChangeText={setQuery}
        />
        {loading ? (
          <ActivityIndicator color={SPOTIFY_GREEN} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={query ? results : newReleases}
            renderItem={renderSong}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>{query ? 'No results found.' : 'No music to show.'}</Text>}
            contentContainerStyle={[
              styles.listContent,
              (query ? results : newReleases).length === 0 ? { flex: 1, justifyContent: 'center' } : null,
            ]}
            keyboardShouldPersistTaps="handled"
          />
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
  input: {
    backgroundColor: '#222', // Matches songItem background for consistency
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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

export default SearchScreen;