// App.js
// This is the main entry point of the application.
// It sets up navigation and the overall structure.

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, Home, Search } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlayerProvider, usePlayer } from './PlayerContext';
import { useIsFocused } from '@react-navigation/native';

// Import Screens
import HomeScreen from './screens/HomeScreen';
import PlaylistScreen from './screens/PlaylistScreen';
import PlayerScreen from './screens/PlayerScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import MiniPlayer from './components/MiniPlayer';
import SearchScreen from './screens/SearchScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Mock Data ---
// In a real app, this would come from an API

// --- Main Tab Navigator ---
const MainTabs = () => {
  const { currentTrack } = usePlayer();
  const isFocused = useIsFocused();
  // Only show MiniPlayer if not on Player screen (modal is not focused)
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

// --- Main App Stack Navigator ---
const AppStack = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
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
    </>
  );
};

// --- Root Component ---
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" />
          <AppStack />
        </NavigationContainer>
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}
