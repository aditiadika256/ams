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
  showSuccess: (titleOrMessage: string, message?: string) => void;
  showError: (titleOrMessage: string, message?: string) => void;
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

  showSuccess: (titleOrMessage, message) => {
    const title = message !== undefined ? titleOrMessage : 'Berhasil';
    const msg = message !== undefined ? message : titleOrMessage;
    get().showAlert({ type: 'success', title, message: msg });
  },

  showError: (titleOrMessage, message) => {
    const title = message !== undefined ? titleOrMessage : 'Terjadi Kesalahan';
    const msg = message !== undefined ? message : titleOrMessage;
    get().showAlert({ type: 'error', title, message: msg });
  },

  dismissAlert: () => {
    clearAutoDismissTimer();
    set({ alert: null });
  },
}));

export const alertActions = {
  success: (titleOrMessage: string, message?: string) =>
    useAlertStore.getState().showSuccess(titleOrMessage, message),
  error: (titleOrMessage: string, message?: string) =>
    useAlertStore.getState().showError(titleOrMessage, message),
  dismiss: () => useAlertStore.getState().dismissAlert(),
};
