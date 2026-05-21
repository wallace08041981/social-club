import React from 'react';
import { Compass, Map, Plus, MessageCircle, User, Bell } from 'lucide-react';
import { AppTab } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const NAV_ITEMS = [
  { id: 'feed', icon: Compass, label: 'Feed' },
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'create', icon: Plus, label: 'Story' },
  { id: 'chat', icon: MessageCircle, label: 'Chat' },
  { id: 'profile', icon: User, label: 'Profil' },
] as const;

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user } = useAuth();

  return (
    <div className="relative flex flex-col w-full max-w-[430px] mx-auto min-h-screen bg-black text-white overflow-hidden">
      {/* Top bar */}
      <div className="sticky top-0 z-50 px-6 pt-12 pb-4 bg-gradient-to-b from-black via-black/90 to-transparent flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">Social Club</h1>
          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">The Nightlife Network</p>
        </div>
        <div className="flex items-center space-x-2">
          {user && (
            <div className="flex items-center space-x-2 bg-zinc-900/60 border border-white/10 rounded-2xl px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-green-400 uppercase tracking-widest max-w-[80px] truncate">{user.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
        <div className="flex items-center justify-around bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[40px] px-4 py-4 shadow-2xl pointer-events-auto">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            const isCreate = id === 'create';
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as AppTab)}
                className={`flex flex-col items-center space-y-1.5 transition-all active:scale-90 ${isCreate ? '' : ''}`}
              >
                {isCreate ? (
                  <div className="w-14 h-14 bg-white rounded-[22px] flex items-center justify-center shadow-2xl shadow-white/20 active:scale-90 transition-all border-2 border-zinc-200">
                    <Plus size={28} className="text-black" strokeWidth={2.5} />
                  </div>
                ) : (
                  <>
                    <div className={`p-2.5 rounded-2xl transition-all ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                      <Icon
                        size={22}
                        className={`transition-all ${isActive ? 'text-white' : 'text-zinc-600'}`}
                        strokeWidth={isActive ? 2.5 : 1.5}
                      />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-all ${isActive ? 'text-white' : 'text-zinc-700'}`}>{label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
