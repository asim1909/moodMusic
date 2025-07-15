import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { usePlayer } from '../PlayerContext';
import MOCK_DATA from './MOCK_DATA';

const SongItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.songItem} onPress={() => onPress(item)}>
    <Image source={{ uri: item.artwork }} style={styles.artwork} />
    <View>
      <Text style={styles.songTitle}>{item.title}</Text>
      <Text style={styles.songArtist}>{item.artist}</Text>
    </View>
  </TouchableOpacity>
);

const PlaylistScreen = ({ route, navigation }) => {
  const { mood } = route.params;
  const { playTrack } = usePlayer();
  const playlist = MOCK_DATA.playlists[mood.id] || [];

  const handleSongPress = (song) => {
    playTrack(song);
    navigation.navigate('Player');
  };

  return (
    <LinearGradient colors={mood.color} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="white" size={30} />
          </TouchableOpacity>
          <Text style={styles.headerText}>{mood.title} Playlist</Text>
        </View>
        <FlatList
          data={playlist}
          renderItem={({ item }) => <SongItem item={item} onPress={handleSongPress} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
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
    backgroundColor: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40, // Increased for more space from top
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: '#222',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 120, // For MiniPlayer/tab bar
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
});

export default PlaylistScreen;