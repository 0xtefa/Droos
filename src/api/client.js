import axios from 'axios';

// Use the same host as the frontend but on port 8000 for the API
const getApiBaseUrl = () => {
  // In production, use relative URL
  if (import.meta.env.PROD) {
    return '/api';
  }
  // In development, use the current hostname with port 8000
  const hostname = window.location.hostname;
  return `http://${hostname}:8000/api`;
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
