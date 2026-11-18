import { USD_TO_KHR_RATE } from '../constants/app';
import type { Currency } from '../types';

export interface FormatCurrencyOptions {
  compact?: boolean;
  showSign?: boolean;
}

/**
 * Converts an amount into integer minor units (cents for USD, whole riels for KHR)
 * to avoid IEEE-754 floating-point precision drift during summation and subtraction.
 */
export function toMinorUnits(amount: number, currency: Currency): number {
  if (!Number.isFinite(amount)) return 0;
  return currency === 'USD' ? Math.round(amount * 100) : Math.round(amount);
}

/** Converts integer minor units back into the standard display unit for the currency. */
export function fromMinorUnits(minor: number, currency: Currency): number {
  if (!Number.isFinite(minor)) return 0;
  return currency === 'USD' ? Math.round(minor) / 100 : Math.round(minor);
}

/** Rounds a raw amount to valid currency precision (2 decimals for USD, whole riels for KHR). */
export function roundCurrencyAmount(amount: number, currency: Currency): number {
  if (!Number.isFinite(amount)) return 0;
  return fromMinorUnits(toMinorUnits(amount, currency), currency);
}

/**
 * Converts between USD and KHR using integer arithmetic and the explicit local reference rate
 * (1 USD = 4,100 KHR). Keeps same-currency values untouched except for precision rounding.
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  exchangeRate: number = USD_TO_KHR_RATE
): number {
  if (!Number.isFinite(amount) || amount === 0) return 0;
  if (from === to) {
    return roundCurrencyAmount(amount, to);
  }
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return 0;
  }

  if (from === 'USD' && to === 'KHR') {
    const cents = Math.round(amount * 100);
    return Math.round((cents * exchangeRate) / 100);
  }

  // KHR -> USD
  const riels = Math.round(amount);
  const cents = Math.round((riels * 100) / exchangeRate);
  return cents / 100;
}

/** Formats an amount in USD ($1,234.56) or KHR (4,100,000 ៛) with optional compact and sign modes. */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options?: FormatCurrencyOptions
): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const absVal = Math.abs(safe);
  const sign = safe < 0 ? '-' : options?.showSign && safe > 0 ? '+' : '';

  if (currency === 'USD') {
    if (options?.compact && absVal >= 1000) {
      const thousands = absVal / 1000;
      return `${sign}$${thousands >= 10 ? thousands.toFixed(1) : thousands.toFixed(2)}k`;
    }
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absVal);
    return `${sign}$${formatted}`;
  }

  const rounded = Math.round(absVal);
  if (options?.compact && rounded >= 1_000_000) {
    return `${sign}${(rounded / 1_000_000).toFixed(2)}M ៛`;
  }
  if (options?.compact && rounded >= 1_000) {
    return `${sign}${Math.round(rounded / 1_000)}k ៛`;
  }
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(rounded);
  return `${sign}${formatted} ៛`;
}
