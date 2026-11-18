import React from 'react';
import { ArrowRight, Wallet } from 'lucide-react';
import { t } from '../../i18n/translations';
import type { Currency, Language, Transaction, TransactionType } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { TransactionItem } from '../transactions/TransactionItem';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  currency: Currency;
  lang: Language;
  todayStr: string;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateHistory: () => void;
  onOpenAdd: (initialType?: TransactionType) => void;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  currency,
  lang,
  todayStr,
  onSelectTransaction,
  onNavigateHistory,
  onOpenAdd,
}) => {
  return (
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

      {transactions.length > 0 ? (
        <div className="divide-y divide-[#0E5A3E]/8 dark:divide-white/8 -mx-2">
          {transactions.map((tx) => (
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
  );
};
