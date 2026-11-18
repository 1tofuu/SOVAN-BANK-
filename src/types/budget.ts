import type { Currency } from './settings';

export interface Budget {
  id: string;
  month: number; // 1-12
  year: number;
  amount: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

export type BudgetStatus = 'none' | 'healthy' | 'warning' | 'exceeded';

export interface BudgetMetrics {
  hasBudget: boolean;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}
