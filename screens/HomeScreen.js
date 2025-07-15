import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MOCK_DATA from './MOCK_DATA';

const MoodCard = ({ mood, onPress }) => (
  <TouchableOpacity
    style={styles.moodCard}
    onPress={() => onPress(mood)}
  >
    <LinearGradient colors={mood.color} style={styles.moodGradient}>
      <Text style={styles.moodTitle}>{mood.title}</Text>
      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const handleMoodSelect = (mood) => {
    navigation.navigate('Playlist', { mood });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header1}>How are you</Text>
        <Text style={styles.header2}>feeling today?</Text>
        <FlatList
          data={MOCK_DATA.moods}
          renderItem={({ item }) => <MoodCard mood={item} onPress={handleMoodSelect} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const SPOTIFY_GREEN = '#1DB954';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40, // Increased for more space from top
    paddingBottom: 0,
  },
  header1: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 0,
    letterSpacing: 0.5,
    marginTop: 16, // Increased for more space from top
  },
  header2: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  moodCard: {
    width: '100%',
    height: 100,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#181818',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  moodGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 18,
  },
  moodTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  moodEmoji: {
    fontSize: 40,
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 120, // For MiniPlayer/tab bar
  },
});

export default HomeScreen;