
export interface Club {
  id: string;
  name: string;
  city: 'London' | 'Paris' | 'Ibiza' | 'Berlin' | 'Dubai' | 'New York';
  logo: string;
  coverImage: string;
  lat: number;
  lng: number;
  address?: string;
  description: string;
  rating: number;
  upcomingEvents: PartyEvent[];
  brandColor?: string;
  vibe?: 'Techno' | 'House' | 'Hip-Hop' | 'Open Format' | 'Disco' | 'Chic';
  activityLevel?: number; // 0 to 100 for addictive heat map feel
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isFriend: boolean;
}

export interface PartyEvent {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  date: string;
  image: string;
  price: number;
  djs: string[];
  guestListOpen: boolean;
  category: 'Techno' | 'House' | 'Hip-Hop' | 'Open Format' | 'Disco';
  attendingFriends?: Participant[];
  totalAttending?: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  isLive?: boolean;
}

export interface ShazamTrack {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  timestamp: string;
}

export interface ProfileHighlight {
  id: string;
  title: string;
  cover: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  expiresIn: number;
  type: 'text' | 'image';
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  friendsCount: number;
  followersCount: number;
  clubsVisited: number;
  favoriteDJs: string[];
  soundList: string[];
  shazamTracks?: ShazamTrack[];
  highlights?: ProfileHighlight[];
  tickets: PartyEvent[];
  guestLists: PartyEvent[];
  vibeEnergy?: number;
  socialInfluence?: number;
  sonicAlignment?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  provider: string;
}

export type AppTab = 'feed' | 'map' | 'create' | 'events' | 'profile' | 'chat';
