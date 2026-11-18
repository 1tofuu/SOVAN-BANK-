import React from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { getCategoryMeta } from '../../constants/categories';
import { t } from '../../i18n/translations';
import type { CustomCategory, Language, TransactionCategory } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategorySelectorGridProps {
  categories: readonly TransactionCategory[];
  otherCategoryId: TransactionCategory;
  selectedCategory: TransactionCategory | '';
  savedCustomCategories: CustomCategory[];
  selectedCustomName: string;
  customCategoryDraft: string;
  isOtherBaseSelected: boolean;
  error?: string;
  lang: Language;
  onSelectBuiltIn: (catId: TransactionCategory) => void;
  onSelectCustom: (name: string) => void;
  onRemoveCustom: (customCategory: CustomCategory) => void;
  onCustomDraftChange: (value: string) => void;
  onAddCustomCategory: () => void;
}

export const CategorySelectorGrid: React.FC<CategorySelectorGridProps> = ({
  categories,
  otherCategoryId,
  selectedCategory,
  savedCustomCategories,
  selectedCustomName,
  customCategoryDraft,
  isOtherBaseSelected,
  error,
  lang,
  onSelectBuiltIn,
  onSelectCustom,
  onRemoveCustom,
  onCustomDraftChange,
  onAddCustomCategory,
}) => {
  const otherMeta = getCategoryMeta(otherCategoryId);

  return (
    <div>
      <span className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-2">
        {t(lang, 'category')}
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((catId) => {
          const meta = getCategoryMeta(catId);
          const isSelected = selectedCategory === catId && !selectedCustomName;
          return (
            <button
              key={catId}
              type="button"
              onClick={() => onSelectBuiltIn(catId)}
              className={`min-h-[46px] px-3 py-2 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                isSelected
                  ? 'border-[#0E5A3E] dark:border-[#C89B3C] bg-[#0E5A3E]/8 dark:bg-[#C89B3C]/15 text-[#0F1F18] dark:text-[#F1F5F2] ring-1 ring-[#0E5A3E]/25 dark:ring-[#C89B3C]/35'
                  : 'border-[#0E5A3E]/12 dark:border-white/10 bg-white dark:bg-[#0B120E]/60 text-[#4A6157] dark:text-[#A3B8AE] hover:border-[#0E5A3E]/30 dark:hover:border-white/25'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.textLight} ${meta.textDark}`}
              >
                <CategoryIcon category={catId} size={15} />
              </span>
              <span className="text-xs font-medium truncate">{t(lang, meta.labelKey)}</span>
            </button>
          );
        })}

        {/* User-added Custom Categories */}
        {savedCustomCategories.map((customCat) => {
          const isSelected =
            selectedCategory === otherCategoryId &&
            selectedCustomName.toLowerCase() === customCat.name.toLowerCase();
          return (
            <div
              key={customCat.id}
              className={`min-h-[46px] pl-3 pr-1.5 py-1.5 rounded-xl border flex items-center justify-between gap-1.5 transition-all ${
                isSelected
                  ? 'border-[#0E5A3E] dark:border-[#C89B3C] bg-[#0E5A3E]/8 dark:bg-[#C89B3C]/15 text-[#0F1F18] dark:text-[#F1F5F2] ring-1 ring-[#0E5A3E]/25 dark:ring-[#C89B3C]/35'
                  : 'border-[#0E5A3E]/12 dark:border-white/10 bg-white dark:bg-[#0B120E]/60 text-[#4A6157] dark:text-[#A3B8AE] hover:border-[#0E5A3E]/30 dark:hover:border-white/25'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectCustom(customCat.name)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left py-1"
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${otherMeta.bgLight} ${otherMeta.bgDark} ${otherMeta.textLight} ${otherMeta.textDark}`}
                >
                  <CategoryIcon category={otherCategoryId} size={15} />
                </span>
                <span className="text-xs font-medium truncate">{customCat.name}</span>
              </button>
              <button
                type="button"
                onClick={() => onRemoveCustom(customCat)}
                aria-label={`Remove ${customCat.name}`}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5B7268] hover:text-red-600 hover:bg-red-600/10 shrink-0 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Inline Custom Category Creator when "Other" is selected */}
      {isOtherBaseSelected && (
        <div className="mt-3 p-3.5 rounded-xl border border-[#C89B3C]/35 bg-[#C89B3C]/8 dark:bg-[#C89B3C]/12 space-y-2">
          <label
            htmlFor="custom-category-input"
            className="block text-xs font-semibold text-[#0F1F18] dark:text-[#F1F5F2]"
          >
            {t(lang, 'custom_category_label')}
          </label>
          <div className="flex items-stretch gap-2">
            <input
              id="custom-category-input"
              type="text"
              maxLength={40}
              value={customCategoryDraft}
              onChange={(e) => onCustomDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddCustomCategory();
                }
              }}
              placeholder={t(lang, 'custom_category_placeholder')}
              className="flex-1 min-h-[42px] px-3 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 bg-white dark:bg-[#0B120E] text-sm text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/40"
            />
            <button
              type="button"
              onClick={onAddCustomCategory}
              disabled={!customCategoryDraft.trim()}
              className="min-h-[42px] px-3.5 rounded-xl bg-[#C89B3C] hover:bg-[#B2882E] disabled:opacity-45 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <Plus size={15} />
              <span>{t(lang, 'add_category_btn')}</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle size={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
