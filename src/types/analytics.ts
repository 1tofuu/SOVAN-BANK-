import type { TransactionCategory } from './transaction';

export interface ChartPoint {
  label: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdownItem {
  key: string;
  category: TransactionCategory;
  customLabel?: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface BalanceMetrics {
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransfers: number;
  totalBalance: number;
  netSavings: number;
}

export interface MonthlyMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  count: number;
}

export interface PeriodSummary {
  income: number;
  expenses: number;
  netSavings: number;
}

export interface MonthlyComparison {
  current: MonthlyMetrics;
  previous: MonthlyMetrics;
  prevMonth: number;
  prevYear: number;
  incomeDeltaPct: number | null;
  expenseDeltaPct: number | null;
  savingsDeltaPct: number | null;
}
