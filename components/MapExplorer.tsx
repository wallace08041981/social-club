
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Star, Loader2, Target, X, Ticket, Crosshair, MapPin, ExternalLink, Navigation, Flame, Music, Radio, Users } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { searchClubsOnMap, MapResult } from '../services/claudeService';
import { CITIES, CURRENT_USER, STORIES } from '../constants';
import { Club } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const SHOTGUN_API_KEY = '53a987ed-fe1b-4230-9277-91dc49ab7d27';

// Marqueur 2026 - High Contrast Addictive Style
const createClubIcon = (logoUrl: string, brandColor: string = '#8b5cf6', activityLevel: number = 50) => {
  const pulseDuration = Math.max(0.4, 2.5 - (activityLevel / 40));
  const glowIntensity = Math.min(60, activityLevel / 1.5);
  
  return L.divIcon({
    html: `
      <div class="relative w-20 h-20 flex items-center justify-center">
        <!-- Glow Core -->
        <div class="absolute inset-0 bg-[${brandColor}] rounded-full opacity-25 blur-3xl animate-pulse"></div>
        <div class="absolute inset-4 bg-[${brandColor}] rounded-full opacity-40 blur-xl" style="animation: ping ${pulseDuration}s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- Physical Structure -->
        <div class="relative w-14 h-14 bg-black rounded-[22px] p-0.5 shadow-[0_0_${glowIntensity}px_${brandColor}66] border-2 border-white/90">
          <div class="w-full h-full rounded-[18px] overflow-hidden bg-white flex items-center justify-center">
            <img src="${logoUrl}" class="w-[85%] h-[85%] object-contain" />
          </div>
        </div>

        <!-- Activity Indicator Label -->
        <div class="absolute -bottom-1 px-2 py-0.5 bg-black border border-white/20 rounded-full flex items-center gap-1 shadow-2xl">
          <div class="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
          <span class="text-[7px] font-black text-white uppercase tracking-tighter">${activityLevel}%</span>
        </div>
      </div>
    `,
    className: '',
    iconSize: [80, 80],
    iconAnchor: [40, 70],
  });
};

