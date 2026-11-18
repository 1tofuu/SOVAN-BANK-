/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AppShell } from './components/navigation/AppShell';
import { PinLockScreen } from './components/security/PinLockScreen';
import { TransactionDetailsModal } from './components/transactions/TransactionDetailsModal';
import { TransactionFormModal } from './components/transactions/TransactionFormModal';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { BudgetScreen } from './screens/BudgetScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useSettingsStore } from './stores/settingsStore';
import { useTransactionStore } from './stores/transactionStore';
import type { AppTab, Transaction, TransactionType } from './types';

export default function App() {
  const theme = useSettingsStore((s) => s.theme);
  const lang = useSettingsStore((s) => s.language);
  const isLocked = useSettingsStore((s) => s.isLocked);

  const now = new Date();
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formInitialType, setFormInitialType] = useState<TransactionType>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Narrow selector: only re-render App when the currently inspected transaction changes.
  const selectedTransaction = useTransactionStore((s) =>
    selectedTxId ? s.transactions.find((tx) => tx.id === selectedTxId) ?? null : null
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleOpenAdd = useCallback((initialType: TransactionType = 'expense') => {
    setEditingTx(null);
    setFormInitialType(initialType);
    setFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((tx: Transaction) => {
    setEditingTx(tx);
    setFormInitialType(tx.type);
    setFormModalOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormModalOpen(false);
    setEditingTx(null);
  }, []);

  const handleSelectTransaction = useCallback((tx: Transaction) => {
    setSelectedTxId(tx.id);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedTxId(null);
  }, []);

  const handleMonthChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const handleNavigateHistory = useCallback(() => setActiveTab('history'), []);
  const handleNavigateBudget = useCallback(() => setActiveTab('budget'), []);
  const handleOpenDefaultAdd = useCallback(() => handleOpenAdd('expense'), [handleOpenAdd]);

  if (showWelcome) {
    return <WelcomeScreen onContinue={() => setShowWelcome(false)} />;
  }

  if (isLocked) {
    return <PinLockScreen />;
  }

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onOpenAdd={handleOpenDefaultAdd}
    >
      {activeTab === 'dashboard' && (
        <DashboardScreen
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={handleMonthChange}
          onOpenAdd={handleOpenAdd}
          onSelectTransaction={handleSelectTransaction}
          onNavigateHistory={handleNavigateHistory}
          onNavigateBudget={handleNavigateBudget}
        />
      )}

      {activeTab === 'history' && (
        <HistoryScreen
          onOpenAdd={handleOpenAdd}
          onSelectTransaction={handleSelectTransaction}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetScreen
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={handleMonthChange}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsScreen
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={handleMonthChange}
        />
      )}

      {activeTab === 'settings' && <SettingsScreen />}

      <TransactionFormModal
        isOpen={formModalOpen}
        onClose={handleCloseForm}
        editingTransaction={editingTx}
        initialType={formInitialType}
      />

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={handleCloseDetails}
        onEdit={handleOpenEdit}
      />
    </AppShell>
  );
}
