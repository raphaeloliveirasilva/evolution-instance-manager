import axios from 'axios';

const api = axios.create({
  // Tenta ler da variável global injetada pelo Docker, se não existir (dev), usa localhost
  baseURL: window._env_?.VITE_API_URL || 'http://localhost:3000', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@manager:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;