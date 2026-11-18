import { getCategoryLabel } from '../../constants/categories';
import type { Language, Transaction } from '../../types';
import { sortTransactionsNewestFirst } from '../../utils/calculations';
import { toISODateString } from '../../utils/date';

export type CsvExportResult =
  | { ok: true; filename: string; count: number }
  | { ok: false; error: string };

const CSV_HEADERS = [
  'ID',
  'Date',
  'Type',
  'Category',
  'Recipient',
  'Amount',
  'Currency',
  'Description',
  'CreatedAt',
] as const;

function escapeCsvCell(val: string | number): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a UTF-8 BOM-prefixed CSV string for transactions so spreadsheet tools
 * (Excel, Numbers, Google Sheets) render Khmer Unicode accurately.
 */
export function buildTransactionsCSV(
  transactions: readonly Transaction[],
  lang: Language
): string {
  const rows = sortTransactionsNewestFirst(transactions).map((tx) => {
    const categoryLabel = getCategoryLabel(tx.category, lang, tx.customCategory);
    return [
      tx.id,
      tx.date,
      tx.type,
      categoryLabel,
      tx.recipient ?? '',
      tx.amount,
      tx.currency,
      tx.description,
      tx.createdAt,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return '\uFEFF' + [CSV_HEADERS.join(','), ...rows].join('\n');
}

/** Triggers a browser CSV download with structured error handling and resource cleanup. */
export function exportTransactionsToCSV(
  transactions: readonly Transaction[],
  lang: Language
): CsvExportResult {
  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    return { ok: false, error: 'CSV export is unavailable in this environment.' };
  }

  let objectUrl: string | null = null;
  try {
    const csvContent = buildTransactionsCSV(transactions, lang);
    const filename = `sovan-transactions-${toISODateString(new Date())}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { ok: true, filename, count: transactions.length };
  } catch {
    return { ok: false, error: 'Unable to export transactions right now. Please try again.' };
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
