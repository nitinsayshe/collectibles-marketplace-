import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Read token from localStorage directly to avoid SSR issues with zustand persist
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('marketplace-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('marketplace-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
