import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import MOCK_DATA from './MOCK_DATA';
import { usePlayer } from '../PlayerContext';

const SPOTIFY_GREEN = '#1DB954';

// Gather all songs from all playlists
const allSongs = Object.values(MOCK_DATA.playlists).flat();

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const { playTrack } = usePlayer();

  const filteredSongs = allSongs.filter(song =>
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase())
  );

  const handleSongPress = (song) => {
    playTrack(song);
    navigation.navigate('Player');
  };

  const renderSong = ({ item }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => handleSongPress(item)}>
      <Image source={{ uri: item.artwork }} style={styles.artwork} />
      <View>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
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
          placeholderTextColor="#b3b3b3"
          value={query}
          onChangeText={setQuery}
        />
        <FlatList
          data={filteredSongs}
          renderItem={renderSong}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No results found.</Text>}
          contentContainerStyle={[
            styles.listContent,
            filteredSongs.length === 0 ? { flex: 1, justifyContent: 'center' } : null,
          ]}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40, // Increased for more space from top
  },
  header: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 18,
    marginTop: 16, // Increased for more space from top
  },
  input: {
    backgroundColor: '#181818',
    color: 'white',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: SPOTIFY_GREEN,
    marginTop: 2,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#181818',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  artwork: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 18,
    backgroundColor: '#222',
  },
  songTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 15,
    marginTop: 2,
  },
  emptyText: {
    color: '#b3b3b3',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 120, // Enough for MiniPlayer + tab bar
  },
});

export default SearchScreen; 