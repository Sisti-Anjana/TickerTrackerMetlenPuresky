import axios from 'axios';

// Determine API base URL from environment with sensible fallbacks
// Supports Create React App style env vars (REACT_APP_*)
const apiBaseURL = (() => {
  // Check for explicit environment variable first
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Check for window variable (for runtime configuration)
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  // For production builds, always use relative path
  // This ensures Netlify redirects work properly
  if (process.env.NODE_ENV === 'production' || 
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
    return '/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:5001/api';
})();

// Debug logging for API configuration
console.log('🔧 API Configuration:', {
  apiBaseURL,
  nodeEnv: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  isProduction: process.env.NODE_ENV === 'production',
  isNotLocalhost: typeof window !== 'undefined' && window.location.hostname !== 'localhost'
});

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

