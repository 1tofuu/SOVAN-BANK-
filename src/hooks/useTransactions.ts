import { useMemo } from 'react';
import { RECENT_TRANSACTIONS_LIMIT } from '../constants/app';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransactionStore } from '../stores/transactionStore';
import type {
  BalanceMetrics,
  CategoryBreakdownItem,
  MonthlyMetrics,
  Transaction,
} from '../types';
import {
  calculateBalanceMetrics,
  calculateCategoryBreakdown,
  calculateMonthlyMetrics,
  filterTransactions,
  sortTransactionsNewestFirst,
} from '../utils/calculations';

export function useBalanceMetrics(): BalanceMetrics {
  const transactions = useTransactionStore((s) => s.transactions);
  const openingBalanceUSD = useSettingsStore((s) => s.openingBalanceUSD);
  const currency = useSettingsStore((s) => s.currency);

  return useMemo(
    () => calculateBalanceMetrics(transactions, openingBalanceUSD, currency),
    [transactions, openingBalanceUSD, currency]
  );
}

export function useMonthlyMetrics(year: number, month: number): MonthlyMetrics {
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.currency);

  return useMemo(
    () => calculateMonthlyMetrics(transactions, year, month, currency),
    [transactions, year, month, currency]
  );
}

export function useCategoryBreakdown(year: number, month: number): CategoryBreakdownItem[] {
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.currency);

  return useMemo(
    () => calculateCategoryBreakdown(transactions, year, month, currency),
    [transactions, year, month, currency]
  );
}

export function useRecentTransactions(limit: number = RECENT_TRANSACTIONS_LIMIT): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(
    () => sortTransactionsNewestFirst(transactions).slice(0, limit),
    [transactions, limit]
  );
}

export function useFilteredTransactions(): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  const searchQuery = useTransactionStore((s) => s.searchQuery);
  const typeFilter = useTransactionStore((s) => s.typeFilter);
  const dateFilter = useTransactionStore((s) => s.dateFilter);
  const customDate = useTransactionStore((s) => s.customDate);
  const lang = useSettingsStore((s) => s.language);

  return useMemo(
    () =>
      filterTransactions(
        transactions,
        { searchQuery, typeFilter, dateFilter, customDate },
        lang
      ),
    [transactions, searchQuery, typeFilter, dateFilter, customDate, lang]
  );
}
