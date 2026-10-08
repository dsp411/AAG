'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { JobPosition } from '@/types/finance';
import { formatCurrency, calculateJobHourlyRate, calculateJobDailyRate } from '@/lib/initial-data';
import {
  X,
  Clock,
  Briefcase,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

interface ShiftWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedJobId?: string;
}

export function ShiftWorkModal({ isOpen, onClose, preselectedJobId }: ShiftWorkModalProps) {
  const { portfolio, currentUser, doJobShift } = usePortfolio();
  const jobs = portfolio?.jobs || [];

  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    if (preselectedJobId && jobs.some(j => j.id === preselectedJobId)) return preselectedJobId;
    return jobs[0]?.id || '';
  });

  const [shiftType, setShiftType] = useState<'standard' | 'half' | 'day' | 'overtime' | 'custom'>('standard');
  const [customHours, setCustomHours] = useState('8');
  const [customDays, setCustomDays] = useState('1');
  const [shiftNote, setShiftNote] = useState('');
  const [result, setResult] = useState<{ amount: number; bankName: string } | null>(null);

  if (!isOpen || !portfolio) return null;

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const currency = currentUser?.currency || 'USD';

  if (!currentJob) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-[#181818] border border-[#282828] w-full max-w-md rounded-2xl p-6 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-[#b3b3b3] mx-auto" />
          <h3 className="text-lg font-bold text-white">No Jobs Configured</h3>
          <p className="text-xs text-[#b3b3b3]">
            Please add a job or career position first to start logging shifts and collecting wages.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculate instant wage preview
  let hoursToLog = 8;
  let daysToLog = 1;

  if (shiftType === 'standard') {
    hoursToLog = currentJob.hoursPerDay || 8;
    daysToLog = 1;
  } else if (shiftType === 'half') {
    hoursToLog = Math.max(1, Math.floor((currentJob.hoursPerDay || 8) / 2));
    daysToLog = 0.5;
  } else if (shiftType === 'overtime') {
    hoursToLog = (currentJob.hoursPerDay || 8) + 4;
    daysToLog = 1.5;
  } else if (shiftType === 'day') {
    hoursToLog = currentJob.hoursPerDay || 8;
    daysToLog = 1;
  } else {
    hoursToLog = parseFloat(customHours) || 8;
    daysToLog = parseFloat(customDays) || 1;
  }

  let calculatedWage = 0;
  if (currentJob.rateBasis === 'per_hour') {
    calculatedWage = currentJob.rateAmount * hoursToLog;
  } else if (currentJob.rateBasis === 'per_day') {
    calculatedWage = currentJob.rateAmount * daysToLog;
  } else {
    calculatedWage = Math.round((currentJob.rateAmount / 22) * daysToLog);
  }

  const targetBank =
    portfolio.bankAccounts.find(b => b.id === currentJob.destinationBankId) ||
    portfolio.bankAccounts[0];

  const handleExecuteShift = (e: React.FormEvent) => {
    e.preventDefault();
    const res = doJobShift(currentJob.id, hoursToLog, daysToLog, shiftNote.trim() || undefined);
    if (res.success) {
      setResult({
        amount: res.earnedAmount,
        bankName: targetBank?.bankName || 'Primary Vault',
      });
      setTimeout(() => {
        setResult(null);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#181818] border border-[#2e2e2e] w-full max-w-lg rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#282828] bg-gradient-to-r from-emerald-950/40 via-[#181818] to-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black font-bold flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 fill-current stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Clock In & Work Shift</span>
                <span className="text-[10px] bg-[#1ed760]/20 text-[#1ed760] font-mono px-2 py-0.5 rounded-full font-bold">
                  Instant Wage
                </span>
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Perform work and instantly credit defined salary to your bank account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 text-[#1ed760] flex items-center justify-center mx-auto animate-bounce shadow-lg">
              <DollarSign className="w-9 h-9 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold text-white">Wage Credited Successfully!</h3>
            <p className="text-2xl font-bold font-mono text-[#1ed760]">
              +{formatCurrency(result.amount, currency)}
            </p>
            <p className="text-xs text-[#b3b3b3]">
              Deposited to <span className="text-white font-semibold">{result.bankName}</span> and recorded on your ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleExecuteShift} className="p-6 space-y-5">
            {/* 1. Job Selector */}
            {jobs.length > 1 && (
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                  Select Active Position
                </label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full p-2.5 bg-[#121212] text-white text-xs rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} · {j.company} ({formatCurrency(j.rateAmount, currency)}
                      {j.rateBasis === 'per_hour' ? '/hr' : j.rateBasis === 'per_day' ? '/day' : '/mo'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Selected Job Badge */}
            <div className="p-3.5 bg-[#121212] rounded-xl border border-[#282828] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{currentJob.title}</h4>
                <p className="text-xs text-[#b3b3b3]">{currentJob.company} · {currentJob.category}</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-[#888] uppercase block">Defined Rate</span>
                <span className="text-sm font-bold text-[#1ed760]">
                  {formatCurrency(currentJob.rateAmount, currency)}
                  {currentJob.rateBasis === 'per_hour' ? '/hr' : currentJob.rateBasis === 'per_day' ? '/day' : '/mo'}
                </span>
              </div>
            </div>

            {/* 2. Shift Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Choose Shift Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setShiftType('standard')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    shiftType === 'standard'
                      ? 'bg-[#1ed760]/20 border-[#1ed760] text-white'
                      : 'bg-[#141414] border-[#282828] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">Standard Shift</span>
                  <span className="text-[10px] text-[#888] font-mono">{currentJob.hoursPerDay || 8} Hours (1 Day)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShiftType('half')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    shiftType === 'half'
                      ? 'bg-[#1ed760]/20 border-[#1ed760] text-white'
                      : 'bg-[#141414] border-[#282828] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">Half Shift</span>
                  <span className="text-[10px] text-[#888] font-mono">
                    {Math.max(1, Math.floor((currentJob.hoursPerDay || 8) / 2))} Hours
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShiftType('overtime')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    shiftType === 'overtime'
                      ? 'bg-[#1ed760]/20 border-[#1ed760] text-white'
                      : 'bg-[#141414] border-[#282828] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">Overtime Shift</span>
                  <span className="text-[10px] text-[#888] font-mono">
                    {(currentJob.hoursPerDay || 8) + 4} Hours
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShiftType('custom')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    shiftType === 'custom'
                      ? 'bg-[#1ed760]/20 border-[#1ed760] text-white'
                      : 'bg-[#141414] border-[#282828] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">Custom</span>
                  <span className="text-[10px] text-[#888]">Set Hours</span>
                </button>
              </div>
            </div>

            {/* Custom Inputs if selected */}
            {shiftType === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#121212] rounded-lg border border-[#282828]">
                <div>
                  <label className="text-[11px] text-[#b3b3b3] block mb-1">Hours to Work:</label>
                  <input
                    type="number"
                    min="0.5"
                    max="48"
                    step="0.5"
                    value={customHours}
                    onChange={e => setCustomHours(e.target.value)}
                    className="w-full p-2 bg-[#181818] text-white font-mono text-xs rounded border border-[#333] focus:border-[#1ed760] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#b3b3b3] block mb-1">Days Count:</label>
                  <input
                    type="number"
                    min="0.1"
                    max="14"
                    step="0.1"
                    value={customDays}
                    onChange={e => setCustomDays(e.target.value)}
                    className="w-full p-2 bg-[#181818] text-white font-mono text-xs rounded border border-[#333] focus:border-[#1ed760] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider block mb-1.5">
                Shift Log Note (Optional)
              </label>
              <input
                type="text"
                value={shiftNote}
                onChange={e => setShiftNote(e.target.value)}
                placeholder="e.g. Completed architecture sprint, weekend on-call coverage..."
                className="w-full p-2.5 bg-[#121212] text-white text-xs rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>

            {/* Payout Calculation Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/50 to-[#121212] rounded-xl border border-[#1ed760]/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider block">
                  Earned Wage Payout
                </span>
                <span className="text-xs text-[#888]">
                  Crediting to {targetBank?.bankName || 'Vault'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-[#1ed760] tabular-nums">
                  +{formatCurrency(calculatedWage, currency)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-[#4d4d4d] text-white text-xs font-bold uppercase tracking-wider hover:border-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-2 font-mono"
              >
                <Zap className="w-4 h-4 fill-current stroke-[2]" />
                <span>Clock In & Collect {formatCurrency(calculatedWage, currency)}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
