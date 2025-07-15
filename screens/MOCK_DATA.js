const MOCK_DATA = {
  moods: [
    { id: 'm1', title: 'Happy', emoji: '😊', color: ['#fde047', '#f97316'] },
    { id: 'm2', title: 'Chill', emoji: '😌', color: ['#7dd3fc', '#0ea5e9'] },
    { id: 'm3', title: 'Energetic', emoji: '⚡️', color: ['#fb923c', '#f87171'] },
    { id: 'm4', title: 'Sad', emoji: '😢', color: ['#94a3b8', '#334155'] },
    { id: 'm5', title: 'Focused', emoji: '🎯', color: ['#818cf8', '#4f46e5'] },
    { id: 'm6', title: 'Romantic', emoji: '❤️', color: ['#f472b6', '#db2777'] },
  ],
  playlists: {
    m1: [
      { id: 's1', title: 'Good Day Sunshine', artist: 'The Beatles', artwork: 'https://placehold.co/500x500/fde047/f97316?text=Happy' },
      { id: 's2', title: 'Walking on Sunshine', artist: 'Katrina & The Waves', artwork: 'https://placehold.co/500x500/fde047/f97316?text=Vibes' },
      { id: 's3', title: 'Happy', artist: 'Pharrell Williams', artwork: 'https://placehold.co/500x500/fde047/f97316?text=Joy' },
    ],
    m2: [
      { id: 's4', title: 'Weightless', artist: 'Marconi Union', artwork: 'https://placehold.co/500x500/7dd3fc/0ea5e9?text=Chill' },
      { id: 's5', title: 'Clair de Lune', artist: 'Claude Debussy', artwork: 'https://placehold.co/500x500/7dd3fc/0ea5e9?text=Relax' },
      { id: 's6', title: 'Sunday Morning', artist: 'Maroon 5', artwork: 'https://placehold.co/500x500/7dd3fc/0ea5e9?text=Easy' },
    ],
    m3: [
      { id: 's7', title: "Don't Stop Me Now", artist: 'Queen', artwork: 'https://placehold.co/500x500/fb923c/f87171?text=Energy' },
      { id: 's8', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', artwork: 'https://placehold.co/500x500/fb923c/f87171?text=Power' },
    ],
    m4: [
      { id: 's9', title: 'Someone Like You', artist: 'Adele', artwork: 'https://placehold.co/500x500/94a3b8/334155?text=Sad' },
      { id: 's10', title: 'Hallelujah', artist: 'Leonard Cohen', artwork: 'https://placehold.co/500x500/94a3b8/334155?text=Blues' },
    ],
    m5: [
      { id: 's11', title: 'Lo-fi Beats', artist: 'Study Girl', artwork: 'https://placehold.co/500x500/818cf8/4f46e5?text=Focus' },
      { id: 's12', title: 'Ambient Study Music', artist: 'Brain Power', artwork: 'https://placehold.co/500x500/818cf8/4f46e5?text=Study' },
    ],
    m6: [
      { id: 's13', title: 'Perfect', artist: 'Ed Sheeran', artwork: 'https://placehold.co/500x500/f472b6/db2777?text=Love' },
      { id: 's14', title: 'I Will Always Love You', artist: 'Whitney Houston', artwork: 'https://placehold.co/500x500/f472b6/db2777?text=Amor' },
    ]
  }
};

export default MOCK_DATA; 