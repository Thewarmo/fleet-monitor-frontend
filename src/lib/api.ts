import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const CACHE_PREFIX = 'api_cache_';
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method === 'get') {
      const url = config.url || '';
      const cachedData = localStorage.getItem(CACHE_PREFIX + url);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
          console.log('Serving from cache:', url);
          config.adapter = (config) => {
            return new Promise((resolve) => {
              resolve({
                data: data,
                status: 200,
                statusText: 'OK',
                headers: config.headers,
                config: config,
              });
            });
          };
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      const url = response.config.url || '';
      localStorage.setItem(CACHE_PREFIX + url, JSON.stringify({ data: response.data, timestamp: Date.now() }));
      console.log('Cached response for:', url);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized: Token expired or invalid.');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;