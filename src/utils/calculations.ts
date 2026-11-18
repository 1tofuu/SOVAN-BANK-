import {
  BUDGET_EXCEEDED_THRESHOLD,
  BUDGET_WARNING_THRESHOLD,
  DAILY_SERIES_LENGTH,
  MONTHLY_SERIES_LENGTH,
} from '../constants/app';
import { getCategoryLabel, getCategoryMeta } from '../constants/categories';
import { MONTH_NAMES_EN, MONTH_NAMES_KM } from '../i18n/translations';
import type {
  AnalyticsPeriod,
  BalanceMetrics,
  Budget,
  BudgetMetrics,
  BudgetStatus,
  CategoryBreakdownItem,
  ChartPoint,
  Currency,
  Language,
  MonthlyComparison,
  MonthlyMetrics,
  PeriodSummary,
  Transaction,
  TransactionCategory,
  TransactionFilterCriteria,
} from '../types';
import { convertCurrency, fromMinorUnits, toMinorUnits } from './currency';
import { parseYearMonth, shiftMonth, toISODateString } from './date';

/** Sorts transactions from newest date to oldest, breaking ties by creation timestamp. */
export function sortTransactionsNewestFirst(transactions: readonly Transaction[]): Transaction[] {
  return transactions
    .slice()
    .sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)
    );
}

/** Returns all transactions occurring in the specified calendar year and month (1-12). */
export function getTransactionsForMonth(
  transactions: readonly Transaction[],
  year: number,
  month: number
): Transaction[] {
  return transactions.filter((tx) => {
    const parsed = parseYearMonth(tx.date);
    return parsed.year === year && parsed.month === month;
  });
}

/** Sums transactions in the target display currency using integer minor units. */
export function sumTransactionsInCurrency(
  transactions: readonly Transaction[],
  targetCurrency: Currency
): number {
  if (transactions.length === 0) return 0;

  let totalMinor = 0;
  for (const tx of transactions) {
    if (!Number.isFinite(tx.amount)) continue;
    const converted = convertCurrency(tx.amount, tx.currency, targetCurrency);
    totalMinor += toMinorUnits(converted, targetCurrency);
  }
  return fromMinorUnits(totalMinor, targetCurrency);
}

/** Sums only same-currency transactions without performing currency conversion. */
export function sumTransactionsByExactCurrency(
  transactions: readonly Transaction[],
  currency: Currency
): number {
  let totalMinor = 0;
  for (const tx of transactions) {
    if (tx.currency !== currency || !Number.isFinite(tx.amount)) continue;
    totalMinor += toMinorUnits(tx.amount, currency);
  }
  return fromMinorUnits(totalMinor, currency);
}

export function calculateTotalIncome(
  transactions: readonly Transaction[],
  displayCurrency: Currency
): number {
  return sumTransactionsInCurrency(
    transactions.filter((tx) => tx.type === 'income'),
    displayCurrency
  );
}

export function calculateTotalExpenses(
  transactions: readonly Transaction[],
  displayCurrency: Currency
): number {
  return sumTransactionsInCurrency(
    transactions.filter((tx) => tx.type === 'expense'),
    displayCurrency
  );
}

export function calculateTotalTransfers(
  transactions: readonly Transaction[],
  displayCurrency: Currency
): number {
  return sumTransactionsInCurrency(
    transactions.filter((tx) => tx.type === 'transfer'),
    displayCurrency
  );
}

export function calculateTotalBalance(
  transactions: readonly Transaction[],
  openingBalanceUSD: number,
  displayCurrency: Currency
): number {
  return calculateBalanceMetrics(transactions, openingBalanceUSD, displayCurrency).totalBalance;
}

/**
 * Computes overall wallet balance and lifetime cashflow totals in the display currency.
 * Transfers out deduct from total balance just like expenses, while net savings reflects
 * income minus expenses.
 */
