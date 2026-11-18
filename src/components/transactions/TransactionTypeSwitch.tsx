import React from 'react';
import { t } from '../../i18n/translations';
import type { Language, TransactionType } from '../../types';

interface TransactionTypeSwitchProps {
  value: TransactionType;
  lang: Language;
  onChange: (type: TransactionType) => void;
}

export const TransactionTypeSwitch: React.FC<TransactionTypeSwitchProps> = ({
  value,
  lang,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0E5A3E]/6 dark:bg-white/6">
      <button
        type="button"
        onClick={() => onChange('expense')}
        className={`min-h-[44px] px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
          value === 'expense'
            ? 'bg-white dark:bg-[#1B2A22] text-[#0F1F18] dark:text-[#F1F5F2] shadow-xs'
            : 'text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white'
        }`}
      >
        {t(lang, 'expense')}
      </button>
      <button
        type="button"
        onClick={() => onChange('income')}
        className={`min-h-[44px] px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
          value === 'income'
            ? 'bg-[#0E5A3E] text-white shadow-xs'
            : 'text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white'
        }`}
      >
        {t(lang, 'income')}
      </button>
      <button
        type="button"
        onClick={() => onChange('transfer')}
        className={`min-h-[44px] px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
          value === 'transfer'
            ? 'bg-[#C89B3C] text-white shadow-xs'
            : 'text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white'
        }`}
      >
        {t(lang, 'transfer_out')}
      </button>
    </div>
  );
};
