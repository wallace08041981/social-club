
import { Club, PartyEvent, Story, UserProfile, Participant, ShazamTrack, ProfileHighlight } from './types';

export const CITIES = [
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Ibiza', lat: 38.9067, lng: 1.4206 },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050 }
];

export const CLUBS: Club[] = [
  // --- DUBAI NIGHTCLUBS ---
  { id: 'white-dubai', name: 'White Dubai', city: 'Dubai', logo: 'https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=100', coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', lat: 25.1585, lng: 55.3121, description: 'The first hi-tech rooftop at Meydan Racecourse.', rating: 4.9, upcomingEvents: [], brandColor: '#ffffff', vibe: 'House', activityLevel: 92 },
  { id: 'sky20-dubai', name: 'SKY2.0', city: 'Dubai', logo: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=100', coverImage: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800', lat: 25.1873, lng: 55.2995, description: 'Futuristic dome for unparalleled entertainment.', rating: 4.8, upcomingEvents: [], brandColor: '#ef4444', vibe: 'Hip-Hop', activityLevel: 85 },
  { id: 'soho-garden', name: 'Soho Garden', city: 'Dubai', logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', lat: 25.1587, lng: 55.3125, description: 'An urban playground of music and bars.', rating: 4.7, upcomingEvents: [], brandColor: '#22c55e', vibe: 'Techno', activityLevel: 78 },
  { id: 'bling-dubai', name: 'BLING', city: 'Dubai', logo: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=100', coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', lat: 25.1112, lng: 55.1402, description: 'Ultra-luxury at FIVE Palm Jumeirah.', rating: 4.9, upcomingEvents: [], brandColor: '#fbbf24', vibe: 'Hip-Hop', activityLevel: 95 },

  // --- NEW YORK ---
  { id: 'marquee-ny', name: 'Marquee New York', city: 'New York', logo: 'https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=100', coverImage: 'https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=800', lat: 40.7505, lng: -74.0040, description: 'Legendary multi-level nightlife cathedral.', rating: 4.8, upcomingEvents: [], brandColor: '#ef4444', vibe: 'House', activityLevel: 88 },
  { id: 'brooklyn-mirage', name: 'Brooklyn Mirage', city: 'New York', logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', lat: 40.7107, lng: -73.9344, description: 'Premier outdoor multi-level sanctuary.', rating: 5.0, upcomingEvents: [], brandColor: '#000000', vibe: 'Techno', activityLevel: 100 },
  { id: 'nebula-ny', name: 'Nebula', city: 'New York', logo: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=100', coverImage: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800', lat: 40.7558, lng: -73.9845, description: 'Futuristic Midtown nightclub technology.', rating: 4.9, upcomingEvents: [], brandColor: '#8b5cf6', vibe: 'Techno', activityLevel: 94 },
  { id: 'house-of-yes', name: 'House of Yes', city: 'New York', logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100', coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', lat: 40.7068, lng: -73.9234, description: 'Inclusive theatrical dance sanctuary.', rating: 4.9, upcomingEvents: [], brandColor: '#fbbf24', vibe: 'Open Format', activityLevel: 89 },

  // --- PARIS ---
  { id: 'larc-paris', name: 'L\'Arc Paris', city: 'Paris', logo: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=100', coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', lat: 48.8738, lng: 2.2950, description: 'The most exclusive club facing Arc de Triomphe.', rating: 5.0, upcomingEvents: [], brandColor: '#fbbf24', vibe: 'Chic', activityLevel: 96 },
  { id: 'pamela-paris', name: 'Pamela Paris', city: 'Paris', logo: 'https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=100', coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', lat: 48.8685, lng: 2.3421, description: 'Disco-chic temple in St Germain.', rating: 4.7, upcomingEvents: [], brandColor: '#ff0055', vibe: 'Disco', activityLevel: 72 },
  { id: 'phantom-paris', name: 'Phantom', city: 'Paris', logo: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=100', coverImage: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800', lat: 48.8385, lng: 2.3785, description: 'Immense visual experience under Accor Arena.', rating: 4.8, upcomingEvents: [], brandColor: '#ffffff', vibe: 'Techno', activityLevel: 99 },
  { id: 'raspoutine-paris', name: 'Raspoutine', city: 'Paris', logo: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=100', coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', lat: 48.8694, lng: 2.3015, description: 'Russian cabaret turned deep house sanctuary.', rating: 4.9, upcomingEvents: [], brandColor: '#be123c', vibe: 'House', activityLevel: 85 },

  // --- LONDON ---
  { id: 'raffles-chelsea', name: 'Raffles Chelsea', city: 'London', logo: 'https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=100', coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', lat: 51.4852, lng: -0.1708, description: 'Chelsea institution since 1967.', rating: 4.8, upcomingEvents: [], brandColor: '#1e3a8a', vibe: 'House', activityLevel: 80 },
  { id: 'cirque-le-soir-london', name: 'Cirque le Soir', city: 'London', logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', lat: 51.5132, lng: -0.1392, description: 'Unforgettable excentric nightlife.', rating: 5.0, upcomingEvents: [], brandColor: '#dc2626', vibe: 'Open Format', activityLevel: 98 },

  // --- IBIZA ---
  { id: 'hi-ibiza', name: 'Hï Ibiza', city: 'Ibiza', logo: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=100', coverImage: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800', lat: 38.8856, lng: 1.4035, description: 'World #1 club sensorially advanced.', rating: 5.0, upcomingEvents: [], brandColor: '#8b5cf6', vibe: 'Techno', activityLevel: 100 },
  { id: 'ushuaia-ibiza', name: 'Ushuaïa Ibiza', city: 'Ibiza', logo: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=100', coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', lat: 38.8876, lng: 1.4036, description: 'Daytime open-air club icon.', rating: 4.9, upcomingEvents: [], brandColor: '#ef4444', vibe: 'House', activityLevel: 97 },
  { id: 'dc10-ibiza', name: 'DC-10', city: 'Ibiza', logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', lat: 38.8778, lng: 1.3705, description: 'The underground heart of Ibiza.', rating: 4.9, upcomingEvents: [], brandColor: '#000000', vibe: 'Techno', activityLevel: 94 },
  { id: 'berghain-berlin', name: 'Berghain', city: 'Berlin', logo: 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=100', coverImage: 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=800', lat: 52.5112, lng: 13.4431, description: 'The most exclusive techno temple in the world.', rating: 5.0, upcomingEvents: [], brandColor: '#1a1a1a', vibe: 'Techno', activityLevel: 100 }
];

export const EVENTS: PartyEvent[] = [
  {
    id: 'e_ny_1',
    clubId: 'brooklyn-mirage',
    clubName: 'Brooklyn Mirage',
    title: 'Keinemusik • NY Takeover',
    date: 'Tonight • 22:00',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=800&fit=crop',
    price: 120,
    djs: ['&ME', 'Rampa', 'Adam Port'],
    guestListOpen: false,
    category: 'House',
    totalAttending: 8000
  },
  {
    id: 'e_hi_1',
    clubId: 'hi-ibiza',
    clubName: 'Hï Ibiza',
    title: 'Fisher • Tuesdays',
    date: 'Tonight • 23:59',
    image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&h=800&fit=crop',
    price: 80,
    djs: ['Fisher', 'Vintage Culture'],
    guestListOpen: false,
    category: 'House',
    totalAttending: 6000
  }
];

const SHAZAM_MOCK: ShazamTrack[] = [
  { id: 'sh1', title: 'On My Knees (Cassian Remix)', artist: 'RÜFÜS DU SOL', artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop', timestamp: 'Yesterday' },
];

const HIGHLIGHTS_MOCK: ProfileHighlight[] = [
  { id: 'h1', title: 'NYC 2026', cover: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=150&h=150&fit=crop' },
];

export const STORIES: Story[] = [
  {
    id: 's1',
    userId: 'u1',
    userName: 'Your Story',
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop',
    content: 'https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=400&h=700&fit=crop',
    timestamp: '2h ago',
    isLive: false
  },
  {
    id: 'dj1',
    userId: 'keinemusik',
    userName: 'Keinemusik',
    userAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&h=150&fit=crop',
    content: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=700&fit=crop',
    timestamp: '1h ago',
    isLive: true
  }
];

export const CURRENT_USER: UserProfile = {
  id: 'u1',
  name: 'Sofia Rossi',
  handle: '@sofi_vibes',
  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
  friendsCount: 1240,
  followersCount: 84200,
  clubsVisited: 82,
  favoriteDJs: ['Tale Of Us', 'Solomun'],
  soundList: ['Melodic Techno', 'Indie Dance'],
  shazamTracks: SHAZAM_MOCK,
  highlights: HIGHLIGHTS_MOCK,
  tickets: [EVENTS[0]],
  guestLists: [EVENTS[1]]
};
