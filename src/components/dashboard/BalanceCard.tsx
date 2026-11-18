import React from 'react';
import { AlertTriangle, ArrowDownLeft, Eye, EyeOff, Plus, Send, X } from 'lucide-react';
import { BRAND_ASSETS } from '../../constants/app';
import { t } from '../../i18n/translations';
import type { Currency, Language, TransactionType } from '../../types';
import { formatCurrency } from '../../utils/currency';

const CURRENCY_OPTIONS: readonly Currency[] = ['USD', 'KHR'];

interface BalanceCardProps {
  totalBalance: number;
  openingBalance: number;
  currency: Currency;
  lang: Language;
  balanceBlurred: boolean;
  transferAlert: boolean;
  onToggleBalanceBlurred: () => void;
  onSelectCurrency: (currency: Currency) => void;
  onOpenAdd: (initialType?: TransactionType) => void;
  onTransferClick: () => void;
  onDismissTransferAlert: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  openingBalance,
  currency,
  lang,
  balanceBlurred,
  transferAlert,
  onToggleBalanceBlurred,
  onSelectCurrency,
  onOpenAdd,
  onTransferClick,
  onDismissTransferAlert,
}) => {
  const formattedBalance = formatCurrency(totalBalance, currency);
  const isVeryLong = formattedBalance.length > 20;
  const isLong = formattedBalance.length > 15;
  const balanceSizeClass = isVeryLong
    ? 'text-xl sm:text-2xl break-words'
    : isLong
    ? 'text-2xl sm:text-[30px] whitespace-nowrap'
    : 'text-[32px] sm:text-4xl whitespace-nowrap';

  const visibilityLabel = balanceBlurred ? t(lang, 'show_balance') : t(lang, 'hide_balance');

  return (
    <section className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-[#CBE8C3] text-[#0B2E1F] p-6 shadow-md border border-[#0E5A3E]/15 flex flex-col justify-between min-h-[220px]">
      <img
        src={BRAND_ASSETS.cardBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.24] pointer-events-none select-none"
      />

      <div className="relative z-10 space-y-2">
        {/* Top Row: Label + Privacy Eye + Currency Switcher */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#144732] drop-shadow-[0_1px_1px_rgba(255,255,255,0.65)]">
            {t(lang, 'total_balance')}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleBalanceBlurred}
              aria-label={visibilityLabel}
              aria-pressed={balanceBlurred}
              title={visibilityLabel}
              className="min-h-[36px] min-w-[36px] rounded-xl bg-white/45 backdrop-blur-md border border-[#0E5A3E]/15 text-[#144732] hover:text-[#082619] hover:bg-white/60 flex items-center justify-center transition-colors"
            >
              {balanceBlurred ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>

            <div className="inline-flex p-0.5 rounded-xl bg-white/45 backdrop-blur-md border border-[#0E5A3E]/15 shrink-0">
              {CURRENCY_OPTIONS.map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => onSelectCurrency(cur)}
                  className={`min-h-[32px] px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    currency === cur
                      ? 'bg-[#C89B3C] text-white shadow-xs'
                      : 'text-[#144732] hover:text-[#082619]'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full-Width Balance Display */}
        <div className="w-full min-w-0">
          <p
            onClick={onToggleBalanceBlurred}
            title={visibilityLabel}
            className={`font-bold tracking-tight tabular-nums font-mono-num leading-tight text-[#082619] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] cursor-pointer transition-[filter] duration-200 ${
              balanceBlurred ? 'blur-md select-none' : ''
            } ${balanceSizeClass}`}
          >
            {formattedBalance}
          </p>
          <p className="text-xs font-medium text-[#1D543B] mt-1.5 tabular-nums font-mono-num break-words drop-shadow-[0_1px_1px_rgba(255,255,255,0.65)]">
            {t(lang, 'opening_balance')}:{' '}
            <span
              className={`inline-block transition-[filter] duration-200 ${
                balanceBlurred ? 'blur-[5px] select-none' : ''
              }`}
            >
              {formatCurrency(openingBalance, currency)}
            </span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 pt-5">
        <button
          type="button"
          onClick={() => onOpenAdd('expense')}
          className="h-9 px-3 py-1.5 rounded-lg bg-[#C89B3C] hover:bg-[#D5A746] active:scale-[0.98] text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm"
        >
          <Plus size={14} />
          <span>{t(lang, 'quick_add')}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenAdd('income')}
          className="h-9 px-2.5 py-1.5 rounded-lg bg-[#0E5A3E]/85 hover:bg-[#0E5A3E] backdrop-blur-sm text-white text-xs font-medium transition-colors inline-flex items-center gap-1 whitespace-nowrap shadow-xs"
        >
          <ArrowDownLeft size={13} />
          <span>{t(lang, 'income')}</span>
        </button>

        <button
          type="button"
          onClick={onTransferClick}
          className="h-9 px-2.5 py-1.5 rounded-lg bg-[#0E5A3E]/85 hover:bg-[#0E5A3E] backdrop-blur-sm text-white text-xs font-medium transition-colors inline-flex items-center gap-1 whitespace-nowrap shadow-xs"
        >
          <Send size={12} />
          <span>{t(lang, 'transfer_out')}</span>
        </button>
      </div>

      {transferAlert && (
        <div
          role="alert"
          className="relative z-10 mt-3 rounded-xl bg-red-950/88 backdrop-blur-md border border-red-300/35 px-3 py-2.5 text-xs text-red-100 flex items-start justify-between gap-2 shadow-sm"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="text-[#F4DFAA] shrink-0 mt-0.5" />
            <span>{t(lang, 'alert_balance_zero_transfer')}</span>
          </div>
          <button
            type="button"
            onClick={onDismissTransferAlert}
            aria-label="Dismiss alert"
            className="text-white/70 hover:text-white shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </section>
  );
};
