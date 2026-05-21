import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';

interface AuthUser {
  id: string; name: string; email: string; handle: string;
  avatar: string; bio: string; followersCount: number;
  friendsCount: number; clubsVisited: number;
  favoriteDJs: string[]; soundList: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, handle?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch { setUser(null); }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    if (data.token) localStorage.setItem("sc_token", data.token);
  };

  const register = async (name: string, email: string, password: string, handle?: string) => {
    const data = await apiRegister(name, email, password, handle);
    setUser(data.user);
    if (data.token) localStorage.setItem("sc_token", data.token);
  };

  const logout = async () => {
    await apiLogout();
    localStorage.removeItem("sc_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
