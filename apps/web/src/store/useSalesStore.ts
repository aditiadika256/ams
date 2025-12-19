import { create } from 'zustand';
import { Program, Order, CreateOrderPayload } from '../types/sales';
import { apiClient } from '../lib/api';

interface SalesState {
  programs: Program[];
  orders: Order[];
  currentProgram: Program | null;
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPrograms: (params?: any) => Promise<void>;
  fetchProgram: (id: number | string) => Promise<void>;
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

  fetchPrograms: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.getPrograms(params);
      if (response.success && response.data) {
        set({ programs: response.data, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch programs');
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch programs' });
    }
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
