import type { Currency } from './settings';

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

export interface NewTransactionInput {
  type: TransactionType;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  customCategory?: string;
  recipient?: string;
  description: string;
  date: string;
}

export interface TransactionFilterCriteria {
  searchQuery: string;
  typeFilter: 'all' | TransactionType;
  dateFilter: DateFilterPreset;
  customDate: string;
}

export interface TransactionValidationErrors {
  amount?: string;
  category?: string;
  date?: string;
}
