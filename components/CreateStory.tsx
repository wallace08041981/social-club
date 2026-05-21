
import React, { useState, useEffect } from 'react';
import { MapPin, X, Check, Loader2, Sparkles, Navigation, Wand2 } from 'lucide-react';
import { CLUBS } from '../constants';
import { Club } from '../types';

// Helper to calculate distance in km between two points
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface Filter {
  id: string;
  name: string;
  style: string;
  color: string;
}

const FILTERS: Filter[] = [
  { id: 'none', name: 'Raw', style: 'brightness(0.7) saturate(1.2)', color: 'zinc-500' },
  { id: 'smooth', name: 'Smooth', style: 'brightness(1.1) saturate(1.1) contrast(0.9) blur(1px)', color: 'rose-400' },
  { id: 'glam', name: 'Glamour', style: 'brightness(1.2) saturate(1.5) contrast(1.1)', color: 'fuchsia-500' },
  { id: 'cyber', name: 'Cyber', style: 'hue-rotate(280deg) saturate(2) brightness(1.1)', color: 'violet-500' },
  { id: 'noir', name: 'Midnight', style: 'grayscale(1) contrast(1.3) brightness(0.8)', color: 'white' },
  { id: 'vintage', name: 'Retro', style: 'sepia(0.6) brightness(0.9) contrast(1.2)', color: 'amber-600' },
];

