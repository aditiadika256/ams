import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, User, RegisterData } from '../types/auth';
import { Program, Order, CreateOrderPayload } from '../types/sales';
import { ExamSession, Question, ExamResult } from '../types/cbt';
import { Menu } from '../types/system';

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

// ---- GET request deduplication ----
// Shares a single in-flight promise for identical concurrent GET requests
const inflightGets = new Map<string, Promise<any>>();

function buildDedupeKey(url: string, params?: any): string {
  const p = params ? JSON.stringify(params) : '';
  return `${url}?${p}`;
}

/**
 * Deduplicated GET — if an identical GET is already in-flight, returns the
 * same promise instead of firing another network request.
 */
export function deduplicatedGet<T>(url: string, config?: { params?: any }): Promise<{ data: T }> {
  const key = buildDedupeKey(url, config?.params);

  if (inflightGets.has(key)) {
    return inflightGets.get(key)!;
  }

  const promise = api.get<T>(url, config).finally(() => {
    inflightGets.delete(key);
  });

  inflightGets.set(key, promise);
  return promise;
}

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
        // Clear token, user, and Zustand auth-storage
        localStorage.removeItem('auth-storage');
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
      const validationErrors = error.response.data.errors;
      const firstError = Object.values(validationErrors)[0];
      const detailMessage = Array.isArray(firstError) && firstError.length > 0
        ? firstError[0]
        : 'Validation failed';
      
      const customError = new Error(detailMessage) as any;
      customError.errors = validationErrors;
      customError.status = 422;
      return Promise.reject(customError);
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
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
      return response.data;
    },

    register: async (data: RegisterData) => {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
      return response.data;
    },

    googleRedirect: async () => {
      const response = await api.get<ApiResponse<string>>('/auth/google');
      return response.data;
    },

    logout: async () => {
      const response = await api.post<ApiResponse>('/auth/logout');
      return response.data;
    },

    me: async () => {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data;
    },
  },

  // Sales endpoints
  sales: {
    getPrograms: async (params?: any) => {
      const response = await api.get<ApiResponse<Program[]>>('/programs', { params });
      return response.data;
    },

    getProgram: async (id: number | string) => {
      const response = await api.get<ApiResponse<Program>>(`/programs/${id}`);
      return response.data;
    },

    createProgram: async (payload: any) => {
      const response = await api.post<ApiResponse<Program>>('/programs', payload);
      return response.data;
    },

    updateProgram: async (id: number | string, payload: any) => {
      const response = await api.put<ApiResponse<Program>>(`/programs/${id}`, payload);
      return response.data;
    },

    deleteProgram: async (id: number | string) => {
      const response = await api.delete<ApiResponse<any>>(`/programs/${id}`);
      return response.data;
    },

    getOrders: async (params?: any) => {
      const response = await api.get<ApiResponse<Order[]>>('/orders', { params });
      return response.data;
    },

    getOrder: async (id: number | string) => {
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      return response.data;
    },

    createOrder: async (payload: CreateOrderPayload) => {
      const response = await api.post<ApiResponse<Order>>('/orders', payload);
      return response.data;
    },
  },

  // CBT endpoints
  cbt: {
    getPackages: async () => {
      const response = await api.get<ApiResponse<any[]>>('/exams/packages');
      return response.data;
    },
    getPackage: async (id: number | string) => {
      const response = await api.get<ApiResponse<any>>(`/exams/packages/${id}`);
      return response.data;
    },
    startExam: async (packageId: number) => {
      const response = await api.post<ApiResponse<ExamSession>>('/exams/start', { package_id: packageId });
      return response.data;
    },

    getQuestions: async (attemptId: number) => {
      const response = await api.get<ApiResponse<Question[]>>(`/exams/${attemptId}/questions`);
      return response.data;
    },

    saveAnswer: async (attemptId: number, questionId: number, answer: string) => {
      const response = await api.post<ApiResponse<null>>(`/exams/${attemptId}/answers`, {
        question_id: questionId,
        answer,
      });
      return response.data;
    },

    submitExam: async (attemptId: number) => {
      const response = await api.post<ApiResponse<{ score: number; submitted_at: string }>>(`/exams/${attemptId}/submit`);
      return response.data;
    },

    getResult: async (attemptId: number) => {
      const response = await api.get<ApiResponse<ExamResult>>(`/exams/${attemptId}/result`);
      return response.data;
    },

    logEvent: async (attemptId: number, type: string, meta?: any) => {
      const response = await api.post<ApiResponse<any>>(`/exams/${attemptId}/log`, { type, meta });
      return response.data;
    },

    heartbeat: async (attemptId: number) => {
      const response = await api.post<ApiResponse<any>>(`/exams/${attemptId}/heartbeat`);
      return response.data;
    },
  },

  // Menus endpoints
  menus: {
    get: async (params?: { layout?: 'users' | 'admin'; section?: 'topbar' | 'bottomnavigation' | 'sidebar' | 'header' }) => {
      const response = await deduplicatedGet<ApiResponse<Menu[]>>('/menus', { params });
      return response.data;
    },
  },

  // Admin endpoints
  admin: {
    branches: {
      list: async () => {
        const response = await api.get<ApiResponse<any[]>>('/admin/branches');
        return response.data;
      },
    },
    users: {
      list: async (params?: { page?: number; limit?: number; search?: string; role?: string; branch_id?: number; fields?: string }) => {
        const response = await api.get<ApiResponse<any>>('/admin/users', { params });
        return response.data;
      },
      create: async (payload: any) => {
        const response = await api.post<ApiResponse<any>>('/admin/users', payload);
        return response.data;
      },
      get: async (id: number) => {
        const response = await api.get<ApiResponse<any>>(`/admin/users/${id}`);
        return response.data;
      },
      update: async (id: number, payload: any) => {
        const response = await api.put<ApiResponse<any>>(`/admin/users/${id}`, payload);
        return response.data;
      },
      remove: async (id: number) => {
        const response = await api.delete<ApiResponse<any>>(`/admin/users/${id}`);
        return response.data;
      },
    },
    menus: {
      list: async (params?: { layout?: 'users' | 'admin'; section?: 'topbar' | 'bottomnavigation' | 'sidebar' | 'header' }) => {
        const response = await api.get<ApiResponse<Menu[]>>('/admin/menus', { params });
        return response.data;
      },
      create: async (payload: Partial<Menu>) => {
        const response = await api.post<ApiResponse<Menu>>('/admin/menus', payload);
        return response.data;
      },
      update: async (id: number, payload: Partial<Menu>) => {
        const response = await api.put<ApiResponse<Menu>>(`/admin/menus/${id}`, payload);
        return response.data;
      },
      remove: async (id: number) => {
        const response = await api.delete(`/admin/menus/${id}`);
        return response.data;
      },
    },
    roles: {
      list: async () => {
        const response = await api.get<ApiResponse<any[]>>('/admin/roles');
        return response.data;
      },
      create: async (payload: { name: string; permissions?: string[] }) => {
        const response = await api.post<ApiResponse<any>>('/admin/roles', payload);
        return response.data;
      },
      update: async (id: number, payload: { name?: string; permissions?: string[] }) => {
        const response = await api.put<ApiResponse<any>>(`/admin/roles/${id}`, payload);
        return response.data;
      },
      remove: async (id: number) => {
        const response = await api.delete<ApiResponse<any>>(`/admin/roles/${id}`);
        return response.data;
      },
      permissions: {
        list: async () => {
          const response = await api.get<ApiResponse<any[]>>('/admin/permissions');
          return response.data;
        }
      }
    }
  },
};

export default api;

