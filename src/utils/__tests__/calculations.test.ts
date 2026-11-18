import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Budget, Transaction } from '../../types';
import {
  calculateAvailableTransferBalance,
  calculateBalanceMetrics,
  calculateBudgetMetrics,
  calculateCategoryBreakdown,
  calculateMonthlyMetrics,
  calculatePeriodSummary,
  calculateSpendingPercentage,
  filterTransactions,
  getIncomeExpenseSeries,
  getMonthlyComparison,
  sumTransactionsByExactCurrency,
} from '../calculations';

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 1000,
    currency: 'USD',
    category: 'salary',
    description: 'Salary',
    date: '2026-11-01',
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 0.1,
    currency: 'USD',
    category: 'food_drinks',
    description: 'Snack 1',
    date: '2026-11-02',
    createdAt: '2026-11-02T08:00:00.000Z',
    updatedAt: '2026-11-02T08:00:00.000Z',
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 0.2,
    currency: 'USD',
    category: 'food_drinks',
    description: 'Snack 2',
    date: '2026-11-03',
    createdAt: '2026-11-03T08:00:00.000Z',
    updatedAt: '2026-11-03T08:00:00.000Z',
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 41000,
    currency: 'KHR',
    category: 'transportation',
    description: 'TukTuk',
    date: '2026-11-04',
    createdAt: '2026-11-04T08:00:00.000Z',
    updatedAt: '2026-11-04T08:00:00.000Z',
  },
  {
    id: 'tx-5',
    type: 'transfer',
    amount: 100,
    currency: 'USD',
    category: 'bakong_khqr',
    recipient: 'Sokha',
    description: 'Family support',
    date: '2026-11-05',
    createdAt: '2026-11-05T08:00:00.000Z',
    updatedAt: '2026-11-05T08:00:00.000Z',
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 200,
    currency: 'USD',
    category: 'shopping',
    description: 'October shoes',
    date: '2026-10-15',
    createdAt: '2026-10-15T08:00:00.000Z',
    updatedAt: '2026-10-15T08:00:00.000Z',
  },
];

describe('financial calculations', () => {
  it('handles empty arrays and zero values without NaN', () => {
    const balance = calculateBalanceMetrics([], 0, 'USD');
    assert.deepEqual(balance, {
      openingBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalTransfers: 0,
      totalBalance: 0,
      netSavings: 0,
    });
    assert.equal(calculateSpendingPercentage(50, 0), 0);
    assert.deepEqual(calculateCategoryBreakdown([], 2026, 11, 'USD'), []);
  });

  it('avoids floating-point precision drift and converts USD/KHR cleanly', () => {
    const monthly = calculateMonthlyMetrics(SAMPLE_TRANSACTIONS, 2026, 11, 'USD');
    assert.equal(monthly.monthlyIncome, 1000);
    // 0.1 + 0.2 + (41,000 / 4,100 = 10) = 10.30 exactly
    assert.equal(monthly.monthlyExpenses, 10.3);
    assert.equal(monthly.netSavings, 989.7);

    // Exact same-currency helper does not mix currencies
    assert.equal(sumTransactionsByExactCurrency(SAMPLE_TRANSACTIONS, 'KHR'), 41000);
  });

  it('calculates total balance including opening balance and transfers out', () => {
    const metrics = calculateBalanceMetrics(SAMPLE_TRANSACTIONS, 500, 'USD');
    // opening 500 + income 1000 - expenses (10.3 + 200) - transfer 100 = 1189.7
    assert.equal(metrics.totalBalance, 1189.7);
    assert.equal(metrics.totalTransfers, 100);

    // Editing tx-5 ($100 transfer) refunds $100 to available transfer balance
    const available = calculateAvailableTransferBalance(
      SAMPLE_TRANSACTIONS,
      500,
      'USD',
      SAMPLE_TRANSACTIONS[4]
    );
    assert.equal(available, 1289.7);
  });

  it('evaluates budget health, warning (>=80%), and exceeded (>=100%) states', () => {
    const makeBudget = (amount: number): Budget => ({
      id: 'b-1',
      month: 11,
      year: 2026,
      amount,
      currency: 'USD',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    });

    assert.equal(
      calculateBudgetMetrics(undefined, SAMPLE_TRANSACTIONS, 2026, 11, 'USD').status,
      'none'
    );
    assert.equal(
      calculateBudgetMetrics(makeBudget(100), SAMPLE_TRANSACTIONS, 2026, 11, 'USD').status,
      'healthy'
    );
    assert.equal(
      calculateBudgetMetrics(makeBudget(12), SAMPLE_TRANSACTIONS, 2026, 11, 'USD').status,
      'warning'
    );
    const exceeded = calculateBudgetMetrics(makeBudget(10), SAMPLE_TRANSACTIONS, 2026, 11, 'USD');
    assert.equal(exceeded.status, 'exceeded');
    assert.equal(exceeded.remaining, -0.3);
  });

  it('builds category breakdown, monthly comparison, chart series, and filters', () => {
    const breakdown = calculateCategoryBreakdown(SAMPLE_TRANSACTIONS, 2026, 11, 'USD');
    assert.equal(breakdown.length, 2);
    assert.equal(breakdown[0].category, 'transportation');
    assert.equal(breakdown[0].amount, 10);

    const comparison = getMonthlyComparison(SAMPLE_TRANSACTIONS, 2026, 11, 'USD');
    assert.equal(comparison.prevYear, 2026);
    assert.equal(comparison.prevMonth, 10);
    assert.equal(comparison.previous.monthlyExpenses, 200);

    const monthlySeries = getIncomeExpenseSeries(
      SAMPLE_TRANSACTIONS,
      'monthly',
      2026,
      11,
      'USD',
      'en',
      '2026-11-18'
    );
    assert.equal(monthlySeries.length, 6);
    const summary = calculatePeriodSummary(monthlySeries, 'USD');
    assert.equal(summary.income, 1000);
    assert.equal(summary.expenses, 210.3);

    const filtered = filterTransactions(
      SAMPLE_TRANSACTIONS,
      { searchQuery: 'sokha', typeFilter: 'transfer', dateFilter: 'all', customDate: '' },
      'en',
      new Date(2026, 10, 18)
    );
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, 'tx-5');
  });
});
