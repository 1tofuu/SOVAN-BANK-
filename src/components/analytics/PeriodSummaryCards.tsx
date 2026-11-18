import React from 'react';
import { t, type TranslationKey } from '../../i18n/translations';
import type { AnalyticsPeriod, Currency, Language, PeriodSummary } from '../../types';
import { formatCurrency } from '../../utils/currency';

const PERIOD_LABEL_KEYS: Record<AnalyticsPeriod, TranslationKey> = {
  daily: 'period_daily',
  weekly: 'period_weekly',
  monthly: 'period_monthly',
};

interface PeriodSummaryCardsProps {
  summary: PeriodSummary;
  period: AnalyticsPeriod;
  currency: Currency;
  lang: Language;
}

export const PeriodSummaryCards: React.FC<PeriodSummaryCardsProps> = ({
  summary,
  period,
  currency,
  lang,
}) => {
  const periodLabel = t(lang, PERIOD_LABEL_KEYS[period]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5">
        <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
          {t(lang, 'total_income')} · {periodLabel}
        </p>
        <p className="text-2xl font-bold tabular-nums font-mono-num text-[#0E5A3E] dark:text-[#5AD3A3] mt-2">
          {formatCurrency(summary.income, currency)}
        </p>
      </div>

      <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5">
        <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
          {t(lang, 'total_expenses')} · {periodLabel}
        </p>
        <p className="text-2xl font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] mt-2">
          {formatCurrency(summary.expenses, currency)}
        </p>
      </div>

      <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5">
        <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
          {t(lang, 'net_savings')} · {periodLabel}
        </p>
        <p
          className={`text-2xl font-bold tabular-nums font-mono-num mt-2 ${
            summary.netSavings >= 0
              ? 'text-[#9A7422] dark:text-[#E5C16C]'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(summary.netSavings, currency, { showSign: true })}
        </p>
      </div>
    </div>
  );
};
