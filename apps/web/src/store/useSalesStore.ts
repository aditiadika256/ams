import { create } from 'zustand';
import { Program, Order, CreateOrderPayload } from '../types/sales';
import { apiClient } from '../lib/api';
import { alertActions } from './useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
let nextProgramsRequestId = 1;
let latestOrderRequestId = 0;

interface SalesState {
  programs: Program[];
  orders: Order[];
  currentProgram: Program | null;
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  _programsFetchedAt: number | null;
  _programsFetchPromise: Promise<void> | null;
  _programsRequestId: number;
  _programsQueryKey: string | null;
  _programsPendingQueryKey: string | null;

  // Actions
  fetchPrograms: (params?: any, options?: { force?: boolean }) => Promise<void>;
  fetchProgram: (id: number | string) => Promise<void>;
  createProgram: (payload: any) => Promise<void>;
  updateProgram: (id: number | string, payload: any) => Promise<void>;
  deleteProgram: (id: number | string) => Promise<void>;
  fetchOrders: (params?: any) => Promise<void>;
  fetchOrder: (
    id: number | string,
    options?: { force?: boolean; expectedStatus?: Order['status'] }
  ) => Promise<boolean>;
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
  _programsRequestId: 0,
  _programsQueryKey: null,
  _programsPendingQueryKey: null,

  fetchPrograms: async (params, options) => {
    const state = get();
    const force = options?.force === true;
    const queryKey = JSON.stringify(params || {});

    // Skip if data is fresh (within stale window)
    if (
      !force &&
      state._programsQueryKey === queryKey &&
      state._programsFetchedAt &&
      Date.now() - state._programsFetchedAt < STALE_TIME &&
      state.programs.length > 0
    ) {
      return;
    }

    // Deduplicate in-flight requests
    if (
      !force &&
      state._programsFetchPromise &&
      state._programsPendingQueryKey === queryKey
    ) {
      await state._programsFetchPromise;
      return;
    }

    const requestId = nextProgramsRequestId++;
    set({
      isLoading: true,
      error: null,
      _programsRequestId: requestId,
      _programsPendingQueryKey: queryKey,
    });

    const promise = (async () => {
      try {
        const response = await apiClient.sales.getPrograms(params);
        if (response.success && response.data) {
          const list = (response as any)?.data?.data ?? response.data;
          if (get()._programsRequestId === requestId) {
            set({
              programs: list,
              isLoading: false,
              _programsFetchedAt: Date.now(),
              _programsQueryKey: queryKey,
            });
          }
        } else {
          throw new Error(response.message || 'Failed to fetch programs');
        }
      } catch (error: any) {
        if (get()._programsRequestId === requestId) {
          set({ isLoading: false, error: error.message || 'Failed to fetch programs' });
        }
      } finally {
        if (get()._programsRequestId === requestId) {
          set({ _programsFetchPromise: null, _programsPendingQueryKey: null });
        }
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
      if (response.success && response.data) {
        const created = response.data as Program;
        set((state) => ({
          programs: [
            created,
            ...state.programs.filter((program) => program.id !== created.id),
          ],
          _programsFetchedAt: null,
        }));
        await get().fetchPrograms({}, { force: true });
        alertActions.success(
          'Program berhasil ditambahkan',
          `${payload.name || 'Program baru'} telah tersedia di daftar program.`
        );
      } else {
        throw new Error(response.message || 'Failed to create program');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'Program gagal ditambahkan.');
      set({ isLoading: false, error: null });
      alertActions.error('Gagal menambahkan program', message);
      throw error;
    }
  },

  updateProgram: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.updateProgram(id, payload);
      if (response.success && response.data) {
        const updated = response.data as Program;
        set((state) => ({
          programs: state.programs.map((program) => program.id === updated.id ? updated : program),
          currentProgram: state.currentProgram?.id === updated.id ? updated : state.currentProgram,
          _programsFetchedAt: null,
        }));
        await get().fetchPrograms({}, { force: true });
        alertActions.success(
          'Program berhasil diperbarui',
          `${payload.name || 'Data program'} berhasil disimpan.`
        );
      } else {
        throw new Error(response.message || 'Failed to update program');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'Perubahan program gagal disimpan.');
      set({ isLoading: false, error: null });
      alertActions.error('Gagal memperbarui program', message);
      throw error;
    }
  },

  deleteProgram: async (id) => {
    set({ isLoading: true, error: null });
    const programName = get().programs.find((program) => program.id === id)?.name || `Program #${id}`;
    try {
      await apiClient.sales.deleteProgram(id);
      set((state) => ({
        programs: state.programs.filter((program) => program.id !== id),
        currentProgram: state.currentProgram?.id === id ? null : state.currentProgram,
        _programsFetchedAt: null,
      }));
      await get().fetchPrograms({}, { force: true });
      alertActions.success('Program berhasil dihapus', `${programName} telah dihapus.`);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Program gagal dihapus.');
      set({ isLoading: false, error: null });
      alertActions.error('Gagal menghapus program', message);
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

  fetchOrder: async (id, options) => {
    const requestId = ++latestOrderRequestId;
    set((state) => ({
      isLoading: true,
      error: null,
      currentOrder:
        state.currentOrder && String(state.currentOrder.id) === String(id)
          ? state.currentOrder
          : null,
    }));
    try {
      const response = await apiClient.sales.getOrder(id, { fresh: options?.force });
      if (response.success && response.data) {
        if (requestId !== latestOrderRequestId) {
          return false;
        }
        if (options?.expectedStatus && response.data.status !== options.expectedStatus) {
          set({ isLoading: false });
          return false;
        }
        set({ currentOrder: response.data, isLoading: false });
        return true;
      } else {
        throw new Error(response.message || 'Failed to fetch order');
      }
    } catch (error: any) {
      if (requestId === latestOrderRequestId) {
        set({ isLoading: false, error: error.message || 'Failed to fetch order' });
      }
      return false;
    }
  },

  createOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sales.createOrder(payload);
      if (response.success && response.data) {
        set({ currentOrder: response.data, isLoading: false });
        alertActions.success(
          'Pesanan berhasil dibuat',
          `Pesanan #${response.data.id} berhasil dibuat dan siap diproses.`
        );
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'Pesanan gagal dibuat.');
      set({ isLoading: false, error: null });
      alertActions.error('Gagal membuat pesanan', message);
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
