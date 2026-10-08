'use client';

import React from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { getSimulatedDateString, getMonthProgressTowardsNextMonth } from '@/lib/simulation-engine';
import {
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  Landmark,
  Timer,
} from 'lucide-react';

interface TimeSimulatorBarProps {
  onViewLogsClick: () => void;
}

export function TimeSimulatorBar({ onViewLogsClick }: TimeSimulatorBarProps) {
  const { portfolio, advanceMonth, resetSimulation } = usePortfolio();

  const currentDateLabel = portfolio
    ? getSimulatedDateString(portfolio.simulationStartDate, portfolio.simulatedMonth)
    : 'Oct 2026';

  const pacing = getMonthProgressTowardsNextMonth(portfolio?.lastSettledTimestamp);

  const recentLogs = portfolio?.simulationLogs.slice(0, 3) || [];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Time & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">{currentDateLabel}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">
              {portfolio?.simulatedMonth === 0
                ? 'Baseline'
                : `+${portfolio?.simulatedMonth} mo${(portfolio?.simulatedMonth || 0) > 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Quick Micro-Ticker of latest action */}
          {recentLogs.length > 0 && (
            <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 max-w-md truncate">
              {recentLogs[0].direction === 'inflow' || recentLogs[0].direction === 'valuation_up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : recentLogs[0].direction === 'outflow' ? (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="text-slate-300 font-medium truncate">{recentLogs[0].title}:</span>
              <span className="text-slate-400 truncate">{recentLogs[0].details}</span>
            </div>
          )}
        </div>

        {/* Right: Simulation Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* 72-Hour Real-World Pacing Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            title="1 in-app month completes after 72 continuous hours of real-world time"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>1 Mo = 72h Real World (Next: {pacing.formattedCountdown})</span>
          </div>

          {/* Step buttons */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => advanceMonth(1)}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded font-medium transition-colors cursor-pointer"
              title="Accrue 1 month of interest, growth, and deduct monthly EMIs"
            >
              +1 Mo
            </button>
            <button
              onClick={() => advanceMonth(3)}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded font-medium transition-colors cursor-pointer"
              title="Advance 1 Quarter"
            >
              +3 Mos
            </button>
            <button
              onClick={() => advanceMonth(12)}
              className="px-2.5 py-1 text-emerald-400 hover:text-white hover:bg-emerald-600 rounded font-semibold transition-colors cursor-pointer"
              title="Advance 1 Full Year (10% Annual Compounding)"
            >
              +1 Yr
            </button>
          </div>

          {/* View Event Logs button */}
          <button
            onClick={onViewLogsClick}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Ledger Logs</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400 font-mono">
              {portfolio?.simulationLogs.length || 0}
            </span>
          </button>

          {/* Reset button */}
          <button
            onClick={resetSimulation}
            title="Reset simulation timeline back to Day 1 baseline"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
