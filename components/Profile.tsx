import React, { useState } from 'react';
import { Settings, Grid, Share2, Star, Ticket, Fingerprint, Music, Heart, Disc, ListMusic, Calendar, Radio, Users, Bell, Headphones, Play, ExternalLink, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EVENTS } from '../constants';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'vault' | 'sonar'>('posts');
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const { user, logout } = useAuth();

  if (!user) return null;

  const togglePlayback = (id: string) => {
    setPlayingTrack(playingTrack === id ? null : id);
  };

  return (
    <div className="flex flex-col bg-black min-h-screen text-white animate-in fade-in duration-500 pb-32">
      {/* Profile Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-2xl z-[100] border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Sonic ID</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Global Night Hub</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2.5 bg-zinc-900/80 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all"><Share2 size={18} /></button>
          <button onClick={logout} className="p-2.5 bg-zinc-900/80 border border-white/10 rounded-2xl text-zinc-400 hover:text-red-400 transition-all"><LogOut size={18} /></button>
        </div>
      </div>

      {/* Hero Profile Section */}
      <div className="px-6 flex flex-col items-center pt-8 pb-10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/10 blur-[120px] pointer-events-none"></div>
        <div className="relative mb-8 group cursor-pointer active:scale-95 transition-transform">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-violet-600 rounded-[48px] blur-lg opacity-40 group-hover:opacity-70 transition duration-700"></div>
          <div className="relative w-40 h-40 p-1.5 bg-zinc-950 rounded-[44px] border border-white/10 shadow-2xl">
            <img src={user.avatar} className="w-full h-full rounded-[38px] object-cover" alt={user.name} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-black border border-zinc-800 p-3 rounded-2xl shadow-2xl text-violet-500 border border-white/10">
            <Fingerprint size={24} strokeWidth={2.5} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-1 leading-none">{user.name}</h2>
          <p className="text-xs text-violet-400 font-black uppercase tracking-[0.3em] mt-2">{user.handle}</p>
          {user.bio && <p className="text-zinc-500 text-sm mt-3 max-w-[280px] text-center">{user.bio}</p>}
        </div>

        <div className="w-full grid grid-cols-3 gap-1 bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[40px] p-7 shadow-2xl">
          <div className="text-center">
            <p className="text-2xl font-black italic text-white tracking-tighter">{user.followersCount >= 1000 ? `${(user.followersCount / 1000).toFixed(1)}K` : user.followersCount}</p>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-2">Followers</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-2xl font-black italic text-white tracking-tighter">{user.friendsCount}</p>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-2">Amis</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black italic text-white tracking-tighter">{user.clubsVisited}</p>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-2">Clubs</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-6 mb-8 space-x-8">
        {[{ id: 'posts', label: 'Feed', icon: Grid }, { id: 'vault', label: 'Tickets', icon: Ticket }, { id: 'sonar', label: 'Sounds', icon: Disc }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 pb-4 border-b-2 transition-all ${activeTab === id ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
            <Icon size={16} />
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/30 border border-white/5 rounded-[32px] p-6 text-center">
              <Music size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-600 text-sm font-bold">Tes stories et posts apparaîtront ici</p>
            </div>
            {user.favoriteDJs && user.favoriteDJs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DJs favoris</h3>
                <div className="flex flex-wrap gap-2">
                  {user.favoriteDJs.map(dj => (
                    <span key={dj} className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest">{dj}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-4">
            {EVENTS.slice(0, 2).map(event => (
              <div key={event.id} onClick={() => setActiveTicket(activeTicket === event.id ? null : event.id)}
                className="bg-zinc-900/40 border border-white/10 rounded-[32px] p-6 cursor-pointer active:scale-[0.98] transition-transform">
                <div className="flex items-center space-x-4">
                  <img src={event.image} className="w-16 h-16 rounded-2xl object-cover" alt={event.title} />
                  <div className="flex-1">
                    <p className="text-xs font-black text-violet-400 uppercase tracking-widest">{event.clubName}</p>
                    <h4 className="text-base font-black text-white uppercase italic">{event.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold mt-1">{event.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-zinc-400">{event.price}€</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sonar' && (
          <div className="space-y-4">
            {user.soundList && user.soundList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.soundList.map(s => (
                  <span key={s} className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-2xl text-[11px] font-black text-fuchsia-400 uppercase tracking-widest">{s}</span>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/30 border border-white/5 rounded-[32px] p-6 text-center">
                <Headphones size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-600 text-sm font-bold">Tes genres musicaux apparaîtront ici</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
