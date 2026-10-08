'use client';

import React from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { getSimulatedDateString, getMonthProgressTowardsNextMonth } from '@/lib/simulation-engine';
import { formatCurrency, calculateSummaryMetrics, getUserSimulatedAge } from '@/lib/initial-data';
import {
  RotateCcw,
  ListMusic,
  Calendar,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  ShieldCheck,
  Timer,
} from 'lucide-react';

interface SpotifyPlayerBarProps {
  onOpenLedger: () => void;
  onOpenPriceAdjuster?: () => void;
}

export function SpotifyPlayerBar({ onOpenLedger, onOpenPriceAdjuster }: SpotifyPlayerBarProps) {
  const { portfolio, advanceMonth, resetSimulation } = usePortfolio();

  const currency = portfolio?.user.currency || 'USD';
  const currentDate = portfolio
    ? getSimulatedDateString(portfolio.simulationStartDate, portfolio.simulatedMonth)
    : 'Oct 2026';

  const recentLog = portfolio?.simulationLogs?.[0];
  const metrics = portfolio ? calculateSummaryMetrics(portfolio) : null;
  const netCashflow = metrics?.netMonthlyCashflow ?? 0;
  const totalInflow = metrics?.totalMonthlyInflow ?? 0;
  const totalOutflow = metrics?.totalMonthlyOutflow ?? 0;

  const simulatedMonth = portfolio?.simulatedMonth || 0;
  const simulatedYear = Math.floor(simulatedMonth / 12) + 1;
  const monthInYear = (simulatedMonth % 12) + 1;

  const simulatedAge = getUserSimulatedAge(
    portfolio?.user?.startingAge || 28,
    simulatedMonth
  );

  const pacing = getMonthProgressTowardsNextMonth(portfolio?.lastSettledTimestamp);

  const initialNetWorth = portfolio?.historyPoints?.[0]?.netWorth || 1;
  const currentNetWorth =
    portfolio?.historyPoints?.[portfolio.historyPoints.length - 1]?.netWorth ??
    (metrics?.netWorth || 0);
  const netWorthDelta = currentNetWorth - initialNetWorth;
  const netWorthDeltaPercent = initialNetWorth > 0 ? (netWorthDelta / initialNetWorth) * 100 : 0;

  return (
    <footer className="h-[90px] sm:h-[96px] bg-[#181818] border-t border-[#282828] fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 select-none shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      {/* Zone 1 (Left): Simulating Horizon & Real-Time Date */}
      <div className="flex items-center gap-3 w-1/4 min-w-[160px] max-w-[300px]">
        {/* Date Cover Art Tile */}
        <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-[#1ed760] via-emerald-800 to-black flex items-center justify-center shrink-0 shadow-md border border-[#282828]">
          <Calendar className="w-6 h-6 text-black" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#1ed760] rounded-full" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-white text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
            <span>{currentDate}</span>
            <span className="text-[10px] text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/20 px-1.5 py-0.5 rounded-full font-mono shrink-0">
              Age {simulatedAge.label}
            </span>
          </div>
          <div className="text-[#b3b3b3] text-[11px] truncate mt-0.5 flex items-center gap-1.5">
            <span className="text-white/80 font-mono font-medium">Y{simulatedYear}·M{monthInYear}</span>
            <span>·</span>
            <span className="truncate">{recentLog ? recentLog.title : 'Live Banking Active'}</span>
          </div>
        </div>
      </div>

      {/* Zone 2 (Center): Realistic Banking Compounding Horizon & Cashflow Cockpit */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-1 sm:px-2">
        {/* Top Tier: Primary Timeline & Milestone Advance Controls */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          {/* Reset button */}
          <button
            onClick={resetSimulation}
            className="text-[#b3b3b3] hover:text-white p-1.5 rounded-full hover:bg-[#282828] transition-colors cursor-pointer"
            title="Reset simulation to Month 0 baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Always Active 72-Hour Real World Month Pacing Badge */}
          <div
            className="px-3 py-1 rounded-full bg-[#1ed760]/15 border border-[#1ed760]/30 text-[#1ed760] text-[11px] font-bold flex items-center gap-1.5 shadow-sm"
            title="1 in-app month completes after 72 continuous hours of real-world time"
          >
            <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse" />
            <span className="hidden sm:inline">1 Mo = 72h Real World (Next: {pacing.formattedCountdown})</span>
            <span className="sm:hidden">72h/Mo · {pacing.formattedCountdown}</span>
          </div>

          {/* Quick Horizon Milestone Jump Buttons */}
          <div className="flex items-center gap-1 bg-[#202020] p-1 rounded-full border border-[#2e2e2e]">
            <button
              onClick={() => advanceMonth(1)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-[#b3b3b3] hover:text-white hover:bg-[#2c2c2c] transition-colors cursor-pointer"
              title="Advance 1 month"
            >
              +1M
            </button>
            <button
              onClick={() => advanceMonth(3)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-[#b3b3b3] hover:text-white hover:bg-[#2c2c2c] transition-colors cursor-pointer"
              title="Advance 1 quarter (3 months)"
            >
              +3M
            </button>
            <button
              onClick={() => advanceMonth(6)}
              className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-bold text-[#b3b3b3] hover:text-white hover:bg-[#2c2c2c] transition-colors cursor-pointer"
              title="Advance 6 months"
            >
              +6M
            </button>
            <button
              onClick={() => advanceMonth(12)}
              className="px-3 py-1 rounded-full text-[11px] font-bold text-black bg-[#1ed760] hover:bg-[#3be477] transition-all cursor-pointer shadow-sm"
              title="Advance 1 full year (10% compound bank growth)"
            >
              +1 Year
            </button>
            <button
              onClick={() => advanceMonth(60)}
              className="hidden md:inline-block px-2.5 py-1 rounded-full text-[11px] font-bold text-[#1ed760] hover:text-[#1ed760] hover:bg-[#1ed760]/10 transition-colors cursor-pointer"
              title="Advance 5 years"
            >
              +5Y
            </button>
          </div>
        </div>

        {/* Bottom Tier: Live Cash Flow & Valuation Cockpit */}
        <div className="w-full flex items-center justify-between gap-2 text-xs bg-[#121212]/90 border border-[#282828] rounded-full px-3 py-1 shadow-inner">
          {/* Net Cash Flow Telemetry */}
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                netCashflow >= 0 ? 'bg-[#1ed760] animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-[#888] text-[11px] hidden sm:inline">Net Flow:</span>
            <span
              className={`font-mono font-bold text-xs ${
                netCashflow >= 0 ? 'text-[#1ed760]' : 'text-rose-400'
              }`}
            >
              {netCashflow >= 0 ? '+' : ''}
              {formatCurrency(netCashflow, currency)}/mo
            </span>
            <span className="text-[#666] text-[10px] hidden lg:inline">
              ({formatCurrency(totalInflow, currency, true)} in · {formatCurrency(totalOutflow, currency, true)} out)
            </span>
          </div>

          {/* Quick Price Adjuster Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenPriceAdjuster && (
              <button
                type="button"
                onClick={onOpenPriceAdjuster}
                className="px-2.5 py-0.5 rounded-full bg-[#1ed760]/10 hover:bg-[#1ed760]/20 text-[#1ed760] hover:text-white border border-[#1ed760]/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Open Quick Price & Valuation Adjuster"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#1ed760]" />
                <span>Adjust Prices</span>
              </button>
            )}

            {/* Total Duration Milestone Counter */}
            <span className="text-[11px] font-mono text-[#888] pl-1 border-l border-[#2e2e2e]">
              Month {simulatedMonth}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 3 (Right): Net Worth Volume & Ledger Action */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
        {/* Net Worth Ticker with Delta */}
        <div className="text-right">
          <div className="text-[10px] text-[#888] uppercase font-bold tracking-wider flex items-center justify-end gap-1">
            <span>Portfolio Net Worth</span>
            {netWorthDelta >= 0 ? (
              <ArrowUpRight className="w-3 h-3 text-[#1ed760]" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
            )}
          </div>
          <div className="text-sm sm:text-base font-bold font-mono text-white tabular-nums">
            {formatCurrency(currentNetWorth, currency)}
          </div>
          {simulatedMonth > 0 && (
            <div
              className={`text-[10px] font-mono ${
                netWorthDelta >= 0 ? 'text-[#1ed760]' : 'text-rose-400'
              }`}
            >
              {netWorthDelta >= 0 ? '+' : ''}
              {formatCurrency(netWorthDelta, currency, true)} ({netWorthDeltaPercent >= 0 ? '+' : ''}
              {netWorthDeltaPercent.toFixed(1)}%)
            </div>
          )}
        </div>

        {/* Quick Price Adjuster Icon Button */}
        {onOpenPriceAdjuster && (
          <button
            onClick={onOpenPriceAdjuster}
            className="text-[#b3b3b3] hover:text-[#1ed760] p-2 rounded-full hover:bg-[#282828] transition-colors cursor-pointer"
            title="Quick Price & Valuation Adjuster"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        )}

        {/* Ledger logs drawer button */}
        <button
          onClick={onOpenLedger}
          className="text-[#b3b3b3] hover:text-white p-2 rounded-full hover:bg-[#282828] transition-colors cursor-pointer"
          title="Open Transaction & Simulation Ledger"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
}
