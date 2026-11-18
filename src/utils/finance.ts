import { CATEGORY_META } from '../constants/categories';
import { MONTH_NAMES_EN, MONTH_NAMES_KM, t } from '../i18n/translations';
import type {
  AnalyticsPeriod,
  Budget,
  Currency,
  Language,
  Transaction,
  TransactionCategory,
} from '../types/finance';

export const USD_TO_KHR_RATE = 4100;

/**
 * Convert an amount into integer minor units (cents for USD, whole riels for KHR)
 * to avoid IEEE-754 floating-point precision drift during summation.
 */
export function toMinorUnits(amount: number, currency: Currency): number {
  if (!Number.isFinite(amount)) return 0;
  return currency === 'USD' ? Math.round(amount * 100) : Math.round(amount);
}

export function fromMinorUnits(minor: number, currency: Currency): number {
  return currency === 'USD' ? minor / 100 : Math.round(minor);
}

/**
 * Convert between USD and KHR cleanly using the fixed local rate (1 USD = 4,100 KHR).
 */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (!Number.isFinite(amount) || amount === 0) return 0;
  if (from === to) {
    return to === 'USD' ? Math.round(amount * 100) / 100 : Math.round(amount);
  }
  if (from === 'USD' && to === 'KHR') {
    const cents = Math.round(amount * 100);
    return Math.round((cents * USD_TO_KHR_RATE) / 100);
  }
  // KHR -> USD
  const riel = Math.round(amount);
  const cents = Math.round((riel * 100) / USD_TO_KHR_RATE);
  return cents / 100;
}

export function sumTransactionsInCurrency(
  transactions: Transaction[],
  targetCurrency: Currency
): number {
  let totalMinor = 0;
  for (const tx of transactions) {
    const converted = convertCurrency(tx.amount, tx.currency, targetCurrency);
    totalMinor += toMinorUnits(converted, targetCurrency);
  }
  return fromMinorUnits(totalMinor, targetCurrency);
}

export function formatCurrency(
  amount: number,
  currency: Currency,
  options?: { compact?: boolean; showSign?: boolean }
): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const absVal = Math.abs(safe);
  const sign = safe < 0 ? '-' : options?.showSign && safe > 0 ? '+' : '';

  if (currency === 'USD') {
    if (options?.compact && absVal >= 1000) {
      const k = absVal / 1000;
      return `${sign}$${k >= 10 ? k.toFixed(1) : k.toFixed(2)}k`;
    }
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absVal);
    return `${sign}$${formatted}`;
  }

  // KHR formatting (rounded to whole riels, standard ៛ suffix)
  const rounded = Math.round(absVal);
  if (options?.compact && rounded >= 1_000_000) {
    return `${sign}${(rounded / 1_000_000).toFixed(2)}M ៛`;
  }
  if (options?.compact && rounded >= 1_000) {
    return `${sign}${Math.round(rounded / 1_000)}k ៛`;
  }
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(rounded);
  return `${sign}${formatted} ៛`;
}

export function parseYearMonth(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  return {
    year: Number.isFinite(y) ? y : 2026,
    month: Number.isFinite(m) ? m : 1,
    day: Number.isFinite(d) ? d : 1,
  };
}

export function getTransactionsForMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return transactions.filter((tx) => {
    const parsed = parseYearMonth(tx.date);
    return parsed.year === year && parsed.month === month;
  });
}

