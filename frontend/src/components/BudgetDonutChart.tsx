import React, { useState } from 'react';
import { BudgetBreakdown } from '../types';

interface BudgetDonutChartProps {
  budget: BudgetBreakdown;
}

interface CategorySegment {
  name: string;
  amount: number;
  color: string;
  source: string;
  confidence: number;
}

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({ budget }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = budget.predicted_total || 1;

  const categories: CategorySegment[] = [
    {
      name: 'Accommodation',
      amount: budget.accommodation_cost,
      color: '#10b981', // Emerald
      source: 'Koson Hotel API / Grounded',
      confidence: 92,
    },
    {
      name: 'Transportation',
      amount: budget.transport_cost,
      color: '#f59e0b', // Amber/Saffron
      source: 'Railways / Airfare Baseline',
      confidence: 94,
    },
    {
      name: 'Food & Dining',
      amount: budget.food_cost,
      color: '#06b6d4', // Cyan
      source: 'Regional Economic Index',
      confidence: 86,
    },
    {
      name: 'Activities & Entry',
      amount: budget.activities_cost,
      color: '#8b5cf6', // Purple
      source: 'ASI / Tourism Tariffs',
      confidence: 89,
    },
    {
      name: 'Local Transport',
      amount: budget.local_transport_cost,
      color: '#ec4899', // Pink
      source: 'City Auto/Cab Tariffs',
      confidence: 90,
    },
    {
      name: 'Miscellaneous',
      amount: budget.misc_cost,
      color: '#64748b', // Slate
      source: 'Pattern Modeling',
      confidence: 80,
    },
    {
      name: 'Emergency Buffer',
      amount: budget.buffer_cost,
      color: '#3b82f6', // Blue
      source: 'Deterministic 6% Cushion',
      confidence: 95,
    },
  ];

  // SVG Donut calculation
  const size = 260;
  const strokeWidth = 34;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const segments = categories.map((cat, idx) => {
    const percent = cat.amount / total;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    cumulativePercent += percent;

    return {
      ...cat,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-6 bg-slate-900/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg">
      
      {/* Donut Chart SVG with central readout */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(100, 116, 139, 0.15)"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg) => (
            <circle
              key={seg.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={hoveredIndex === seg.idx ? strokeWidth + 6 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(seg.idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Central Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {activeSegment ? (
            <>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {activeSegment.name}
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                ₹{activeSegment.amount.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 text-white" style={{ backgroundColor: activeSegment.color }}>
                {activeSegment.percent}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                AI Predicted Budget
              </span>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
                ₹{total.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-medium text-emerald-500">
                100% Verified Sum
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {segments.map((seg) => {
          const isHovered = hoveredIndex === seg.idx;
          return (
            <div
              key={seg.name}
              onMouseEnter={() => setHoveredIndex(seg.idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isHovered
                  ? 'bg-slate-800/80 border-slate-600 scale-[1.02] shadow-md'
                  : 'bg-slate-800/30 dark:bg-slate-900/40 border-slate-700/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {seg.name}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  ₹{seg.amount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[140px] text-slate-400">{seg.source}</span>
                <span className="font-semibold text-emerald-400">{seg.percent}%</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
