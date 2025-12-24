import { create } from 'zustand';
import { api } from '@/lib/api';

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
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: [],
  invoices: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchTransactions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/finance/transactions', { params });
      set({ transactions: response.data.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createTransaction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/finance/transactions', data);
      await useFinanceStore.getState().fetchTransactions();
      await useFinanceStore.getState().fetchStats();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/finance/transactions/${id}`, data);
      await useFinanceStore.getState().fetchTransactions();
      await useFinanceStore.getState().fetchStats();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/finance/transactions/${id}`);
      await useFinanceStore.getState().fetchTransactions();
      await useFinanceStore.getState().fetchStats();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get('/finance/transactions/stats/summary');
      set({ stats: response.data });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  },

  fetchInvoices: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/finance/invoices', { params });
      set({ invoices: response.data.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createInvoice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/finance/invoices', data);
      await useFinanceStore.getState().fetchInvoices();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateInvoice: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/finance/invoices/${id}`, data);
      await useFinanceStore.getState().fetchInvoices();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));
