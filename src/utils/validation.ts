import { PIN_LENGTH } from '../constants/app';
import { t } from '../i18n/translations';
import type {
  Currency,
  Language,
  TransactionCategory,
  TransactionType,
  TransactionValidationErrors,
} from '../types';
import { formatCurrency, roundCurrencyAmount, toMinorUnits } from './currency';
import { isValidISODate } from './date';

export type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; error: string };

export interface TransactionValidationInput {
  type: TransactionType;
  amountRaw: string;
  currency: Currency;
  category: TransactionCategory | '';
  date: string;
  availableTransferBalance: number;
  lang: Language;
}

export type TransactionValidationOutcome =
  | {
      valid: true;
      cleanAmount: number;
      category: TransactionCategory;
    }
  | {
      valid: false;
      errors: TransactionValidationErrors;
    };

/** Validates and rounds a positive monetary input string. */
export function validatePositiveAmount(
  amountRaw: string,
  currency: Currency,
  lang: Language
): ValidationResult<number> {
  const parsed = parseFloat(amountRaw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { valid: false, error: t(lang, 'err_amount_positive') };
  }
  const cleanAmount = roundCurrencyAmount(parsed, currency);
  if (cleanAmount <= 0) {
    return { valid: false, error: t(lang, 'err_amount_positive') };
  }
  return { valid: true, value: cleanAmount };
}

/** Validates all fields of the transaction creation/edit form. */
export function validateTransactionInput(
  input: TransactionValidationInput
): TransactionValidationOutcome {
  const { type, amountRaw, currency, category, date, availableTransferBalance, lang } = input;
  const errors: TransactionValidationErrors = {};

  const amountCheck = validatePositiveAmount(amountRaw, currency, lang);
  if (!amountCheck.valid) {
    errors.amount = amountCheck.error;
  } else if (type === 'transfer') {
    const requestedMinor = toMinorUnits(amountCheck.value, currency);
    const availableMinor = toMinorUnits(availableTransferBalance, currency);
    if (availableMinor <= 0 || requestedMinor > availableMinor) {
      errors.amount = `${t(lang, 'err_insufficient_balance')} (${t(
        lang,
        'available_balance'
      )}: ${formatCurrency(availableTransferBalance, currency)})`;
    }
  }

  if (!category) {
    errors.category = t(lang, 'err_category_required');
  }

  if (!date || !isValidISODate(date)) {
    errors.date = t(lang, 'err_date_required');
  }

  if (Object.keys(errors).length > 0 || !amountCheck.valid || !category) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    cleanAmount: amountCheck.value,
    category,
  };
}

/** Validates a 4-digit numeric app PIN. */
export function validatePinCode(pin: string, lang: Language): ValidationResult<string> {
  const pattern = new RegExp(`^\\d{${PIN_LENGTH}}$`);
  if (!pattern.test(pin)) {
    return { valid: false, error: t(lang, 'pin_invalid') };
  }
  return { valid: true, value: pin };
}
