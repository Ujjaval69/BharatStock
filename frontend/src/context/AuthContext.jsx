import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('bs_token'));
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme State (Premium UI Upgrade)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('bs_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadMe = useCallback(async (tok) => {
    try {
      const data = await api.me(tok);
      setUser(data.user);
      setBusiness(data.business);
    } catch {
      // token invalid/expired
      localStorage.removeItem('bs_token');
      setToken(null);
      setUser(null);
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadMe(token);
    } else {
      setLoading(false);
    }
  }, [token, loadMe]);

  const login = async (businessId, email, password) => {
    const data = await api.login({ businessId, email, password });
    localStorage.setItem('bs_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const registerBusiness = async (payload) => {
    const data = await api.registerBusiness(payload);
    localStorage.setItem('bs_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    return data.business;
  };

  const logout = () => {
    localStorage.removeItem('bs_token');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const updateBusiness = async (payload) => {
    const updated = await api.updateBusiness(token, payload);
    setBusiness(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        business,
        loading,
        theme,
        toggleTheme,
        login,
        registerBusiness,
        logout,
        updateBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
