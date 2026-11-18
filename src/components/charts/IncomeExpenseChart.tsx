import React, { useState } from 'react';
import { t } from '../../i18n/translations';
import type { Currency, Language } from '../../types/finance';
import type { ChartPoint } from '../../utils/finance';
import { formatCurrency } from '../../utils/finance';

interface IncomeExpenseChartProps {
  data: ChartPoint[];
  currency: Currency;
  lang: Language;
  height?: number;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  data,
  currency,
  lang,
  height = 220,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(d.income, d.expense))
  );

  const svgWidth = 560;
  const svgHeight = height;
  const padLeft = 56;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 32;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const groupWidth = data.length > 0 ? chartW / data.length : chartW;
  const barWidth = Math.min(20, Math.max(10, groupWidth * 0.28));
  const barGap = 4;

  const gridTicks = [0, 0.5, 1];
  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : null;

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
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[320px] select-none"
          role="img"
          aria-label={t(lang, 'income_vs_expense')}
        >
          {/* Horizontal grid lines */}
          {gridTicks.map((ratio) => {
            const y = padTop + chartH * (1 - ratio);
            const val = maxValue * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={ratio === 0 ? 0.16 : 0.08}
                  strokeDasharray={ratio === 0 ? undefined : '4 4'}
                  className="text-[#0F1F18] dark:text-white"
                />
                <text
                  x={padLeft - 8}
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
            const cx = padLeft + groupWidth * idx + groupWidth / 2;
            const incomeH = (point.income / maxValue) * chartH;
            const expenseH = (point.expense / maxValue) * chartH;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={point.label + idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(hoveredIdx === idx ? null : idx)}
                className="cursor-pointer"
              >
                {/* Hover highlight column */}
                <rect
                  x={padLeft + groupWidth * idx + 2}
                  y={padTop}
                  width={Math.max(0, groupWidth - 4)}
                  height={chartH}
                  rx={6}
                  fill="currentColor"
                  fillOpacity={isHovered ? 0.04 : 0}
                  className="text-[#0E5A3E] dark:text-[#C89B3C]"
                />

                {/* Income Bar */}
                <rect
                  x={cx - barWidth - barGap / 2}
                  y={padTop + chartH - Math.max(incomeH, point.income > 0 ? 3 : 0)}
                  width={barWidth}
                  height={Math.max(incomeH, point.income > 0 ? 3 : 0)}
                  rx={4}
                  className="fill-[#0E5A3E] dark:fill-[#2E9E72] transition-opacity"
                  opacity={hoveredIdx !== null && !isHovered ? 0.55 : 1}
                />

                {/* Expense Bar */}
                <rect
                  x={cx + barGap / 2}
                  y={padTop + chartH - Math.max(expenseH, point.expense > 0 ? 3 : 0)}
                  width={barWidth}
                  height={Math.max(expenseH, point.expense > 0 ? 3 : 0)}
                  rx={4}
                  className="fill-[#C89B3C] dark:fill-[#E0B857] transition-opacity"
                  opacity={hoveredIdx !== null && !isHovered ? 0.55 : 1}
                />

                {/* X-Axis Label */}
                <text
                  x={cx}
                  y={svgHeight - 8}
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
};
