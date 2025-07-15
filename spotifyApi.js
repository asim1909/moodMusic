import axios from 'axios';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';
import { encode } from 'base-64';

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
}

// Fetch new releases from Spotify
export async function fetchSpotifyNewReleases() {
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
}