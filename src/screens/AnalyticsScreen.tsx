import React, { useState } from 'react';
import { Award, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { CATEGORY_META } from '../constants/categories';
import { formatMonthYear, t } from '../i18n/translations';
import { useSettingsStore } from '../stores/settingsStore';
import type { AnalyticsPeriod, Transaction } from '../types/finance';
import {
  formatCurrency,
  fromMinorUnits,
  getCategoryBreakdown,
  getIncomeExpenseSeries,
  getMonthlyComparison,
  toISODateString,
  toMinorUnits,
} from '../utils/finance';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { EmptyState } from '../components/common/EmptyState';
import { MonthSelector } from '../components/common/MonthSelector';

interface AnalyticsScreenProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  onChangeMonth: (month: number, year: number) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  transactions,
  selectedMonth,
  selectedYear,
  onChangeMonth,
}) => {
  const lang = useSettingsStore((s) => s.language);
  const currency = useSettingsStore((s) => s.currency);
  const [period, setPeriod] = useState<AnalyticsPeriod>('monthly');

  const todayStr = toISODateString(new Date());
  const series = getIncomeExpenseSeries(
    transactions,
    period,
    selectedYear,
    selectedMonth,
    currency,
    lang,
    todayStr
  );

  // Compute period totals directly from the real chart series so summary cards and chart match 100%
  const periodIncome = fromMinorUnits(
    series.reduce((acc, p) => acc + toMinorUnits(p.income, currency), 0),
    currency
  );
  const periodExpenses = fromMinorUnits(
    series.reduce((acc, p) => acc + toMinorUnits(p.expense, currency), 0),
    currency
  );
  const periodNetSavings = fromMinorUnits(
    toMinorUnits(periodIncome, currency) - toMinorUnits(periodExpenses, currency),
    currency
  );

  const categoryItems = getCategoryBreakdown(
    transactions,
    selectedYear,
    selectedMonth,
    currency
  );
  const highestCategory = categoryItems[0] ?? null;
  const totalMonthExpenses = fromMinorUnits(
    categoryItems.reduce((acc, c) => acc + toMinorUnits(c.amount, currency), 0),
    currency
  );

  const comparison = getMonthlyComparison(
    transactions,
    selectedYear,
    selectedMonth,
    currency
  );

  const renderDeltaBadge = (deltaPct: number | null, invertGood = false) => {
    if (deltaPct === null) {
      return (
        <span className="text-xs text-[#5B7268] dark:text-[#96ACA1]">—</span>
      );
    }
    const isUp = deltaPct > 0;
    const isGood = invertGood ? !isUp : isUp;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums font-mono-num ${
          deltaPct === 0
            ? 'text-[#5B7268] dark:text-[#96ACA1]'
            : isGood
            ? 'text-[#0E5A3E] dark:text-[#5AD3A3]'
            : 'text-[#9A7422] dark:text-[#E5C16C]'
        }`}
      >
        {deltaPct > 0 ? <TrendingUp size={13} /> : deltaPct < 0 ? <TrendingDown size={13} /> : null}
        <span>
          {deltaPct > 0 ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`}
        </span>
      </span>
    );
  };

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
            {(['daily', 'weekly', 'monthly'] as AnalyticsPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  period === p
                    ? 'bg-white dark:bg-[#1B2A22] text-[#0F1F18] dark:text-[#F1F5F2] shadow-xs'
                    : 'text-[#5B7268] dark:text-[#96ACA1] hover:text-[#0F1F18] dark:hover:text-white'
                }`}
              >
                {t(lang, `period_${p}`)}
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

      {/* Period Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5">
          <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'total_income')} · {t(lang, `period_${period}`)}
          </p>
          <p className="text-2xl font-bold tabular-nums font-mono-num text-[#0E5A3E] dark:text-[#5AD3A3] mt-2">
            {formatCurrency(periodIncome, currency)}
          </p>
        </div>

        <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5">
          <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'total_expenses')} · {t(lang, `period_${period}`)}
          </p>
          <p className="text-2xl font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] mt-2">
            {formatCurrency(periodExpenses, currency)}
          </p>
        </div>

        <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5">
          <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'net_savings')} · {t(lang, `period_${period}`)}
          </p>
          <p
            className={`text-2xl font-bold tabular-nums font-mono-num mt-2 ${
              periodNetSavings >= 0
                ? 'text-[#9A7422] dark:text-[#E5C16C]'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(periodNetSavings, currency, { showSign: true })}
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
            {t(lang, 'income_vs_expense')}
          </h2>
          <span className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, `period_${period}`)}
          </span>
        </div>
        <IncomeExpenseChart
          data={series}
          currency={currency}
          lang={lang}
          height={240}
        />
      </section>

      {/* Category Breakdown + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Spending Breakdown by Category */}
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

        {/* Highest Category + Monthly Comparison */}
        <div className="lg:col-span-5 space-y-5">
          {/* Highest Spending Category */}
          <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-[#5B7268] dark:text-[#96ACA1] mb-3">
              <Award size={15} className="text-[#C89B3C]" />
              <span>{t(lang, 'highest_spending_category')}</span>
            </div>

            {highestCategory ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      CATEGORY_META[highestCategory.category].bgLight
                    } ${CATEGORY_META[highestCategory.category].bgDark} ${
                      CATEGORY_META[highestCategory.category].textLight
                    } ${CATEGORY_META[highestCategory.category].textDark}`}
                  >
                    <CategoryIcon category={highestCategory.category} size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2] truncate">
                      {highestCategory.customLabel ||
                        t(lang, CATEGORY_META[highestCategory.category].labelKey)}
                    </p>
                    <p className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
                      {highestCategory.percentage.toFixed(1)}% {t(lang, 'share_of_spending')}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] shrink-0">
                  {formatCurrency(highestCategory.amount, currency)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#5B7268] dark:text-[#96ACA1]">
                {t(lang, 'no_expense_data')}
              </p>
            )}
          </section>

          {/* Monthly Comparison */}
          <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
                {t(lang, 'monthly_comparison')}
              </h2>
              <p className="text-xs text-[#5B7268] dark:text-[#96ACA1] mt-0.5">
                {formatMonthYear(selectedMonth, selectedYear, lang)} ·{' '}
                {t(lang, 'vs_last_month')} (
                {formatMonthYear(comparison.prevMonth, comparison.prevYear, lang)})
              </p>
            </div>

            <div className="divide-y divide-[#0E5A3E]/8 dark:divide-white/8">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE]">
                  {t(lang, 'monthly_income')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2]">
                    {formatCurrency(comparison.current.monthlyIncome, currency)}
                  </span>
                  {renderDeltaBadge(comparison.incomeDeltaPct)}
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE]">
                  {t(lang, 'monthly_expenses')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2]">
                    {formatCurrency(comparison.current.monthlyExpenses, currency)}
                  </span>
                  {renderDeltaBadge(comparison.expenseDeltaPct, true)}
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE]">
                  {t(lang, 'net_savings')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2]">
                    {formatCurrency(comparison.current.netSavings, currency, {
                      showSign: true,
                    })}
                  </span>
                  {renderDeltaBadge(comparison.savingsDeltaPct)}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
