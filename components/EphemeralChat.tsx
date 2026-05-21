import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, Zap, Ghost, Timer } from 'lucide-react';
import { Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000;

export const EphemeralChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit('join_chat', 'global');

    // Authenticate socket
    const token = localStorage.getItem('sc_token');
    if (token) socketRef.current.emit('authenticate', token);

    socketRef.current.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { socketRef.current?.disconnect(); };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !user) return;
    socketRef.current?.emit('send_message', {
      text: inputText,
      room: 'global',
      senderName: user.name,
      senderAvatar: user.avatar,
    });
    setInputText('');
  };

  const getRemainingTimeStr = (timestamp: number) => {
    const elapsed = now - timestamp;
    const remaining = EXPIRATION_TIME_MS - elapsed;
    if (remaining <= 0) return 'Expiré';
    const hours = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m`;
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const activeMessages = messages.filter(m => now - m.timestamp < EXPIRATION_TIME_MS);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-black">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-black/90 backdrop-blur-2xl flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shadow-violet-600/30">
            <Ghost size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase italic tracking-tight text-white leading-none">Ephemeral Chat</h2>
            <p className="text-[9px] font-black text-violet-400 uppercase tracking-[0.3em] mt-1">Messages disparaissent en 24h • Global</p>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-3 bg-zinc-900/50 border border-white/5 rounded-2xl px-4 py-3">
          <Lock size={12} className="text-green-500" />
          <span className="text-[10px] font-bold text-zinc-500">Chiffrés de bout en bout • Autodestruction</span>
          <div className="ml-auto flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 no-scrollbar">
        {activeMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
            <Ghost size={48} className="text-white" />
            <p className="text-zinc-500 text-sm font-bold text-center">Sois le premier à écrire dans le void</p>
          </div>
        )}
        {activeMessages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end space-x-3`}>
              {!isMe && (
                <img src={msg.senderAvatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${msg.senderId}`}
                  className="w-8 h-8 rounded-xl object-cover border border-white/10 flex-shrink-0" alt={msg.senderName} />
              )}
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col space-y-1`}>
                {!isMe && (
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{msg.senderName}</span>
                )}
                <div className={`px-5 py-3 rounded-[24px] ${isMe
                  ? 'bg-white text-black rounded-br-lg'
                  : 'bg-zinc-900 border border-white/10 text-white rounded-bl-lg'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                </div>
                <div className={`flex items-center space-x-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} px-1`}>
                  <Timer size={9} className="text-zinc-700" />
                  <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                    {getRemainingTimeStr(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-5 py-4 bg-black border-t border-white/5">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder={user ? "Envoyer dans le void..." : "Connecte-toi pour chatter"}
              disabled={!user}
              className="w-full bg-zinc-900 border border-white/10 rounded-[24px] py-4 px-6 text-sm text-white focus:border-violet-500 outline-none transition-all placeholder:text-zinc-700 disabled:opacity-40"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !user}
            className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center text-black active:scale-90 transition-all disabled:opacity-30 shadow-2xl"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
