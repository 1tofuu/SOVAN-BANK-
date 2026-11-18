import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import {
  CATEGORY_META,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSFER_CATEGORIES,
} from '../../constants/categories';
import { t } from '../../i18n/translations';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTransactionStore } from '../../stores/transactionStore';
import type {
  Currency,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../../types/finance';
import {
  calculateBalanceMetrics,
  convertCurrency,
  formatCurrency,
  toISODateString,
  toMinorUnits,
} from '../../utils/finance';
import { CategoryIcon } from '../common/CategoryIcon';
import { Modal } from '../common/Modal';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
  initialType?: TransactionType;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  editingTransaction = null,
  initialType = 'expense',
}) => {
  const lang = useSettingsStore((s) => s.language);
  const defaultCurrency = useSettingsStore((s) => s.currency);
  const customCategories = useSettingsStore((s) => s.customCategories);
  const addCustomCategory = useSettingsStore((s) => s.addCustomCategory);
  const removeCustomCategory = useSettingsStore((s) => s.removeCustomCategory);
  const openingBalanceUSD = useSettingsStore((s) => s.openingBalanceUSD);

  const transactions = useTransactionStore((s) => s.transactions);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [category, setCategory] = useState<TransactionCategory | ''>('');
  const [selectedCustomName, setSelectedCustomName] = useState<string>('');
  const [customCategoryDraft, setCustomCategoryDraft] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(toISODateString(new Date()));
  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    date?: string;
  }>({});

  const getDefaultCategoryForType = (txType: TransactionType): TransactionCategory => {
    if (txType === 'income') return 'salary';
    if (txType === 'transfer') return 'bank_transfer';
    return 'food_drinks';
  };

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCurrency(editingTransaction.currency);
      setCategory(editingTransaction.category);
      setSelectedCustomName(editingTransaction.customCategory ?? '');
      setCustomCategoryDraft('');
      setRecipient(editingTransaction.recipient ?? '');
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
    } else {
      setType(initialType);
      setAmount('');
      setCurrency(defaultCurrency);
      setCategory(getDefaultCategoryForType(initialType));
      setSelectedCustomName('');
      setCustomCategoryDraft('');
      setRecipient('');
      setDescription('');
      setDate(toISODateString(new Date()));
    }
  }, [isOpen, editingTransaction, initialType, defaultCurrency]);

  const categories: TransactionCategory[] =
    type === 'income'
      ? INCOME_CATEGORIES
      : type === 'transfer'
      ? TRANSFER_CATEGORIES
      : EXPENSE_CATEGORIES;

  const otherCategoryId: TransactionCategory =
    type === 'income'
      ? 'other_income'
      : type === 'transfer'
      ? 'other_transfer'
      : 'other_expense';

  const savedCustomForType = customCategories.filter((c) => c.type === type);
  const isOtherBaseSelected = category === otherCategoryId && !selectedCustomName;

  const handleTypeSwitch = (nextType: TransactionType) => {
    setType(nextType);
    const validList: TransactionCategory[] =
      nextType === 'income'
        ? INCOME_CATEGORIES
        : nextType === 'transfer'
        ? TRANSFER_CATEGORIES
        : EXPENSE_CATEGORIES;
    if (!category || !validList.includes(category)) {
      setCategory(validList[0]);
    }
    setSelectedCustomName('');
    setCustomCategoryDraft('');
    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryDraft.trim();
    if (!trimmed) return;
    const created = addCustomCategory(trimmed, type);
    setCategory(otherCategoryId);
    setSelectedCustomName(created.name);
    setCustomCategoryDraft('');
    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  // Available balance in the form's selected currency (excluding the edited transfer's original amount if editing)
  const rawBalanceInCurrency = calculateBalanceMetrics(
    transactions,
    openingBalanceUSD,
    currency
  ).totalBalance;
  const editingRefund =
    editingTransaction && editingTransaction.type === 'transfer'
      ? convertCurrency(editingTransaction.amount, editingTransaction.currency, currency)
      : 0;
  const availableBalance = Math.max(
    0,
    Math.round((rawBalanceInCurrency + editingRefund) * (currency === 'USD' ? 100 : 1)) /
      (currency === 'USD' ? 100 : 1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { amount?: string; category?: string; date?: string } = {};

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = t(lang, 'err_amount_positive');
    } else if (type === 'transfer') {
      const requestedMinor = toMinorUnits(parsedAmount, currency);
      const availableMinor = toMinorUnits(availableBalance, currency);
      if (availableMinor <= 0 || requestedMinor > availableMinor) {
        nextErrors.amount = `${t(lang, 'err_insufficient_balance')} (${t(
          lang,
          'available_balance'
        )}: ${formatCurrency(availableBalance, currency)})`;
      }
    }
    if (!category) {
      nextErrors.category = t(lang, 'err_category_required');
    }
    if (!date) {
      nextErrors.date = t(lang, 'err_date_required');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    let resolvedCustomCategory: string | undefined = selectedCustomName.trim() || undefined;
    if (isOtherBaseSelected && customCategoryDraft.trim()) {
      const created = addCustomCategory(customCategoryDraft.trim(), type);
      resolvedCustomCategory = created.name;
    }

    const payload = {
      type,
      amount: currency === 'KHR' ? Math.round(parsedAmount) : Math.round(parsedAmount * 100) / 100,
      currency,
      category: category as TransactionCategory,
      customCategory: resolvedCustomCategory,
      recipient: type === 'transfer' ? recipient.trim() || undefined : undefined,
      description: description.trim(),
      date,
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  const modalTitle = editingTransaction
    ? t(lang, 'edit_transaction')
    : type === 'transfer'
    ? t(lang, 'transfer_money_out')
    : t(lang, 'add_transaction');

  const submitLabel = editingTransaction
    ? t(lang, 'update_transaction')
    : type === 'transfer'
    ? t(lang, 'save_transfer')
    : t(lang, 'save_transaction');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidthClass="sm:max-w-xl"
      onSubmit={handleSubmit}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-4 py-2 rounded-xl text-sm font-medium text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/8 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            {t(lang, 'cancel')}
          </button>
          <button
            type="submit"
            className={`flex-1 sm:flex-none min-h-[46px] px-6 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-all whitespace-nowrap shadow-sm ${
              type === 'transfer'
                ? 'bg-[#C89B3C] hover:bg-[#B2882E]'
                : 'bg-[#0E5A3E] hover:bg-[#0B4932]'
            }`}
          >
            {submitLabel}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Type Segmented Switch */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0E5A3E]/6 dark:bg-white/6">
          <button
            type="button"
            onClick={() => handleTypeSwitch('expense')}
            className={`min-h-[44px] px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              type === 'expense'
                ? 'bg-white dark:bg-[#1B2A22] text-[#0F1F18] dark:text-[#F1F5F2] shadow-xs'
                : 'text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white'
            }`}
          >
            {t(lang, 'expense')}
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('income')}
            className={`min-h-[44px] px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              type === 'income'
                ? 'bg-[#0E5A3E] text-white shadow-xs'
                : 'text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white'
            }`}
          >
            {t(lang, 'income')}
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('transfer')}
            className={`min-h-[44px] px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              type === 'transfer'
                ? 'bg-[#C89B3C] text-white shadow-xs'
                : 'text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white'
            }`}
          >
            {t(lang, 'transfer_out')}
          </button>
        </div>

        {/* Amount + Currency Row */}
        <div>
          <label
            htmlFor="tx-amount"
            className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-1.5"
          >
            {t(lang, 'amount')}
          </label>
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-[#4A6157] dark:text-[#A3B8AE] pointer-events-none">
                {currency === 'USD' ? '$' : '៛'}
              </span>
              <input
                id="tx-amount"
                type="number"
                inputMode="decimal"
                step={currency === 'USD' ? '0.01' : '100'}
                min="0"
                placeholder={currency === 'USD' ? '0.00' : '0'}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                className={`w-full min-h-[48px] pl-9 pr-4 rounded-xl border text-lg font-semibold tabular-nums font-mono-num bg-[#FAFBF9] dark:bg-[#0B120E] text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-[#0E5A3E]/18 dark:border-white/14 focus:ring-[#0E5A3E]/30 focus:border-[#0E5A3E]'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 p-1 rounded-xl border border-[#0E5A3E]/14 dark:border-white/12 bg-[#FAFBF9] dark:bg-[#0B120E] shrink-0">
              {(['USD', 'KHR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`px-3 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    currency === cur
                      ? 'bg-[#C89B3C] text-white'
                      : 'text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
          {type === 'transfer' && (
            <div className="mt-2 flex items-center justify-between text-xs px-1">
              <span className="text-[#5B7268] dark:text-[#96ACA1]">
                {t(lang, 'available_balance')}:
              </span>
              <span
                className={`font-semibold tabular-nums font-mono-num ${
                  availableBalance <= 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-[#0E5A3E] dark:text-[#5AD3A3]'
                }`}
              >
                {formatCurrency(availableBalance, currency)}
              </span>
            </div>
          )}
          {type === 'transfer' && availableBalance <= 0 && !errors.amount && (
            <div
              role="alert"
              className="mt-2 rounded-xl border border-red-500/25 bg-red-600/8 dark:bg-red-500/12 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <AlertCircle size={15} className="shrink-0" />
              <span>{t(lang, 'alert_balance_zero_transfer')}</span>
            </div>
          )}
          {errors.amount && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.amount}</span>
            </p>
          )}
        </div>

        {/* Category Grid Selector */}
        <div>
          <span className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-2">
            {t(lang, 'category')}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((catId) => {
              const meta = CATEGORY_META[catId];
              const isSelected = category === catId && !selectedCustomName;
              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => {
                    setCategory(catId);
                    setSelectedCustomName('');
                    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  className={`min-h-[46px] px-3 py-2 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-[#0E5A3E] dark:border-[#C89B3C] bg-[#0E5A3E]/8 dark:bg-[#C89B3C]/15 text-[#0F1F18] dark:text-[#F1F5F2] ring-1 ring-[#0E5A3E]/25 dark:ring-[#C89B3C]/35'
                      : 'border-[#0E5A3E]/12 dark:border-white/10 bg-white dark:bg-[#0B120E]/60 text-[#4A6157] dark:text-[#A3B8AE] hover:border-[#0E5A3E]/30 dark:hover:border-white/25'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.textLight} ${meta.textDark}`}
                  >
                    <CategoryIcon category={catId} size={15} />
                  </span>
                  <span className="text-xs font-medium truncate">{t(lang, meta.labelKey)}</span>
                </button>
              );
            })}

            {/* User-added Custom Categories */}
            {savedCustomForType.map((customCat) => {
              const meta = CATEGORY_META[otherCategoryId];
              const isSelected =
                category === otherCategoryId &&
                selectedCustomName.toLowerCase() === customCat.name.toLowerCase();
              return (
                <div
                  key={customCat.id}
                  className={`min-h-[46px] pl-3 pr-1.5 py-1.5 rounded-xl border flex items-center justify-between gap-1.5 transition-all ${
                    isSelected
                      ? 'border-[#0E5A3E] dark:border-[#C89B3C] bg-[#0E5A3E]/8 dark:bg-[#C89B3C]/15 text-[#0F1F18] dark:text-[#F1F5F2] ring-1 ring-[#0E5A3E]/25 dark:ring-[#C89B3C]/35'
                      : 'border-[#0E5A3E]/12 dark:border-white/10 bg-white dark:bg-[#0B120E]/60 text-[#4A6157] dark:text-[#A3B8AE] hover:border-[#0E5A3E]/30 dark:hover:border-white/25'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(otherCategoryId);
                      setSelectedCustomName(customCat.name);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left py-1"
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.textLight} ${meta.textDark}`}
                    >
                      <CategoryIcon category={otherCategoryId} size={15} />
                    </span>
                    <span className="text-xs font-medium truncate">{customCat.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeCustomCategory(customCat.id);
                      if (selectedCustomName.toLowerCase() === customCat.name.toLowerCase()) {
                        setSelectedCustomName('');
                      }
                    }}
                    aria-label={`Remove ${customCat.name}`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5B7268] hover:text-red-600 hover:bg-red-600/10 shrink-0 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Inline Custom Category Creator when "Other" is selected */}
          {isOtherBaseSelected && (
            <div className="mt-3 p-3.5 rounded-xl border border-[#C89B3C]/35 bg-[#C89B3C]/8 dark:bg-[#C89B3C]/12 space-y-2">
              <label
                htmlFor="custom-category-input"
                className="block text-xs font-semibold text-[#0F1F18] dark:text-[#F1F5F2]"
              >
                {t(lang, 'custom_category_label')}
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="custom-category-input"
                  type="text"
                  maxLength={40}
                  value={customCategoryDraft}
                  onChange={(e) => setCustomCategoryDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCategory();
                    }
                  }}
                  placeholder={t(lang, 'custom_category_placeholder')}
                  className="flex-1 min-h-[42px] px-3 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 bg-white dark:bg-[#0B120E] text-sm text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/40"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  disabled={!customCategoryDraft.trim()}
                  className="min-h-[42px] px-3.5 rounded-xl bg-[#C89B3C] hover:bg-[#B2882E] disabled:opacity-45 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  <Plus size={15} />
                  <span>{t(lang, 'add_category_btn')}</span>
                </button>
              </div>
            </div>
          )}

          {errors.category && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <AlertCircle size={14} />
              <span>{errors.category}</span>
            </p>
          )}
        </div>

        {/* Recipient / Account (Transfer Out only) */}
        {type === 'transfer' && (
          <div>
            <label
              htmlFor="tx-recipient"
              className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-1.5"
            >
              {t(lang, 'recipient')}
            </label>
            <input
              id="tx-recipient"
              type="text"
              maxLength={80}
              placeholder={t(lang, 'recipient_placeholder')}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 bg-[#FAFBF9] dark:bg-[#0B120E] text-sm text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/35 focus:border-[#C89B3C]"
            />
          </div>
        )}

        {/* Description & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="tx-description"
              className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-1.5"
            >
              {t(lang, 'description')}
            </label>
            <input
              id="tx-description"
              type="text"
              maxLength={120}
              placeholder={t(lang, 'description_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 bg-[#FAFBF9] dark:bg-[#0B120E] text-sm text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#0E5A3E]/30 focus:border-[#0E5A3E]"
            />
          </div>

          <div>
            <label
              htmlFor="tx-date"
              className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-1.5"
            >
              {t(lang, 'date')}
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className={`w-full min-h-[44px] px-3.5 rounded-xl border bg-[#FAFBF9] dark:bg-[#0B120E] text-sm text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 ${
                errors.date
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-[#0E5A3E]/18 dark:border-white/14 focus:ring-[#0E5A3E]/30 focus:border-[#0E5A3E]'
              }`}
            />
            {errors.date && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle size={14} />
                <span>{errors.date}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
