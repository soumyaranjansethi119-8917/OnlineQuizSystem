import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getToken, setToken, getUser, setUser, clearAuth } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setCurrentUser] = useState(getUser());
  const [token, setCurrentToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Synchronize authentication state on application load
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setCurrentUser(res.data);
            setUser(res.data);
          }
        } catch (err) {
          // Token is invalid or expired
          clearAuth();
          setCurrentToken(null);
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      setCurrentToken(receivedToken);
      setCurrentUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Proceed even if network request fails
    } finally {
      clearAuth();
      setCurrentToken(null);
      setCurrentUser(null);
    }
  };

  const updateUserProfile = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setCurrentUser(merged);
    setUser(merged);
  };

  const isAuthenticated = Boolean(token && user);
  const role = user ? user.role : null;
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  const value = {
    user,
    token,
    role,
    isAuthenticated,
    isAdmin,
    isStudent,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
