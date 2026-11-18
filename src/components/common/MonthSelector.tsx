import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear } from '../../i18n/translations';
import type { Language } from '../../types/finance';

interface MonthSelectorProps {
  month: number;
  year: number;
  lang: Language;
  onChange: (month: number, year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  month,
  year,
  lang,
  onChange,
}) => {
  const handlePrev = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-[#0E5A3E]/14 dark:border-white/12 bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md p-1">
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous month"
        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/8 dark:hover:bg-white/10 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="px-3 text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2] whitespace-nowrap min-w-[130px] text-center">
        {formatMonthYear(month, year, lang)}
      </span>
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next month"
        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/8 dark:hover:bg-white/10 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
