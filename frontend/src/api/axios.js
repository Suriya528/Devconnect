import axios from 'axios';
import axiosRetry from 'axios-retry';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15 second timeout
});

// Enterprise Circuit Breaker & Network Resilience
axiosRetry(instance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.warn(`[Network Retry ${retryCount}/3] Retrying request to ${requestConfig.url} due to:`, error.message);
  }
});

// Request Interceptor: Attach Auth Token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 401 Handling & Redirection
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;