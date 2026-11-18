import { t, type TranslationKey } from '../i18n/translations';
import type {
  ExpenseCategory,
  IncomeCategory,
  Language,
  TransactionCategory,
  TransactionType,
  TransferCategory,
} from '../types';

export type CategoryIconName =
  | 'Briefcase'
  | 'Laptop'
  | 'Store'
  | 'Coins'
  | 'Utensils'
  | 'Car'
  | 'ShoppingBag'
  | 'GraduationCap'
  | 'Film'
  | 'Zap'
  | 'HeartPulse'
  | 'Sparkles'
  | 'Plane'
  | 'Layers'
  | 'Landmark'
  | 'QrCode'
  | 'Smartphone'
  | 'Users'
  | 'Vault'
  | 'Send';

export interface CategoryMeta {
  id: TransactionCategory;
  type: TransactionType;
  labelKey: TranslationKey;
  color: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  iconName: CategoryIconName;
}

export const INCOME_CATEGORIES: readonly IncomeCategory[] = [
  'salary',
  'freelance',
  'business',
  'other_income',
];

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'food_drinks',
  'transportation',
  'shopping',
  'education',
  'entertainment',
  'bills_utilities',
  'health',
  'personal_care',
  'travel',
  'other_expense',
];

export const TRANSFER_CATEGORIES: readonly TransferCategory[] = [
  'bank_transfer',
  'bakong_khqr',
  'wing_ewallet',
  'family_support',
  'savings_vault',
  'other_transfer',
];