export function calculateBalanceMetrics(
  transactions: Transaction[],
  openingBalanceUSD: number,
  displayCurrency: Currency
) {
  const openingInDisplay = convertCurrency(openingBalanceUSD, 'USD', displayCurrency);
  const incomeTx = transactions.filter((tx) => tx.type === 'income');
  const expenseTx = transactions.filter((tx) => tx.type === 'expense');
  const transferTx = transactions.filter((tx) => tx.type === 'transfer');

  const totalIncome = sumTransactionsInCurrency(incomeTx, displayCurrency);
  const totalExpenses = sumTransactionsInCurrency(expenseTx, displayCurrency);
  const totalTransfers = sumTransactionsInCurrency(transferTx, displayCurrency);

  const openingMinor = toMinorUnits(openingInDisplay, displayCurrency);
  const incomeMinor = toMinorUnits(totalIncome, displayCurrency);
  const expenseMinor = toMinorUnits(totalExpenses, displayCurrency);
  const transferMinor = toMinorUnits(totalTransfers, displayCurrency);

  const totalBalance = fromMinorUnits(
    openingMinor + incomeMinor - expenseMinor - transferMinor,
    displayCurrency
  );
  const netSavings = fromMinorUnits(incomeMinor - expenseMinor, displayCurrency);

  return {
    openingBalance: openingInDisplay,
    totalIncome,
    totalExpenses,
    totalTransfers,
    totalBalance,
    netSavings,
  };
}

export function calculateMonthlyMetrics(
  transactions: Transaction[],
  year: number,
  month: number,
  displayCurrency: Currency
) {
  const monthTx = getTransactionsForMonth(transactions, year, month);
  const incomeTx = monthTx.filter((tx) => tx.type === 'income');
  const expenseTx = monthTx.filter((tx) => tx.type === 'expense');

  const monthlyIncome = sumTransactionsInCurrency(incomeTx, displayCurrency);
  const monthlyExpenses = sumTransactionsInCurrency(expenseTx, displayCurrency);

  const incomeMinor = toMinorUnits(monthlyIncome, displayCurrency);
  const expenseMinor = toMinorUnits(monthlyExpenses, displayCurrency);
  const netSavings = fromMinorUnits(incomeMinor - expenseMinor, displayCurrency);

  return {
    monthlyIncome,
    monthlyExpenses,
    netSavings,
    count: monthTx.length,
  };
}

export function calculateBudgetMetrics(
  budget: Budget | undefined,
  transactions: Transaction[],
  year: number,
  month: number,
  displayCurrency: Currency
) {
  const { monthlyExpenses } = calculateMonthlyMetrics(transactions, year, month, displayCurrency);
  if (!budget) {
    return {
      hasBudget: false,
      limit: 0,
      spent: monthlyExpenses,
      remaining: 0,
      percentage: 0,
      status: 'none' as const,
    };
  }

  const limit = convertCurrency(budget.amount, budget.currency, displayCurrency);
  const limitMinor = toMinorUnits(limit, displayCurrency);
  const spentMinor = toMinorUnits(monthlyExpenses, displayCurrency);
  const remaining = fromMinorUnits(limitMinor - spentMinor, displayCurrency);

  const percentage = limit > 0 ? Math.round((monthlyExpenses / limit) * 1000) / 10 : 0;

  let status: 'healthy' | 'warning' | 'exceeded' = 'healthy';
  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 80) {
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

export interface ChartPoint {
  label: string;
  income: number;
  expense: number;
}

export function getIncomeExpenseSeries(
  transactions: Transaction[],
  period: AnalyticsPeriod,
  year: number,
  month: number,
  displayCurrency: Currency,
  lang: Language,
  referenceDateStr: string
): ChartPoint[] {
  if (period === 'monthly') {
    // Last 6 months ending at selected (year, month)
    const points: ChartPoint[] = [];
    const monthNames = lang === 'km' ? MONTH_NAMES_KM : MONTH_NAMES_EN;
    for (let offset = 5; offset >= 0; offset--) {
      let m = month - offset;
      let y = year;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      const { monthlyIncome, monthlyExpenses } = calculateMonthlyMetrics(
        transactions,
        y,
        m,
        displayCurrency
      );
      const shortLabel = lang === 'km' ? monthNames[m - 1] : monthNames[m - 1].slice(0, 3);
      points.push({
        label: shortLabel,
        income: monthlyIncome,
        expense: monthlyExpenses,
      });
    }
    return points;
  }

  if (period === 'weekly') {
    // Weeks 1..4/5 of selected month
    const monthTx = getTransactionsForMonth(transactions, year, month);
    const buckets: { label: string; txs: Transaction[] }[] = [
      { label: lang === 'km' ? 'សប្តាហ៍ ១' : 'W1', txs: [] },
      { label: lang === 'km' ? 'សប្តាហ៍ ២' : 'W2', txs: [] },
      { label: lang === 'km' ? 'សប្តាហ៍ ៣' : 'W3', txs: [] },
      { label: lang === 'km' ? 'សប្តាហ៍ ៤' : 'W4', txs: [] },
    ];
    for (const tx of monthTx) {
      const { day } = parseYearMonth(tx.date);
      const idx = Math.min(3, Math.floor((day - 1) / 7));
      buckets[idx].txs.push(tx);
    }
    return buckets.map((b) => ({
      label: b.label,
      income: sumTransactionsInCurrency(
        b.txs.filter((tx) => tx.type === 'income'),
        displayCurrency
      ),
      expense: sumTransactionsInCurrency(
        b.txs.filter((tx) => tx.type === 'expense'),
        displayCurrency
      ),
    }));
  }

  // Daily: last 7 days up to referenceDateStr (or end of selected month if viewing another month)
  const refParsed = parseYearMonth(referenceDateStr);
  const isCurrentSelectedMonth = refParsed.year === year && refParsed.month === month;
  const endDate = isCurrentSelectedMonth
    ? new Date(refParsed.year, refParsed.month - 1, refParsed.day)
    : new Date(year, month, 0);

  const points: ChartPoint[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - offset);
    const iso = toISODateString(d);
    const dayTx = transactions.filter((tx) => tx.date === iso);
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    points.push({
      label: dayLabel,
      income: sumTransactionsInCurrency(
        dayTx.filter((tx) => tx.type === 'income'),
        displayCurrency
      ),
      expense: sumTransactionsInCurrency(
        dayTx.filter((tx) => tx.type === 'expense'),
        displayCurrency
      ),
    });
  }
  return points;
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

export function getCategoryBreakdown(
  transactions: Transaction[],
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
    const percentage = Math.round((amount / totalExpenses) * 1000) / 10;
    items.push({
      key,
      category: val.category,
      customLabel: val.customLabel,
      amount,
      percentage,
      count: val.count,
      color: CATEGORY_META[val.category]?.color ?? '#0E5A3E',
    });
  }

  return items.sort((a, b) => b.amount - a.amount);
}

