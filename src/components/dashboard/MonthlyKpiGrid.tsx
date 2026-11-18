import React from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, PiggyBank } from 'lucide-react';
import { t } from '../../i18n/translations';
import type { BudgetMetrics, Currency, Language, MonthlyMetrics } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface MonthlyKpiGridProps {
  monthlyMetrics: MonthlyMetrics;
  budgetMetrics: BudgetMetrics;
  currency: Currency;
  lang: Language;
  onNavigateBudget: () => void;
}

export const MonthlyKpiGrid: React.FC<MonthlyKpiGridProps> = ({
  monthlyMetrics,
  budgetMetrics,
  currency,
  lang,
  onNavigateBudget,
}) => {
  const budgetAmountClass =
    budgetMetrics.status === 'exceeded'
      ? 'text-red-600 dark:text-red-400'
      : budgetMetrics.status === 'warning'
      ? 'text-[#9A7422] dark:text-[#E5C16C]'
      : 'text-[#0F1F18] dark:text-[#F1F5F2]';

  const budgetBarClass =
    budgetMetrics.status === 'exceeded'
      ? 'bg-red-600'
      : budgetMetrics.status === 'warning'
      ? 'bg-[#C89B3C]'
      : 'bg-[#0E5A3E] dark:bg-[#2E9E72]';

  return (
    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Monthly Income */}
      <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'monthly_income')}
          </span>
          <span className="w-8 h-8 rounded-xl bg-[#0E5A3E]/10 dark:bg-[#19875D]/20 text-[#0E5A3E] dark:text-[#5AD3A3] flex items-center justify-center shrink-0">
            <ArrowDownLeft size={16} />
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xl sm:text-2xl font-bold tabular-nums font-mono-num text-[#0E5A3E] dark:text-[#5AD3A3] truncate">
            {formatCurrency(monthlyMetrics.monthlyIncome, currency)}
          </p>
          <p className="text-xs text-[#5B7268] dark:text-[#96ACA1] mt-1">
            {t(lang, 'income')}
          </p>
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'monthly_expenses')}
          </span>
          <span className="w-8 h-8 rounded-xl bg-[#C89B3C]/14 dark:bg-[#C89B3C]/20 text-[#9A7422] dark:text-[#E5C16C] flex items-center justify-center shrink-0">
            <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xl sm:text-2xl font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] truncate">
            {formatCurrency(monthlyMetrics.monthlyExpenses, currency)}
          </p>
          <p className="text-xs text-[#5B7268] dark:text-[#96ACA1] mt-1">
            {t(lang, 'expense')}
          </p>
        </div>
      </div>

      {/* Remaining Budget */}
      <button
        type="button"
        onClick={onNavigateBudget}
        className="text-left rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 hover:border-[#0E5A3E]/30 dark:hover:border-[#C89B3C]/40 p-5 flex flex-col justify-between transition-colors"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'remaining_budget')}
          </span>
          <span className="w-8 h-8 rounded-xl bg-[#0E5A3E]/8 dark:bg-white/8 text-[#0E5A3E] dark:text-[#C89B3C] flex items-center justify-center shrink-0">
            <PiggyBank size={16} />
          </span>
        </div>

        {budgetMetrics.hasBudget ? (
          <div className="mt-4 w-full">
            <p className={`text-xl sm:text-2xl font-bold tabular-nums font-mono-num truncate ${budgetAmountClass}`}>
              {formatCurrency(budgetMetrics.remaining, currency)}
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#0E5A3E]/10 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${budgetBarClass}`}
                style={{ width: `${Math.min(100, budgetMetrics.percentage)}%` }}
              />
            </div>
            <p className="text-[11px] tabular-nums font-mono-num text-[#5B7268] dark:text-[#96ACA1] mt-1.5">
              {budgetMetrics.percentage.toFixed(0)}% ·{' '}
              {formatCurrency(budgetMetrics.limit, currency, { compact: currency === 'KHR' })}
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
              {t(lang, 'no_budget_set')}
            </p>
            <p className="text-xs font-medium text-[#0E5A3E] dark:text-[#C89B3C] mt-1 inline-flex items-center gap-1">
              <span>{t(lang, 'set_budget_prompt')}</span>
              <ArrowRight size={13} />
            </p>
          </div>
        )}
      </button>
    </div>
  );
};
