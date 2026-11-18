import React, { useEffect, useMemo, useState } from 'react';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MonthlyKpiGrid } from '../components/dashboard/MonthlyKpiGrid';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { useMonthlyBudget } from '../hooks/useBudget';
import { useCurrency } from '../hooks/useCurrency';
import {
  useBalanceMetrics,
  useMonthlyMetrics,
  useRecentTransactions,
} from '../hooks/useTransactions';
import { t } from '../i18n/translations';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransactionStore } from '../stores/transactionStore';
import type { Transaction, TransactionType } from '../types';
import { getIncomeExpenseSeries } from '../utils/calculations';
import { getGreetingKey, toISODateString } from '../utils/date';

interface DashboardScreenProps {
  selectedMonth: number;
  selectedYear: number;
  onChangeMonth: (month: number, year: number) => void;
  onOpenAdd: (initialType?: TransactionType) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateHistory: () => void;
  onNavigateBudget: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  selectedMonth,
  selectedYear,
  onChangeMonth,
  onOpenAdd,
  onSelectTransaction,
  onNavigateHistory,
  onNavigateBudget,
}) => {
  const name = useSettingsStore((s) => s.name);
  const lang = useSettingsStore((s) => s.language);
  const balanceBlurred = useSettingsStore((s) => s.balanceBlurred);
  const toggleBalanceBlurred = useSettingsStore((s) => s.toggleBalanceBlurred);
  const transactions = useTransactionStore((s) => s.transactions);

  const { currency, setCurrency } = useCurrency();
  const balanceMetrics = useBalanceMetrics();
  const monthlyMetrics = useMonthlyMetrics(selectedYear, selectedMonth);
  const { metrics: budgetMetrics } = useMonthlyBudget(selectedYear, selectedMonth);
  const recentTransactions = useRecentTransactions();

  const [transferAlert, setTransferAlert] = useState(false);

  const now = new Date();
  const todayStr = toISODateString(now);
  const greetingKey = getGreetingKey(now.getHours());

  useEffect(() => {
    if (balanceMetrics.totalBalance > 0 && transferAlert) {
      setTransferAlert(false);
    }
  }, [balanceMetrics.totalBalance, transferAlert]);

  const handleTransferClick = () => {
    if (balanceMetrics.totalBalance <= 0) {
      setTransferAlert(true);
      return;
    }
    setTransferAlert(false);
    onOpenAdd('transfer');
  };

  const chartSeries = useMemo(
    () =>
      getIncomeExpenseSeries(
        transactions,
        'monthly',
        selectedYear,
        selectedMonth,
        currency,
        lang,
        todayStr
      ),
    [transactions, selectedYear, selectedMonth, currency, lang, todayStr]
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        greetingKey={greetingKey}
        userName={name}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        lang={lang}
        onChangeMonth={onChangeMonth}
      />

      {/* Hero Balance + Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <BalanceCard
          totalBalance={balanceMetrics.totalBalance}
          openingBalance={balanceMetrics.openingBalance}
          currency={currency}
          lang={lang}
          balanceBlurred={balanceBlurred}
          transferAlert={transferAlert}
          onToggleBalanceBlurred={toggleBalanceBlurred}
          onSelectCurrency={setCurrency}
          onOpenAdd={onOpenAdd}
          onTransferClick={handleTransferClick}
          onDismissTransferAlert={() => setTransferAlert(false)}
        />

        <MonthlyKpiGrid
          monthlyMetrics={monthlyMetrics}
          budgetMetrics={budgetMetrics}
          currency={currency}
          lang={lang}
          onNavigateBudget={onNavigateBudget}
        />
      </div>

      {/* Chart & Recent Transactions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
              {t(lang, 'income_vs_expense')}
            </h2>
            <span className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
              {t(lang, 'period_monthly')}
            </span>
          </div>
          <IncomeExpenseChart data={chartSeries} currency={currency} lang={lang} />
        </section>

        <RecentTransactionsCard
          transactions={recentTransactions}
          currency={currency}
          lang={lang}
          todayStr={todayStr}
          onSelectTransaction={onSelectTransaction}
          onNavigateHistory={onNavigateHistory}
          onOpenAdd={onOpenAdd}
        />
      </div>
    </div>
  );
};