export function calculateBalanceMetrics(
  transactions: readonly Transaction[],
  openingBalanceUSD: number,
  displayCurrency: Currency
): BalanceMetrics {
  const safeOpening = Number.isFinite(openingBalanceUSD) ? openingBalanceUSD : 0;
  const openingBalance = convertCurrency(safeOpening, 'USD', displayCurrency);
  const totalIncome = calculateTotalIncome(transactions, displayCurrency);
  const totalExpenses = calculateTotalExpenses(transactions, displayCurrency);
  const totalTransfers = calculateTotalTransfers(transactions, displayCurrency);

  const openingMinor = toMinorUnits(openingBalance, displayCurrency);
  const incomeMinor = toMinorUnits(totalIncome, displayCurrency);
  const expenseMinor = toMinorUnits(totalExpenses, displayCurrency);
  const transferMinor = toMinorUnits(totalTransfers, displayCurrency);

  const totalBalance = fromMinorUnits(
    openingMinor + incomeMinor - expenseMinor - transferMinor,
    displayCurrency
  );
  const netSavings = fromMinorUnits(incomeMinor - expenseMinor, displayCurrency);

  return {
    openingBalance,
    totalIncome,
    totalExpenses,
    totalTransfers,
    totalBalance,
    netSavings,
  };
}

/**
 * Calculates the maximum balance available to transfer out in a given currency.
 * When editing an existing transfer, its prior amount is refunded before checking sufficiency.
 */
export function calculateAvailableTransferBalance(
  transactions: readonly Transaction[],
  openingBalanceUSD: number,
  currency: Currency,
  editingTransaction?: Transaction | null
): number {
  const rawBalance = calculateTotalBalance(transactions, openingBalanceUSD, currency);
  const refund =
    editingTransaction && editingTransaction.type === 'transfer'
      ? convertCurrency(editingTransaction.amount, editingTransaction.currency, currency)
      : 0;

  const combinedMinor =
    toMinorUnits(rawBalance, currency) + toMinorUnits(refund, currency);
  return Math.max(0, fromMinorUnits(combinedMinor, currency));
}

export function calculateMonthlyMetrics(
  transactions: readonly Transaction[],
  year: number,
  month: number,
  displayCurrency: Currency
): MonthlyMetrics {
  const monthTx = getTransactionsForMonth(transactions, year, month);
  const monthlyIncome = calculateTotalIncome(monthTx, displayCurrency);
  const monthlyExpenses = calculateTotalExpenses(monthTx, displayCurrency);

  const netSavings = fromMinorUnits(
    toMinorUnits(monthlyIncome, displayCurrency) - toMinorUnits(monthlyExpenses, displayCurrency),
    displayCurrency
  );

  return {
    monthlyIncome,
    monthlyExpenses,
    netSavings,
    count: monthTx.length,
  };
}

export function calculateRemainingBudget(
  limit: number,
  spent: number,
  displayCurrency: Currency
): number {
  return fromMinorUnits(
    toMinorUnits(limit, displayCurrency) - toMinorUnits(spent, displayCurrency),
    displayCurrency
  );
}

export function calculateSpendingPercentage(spent: number, limit: number): number {
  if (!Number.isFinite(spent) || !Number.isFinite(limit) || limit <= 0) return 0;
  return Math.round((spent / limit) * 1000) / 10;
}

export function calculateBudgetMetrics(
  budget: Budget | undefined,
  transactions: readonly Transaction[],
  year: number,
  month: number,
  displayCurrency: Currency
): BudgetMetrics {
  const { monthlyExpenses } = calculateMonthlyMetrics(transactions, year, month, displayCurrency);

  if (!budget) {
    return {
      hasBudget: false,
      limit: 0,
      spent: monthlyExpenses,
      remaining: 0,
      percentage: 0,
      status: 'none',
    };
  }

  const limit = convertCurrency(budget.amount, budget.currency, displayCurrency);
  const remaining = calculateRemainingBudget(limit, monthlyExpenses, displayCurrency);
  const percentage = calculateSpendingPercentage(monthlyExpenses, limit);

  let status: BudgetStatus = 'healthy';
  if (percentage >= BUDGET_EXCEEDED_THRESHOLD) {
    status = 'exceeded';
  } else if (percentage >= BUDGET_WARNING_THRESHOLD) {
    status = 'warning';
  }

  return {
    hasBudget: true,
    limit,
    spent: monthlyExpenses,
    remaining,
    percentage,
    status,
  };
}

