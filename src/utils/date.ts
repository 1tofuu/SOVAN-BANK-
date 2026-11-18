import { MONTH_NAMES_EN, MONTH_NAMES_KM, t, type TranslationKey } from '../i18n/translations';
import type { Language } from '../types';

export interface YearMonthDay {
  year: number;
  month: number;
  day: number;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Validates that a YYYY-MM-DD string represents an actual calendar date. */
export function isValidISODate(dateStr: string): boolean {
  const match = ISO_DATE_PATTERN.exec(dateStr.trim());
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const candidate = new Date(year, month - 1, day);
  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
}

/** Parses a YYYY-MM-DD string safely into numeric year, month (1-12), and day parts. */
export function parseYearMonth(dateStr: string): YearMonthDay {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const fallback = new Date();
  const safeYear = Number.isFinite(y) && y > 0 ? y : fallback.getFullYear();
  const safeMonth = Number.isFinite(m) && m >= 1 && m <= 12 ? m : 1;
  const safeDay = Number.isFinite(d) && d >= 1 && d <= 31 ? d : 1;
  return { year: safeYear, month: safeMonth, day: safeDay };
}

/** Shifts a (year, month) pair by a positive or negative number of months. */
export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  let nextMonth = month + delta;
  let nextYear = year;
  while (nextMonth <= 0) {
    nextMonth += 12;
    nextYear -= 1;
  }
  while (nextMonth > 12) {
    nextMonth -= 12;
    nextYear += 1;
  }
  return { year: nextYear, month: nextMonth };
}

/** Formats a local Date instance as YYYY-MM-DD without UTC timezone shift. */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Formats a YYYY-MM-DD date string into Today, Yesterday, or a localized short date. */
export function formatReadableDate(dateStr: string, lang: Language, todayStr: string): string {
  if (dateStr === todayStr) return t(lang, 'today');

  const todayParsed = parseYearMonth(todayStr);
  const todayObj = new Date(todayParsed.year, todayParsed.month - 1, todayParsed.day);
  const yesterdayObj = new Date(todayObj);
  yesterdayObj.setDate(todayObj.getDate() - 1);
  if (dateStr === toISODateString(yesterdayObj)) return t(lang, 'yesterday');

  const { year, month, day } = parseYearMonth(dateStr);
  const monthNames = lang === 'km' ? MONTH_NAMES_KM : MONTH_NAMES_EN;
  const safeIdx = Math.min(11, Math.max(0, month - 1));
  const monthLabel = lang === 'km' ? monthNames[safeIdx] : monthNames[safeIdx].slice(0, 3);
  return lang === 'km' ? `${day} ${monthLabel} ${year}` : `${monthLabel} ${day}, ${year}`;
}

/** Formats an ISO timestamp for transaction audit details with a safe fallback. */
export function formatTimestamp(iso: string, lang: Language): string {
  try {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
      return iso.slice(0, 16).replace('T', ' ');
    }
    return new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsed);
  } catch {
    return iso.slice(0, 16).replace('T', ' ');
  }
}

/** Returns the localized greeting translation key based on local hour of day. */
export function getGreetingKey(hour: number): TranslationKey {
  if (hour < 12) return 'greeting_morning';
  if (hour < 17) return 'greeting_afternoon';
  return 'greeting_evening';
}
