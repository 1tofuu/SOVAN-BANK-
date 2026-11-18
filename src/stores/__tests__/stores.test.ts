import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useBudgetStore } from '../budgetStore';
import { useSettingsStore } from '../settingsStore';
import { useTransactionStore } from '../transactionStore';

describe('Zustand stores', () => {
  it('supports adding, updating, and deleting transactions safely', () => {
    useTransactionStore.getState().resetTransactions();
    const initialCount = useTransactionStore.getState().transactions.length;

    const created = useTransactionStore.getState().addTransaction({
      type: 'income',
      amount: 250.556,
      currency: 'USD',
      category: 'freelance',
      description: '  Consulting  ',
      date: '2026-11-18',
    });

    assert.equal(created.amount, 250.56);
    assert.equal(created.description, 'Consulting');
    assert.equal(useTransactionStore.getState().transactions.length, initialCount + 1);

    useTransactionStore.getState().updateTransaction(created.id, {
      type: 'income',
      amount: 300,
      currency: 'USD',
      category: 'salary',
      description: 'Updated',
      date: '2026-11-18',
    });
    const updated = useTransactionStore
      .getState()
      .transactions.find((tx) => tx.id === created.id);
    assert.equal(updated?.amount, 300);
    assert.equal(updated?.category, 'salary');

    useTransactionStore.getState().deleteTransaction(created.id);
    assert.equal(useTransactionStore.getState().transactions.length, initialCount);
  });

  it('upserts and deletes monthly budgets with validation guards', () => {
    useBudgetStore.getState().resetBudgets();
    useBudgetStore.getState().upsertBudget(6, 2028, 900.126, 'USD');

    const created = useBudgetStore
      .getState()
      .budgets.find((b) => b.year === 2028 && b.month === 6);
    assert.ok(created);
    assert.equal(created.amount, 900.13);

    // Invalid amount should be ignored
    useBudgetStore.getState().upsertBudget(6, 2028, -50, 'USD');
    const unchanged = useBudgetStore
      .getState()
      .budgets.find((b) => b.year === 2028 && b.month === 6);
    assert.equal(unchanged?.amount, 900.13);

    useBudgetStore.getState().deleteBudget(created.id);
    assert.equal(
      useBudgetStore.getState().budgets.some((b) => b.id === created.id),
      false
    );
  });

  it('manages settings, PIN locking, and deduplicated custom categories', () => {
    useSettingsStore.getState().resetSettings();
    useSettingsStore.getState().setName('  Bunheng  ');
    assert.equal(useSettingsStore.getState().name, 'Bunheng');

    useSettingsStore.getState().enablePin('2468');
    useSettingsStore.getState().lockApp();
    assert.equal(useSettingsStore.getState().isLocked, true);
    assert.equal(useSettingsStore.getState().unlockApp('0000'), false);
    assert.equal(useSettingsStore.getState().isLocked, true);
    assert.equal(useSettingsStore.getState().unlockApp('2468'), true);
    assert.equal(useSettingsStore.getState().isLocked, false);

    const cat1 = useSettingsStore.getState().addCustomCategory('Coffee', 'expense');
    const cat2 = useSettingsStore.getState().addCustomCategory('coffee', 'expense');
    assert.ok(cat1);
    assert.equal(cat1.id, cat2?.id);
  });
});
