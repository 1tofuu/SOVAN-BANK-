import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  convertCurrency,
  formatCurrency,
  fromMinorUnits,
  roundCurrencyAmount,
  toMinorUnits,
} from '../currency';

describe('currency utilities', () => {
  it('converts amounts to and from minor units accurately', () => {
    assert.equal(toMinorUnits(12.34, 'USD'), 1234);
    assert.equal(toMinorUnits(0.1 + 0.2, 'USD'), 30);
    assert.equal(fromMinorUnits(30, 'USD'), 0.3);
    assert.equal(toMinorUnits(18500.4, 'KHR'), 18500);
    assert.equal(fromMinorUnits(18500, 'KHR'), 18500);
    assert.equal(toMinorUnits(Number.NaN, 'USD'), 0);
    assert.equal(fromMinorUnits(Number.POSITIVE_INFINITY, 'USD'), 0);
  });

  it('rounds amounts to currency precision', () => {
    assert.equal(roundCurrencyAmount(10.556, 'USD'), 10.56);
    assert.equal(roundCurrencyAmount(4099.6, 'KHR'), 4100);
    assert.equal(roundCurrencyAmount(Number.NaN, 'KHR'), 0);
  });

  it('converts between USD and KHR using the 4,100 reference rate', () => {
    assert.equal(convertCurrency(1, 'USD', 'KHR'), 4100);
    assert.equal(convertCurrency(10.5, 'USD', 'KHR'), 43050);
    assert.equal(convertCurrency(4100, 'KHR', 'USD'), 1);
    assert.equal(convertCurrency(20500, 'KHR', 'USD'), 5);
    assert.equal(convertCurrency(0, 'USD', 'KHR'), 0);
    assert.equal(convertCurrency(12.345, 'USD', 'USD'), 12.35);
    assert.equal(convertCurrency(10, 'USD', 'KHR', 0), 0);
  });

  it('formats USD and KHR in standard, signed, and compact modes', () => {
    assert.equal(formatCurrency(1250.5, 'USD'), '$1,250.50');
    assert.equal(formatCurrency(-42.5, 'USD', { showSign: true }), '-$42.50');
    assert.equal(formatCurrency(42.5, 'USD', { showSign: true }), '+$42.50');
    assert.equal(formatCurrency(1500, 'USD', { compact: true }), '$1.50k');
    assert.equal(formatCurrency(12500, 'USD', { compact: true }), '$12.5k');

    assert.equal(formatCurrency(18500, 'KHR'), '18,500 ៛');
    assert.equal(formatCurrency(2_500_000, 'KHR', { compact: true }), '2.50M ៛');
    assert.equal(formatCurrency(45_000, 'KHR', { compact: true }), '45k ៛');
    assert.equal(formatCurrency(Number.NaN, 'USD'), '$0.00');
  });
});