export const CreateStory: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyClubs, setNearbyClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [step, setStep] = useState<'camera' | 'tagging' | 'posting'>('camera');
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTERS[0]);
  const [showFilters, setShowFilters] = useState(false);

  const detectNearbyClubs = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          const found = CLUBS.filter(club => {
            const dist = getDistance(latitude, longitude, club.lat, club.lng);
            return dist < 2.0; 
          });

          const foundSorted = found.sort((a, b) => 
            getDistance(latitude, longitude, a.lat, a.lng) - 
            getDistance(latitude, longitude, b.lat, b.lng)
          );

          setNearbyClubs(foundSorted);
          if (foundSorted.length === 1) {
            setSelectedClub(foundSorted[0]);
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Location access denied", error);
          setIsLoadingLocation(false);
          setNearbyClubs(CLUBS);
        }
      );
    } else {
      setIsLoadingLocation(false);
      setNearbyClubs(CLUBS);
    }
  };

  useEffect(() => {
    if (step === 'tagging') {
      setTimeout(() => {
        detectNearbyClubs();
      }, 0);
    }
  }, [step]);

  const handlePost = async () => {
    setStep('posting');
    try {
      const formData = new FormData();
      // In a real app, we'd have a blob from the camera here.
      // For this demo, we'll send a placeholder image URL.
      formData.append('url', `https://picsum.photos/seed/${Date.now()}/1080/1920`);
      
      const res = await fetch('/api/stories', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        // Success handled by state
      }
    } catch (err) {
      console.error("Failed to post story:", err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-black overflow-hidden relative">
      {/* 1. CAMERA PREVIEW */}
      <div className="relative flex-1 bg-zinc-900 overflow-hidden">
        {/* Viewfinder with Active Filter */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-700">
           <img 
            src="https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=800&q=80" 
            className="w-full h-full object-cover transition-all duration-1000"
            style={{ filter: activeFilter.style }}
            alt="Viewfinder"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
        </div>

        {/* HUD Overlay */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
           <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">4K • {activeFilter.name}</span>
           </div>
           <button onClick={() => setStep('camera')} className="p-3 bg-black/40 backdrop-blur-md rounded-2xl text-white">
              <X size={20} />
           </button>
        </div>

        {/* Filters Carousel */}
        {step === 'camera' && showFilters && (
          <div className="absolute bottom-40 left-0 right-0 z-20 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex space-x-4 px-8 overflow-x-auto no-scrollbar py-4">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f)}
                    className="flex flex-col items-center space-y-2 flex-shrink-0"
                  >
                    <div className={`w-14 h-14 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${activeFilter.id === f.id ? `border-${f.color} scale-110 shadow-lg` : 'border-white/10 opacity-60'}`}>
                      <img 
                        src="https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=100&q=80" 
                        className="w-full h-full object-cover"
                        style={{ filter: f.style }}
                      />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${activeFilter.id === f.id ? 'text-white' : 'text-zinc-500'}`}>
                      {f.name}
                    </span>
                  </button>
                ))}
             </div>
          </div>
        )}

        {/* Disambiguation / Selection Overlay if step is 'tagging' */}
        {step === 'tagging' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-end p-6 animate-in slide-in-from-bottom-full duration-500">
            <div className="w-full bg-zinc-950/90 backdrop-blur-3xl border border-violet-500/30 rounded-[48px] p-8 shadow-[0_0_100px_rgba(139,92,246,0.3)]">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/40">
                       <MapPin size={24} className="text-white fill-white/20" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Tag Venue</h3>
                      <p className="text-[9px] font-black uppercase tracking-widest text-violet-400">Precision Location Link</p>
                    </div>
                 </div>
                 {isLoadingLocation && <Loader2 className="text-violet-500 animate-spin" size={20} />}
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar mb-8">
                {nearbyClubs.length > 0 ? (
                  nearbyClubs.map(club => (
                    <button 
                      key={club.id}
                      onClick={() => setSelectedClub(club)}
                      className={`w-full flex items-center justify-between p-4 rounded-[28px] border transition-all duration-300 ${
                        selectedClub?.id === club.id 
                          ? 'bg-violet-600 border-violet-400 shadow-[0_10px_20px_rgba(139,92,246,0.3)] scale-[1.02]' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <img src={club.logo} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="text-left">
                          <p className={`text-xs font-black uppercase tracking-tight ${selectedClub?.id === club.id ? 'text-white' : 'text-zinc-300'}`}>
                            {club.name}
                          </p>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${selectedClub?.id === club.id ? 'text-violet-200' : 'text-zinc-500'}`}>
                            Nearby • Node Sector {club.id}
                          </span>
                        </div>
                      </div>
                      {selectedClub?.id === club.id && <Check size={18} className="text-white" />}
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center flex flex-col items-center">
                    <Info size={32} className="text-zinc-700 mb-3" />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-relaxed">
                      No verified nodes detected.<br/>Searching wide-range frequencies...
                    </p>
                    <button className="mt-4 px-6 py-2 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Search Manually
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={handlePost}
                disabled={!selectedClub}
                className={`w-full py-5 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl ${
                  selectedClub 
                    ? 'bg-white text-black active:scale-95' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                CONFIRM_DROP_STORY
              </button>
            </div>
          </div>
        )}

        {/* Capture Controls (Visible when not tagging) */}
        {step === 'camera' && (
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center space-y-8 animate-in fade-in duration-700 z-30">
            <div className="flex items-center space-x-12">
               <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`transition-all duration-300 ${showFilters ? 'text-violet-500 scale-125' : 'text-white/60 hover:text-white'}`}
               >
                  <Wand2 size={28} className={showFilters ? 'fill-violet-500/20' : ''} />
               </button>
               
               <button 
                onClick={() => setStep('tagging')}
                className="group relative"
               >
                 <div className="absolute inset-[-12px] rounded-full border-2 border-white/20 group-active:scale-90 transition-transform"></div>
                 <div className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full group-active:scale-90 transition-transform"></div>
                 </div>
               </button>

               <button className="text-white/60 hover:text-white transition-colors">
                  <Navigation size={28} />
               </button>
            </div>

            <div className="flex bg-black/60 backdrop-blur-xl rounded-full p-1.5 border border-white/10">
               <button className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-white/10">Story</button>
               <button className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">Live</button>
               <button className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">Reels</button>
            </div>
          </div>
        )}

        {/* Final Step: Posting Success */}
        {step === 'posting' && (
           <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
              <div className="relative mb-8">
                 <div className="absolute inset-0 bg-violet-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                 <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-violet-600 to-indigo-900 flex items-center justify-center border border-white/20 relative shadow-2xl">
                    <Sparkles size={48} className="text-white animate-bounce" />
                 </div>
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2 text-center">Story Synchronized</h2>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] text-center mb-10 max-w-[240px]">
                Broadcast active at {selectedClub?.name} with {activeFilter.name} visual filter applied.
              </p>
              <button 
                onClick={() => window.location.reload()} // Mock returning to feed
                className="px-12 py-5 bg-white text-black rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
              >
                Return to Matrix
              </button>
           </div>
        )}
      </div>
    </div>
  );
};
