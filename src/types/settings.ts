export type Currency = 'USD' | 'KHR';

export type Language = 'en' | 'km';

export type ThemeMode = 'light' | 'dark';

export type AppTab = 'dashboard' | 'history' | 'budget' | 'analytics' | 'settings';

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly';

export interface UserSettings {
  name: string;
  language: Language;
  currency: Currency;
  theme: ThemeMode;
  pinEnabled: boolean;
  pinCode: string;
  openingBalanceUSD: number;
}
