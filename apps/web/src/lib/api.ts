import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Normalize API URL (remove trailing slash if exists)
const normalizedApiUrl = API_URL.replace(/\/$/, '');

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: `${normalizedApiUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      let message = 'Network error: Unable to connect to server';
      
      if (error.code === 'ERR_NETWORK') {
        message = 'Network error: Cannot connect to API server. Please check if the server is running.';
      } else if (error.code === 'ECONNREFUSED') {
        message = 'Connection refused: The API server is not running or not accessible.';
      } else if (error.request) {
        message = 'Network error: No response from server. Please check your connection and ensure the API server is running.';
      }
      
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        }
      });
      
      return Promise.reject(new Error(message));
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
    }

    // Handle 422 Validation errors - Extract error messages
    if (error.response.status === 422 && error.response.data?.errors) {
      return Promise.reject(error.response.data.errors);
    }

    // Handle other HTTP errors
    const message = error.response.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// API methods
export const apiClient = {
  // Auth endpoints
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', credentials);
      return response.data;
    },
    
    logout: async () => {
      const response = await api.post<ApiResponse>('/auth/logout');
      return response.data;
    },
    
    me: async () => {
      const response = await api.get<ApiResponse<any>>('/auth/me');
      return response.data;
    },
  },
};

export default api;

