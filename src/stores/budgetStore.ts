import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createInitialMockBudgets } from '../data/mockData';
import type { Budget, Currency } from '../types/finance';

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

      upsertBudget: (month, year, amount, currency) =>
        set((state) => {
          const now = new Date().toISOString();
          const existing = state.budgets.find((b) => b.month === month && b.year === year);
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.id === existing.id
                  ? { ...b, amount, currency, updatedAt: now }
                  : b
              ),
            };
          }
          const created: Budget = {
            id: `budget-${year}-${month}`,
            month,
            year,
            amount,
            currency,
            createdAt: now,
            updatedAt: now,
          };
          return { budgets: [...state.budgets, created] };
        }),

      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),

      resetBudgets: () => set({ budgets: createInitialMockBudgets(new Date()) }),
    }),
    {
      name: 'sovan-budgets-v1',
      partialize: (state) => ({
        budgets: state.budgets,
      }),
    }
  )
);
