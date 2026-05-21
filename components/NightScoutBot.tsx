
import React, { useState } from 'react';
import { Sparkles, Search, Loader2, Calendar, MapPin, ExternalLink, Ticket, MessageSquare, Bot, X, Zap, Clock, CreditCard, Navigation } from 'lucide-react';
import { findRealtimeEvents, LiveScoutEvent, NightScoutResponse } from '../services/claudeService';

export const NightScoutBot: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [city, setCity] = useState('Paris');
  const [query, setQuery] = useState('best techno events');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NightScoutResponse | null>(null);

  const handleSearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const data = await findRealtimeEvents(city, query);
      if (data) {
        setResults(data);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/98 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 bg-black/50 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-600/40 border border-white/20">
            <Bot size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">A.I. Night Scout</h2>
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] mt-1.5">ULTRA-FAST GLOBAL TRACKER</p>
          </div>
        </div>
        <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl text-white active:scale-90 transition-transform">
          <X size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 no-scrollbar">
        {/* Advanced Search HUD */}
        <div className="space-y-4 bg-zinc-900/30 p-6 rounded-[40px] border border-white/5 shadow-inner">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500" size={18} />
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all shadow-inner"
                  placeholder="Paris, Berlin, Ibiza..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Genre / Vibe</label>
              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-500" size={18} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm font-bold text-white focus:border-fuchsia-500 outline-none transition-all shadow-inner"
                  placeholder="Techno, House..."
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSearch}
            disabled={loading || !city.trim()}
            className="w-full py-6 bg-white text-black rounded-[32px] text-[13px] font-black uppercase tracking-[0.4em] flex items-center justify-center space-x-3 active:scale-95 transition-all disabled:opacity-30 shadow-2xl shadow-white/10 mt-2"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            <span>LANCER LE SCAN HAUTE VITESSE</span>
          </button>
        </div>

        {/* Dynamic Results Grid */}
        {results && results.events && results.events.length > 0 ? (
          <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700 pb-32">
            <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/10 p-8 rounded-[48px] relative overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="absolute top-0 right-0 p-6 opacity-20 rotate-12"><Sparkles size={48} /></div>
              <h3 className="text-[12px] font-black text-violet-400 uppercase tracking-widest mb-4 flex items-center italic">
                <MessageSquare size={16} className="mr-3" /> Intelligence Report
              </h3>
              <p className="text-zinc-200 text-base leading-relaxed italic font-medium">
                {results.summary}
              </p>
            </div>

            <div className="space-y-10">
               <div className="grid gap-12">
                  {results.events.map((event, i) => (
                    <div 
                      key={i} 
                      className="group bg-zinc-900/50 rounded-[52px] border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-violet-600/20"
                    >
                      {/* Event Flyer / Cover */}
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <img 
                          src={event.flyer} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[10s]" 
                          alt={event.title} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        
                        {/* Flyer Overlay Content */}
                        <div className="absolute bottom-10 left-10 right-10">
                           <div className="flex items-center space-x-3 mb-4">
                             <div className="bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-2xl border border-white/20">
                               LIVE NODE
                             </div>
                             <div className="bg-black/60 backdrop-blur-xl text-fuchsia-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/10 italic">
                               {event.price}
                             </div>
                           </div>
                           <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-[0.9] drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] mb-2">
                             {event.title}
                           </h4>
                           <p className="text-lg font-black text-white/60 uppercase tracking-widest italic">{event.venue}</p>
                        </div>
                      </div>

                      {/* Info & CTA Section */}
                      <div className="p-10 space-y-8">
                        <div className="grid gap-6">
                           <div className="flex items-start space-x-5">
                              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                                <MapPin size={22} className="text-violet-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5 leading-none">Localisation Précise</p>
                                <p className="text-zinc-300 text-[13px] font-bold leading-relaxed">{event.address}</p>
                              </div>
                           </div>

                           <div className="flex items-start space-x-5">
                              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                                <Clock size={22} className="text-fuchsia-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5 leading-none">Horaires du Node</p>
                                <p className="text-white text-base font-black italic tracking-tight">{event.date}</p>
                              </div>
                           </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex flex-col space-y-4">
                           <a 
                             href={event.url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="w-full py-6 bg-white text-black rounded-[28px] text-[13px] font-black uppercase tracking-[0.4em] flex items-center justify-center space-x-3 shadow-2xl active:scale-95 transition-all hover:bg-zinc-200"
                           >
                             <Ticket size={24} />
                             <span>BUY TICKET NOW</span>
                           </a>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`, '_blank')}
                                className="py-5 bg-zinc-900 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-white hover:text-black transition-all"
                              >
                                 <Navigation size={18} />
                                 <span>NAVIGUER</span>
                              </button>
                              <button 
                                className="py-5 bg-zinc-900 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-white hover:text-black transition-all"
                                onClick={() => {
                                  if(navigator.share) {
                                    navigator.share({ title: event.title, url: event.url });
                                  }
                                }}
                              >
                                 <ExternalLink size={18} />
                                 <span>PARTAGER</span>
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-40">
             <div className="relative">
                <div className="w-40 h-40 border-[8px] border-violet-500/10 border-t-violet-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Bot size={64} className="text-violet-500 animate-pulse" />
                </div>
                <div className="absolute -inset-4 border border-white/5 rounded-full animate-ping opacity-20"></div>
             </div>
             <div className="text-center space-y-4">
                <p className="text-[14px] font-black uppercase tracking-[0.8em] text-white animate-pulse">Deep Scan en cours...</p>
                <div className="flex flex-col items-center space-y-2 opacity-50">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Syncing Resident Advisor...</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Scraping Shotgun Live...</span>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-8 py-48 text-center opacity-20">
             <div className="relative">
                <Sparkles size={100} className="text-white" />
                <div className="absolute inset-0 bg-white blur-3xl opacity-20"></div>
             </div>
             <div className="space-y-3">
                <p className="text-2xl font-black uppercase tracking-[0.3em] text-white italic">Node en Attente</p>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-[0.2em] max-w-[300px] leading-relaxed">
                  Lancez un scan pour synchroniser les meilleures soirées mondiales via RA & Eventbrite.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
