import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { apiClient } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.login(credentials);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // Store token in localStorage (will be handled by persist middleware)
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', token);
            }
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          // Handle validation errors (object) vs regular errors (string)
          let errorMessage = 'Login failed. Please check your credentials.';
          
          if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            // Handle validation errors object
            const firstError = Object.values(error)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0] as string;
            }
          }
          
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          // Note: Register endpoint doesn't exist yet, but we'll prepare for it
          // For now, we can create user and then login
          // This will be implemented when backend register endpoint is ready
          throw new Error('Register endpoint not implemented yet');
        } catch (error: any) {
          const errorMessage = error?.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Call logout API if token exists
          if (get().token) {
            await apiClient.auth.logout();
          }
        } catch (error) {
          // Even if API call fails, clear local state
          console.error('Logout error:', error);
        } finally {
          // Clear state and localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchUser: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.me();
          
          if (response.success && response.data) {
            set({
              user: response.data as User,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('Failed to fetch user');
          }
        } catch (error: any) {
          // If fetch fails, clear auth state
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error?.message || 'Failed to fetch user',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : null)),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

