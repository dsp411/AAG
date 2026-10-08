'use client';

import React, { useState } from 'react';
import { NetWorthHistoryPoint, CurrencyCode } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';

interface NetWorthChartProps {
  historyPoints: NetWorthHistoryPoint[];
  currency: CurrencyCode;
}

export function NetWorthChart({ historyPoints, currency }: NetWorthChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!historyPoints || historyPoints.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#b3b3b3]">
        No simulation history points recorded yet.
      </div>
    );
  }

  // If only 1 point, synthesize baseline lead-in
  const points = historyPoints.length === 1
    ? [
        {
          ...historyPoints[0],
          monthIndex: -1,
          dateLabel: 'Start',
          netWorth: historyPoints[0].netWorth,
          totalAssets: historyPoints[0].totalAssets,
          totalLiabilities: historyPoints[0].totalLiabilities,
          liquidCash: historyPoints[0].liquidCash,
        },
        historyPoints[0],
      ]
    : historyPoints;

  const maxVal = Math.max(...points.map(p => Math.max(p.totalAssets, p.netWorth, 10000))) * 1.08;
  const minVal = Math.min(0, ...points.map(p => p.netWorth));
  const range = maxVal - minVal || 1;

  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  const getX = (index: number) => {
    if (points.length <= 1) return paddingX;
    return paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / range;
    return height - paddingY - norm * (height - paddingY * 2);
  };

  const netWorthPoints = points.map((p, idx) => `${getX(idx)},${getY(p.netWorth)}`);
  const assetsPoints = points.map((p, idx) => `${getX(idx)},${getY(p.totalAssets)}`);
  const liabilitiesPoints = points.map((p, idx) => `${getX(idx)},${getY(p.totalLiabilities)}`);

  const netWorthLinePath = `M ${netWorthPoints.join(' L ')}`;
  const assetsLinePath = `M ${assetsPoints.join(' L ')}`;
  const liabilitiesLinePath = `M ${liabilitiesPoints.join(' L ')}`;

  const areaPath = `M ${getX(0)},${height - paddingY} L ${netWorthPoints.join(' L ')} L ${getX(points.length - 1)},${height - paddingY} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <div className="w-full bg-[#181818] rounded-lg p-6 shadow-md border border-transparent hover:border-[#282828] transition-colors">
      {/* Header with active metric callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white tracking-tight">Net Worth Trajectory</h3>
            <span className="text-xs text-[#b3b3b3] font-mono">
              {activePoint.dateLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1ed760] tabular-nums">
              {formatCurrency(activePoint.netWorth, currency)}
            </span>
            <span className="text-xs text-[#b3b3b3]">
              (Assets: {formatCurrency(activePoint.totalAssets, currency, true)} · Debt: {formatCurrency(activePoint.totalLiabilities, currency, true)})
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1ed760] inline-block shadow-[0_0_6px_rgba(30,215,96,0.6)]"></span>
            <span className="text-white">Net Worth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-400 inline-block"></span>
            <span className="text-[#b3b3b3]">Assets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#f3727f] inline-block"></span>
            <span className="text-[#b3b3b3]">Debts</span>
          </div>
        </div>
      </div>

      {/* SVG Chart with Spotify Green Aesthetic */}
      <div className="relative w-full aspect-[8/2.7]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="spotifyGreenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1ed760" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#1ed760" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingY + pct * (height - paddingY * 2);
            const val = maxVal - pct * range;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#282828"
                  strokeDasharray="2 3"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-[#7c7c7c] font-mono"
                >
                  {formatCurrency(val, currency, true)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#spotifyGreenGrad)" />

          {/* Lines */}
          <path
            d={assetsLinePath}
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d={liabilitiesLinePath}
            fill="none"
            stroke="#f3727f"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d={netWorthLinePath}
            fill="none"
            stroke="#1ed760"
            strokeWidth="2.5"
          />

          {/* Interactive points */}
          {points.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.netWorth);
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx} className="cursor-pointer">
                <rect
                  x={x - 15}
                  y={0}
                  width={30}
                  height={height}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="#4d4d4d"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#1ed760"
                  stroke="#121212"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer labels */}
      <div className="flex justify-between items-center text-[11px] text-[#7c7c7c] font-mono pt-3 border-t border-[#282828]">
        <span>{points[0].dateLabel}</span>
        <span>Simulated Net Worth Progression</span>
        <span>{points[points.length - 1].dateLabel}</span>
      </div>
    </div>
  );
}
