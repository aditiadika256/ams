import { create } from 'zustand';

export type AppAlertType = 'success' | 'error';

export interface AppAlert {
  id: number;
  type: AppAlertType;
  title: string;
  message: string;
}

interface ShowAlertInput {
  type: AppAlertType;
  title: string;
  message: string;
}

interface AlertState {
  alert: AppAlert | null;
  showAlert: (input: ShowAlertInput) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  dismissAlert: () => void;
}

const SUCCESS_DURATION_MS = 5_000;

let nextAlertId = 1;
let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

function clearAutoDismissTimer(): void {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer);
    autoDismissTimer = null;
  }
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alert: null,

  showAlert: ({ type, title, message }) => {
    clearAutoDismissTimer();

    const id = nextAlertId++;
    set({ alert: { id, type, title, message } });

    if (type === 'success') {
      autoDismissTimer = setTimeout(() => {
        if (get().alert?.id === id) {
          set({ alert: null });
        }
        autoDismissTimer = null;
      }, SUCCESS_DURATION_MS);
    }
  },

  showSuccess: (title, message) => {
    get().showAlert({ type: 'success', title, message });
  },

  showError: (title, message) => {
    get().showAlert({ type: 'error', title, message });
  },

  dismissAlert: () => {
    clearAutoDismissTimer();
    set({ alert: null });
  },
}));

export const alertActions = {
  success: (title: string, message: string) =>
    useAlertStore.getState().showSuccess(title, message),
  error: (title: string, message: string) =>
    useAlertStore.getState().showError(title, message),
  dismiss: () => useAlertStore.getState().dismissAlert(),
};
