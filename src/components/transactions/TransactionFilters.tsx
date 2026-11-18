import React from 'react';
import { Search } from 'lucide-react';
import { t, type TranslationKey } from '../../i18n/translations';
import type { DateFilterPreset, Language, TransactionType } from '../../types';

const TYPE_FILTER_OPTIONS: readonly {
  id: 'all' | TransactionType;
  labelKey: TranslationKey;
}[] = [
  { id: 'all', labelKey: 'filter_all' },
  { id: 'income', labelKey: 'filter_income' },
  { id: 'expense', labelKey: 'filter_expense' },
  { id: 'transfer', labelKey: 'filter_transfer' },
];

const DATE_FILTER_OPTIONS: readonly {
  id: DateFilterPreset;
  labelKey: TranslationKey;
}[] = [
  { id: 'all', labelKey: 'date_all' },
  { id: 'this_month', labelKey: 'date_this_month' },
  { id: 'last_month', labelKey: 'date_last_month' },
  { id: 'custom_date', labelKey: 'date_custom' },
];

interface TransactionFiltersProps {
  searchQuery: string;
  typeFilter: 'all' | TransactionType;
  dateFilter: DateFilterPreset;
  customDate: string;
  todayStr: string;
  lang: Language;
  onSearchChange: (query: string) => void;
  onTypeFilterChange: (type: 'all' | TransactionType) => void;
  onDateFilterChange: (preset: DateFilterPreset) => void;
  onCustomDateChange: (date: string) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  typeFilter,
  dateFilter,
  customDate,
  todayStr,
  lang,
  onSearchChange,
  onTypeFilterChange,
  onDateFilterChange,
  onCustomDateChange,
}) => {
  return (
    <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-4 space-y-3.5">
      <div className="relative">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7268] dark:text-[#96ACA1] pointer-events-none"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t(lang, 'search_placeholder')}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#0E5A3E]/16 dark:border-white/12 bg-[#FAFBF9] dark:bg-[#0B120E] text-sm text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#0E5A3E]/30 focus:border-[#0E5A3E]"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Filter */}
        <div className="inline-flex flex-wrap p-1 rounded-xl bg-[#0E5A3E]/6 dark:bg-white/6 self-start">
          {TYPE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onTypeFilterChange(opt.id)}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                typeFilter === opt.id
                  ? 'bg-white dark:bg-[#1B2A22] text-[#0F1F18] dark:text-[#F1F5F2] shadow-xs'
                  : 'text-[#5B7268] dark:text-[#96ACA1] hover:text-[#0F1F18] dark:hover:text-white'
              }`}
            >
              {t(lang, opt.labelKey)}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {DATE_FILTER_OPTIONS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onDateFilterChange(preset.id);
                if (preset.id === 'custom_date' && !customDate) {
                  onCustomDateChange(todayStr);
                }
              }}
              className={`min-h-[38px] px-3 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                dateFilter === preset.id
                  ? 'border-[#0E5A3E] dark:border-[#C89B3C] bg-[#0E5A3E]/10 dark:bg-[#C89B3C]/18 text-[#0E5A3E] dark:text-[#E5C16C]'
                  : 'border-[#0E5A3E]/12 dark:border-white/10 text-[#5B7268] dark:text-[#96ACA1] hover:border-[#0E5A3E]/30'
              }`}
            >
              {t(lang, preset.labelKey)}
            </button>
          ))}

          {dateFilter === 'custom_date' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => onCustomDateChange(e.target.value)}
              className="min-h-[38px] px-3 rounded-xl border border-[#0E5A3E]/20 dark:border-white/15 bg-[#FAFBF9] dark:bg-[#0B120E] text-xs text-[#0F1F18] dark:text-[#F1F5F2]"
            />
          )}
        </div>
      </div>
    </div>
  );
};
