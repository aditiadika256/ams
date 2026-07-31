import { create } from 'zustand';
import { api, apiClient } from '@/lib/api';
import { alertActions } from '@/store/useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';

let latestTransactionsRequestId = 0;
let latestInvoicesRequestId = 0;
let latestStatsRequestId = 0;

export interface Transaction {
  id: number;
  reference_number: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total_amount: number;
  items: any[];
}

interface FinanceState {
  transactions: Transaction[];
  invoices: Invoice[];
  stats: {
    total_income: number;
    total_expense: number;
    net_profit: number;
    recent_transactions: Transaction[];
  } | null;
  isLoading: boolean;
  error: string | null;

  fetchTransactions: (params?: any) => Promise<void>;
  createTransaction: (data: any) => Promise<void>;
  updateTransaction: (id: number, data: any) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  
  fetchInvoices: (params?: any) => Promise<void>;
  createInvoice: (data: any) => Promise<void>;
  updateInvoice: (id: number, data: any) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: [],
  invoices: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchTransactions: async (params) => {
    const requestId = ++latestTransactionsRequestId;
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/finance/transactions', { params });
      if (requestId === latestTransactionsRequestId) {
        set({ transactions: response.data.data });
      }
    } catch (error: any) {
      if (requestId === latestTransactionsRequestId) {
        set({ error: error.message });
      }
    } finally {
      if (requestId === latestTransactionsRequestId) {
        set({ isLoading: false });
      }
    }
  },

  createTransaction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/finance/transactions', data);
      if (response.data) {
        const created = response.data as Transaction;
        set((state) => ({
          transactions: [
            created,
            ...state.transactions.filter((item) => item.id !== created.id),
          ],
        }));
      }
      await useFinanceStore.getState().fetchTransactions();
      await useFinanceStore.getState().fetchStats();
      alertActions.success(
        'Transaksi berhasil ditambahkan',
        `${data.description || data.category || 'Transaksi baru'} berhasil dicatat.`
      );
    } catch (error: any) {
      const message = getErrorMessage(error, 'Transaksi gagal dicatat.');
      set({ error: null });
      alertActions.error('Gagal menambahkan transaksi', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id, data) => {
    set({ isLoading: true, error: null });
    const reference = useFinanceStore.getState().transactions.find((item) => item.id === id)?.reference_number || `Transaksi #${id}`;
    try {
      const response = await api.put(`/finance/transactions/${id}`, data);
      if (response.data) {
        const updated = response.data as Transaction;
        set((state) => ({
          transactions: state.transactions.map((item) =>
            item.id === id ? updated : item
          ),
        }));
      }
      await useFinanceStore.getState().fetchTransactions();
      await useFinanceStore.getState().fetchStats();
      alertActions.success('Transaksi berhasil diperbarui', `${reference} berhasil disimpan.`);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Transaksi gagal diperbarui.');
      set({ error: null });
      alertActions.error('Gagal memperbarui transaksi', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    const reference = useFinanceStore.getState().transactions.find((item) => item.id === id)?.reference_number || `Transaksi #${id}`;
    try {
      await apiClient.finance.transactions.remove(id);
      set((state) => ({
        transactions: state.transactions.filter((item) => item.id !== id),
      }));
      await useFinanceStore.getState().fetchTransactions();
      await useFinanceStore.getState().fetchStats();
      alertActions.success('Transaksi berhasil dihapus', `${reference} telah dihapus.`);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Transaksi gagal dihapus.');
      set({ error: null });
      alertActions.error('Gagal menghapus transaksi', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    const requestId = ++latestStatsRequestId;
    try {
      const response = await api.get('/finance/transactions/stats/summary');
      if (requestId === latestStatsRequestId) {
        set({ stats: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  },

  fetchInvoices: async (params) => {
    const requestId = ++latestInvoicesRequestId;
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/finance/invoices', { params });
      if (requestId === latestInvoicesRequestId) {
        set({ invoices: response.data.data });
      }
    } catch (error: any) {
      if (requestId === latestInvoicesRequestId) {
        set({ error: error.message });
      }
    } finally {
      if (requestId === latestInvoicesRequestId) {
        set({ isLoading: false });
      }
    }
  },

  createInvoice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/finance/invoices', data);
      if (response.data) {
        const created = response.data as Invoice;
        set((state) => ({
          invoices: [
            created,
            ...state.invoices.filter((item) => item.id !== created.id),
          ],
        }));
      }
      await useFinanceStore.getState().fetchInvoices();
      alertActions.success(
        'Invoice berhasil dibuat',
        `${data.invoice_number || 'Invoice baru'} berhasil ditambahkan.`
      );
    } catch (error: any) {
      const message = getErrorMessage(error, 'Invoice gagal dibuat.');
      set({ error: null });
      alertActions.error('Gagal membuat invoice', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateInvoice: async (id, data) => {
    set({ isLoading: true, error: null });
    const invoiceNumber = useFinanceStore.getState().invoices.find((item) => item.id === id)?.invoice_number || `Invoice #${id}`;
    try {
      const response = await api.put(`/finance/invoices/${id}`, data);
      if (response.data) {
        const updated = response.data as Invoice;
        set((state) => ({
          invoices: state.invoices.map((item) =>
            item.id === id ? updated : item
          ),
        }));
      }
      await useFinanceStore.getState().fetchInvoices();
      alertActions.success('Invoice berhasil diperbarui', `${invoiceNumber} berhasil disimpan.`);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Invoice gagal diperbarui.');
      set({ error: null });
      alertActions.error('Gagal memperbarui invoice', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteInvoice: async (id) => {
    set({ isLoading: true, error: null });
    const invoiceNumber = useFinanceStore.getState().invoices.find((item) => item.id === id)?.invoice_number || `Invoice #${id}`;
    try {
      await apiClient.finance.invoices.remove(id);
      set((state) => ({
        invoices: state.invoices.filter((item) => item.id !== id),
      }));
      await useFinanceStore.getState().fetchInvoices();
      alertActions.success('Invoice berhasil dihapus', `${invoiceNumber} telah dihapus.`);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Invoice gagal dihapus.');
      set({ error: null });
      alertActions.error('Gagal menghapus invoice', message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));
