import { create } from 'zustand';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/get-error-message';
import type { WorkspaceAccess, WorkspacePage } from '@/types/workspace';

interface WorkspaceState {
  accesses: WorkspaceAccess[];
  currentAccess: WorkspaceAccess | null;
  page: WorkspacePage['meta'] | null;
  summary: WorkspacePage['summary'];
  loading: boolean;
  error: string | null;
  fetchWorkspace: (params?: Record<string, unknown>) => Promise<void>;
  fetchAccess: (id: number) => Promise<WorkspaceAccess | null>;
  archive: (id: number) => Promise<void>;
  restore: (id: number) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  accesses: [], currentAccess: null, page: null, summary: {}, loading: false, error: null,
  fetchWorkspace: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.workspace.list(params);
      const page = response.data;
      set({ accesses: page?.data ?? [], page: page?.meta ?? null, summary: page?.summary ?? {}, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, 'Workspace tidak dapat dimuat.') });
    }
  },
  fetchAccess: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.workspace.get(id);
      const access = response.data ?? null;
      set({ currentAccess: access, loading: false });
      return access;
    } catch (error) {
      set({ currentAccess: null, loading: false, error: getErrorMessage(error, 'Enrollment tidak dapat dimuat.') });
      return null;
    }
  },
  archive: async (id) => {
    await apiClient.workspace.archive(id);
    set({ accesses: get().accesses.filter((access) => access.id !== id) });
  },
  restore: async (id) => {
    await apiClient.workspace.restore(id);
    set({ accesses: get().accesses.filter((access) => access.id !== id) });
  },
}));
