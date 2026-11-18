import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { HighestCategoryCard } from '../components/analytics/HighestCategoryCard';
import { MonthlyComparisonCard } from '../components/analytics/MonthlyComparisonCard';
import { PeriodSummaryCards } from '../components/analytics/PeriodSummaryCards';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { EmptyState } from '../components/common/EmptyState';
import { MonthSelector } from '../components/common/MonthSelector';
import { useCategoryBreakdown } from '../hooks/useTransactions';
import { formatMonthYear, t, type TranslationKey } from '../i18n/translations';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransactionStore } from '../stores/transactionStore';
import type { AnalyticsPeriod } from '../types';
import {
  calculatePeriodSummary,
  getIncomeExpenseSeries,
  getMonthlyComparison,
} from '../utils/calculations';
import { fromMinorUnits, toMinorUnits } from '../utils/currency';
import { toISODateString } from '../utils/date';

const PERIOD_OPTIONS: readonly { id: AnalyticsPeriod; labelKey: TranslationKey }[] = [
  { id: 'daily', labelKey: 'period_daily' },
  { id: 'weekly', labelKey: 'period_weekly' },
  { id: 'monthly', labelKey: 'period_monthly' },
];

interface AnalyticsScreenProps {
  selectedMonth: number;
  selectedYear: number;
  onChangeMonth: (month: number, year: number) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  selectedMonth,
  selectedYear,
  onChangeMonth,
}) => {
  const lang = useSettingsStore((s) => s.language);
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useTransactionStore((s) => s.transactions);
  const [period, setPeriod] = useState<AnalyticsPeriod>('monthly');

  const todayStr = toISODateString(new Date());

  const series = useMemo(
    () =>
      getIncomeExpenseSeries(
        transactions,
        period,
        selectedYear,
        selectedMonth,
        currency,
        lang,
        todayStr
      ),
    [transactions, period, selectedYear, selectedMonth, currency, lang, todayStr]
  );

  // Derive KPI totals directly from the chart series so summary cards and chart stay 100% in sync.
  const periodSummary = useMemo(
    () => calculatePeriodSummary(series, currency),
    [series, currency]
  );

  const categoryItems = useCategoryBreakdown(selectedYear, selectedMonth);
  const highestCategory = categoryItems[0] ?? null;

  const totalMonthExpenses = useMemo(
    () =>
      fromMinorUnits(
        categoryItems.reduce((acc, item) => acc + toMinorUnits(item.amount, currency), 0),
        currency
      ),
    [categoryItems, currency]
  );

  const comparison = useMemo(
    () => getMonthlyComparison(transactions, selectedYear, selectedMonth, currency),
    [transactions, selectedYear, selectedMonth, currency]
  );

  const activePeriodLabel = t(
    lang,
    PERIOD_OPTIONS.find((opt) => opt.id === period)?.labelKey ?? 'period_monthly'
  );

  return (
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2]">
          {t(lang, 'financial_analytics')}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Switch */}
          <div className="inline-flex p-1 rounded-xl bg-[#0E5A3E]/8 dark:bg-white/8">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  period === opt.id
                    ? 'bg-white dark:bg-[#1B2A22] text-[#0F1F18] dark:text-[#F1F5F2] shadow-xs'
                    : 'text-[#5B7268] dark:text-[#96ACA1] hover:text-[#0F1F18] dark:hover:text-white'
                }`}
              >
                {t(lang, opt.labelKey)}
              </button>
            ))}
          </div>

          <MonthSelector
            month={selectedMonth}
            year={selectedYear}
            lang={lang}
            onChange={onChangeMonth}
          />
        </div>
      </div>

      <PeriodSummaryCards
        summary={periodSummary}
        period={period}
        currency={currency}
        lang={lang}
      />

      {/* Main Chart */}
      <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
            {t(lang, 'income_vs_expense')}
          </h2>
          <span className="text-xs text-[#5B7268] dark:text-[#96ACA1]">{activePeriodLabel}</span>
        </div>
        <IncomeExpenseChart data={series} currency={currency} lang={lang} height={240} />
      </section>

      {/* Category Breakdown + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
              {t(lang, 'spending_by_category')}
            </h2>
            <span className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
              {formatMonthYear(selectedMonth, selectedYear, lang)}
            </span>
          </div>

          {categoryItems.length > 0 ? (
            <CategoryDonutChart
              items={categoryItems}
              totalAmount={totalMonthExpenses}
              currency={currency}
              lang={lang}
            />
          ) : (
            <EmptyState
              icon={<BarChart3 size={22} />}
              title={t(lang, 'no_expense_data')}
              description={formatMonthYear(selectedMonth, selectedYear, lang)}
            />
          )}
        </section>

        <div className="lg:col-span-5 space-y-5">
          <HighestCategoryCard
            highestCategory={highestCategory}
            currency={currency}
            lang={lang}
          />

          <MonthlyComparisonCard
            comparison={comparison}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            currency={currency}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
};
