import React from 'react';
import { Award } from 'lucide-react';
import { getCategoryLabel, getCategoryMeta } from '../../constants/categories';
import { t } from '../../i18n/translations';
import type { CategoryBreakdownItem, Currency, Language } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { CategoryIcon } from '../common/CategoryIcon';

interface HighestCategoryCardProps {
  highestCategory: CategoryBreakdownItem | null;
  currency: Currency;
  lang: Language;
}

export const HighestCategoryCard: React.FC<HighestCategoryCardProps> = ({
  highestCategory,
  currency,
  lang,
}) => {
  const meta = highestCategory ? getCategoryMeta(highestCategory.category) : null;

  return (
    <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-medium text-[#5B7268] dark:text-[#96ACA1] mb-3">
        <Award size={15} className="text-[#C89B3C]" />
        <span>{t(lang, 'highest_spending_category')}</span>
      </div>

      {highestCategory && meta ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.textLight} ${meta.textDark}`}
            >
              <CategoryIcon category={highestCategory.category} size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2] truncate">
                {getCategoryLabel(highestCategory.category, lang, highestCategory.customLabel)}
              </p>
              <p className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
                {highestCategory.percentage.toFixed(1)}% {t(lang, 'share_of_spending')}
              </p>
            </div>
          </div>
          <p className="text-lg font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] shrink-0">
            {formatCurrency(highestCategory.amount, currency)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[#5B7268] dark:text-[#96ACA1]">
          {t(lang, 'no_expense_data')}
        </p>
      )}
    </section>
  );
};
