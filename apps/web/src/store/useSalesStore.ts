import { create } from 'zustand';
import type {
  CreateOrderPayload,
  Order,
  Program,
  ProgramMutationPayload,
} from '@/types/sales';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { alertActions } from './useAlertStore';

interface SalesState {
  programs: Program[];
  adminPrograms: Program[];
  orders: Order[];
  currentProgram: Program | null;
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  fetchPrograms: (params?: Record<string, unknown>) => Promise<void>;
  fetchProgram: (id: number | string) => Promise<void>;
  fetchAdminPrograms: (params?: Record<string, unknown>) => Promise<void>;
  createProgram: (payload: ProgramMutationPayload) => Promise<Program>;
  updateProgram: (id: number, payload: ProgramMutationPayload) => Promise<Program>;
  deleteProgram: (id: number) => Promise<void>;
  transitionProgram: (
    id: number,
    action: 'publish' | 'unpublish' | 'archive' | 'restore',
    reason: string,
  ) => Promise<Program>;
  fetchOrders: (params?: Record<string, unknown>) => Promise<void>;
  fetchOrder: (
    id: number | string,
    options?: { force?: boolean; expectedStatus?: Order['status'] },
  ) => Promise<boolean>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order | null>;
  clearError: () => void;
}

function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in value) {
    return ((value as { data?: T[] }).data ?? []);
  }
  return [];
}

export const useSalesStore = create<SalesState>((set, get) => ({
  programs: [],
  adminPrograms: [],
  orders: [],
  currentProgram: null,
  currentOrder: null,
  isLoading: false,
  error: null,

  fetchPrograms: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.getPrograms(params);
      set({ programs: unwrapList<Program>(response.data), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Program gagal dimuat.') });
    }
  },

  fetchProgram: async (id) => {
    set({ isLoading: true, error: null, currentProgram: null });
    try {
      const response = await apiClient.sales.getProgram(id);
      set({ currentProgram: response.data ?? null, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Detail program gagal dimuat.') });
    }
  },

  fetchAdminPrograms: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.admin.programs.list(params);
      set({ adminPrograms: unwrapList<Program>(response.data), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Daftar program admin gagal dimuat.') });
    }
  },

  createProgram: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.admin.programs.create(payload);
      if (!response.data) throw new Error(response.message || 'Program gagal dibuat.');
      set((state) => ({
        adminPrograms: [response.data!, ...state.adminPrograms],
        isLoading: false,
      }));
      alertActions.success('Program dibuat', `${payload.name} disimpan sebagai draft.`);
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Program gagal dibuat.') });
      throw error;
    }
  },

  updateProgram: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.admin.programs.update(id, payload);
      if (!response.data) throw new Error(response.message || 'Program gagal diperbarui.');
      set((state) => ({
        adminPrograms: state.adminPrograms.map((program) => (
          program.id === id ? response.data! : program
        )),
        isLoading: false,
      }));
      alertActions.success('Program diperbarui', `${payload.name} berhasil disimpan.`);
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Program gagal diperbarui.') });
      throw error;
    }
  },

  deleteProgram: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.admin.programs.remove(id);
      set((state) => ({
        adminPrograms: state.adminPrograms.filter((program) => program.id !== id),
        isLoading: false,
      }));
      alertActions.success('Program dihapus', 'Draft program telah dihapus.');
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Program gagal dihapus.') });
      throw error;
    }
  },

  transitionProgram: async (id, action, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.admin.programs.transition(id, action, reason);
      if (!response.data) throw new Error(response.message || 'Status program gagal diubah.');
      set((state) => ({
        adminPrograms: state.adminPrograms.map((program) => (
          program.id === id ? response.data! : program
        )),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Status program gagal diubah.') });
      throw error;
    }
  },

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.getOrders(params);
      set({ orders: unwrapList<Order>(response.data), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Order gagal dimuat.') });
    }
  },

  fetchOrder: async (id, options) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.getOrder(id, { fresh: options?.force });
      const order = response.data;
      if (!order || (options?.expectedStatus && order.status !== options.expectedStatus)) {
        set({ isLoading: false });
        return false;
      }
      set({ currentOrder: order, isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Order gagal dimuat.') });
      return false;
    }
  },

  createOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.createOrder(payload);
      const order = response.data ?? null;
      set({ currentOrder: order, isLoading: false });
      return order;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'Pesanan gagal dibuat.') });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
