import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  PiggyBank,
  Plus,
  Trash2,
} from 'lucide-react';
import { CATEGORY_META } from '../constants/categories';
import { formatMonthYear, t } from '../i18n/translations';
import { useBudgetStore } from '../stores/budgetStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { Currency, Transaction } from '../types/finance';
import {
  calculateBudgetMetrics,
  formatCurrency,
  getCategoryBreakdown,
} from '../utils/finance';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { MonthSelector } from '../components/common/MonthSelector';

interface BudgetScreenProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  onChangeMonth: (month: number, year: number) => void;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  transactions,
  selectedMonth,
  selectedYear,
  onChangeMonth,
}) => {
  const lang = useSettingsStore((s) => s.language);
  const displayCurrency = useSettingsStore((s) => s.currency);

  const budgets = useBudgetStore((s) => s.budgets);
  const upsertBudget = useBudgetStore((s) => s.upsertBudget);
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);

  const currentBudget = budgets.find(
    (b) => b.month === selectedMonth && b.year === selectedYear
  );
  const metrics = calculateBudgetMetrics(
    currentBudget,
    transactions,
    selectedYear,
    selectedMonth,
    displayCurrency
  );
  const categoryItems = getCategoryBreakdown(
    transactions,
    selectedYear,
    selectedMonth,
    displayCurrency
  );

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [formCurrency, setFormCurrency] = useState<Currency>(displayCurrency);
  const [amountError, setAmountError] = useState('');

  const openBudgetForm = () => {
    setAmountError('');
    if (currentBudget) {
      setAmountInput(String(currentBudget.amount));
      setFormCurrency(currentBudget.currency);
    } else {
      setAmountInput('');
      setFormCurrency(displayCurrency);
    }
    setFormOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setAmountError(t(lang, 'err_amount_positive'));
      return;
    }
    const cleanAmount =
      formCurrency === 'KHR' ? Math.round(parsed) : Math.round(parsed * 100) / 100;
    upsertBudget(selectedMonth, selectedYear, cleanAmount, formCurrency);
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2]">
          {t(lang, 'budget_management')}
        </h1>
        <MonthSelector
          month={selectedMonth}
          year={selectedYear}
          lang={lang}
          onChange={onChangeMonth}
        />
      </div>

      {metrics.hasBudget && currentBudget ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Budget Overview Card */}
          <section className="lg:col-span-7 rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
                  {t(lang, 'monthly_budget')} · {formatMonthYear(selectedMonth, selectedYear, lang)}
                </p>
                <p className="text-3xl font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] mt-1">
                  {formatCurrency(metrics.limit, displayCurrency)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openBudgetForm}
                  className="min-h-[40px] px-3.5 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 text-xs font-semibold text-[#0E5A3E] dark:text-[#5AD3A3] hover:bg-[#0E5A3E]/6 dark:hover:bg-white/8 inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Pencil size={14} />
                  <span>{t(lang, 'edit_budget')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  aria-label={t(lang, 'delete_budget')}
                  className="min-h-[40px] min-w-[40px] px-2.5 rounded-xl bg-red-600/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-600/18 flex items-center justify-center"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="inline-flex items-center gap-1.5">
                  {metrics.status === 'exceeded' ? (
                    <AlertTriangle size={15} className="text-red-600 dark:text-red-400" />
                  ) : metrics.status === 'warning' ? (
                    <AlertTriangle size={15} className="text-[#C89B3C]" />
                  ) : (
                    <CheckCircle2 size={15} className="text-[#0E5A3E] dark:text-[#5AD3A3]" />
                  )}
                  <span
                    className={
                      metrics.status === 'exceeded'
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : metrics.status === 'warning'
                        ? 'text-[#9A7422] dark:text-[#E5C16C] font-semibold'
                        : 'text-[#0E5A3E] dark:text-[#5AD3A3] font-semibold'
                    }
                  >
                    {metrics.status === 'exceeded'
                      ? t(lang, 'status_exceeded')
                      : metrics.status === 'warning'
                      ? t(lang, 'status_warning')
                      : t(lang, 'status_healthy')}
                  </span>
                </span>
                <span className="tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] font-semibold">
                  {metrics.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="h-3.5 w-full rounded-full bg-[#0E5A3E]/10 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    metrics.status === 'exceeded'
                      ? 'bg-red-600'
                      : metrics.status === 'warning'
                      ? 'bg-[#C89B3C]'
                      : 'bg-[#0E5A3E] dark:bg-[#2E9E72]'
                  }`}
                  style={{ width: `${Math.min(100, metrics.percentage)}%` }}
                />
              </div>
            </div>

            {/* Spent vs Remaining */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#0E5A3E]/10 dark:border-white/10">
              <div>
                <p className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
                  {t(lang, 'total_spending')}
                </p>
                <p className="text-lg font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] mt-1">
                  {formatCurrency(metrics.spent, displayCurrency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
                  {metrics.remaining < 0
                    ? t(lang, 'over_budget_by')
                    : t(lang, 'left_to_spend')}
                </p>
                <p
                  className={`text-lg font-bold tabular-nums font-mono-num mt-1 ${
                    metrics.remaining < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-[#0E5A3E] dark:text-[#5AD3A3]'
                  }`}
                >
                  {formatCurrency(Math.abs(metrics.remaining), displayCurrency)}
                </p>
              </div>
            </div>

            {/* Warning Notice */}
            {(metrics.status === 'warning' || metrics.status === 'exceeded') && (
              <div
                className={`rounded-xl p-3.5 border flex items-start gap-3 text-xs leading-relaxed ${
                  metrics.status === 'exceeded'
                    ? 'bg-red-600/8 dark:bg-red-500/12 border-red-600/20 text-red-700 dark:text-red-300'
                    : 'bg-[#C89B3C]/12 border-[#C89B3C]/30 text-[#846218] dark:text-[#E5C16C]'
                }`}
              >
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>
                  {metrics.status === 'exceeded'
                    ? t(lang, 'warning_exceeded')
                    : t(lang, 'warning_approaching')}
                </span>
              </div>
            )}
          </section>

          {/* Category Spending Breakdown Against Month */}
          <section className="lg:col-span-5 rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
              {t(lang, 'category_spending_this_month')}
            </h2>

            {categoryItems.length > 0 ? (
              <div className="space-y-3.5">
                {categoryItems.map((item) => {
                  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.other_expense;
                  const shareOfBudget =
                    metrics.limit > 0
                      ? Math.round((item.amount / metrics.limit) * 1000) / 10
                      : 0;
                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.textLight} ${meta.textDark}`}
                          >
                            <CategoryIcon category={item.category} size={14} />
                          </span>
                          <span className="font-medium text-[#0F1F18] dark:text-[#F1F5F2] truncate">
                            {item.customLabel || t(lang, meta.labelKey)}
                          </span>
                        </div>
                        <span className="font-semibold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] shrink-0">
                          {formatCurrency(item.amount, displayCurrency)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#0E5A3E]/8 dark:bg-white/8 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, shareOfBudget)}%`,
                            backgroundColor: meta.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#5B7268] dark:text-[#96ACA1]">
                {t(lang, 'no_expense_data')}
              </p>
            )}
          </section>
        </div>
      ) : (
        <EmptyState
          icon={<PiggyBank size={24} />}
          title={t(lang, 'no_budget_title')}
          description={t(lang, 'no_budget_desc')}
          action={
            <button
              type="button"
              onClick={openBudgetForm}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0E5A3E] hover:bg-[#0B4932] text-white text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={17} />
              <span>{t(lang, 'create_budget')}</span>
            </button>
          }
        />
      )}

      {/* Create / Edit Budget Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={currentBudget ? t(lang, 'edit_budget') : t(lang, 'create_budget')}
        maxWidthClass="sm:max-w-md"
        onSubmit={handleSaveBudget}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
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
                {(['USD', 'KHR'] as Currency[]).map((cur) => (
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

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          if (currentBudget) deleteBudget(currentBudget.id);
        }}
        title={t(lang, 'confirm_delete_budget_title')}
        message={t(lang, 'confirm_delete_budget_msg')}
        confirmLabel={t(lang, 'delete')}
        cancelLabel={t(lang, 'cancel')}
        tone="danger"
      />
    </div>
  );
};
