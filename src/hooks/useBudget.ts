import { useMemo } from 'react';
import { useBudgetStore } from '../stores/budgetStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransactionStore } from '../stores/transactionStore';
import type { Budget, BudgetMetrics } from '../types';
import { calculateBudgetMetrics } from '../utils/calculations';

interface UseMonthlyBudgetResult {
  budget: Budget | undefined;
  metrics: BudgetMetrics;
}

export function useMonthlyBudget(year: number, month: number): UseMonthlyBudgetResult {
  const budgets = useBudgetStore((s) => s.budgets);
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.currency);

  const budget = useMemo(
    () => budgets.find((b) => b.month === month && b.year === year),
    [budgets, month, year]
  );

  const metrics = useMemo(
    () => calculateBudgetMetrics(budget, transactions, year, month, currency),
    [budget, transactions, year, month, currency]
  );

  return { budget, metrics };
}
