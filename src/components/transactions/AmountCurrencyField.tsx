import React from 'react';
import { AlertCircle } from 'lucide-react';
import { t } from '../../i18n/translations';
import type { Currency, Language, TransactionType } from '../../types';
import { formatCurrency } from '../../utils/currency';

const CURRENCY_OPTIONS: readonly Currency[] = ['USD', 'KHR'];

interface AmountCurrencyFieldProps {
  type: TransactionType;
  amount: string;
  currency: Currency;
  availableBalance: number;
  error?: string;
  lang: Language;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (currency: Currency) => void;
}

export const AmountCurrencyField: React.FC<AmountCurrencyFieldProps> = ({
  type,
  amount,
  currency,
  availableBalance,
  error,
  lang,
  onAmountChange,
  onCurrencyChange,
}) => {
  return (
    <div>
      <label
        htmlFor="tx-amount"
        className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-1.5"
      >
        {t(lang, 'amount')}
      </label>
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-[#4A6157] dark:text-[#A3B8AE] pointer-events-none">
            {currency === 'USD' ? '$' : '៛'}
          </span>
          <input
            id="tx-amount"
            type="number"
            inputMode="decimal"
            step={currency === 'USD' ? '0.01' : '100'}
            min="0"
            placeholder={currency === 'USD' ? '0.00' : '0'}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className={`w-full min-h-[48px] pl-9 pr-4 rounded-xl border text-lg font-semibold tabular-nums font-mono-num bg-[#FAFBF9] dark:bg-[#0B120E] text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-[#0E5A3E]/18 dark:border-white/14 focus:ring-[#0E5A3E]/30 focus:border-[#0E5A3E]'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 p-1 rounded-xl border border-[#0E5A3E]/14 dark:border-white/12 bg-[#FAFBF9] dark:bg-[#0B120E] shrink-0">
          {CURRENCY_OPTIONS.map((cur) => (
            <button
              key={cur}
              type="button"
              onClick={() => onCurrencyChange(cur)}
              className={`px-3 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                currency === cur
                  ? 'bg-[#C89B3C] text-white'
                  : 'text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      {type === 'transfer' && (
        <div className="mt-2 flex items-center justify-between text-xs px-1">
          <span className="text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'available_balance')}:
          </span>
          <span
            className={`font-semibold tabular-nums font-mono-num ${
              availableBalance <= 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-[#0E5A3E] dark:text-[#5AD3A3]'
            }`}
          >
            {formatCurrency(availableBalance, currency)}
          </span>
        </div>
      )}

      {type === 'transfer' && availableBalance <= 0 && !error && (
        <div
          role="alert"
          className="mt-2 rounded-xl border border-red-500/25 bg-red-600/8 dark:bg-red-500/12 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2"
        >
          <AlertCircle size={15} className="shrink-0" />
          <span>{t(lang, 'alert_balance_zero_transfer')}</span>
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
