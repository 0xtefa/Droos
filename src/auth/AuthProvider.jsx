import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../api/client';

const AuthContext = createContext();

const TOKEN_KEY = 'droos_token';
const USER_KEY = 'droos_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken) {
      setToken(savedToken);
      setAuthToken(savedToken);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const register = async (payload) => {
    const { data } = await api.post('/register', payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (payload) => {
    const { data } = await api.post('/login', payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore network errors on logout
    }
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, initialized, login, register, logout, isAuthenticated: Boolean(token) }),
    [token, user, initialized],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
