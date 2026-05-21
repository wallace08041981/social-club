import React, { useState } from 'react';
import { X, Mail, Lock, User, AtSign, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', handle: '' });
  const { login, register } = useAuth();

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.handle || undefined);
      }
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center px-6 animate-in fade-in duration-300">
      <button onClick={onClose} className="absolute top-12 right-6 p-3 bg-white/5 rounded-2xl text-white">
        <X size={22} />
      </button>

      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-violet-600/40 border border-white/20">
            <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Social Club</h1>
          <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em]">The Ultimate Nightlife Network</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900/50 border border-white/10 rounded-2xl p-1">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${mode === m ? 'bg-white text-black shadow-lg' : 'text-zinc-500'}`}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input type="text" placeholder="Nom complet" value={form.name} onChange={e => update('name', e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-violet-500 outline-none" />
              </div>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input type="text" placeholder="@handle (optionnel)" value={form.handle} onChange={e => update('handle', e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-violet-500 outline-none" />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input type="email" placeholder="Email" value={form.email} onChange={e => update('email', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-violet-500 outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input type="password" placeholder="Mot de passe" value={form.password} onChange={e => update('password', e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-violet-500 outline-none" />
          </div>
        </div>

        {error && (
          <p className="text-[12px] text-red-400 text-center font-bold bg-red-500/10 border border-red-500/20 rounded-2xl py-3 px-4">{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading || !form.email || !form.password}
          className="w-full py-5 bg-white text-black rounded-[28px] text-[13px] font-black uppercase tracking-[0.3em] flex items-center justify-center space-x-3 shadow-2xl active:scale-95 transition-all disabled:opacity-30">
          {loading ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
          <span>{mode === 'login' ? 'Entrer dans la nuit' : 'Rejoindre le club'}</span>
        </button>

        <p className="text-center text-[11px] text-zinc-600">
          En continuant, vous acceptez les Conditions d'utilisation
        </p>
      </div>
    </div>
  );
};
