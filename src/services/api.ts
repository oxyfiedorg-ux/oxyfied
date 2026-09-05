import axios from 'axios';

// Get API URL from env, falling back to local server in development or relative /api in production
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to attach JWT auth tokens to every call
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('Oxyfied_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally (e.g. token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Do not redirect if the failed request was login/auth attempt
        const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
        if (!isAuthRequest) {
          console.warn('Unauthorized request - session expired or invalid. Redirecting to login.');
          localStorage.removeItem('Oxyfied_user');
          localStorage.removeItem('Oxyfied_token');
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
