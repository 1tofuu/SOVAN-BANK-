import type { Currency, Language, ThemeMode } from '../types';

/** Fixed local Cambodia reference exchange rate: 1 USD = 4,100 KHR. */
export const USD_TO_KHR_RATE = 4100;

export const DEFAULT_USER_NAME = 'Sophea';
export const DEFAULT_LANGUAGE: Language = 'en';
export const DEFAULT_CURRENCY: Currency = 'USD';
export const DEFAULT_THEME: ThemeMode = 'light';
export const DEFAULT_PIN_CODE = '1234';
export const DEFAULT_OPENING_BALANCE_USD = 1200;

export const PIN_LENGTH = 4;
export const BUDGET_WARNING_THRESHOLD = 80;
export const BUDGET_EXCEEDED_THRESHOLD = 100;
export const RECENT_TRANSACTIONS_LIMIT = 5;
export const MAX_DONUT_CATEGORIES = 5;
export const MONTHLY_SERIES_LENGTH = 6;
export const DAILY_SERIES_LENGTH = 7;

export const STORAGE_KEYS = {
  transactions: 'sovan-transactions-v1',
  budgets: 'sovan-budgets-v1',
  settings: 'sovan-settings-v1',
} as const;

export const BRAND_ASSETS = {
  logo: '/assets/aistudio/final_logo_274daa1b.png',
  background: '/assets/aistudio/bg3_c6f8d03b.png',
  cardBackground: '/assets/aistudio/card_no_sim_06aa568a.png',
  welcome: '/assets/aistudio/welcome_92ba8332.png',
} as const;
