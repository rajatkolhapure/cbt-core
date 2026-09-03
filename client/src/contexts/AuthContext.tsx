import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import type { User } from '../types';
import { collectAndSendHardwareProfile } from '../services/hardwareTelemetry';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, candidateId?: string) => Promise<User>;
  verifyOtpAndLogin: (data: { email: string; code: string; name: string; password: string; candidateId?: string }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cbt_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('cbt_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Validate session on mount
    const checkAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        localStorage.setItem('cbt_user', JSON.stringify(res.data.user));
        // Silently refresh hardware telemetry on active session restore
        collectAndSendHardwareProfile().catch(() => {});
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem('cbt_user');
        localStorage.removeItem('cbt_token');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('cbt_user', JSON.stringify(user));
    localStorage.setItem('cbt_token', token);

    // Immediately trigger pre-exam hardware & VM fingerprinting post-login
    await collectAndSendHardwareProfile().catch(() => {});

    return user;
  };

  const register = async (name: string, email: string, password: string, candidateId?: string) => {
    const res = await api.post('/auth/register', { name, email, password, candidateId });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('cbt_user', JSON.stringify(user));
    localStorage.setItem('cbt_token', token);

    await collectAndSendHardwareProfile().catch(() => {});

    return user;
  };

  const verifyOtpAndLogin = async (data: { email: string; code: string; name: string; password: string; candidateId?: string }) => {
    const res = await api.post('/auth/verify-otp', data);
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('cbt_user', JSON.stringify(user));
    localStorage.setItem('cbt_token', token);

    await collectAndSendHardwareProfile().catch(() => {});

    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cbt_user');
      localStorage.removeItem('cbt_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyOtpAndLogin,
        logout,
        setUser,
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

export default AuthContext;
