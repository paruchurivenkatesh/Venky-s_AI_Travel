import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string, lang?: string) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  quickDemoLogin: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('venkys_token');
    if (token) {
      api.auth.getMe()
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('venkys_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    localStorage.setItem('venkys_token', res.access_token);
    setUser(res.user);
  };

  const register = async (email: string, pass: string, name?: string, lang?: string) => {
    const res = await api.auth.register({ email, password: pass, full_name: name, language_pref: lang });
    localStorage.setItem('venkys_token', res.access_token);
    setUser(res.user);
  };

  const quickDemoLogin = async () => {
    const demoEmail = 'venky.traveler@example.com';
    const demoPass = 'VenkyTravel2026!';
    try {
      await login(demoEmail, demoPass);
    } catch {
      // If demo user not yet created, register them
      await register(demoEmail, demoPass, 'Venky Traveler', 'English');
    }
  };

  const logout = () => {
    localStorage.removeItem('venkys_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, quickDemoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
