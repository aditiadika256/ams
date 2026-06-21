import { create } from 'zustand';
import { Program, Order, CreateOrderPayload } from '../types/sales';
import { apiClient } from '../lib/api';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

interface SalesState {
  programs: Program[];
  orders: Order[];
  currentProgram: Program | null;
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  _programsFetchedAt: number | null;
  _programsFetchPromise: Promise<void> | null;

  // Actions
  fetchPrograms: (params?: any) => Promise<void>;
  fetchProgram: (id: number | string) => Promise<void>;
  createProgram: (payload: any) => Promise<void>;
  updateProgram: (id: number | string, payload: any) => Promise<void>;
  deleteProgram: (id: number | string) => Promise<void>;
  fetchOrders: (params?: any) => Promise<void>;
  fetchOrder: (id: number | string) => Promise<void>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order | null>;
  clearError: () => void;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  programs: [],
  orders: [],
  currentProgram: null,
  currentOrder: null,
  isLoading: false,
  error: null,
  _programsFetchedAt: null,
  _programsFetchPromise: null,

  fetchPrograms: async (params) => {
    const state = get();

    // Skip if data is fresh (within stale window)
    if (
      state._programsFetchedAt &&
      Date.now() - state._programsFetchedAt < STALE_TIME &&
      state.programs.length > 0
    ) {
      return;
    }

    // Deduplicate in-flight requests
    if (state._programsFetchPromise) {
      await state._programsFetchPromise;
      return;
    }

    set({ isLoading: true, error: null });

    const promise = (async () => {
      try {
        const response = await apiClient.sales.getPrograms(params);
        if (response.success && response.data) {
          const list = (response as any)?.data?.data ?? response.data;
          set({ programs: list, isLoading: false, _programsFetchedAt: Date.now() });
        } else {
          throw new Error(response.message || 'Failed to fetch programs');
        }
      } catch (error: any) {
        set({ isLoading: false, error: error.message || 'Failed to fetch programs' });
      } finally {
        set({ _programsFetchPromise: null });
      }
    })();

    set({ _programsFetchPromise: promise });
    await promise;
  },

  fetchProgram: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.getProgram(id);
      if (response.success && response.data) {
        set({ currentProgram: response.data, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch program');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch program' });
    }
  },

  createProgram: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.createProgram(payload);
      if (response.success) {
        set({ _programsFetchedAt: null }); // Force refetch
        await get().fetchPrograms({ force: true });
      } else {
        throw new Error(response.message || 'Failed to create program');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to create program' });
      throw error;
    }
  },

  updateProgram: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.updateProgram(id, payload);
      if (response.success) {
        set({ _programsFetchedAt: null }); // Force refetch
        await get().fetchPrograms({ force: true });
      } else {
        throw new Error(response.message || 'Failed to update program');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to update program' });
      throw error;
    }
  },

  deleteProgram: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.deleteProgram(id);
      if (response.success) {
        set({ _programsFetchedAt: null }); // Force refetch
        await get().fetchPrograms({ force: true });
      } else {
        throw new Error(response.message || 'Failed to delete program');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to delete program' });
      throw error;
    }
  },

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.getOrders(params);
      if (response.success && response.data) {
        set({ orders: response.data, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch orders' });
    }
  },

  fetchOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.getOrder(id);
      if (response.success && response.data) {
        set({ currentOrder: response.data, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch order');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch order' });
    }
  },

  createOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.createOrder(payload);
      if (response.success && response.data) {
        set({ currentOrder: response.data, isLoading: false });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to create order' });
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
