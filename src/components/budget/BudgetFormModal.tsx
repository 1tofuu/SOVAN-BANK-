import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { formatMonthYear, t } from '../../i18n/translations';
import type { Budget, Currency, Language } from '../../types';
import { validatePositiveAmount } from '../../utils/validation';
import { Modal } from '../common/Modal';

const CURRENCY_OPTIONS: readonly Currency[] = ['USD', 'KHR'];

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBudget: Budget | undefined;
  selectedMonth: number;
  selectedYear: number;
  defaultCurrency: Currency;
  lang: Language;
  onSave: (amount: number, currency: Currency) => void;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  existingBudget,
  selectedMonth,
  selectedYear,
  defaultCurrency,
  lang,
  onSave,
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [formCurrency, setFormCurrency] = useState<Currency>(defaultCurrency);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setAmountError('');
    if (existingBudget) {
      setAmountInput(String(existingBudget.amount));
      setFormCurrency(existingBudget.currency);
    } else {
      setAmountInput('');
      setFormCurrency(defaultCurrency);
    }
  }, [isOpen, existingBudget, defaultCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePositiveAmount(amountInput, formCurrency, lang);
    if (!validation.valid) {
      setAmountError(validation.error);
      return;
    }
    onSave(validation.value, formCurrency);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingBudget ? t(lang, 'edit_budget') : t(lang, 'create_budget')}
      maxWidthClass="sm:max-w-md"
      onSubmit={handleSubmit}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/8 dark:hover:bg-white/10"
          >
            {t(lang, 'cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#0E5A3E] hover:bg-[#0B4932]"
          >
            {t(lang, 'save_budget')}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
          {formatMonthYear(selectedMonth, selectedYear, lang)}
        </p>

        <div>
          <label
            htmlFor="budget-amount"
            className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-1.5"
          >
            {t(lang, 'spending_limit')}
          </label>
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-[#4A6157] dark:text-[#A3B8AE] pointer-events-none">
                {formCurrency === 'USD' ? '$' : '៛'}
              </span>
              <input
                id="budget-amount"
                type="number"
                inputMode="decimal"
                step={formCurrency === 'USD' ? '1' : '1000'}
                min="0"
                placeholder={formCurrency === 'USD' ? '750.00' : '3000000'}
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  if (amountError) setAmountError('');
                }}
                className="w-full min-h-[48px] pl-9 pr-4 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 bg-[#FAFBF9] dark:bg-[#0B120E] text-lg font-semibold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#0E5A3E]/30"
              />
            </div>

            <div className="grid grid-cols-2 p-1 rounded-xl border border-[#0E5A3E]/14 dark:border-white/12 bg-[#FAFBF9] dark:bg-[#0B120E]">
              {CURRENCY_OPTIONS.map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setFormCurrency(cur)}
                  className={`px-3 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    formCurrency === cur
                      ? 'bg-[#C89B3C] text-white'
                      : 'text-[#4A6157] dark:text-[#A3B8AE]'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          {amountError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <AlertCircle size={14} />
              <span>{amountError}</span>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
