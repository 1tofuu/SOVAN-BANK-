import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatReadableDate,
  getGreetingKey,
  isValidISODate,
  parseYearMonth,
  shiftMonth,
  toISODateString,
} from '../date';

describe('date utilities', () => {
  it('validates real ISO calendar dates and rejects invalid ones', () => {
    assert.equal(isValidISODate('2026-11-18'), true);
    assert.equal(isValidISODate('2024-02-29'), true); // leap year
    assert.equal(isValidISODate('2025-02-29'), false); // non-leap year
    assert.equal(isValidISODate('2026-13-01'), false);
    assert.equal(isValidISODate('not-a-date'), false);
    assert.equal(isValidISODate(''), false);
  });

  it('shifts months across year boundaries cleanly', () => {
    assert.deepEqual(shiftMonth(2026, 1, -1), { year: 2025, month: 12 });
    assert.deepEqual(shiftMonth(2026, 12, 1), { year: 2027, month: 1 });
    assert.deepEqual(shiftMonth(2026, 3, -5), { year: 2025, month: 10 });
  });

  it('parses YYYY-MM-DD and safely handles malformed strings', () => {
    assert.deepEqual(parseYearMonth('2026-08-15'), { year: 2026, month: 8, day: 15 });
    const fallback = parseYearMonth('invalid');
    assert.equal(fallback.month, 1);
    assert.equal(fallback.day, 1);
  });

  it('formats readable dates in English and Khmer including Today and Yesterday', () => {
    const today = '2026-11-18';
    assert.equal(formatReadableDate('2026-11-18', 'en', today), 'Today');
    assert.equal(formatReadableDate('2026-11-17', 'en', today), 'Yesterday');
    assert.equal(formatReadableDate('2026-11-10', 'en', today), 'Nov 10, 2026');
    assert.equal(formatReadableDate('2026-11-18', 'km', today), 'ថ្ងៃនេះ');
    assert.equal(formatReadableDate('2026-11-17', 'km', today), 'ម្សិលមិញ');
    assert.equal(formatReadableDate('2026-11-10', 'km', today), '10 វិច្ឆិកា 2026');
  });

  it('formats Date objects to YYYY-MM-DD and computes greeting keys', () => {
    assert.equal(toISODateString(new Date(2026, 0, 5)), '2026-01-05');
    assert.equal(getGreetingKey(9), 'greeting_morning');
    assert.equal(getGreetingKey(14), 'greeting_afternoon');
    assert.equal(getGreetingKey(20), 'greeting_evening');
  });
});
