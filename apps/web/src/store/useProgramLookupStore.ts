import { create } from 'zustand';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import type { ProgramLookupOption } from '@/types/program-master';

const STALE_TIME = 5 * 60 * 1000;

let nextLookupRequestId = 1;

interface ProgramLookupState {
  levels: ProgramLookupOption[];
  types: ProgramLookupOption[];
  isLoading: boolean;
  error: string | null;
  fetchedAt: number | null;
  _fetchPromise: Promise<void> | null;
  _requestId: number;
  fetchLookups: (options?: { force?: boolean }) => Promise<void>;
  forceRefresh: () => Promise<void>;
  invalidate: () => void;
}

export const useProgramLookupStore = create<ProgramLookupState>((set, get) => ({
  levels: [],
  types: [],
  isLoading: false,
  error: null,
  fetchedAt: null,
  _fetchPromise: null,
  _requestId: 0,

  fetchLookups: async (options) => {
    const state = get();
    const force = options?.force === true;

    if (
      !force &&
      state.fetchedAt !== null &&
      Date.now() - state.fetchedAt < STALE_TIME
    ) {
      return;
    }

    if (!force && state._fetchPromise) {
      await state._fetchPromise;
      return;
    }

    const requestId = nextLookupRequestId++;
    set({
      isLoading: true,
      error: null,
      _requestId: requestId,
    });

    const promise = (async () => {
      try {
        const response = await apiClient.programLookups.get();

        if (get()._requestId !== requestId) {
          return;
        }

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Lookup program gagal dimuat.');
        }

        set({
          levels: response.data.levels,
          types: response.data.types,
          fetchedAt: Date.now(),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (get()._requestId === requestId) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Lookup program gagal dimuat.'),
          });
        }
      } finally {
        if (get()._requestId === requestId) {
          set({ _fetchPromise: null });
        }
      }
    })();

    set({ _fetchPromise: promise });
    await promise;
  },

  forceRefresh: async () => {
    await get().fetchLookups({ force: true });
  },

  invalidate: () => {
    set({
      fetchedAt: null,
      _fetchPromise: null,
      _requestId: nextLookupRequestId++,
      isLoading: false,
      error: null,
    });
  },
}));
