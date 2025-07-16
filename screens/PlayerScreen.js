import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, StyleSheet, Animated, ActivityIndicator, Share, ScrollView, Pressable, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayer } from '../PlayerContext';
import MOCK_DATA from './MOCK_DATA';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRoute } from '@react-navigation/native';

const allSongs = Object.values(MOCK_DATA.playlists).flat();
const SPOTIFY_GREEN = '#1DB954';

const PlayerScreen = ({ navigation }) => {
  const { currentTrack, isPlaying, togglePlayback, nextTrack, prevTrack, playTrack } = usePlayer();
  const [isFavorite, setIsFavorite] = useState(false);
  const [translateX] = useState(new Animated.Value(0));
  const [progress, setProgress] = useState(0); // 0 to 1
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const [artworkUrl, setArtworkUrl] = useState(null);
  const [loadingArtwork, setLoadingArtwork] = useState(false);
  const [artistInfo, setArtistInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const artworkCache = React.useRef({});
  const route = useRoute();
  const playlist = route.params?.playlist || allSongs;
  const section = route.params?.section;

  // Use real track duration if available, otherwise fallback to 30s
  const DURATION = currentTrack?.duration_ms ? currentTrack.duration_ms / 1000 : 30;

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

  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Tap-to-seek handler (for Pressable)
  const handleSeek = (evt) => {
    if (progressBarWidth > 0) {
      const { locationX } = evt.nativeEvent;
      const newProgress = Math.max(0, Math.min(1, locationX / progressBarWidth));
      setProgress(newProgress);
    }
  };

  // Timer for auto-progress
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 1) {
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

  // When progress reaches end, go to next track
  useEffect(() => {
    if (progress >= 1 && isPlaying) {
      setProgress(0);
      nextTrack(playlist);
    }
  }, [progress, isPlaying, nextTrack, playlist]);

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

  // Fetch artist info (mocked for now, can be replaced with real API call)
  useEffect(() => {
    if (!currentTrack) return;
    // Mock artist info; replace with actual API call if available
    setArtistInfo({
      name: currentTrack.artist,
      bio: `This is a brief bio about ${currentTrack.artist}. They are known for their unique style and have been creating music for over a decade.`,
      image: currentTrack.artwork, // Fallback to track artwork
    });

    // Fetch recommendations (mocked by selecting random tracks from playlist)
    const shuffled = [...playlist].sort(() => Math.random() - 0.5).filter(track => track.id !== currentTrack.id).slice(0, 5);
    setRecommendations(shuffled);
  }, [currentTrack, playlist]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -60) {
        nextTrack(playlist);
      } else if (translationX > 60) {
        prevTrack(playlist);
      }
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleShuffle = () => {
    if (playlist && playlist.length > 1) {
      let randomIndex = Math.floor(Math.random() * playlist.length);
      // Avoid playing the same song
      if (playlist[randomIndex].id === currentTrack.id) {
        randomIndex = (randomIndex + 1) % playlist.length;
      }
      const randomTrack = playlist[randomIndex];
      playTrack(randomTrack, playlist);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this song: ${currentTrack.title} by ${currentTrack.artist}`,
      });
    } catch (error) {
      // Handle error
    }
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

  if (!currentTrack) {
    return null;
  }

  return (
    <LinearGradient colors={['#191414', '#121212']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronDown color="white" size={30} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.nowPlaying}>Now Playing</Text>
              {section && (
                <Text style={styles.sectionText}>from {section}</Text>
              )}
            </View>
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

          {/* Song Info & Heart */}
          <View style={styles.songInfoBlock}>
            <MarqueeText style={styles.songTitle} containerWidth={300}>{currentTrack.title}</MarqueeText>
            <View style={styles.songMetaRow}>
              <MarqueeText style={styles.songArtist} containerWidth={260}>{currentTrack.artist}</MarqueeText>
              <TouchableOpacity onPress={toggleFavorite} style={styles.heartButton}>
                <Heart color={isFavorite ? '#1DB954' : 'white'} size={26} fill={isFavorite ? '#1DB954' : 'none'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBlock}>
            <View style={styles.progressRow}>
              <Text style={styles.timingText}>{formatTime(progress * DURATION)}</Text>
              <Text style={styles.timingText}>{formatTime(DURATION)}</Text>
            </View>
            <Pressable
              style={styles.scrubberBg}
              onPress={handleSeek}
              onLayout={e => setProgressBarWidth(e.nativeEvent.layout.width)}
            >
              <View style={{ width: '100%', height: 8, justifyContent: 'center' }}>
                <View
                  style={[
                    styles.scrubberFill,
                    {
                      width: progress * progressBarWidth,
                    },
                  ]}
                />
              </View>
            </Pressable>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={handleShuffle} style={styles.sideButton}>
              <Shuffle color="#b3b3b3" size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => prevTrack(playlist)}>
              <SkipBack color="white" size={38} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              {isPlaying ? <Pause color="black" size={32} fill="black" /> : <Play color="black" size={32} fill="black" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => nextTrack(playlist)}>
              <SkipForward color="white" size={38} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.sideButton}>
              <Share2 color="#b3b3b3" size={28} />
            </TouchableOpacity>
          </View>

          {/* Artist Info */}
          {artistInfo && (
            <View style={styles.artistInfoBlock}>
              <Text style={styles.sectionTitle}>About the Artist</Text>
              <View style={styles.artistInfoRow}>
                <Image
                  source={{ uri: artistInfo.image }}
                  style={styles.artistImage}
                />
                <View style={styles.artistTextContainer}>
                  <MarqueeText style={styles.artistName} containerWidth={220}>{artistInfo.name}</MarqueeText>
                  <Text style={styles.artistBio} numberOfLines={4}>{artistInfo.bio}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.recommendationsBlock}>
              <Text style={styles.sectionTitle}>Recommended Tracks</Text>
              {recommendations.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.recommendationItem}
                  onPress={() => navigation.navigate('Player', { playlist, section, track })}
                >
                  <Image
                    source={{ uri: track.artwork }}
                    style={styles.recommendationImage}
                  />
                  <View style={styles.recommendationText}>
                    <MarqueeText style={styles.recommendationTitle} containerWidth={200}>{track.title}</MarqueeText>
                    <MarqueeText style={styles.recommendationArtist} containerWidth={200}>{track.artist}</MarqueeText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 48,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    height: 48,
  },
  nowPlaying: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  sectionText: {
    color: SPOTIFY_GREEN,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 30,
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  artwork: {
    width: 320,
    height: 320,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  songInfoBlock: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  songTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: '90%',
  },
  songMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 260,
  },
  heartButton: {
    padding: 8,
  },
  progressBlock: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timingText: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  scrubberBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#444', // light gray for visibility
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  scrubberFill: {
    height: 8,
    backgroundColor: '#1DB954', // Spotify green
    borderRadius: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  playButton: {
    backgroundColor: SPOTIFY_GREEN,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SPOTIFY_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  artistInfoBlock: {
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  artistInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 8, // Changed to rectangular with rounded corners
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  artistTextContainer: {
    flex: 1,
  },
  artistName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  artistBio: {
    color: '#b3b3b3',
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsBlock: {
    marginVertical: 24,
    paddingHorizontal: 0,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#222', // Matches provided style
  },
  recommendationImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 16,
  },
  recommendationText: {
    flex: 1,
    justifyContent: 'center',
  },
  recommendationTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  recommendationArtist: {
    color: '#a3a3a3',
    fontSize: 14,
  },
});

export default PlayerScreen;