import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Feed } from './components/Feed';
import { MapExplorer } from './components/MapExplorer';
import { Profile } from './components/Profile';
import { StoryBar } from './components/StoryBar';
import { EphemeralChat } from './components/EphemeralChat';
import { CreateStory } from './components/CreateStory';
import { LiveReel } from './components/LiveReel';
import { NightScoutBot } from './components/NightScoutBot';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppTab, Story } from './types';
import { Bot } from 'lucide-react';
import { getPartyRecommendation } from './services/claudeService';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('feed');
  const [aiTip, setAiTip] = useState<string>('Scanning local nightlife frequencies...');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadAiTip = async () => {
      try {
        const tip = await getPartyRecommendation("Techno underground Paris");
        setAiTip(tip);
      } catch {
        setAiTip("La nuit ne fait que commencer.");
      }
    };
    loadAiTip();
  }, []);

  const handleTabChange = (tab: AppTab) => {
    if ((tab === 'chat' || tab === 'create') && !user) {
      setShowAuth(true);
      return;
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="flex flex-col w-full min-h-full pb-32">
            <StoryBar
              onStorySelect={(s) => setSelectedStory(s)}
              onCreateStory={() => user ? setShowCreateStory(true) : setShowAuth(true)}
            />
            <div
              onClick={() => setIsBotOpen(true)}
              className="mx-5 my-8 p-7 bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-[40px] flex items-start space-x-6 shadow-2xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/15 blur-[60px] pointer-events-none group-hover:bg-violet-600/25 transition-all"></div>
              <div className="bg-violet-600/20 p-4 rounded-2xl text-violet-500 shrink-0 border border-violet-500/30 shadow-lg shadow-violet-600/20">
                <Bot size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em] mb-2 italic">A.I. Night Scout • Powered by Claude</h4>
                <p className="text-sm text-zinc-200 font-medium italic leading-relaxed">"{aiTip}"</p>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-3 underline">Appuyer pour scanner les meilleures soirées</p>
              </div>
            </div>
            <Feed />
          </div>
        );
      case 'map':
        return <MapExplorer onProfileClick={() => setActiveTab('profile')} />;
      case 'profile':
        return user
          ? <Profile />
          : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-6">
              <div className="text-6xl">🌙</div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight text-center">Rejoins le club</h2>
              <p className="text-zinc-500 text-center text-sm">Connecte-toi pour accéder à ton profil</p>
              <button onClick={() => setShowAuth(true)} className="px-8 py-4 bg-white text-black rounded-[24px] font-black uppercase tracking-[0.3em] text-sm active:scale-95 transition-all">
                Se connecter
              </button>
            </div>
          );
      case 'chat':
        return <EphemeralChat />;
      case 'create':
        return <CreateStory />;
      default:
        return <Feed />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderContent()}

      {selectedStory && (
        <LiveReel story={selectedStory} onClose={() => setSelectedStory(null)} />
      )}

      {showCreateStory && (
        <CreateStory onClose={() => setShowCreateStory(false)} />
      )}

      <NightScoutBot isOpen={isBotOpen} onClose={() => setIsBotOpen(false)} />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {activeTab === 'map' && (
        <button
          onClick={() => setIsBotOpen(true)}
          className="absolute bottom-32 left-6 z-[1001] p-4 bg-violet-600 rounded-2xl shadow-2xl text-white active:scale-90 transition-transform border border-white/20"
        >
          <Bot size={24} />
        </button>
      )}
    </Layout>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
