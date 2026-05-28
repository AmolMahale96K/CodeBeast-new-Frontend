import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('codebeast_token');
    const savedUser = localStorage.getItem('codebeast_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('codebeast_token');
        localStorage.removeItem('codebeast_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('codebeast_token', data.token);
    localStorage.setItem('codebeast_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Welcome back!');
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('codebeast_token', data.token);
    localStorage.setItem('codebeast_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Account created successfully!');
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('codebeast_token');
    localStorage.removeItem('codebeast_user');
    setUser(null);
    toast.success('Logged out');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('codebeast_user', JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      updateUser(data);
    } catch {
      logout();
    }
  }, [updateUser, logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;