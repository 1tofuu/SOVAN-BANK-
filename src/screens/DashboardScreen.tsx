import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Plus,
  PiggyBank,
  Send,
  Wallet,
  X,
} from 'lucide-react';
import { t } from '../i18n/translations';
import { useBudgetStore } from '../stores/budgetStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { Transaction, TransactionType } from '../types/finance';
import {
  calculateBalanceMetrics,
  calculateBudgetMetrics,
  calculateMonthlyMetrics,
  formatCurrency,
  getIncomeExpenseSeries,
  toISODateString,
} from '../utils/finance';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { EmptyState } from '../components/common/EmptyState';
import { MonthSelector } from '../components/common/MonthSelector';
import { TransactionItem } from '../components/transactions/TransactionItem';

interface DashboardScreenProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  onChangeMonth: (month: number, year: number) => void;
  onOpenAdd: (initialType?: TransactionType) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateHistory: () => void;
  onNavigateBudget: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  transactions,
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
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const openingBalanceUSD = useSettingsStore((s) => s.openingBalanceUSD);
  const balanceBlurred = useSettingsStore((s) => s.balanceBlurred);
  const toggleBalanceBlurred = useSettingsStore((s) => s.toggleBalanceBlurred);
  const budgets = useBudgetStore((s) => s.budgets);
  const [transferAlert, setTransferAlert] = useState(false);

  const now = new Date();
  const todayStr = toISODateString(now);
  const hour = now.getHours();
  const greetingKey =
    hour < 12 ? 'greeting_morning' : hour < 17 ? 'greeting_afternoon' : 'greeting_evening';

  const balanceMetrics = calculateBalanceMetrics(transactions, openingBalanceUSD, currency);

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
  const monthlyMetrics = calculateMonthlyMetrics(
    transactions,
    selectedYear,
    selectedMonth,
    currency
  );
  const currentBudget = budgets.find(
    (b) => b.month === selectedMonth && b.year === selectedYear
  );
  const budgetMetrics = calculateBudgetMetrics(
    currentBudget,
    transactions,
    selectedYear,
    selectedMonth,
    currency
  );

  const chartSeries = getIncomeExpenseSeries(
    transactions,
    'monthly',
    selectedYear,
    selectedMonth,
    currency,
    lang,
    todayStr
  );

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Greeting + Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2]">
            {t(lang, greetingKey)}, {name}
          </h1>
        </div>

        <MonthSelector
          month={selectedMonth}
          year={selectedYear}
          lang={lang}
          onChange={onChangeMonth}
        />
      </div>

      {/* Hero Balance + Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SOVAN Card Balance Anchor */}
        <section className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-[#CBE8C3] text-[#0B2E1F] p-6 shadow-md border border-[#0E5A3E]/15 flex flex-col justify-between min-h-[220px]">
          <img
            src="/assets/aistudio/card_no_sim_06aa568a.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.24] pointer-events-none select-none"
          />

          <div className="relative z-10 space-y-2">
            {/* Top Row: Label + Privacy Eye + Currency Switcher */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#144732] drop-shadow-[0_1px_1px_rgba(255,255,255,0.65)]">
                {t(lang, 'total_balance')}
              </p>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleBalanceBlurred}
                  aria-label={balanceBlurred ? t(lang, 'show_balance') : t(lang, 'hide_balance')}
                  aria-pressed={balanceBlurred}
                  title={balanceBlurred ? t(lang, 'show_balance') : t(lang, 'hide_balance')}
                  className="min-h-[36px] min-w-[36px] rounded-xl bg-white/45 backdrop-blur-md border border-[#0E5A3E]/15 text-[#144732] hover:text-[#082619] hover:bg-white/60 flex items-center justify-center transition-colors"
                >
                  {balanceBlurred ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>

                <div className="inline-flex p-0.5 rounded-xl bg-white/45 backdrop-blur-md border border-[#0E5A3E]/15 shrink-0">
                  {(['USD', 'KHR'] as const).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setCurrency(cur)}
                      className={`min-h-[32px] px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        currency === cur
                          ? 'bg-[#C89B3C] text-white shadow-xs'
                          : 'text-[#144732] hover:text-[#082619]'
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Full-Width Balance Display */}
            <div className="w-full min-w-0">
              {(() => {
                const formattedBal = formatCurrency(balanceMetrics.totalBalance, currency);
                const isLong = formattedBal.length > 15;
                const isVeryLong = formattedBal.length > 20;
                return (
                  <p
                    onClick={toggleBalanceBlurred}
                    title={balanceBlurred ? t(lang, 'show_balance') : t(lang, 'hide_balance')}
                    className={`font-bold tracking-tight tabular-nums font-mono-num leading-tight text-[#082619] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] cursor-pointer transition-[filter] duration-200 ${
                      balanceBlurred ? 'blur-md select-none' : ''
                    } ${
                      isVeryLong
                        ? 'text-xl sm:text-2xl break-words'
                        : isLong
                        ? 'text-2xl sm:text-[30px] whitespace-nowrap'
                        : 'text-[32px] sm:text-4xl whitespace-nowrap'
                    }`}
                  >
                    {formattedBal}
                  </p>
                );
              })()}
              <p className="text-xs font-medium text-[#1D543B] mt-1.5 tabular-nums font-mono-num break-words drop-shadow-[0_1px_1px_rgba(255,255,255,0.65)]">
                {t(lang, 'opening_balance')}:{' '}
                <span className={`inline-block transition-[filter] duration-200 ${balanceBlurred ? 'blur-[5px] select-none' : ''}`}>
                  {formatCurrency(balanceMetrics.openingBalance, currency)}
                </span>
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2 pt-5">
            <button
              type="button"
              onClick={() => onOpenAdd('expense')}
              className="h-9 px-3 py-1.5 rounded-lg bg-[#C89B3C] hover:bg-[#D5A746] active:scale-[0.98] text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Plus size={14} />
              <span>{t(lang, 'quick_add')}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAdd('income')}
              className="h-9 px-2.5 py-1.5 rounded-lg bg-[#0E5A3E]/85 hover:bg-[#0E5A3E] backdrop-blur-sm text-white text-xs font-medium transition-colors inline-flex items-center gap-1 whitespace-nowrap shadow-xs"
            >
              <ArrowDownLeft size={13} />
              <span>{t(lang, 'income')}</span>
            </button>

            <button
              type="button"
              onClick={handleTransferClick}
              className="h-9 px-2.5 py-1.5 rounded-lg bg-[#0E5A3E]/85 hover:bg-[#0E5A3E] backdrop-blur-sm text-white text-xs font-medium transition-colors inline-flex items-center gap-1 whitespace-nowrap shadow-xs"
            >
              <Send size={12} />
              <span>{t(lang, 'transfer_out')}</span>
            </button>
          </div>

          {transferAlert && (
            <div
              role="alert"
              className="relative z-10 mt-3 rounded-xl bg-red-950/88 backdrop-blur-md border border-red-300/35 px-3 py-2.5 text-xs text-red-100 flex items-start justify-between gap-2 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="text-[#F4DFAA] shrink-0 mt-0.5" />
                <span>{t(lang, 'alert_balance_zero_transfer')}</span>
              </div>
              <button
                type="button"
                onClick={() => setTransferAlert(false)}
                aria-label="Dismiss alert"
                className="text-white/70 hover:text-white shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </section>

        {/* 3 Monthly KPI Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Monthly Income */}
          <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
                {t(lang, 'monthly_income')}
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#0E5A3E]/10 dark:bg-[#19875D]/20 text-[#0E5A3E] dark:text-[#5AD3A3] flex items-center justify-center shrink-0">
                <ArrowDownLeft size={16} />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xl sm:text-2xl font-bold tabular-nums font-mono-num text-[#0E5A3E] dark:text-[#5AD3A3] truncate">
                {formatCurrency(monthlyMetrics.monthlyIncome, currency)}
              </p>
              <p className="text-xs text-[#5B7268] dark:text-[#96ACA1] mt-1">
                {t(lang, 'income')}
              </p>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
                {t(lang, 'monthly_expenses')}
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#C89B3C]/14 dark:bg-[#C89B3C]/20 text-[#9A7422] dark:text-[#E5C16C] flex items-center justify-center shrink-0">
                <ArrowUpRight size={16} />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xl sm:text-2xl font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] truncate">
                {formatCurrency(monthlyMetrics.monthlyExpenses, currency)}
              </p>
              <p className="text-xs text-[#5B7268] dark:text-[#96ACA1] mt-1">
                {t(lang, 'expense')}
              </p>
            </div>
          </div>

          {/* Remaining Budget */}
          <button
            type="button"
            onClick={onNavigateBudget}
            className="text-left rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 hover:border-[#0E5A3E]/30 dark:hover:border-[#C89B3C]/40 p-5 flex flex-col justify-between transition-colors"
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
                {t(lang, 'remaining_budget')}
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#0E5A3E]/8 dark:bg-white/8 text-[#0E5A3E] dark:text-[#C89B3C] flex items-center justify-center shrink-0">
                <PiggyBank size={16} />
              </span>
            </div>

            {budgetMetrics.hasBudget ? (
              <div className="mt-4 w-full">
                <p
                  className={`text-xl sm:text-2xl font-bold tabular-nums font-mono-num truncate ${
                    budgetMetrics.status === 'exceeded'
                      ? 'text-red-600 dark:text-red-400'
                      : budgetMetrics.status === 'warning'
                      ? 'text-[#9A7422] dark:text-[#E5C16C]'
                      : 'text-[#0F1F18] dark:text-[#F1F5F2]'
                  }`}
                >
                  {formatCurrency(budgetMetrics.remaining, currency)}
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#0E5A3E]/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      budgetMetrics.status === 'exceeded'
                        ? 'bg-red-600'
                        : budgetMetrics.status === 'warning'
                        ? 'bg-[#C89B3C]'
                        : 'bg-[#0E5A3E] dark:bg-[#2E9E72]'
                    }`}
                    style={{ width: `${Math.min(100, budgetMetrics.percentage)}%` }}
                  />
                </div>
                <p className="text-[11px] tabular-nums font-mono-num text-[#5B7268] dark:text-[#96ACA1] mt-1.5">
                  {budgetMetrics.percentage.toFixed(0)}% ·{' '}
                  {formatCurrency(budgetMetrics.limit, currency, { compact: currency === 'KHR' })}
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
                  {t(lang, 'no_budget_set')}
                </p>
                <p className="text-xs font-medium text-[#0E5A3E] dark:text-[#C89B3C] mt-1 inline-flex items-center gap-1">
                  <span>{t(lang, 'set_budget_prompt')}</span>
                  <ArrowRight size={13} />
                </p>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Chart & Recent Transactions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Income vs Expense Chart */}
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

        {/* Recent Transactions */}
        <section className="lg:col-span-5 rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
              {t(lang, 'recent_transactions')}
            </h2>
            <button
              type="button"
              onClick={onNavigateHistory}
              className="min-h-[36px] px-2 text-xs font-semibold text-[#0E5A3E] dark:text-[#5AD3A3] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>{t(lang, 'view_all')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-[#0E5A3E]/8 dark:divide-white/8 -mx-2">
              {recentTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  displayCurrency={currency}
                  lang={lang}
                  todayStr={todayStr}
                  onSelect={onSelectTransaction}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Wallet size={22} />}
              title={t(lang, 'no_transactions_found')}
              description={t(lang, 'no_transactions_desc')}
              action={
                <button
                  type="button"
                  onClick={() => onOpenAdd('expense')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0E5A3E] text-white text-sm font-semibold"
                >
                  {t(lang, 'add_transaction')}
                </button>
              }
            />
          )}
        </section>
      </div>
    </div>
  );
};
