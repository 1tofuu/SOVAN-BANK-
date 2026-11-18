import { useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import type { Currency } from '../types';
import { convertCurrency, formatCurrency, type FormatCurrencyOptions } from '../utils/currency';

export function useCurrency() {
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);

  const format = useCallback(
    (amount: number, options?: FormatCurrencyOptions) =>
      formatCurrency(amount, currency, options),
    [currency]
  );

  const convertToDisplay = useCallback(
    (amount: number, from: Currency) => convertCurrency(amount, from, currency),
    [currency]
  );

  return {
    currency,
    setCurrency,
    format,
    convertToDisplay,
  };
}