/** Computes aggregate income, expenses, and net savings directly from a chart series. */
export function calculatePeriodSummary(
  series: readonly ChartPoint[],
  currency: Currency
): PeriodSummary {
  const incomeMinor = series.reduce((acc, p) => acc + toMinorUnits(p.income, currency), 0);
  const expenseMinor = series.reduce((acc, p) => acc + toMinorUnits(p.expense, currency), 0);

  return {
    income: fromMinorUnits(incomeMinor, currency),
    expenses: fromMinorUnits(expenseMinor, currency),
    netSavings: fromMinorUnits(incomeMinor - expenseMinor, currency),
  };
}

export function getIncomeExpenseSeries(
  transactions: readonly Transaction[],
  period: AnalyticsPeriod,
  year: number,
  month: number,
  displayCurrency: Currency,
  lang: Language,
  referenceDateStr: string
): ChartPoint[] {
  if (period === 'monthly') {
    const points: ChartPoint[] = [];
    const monthNames = lang === 'km' ? MONTH_NAMES_KM : MONTH_NAMES_EN;

    for (let offset = MONTHLY_SERIES_LENGTH - 1; offset >= 0; offset--) {
      const target = shiftMonth(year, month, -offset);
      const { monthlyIncome, monthlyExpenses } = calculateMonthlyMetrics(
        transactions,
        target.year,
        target.month,
        displayCurrency
      );
      const monthName = monthNames[target.month - 1];
      const shortLabel = lang === 'km' ? monthName : monthName.slice(0, 3);
      points.push({
        label: shortLabel,
        income: monthlyIncome,
        expense: monthlyExpenses,
      });
    }
    return points;
  }

  if (period === 'weekly') {
    const monthTx = getTransactionsForMonth(transactions, year, month);
    const buckets: { label: string; txs: Transaction[] }[] = [
      { label: lang === 'km' ? 'សប្តាហ៍ ១' : 'W1', txs: [] },
      { label: lang === 'km' ? 'សប្តាហ៍ ២' : 'W2', txs: [] },
      { label: lang === 'km' ? 'សប្តាហ៍ ៣' : 'W3', txs: [] },
      { label: lang === 'km' ? 'សប្តាហ៍ ៤' : 'W4', txs: [] },
    ];

    for (const tx of monthTx) {
      const { day } = parseYearMonth(tx.date);
      const bucketIdx = Math.min(3, Math.floor((day - 1) / 7));
      buckets[bucketIdx].txs.push(tx);
    }

    return buckets.map((bucket) => ({
      label: bucket.label,
      income: calculateTotalIncome(bucket.txs, displayCurrency),
      expense: calculateTotalExpenses(bucket.txs, displayCurrency),
    }));
  }

  // Daily: last 7 days up to referenceDateStr (or end of selected month if viewing another month)
  const refParsed = parseYearMonth(referenceDateStr);
  const isCurrentSelectedMonth = refParsed.year === year && refParsed.month === month;
  const endDate = isCurrentSelectedMonth
    ? new Date(refParsed.year, refParsed.month - 1, refParsed.day)
    : new Date(year, month, 0);

  const points: ChartPoint[] = [];
  for (let offset = DAILY_SERIES_LENGTH - 1; offset >= 0; offset--) {
    const dayDate = new Date(endDate);
    dayDate.setDate(endDate.getDate() - offset);
    const iso = toISODateString(dayDate);
    const dayTx = transactions.filter((tx) => tx.date === iso);
    points.push({
      label: `${dayDate.getMonth() + 1}/${dayDate.getDate()}`,
      income: calculateTotalIncome(dayTx, displayCurrency),
      expense: calculateTotalExpenses(dayTx, displayCurrency),
    });
  }
  return points;
}

