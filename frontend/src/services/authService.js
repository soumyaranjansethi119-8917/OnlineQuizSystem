import api from './api';

export const authService = {
  // Register a new student
  register: async (userData) => {
    return await api.post('/register', userData);
  },

  // Login (student or admin)
  login: async (credentials) => {
    return await api.post('/login', credentials);
  },

  // Logout
  logout: async () => {
    return await api.post('/logout');
  },

  // Get current user profile and quick stats
  getMe: async () => {
    return await api.get('/me');
  },

  // Update profile name
  updateProfile: async (data) => {
    return await api.put('/profile', data);
  },

  // Change password
  changePassword: async (passwords) => {
    return await api.put('/change-password', passwords);
  },
};
