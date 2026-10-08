'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import {
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  CheckCircle2,
  Flame,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ClearEverythingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ClearMode = 'blank_slate' | 'reset_clean_starter' | 'reset_demo_portfolio' | 'reset_timeline';

export function ClearEverythingModal({ isOpen, onClose }: ClearEverythingModalProps) {
  const { portfolio, currentUser, clearEverything } = usePortfolio();
  const [selectedMode, setSelectedMode] = useState<ClearMode>('blank_slate');
  const [confirmText, setConfirmText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [doneMode, setDoneMode] = useState<ClearMode>('blank_slate');

  if (!isOpen || !portfolio) return null;

  const carsCount = portfolio.cars.length;
  const propertiesCount = portfolio.properties.length;
  const businessesCount = portfolio.businesses?.length || 0;
  const jobsCount = portfolio.jobs?.length || 0;
  const emisCount = portfolio.emis.length;
  const growthCount =
    portfolio.fixedDeposits.length +
    portfolio.stocks.length +
    portfolio.crypto.length +
    portfolio.forex.length;

  const handleExecuteClear = (modeToRun: ClearMode) => {
    clearEverything(modeToRun);
    setDoneMode(modeToRun);
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      setConfirmText('');
      onClose();
    }, 1300);
  };

  const clearOptions = [
    {
      id: 'blank_slate' as ClearMode,
      title: 'Wipe Everything to Blank Slate',
      badge: 'Zero ($0) Fresh Start',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      description:
        'Permanently delete all vehicles, properties, businesses, investments, active jobs, salaries, loans, and EMIs. Starts with $0 in an empty primary bank vault.',
      buttonText: 'Wipe Clean Slate ($0)',
      icon: Trash2,
      accentColor: 'rose',
    },
    {
      id: 'reset_clean_starter' as ClearMode,
      title: 'Start Everything from Beginning',
      badge: 'Fresh Start (+$10k)',
      badgeColor: 'bg-[#1ed760]/20 text-[#1ed760] border-[#1ed760]/30',
      description:
        'Reset ledger back to Day 1 baseline with $10,000 cash in checking, zero loans, zero debt, ready for you to build your empire step by step.',
      buttonText: 'Start Clean from Beginning',
      icon: Zap,
      accentColor: 'emerald',
    },
    {
      id: 'reset_demo_portfolio' as ClearMode,
      title: 'Reset to Full Demo Portfolio',
      badge: 'Month 0 Reset',
      badgeColor: 'bg-[#1ed760]/20 text-[#1ed760] border-[#1ed760]/30',
      description:
        'Restore the comprehensive sample portfolio (vehicles, properties, tech careers, stocks, and crypto) rewinded to Day 1.',
      buttonText: 'Restore Demo Portfolio',
      icon: Sparkles,
      accentColor: 'emerald',
    },
    {
      id: 'reset_timeline' as ClearMode,
      title: 'Rewind Timeline Back to Month 0',
      badge: 'Timeline Only',
      badgeColor: 'bg-[#282828] text-white border-[#3e3e3e]',
      description:
        'Keep all your existing custom assets, vehicles, and jobs intact, but rewind the simulation month counter and ledger back to Month 0 baseline.',
      buttonText: 'Rewind Simulation Timeline',
      icon: RotateCcw,
      accentColor: 'emerald',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#181818] border border-[#333333] w-full max-w-2xl rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.85)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#282828] bg-gradient-to-r from-red-950/40 via-[#181818] to-[#181818] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <Flame className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Clear & Start Everything from Beginning</span>
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Select whether to wipe to a $0 blank slate, start fresh from beginning, or rewind timeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDone ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-white">Reset Completed Successfully!</h3>
            <p className="text-sm text-[#b3b3b3] max-w-md mx-auto">
              {doneMode === 'blank_slate'
                ? 'Your portfolio has been wiped to a clean $0 zero-balance slate.'
                : doneMode === 'reset_clean_starter'
                ? 'Your portfolio has been restarted fresh from the beginning with $10,000 cash.'
                : doneMode === 'reset_demo_portfolio'
                ? 'The full demo portfolio has been restored and rewound to Month 0.'
                : 'The simulation timeline has been rewound to Month 0 baseline.'}
            </p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Current Holdings Summary */}
            <div className="p-3.5 bg-[#121212] rounded-xl border border-[#282828] text-xs space-y-2">
              <div className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider flex items-center justify-between">
                <span>Current Ledger Records for:</span>
                <span className="text-[#1ed760] font-mono font-bold">@{currentUser?.username}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="bg-[#242424] px-2 py-1 rounded text-white">{carsCount} Vehicles</span>
                <span className="bg-[#242424] px-2 py-1 rounded text-white">{propertiesCount} Real Estate</span>
                <span className="bg-[#242424] px-2 py-1 rounded text-white">{businessesCount} Businesses</span>
                <span className="bg-[#242424] px-2 py-1 rounded text-white">{jobsCount} Defined Jobs</span>
                <span className="bg-[#242424] px-2 py-1 rounded text-white">{growthCount} Investments</span>
                <span className="bg-[#242424] px-2 py-1 rounded text-[#f3727f]">{emisCount} Loans/EMIs</span>
              </div>
            </div>

            {/* Mode Picker Options List */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Choose How You Want to Reset:
              </label>

              {clearOptions.map(opt => {
                const isSelected = selectedMode === opt.id;
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedMode(opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? opt.id === 'blank_slate'
                          ? 'bg-rose-950/25 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                          : 'bg-[#1ed760]/10 border-[#1ed760] shadow-[0_0_15px_rgba(30,215,96,0.15)]'
                        : 'bg-[#141414] border-[#282828] hover:border-[#3e3e3e]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? opt.id === 'blank_slate'
                            ? 'border-rose-500 bg-rose-500 text-black'
                            : 'border-[#1ed760] bg-[#1ed760] text-black'
                          : 'border-[#4d4d4d]'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{opt.title}</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${opt.badgeColor}`}>
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#b3b3b3] mt-1 leading-relaxed">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Confirmation */}
            <div className="pt-3 border-t border-[#282828] flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-[#4d4d4d] text-white text-xs font-bold uppercase tracking-wider hover:border-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleExecuteClear(selectedMode)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                  selectedMode === 'blank_slate'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-[#1ed760] hover:bg-[#3be477] text-black shadow-[#1ed760]/30 font-extrabold'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {clearOptions.find(o => o.id === selectedMode)?.buttonText || 'Execute Reset'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
