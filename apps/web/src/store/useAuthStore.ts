import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { apiClient } from '../lib/api';
import {
  clearBrowserSession,
  readBrowserSession,
  startBrowserSession,
} from '../lib/session';
import { alertActions } from './useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';

function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('auth-storage');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  clearBrowserSession();
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  handleGoogleCallback: (token: string, expiresAt?: string | null) => Promise<void>;
  logout: (options?: { silent?: boolean }) => Promise<void>;
  clearLocalSession: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;

  // Helpers
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      hasPermission: (permission: string | string[]) => {
        const { user } = get();
        if (!user || !user.permissions) return false;

        if (Array.isArray(permission)) {
          return permission.some(p => user.permissions.includes(p));
        }
        return user.permissions.includes(permission);
      },

      hasRole: (role: string | string[]) => {
        const { user } = get();
        if (!user || !user.roles) return false;

        if (Array.isArray(role)) {
          return role.some(r => user.roles.includes(r));
        }
        return user.roles.includes(role);
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.login(credentials);

          if (response.success && response.data) {
            const { user, token, expires_at: expiresAt } = response.data;

            // Store token in localStorage (will be handled by persist middleware)
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', token);
              startBrowserSession(expiresAt);
            }

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            alertActions.success(
              'Login berhasil',
              `Selamat datang kembali, ${user.name}.`
            );
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          // Handle validation errors (object) vs regular errors (string)
          const errorMessage = getErrorMessage(
            error,
            'Login gagal. Periksa kembali email dan password Anda.'
          );

          set({
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
          alertActions.error('Login gagal', errorMessage);
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.register(data);

          if (response.success && response.data) {
            const { user, token, expires_at: expiresAt } = response.data;

            if (typeof window !== 'undefined') {
              localStorage.setItem('token', token);
              startBrowserSession(expiresAt);
            }

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            alertActions.success(
              'Registrasi berhasil',
              `Akun ${user.name} berhasil dibuat.`
            );
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error: any) {
          const errorMessage = getErrorMessage(
            error,
            'Registrasi gagal. Periksa kembali data akun Anda.'
          );

          set({
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
          alertActions.error('Registrasi gagal', errorMessage);
          throw error;
        }
      },

      handleGoogleCallback: async (token: string, expiresAt?: string | null) => {
        set({ isLoading: true, error: null });
        try {
          // Persist the token received from the OAuth redirect
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            startBrowserSession(expiresAt);
          }
          set({ token });

          // Fetch full user profile using the new token
          const response = await apiClient.auth.me();

          if (response.success && response.data) {
            set({
              user: response.data as User,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            alertActions.success(
              'Login Google berhasil',
              `Selamat datang, ${response.data.name}.`
            );
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error: any) {
          // Clean up on failure
          if (typeof window !== 'undefined') {
            clearStoredAuth();
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          alertActions.error(
            'Login Google gagal',
            getErrorMessage(error, 'Autentikasi Google gagal diselesaikan.')
          );
          throw error;
        }
      },

      logout: async (options) => {
        set({ isLoading: true });
        let logoutError: unknown = null;
        try {
          // Call logout API if token exists
          if (get().token) {
            await apiClient.auth.logout();
          }
        } catch (error) {
          // Even if API call fails, clear local state
          console.error('Logout error:', error);
          logoutError = error;
        } finally {
          // Clear state and localStorage
          clearStoredAuth();

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          if (!options?.silent) {
            if (logoutError) {
              alertActions.error(
                'Logout tidak tersinkronisasi',
                getErrorMessage(logoutError, 'Sesi lokal telah ditutup, tetapi server tidak merespons.')
              );
            } else {
              alertActions.success('Logout berhasil', 'Anda telah berhasil keluar.');
            }
          }
        }
      },

      clearLocalSession: () => {
        clearStoredAuth();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      fetchUser: async () => {
        const { token } = get();

        if (!token) {
          clearStoredAuth();
          set({ isAuthenticated: false, user: null });
          return;
        }

        const browserSession = readBrowserSession() ?? startBrowserSession();
        if (Date.now() >= browserSession.expiresAt) {
          clearStoredAuth();
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
          clearStoredAuth();

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
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: (_key: string) => null,
          setItem: (_key: string, _value: string) => undefined,
          removeItem: (_key: string) => undefined,
        };
      }),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

