import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createInitialMockTransactions } from '../data/mockData';
import type {
  Currency,
  DateFilterPreset,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types/finance';

export interface NewTransactionInput {
  type: TransactionType;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  customCategory?: string;
  recipient?: string;
  description: string;
  date: string;
}

interface TransactionState {
  transactions: Transaction[];
  searchQuery: string;
  typeFilter: 'all' | TransactionType;
  dateFilter: DateFilterPreset;
  customDate: string;

  addTransaction: (input: NewTransactionInput) => Transaction;
  updateTransaction: (id: string, updates: NewTransactionInput) => void;
  deleteTransaction: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: 'all' | TransactionType) => void;
  setDateFilter: (preset: DateFilterPreset) => void;
  setCustomDate: (date: string) => void;
  resetFilters: () => void;
  resetTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: createInitialMockTransactions(new Date()),
      searchQuery: '',
      typeFilter: 'all',
      dateFilter: 'all',
      customDate: '',

      addTransaction: (input) => {
        const now = new Date().toISOString();
        const created: Transaction = {
          id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          ...input,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [created, ...state.transactions],
        }));
        return created;
      },

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id
              ? {
                  ...tx,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : tx
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        })),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setTypeFilter: (typeFilter) => set({ typeFilter }),
      setDateFilter: (dateFilter) => set({ dateFilter }),
      setCustomDate: (customDate) => set({ customDate }),
      resetFilters: () =>
        set({
          searchQuery: '',
          typeFilter: 'all',
          dateFilter: 'all',
          customDate: '',
        }),

      resetTransactions: () =>
        set({
          transactions: createInitialMockTransactions(new Date()),
          searchQuery: '',
          typeFilter: 'all',
          dateFilter: 'all',
          customDate: '',
        }),
    }),
    {
      name: 'sovan-transactions-v1',
      partialize: (state) => ({
        transactions: state.transactions,
      }),
    }
  )
);
