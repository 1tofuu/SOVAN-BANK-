import type { Budget, Transaction } from '../types';
import { shiftMonth, toISODateString } from '../utils/date';

function daysAgo(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(base.getDate() - days);
  return toISODateString(d);
}

function monthDay(year: number, month: number, day: number): string {
  const safeDay = Math.min(day, new Date(year, month, 0).getDate());
  return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

export function createInitialMockTransactions(anchorDate = new Date()): Transaction[] {
  const y = anchorDate.getFullYear();
  const m = anchorDate.getMonth() + 1;
  const nowIso = anchorDate.toISOString();

  const m1 = shiftMonth(y, m, -1);
  const m2 = shiftMonth(y, m, -2);
  const m3 = shiftMonth(y, m, -3);
  const m4 = shiftMonth(y, m, -4);
  const m5 = shiftMonth(y, m, -5);

  const items: Transaction[] = [
    // Current month realistic Cambodian transactions (USD + KHR)
    {
      id: 'tx-001',
      type: 'income',
      amount: 1450.0,
      currency: 'USD',
      category: 'salary',
      description: 'Monthly Product Engineering Salary',
      date: monthDay(y, m, 1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-002',
      type: 'expense',
      amount: 320.0,
      currency: 'USD',
      category: 'bills_utilities',
      description: 'BKK1 Apartment Rent & EDC Electricity',
      date: monthDay(y, m, 2),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-003',
      type: 'expense',
      amount: 18500,
      currency: 'KHR',
      category: 'food_drinks',
      description: 'Brown Coffee Roastery — Iced Latte & Croissant',
      date: daysAgo(anchorDate, 0),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-004',
      type: 'expense',
      amount: 12000,
      currency: 'KHR',
      category: 'transportation',
      description: 'PassApp TukTuk to Riverside',
      date: daysAgo(anchorDate, 0),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-005',
      type: 'income',
      amount: 280.0,
      currency: 'USD',
      category: 'freelance',
      description: 'UI Design Consultation — Phnom Penh Studio',
      date: daysAgo(anchorDate, 1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-006',
      type: 'expense',
      amount: 42.5,
      currency: 'USD',
      category: 'shopping',
      description: 'AEON Mall Supermarket Groceries',
      date: daysAgo(anchorDate, 1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-007',
      type: 'expense',
      amount: 24000,
      currency: 'KHR',
      category: 'food_drinks',
      description: 'Khmer Family Dinner — Num Banh Chok & Amok',
      date: daysAgo(anchorDate, 2),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-008',
      type: 'expense',
      amount: 35.0,
      currency: 'USD',
      category: 'education',
      description: 'Khmer Typography & FinTech Course Books',
      date: daysAgo(anchorDate, 3),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-009',
      type: 'expense',
      amount: 18.0,
      currency: 'USD',
      category: 'health',
      description: 'Gym Membership & Wellness Checkup',
      date: daysAgo(anchorDate, 4),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-010',
      type: 'expense',
      amount: 15.0,
      currency: 'USD',
      category: 'entertainment',
      description: 'Legend Cinema IMAX Tickets',
      date: daysAgo(anchorDate, 5),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-011',
      type: 'expense',
      amount: 64.0,
      currency: 'USD',
      category: 'travel',
      description: 'Kampot Weekend Bus & Guesthouse Deposit',
      date: daysAgo(anchorDate, 6),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-012',
      type: 'expense',
      amount: 22.0,
      currency: 'USD',
      category: 'personal_care',
      description: 'Barbershop & Skincare Essentials',
      date: monthDay(y, m, 5),
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // Previous month (m1)
    {
      id: 'tx-101',
      type: 'income',
      amount: 1450.0,
      currency: 'USD',
      category: 'salary',
      description: 'Monthly Product Engineering Salary',
      date: monthDay(m1.year, m1.month, 1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-102',
      type: 'income',
      amount: 190.0,
      currency: 'USD',
      category: 'business',
      description: 'Digital Templates Store Payout',
      date: monthDay(m1.year, m1.month, 14),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-103',
      type: 'expense',
      amount: 315.0,
      currency: 'USD',
      category: 'bills_utilities',
      description: 'Apartment Rent & Utilities',
      date: monthDay(m1.year, m1.month, 2),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-104',
      type: 'expense',
      amount: 165.0,
      currency: 'USD',
      category: 'food_drinks',
      description: 'Monthly Groceries & Cafe Visits',
      date: monthDay(m1.year, m1.month, 12),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-105',
      type: 'expense',
      amount: 110.0,
      currency: 'USD',
      category: 'shopping',
      description: 'Work Apparel & Accessories',
      date: monthDay(m1.year, m1.month, 19),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-106',
      type: 'expense',
      amount: 55.0,
      currency: 'USD',
      category: 'transportation',
      description: 'Fuel & Grab Commutes',
      date: monthDay(m1.year, m1.month, 23),
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // 2 months ago (m2)
    {
      id: 'tx-201',
      type: 'income',
      amount: 1400.0,
      currency: 'USD',
      category: 'salary',
      description: 'Monthly Salary',
      date: monthDay(m2.year, m2.month, 1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-202',
      type: 'expense',
      amount: 310.0,
      currency: 'USD',
      category: 'bills_utilities',
      description: 'Rent & Internet',
      date: monthDay(m2.year, m2.month, 3),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-203',
      type: 'expense',
      amount: 240.0,
      currency: 'USD',
      category: 'food_drinks',
      description: 'Dining & Markets',
      date: monthDay(m2.year, m2.month, 15),
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // 3 months ago (m3)
    {
      id: 'tx-301',
      type: 'income',
      amount: 1520.0,
      currency: 'USD',
      category: 'salary',
      description: 'Monthly Salary & Bonus',
      date: monthDay(m3.year, m3.month, 1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-302',
      type: 'expense',
      amount: 690.0,
      currency: 'USD',
      category: 'travel',
      description: 'Siem Reap Angkor Heritage Trip',
      date: monthDay(m3.year, m3.month, 18),
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // 4 months ago (m4)
    {
      id: 'tx-401',
      type: 'income',
      amount: 1380.0,
      currency: 'USD',
      category: 'salary',
      description: 'Monthly Salary',
      date: monthDay(m4.year, m4.month, 1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-402',
      type: 'expense',
      amount: 540.0,
      currency: 'USD',
      category: 'bills_utilities',
      description: 'Living Expenses & Rent',
      date: monthDay(m4.year, m4.month, 10),
      createdAt: nowIso,
      updatedAt: nowIso,
    },

    // 5 months ago (m5)
    {
      id: 'tx-501',
      type: 'income',
      amount: 1350.0,
      currency: 'USD',
      category: 'salary',
      description: 'Monthly Salary',
      date: monthDay(m5.year, m5.month, 1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'tx-502',
      type: 'expense',
      amount: 610.0,
      currency: 'USD',
      category: 'shopping',
      description: 'Home Workstation Upgrade',
      date: monthDay(m5.year, m5.month, 16),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  // Deduplicate date anomalies if anchorDate is day 1-6 where daysAgo rolls into m1
  return items;
}

export function createInitialMockBudgets(anchorDate = new Date()): Budget[] {
  const y = anchorDate.getFullYear();
  const m = anchorDate.getMonth() + 1;
  const nowIso = anchorDate.toISOString();
  const prev = shiftMonth(y, m, -1);

  return [
    {
      id: `budget-${y}-${m}`,
      month: m,
      year: y,
      amount: 750,
      currency: 'USD',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: `budget-${prev.year}-${prev.month}`,
      month: prev.month,
      year: prev.year,
      amount: 750,
      currency: 'USD',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}