export function calculateCategoryBreakdown(
  transactions: readonly Transaction[],
  year: number,
  month: number,
  displayCurrency: Currency
): CategoryBreakdownItem[] {
  const monthExpenses = getTransactionsForMonth(transactions, year, month).filter(
    (tx) => tx.type === 'expense'
  );
  const totalExpenses = sumTransactionsInCurrency(monthExpenses, displayCurrency);
  if (monthExpenses.length === 0 || totalExpenses <= 0) return [];

  const grouped = new Map<
    string,
    { category: TransactionCategory; customLabel?: string; minor: number; count: number }
  >();

  for (const tx of monthExpenses) {
    const converted = convertCurrency(tx.amount, tx.currency, displayCurrency);
    const minor = toMinorUnits(converted, displayCurrency);
    const customTrimmed = tx.customCategory?.trim();
    const key = customTrimmed ? `custom:${customTrimmed.toLowerCase()}` : tx.category;
    const prev = grouped.get(key) ?? {
      category: tx.category,
      customLabel: customTrimmed || undefined,
      minor: 0,
      count: 0,
    };
    grouped.set(key, {
      ...prev,
      minor: prev.minor + minor,
      count: prev.count + 1,
    });
  }

  const items: CategoryBreakdownItem[] = [];
  for (const [key, val] of grouped.entries()) {
    const amount = fromMinorUnits(val.minor, displayCurrency);
    items.push({
      key,
      category: val.category,
      customLabel: val.customLabel,
      amount,
      percentage: calculateSpendingPercentage(amount, totalExpenses),
      count: val.count,
      color: getCategoryMeta(val.category).color,
    });
  }

  return items.sort((a, b) => b.amount - a.amount);
}

export function getMonthlyComparison(
  transactions: readonly Transaction[],
  year: number,
  month: number,
  displayCurrency: Currency
): MonthlyComparison {
  const { year: prevYear, month: prevMonth } = shiftMonth(year, month, -1);

  const current = calculateMonthlyMetrics(transactions, year, month, displayCurrency);
  const previous = calculateMonthlyMetrics(transactions, prevYear, prevMonth, displayCurrency);

  const calcDeltaPct = (curr: number, prev: number): number | null => {
    if (prev === 0) return curr === 0 ? 0 : null;
    return Math.round(((curr - prev) / Math.abs(prev)) * 1000) / 10;
  };

  return {
    current,
    previous,
    prevMonth,
    prevYear,
    incomeDeltaPct: calcDeltaPct(current.monthlyIncome, previous.monthlyIncome),
    expenseDeltaPct: calcDeltaPct(current.monthlyExpenses, previous.monthlyExpenses),
    savingsDeltaPct: calcDeltaPct(current.netSavings, previous.netSavings),
  };
}

/** Filters and sorts transactions according to History screen criteria. */
export function filterTransactions(
  transactions: readonly Transaction[],
  criteria: TransactionFilterCriteria,
  lang: Language,
  referenceDate: Date = new Date()
): Transaction[] {
  const query = criteria.searchQuery.trim().toLowerCase();
  const currYear = referenceDate.getFullYear();
  const currMonth = referenceDate.getMonth() + 1;
  const prev = shiftMonth(currYear, currMonth, -1);

  const matched = transactions.filter((tx) => {
    if (criteria.typeFilter !== 'all' && tx.type !== criteria.typeFilter) {
      return false;
    }

    if (criteria.dateFilter === 'this_month') {
      const p = parseYearMonth(tx.date);
      if (p.year !== currYear || p.month !== currMonth) return false;
    } else if (criteria.dateFilter === 'last_month') {
      const p = parseYearMonth(tx.date);
      if (p.year !== prev.year || p.month !== prev.month) return false;
    } else if (criteria.dateFilter === 'custom_date' && criteria.customDate) {
      if (tx.date !== criteria.customDate) return false;
    }

    if (query) {
      const categoryLabel = getCategoryLabel(tx.category, lang, tx.customCategory).toLowerCase();
      const description = tx.description.toLowerCase();
      const recipient = (tx.recipient ?? '').toLowerCase();
      const amount = String(tx.amount);
      if (
        !description.includes(query) &&
        !recipient.includes(query) &&
        !categoryLabel.includes(query) &&
        !amount.includes(query)
      ) {
        return false;
      }
    }

    return true;
  });

  return sortTransactionsNewestFirst(matched);
}
