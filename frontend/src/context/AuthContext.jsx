import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('ideas_token');
    const storedUser = localStorage.getItem('ideas_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('ideas_token');
        localStorage.removeItem('ideas_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    
    if (data && data.token) {
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem('ideas_token', data.token);
      localStorage.setItem('ideas_user', JSON.stringify(data.user));

      return data.user;
    }
    throw new Error('No se recibió token del servidor.');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ideas_token');
    localStorage.removeItem('ideas_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
