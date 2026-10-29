import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sub_optimizer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sub_optimizer_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sub_optimizer_token');
      if (storedToken) {
        try {
          const res = await api.getCurrentUser();
          setUser(res.user);
          localStorage.setItem('sub_optimizer_user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('Session verification failed, clearing auth storage');
          localStorage.removeItem('sub_optimizer_token');
          localStorage.removeItem('sub_optimizer_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('sub_optimizer_token', res.token);
    localStorage.setItem('sub_optimizer_user', JSON.stringify(res.user));
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('sub_optimizer_token', res.token);
    localStorage.setItem('sub_optimizer_user', JSON.stringify(res.user));
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('sub_optimizer_token');
    localStorage.removeItem('sub_optimizer_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
      localStorage.setItem('sub_optimizer_user', JSON.stringify(res.user));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
