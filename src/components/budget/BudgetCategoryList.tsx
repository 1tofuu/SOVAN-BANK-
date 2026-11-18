import React from 'react';
import { getCategoryLabel, getCategoryMeta } from '../../constants/categories';
import { t } from '../../i18n/translations';
import type { CategoryBreakdownItem, Currency, Language } from '../../types';
import { calculateSpendingPercentage } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { CategoryIcon } from '../common/CategoryIcon';

interface BudgetCategoryListProps {
  items: CategoryBreakdownItem[];
  budgetLimit: number;
  displayCurrency: Currency;
  lang: Language;
}

export const BudgetCategoryList: React.FC<BudgetCategoryListProps> = ({
  items,
  budgetLimit,
  displayCurrency,
  lang,
}) => {
  return (
    <section className="lg:col-span-5 rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-6 space-y-4">
      <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
        {t(lang, 'category_spending_this_month')}
      </h2>

      {items.length > 0 ? (
        <div className="space-y-3.5">
          {items.map((item) => {
            const meta = getCategoryMeta(item.category);
            const shareOfBudget = calculateSpendingPercentage(item.amount, budgetLimit);
            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.textLight} ${meta.textDark}`}
                    >
                      <CategoryIcon category={item.category} size={14} />
                    </span>
                    <span className="font-medium text-[#0F1F18] dark:text-[#F1F5F2] truncate">
                      {getCategoryLabel(item.category, lang, item.customLabel)}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] shrink-0">
                    {formatCurrency(item.amount, displayCurrency)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#0E5A3E]/8 dark:bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, shareOfBudget)}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[#5B7268] dark:text-[#96ACA1]">
          {t(lang, 'no_expense_data')}
        </p>
      )}
    </section>
  );
};
