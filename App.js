import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, Home, Search } from 'lucide-react-native';
import { fetchSpotifyNewReleases } from './spotifyApi';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlayerProvider, usePlayer } from './PlayerContext';
import { useIsFocused } from '@react-navigation/native';
import { ThemeProvider } from './ThemeContext';

import HomeScreen from './screens/HomeScreen';
import PlaylistScreen from './screens/PlaylistScreen';
import PlayerScreen from './screens/PlayerScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import MiniPlayer from './components/MiniPlayer';
import SearchScreen from './screens/SearchScreen';
import SplashScreen from './screens/SplashScreen';
import ThemeToggleButton from './components/ThemeToggleButton';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = ({ spotifyReleases }) => {
  const { currentTrack } = usePlayer();
  const isFocused = useIsFocused();
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#a7a7a7',
          tabBarStyle: {
            backgroundColor: '#121212',
            borderTopWidth: 0,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'System',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          initialParams={{ spotifyReleases }}
          options={{
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
      {currentTrack && isFocused && <MiniPlayer />}
    </>
  );
};

const AppStack = ({ spotifyReleases }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Main">
        {() => <MainTabs spotifyReleases={spotifyReleases} />}
      </Stack.Screen>
      <Stack.Screen name="Playlist" component={PlaylistScreen} />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  const [spotifyReleases, setSpotifyReleases] = useState(null);

  useEffect(() => {
    async function getSpotifyData() {
      try {
        const data = await fetchSpotifyNewReleases();
        setSpotifyReleases(data);
      } catch (error) {
        console.error('Error fetching Spotify data:', error);
      }
    }
    getSpotifyData();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <PlayerProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" />
            <AppStack spotifyReleases={spotifyReleases} />
          </NavigationContainer>
        </PlayerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}