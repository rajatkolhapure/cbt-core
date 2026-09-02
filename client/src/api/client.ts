import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject Authorization header if stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cbt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 unauthenticated globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not already on /login, can optionally redirect or clear token
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('cbt_token');
        localStorage.removeItem('cbt_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
