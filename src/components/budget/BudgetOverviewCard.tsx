import React from 'react';
import { AlertTriangle, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { formatMonthYear, t } from '../../i18n/translations';
import type { BudgetMetrics, Currency, Language } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface BudgetOverviewCardProps {
  metrics: BudgetMetrics;
  selectedMonth: number;
  selectedYear: number;
  displayCurrency: Currency;
  lang: Language;
  onEdit: () => void;
  onRequestDelete: () => void;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  metrics,
  selectedMonth,
  selectedYear,
  displayCurrency,
  lang,
  onEdit,
  onRequestDelete,
}) => {
  const isExceeded = metrics.status === 'exceeded';
  const isWarning = metrics.status === 'warning';

  const statusTextClass = isExceeded
    ? 'text-red-600 dark:text-red-400 font-semibold'
    : isWarning
    ? 'text-[#9A7422] dark:text-[#E5C16C] font-semibold'
    : 'text-[#0E5A3E] dark:text-[#5AD3A3] font-semibold';

  const progressBarClass = isExceeded
    ? 'bg-red-600'
    : isWarning
    ? 'bg-[#C89B3C]'
    : 'bg-[#0E5A3E] dark:bg-[#2E9E72]';

  const statusLabel = isExceeded
    ? t(lang, 'status_exceeded')
    : isWarning
    ? t(lang, 'status_warning')
    : t(lang, 'status_healthy');

  return (
    <section className="lg:col-span-7 rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'monthly_budget')} · {formatMonthYear(selectedMonth, selectedYear, lang)}
          </p>
          <p className="text-3xl font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] mt-1">
            {formatCurrency(metrics.limit, displayCurrency)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="min-h-[40px] px-3.5 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 text-xs font-semibold text-[#0E5A3E] dark:text-[#5AD3A3] hover:bg-[#0E5A3E]/6 dark:hover:bg-white/8 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Pencil size={14} />
            <span>{t(lang, 'edit_budget')}</span>
          </button>
          <button
            type="button"
            onClick={onRequestDelete}
            aria-label={t(lang, 'delete_budget')}
            className="min-h-[40px] min-w-[40px] px-2.5 rounded-xl bg-red-600/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-600/18 flex items-center justify-center"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="inline-flex items-center gap-1.5">
            {isExceeded ? (
              <AlertTriangle size={15} className="text-red-600 dark:text-red-400" />
            ) : isWarning ? (
              <AlertTriangle size={15} className="text-[#C89B3C]" />
            ) : (
              <CheckCircle2 size={15} className="text-[#0E5A3E] dark:text-[#5AD3A3]" />
            )}
            <span className={statusTextClass}>{statusLabel}</span>
          </span>
          <span className="tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] font-semibold">
            {metrics.percentage.toFixed(1)}%
          </span>
        </div>

        <div className="h-3.5 w-full rounded-full bg-[#0E5A3E]/10 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressBarClass}`}
            style={{ width: `${Math.min(100, metrics.percentage)}%` }}
          />
        </div>
      </div>

      {/* Spent vs Remaining */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#0E5A3E]/10 dark:border-white/10">
        <div>
          <p className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'total_spending')}
          </p>
          <p className="text-lg font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] mt-1">
            {formatCurrency(metrics.spent, displayCurrency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
            {metrics.remaining < 0
              ? t(lang, 'over_budget_by')
              : t(lang, 'left_to_spend')}
          </p>
          <p
            className={`text-lg font-bold tabular-nums font-mono-num mt-1 ${
              metrics.remaining < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-[#0E5A3E] dark:text-[#5AD3A3]'
            }`}
          >
            {formatCurrency(Math.abs(metrics.remaining), displayCurrency)}
          </p>
        </div>
      </div>

      {/* Warning Notice */}
      {(isWarning || isExceeded) && (
        <div
          className={`rounded-xl p-3.5 border flex items-start gap-3 text-xs leading-relaxed ${
            isExceeded
              ? 'bg-red-600/8 dark:bg-red-500/12 border-red-600/20 text-red-700 dark:text-red-300'
              : 'bg-[#C89B3C]/12 border-[#C89B3C]/30 text-[#846218] dark:text-[#E5C16C]'
          }`}
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            {isExceeded ? t(lang, 'warning_exceeded') : t(lang, 'warning_approaching')}
          </span>
        </div>
      )}
    </section>
  );
};
