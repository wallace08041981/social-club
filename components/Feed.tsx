import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Ticket, UserPlus, CheckCircle2, Flame, Loader2 } from 'lucide-react';
import { PartyEvent } from '../types';
import { getEvents, likeEvent, bookmarkEvent, joinGuestlist } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Feed: React.FC = () => {
  const [events, setEvents] = useState<(PartyEvent & { likesCount?: number; isLiked?: boolean; isBookmarked?: boolean; isOnGuestlist?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleLike = async (eventId: string) => {
    if (!user) return;
    try {
      const result = await likeEvent(eventId);
      setEvents(prev => prev.map(e => e.id === eventId
        ? { ...e, isLiked: result.liked, likesCount: result.count }
        : e
      ));
    } catch {}
  };

  const handleBookmark = async (eventId: string) => {
    if (!user) return;
    try {
      const result = await bookmarkEvent(eventId);
      setEvents(prev => prev.map(e => e.id === eventId
        ? { ...e, isBookmarked: result.bookmarked }
        : e
      ));
    } catch {}
  };

  const handleGuestlist = async (eventId: string) => {
    if (!user) return;
    try {
      await joinGuestlist(eventId);
      setEvents(prev => prev.map(e => e.id === eventId
        ? { ...e, isOnGuestlist: true, guestListOpen: false }
        : e
      ));
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={32} className="text-violet-500 animate-spin" />
    </div>
  );

  return (
    <div className="pb-28">
      {events.map((event, index) => (
        <React.Fragment key={event.id}>
          <FeedPost
            event={event}
            onLike={() => handleLike(event.id)}
            onBookmark={() => handleBookmark(event.id)}
            onGuestlist={() => handleGuestlist(event.id)}
          />
          {index === 0 && <PartyMatchSuggestions events={events} />}
        </React.Fragment>
      ))}
    </div>
  );
};

const PartyMatchSuggestions = ({ events }: { events: any[] }) => (
  <div className="py-10 bg-zinc-950/40 border-y border-zinc-900 mb-6">
    <div className="px-6 mb-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Flame size={18} className="text-fuchsia-500 fill-fuchsia-500/20" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Match de Nuit</h3>
      </div>
    </div>
    <div className="flex overflow-x-auto space-x-4 px-6 no-scrollbar pb-2">
      {events.slice(0, 5).map(event => (
        <div key={event.id} className="flex-shrink-0 w-60 group">
          <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden mb-4 border border-white/5 shadow-2xl group-hover:border-violet-500/30 transition-all duration-500">
            <img src={event.image || `https://picsum.photos/seed/${event.id}/800/1000`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={event.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">{event.clubName}</p>
              <h4 className="text-base font-black text-white uppercase italic tracking-tight truncate">{event.title}</h4>
            </div>
          </div>
          <button className="w-full py-3.5 bg-zinc-900/80 backdrop-blur-md text-white border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-violet-600 hover:text-white hover:border-violet-500">
            Prendre son Pass
          </button>
        </div>
      ))}
    </div>
  </div>
);

interface FeedPostProps {
  event: PartyEvent & { likesCount?: number; isLiked?: boolean; isBookmarked?: boolean; isOnGuestlist?: boolean };
  onLike: () => void;
  onBookmark: () => void;
  onGuestlist: () => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ event, onLike, onBookmark, onGuestlist }) => {
  return (
    <div className="bg-black mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl p-[1.5px] bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-violet-600">
            <img src={event.image || `https://picsum.photos/seed/${event.id}/200/200`} className="w-full h-full rounded-[10px] object-cover border border-black" alt={event.clubName} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[13px] font-black tracking-tight uppercase text-white">{event.clubName}</span>
              <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/10" />
            </div>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em]">{event.category} • {event.date}</p>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-white transition-colors p-2"><MoreHorizontal size={20} /></button>
      </div>

      <div className="relative aspect-square bg-zinc-900 group overflow-hidden">
        <img src={event.image || `https://picsum.photos/seed/${event.id}/800/800`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[5s]" alt={event.title} />
        <div className="absolute bottom-6 left-6 right-6 bg-black/50 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1.5">{event.title}</h2>
          <div className="flex flex-wrap gap-2">
            {event.djs?.map((dj) => (
              <span key={dj} className="text-[9px] font-black text-violet-400 uppercase tracking-widest px-2 py-0.5 bg-violet-500/10 rounded-md border border-violet-500/20">{dj}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-6">
            <button onClick={onLike} className={`transition-all hover:scale-110 active:scale-90 flex items-center space-x-2 ${event.isLiked ? 'text-red-500' : 'text-white hover:text-red-400'}`}>
              <Heart size={28} strokeWidth={1.5} fill={event.isLiked ? 'currentColor' : 'none'} />
              {(event.likesCount || 0) > 0 && <span className="text-[11px] font-black">{event.likesCount}</span>}
            </button>
            <button className="text-white hover:text-fuchsia-500 transition-all hover:scale-110 active:scale-90"><MessageCircle size={28} strokeWidth={1.5} /></button>
            <button className="text-white hover:text-fuchsia-500 transition-all hover:scale-110 active:scale-90"><Send size={28} strokeWidth={1.5} /></button>
          </div>
          <button onClick={onBookmark} className={`transition-all hover:scale-110 active:scale-90 ${event.isBookmarked ? 'text-violet-400' : 'text-white hover:text-violet-400'}`}>
            <Bookmark size={28} strokeWidth={1.5} fill={event.isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {event.totalAttending && (
          <p className="text-[11px] text-zinc-500 font-bold mb-4">{event.totalAttending.toLocaleString()} personnes y vont</p>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <button className="flex items-center justify-center space-x-2.5 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors">
            <Ticket size={16} className="text-fuchsia-500" />
            <span>Pass • {event.price}€</span>
          </button>
          <button
            onClick={onGuestlist}
            disabled={!event.guestListOpen || event.isOnGuestlist}
            className={`flex items-center justify-center space-x-2.5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${event.isOnGuestlist ? 'bg-green-600 text-white' : event.guestListOpen ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 active:scale-95' : 'bg-zinc-950 border border-zinc-900 text-zinc-700 cursor-not-allowed'}`}>
            <UserPlus size={16} />
            <span>{event.isOnGuestlist ? 'Inscrit ✓' : event.guestListOpen ? 'Guestlist' : 'Complet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
