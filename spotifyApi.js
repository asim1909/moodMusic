import axios from 'axios';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';
import { encode } from 'base-64';
import MOCK_DATA from './screens/MOCK_DATA';

function encodeCredentials(clientId, clientSecret) {
  return encode(`${clientId}:${clientSecret}`);
}

export async function getSpotifyToken() {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${encodeCredentials(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)}`,
      },
    }
  );
  return response.data.access_token;
}

// Search tracks by mood/keyword
export async function fetchSpotifyTracksByMood(mood) {
  try {
    const token = await getSpotifyToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(mood)}&type=track&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.tracks.items; // Array of track objects
  } catch (error) {
    // Fallback to mock data
    const moodObj = MOCK_DATA.moods.find(m => m.title.toLowerCase() === mood.toLowerCase());
    if (moodObj && MOCK_DATA.playlists[moodObj.id]) {
      return MOCK_DATA.playlists[moodObj.id];
    }
    // If mood not found, return all tracks
    return Object.values(MOCK_DATA.playlists).flat();
  }
}

// Fetch new releases from Spotify
export async function fetchSpotifyNewReleases() {
  try {
    const token = await getSpotifyToken();
    const response = await axios.get(
      'https://api.spotify.com/v1/browse/new-releases?limit=20',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.albums.items; // Array of album objects
  } catch (error) {
    // Fallback to mock data: return all tracks as "new releases"
    return Object.values(MOCK_DATA.playlists).flat();
  }
}