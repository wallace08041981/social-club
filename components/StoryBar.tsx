import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Story } from '../types';
import { getStories } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface StoryBarProps {
  onStorySelect: (story: Story) => void;
  onCreateStory?: () => void;
}

export const StoryBar: React.FC<StoryBarProps> = ({ onStorySelect, onCreateStory }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    getStories().then(setStories).catch(() => {});
  }, []);

  return (
    <div className="flex overflow-x-auto space-x-4 px-5 py-4 no-scrollbar">
      {/* Add Story Button */}
      <div className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group" onClick={onCreateStory}>
        <div className="w-16 h-16 rounded-[22px] bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center group-hover:border-violet-500 group-active:scale-95 transition-all">
          {user ? (
            <div className="relative">
              <img src={user.avatar} className="w-14 h-14 rounded-[20px] object-cover" alt={user.name} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center border border-black">
                <Plus size={10} className="text-white" />
              </div>
            </div>
          ) : (
            <Plus size={22} className="text-zinc-500 group-hover:text-violet-400 transition-colors" />
          )}
        </div>
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate max-w-[64px] text-center">
          {user ? 'Ta story' : 'Connexion'}
        </span>
      </div>

      {/* Story items */}
      {stories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group active:scale-95 transition-transform"
          onClick={() => onStorySelect(story)}
        >
          <div className={`w-16 h-16 rounded-[22px] p-[2px] ${story.isLive ? 'bg-gradient-to-tr from-red-600 via-fuchsia-600 to-violet-600' : 'bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-violet-600'}`}>
            <div className="w-full h-full rounded-[20px] overflow-hidden border-[2px] border-black">
              <img src={story.userAvatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={story.userName} />
            </div>
          </div>
          <div className="flex flex-col items-center">
            {story.isLive && (
              <span className="text-[7px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 mb-0.5">LIVE</span>
            )}
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[64px] text-center">{story.userName}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
