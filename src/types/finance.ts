export type TransactionType = 'income' | 'expense' | 'transfer';

export type IncomeCategory = 'salary' | 'freelance' | 'business' | 'other_income';

export type ExpenseCategory =
  | 'food_drinks'
  | 'transportation'
  | 'shopping'
  | 'education'
  | 'entertainment'
  | 'bills_utilities'
  | 'health'
  | 'personal_care'
  | 'travel'
  | 'other_expense';

export type TransferCategory =
  | 'bank_transfer'
  | 'bakong_khqr'
  | 'wing_ewallet'
  | 'family_support'
  | 'savings_vault'
  | 'other_transfer';

export type TransactionCategory = IncomeCategory | ExpenseCategory | TransferCategory;

export type Currency = 'USD' | 'KHR';
export type Language = 'en' | 'km';
export type ThemeMode = 'light' | 'dark';

export type AppTab = 'dashboard' | 'history' | 'budget' | 'analytics' | 'settings';

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly';

export type DateFilterPreset = 'all' | 'this_month' | 'last_month' | 'custom_date';

export interface CustomCategory {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  customCategory?: string;
  recipient?: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: number; // 1-12
  year: number;
  amount: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  name: string;
  language: Language;
  currency: Currency;
  theme: ThemeMode;
  pinEnabled: boolean;
  pinCode: string;
  openingBalanceUSD: number;
}

export interface TransactionFormValues {
  type: TransactionType;
  amount: string;
  currency: Currency;
  category: TransactionCategory | '';
  description: string;
  date: string;
}
