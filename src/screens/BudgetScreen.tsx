import React, { useState } from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import { BudgetCategoryList } from '../components/budget/BudgetCategoryList';
import { BudgetFormModal } from '../components/budget/BudgetFormModal';
import { BudgetOverviewCard } from '../components/budget/BudgetOverviewCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { MonthSelector } from '../components/common/MonthSelector';
import { useMonthlyBudget } from '../hooks/useBudget';
import { useCategoryBreakdown } from '../hooks/useTransactions';
import { t } from '../i18n/translations';
import { useBudgetStore } from '../stores/budgetStore';
import { useSettingsStore } from '../stores/settingsStore';

interface BudgetScreenProps {
  selectedMonth: number;
  selectedYear: number;
  onChangeMonth: (month: number, year: number) => void;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  selectedMonth,
  selectedYear,
  onChangeMonth,
}) => {
  const lang = useSettingsStore((s) => s.language);
  const displayCurrency = useSettingsStore((s) => s.currency);
  const upsertBudget = useBudgetStore((s) => s.upsertBudget);
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);

  const { budget: currentBudget, metrics } = useMonthlyBudget(selectedYear, selectedMonth);
  const categoryItems = useCategoryBreakdown(selectedYear, selectedMonth);

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
          <BudgetOverviewCard
            metrics={metrics}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            displayCurrency={displayCurrency}
            lang={lang}
            onEdit={() => setFormOpen(true)}
            onRequestDelete={() => setConfirmDeleteOpen(true)}
          />

          <BudgetCategoryList
            items={categoryItems}
            budgetLimit={metrics.limit}
            displayCurrency={displayCurrency}
            lang={lang}
          />
        </div>
      ) : (
        <EmptyState
          icon={<PiggyBank size={24} />}
          title={t(lang, 'no_budget_title')}
          description={t(lang, 'no_budget_desc')}
          action={
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0E5A3E] hover:bg-[#0B4932] text-white text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={17} />
              <span>{t(lang, 'create_budget')}</span>
            </button>
          }
        />
      )}

      <BudgetFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        existingBudget={currentBudget}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        defaultCurrency={displayCurrency}
        lang={lang}
        onSave={(amount, currency) =>
          upsertBudget(selectedMonth, selectedYear, amount, currency)
        }
      />

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
