import React from 'react';
import { CATEGORY_META } from '../../constants/categories';
import { t } from '../../i18n/translations';
import type { Currency, Language } from '../../types/finance';
import type { CategoryBreakdownItem } from '../../utils/finance';
import { formatCurrency } from '../../utils/finance';

interface CategoryDonutChartProps {
  items: CategoryBreakdownItem[];
  totalAmount: number;
  currency: Currency;
  lang: Language;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  items,
  totalAmount,
  currency,
  lang,
}) => {
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#0E5A3E]/8 dark:text-white/8"
          />
          {items.map((item) => {
            const segmentLen =
              totalAmount > 0 ? (item.amount / totalAmount) * circumference : 0;
            const dashArray = `${Math.max(0, segmentLen - 2)} ${circumference}`;
            const dashOffset = -accumulatedOffset;
            accumulatedOffset += segmentLen;

            return (
              <circle
                key={item.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[11px] text-[#5B7268] dark:text-[#96ACA1]">
            {t(lang, 'total_expenses')}
          </span>
          <span className="text-base font-bold tabular-nums font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] mt-0.5 truncate max-w-full">
            {formatCurrency(totalAmount, currency, { compact: currency === 'KHR' })}
          </span>
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="flex-1 w-full space-y-2.5">
        {items.slice(0, 5).map((item) => {
          const label =
            item.customLabel || t(lang, CATEGORY_META[item.category]?.labelKey ?? 'cat_other');
          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-[#0F1F18] dark:text-[#F1F5F2] truncate">
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 tabular-nums font-mono-num">
                  <span className="text-[#5B7268] dark:text-[#96ACA1]">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="font-semibold text-[#0F1F18] dark:text-[#F1F5F2]">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[#0E5A3E]/8 dark:bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, item.percentage)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
