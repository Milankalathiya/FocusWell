import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';
// Removed unused import of useAuth

interface ErrorResponse {
  message?: string;
  details?: Record<string, string>;
}

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to call logout from AuthContext outside of React tree
let logoutFn: (() => void) | null = null;
export const setLogoutFunction = (fn: () => void) => {
  logoutFn = fn;
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - call logout from context if available
          if (logoutFn) {
            logoutFn();
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            window.location.href = '/login';
          }
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          if (logoutFn) {
            logoutFn();
          }
          toast.error(
            "Access denied. You don't have permission for this action."
          );
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 422:
          // Validation errors
          if (data && data.details) {
            Object.values(data.details).forEach((message: string) => {
              toast.error(message);
            });
          } else {
            toast.error(data?.message || 'Validation failed');
          }
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default api;
