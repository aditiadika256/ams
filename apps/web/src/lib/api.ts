import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, User, RegisterData } from '../types/auth';
import { Program, Order, CreateOrderPayload } from '../types/sales';
import { ExamSession, Question, ExamResult } from '../types/cbt';
import { Menu } from '../types/system';
import { ColorPalette, ColorPaletteFormData } from '../types/theme';
import { clearBrowserSession } from './session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Normalize API URL (remove trailing slash if exists)
const normalizedApiUrl = API_URL.replace(/\/$/, '');

type ApiErrorResponse = ApiResponse & {
  error?: string;
};

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
const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);
let dataRevision = 0;

function buildDedupeKey(url: string, params?: any): string {
  const p = params ? JSON.stringify(params) : '';
  return `${dataRevision}:${url}?${p}`;
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
    if (config.method?.toLowerCase() === 'get' && dataRevision > 0) {
      config.params = {
        ...(config.params || {}),
        __data_revision: dataRevision,
      };
    }

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
    const method = response.config.method?.toLowerCase();
    if (method && MUTATION_METHODS.has(method)) {
      dataRevision += 1;
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
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
        clearBrowserSession();

        // Only redirect if not already on login page
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login?reason=session_expired';
        }
      }
    }

    // Handle 422 Validation errors - Extract error messages
    if (error.response.status === 422 && error.response.data?.errors) {
      const validationErrors = error.response.data.errors;
      const firstError = Object.values(validationErrors)[0];
      const detailMessage = Array.isArray(firstError)
        ? firstError[0]
        : firstError || error.response.data.message || 'Validation failed';
      
      const customError = new Error(detailMessage) as any;
      customError.errors = validationErrors;
      customError.status = 422;
      return Promise.reject(customError);
    }

    // Handle other HTTP errors
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      error.message ||
      `API request failed with status ${error.response.status}`;
    const requestError = new Error(message) as Error & { status?: number };
    requestError.status = error.response.status;
    return Promise.reject(requestError);
  }
);

// API methods
export const apiClient = {
  // Auth endpoints
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await api.post<ApiResponse<{
        user: User;
        token: string;
        expires_at?: string | null;
      }>>('/auth/login', credentials);
      return response.data;
    },

    register: async (data: RegisterData) => {
      const response = await api.post<ApiResponse<{
        user: User;
        token: string;
        expires_at?: string | null;
      }>>('/auth/register', data);
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
      await api.delete(`/programs/${id}`);
    },

    getOrders: async (params?: any) => {
      const response = await api.get<ApiResponse<Order[]>>('/orders', { params });
      return response.data;
    },

    getOrder: async (id: number | string, options?: { fresh?: boolean }) => {
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`, {
        params: options?.fresh ? { __fresh: Date.now() } : undefined,
      });
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

  // CMS endpoints
  cms: {
    posts: {
      list: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
        const response = await api.get<ApiResponse<any>>('/cms/posts', { params });
        return response.data;
      },
      create: async (payload: { title: string; content: string; status: string }) => {
        const response = await api.post<ApiResponse<any>>('/cms/posts', payload);
        return response.data;
      },
      update: async (id: number, payload: { title: string; content: string; status: string }) => {
        const response = await api.put<ApiResponse<any>>(`/cms/posts/${id}`, payload);
        return response.data;
      },
      remove: async (id: number) => {
        const response = await api.delete<ApiResponse<null>>(`/cms/posts/${id}`);
        return response.data;
      },
    },
    pages: {
      remove: async (id: number) => {
        const response = await api.delete<ApiResponse<null>>(`/cms/pages/${id}`);
        return response.data;
      },
    },
  },

  // Learning endpoints
  learning: {
    mentors: {
      candidates: async () => {
        const response = await api.get<ApiResponse<Array<{
          id: number;
          name: string;
          email: string;
          roles: Array<{ id: number; name: string }>;
        }>>>('/learning/mentor-candidates');
        return response.data;
      },
      remove: async (id: number) => {
        const response = await api.delete(`/learning/mentors/${id}`);
        return response.data;
      },
    },
    schedules: {
      remove: async (mentorId: number, scheduleId: number) => {
        const response = await api.delete(`/learning/mentors/${mentorId}/schedules/${scheduleId}`);
        return response.data;
      },
    },
    curriculum: {
      modules: {
        remove: async (id: number) => {
          const response = await api.delete(`/learning/modules/${id}`);
          return response.data;
        },
      },
      lessons: {
        remove: async (id: number) => {
          const response = await api.delete(`/learning/lessons/${id}`);
          return response.data;
        },
      },
    },
  },

  // Finance endpoints
  finance: {
    transactions: {
      remove: async (id: number) => {
        const response = await api.delete(`/finance/transactions/${id}`);
        return response.data;
      },
    },
    invoices: {
      remove: async (id: number) => {
        const response = await api.delete(`/finance/invoices/${id}`);
        return response.data;
      },
    },
  },

  // Theme endpoints
  theme: {
    palettes: {
      list: async () => {
        const response = await api.get<ColorPalette[]>('/admin/theme/palettes');
        return response.data;
      },
      active: async () => {
        const response = await api.get<ColorPalette>('/theme/palettes/active');
        return response.data;
      },
      create: async (payload: ColorPaletteFormData) => {
        const response = await api.post<ColorPalette>('/admin/theme/palettes', payload);
        return response.data;
      },
      update: async (id: number, payload: ColorPaletteFormData) => {
        const response = await api.put<ColorPalette>(`/admin/theme/palettes/${id}`, payload);
        return response.data;
      },
      setDefault: async (id: number) => {
        const response = await api.post<ColorPalette>(`/admin/theme/palettes/${id}/default`);
        return response.data;
      },
      remove: async (id: number) => {
        const response = await api.delete(`/admin/theme/palettes/${id}`);
        return response.data;
      },
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
      list: async (params?: { guard_name?: 'web' | 'sanctum' }) => {
        const response = await api.get<ApiResponse<any[]>>('/admin/roles', { params });
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

