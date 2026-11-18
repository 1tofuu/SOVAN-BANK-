/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
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
import type { AppTab, Transaction, TransactionType } from './types/finance';

export default function App() {
  const theme = useSettingsStore((s) => s.theme);
  const lang = useSettingsStore((s) => s.language);
  const isLocked = useSettingsStore((s) => s.isLocked);
  const transactions = useTransactionStore((s) => s.transactions);

  const now = new Date();
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formInitialType, setFormInitialType] = useState<TransactionType>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const selectedTransaction =
    selectedTxId ? transactions.find((tx) => tx.id === selectedTxId) ?? null : null;

  const handleOpenAdd = (initialType: TransactionType = 'expense') => {
    setEditingTx(null);
    setFormInitialType(initialType);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormInitialType(tx.type);
    setFormModalOpen(true);
  };

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

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
      onOpenAdd={() => handleOpenAdd('expense')}
    >
      {activeTab === 'dashboard' && (
        <DashboardScreen
          transactions={transactions}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={handleMonthChange}
          onOpenAdd={handleOpenAdd}
          onSelectTransaction={(tx) => setSelectedTxId(tx.id)}
          onNavigateHistory={() => setActiveTab('history')}
          onNavigateBudget={() => setActiveTab('budget')}
        />
      )}

      {activeTab === 'history' && (
        <HistoryScreen
          onOpenAdd={handleOpenAdd}
          onSelectTransaction={(tx) => setSelectedTxId(tx.id)}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetScreen
          transactions={transactions}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={handleMonthChange}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsScreen
          transactions={transactions}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={handleMonthChange}
        />
      )}

      {activeTab === 'settings' && <SettingsScreen />}

      <TransactionFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingTx(null);
        }}
        editingTransaction={editingTx}
        initialType={formInitialType}
      />

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTxId(null)}
        onEdit={handleOpenEdit}
      />
    </AppShell>
  );
}
