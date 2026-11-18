import React, { useMemo } from 'react';
import { MAX_DONUT_CATEGORIES } from '../../constants/app';
import { getCategoryLabel } from '../../constants/categories';
import { t } from '../../i18n/translations';
import type { CategoryBreakdownItem, Currency, Language } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface CategoryDonutChartProps {
  items: CategoryBreakdownItem[];
  totalAmount: number;
  currency: Currency;
  lang: Language;
}

const DONUT_SIZE = 180;
const STROKE_WIDTH = 22;
const RADIUS = (DONUT_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = React.memo(
  ({ items, totalAmount, currency, lang }) => {
    const segments = useMemo(() => {
      let accumulatedOffset = 0;
      return items.map((item) => {
        const segmentLen =
          totalAmount > 0 ? (item.amount / totalAmount) * CIRCUMFERENCE : 0;
        const dashArray = `${Math.max(0, segmentLen - 2)} ${CIRCUMFERENCE}`;
        const dashOffset = -accumulatedOffset;
        accumulatedOffset += segmentLen;
        return {
          key: item.key,
          color: item.color,
          dashArray,
          dashOffset,
        };
      });
    }, [items, totalAmount]);

    const visibleLegendItems = useMemo(
      () => items.slice(0, MAX_DONUT_CATEGORIES),
      [items]
    );

    return (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div
          className="relative shrink-0"
          style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
        >
          <svg
            width={DONUT_SIZE}
            height={DONUT_SIZE}
            viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
            className="-rotate-90"
          >
            <circle
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              className="text-[#0E5A3E]/8 dark:text-white/8"
            />
            {segments.map((segment) => (
              <circle
                key={segment.key}
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={segment.dashArray}
                strokeDashoffset={segment.dashOffset}
                strokeLinecap="butt"
              />
            ))}
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
          {visibleLegendItems.map((item) => {
            const label = getCategoryLabel(item.category, lang, item.customLabel);
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
  }
);

CategoryDonutChart.displayName = 'CategoryDonutChart';
