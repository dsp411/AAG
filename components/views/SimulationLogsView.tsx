'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import { getSimulatedDateString, getMonthProgressTowardsNextMonth } from '@/lib/simulation-engine';
import {
  Clock,
  FastForward,
  RotateCcw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Timer,
} from 'lucide-react';

export function SimulationLogsView() {
  const { portfolio, advanceMonth, resetSimulation } = usePortfolio();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!portfolio) return null;

  const currency = portfolio.user.currency;
  const currentDate = getSimulatedDateString(
    portfolio.simulationStartDate,
    portfolio.simulatedMonth
  );

  const pacing = getMonthProgressTowardsNextMonth(portfolio.lastSettledTimestamp);

  const logs = portfolio.simulationLogs || [];

  const filteredLogs = logs.filter(log => {
    if (filterType === 'inflows') {
      if (log.direction !== 'inflow') return false;
    } else if (filterType === 'outflows') {
      if (log.direction !== 'outflow') return false;
    } else if (filterType === 'valuations') {
      if (log.direction !== 'valuation_up' && log.direction !== 'valuation_down') return false;
    } else if (filterType === 'alerts') {
      if (log.direction !== 'alert') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.bankAccountAffected && log.bankAccountAffected.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Spotify Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-[#1ed760]/30 via-[#181818] to-[#121212] p-6 rounded-lg">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-gradient-to-br from-[#1ed760] via-emerald-800 to-black shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0">
          <Clock className="w-20 h-20 text-black" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
            Virtual Time Ledger
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Accruals & History
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3]">
            <span className="text-white font-bold">{portfolio.user.fullName}</span>
            <span>·</span>
            <span>Current Date: <strong className="text-white font-mono">{currentDate}</strong></span>
            <span>·</span>
            <span className="font-mono text-[#1ed760] font-bold">
              {logs.length} transactions recorded
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/30 text-[#1ed760] font-mono text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-pulse" />
              1 Mo = 72h Real World (Next: {pacing.formattedCountdown})
            </span>
          </div>
        </div>
      </div>

      {/* Pill Actions */}
      <div className="flex items-center flex-wrap gap-3 px-2">
        <button
          onClick={() => advanceMonth(1)}
          className="px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
        >
          <FastForward className="w-4 h-4 fill-current" />
          <span>Advance +1 Month</span>
        </button>

        <button
          onClick={() => advanceMonth(3)}
          className="px-5 py-2.5 rounded-full bg-white hover:bg-[#eeeeee] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all"
        >
          +3 Months
        </button>

        <button
          onClick={() => advanceMonth(12)}
          className="px-5 py-2.5 rounded-full bg-transparent hover:bg-[#282828] text-white text-xs font-bold uppercase tracking-wider border border-[#4d4d4d] hover:border-white transition-all"
        >
          +1 Year
        </button>

        <button
          onClick={resetSimulation}
          className="px-5 py-2.5 rounded-full bg-transparent hover:bg-[#282828] text-[#ffa42b] text-xs font-bold uppercase tracking-wider border border-[#4d4d4d] hover:border-[#ffa42b] transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Month 0</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#b3b3b3]">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions or affected bank accounts..."
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] text-white placeholder-[#7c7c7c] text-xs pl-9 pr-4 py-2 rounded-full border border-transparent focus:border-white focus:outline-none transition-all [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'inflows', label: 'Inflows (+)' },
            { id: 'outflows', label: 'EMI & Bills (-)' },
            { id: 'valuations', label: 'Valuations' },
            { id: 'alerts', label: 'Alerts' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-white text-black'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spotify Tracklist Ledger Table */}
      <div className="bg-[#181818] rounded-lg p-5 space-y-2">
        <div className="border-b border-[#282828] pb-2 text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider grid grid-cols-12 px-3">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Title & Narrative</div>
          <div className="col-span-3 text-right">Account / Route</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#b3b3b3]">
            No simulation events match the current filter.
          </div>
        ) : (
          <div className="divide-y divide-[#282828]/40">
            {filteredLogs.map((log, index) => {
              const isInflow = log.direction === 'inflow' || log.direction === 'valuation_up';
              const isAlert = log.direction === 'alert';

              return (
                <div
                  key={log.id}
                  className="grid grid-cols-12 items-center px-3 py-3 rounded-md hover:bg-[#282828] transition-colors group text-xs"
                >
                  <div className="col-span-1 text-[#b3b3b3] font-mono group-hover:text-white">
                    {index + 1}
                  </div>
                  <div className="col-span-6 min-w-0 pr-3">
                    <div className="text-white font-bold truncate flex items-center gap-2">
                      <span>{log.title}</span>
                      <span className="text-[10px] text-[#b3b3b3] font-mono">
                        {log.simulatedDateString}
                      </span>
                    </div>
                    <p className="text-[#b3b3b3] text-[11px] truncate mt-0.5">
                      {log.details}
                    </p>
                  </div>
                  <div className="col-span-3 text-right text-[#b3b3b3] truncate font-mono text-[11px]">
                    {log.bankAccountAffected || 'Portfolio Engine'}
                  </div>
                  <div className="col-span-2 text-right font-mono font-bold">
                    <span
                      className={
                        isAlert
                          ? 'text-[#ffa42b]'
                          : isInflow
                          ? 'text-[#1ed760]'
                          : 'text-[#f3727f]'
                      }
                    >
                      {isInflow ? '+' : '-'}
                      {formatCurrency(log.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