const createStoryIcon = (avatar: string) => L.divIcon({
  html: `
    <div class="relative w-12 h-12 flex items-center justify-center scale-75 opacity-80 hover:opacity-100 hover:scale-100 transition-all">
      <div class="absolute inset-0 bg-violet-600 rounded-full animate-pulse border-2 border-white/50"></div>
      <img src="${avatar}" class="w-10 h-10 rounded-full object-cover border-2 border-black z-10 relative" />
    </div>
  `,
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

const searchIcon = L.divIcon({
  html: `
    <div class="relative w-10 h-10 flex items-center justify-center">
      <div class="absolute inset-0 bg-white rounded-full opacity-40 animate-ping"></div>
      <div class="w-5 h-5 bg-white rounded-full border-[3px] border-black shadow-[0_0_25px_white]"></div>
    </div>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const MapController: React.FC<{ center: [number, number]; zoom: number; isTransitioning: boolean; onEnd: () => void }> = ({ center, zoom, isTransitioning, onEnd }) => {
  const map = useMap();
  useEffect(() => {
    if (isTransitioning) {
      map.flyTo(center, zoom, { 
        animate: true, 
        duration: 1.5, 
        easeLinearity: 0.25 
      });
      const timer = setTimeout(() => {
        onEnd();
        map.invalidateSize();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [center, zoom, map, isTransitioning, onEnd]);
  return null;
};

const VIBES = ['All', 'Techno', 'House', 'Hip-Hop', 'Chic', 'Disco'] as const;

const RadarOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
      <div className="w-[100vw] h-[100vw] rounded-full border border-violet-500/20 animate-radar"></div>
      <div className="w-[100vw] h-[100vw] rounded-full border border-violet-500/10 animate-radar" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]"></div>
    </div>
  );
};

export const MapExplorer: React.FC<MapExplorerProps> = ({ onProfileClick }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [results, setResults] = useState<MapResult[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Paris default
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [activeCity, setActiveCity] = useState('Paris');
  const [activeVibe, setActiveVibe] = useState<typeof VIBES[number]>('All');
  const [zoomLevel, setZoomLevel] = useState(13);
  const [shotgunEvents, setShotgunEvents] = useState<any[]>([]);
  const [isLoadingShotgun, setIsLoadingShotgun] = useState(false);
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const [verifiedClubs, setVerifiedClubs] = useState<Club[]>([]);

  useEffect(() => {
    fetch('/api/clubs')
      .then(res => res.json())
      .then(data => setVerifiedClubs(data))
      .catch(err => console.error("Failed to fetch clubs:", err));
  }, []);

  const filteredClubs = useMemo(() => {
    let list = verifiedClubs.filter(c => c.city === activeCity);
    if (activeVibe !== 'All') {
      list = list.filter(c => c.vibe === activeVibe);
    }
    return list;
  }, [activeCity, activeVibe, verifiedClubs]);

  // Pre-calculate stable random positions for stories to follow React purity rules
  const storyMarkers = useMemo(() => {
    return filteredClubs.map(club => ({
      id: club.id,
      position: [
        club.lat + (Math.sin(club.id.length) * 0.002), // Deterministic offset
        club.lng + (Math.cos(club.id.length) * 0.002)  // Deterministic offset
      ] as [number, number],
      avatar: STORIES[club.id.length % STORIES.length].userAvatar
    }));
  }, [filteredClubs]);

  const topClubsInCity = useMemo(() => {
    return filteredClubs.sort((a,b) => (b.activityLevel || 0) - (a.activityLevel || 0)).slice(0, 5);
  }, [filteredClubs]);

  const fetchShotgunEvents = async (venueName: string) => {
    setIsLoadingShotgun(true);
    try {
      const response = await fetch(`https://api.shotgun.live/v2/events?search=${encodeURIComponent(venueName)}`, {
        headers: { 'Authorization': `Bearer ${SHOTGUN_API_KEY}` }
      });
      const data = await response.json();
      setShotgunEvents(data.data || []);
    } catch (e) {
      console.error("Shotgun API Error", e);
    } finally {
      setIsLoadingShotgun(false);
    }
  };

  const handleCitySelect = (city: typeof CITIES[0]) => {
    if (activeCity === city.name) return;
    setActiveCity(city.name);
    setIsTransitioning(true);
    setZoomLevel(13);
    setMapCenter([city.lat, city.lng]);
    setResults([]);
    setSelectedClub(null);
  };

  const handleClubSelect = (club: Club) => {
    setSelectedClub(club);
    setIsTransitioning(true);
    setZoomLevel(17);
    setMapCenter([club.lat, club.lng]);
    fetchShotgunEvents(club.name);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const internalMatch = verifiedClubs.find(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    );

    if (internalMatch) {
      handleClubSelect(internalMatch);
      setQuery('');
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchClubsOnMap(query, { lat: mapCenter[0], lng: mapCenter[1] });
      if (data && data.places.length > 0) {
        setResults(data.places);
        setIsTransitioning(true);
        setZoomLevel(16);
        setMapCenter([data.places[0].lat, data.places[0].lng]);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openNavigation = (type: 'google' | 'waze') => {
    if (!selectedClub) return;
    const { lat, lng } = selectedClub;
    const url = type === 'google' 
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    window.open(url, '_blank');
  };

  return (
    <div className="absolute inset-0 bg-black flex flex-col z-0 overflow-hidden">
      {/* Visual FX Layers */}
      <div className="fixed inset-0 pointer-events-none z-[1000]">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 opacity-60"></div>
        <div className="absolute inset-0 border-[20px] border-black opacity-30"></div>
        <div className="scanline opacity-10"></div>
      </div>

      {/* Header HUD - Glassmorphism Evolution */}
      <div className="absolute top-4 left-4 right-4 z-[1005] flex flex-col space-y-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">Network_Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
              <span className="text-[12px] font-black text-white uppercase tracking-widest">Global_Live_Scanning</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-black text-white/60">v4.2.1-NIGHT</span>
            </div>
          </div>
          
          <button 
            onClick={onProfileClick}
            className="w-12 h-12 bg-white/5 backdrop-blur-3xl border-2 border-white/10 rounded-2xl p-1 cursor-pointer active:scale-90 transition-all shadow-2xl relative overflow-hidden"
          >
             <img src={CURRENT_USER.avatar} className="w-full h-full rounded-xl object-cover" alt="Profile" />
          </button>
        </div>

        <div className="flex items-center space-x-3 pointer-events-auto">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <div className="relative overflow-hidden rounded-[20px]">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
              <input
                type="text"
                placeholder="PROBE_NIGHT_NODES..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-2 border-white/10 rounded-[20px] py-4 pl-14 pr-4 text-[11px] font-black uppercase tracking-[0.3em] focus:outline-none focus:border-violet-500 transition-all text-white placeholder-zinc-700 relative z-10"
              />
              <Crosshair className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-violet-500 transition-colors z-10" size={18} />
              {isLoading && (
                <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 text-violet-500 animate-spin z-10" size={18} />
              )}
            </div>
          </form>
        </div>

        {/* City & Vibe Controls */}
        <div className="flex flex-col space-y-3 pointer-events-auto">
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city)}
                className={`flex-shrink-0 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${
                  activeCity === city.name 
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                    : 'bg-black/60 text-white/40 border-white/10 backdrop-blur-xl'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            {VIBES.map((vibe) => (
              <button
                key={vibe}
                onClick={() => setActiveVibe(vibe)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all gap-2 flex items-center ${
                  activeVibe === vibe 
                    ? 'bg-violet-600 text-white border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]' 
                    : 'bg-black/40 text-zinc-500 border border-white/5'
                }`}
              >
                <div className={`w-1 h-1 rounded-full ${activeVibe === vibe ? 'bg-white animate-pulse' : 'bg-zinc-600'}`}></div>
                {vibe}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="absolute inset-0 z-0">
        <RadarOverlay />
        <MapContainer 
          center={mapCenter} 
          zoom={zoomLevel} 
          scrollWheelZoom={true} 
          className="h-full w-full outline-none" 
          zoomControl={false}
          style={{ height: '100%', width: '100%', background: '#000' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            className="map-tiles-night"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            opacity={0.9}
          />
          <MapController 
            center={mapCenter} 
            zoom={zoomLevel} 
            isTransitioning={isTransitioning} 
            onEnd={() => setIsTransitioning(false)} 
          />
          
          {filteredClubs.map((club) => (
            <Marker 
              key={`v-${club.id}`} 
              position={[club.lat, club.lng]} 
              icon={createClubIcon(club.logo, club.brandColor, club.activityLevel)}
              eventHandlers={{ click: () => handleClubSelect(club) }}
            />
          ))}

          {/* Stable Live Stories near clubs for "Activity" feel */}
          {storyMarkers.map((marker) => (
            <Marker 
              key={`s-live-${marker.id}`} 
              position={marker.position} 
              icon={createStoryIcon(marker.avatar)}
            />
          ))}

          {results.map((place, idx) => (
            <Marker 
              key={`s-${idx}`} 
              position={[place.lat, place.lng]} 
              icon={searchIcon} 
            />
          ))}
        </MapContainer>
      </div>

      {/* Quick Access Top Nodes Drawer */}
      <div className={`absolute bottom-4 left-4 right-4 z-[1002] transition-all duration-500 ${selectedClub ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">Hotspots_Trend_Scanning</h4>
            <div className="flex items-center space-x-2 text-violet-500">
               <Flame size={12} className="animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-widest">Active Pulse</span>
            </div>
          </div>
          
          <div className="flex space-x-3 overflow-x-auto no-scrollbar p-1">
            {topClubsInCity.map((club, idx) => (
              <button 
                key={club.id}
                onClick={() => handleClubSelect(club)}
                className="flex-shrink-0 bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-5 rounded-[32px] flex items-center space-x-5 pr-10 shadow-2xl transition-all active:scale-95 group relative overflow-hidden"
              >
                {/* Dynamic Gradient for addictiveness */}
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl transition-all group-hover:scale-150`} style={{ background: club.brandColor }}></div>
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-white/20 bg-white group-hover:border-white transition-all shadow-xl">
                    <img src={club.logo} className="w-full h-full object-contain p-1.5" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-violet-600 rounded-full px-2 py-0.5 text-[7px] font-black italic border-2 border-zinc-950">
                    TOP {idx + 1}
                  </div>
                </div>

                <div className="text-left relative z-10">
                   <p className="text-[14px] font-black text-white uppercase tracking-tight italic leading-none mb-1.5">{club.name}</p>
                   <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg">
                         <div className="w-1 h-1 rounded-full bg-violet-500 animate-pulse"></div>
                         <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">{club.activityLevel}% COEUR</span>
                      </div>
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">{club.vibe}</span>
                   </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button className="flex items-center space-x-2 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-400 group active:scale-95 transition-all">
               <Radio size={14} className="group-hover:text-violet-500" />
               <span>Scanner Localisation</span>
            </button>
            <button 
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(p => {
                    setMapCenter([p.coords.latitude, p.coords.longitude]);
                    setZoomLevel(16);
                    setIsTransitioning(true);
                  });
                }
              }}
              className="p-5 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)] text-black hover:scale-110 active:rotate-12 transition-all"
            >
              <Target size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Club Micro-HUD */}
      <AnimatePresence>
        {selectedClub && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[2005] p-4 flex flex-col pointer-events-none"
            style={{ maxWidth: '448px', left: '50%', transform: 'translateX(-50%)' }}
          >
            <div className="bg-zinc-950 border-t-2 border-white/20 rounded-t-[40px] shadow-[0_-30px_100px_rgba(0,0,0,1)] pointer-events-auto p-8 pt-6 overflow-hidden relative">
              {/* Additive Activity Background */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-1000" 
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${selectedClub.brandColor}, transparent)`,
                  width: `${selectedClub.activityLevel}%`,
                  left: `${(100 - (selectedClub.activityLevel || 0)) / 2}%`
                }}
              ></div>

              <div className="flex justify-between items-start mb-8">
                 <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 bg-white p-1 rounded-2xl shadow-xl border border-white transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                       <img src={selectedClub.logo} className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none mb-1.5">{selectedClub.name}</h2>
                       <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-violet-600/20 border border-violet-500/30 rounded-lg">
                             <Users size={10} className="text-violet-400" />
                             <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest animate-pulse">{(selectedClub.activityLevel || 0) * 12} PEOPLE IN</span>
                          </div>
                          <div className="flex items-center space-x-1 underline decoration-white/20">
                             <Music size={10} className="text-white/40" />
                             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{selectedClub.vibe}</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSelectedClub(null)} 
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                 >
                    <X size={20} className="text-white/60" />
                 </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4 opacity-70">
                   <MapPin size={16} className="text-violet-500 mt-0.5 shrink-0" />
                   <p className="text-[12px] font-medium text-zinc-400 italic leading-snug">{selectedClub.address || '44 Zone Industrielle, Paris • 75020'}</p>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-2xl border border-white/5 group cursor-pointer hover:bg-white/10 transition-all">
                   <div className="shrink-0 w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Ticket size={16} className="text-orange-500" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Live_Event_Detection</p>
                      <p className="text-[10px] font-bold text-white uppercase tracking-tight">SHOTGUN_VERIFIED: Keinemusik Showcase</p>
                   </div>
                   <ExternalLink size={14} className="text-white/20" />
                </div>

                <div className="grid grid-cols-5 gap-3 pt-4 safe-area-bottom">
                  <button 
                    onClick={() => {
                       window.open(`https://shotgun.live/fr/search?q=${encodeURIComponent(selectedClub.name)}`, '_blank');
                    }}
                    className="col-span-3 py-6 bg-white text-black rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center justify-center space-x-3"
                  >
                     <Navigation size={18} />
                     <span>GET_DIRECTION</span>
                  </button>
                  <button 
                    onClick={() => openNavigation('google')}
                    className="col-span-1 p-5 bg-zinc-900 border border-white/10 rounded-[24px] text-white flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-90"
                  >
                     <MapPin size={22} />
                  </button>
                  <button 
                    className="col-span-1 p-5 bg-zinc-900 border border-white/10 rounded-[24px] text-white flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-90"
                  >
                     <Star size={22} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface MapExplorerProps {
  onProfileClick?: () => void;
}
