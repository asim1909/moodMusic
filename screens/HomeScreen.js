import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MOODS = [
  { id: 'happy', title: 'Happy', emoji: '😄', color: ['#ff6b6b', '#ff9f43'] }, 
  { id: 'sad', title: 'Sad', emoji: '😢', color: ['#4b6584', '#a4b0be'] }, 
  { id: 'energetic', title: 'Energetic', emoji: '⚡', color: ['#ffcc00', '#ff3f34'] }, 
  { id: 'relaxed', title: 'Relaxed', emoji: '😌', color: ['#1dd1a1', '#0a3d62'] }, 
  { id: 'romantic', title: 'Romantic', emoji: '💖', color: ['#ff5e78', '#d81b60'] }, 
  { id: 'focused', title: 'Focused', emoji: '🎯', color: ['#4834d4', '#706fd3'] }, 
  { id: 'chill', title: 'Chill', emoji: '🌙', color: ['#54a0ff', '#2e86de'] }, 
  { id: 'adventurous', title: 'Adventurous', emoji: '🌍', color: ['#ff9f1c', '#feca57'] }, 
];

const MoodCard = ({ mood, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.moodCard}
      onPress={() => onPress(mood.title)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.moodCardInner, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient colors={mood.color} style={styles.moodGradient}>
          <Text style={styles.moodTitle}>{mood.title}</Text>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const handleMoodSelect = (moodTitle) => {
    navigation.navigate('Playlist', { mood: moodTitle });
  };

  return (
    <LinearGradient colors={['#191414', '#121212']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header1}>How are you</Text>
          <Text style={styles.header2}>feeling today?</Text>
          <FlatList
            data={MOODS}
            renderItem={({ item }) => <MoodCard mood={item} onPress={handleMoodSelect} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
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
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },
  header1: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
    marginTop: 16,
  },
  header2: {
    color: SPOTIFY_GREEN,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 32,
  },
  moodCard: {
    width: '100%',
    height: 80,
    marginBottom: 12, // Consistent gap between cards
  },
  moodCardInner: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  moodGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  moodTitle: {
    color:
    '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  moodEmoji: {
    fontSize: 32,
  },
  listContent: {
    paddingBottom: 54, 
  },
});

export default HomeScreen;