import React, { useMemo } from 'react';
import { Plus, RotateCcw, Wallet } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { useFilteredTransactions } from '../hooks/useTransactions';
import { t } from '../i18n/translations';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransactionStore } from '../stores/transactionStore';
import type { Transaction, TransactionType } from '../types';
import { formatReadableDate, toISODateString } from '../utils/date';

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

  const searchQuery = useTransactionStore((s) => s.searchQuery);
  const typeFilter = useTransactionStore((s) => s.typeFilter);
  const dateFilter = useTransactionStore((s) => s.dateFilter);
  const customDate = useTransactionStore((s) => s.customDate);

  const setSearchQuery = useTransactionStore((s) => s.setSearchQuery);
  const setTypeFilter = useTransactionStore((s) => s.setTypeFilter);
  const setDateFilter = useTransactionStore((s) => s.setDateFilter);
  const setCustomDate = useTransactionStore((s) => s.setCustomDate);
  const resetFilters = useTransactionStore((s) => s.resetFilters);

  const todayStr = toISODateString(new Date());
  const filteredTransactions = useFilteredTransactions();

  const groupedByDate = useMemo(() => {
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

      <TransactionFilters
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        dateFilter={dateFilter}
        customDate={customDate}
        todayStr={todayStr}
        lang={lang}
        onSearchChange={setSearchQuery}
        onTypeFilterChange={setTypeFilter}
        onDateFilterChange={setDateFilter}
        onCustomDateChange={setCustomDate}
      />

      {/* Grouped Transaction List */}
      {groupedByDate.length > 0 ? (
        <div className="space-y-4">
          {groupedByDate.map(([dateStr, items]) => (
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
