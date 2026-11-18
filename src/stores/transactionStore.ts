import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/app';
import { createInitialMockTransactions } from '../data/mockData';
import { safeStorage } from '../services/storage/safeStorage';
import type {
  DateFilterPreset,
  NewTransactionInput,
  Transaction,
  TransactionType,
} from '../types';
import { roundCurrencyAmount } from '../utils/currency';

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

const INITIAL_FILTERS = {
  searchQuery: '',
  typeFilter: 'all' as const,
  dateFilter: 'all' as const,
  customDate: '',
};

function createTransactionId(): string {
  return `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeTransactionInput(input: NewTransactionInput): NewTransactionInput {
  return {
    ...input,
    amount: Math.max(0, roundCurrencyAmount(input.amount, input.currency)),
    customCategory: input.customCategory?.trim() || undefined,
    recipient: input.type === 'transfer' ? input.recipient?.trim() || undefined : undefined,
    description: input.description.trim(),
  };
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: createInitialMockTransactions(new Date()),
      ...INITIAL_FILTERS,

      addTransaction: (input) => {
        const now = new Date().toISOString();
        const normalized = normalizeTransactionInput(input);
        const created: Transaction = {
          id: createTransactionId(),
          ...normalized,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [created, ...state.transactions],
        }));
        return created;
      },

      updateTransaction: (id, updates) => {
        const normalized = normalizeTransactionInput(updates);
        const updatedAt = new Date().toISOString();
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...normalized, updatedAt } : tx
          ),
        }));
      },

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        })),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setTypeFilter: (typeFilter) => set({ typeFilter }),
      setDateFilter: (dateFilter) => set({ dateFilter }),
      setCustomDate: (customDate) => set({ customDate }),
      resetFilters: () => set(INITIAL_FILTERS),

      resetTransactions: () =>
        set({
          transactions: createInitialMockTransactions(new Date()),
          ...INITIAL_FILTERS,
        }),
    }),
    {
      name: STORAGE_KEYS.transactions,
      storage: createJSONStorage(() => safeStorage),
      // Persist only transaction records; keep History screen search/filter state transient.
      partialize: (state) => ({
        transactions: state.transactions,
      }),
    }
  )
);
