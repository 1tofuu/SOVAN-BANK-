import React, { useMemo, useState } from 'react';
import { t } from '../../i18n/translations';
import type { ChartPoint, Currency, Language } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface IncomeExpenseChartProps {
  data: ChartPoint[];
  currency: Currency;
  lang: Language;
  height?: number;
}

const SVG_WIDTH = 560;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;
const BAR_GAP = 4;
const GRID_TICKS = [0, 0.5, 1] as const;

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = React.memo(
  ({ data, currency, lang, height = 220 }) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const maxValue = useMemo(
      () => Math.max(1, ...data.map((d) => Math.max(d.income, d.expense))),
      [data]
    );

    const chartW = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
    const chartH = height - PAD_TOP - PAD_BOTTOM;
    const groupWidth = data.length > 0 ? chartW / data.length : chartW;
    const barWidth = Math.min(20, Math.max(10, groupWidth * 0.28));

    const activePoint = hoveredIdx !== null ? data[hoveredIdx] ?? null : null;

    return (
      <div className="space-y-3">
        {/* Legend + Active Point Readout */}
        <div className="flex flex-wrap items-center justify-between gap-2 min-h-[24px]">
          <div className="flex items-center gap-4 text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0E5A3E] dark:bg-[#2E9E72]" />
              <span>{t(lang, 'income')}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#C89B3C] dark:bg-[#E0B857]" />
              <span>{t(lang, 'expense')}</span>
            </span>
          </div>

          {activePoint && (
            <div className="text-xs font-mono-num tabular-nums text-[#0F1F18] dark:text-[#F1F5F2] flex items-center gap-2">
              <span className="font-semibold">{activePoint.label}:</span>
              <span className="text-[#0E5A3E] dark:text-[#5AD3A3]">
                +{formatCurrency(activePoint.income, currency, { compact: true })}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#9A7422] dark:text-[#E5C16C]">
                -{formatCurrency(activePoint.expense, currency, { compact: true })}
              </span>
            </div>
          )}
        </div>

        {/* Responsive SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${height}`}
            className="w-full h-auto min-w-[320px] select-none"
            role="img"
            aria-label={t(lang, 'income_vs_expense')}
          >
            {/* Horizontal grid lines */}
            {GRID_TICKS.map((ratio) => {
              const y = PAD_TOP + chartH * (1 - ratio);
              const val = maxValue * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={PAD_LEFT}
                    y1={y}
                    x2={SVG_WIDTH - PAD_RIGHT}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={ratio === 0 ? 0.16 : 0.08}
                    strokeDasharray={ratio === 0 ? undefined : '4 4'}
                    className="text-[#0F1F18] dark:text-white"
                  />
                  <text
                    x={PAD_LEFT - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-[#5B7268] dark:fill-[#96ACA1] text-[10px] font-mono-num"
                  >
                    {val === 0 ? '0' : formatCurrency(val, currency, { compact: true })}
                  </text>
                </g>
              );
            })}

            {/* Grouped Bars */}
            {data.map((point, idx) => {
              const cx = PAD_LEFT + groupWidth * idx + groupWidth / 2;
              const incomeH = (point.income / maxValue) * chartH;
              const expenseH = (point.expense / maxValue) * chartH;
              const isHovered = hoveredIdx === idx;
              const renderedIncomeH = Math.max(incomeH, point.income > 0 ? 3 : 0);
              const renderedExpenseH = Math.max(expenseH, point.expense > 0 ? 3 : 0);

              return (
                <g
                  key={`${point.label}-${idx}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setHoveredIdx(hoveredIdx === idx ? null : idx)}
                  className="cursor-pointer"
                >
                  {/* Hover highlight column */}
                  <rect
                    x={PAD_LEFT + groupWidth * idx + 2}
                    y={PAD_TOP}
                    width={Math.max(0, groupWidth - 4)}
                    height={chartH}
                    rx={6}
                    fill="currentColor"
                    fillOpacity={isHovered ? 0.04 : 0}
                    className="text-[#0E5A3E] dark:text-[#C89B3C]"
                  />

                  {/* Income Bar */}
                  <rect
                    x={cx - barWidth - BAR_GAP / 2}
                    y={PAD_TOP + chartH - renderedIncomeH}
                    width={barWidth}
                    height={renderedIncomeH}
                    rx={4}
                    className="fill-[#0E5A3E] dark:fill-[#2E9E72] transition-opacity"
                    opacity={hoveredIdx !== null && !isHovered ? 0.55 : 1}
                  />

                  {/* Expense Bar */}
                  <rect
                    x={cx + BAR_GAP / 2}
                    y={PAD_TOP + chartH - renderedExpenseH}
                    width={barWidth}
                    height={renderedExpenseH}
                    rx={4}
                    className="fill-[#C89B3C] dark:fill-[#E0B857] transition-opacity"
                    opacity={hoveredIdx !== null && !isHovered ? 0.55 : 1}
                  />

                  {/* X-Axis Label */}
                  <text
                    x={cx}
                    y={height - 8}
                    textAnchor="middle"
                    className={`text-[11px] ${
                      isHovered
                        ? 'fill-[#0F1F18] dark:fill-white font-semibold'
                        : 'fill-[#5B7268] dark:fill-[#96ACA1]'
                    }`}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }
);

IncomeExpenseChart.displayName = 'IncomeExpenseChart';
