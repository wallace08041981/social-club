
import React, { useState } from 'react';
import { X, Heart, MessageSquare, Send, MoreVertical, Music, Radio, UserPlus } from 'lucide-react';
import { Story } from '../types';

interface LiveReelProps {
  story: Story;
  onClose: () => void;
}

export const LiveReel: React.FC<LiveReelProps> = ({ story, onClose }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
      {/* Immersive Vertical Media */}
      <div className="relative w-full h-full max-w-md bg-zinc-900 overflow-hidden shadow-2xl">
        <img 
          src={story.content} 
          className="w-full h-full object-cover" 
          alt="Live Reel" 
        />
        
        {/* Overlay Darken */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>

        {/* Top Controls */}
        <div className="absolute top-8 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl p-[1.5px] bg-gradient-to-tr from-fuchsia-600 to-cyan-500">
              <img src={story.userAvatar} className="w-full h-full rounded-[10px] object-cover" />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-tight">{story.userName}</p>
              <div className="flex items-center space-x-2">
                <Radio size={12} className="text-red-500 animate-pulse" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Now</span>
              </div>
            </div>
            <button className="px-4 py-1.5 bg-white text-black text-[9px] font-black uppercase rounded-full tracking-widest ml-2">Follow</button>
          </div>
          <button onClick={onClose} className="p-2 bg-black/40 backdrop-blur-xl rounded-full text-white">
            <X size={24} />
          </button>
        </div>

        {/* Right Action Bar (TikTok Style) */}
        <div className="absolute right-4 bottom-32 flex flex-col space-y-6 items-center">
          <button onClick={() => setLiked(!liked)} className="flex flex-col items-center group">
            <div className={`p-4 rounded-full backdrop-blur-xl transition-all ${liked ? 'bg-red-600/20 text-red-500' : 'bg-black/40 text-white'}`}>
              <Heart size={28} className={liked ? 'fill-red-500' : ''} />
            </div>
            <span className="text-[10px] font-black mt-2">12.4k</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="p-4 bg-black/40 rounded-full backdrop-blur-xl text-white">
              <MessageSquare size={28} />
            </div>
            <span className="text-[10px] font-black mt-2">842</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="p-4 bg-black/40 rounded-full backdrop-blur-xl text-white">
              <Send size={28} />
            </div>
            <span className="text-[10px] font-black mt-2">Share</span>
          </button>

          <button className="p-4 bg-black/40 rounded-full backdrop-blur-xl text-white">
            <MoreVertical size={28} />
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-10 left-6 right-20 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Music size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest animate-marquee whitespace-nowrap overflow-hidden">
               Original Audio - {story.userName} @ Pacha Ibiza
            </span>
          </div>
          <p className="text-white text-sm font-medium leading-relaxed drop-shadow-lg">
             Best set of the summer! Carola is absolutely killing it. Don't miss the 3am surprise set! 🔥🔥 #ibiza2026 #liveshow
          </p>
          <div className="flex items-center space-x-2">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => <img key={i} src={`https://i.pravatar.cc/50?u=${i}`} className="w-6 h-6 rounded-full border border-black" />)}
             </div>
             <span className="text-[10px] font-bold text-white/60">3.4k people watching</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-2 left-2 right-2 flex space-x-1">
          <div className="h-[2px] bg-white rounded-full flex-1"></div>
          <div className="h-[2px] bg-white/30 rounded-full flex-1"></div>
          <div className="h-[2px] bg-white/30 rounded-full flex-1"></div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}} />
    </div>
  );
};
