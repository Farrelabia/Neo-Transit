import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const SESSION_DURATION_MS = 60 * 60 * 1000;       // 1 hour
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;      // check every 1 min
const STORAGE_KEY = 'neo_user';

function readEnvelope() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.user || typeof parsed.expiresAt !== 'number') {
      // Old-shape (bare user object) or corrupt — treat as expired, clean up
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const env = readEnvelope();
    return env ? env.user : null;
  });

  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSessionExpired = () => setSessionExpired(false);

  useEffect(() => {
    if (!user) return;
    const tick = () => {
      const env = readEnvelope();
      if (!env) {
        setUser(null);
        setSessionExpired(true);
      }
    };
    const intervalId = setInterval(tick, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const envelope = { user: res.data, expiresAt: Date.now() + SESSION_DURATION_MS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    setSessionExpired(false);
    setUser(res.data);
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, sessionExpired, clearSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