export function getMonthlyComparison(
  transactions: Transaction[],
  year: number,
  month: number,
  displayCurrency: Currency
) {
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth <= 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

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

export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatReadableDate(dateStr: string, lang: Language, todayStr: string): string {
  if (dateStr === todayStr) return t(lang, 'today');
  const todayParsed = parseYearMonth(todayStr);
  const todayObj = new Date(todayParsed.year, todayParsed.month - 1, todayParsed.day);
  const yesterdayObj = new Date(todayObj);
  yesterdayObj.setDate(todayObj.getDate() - 1);
  if (dateStr === toISODateString(yesterdayObj)) return t(lang, 'yesterday');

  const { year, month, day } = parseYearMonth(dateStr);
  const monthNames = lang === 'km' ? MONTH_NAMES_KM : MONTH_NAMES_EN;
  const monthLabel = lang === 'km' ? monthNames[month - 1] : monthNames[month - 1].slice(0, 3);
  return lang === 'km' ? `${day} ${monthLabel} ${year}` : `${monthLabel} ${day}, ${year}`;
}

export function exportTransactionsToCSV(transactions: Transaction[], lang: Language): void {
  const headers = [
    'ID',
    'Date',
    'Type',
    'Category',
    'Recipient',
    'Amount',
    'Currency',
    'Description',
    'CreatedAt',
  ];
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = transactions
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((tx) => {
      const catLabel =
        tx.customCategory?.trim() ||
        t(lang, CATEGORY_META[tx.category]?.labelKey ?? 'cat_other');
      return [
        tx.id,
        tx.date,
        tx.type,
        catLabel,
        tx.recipient ?? '',
        tx.amount,
        tx.currency,
        tx.description,
        tx.createdAt,
      ]
        .map(escapeCell)
        .join(',');
    });

  // Add UTF-8 BOM so Excel / Numbers renders Khmer Unicode properly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sovan-transactions-${toISODateString(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
