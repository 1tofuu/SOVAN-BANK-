import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  validatePinCode,
  validatePositiveAmount,
  validateTransactionInput,
} from '../validation';

describe('validation utilities', () => {
  it('validates positive monetary amounts', () => {
    assert.deepEqual(validatePositiveAmount('25.556', 'USD', 'en'), {
      valid: true,
      value: 25.56,
    });
    assert.deepEqual(validatePositiveAmount('12000', 'KHR', 'en'), {
      valid: true,
      value: 12000,
    });
    assert.equal(validatePositiveAmount('0', 'USD', 'en').valid, false);
    assert.equal(validatePositiveAmount('-10', 'USD', 'en').valid, false);
    assert.equal(validatePositiveAmount('abc', 'USD', 'en').valid, false);
  });

  it('validates transaction input including missing category, invalid date, and transfer balance', () => {
    const missingFields = validateTransactionInput({
      type: 'expense',
      amountRaw: '',
      currency: 'USD',
      category: '',
      date: '2026-02-31',
      availableTransferBalance: 500,
      lang: 'en',
    });
    assert.equal(missingFields.valid, false);
    if (!missingFields.valid) {
      assert.ok(missingFields.errors.amount);
      assert.ok(missingFields.errors.category);
      assert.ok(missingFields.errors.date);
    }

    const overTransfer = validateTransactionInput({
      type: 'transfer',
      amountRaw: '600',
      currency: 'USD',
      category: 'bank_transfer',
      date: '2026-11-18',
      availableTransferBalance: 500,
      lang: 'en',
    });
    assert.equal(overTransfer.valid, false);
    if (!overTransfer.valid) {
      assert.match(overTransfer.errors.amount ?? '', /not enough/i);
    }

    const validTx = validateTransactionInput({
      type: 'transfer',
      amountRaw: '150.25',
      currency: 'USD',
      category: 'bakong_khqr',
      date: '2026-11-18',
      availableTransferBalance: 500,
      lang: 'en',
    });
    assert.deepEqual(validTx, {
      valid: true,
      cleanAmount: 150.25,
      category: 'bakong_khqr',
    });
  });

  it('validates 4-digit numeric PIN codes', () => {
    assert.deepEqual(validatePinCode('4829', 'en'), { valid: true, value: '4829' });
    assert.equal(validatePinCode('123', 'en').valid, false);
    assert.equal(validatePinCode('12ab', 'en').valid, false);
  });
});
