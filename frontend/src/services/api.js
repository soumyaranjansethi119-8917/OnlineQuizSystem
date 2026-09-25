import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken, clearAuth } from '../utils/auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data and handle 401 unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Token expired or unauthorized
      if (error.response.status === 401) {
        clearAuth();
        // Redirect to login if user is not already on public auth pages
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/', '/about', '/contact'].includes(currentPath)) {
          window.location.href = '/login?expired=1';
        }
      }
      const message = error.response.data?.message || error.response.data?.error || 'A server error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Unable to connect to the backend server. Please make sure the Flask API is running.'));
    } else {
      return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
    }
  }
);

export default api;
