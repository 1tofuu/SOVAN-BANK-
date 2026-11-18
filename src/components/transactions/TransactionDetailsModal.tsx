import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  FileText,
  Hash,
  Pencil,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import { CATEGORY_META } from '../../constants/categories';
import { t } from '../../i18n/translations';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTransactionStore } from '../../stores/transactionStore';
import type { Currency, Transaction } from '../../types/finance';
import { convertCurrency, formatCurrency, formatReadableDate, toISODateString } from '../../utils/finance';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  onClose,
  onEdit,
}) => {
  const lang = useSettingsStore((s) => s.language);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!transaction) return null;

  const meta = CATEGORY_META[transaction.category] ?? CATEGORY_META.other_expense;
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  const otherCurrency: Currency = transaction.currency === 'USD' ? 'KHR' : 'USD';
  const equivalentAmount = convertCurrency(
    transaction.amount,
    transaction.currency,
    otherCurrency
  );
  const todayStr = toISODateString(new Date());

  const formatTimestamp = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 16).replace('T', ' ');
    }
  };

  return (
    <>
      <Modal
        isOpen={Boolean(transaction)}
        onClose={onClose}
        title={t(lang, 'transaction_details')}
        maxWidthClass="sm:max-w-md"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(transaction);
              }}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[#0E5A3E]/20 dark:border-white/15 bg-white dark:bg-[#1B2A22] text-sm font-semibold text-[#0E5A3E] dark:text-[#5AD3A3] hover:bg-[#0E5A3E]/6 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Pencil size={16} />
              <span>{t(lang, 'edit')}</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-red-600/10 dark:bg-red-500/15 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-600/18 dark:hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Trash2 size={16} />
              <span>{t(lang, 'delete')}</span>
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Primary Amount Block */}
          <div className="rounded-2xl p-5 bg-[#FAFBF9] dark:bg-[#0B120E] border border-[#0E5A3E]/12 dark:border-white/10 text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-2 text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE]">
              {isIncome ? (
                <ArrowDownLeft size={15} className="text-[#0E5A3E] dark:text-[#5AD3A3]" />
              ) : isTransfer ? (
                <Send size={14} className="text-[#C89B3C]" />
              ) : (
                <ArrowUpRight size={15} className="text-[#C89B3C]" />
              )}
              <span>
                {isIncome
                  ? t(lang, 'income')
                  : isTransfer
                  ? t(lang, 'transfer_out')
                  : t(lang, 'expense')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{transaction.customCategory?.trim() || t(lang, meta.labelKey)}</span>
            </div>

            <p
              className={`text-3xl font-bold tabular-nums font-mono-num ${
                isIncome
                  ? 'text-[#0E5A3E] dark:text-[#5AD3A3]'
                  : isTransfer
                  ? 'text-[#9A7422] dark:text-[#E5C16C]'
                  : 'text-[#0F1F18] dark:text-[#F1F5F2]'
              }`}
            >
              {formatCurrency(
                isIncome ? transaction.amount : -transaction.amount,
                transaction.currency,
                { showSign: true }
              )}
            </p>

            <p className="text-xs tabular-nums font-mono-num text-[#5B7268] dark:text-[#96ACA1]">
              {t(lang, 'equivalent_in')} {otherCurrency}:{' '}
              {formatCurrency(equivalentAmount, otherCurrency)}
            </p>
          </div>

          {/* Information List */}
          <div className="divide-y divide-[#0E5A3E]/10 dark:divide-white/10 border border-[#0E5A3E]/10 dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-[#5B7268] dark:text-[#96ACA1]">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.bgLight} ${meta.bgDark} ${meta.textLight} ${meta.textDark}`}
                >
                  <CategoryIcon category={transaction.category} size={14} />
                </span>
                <span>{t(lang, 'category')}</span>
              </div>
              <span className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2]">
                {transaction.customCategory?.trim() || t(lang, meta.labelKey)}
              </span>
            </div>

            {transaction.recipient && (
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-[#5B7268] dark:text-[#96ACA1]">
                  <User size={15} />
                  <span>{t(lang, 'recipient')}</span>
                </div>
                <span className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2] text-right">
                  {transaction.recipient}
                </span>
              </div>
            )}

            <div className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-[#5B7268] dark:text-[#96ACA1] shrink-0">
                <FileText size={15} />
                <span>{t(lang, 'description')}</span>
              </div>
              <span className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2] text-right">
                {transaction.description.trim() || '—'}
              </span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-[#5B7268] dark:text-[#96ACA1]">
                <Calendar size={15} />
                <span>{t(lang, 'date')}</span>
              </div>
              <span className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2]">
                {formatReadableDate(transaction.date, lang, todayStr)} · {transaction.date}
              </span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-[#5B7268] dark:text-[#96ACA1]">
                <Hash size={15} />
                <span>{t(lang, 'transaction_id')}</span>
              </div>
              <span className="text-xs font-mono-num text-[#4A6157] dark:text-[#A3B8AE]">
                {transaction.id}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#5B7268] dark:text-[#96ACA1] flex flex-col gap-1 px-1">
            <span>
              {t(lang, 'created_at')}: {formatTimestamp(transaction.createdAt)}
            </span>
            <span>
              {t(lang, 'updated_at')}: {formatTimestamp(transaction.updatedAt)}
            </span>
          </div>

        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteTransaction(transaction.id);
          onClose();
        }}
        title={t(lang, 'confirm_delete_title')}
        message={t(lang, 'confirm_delete_msg')}
        confirmLabel={t(lang, 'confirm_delete_btn')}
        cancelLabel={t(lang, 'cancel')}
        tone="danger"
      />
    </>
  );
};
