import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Transaction } from '../../types';
import { buildTransactionsCSV, exportTransactionsToCSV } from '../export/csvExport';

describe('CSV export service', () => {
  it('generates UTF-8 BOM CSV with escaped quotes, commas, and Khmer labels', () => {
    const txs: Transaction[] = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: 18500,
        currency: 'KHR',
        category: 'food_drinks',
        description: 'Brown Coffee, "Iced Latte"',
        date: '2026-11-18',
        createdAt: '2026-11-18T08:00:00.000Z',
        updatedAt: '2026-11-18T08:00:00.000Z',
      },
    ];

    const csv = buildTransactionsCSV(txs, 'km');
    assert.equal(csv.startsWith('\uFEFFID,Date,Type,Category'), true);
    assert.match(csv, /អាហារ និងភេសជ្ជៈ/);
    assert.match(csv, /"Brown Coffee, ""Iced Latte"""/);
  });

  it('returns structured error instead of throwing in non-DOM runtimes', () => {
    const result = exportTransactionsToCSV([], 'en');
    assert.equal(result.ok, false);
  });
});
