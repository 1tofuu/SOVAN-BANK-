import React, { useMemo } from 'react';
import { Plus, RotateCcw, Search, Wallet } from 'lucide-react';
import { CATEGORY_META } from '../constants/categories';
import { t } from '../i18n/translations';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransactionStore } from '../stores/transactionStore';
import type { DateFilterPreset, Transaction, TransactionType } from '../types/finance';
import { formatReadableDate, parseYearMonth, toISODateString } from '../utils/finance';
import { EmptyState } from '../components/common/EmptyState';
import { TransactionItem } from '../components/transactions/TransactionItem';

interface HistoryScreenProps {
  onOpenAdd: (initialType?: TransactionType) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onOpenAdd,
  onSelectTransaction,
}) => {
  const lang = useSettingsStore((s) => s.language);
  const currency = useSettingsStore((s) => s.currency);

  const transactions = useTransactionStore((s) => s.transactions);
  const searchQuery = useTransactionStore((s) => s.searchQuery);
  const typeFilter = useTransactionStore((s) => s.typeFilter);
  const dateFilter = useTransactionStore((s) => s.dateFilter);
  const customDate = useTransactionStore((s) => s.customDate);

  const setSearchQuery = useTransactionStore((s) => s.setSearchQuery);
  const setTypeFilter = useTransactionStore((s) => s.setTypeFilter);
  const setDateFilter = useTransactionStore((s) => s.setDateFilter);
  const setCustomDate = useTransactionStore((s) => s.setCustomDate);
  const resetFilters = useTransactionStore((s) => s.resetFilters);

  const now = new Date();
  const todayStr = toISODateString(now);
  const currYear = now.getFullYear();
  const currMonth = now.getMonth() + 1;
  const prevMonth = currMonth === 1 ? 12 : currMonth - 1;
  const prevYear = currMonth === 1 ? currYear - 1 : currYear;

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        if (dateFilter === 'this_month') {
          const p = parseYearMonth(tx.date);
          if (p.year !== currYear || p.month !== currMonth) return false;
        } else if (dateFilter === 'last_month') {
          const p = parseYearMonth(tx.date);
          if (p.year !== prevYear || p.month !== prevMonth) return false;
        } else if (dateFilter === 'custom_date' && customDate) {
          if (tx.date !== customDate) return false;
        }

        if (q) {
          const catLabel = (
            tx.customCategory?.trim() ||
            t(lang, CATEGORY_META[tx.category]?.labelKey ?? 'cat_other')
          ).toLowerCase();
          const desc = tx.description.toLowerCase();
          const rec = (tx.recipient ?? '').toLowerCase();
          const amt = String(tx.amount);
          if (!desc.includes(q) && !rec.includes(q) && !catLabel.includes(q) && !amt.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)
      );
  }, [
    transactions,
    searchQuery,
    typeFilter,
    dateFilter,
    customDate,
    currYear,
    currMonth,
    prevYear,
    prevMonth,
    lang,
  ]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filteredTransactions) {
      const list = map.get(tx.date) ?? [];
      list.push(tx);
      map.set(tx.date, list);
    }
    return Array.from(map.entries());
  }, [filteredTransactions]);

  const hasActiveFilter =
    searchQuery.trim() !== '' || typeFilter !== 'all' || dateFilter !== 'all';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2]">
          {t(lang, 'transaction_history')}
        </h1>
        <button
          type="button"
          onClick={() => onOpenAdd('expense')}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0E5A3E] hover:bg-[#0B4932] text-white text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
        >
          <Plus size={17} />
          <span>{t(lang, 'add_transaction')}</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-4 space-y-3.5">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7268] dark:text-[#96ACA1] pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(lang, 'search_placeholder')}
            className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#0E5A3E]/16 dark:border-white/12 bg-[#FAFBF9] dark:bg-[#0B120E] text-sm text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#0E5A3E]/30 focus:border-[#0E5A3E]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Type Filter */}
          <div className="inline-flex flex-wrap p-1 rounded-xl bg-[#0E5A3E]/6 dark:bg-white/6 self-start">
            {(['all', 'income', 'expense', 'transfer'] as const).map((typeOpt) => {
              const labelKey =
                typeOpt === 'all'
                  ? 'filter_all'
                  : typeOpt === 'income'
                  ? 'filter_income'
                  : typeOpt === 'expense'
                  ? 'filter_expense'
                  : 'filter_transfer';
              return (
                <button
                  key={typeOpt}
                  type="button"
                  onClick={() => setTypeFilter(typeOpt)}
                  className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    typeFilter === typeOpt
                      ? 'bg-white dark:bg-[#1B2A22] text-[#0F1F18] dark:text-[#F1F5F2] shadow-xs'
                      : 'text-[#5B7268] dark:text-[#96ACA1] hover:text-[#0F1F18] dark:hover:text-white'
                  }`}
                >
                  {t(lang, labelKey)}
                </button>
              );
            })}
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'date_all' },
                { id: 'this_month', label: 'date_this_month' },
                { id: 'last_month', label: 'date_last_month' },
                { id: 'custom_date', label: 'date_custom' },
              ] as { id: DateFilterPreset; label: string }[]
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setDateFilter(preset.id);
                  if (preset.id === 'custom_date' && !customDate) {
                    setCustomDate(todayStr);
                  }
                }}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                  dateFilter === preset.id
                    ? 'border-[#0E5A3E] dark:border-[#C89B3C] bg-[#0E5A3E]/10 dark:bg-[#C89B3C]/18 text-[#0E5A3E] dark:text-[#E5C16C]'
                    : 'border-[#0E5A3E]/12 dark:border-white/10 text-[#5B7268] dark:text-[#96ACA1] hover:border-[#0E5A3E]/30'
                }`}
              >
                {t(lang, preset.label)}
              </button>
            ))}

            {dateFilter === 'custom_date' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="min-h-[38px] px-3 rounded-xl border border-[#0E5A3E]/20 dark:border-white/15 bg-[#FAFBF9] dark:bg-[#0B120E] text-xs text-[#0F1F18] dark:text-[#F1F5F2]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Grouped Transaction List */}
      {grouped.length > 0 ? (
        <div className="space-y-4">
          {grouped.map(([dateStr, items]) => (
            <section
              key={dateStr}
              className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-[#FAFBF9] dark:bg-[#0B120E]/60 border-b border-[#0E5A3E]/10 dark:border-white/8 flex items-center justify-between text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
                <span>{formatReadableDate(dateStr, lang, todayStr)}</span>
                <span className="font-mono-num tabular-nums">{dateStr}</span>
              </div>
              <div className="divide-y divide-[#0E5A3E]/8 dark:divide-white/8 px-1 py-1">
                {items.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    displayCurrency={currency}
                    lang={lang}
                    todayStr={todayStr}
                    onSelect={onSelectTransaction}
                    showDate={false}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Wallet size={22} />}
          title={t(lang, 'no_transactions_found')}
          description={t(lang, 'no_transactions_desc')}
          action={
            hasActiveFilter ? (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#0E5A3E]/20 dark:border-white/15 text-sm font-medium text-[#0E5A3E] dark:text-[#5AD3A3] inline-flex items-center gap-2"
              >
                <RotateCcw size={15} />
                <span>{t(lang, 'filter_all')}</span>
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
};
