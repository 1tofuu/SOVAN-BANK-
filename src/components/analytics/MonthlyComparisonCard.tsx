import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatMonthYear, t } from '../../i18n/translations';
import type { Currency, Language, MonthlyComparison } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface DeltaBadgeProps {
  deltaPct: number | null;
  invertGood?: boolean;
}

const DeltaBadge: React.FC<DeltaBadgeProps> = ({ deltaPct, invertGood = false }) => {
  if (deltaPct === null) {
    return <span className="text-xs text-[#5B7268] dark:text-[#96ACA1]">—</span>;
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
      <span>{deltaPct > 0 ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`}</span>
    </span>
  );
};

interface MonthlyComparisonCardProps {
  comparison: MonthlyComparison;
  selectedMonth: number;
  selectedYear: number;
  currency: Currency;
  lang: Language;
}

export const MonthlyComparisonCard: React.FC<MonthlyComparisonCardProps> = ({
  comparison,
  selectedMonth,
  selectedYear,
  currency,
  lang,
}) => {
  return (
    <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
          {t(lang, 'monthly_comparison')}
        </h2>
        <p className="text-xs text-[#5B7268] dark:text-[#96ACA1] mt-0.5">
          {formatMonthYear(selectedMonth, selectedYear, lang)} · {t(lang, 'vs_last_month')} (
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
            <DeltaBadge deltaPct={comparison.incomeDeltaPct} />
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
            <DeltaBadge deltaPct={comparison.expenseDeltaPct} invertGood />
          </div>
        </div>

        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE]">
            {t(lang, 'net_savings')}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2]">
              {formatCurrency(comparison.current.netSavings, currency, { showSign: true })}
            </span>
            <DeltaBadge deltaPct={comparison.savingsDeltaPct} />
          </div>
        </div>
      </div>
    </section>
  );
};
