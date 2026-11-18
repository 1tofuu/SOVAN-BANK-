import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/app';
import { createInitialMockBudgets } from '../data/mockData';
import { safeStorage } from '../services/storage/safeStorage';
import type { Budget, Currency } from '../types';
import { roundCurrencyAmount } from '../utils/currency';

interface BudgetState {
  budgets: Budget[];
  upsertBudget: (month: number, year: number, amount: number, currency: Currency) => void;
  deleteBudget: (id: string) => void;
  resetBudgets: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      budgets: createInitialMockBudgets(new Date()),

      upsertBudget: (month, year, amount, currency) => {
        const cleanAmount = roundCurrencyAmount(amount, currency);
        if (cleanAmount <= 0 || month < 1 || month > 12) return;

        set((state) => {
          const now = new Date().toISOString();
          const existing = state.budgets.find((b) => b.month === month && b.year === year);
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.id === existing.id
                  ? { ...b, amount: cleanAmount, currency, updatedAt: now }
                  : b
              ),
            };
          }

          const created: Budget = {
            id: `budget-${year}-${month}`,
            month,
            year,
            amount: cleanAmount,
            currency,
            createdAt: now,
            updatedAt: now,
          };
          return { budgets: [...state.budgets, created] };
        });
      },

      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),

      resetBudgets: () => set({ budgets: createInitialMockBudgets(new Date()) }),
    }),
    {
      name: STORAGE_KEYS.budgets,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        budgets: state.budgets,
      }),
    }
  )
);
