import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getCategoryLabel, getCategoryMeta } from '../../constants/categories';
import { t } from '../../i18n/translations';
import type { Currency, Language, Transaction } from '../../types';
import { convertCurrency, formatCurrency } from '../../utils/currency';
import { formatReadableDate } from '../../utils/date';
import { CategoryIcon } from '../common/CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
  displayCurrency: Currency;
  lang: Language;
  todayStr: string;
  onSelect: (tx: Transaction) => void;
  showDate?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = React.memo(
  ({ transaction, displayCurrency, lang, todayStr, onSelect, showDate = true }) => {
    const meta = getCategoryMeta(transaction.category);
    const categoryLabel = getCategoryLabel(
      transaction.category,
      lang,
      transaction.customCategory
    );
    const title =
      transaction.description.trim() || transaction.recipient?.trim() || categoryLabel;
    const isIncome = transaction.type === 'income';
    const isTransfer = transaction.type === 'transfer';

    const signedOriginal = isIncome ? transaction.amount : -transaction.amount;
    const formattedPrimary = formatCurrency(signedOriginal, transaction.currency, {
      showSign: true,
    });

    const needsConversion = transaction.currency !== displayCurrency;
    const convertedValue = needsConversion
      ? convertCurrency(signedOriginal, transaction.currency, displayCurrency)
      : null;

    return (
      <button
        type="button"
        onClick={() => onSelect(transaction)}
        className="w-full min-h-[64px] px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#0E5A3E]/[0.04] dark:hover:bg-white/[0.04] active:bg-[#0E5A3E]/[0.07] transition-colors rounded-xl group focus-visible:outline-2 focus-visible:outline-[#0E5A3E]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.textLight} ${meta.textDark}`}
          >
            <CategoryIcon category={transaction.category} size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2] truncate">
              {title}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#5B7268] dark:text-[#96ACA1] truncate mt-0.5">
              <span className="truncate">
                {isTransfer ? `${t(lang, 'transfer_out')} · ${categoryLabel}` : categoryLabel}
              </span>
              {showDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap shrink-0">
                    {formatReadableDate(transaction.date, lang, todayStr)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p
              className={`text-sm font-semibold tabular-nums font-mono-num whitespace-nowrap ${
                isIncome
                  ? 'text-[#0E5A3E] dark:text-[#5AD3A3]'
                  : isTransfer
                  ? 'text-[#9A7422] dark:text-[#E5C16C]'
                  : 'text-[#0F1F18] dark:text-[#F1F5F2]'
              }`}
            >
              {formattedPrimary}
            </p>
            {convertedValue !== null && (
              <p className="text-[11px] tabular-nums font-mono-num text-[#5B7268] dark:text-[#96ACA1] whitespace-nowrap">
                ≈ {formatCurrency(convertedValue, displayCurrency, { showSign: true })}
              </p>
            )}
          </div>
          <ChevronRight
            size={16}
            className="text-[#5B7268]/60 dark:text-[#96ACA1]/60 group-hover:translate-x-0.5 transition-transform shrink-0"
          />
        </div>
      </button>
    );
  }
);

TransactionItem.displayName = 'TransactionItem';