export const CATEGORY_META: Record<TransactionCategory, CategoryMeta> = {
  salary: {
    id: 'salary',
    type: 'income',
    labelKey: 'cat_salary',
    color: '#0E5A3E',
    bgLight: 'bg-[#0E5A3E]/10',
    bgDark: 'dark:bg-[#19875D]/20',
    textLight: 'text-[#0E5A3E]',
    textDark: 'dark:text-[#5AD3A3]',
    iconName: 'Briefcase',
  },
  freelance: {
    id: 'freelance',
    type: 'income',
    labelKey: 'cat_freelance',
    color: '#19875D',
    bgLight: 'bg-[#19875D]/10',
    bgDark: 'dark:bg-[#19875D]/20',
    textLight: 'text-[#14724E]',
    textDark: 'dark:text-[#6EE7B7]',
    iconName: 'Laptop',
  },
  business: {
    id: 'business',
    type: 'income',
    labelKey: 'cat_business',
    color: '#C89B3C',
    bgLight: 'bg-[#C89B3C]/12',
    bgDark: 'dark:bg-[#C89B3C]/20',
    textLight: 'text-[#9A7422]',
    textDark: 'dark:text-[#E5C16C]',
    iconName: 'Store',
  },
  other_income: {
    id: 'other_income',
    type: 'income',
    labelKey: 'cat_other',
    color: '#52796F',
    bgLight: 'bg-[#52796F]/12',
    bgDark: 'dark:bg-[#52796F]/25',
    textLight: 'text-[#3D5E55]',
    textDark: 'dark:text-[#A3C4BC]',
    iconName: 'Coins',
  },
  food_drinks: {
    id: 'food_drinks',
    type: 'expense',
    labelKey: 'cat_food_drinks',
    color: '#C89B3C',
    bgLight: 'bg-[#C89B3C]/12',
    bgDark: 'dark:bg-[#C89B3C]/20',
    textLight: 'text-[#966E1B]',
    textDark: 'dark:text-[#E7C675]',
    iconName: 'Utensils',
  },
  transportation: {
    id: 'transportation',
    type: 'expense',
    labelKey: 'cat_transportation',
    color: '#0E5A3E',
    bgLight: 'bg-[#0E5A3E]/10',
    bgDark: 'dark:bg-[#19875D]/20',
    textLight: 'text-[#0E5A3E]',
    textDark: 'dark:text-[#6EE7B7]',
    iconName: 'Car',
  },
  shopping: {
    id: 'shopping',
    type: 'expense',
    labelKey: 'cat_shopping',
    color: '#B45309',
    bgLight: 'bg-amber-700/10',
    bgDark: 'dark:bg-amber-500/15',
    textLight: 'text-amber-800',
    textDark: 'dark:text-amber-300',
    iconName: 'ShoppingBag',
  },
  education: {
    id: 'education',
    type: 'expense',
    labelKey: 'cat_education',
    color: '#1D6B52',
    bgLight: 'bg-emerald-800/10',
    bgDark: 'dark:bg-emerald-500/15',
    textLight: 'text-emerald-800',
    textDark: 'dark:text-emerald-300',
    iconName: 'GraduationCap',
  },
  entertainment: {
    id: 'entertainment',
    type: 'expense',
    labelKey: 'cat_entertainment',
    color: '#8C6D23',
    bgLight: 'bg-[#8C6D23]/12',
    bgDark: 'dark:bg-[#C89B3C]/20',
    textLight: 'text-[#735818]',
    textDark: 'dark:text-[#DFBE6F]',
    iconName: 'Film',
  },
  bills_utilities: {
    id: 'bills_utilities',
    type: 'expense',
    labelKey: 'cat_bills_utilities',
    color: '#2E6F5E',
    bgLight: 'bg-teal-800/10',
    bgDark: 'dark:bg-teal-500/15',
    textLight: 'text-teal-800',
    textDark: 'dark:text-teal-300',
    iconName: 'Zap',
  },
  health: {
    id: 'health',
    type: 'expense',
    labelKey: 'cat_health',
    color: '#B91C1C',
    bgLight: 'bg-red-700/10',
    bgDark: 'dark:bg-red-500/15',
    textLight: 'text-red-700',
    textDark: 'dark:text-red-300',
    iconName: 'HeartPulse',
  },
  personal_care: {
    id: 'personal_care',
    type: 'expense',
    labelKey: 'cat_personal_care',
    color: '#A16207',
    bgLight: 'bg-yellow-700/10',
    bgDark: 'dark:bg-yellow-500/15',
    textLight: 'text-yellow-800',
    textDark: 'dark:text-yellow-300',
    iconName: 'Sparkles',
  },
  travel: {
    id: 'travel',
    type: 'expense',
    labelKey: 'cat_travel',
    color: '#0F766E',
    bgLight: 'bg-teal-700/10',
    bgDark: 'dark:bg-teal-400/15',
    textLight: 'text-teal-800',
    textDark: 'dark:text-teal-300',
    iconName: 'Plane',
  },
  other_expense: {
    id: 'other_expense',
    type: 'expense',
    labelKey: 'cat_other',
    color: '#4B5E55',
    bgLight: 'bg-slate-600/10',
    bgDark: 'dark:bg-slate-400/15',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-300',
    iconName: 'Layers',
  },
  bank_transfer: {
    id: 'bank_transfer',
    type: 'transfer',
    labelKey: 'cat_bank_transfer',
    color: '#0E5A3E',
    bgLight: 'bg-[#0E5A3E]/10',
    bgDark: 'dark:bg-[#19875D]/20',
    textLight: 'text-[#0E5A3E]',
    textDark: 'dark:text-[#5AD3A3]',
    iconName: 'Landmark',
  },
  bakong_khqr: {
    id: 'bakong_khqr',
    type: 'transfer',
    labelKey: 'cat_bakong_khqr',
    color: '#C89B3C',
    bgLight: 'bg-[#C89B3C]/12',
    bgDark: 'dark:bg-[#C89B3C]/20',
    textLight: 'text-[#9A7422]',
    textDark: 'dark:text-[#E5C16C]',
    iconName: 'QrCode',
  },
  wing_ewallet: {
    id: 'wing_ewallet',
    type: 'transfer',
    labelKey: 'cat_wing_ewallet',
    color: '#1D6B52',
    bgLight: 'bg-emerald-800/10',
    bgDark: 'dark:bg-emerald-500/15',
    textLight: 'text-emerald-800',
    textDark: 'dark:text-emerald-300',
    iconName: 'Smartphone',
  },
  family_support: {
    id: 'family_support',
    type: 'transfer',
    labelKey: 'cat_family_support',
    color: '#A16207',
    bgLight: 'bg-yellow-700/10',
    bgDark: 'dark:bg-yellow-500/15',
    textLight: 'text-yellow-800',
    textDark: 'dark:text-yellow-300',
    iconName: 'Users',
  },
  savings_vault: {
    id: 'savings_vault',
    type: 'transfer',
    labelKey: 'cat_savings_vault',
    color: '#0F766E',
    bgLight: 'bg-teal-700/10',
    bgDark: 'dark:bg-teal-400/15',
    textLight: 'text-teal-800',
    textDark: 'dark:text-teal-300',
    iconName: 'Vault',
  },
  other_transfer: {
    id: 'other_transfer',
    type: 'transfer',
    labelKey: 'cat_other',
    color: '#4B5E55',
    bgLight: 'bg-slate-600/10',
    bgDark: 'dark:bg-slate-400/15',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-300',
    iconName: 'Send',
  },
};

export function getCategoryMeta(category: TransactionCategory): CategoryMeta {
  return CATEGORY_META[category] ?? CATEGORY_META.other_expense;
}

export function getCategoriesForType(type: TransactionType): readonly TransactionCategory[] {
  if (type === 'income') return INCOME_CATEGORIES;
  if (type === 'transfer') return TRANSFER_CATEGORIES;
  return EXPENSE_CATEGORIES;
}

export function getDefaultCategoryForType(type: TransactionType): TransactionCategory {
  if (type === 'income') return 'salary';
  if (type === 'transfer') return 'bank_transfer';
  return 'food_drinks';
}

export function getOtherCategoryId(type: TransactionType): TransactionCategory {
  if (type === 'income') return 'other_income';
  if (type === 'transfer') return 'other_transfer';
  return 'other_expense';
}

export function getCategoryLabel(
  category: TransactionCategory,
  lang: Language,
  customCategory?: string
): string {
  const customTrimmed = customCategory?.trim();
  if (customTrimmed) return customTrimmed;
  return t(lang, getCategoryMeta(category).labelKey);
}
