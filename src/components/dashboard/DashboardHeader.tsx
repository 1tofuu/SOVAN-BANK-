import React from 'react';
import { t, type TranslationKey } from '../../i18n/translations';
import type { Language } from '../../types';
import { MonthSelector } from '../common/MonthSelector';

interface DashboardHeaderProps {
  greetingKey: TranslationKey;
  userName: string;
  selectedMonth: number;
  selectedYear: number;
  lang: Language;
  onChangeMonth: (month: number, year: number) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greetingKey,
  userName,
  selectedMonth,
  selectedYear,
  lang,
  onChangeMonth,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2]">
          {t(lang, greetingKey)}, {userName}
        </h1>
      </div>

      <MonthSelector
        month={selectedMonth}
        year={selectedYear}
        lang={lang}
        onChange={onChangeMonth}
      />
    </div>
  );
};
