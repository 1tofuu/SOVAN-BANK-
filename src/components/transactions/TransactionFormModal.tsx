import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  getCategoriesForType,
  getDefaultCategoryForType,
  getOtherCategoryId,
} from '../../constants/categories';
import { t } from '../../i18n/translations';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTransactionStore } from '../../stores/transactionStore';
import type {
  Currency,
  CustomCategory,
  Transaction,
  TransactionCategory,
  TransactionType,
  TransactionValidationErrors,
} from '../../types';
import { calculateAvailableTransferBalance } from '../../utils/calculations';
import { toISODateString } from '../../utils/date';
import { validateTransactionInput } from '../../utils/validation';
import { Modal } from '../common/Modal';
import { AmountCurrencyField } from './AmountCurrencyField';
import { CategorySelectorGrid } from './CategorySelectorGrid';
import { TransactionTypeSwitch } from './TransactionTypeSwitch';

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
  const [selectedCustomName, setSelectedCustomName] = useState('');
  const [customCategoryDraft, setCustomCategoryDraft] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(toISODateString(new Date()));
  const [errors, setErrors] = useState<TransactionValidationErrors>({});

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

  const categories = getCategoriesForType(type);
  const otherCategoryId = getOtherCategoryId(type);
  const savedCustomForType = useMemo(
    () => customCategories.filter((c) => c.type === type),
    [customCategories, type]
  );
  const isOtherBaseSelected = category === otherCategoryId && !selectedCustomName;

  const availableBalance = useMemo(
    () =>
      calculateAvailableTransferBalance(
        transactions,
        openingBalanceUSD,
        currency,
        editingTransaction
      ),
    [transactions, openingBalanceUSD, currency, editingTransaction]
  );

  const handleTypeSwitch = (nextType: TransactionType) => {
    setType(nextType);
    const validList = getCategoriesForType(nextType);
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
    if (!created) return;
    setCategory(otherCategoryId);
    setSelectedCustomName(created.name);
    setCustomCategoryDraft('');
    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  const handleRemoveCustomCategory = (customCat: CustomCategory) => {
    removeCustomCategory(customCat.id);
    if (selectedCustomName.toLowerCase() === customCat.name.toLowerCase()) {
      setSelectedCustomName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTransactionInput({
      type,
      amountRaw: amount,
      currency,
      category,
      date,
      availableTransferBalance: availableBalance,
      lang,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    let resolvedCustomCategory: string | undefined = selectedCustomName.trim() || undefined;
    if (isOtherBaseSelected && customCategoryDraft.trim()) {
      const created = addCustomCategory(customCategoryDraft.trim(), type);
      if (created) {
        resolvedCustomCategory = created.name;
      }
    }

    const payload = {
      type,
      amount: validation.cleanAmount,
      currency,
      category: validation.category,
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
        <TransactionTypeSwitch value={type} lang={lang} onChange={handleTypeSwitch} />

        <AmountCurrencyField
          type={type}
          amount={amount}
          currency={currency}
          availableBalance={availableBalance}
          error={errors.amount}
          lang={lang}
          onAmountChange={(value) => {
            setAmount(value);
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
          }}
          onCurrencyChange={setCurrency}
        />

        <CategorySelectorGrid
          categories={categories}
          otherCategoryId={otherCategoryId}
          selectedCategory={category}
          savedCustomCategories={savedCustomForType}
          selectedCustomName={selectedCustomName}
          customCategoryDraft={customCategoryDraft}
          isOtherBaseSelected={isOtherBaseSelected}
          error={errors.category}
          lang={lang}
          onSelectBuiltIn={(catId) => {
            setCategory(catId);
            setSelectedCustomName('');
            if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
          }}
          onSelectCustom={(customName) => {
            setCategory(otherCategoryId);
            setSelectedCustomName(customName);
            if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
          }}
          onRemoveCustom={handleRemoveCustomCategory}
          onCustomDraftChange={setCustomCategoryDraft}
          onAddCustomCategory={handleAddCustomCategory}
        />

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
