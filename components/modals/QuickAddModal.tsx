'use client';

import React from 'react';
import {
  X,
  Car,
  Landmark,
  Building,
  TrendingUp,
  Coins,
  DollarSign,
  Briefcase,
  CreditCard,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'job' | 'car' | 'bank' | 'property' | 'business' | 'fd' | 'stock' | 'crypto' | 'forex' | 'income' | 'emi' | 'expense') => void;
}

export function QuickAddModal({ isOpen, onClose, onSelect }: QuickAddModalProps) {
  if (!isOpen) return null;

  const options = [
    {
      type: 'job' as const,
      title: 'Job / Defined Wage Position',
      desc: 'Hourly wage ($/hr) or daily rate ($/day) with instant shift work and bank deposit',
      icon: Briefcase,
      gradient: 'from-emerald-500 to-teal-950',
      tag: 'Career & Wage',
    },
    {
      type: 'business' as const,
      title: 'Business & Branches',
      desc: 'Company valuation, ownership %, operating branches & monthly dividends',
      icon: Briefcase,
      gradient: 'from-teal-600 to-zinc-900',
      tag: 'Enterprise',
    },
    {
      type: 'car' as const,
      title: 'Vehicle / Car',
      desc: 'Valuation, make, model, annual depreciation rate & insurance',
      icon: Car,
      gradient: 'from-emerald-700 to-zinc-900',
      tag: 'Asset',
    },
    {
      type: 'bank' as const,
      title: 'Bank Vault / Account',
      desc: 'Checking, savings, or APY high-yield cash account',
      icon: Landmark,
      gradient: 'from-emerald-600 to-slate-900',
      tag: 'Liquid Cash',
    },
    {
      type: 'property' as const,
      title: 'Real Estate Property',
      desc: 'Residential or commercial real estate, rental yield & appreciation',
      icon: Building,
      gradient: 'from-emerald-500 to-teal-950',
      tag: 'Real Estate',
    },
    {
      type: 'fd' as const,
      title: 'Fixed Deposit (FD)',
      desc: 'Compounding APY interest, maturity tenure, guaranteed returns',
      icon: TrendingUp,
      gradient: 'from-slate-700 to-zinc-950',
      tag: 'Compounding',
    },
    {
      type: 'stock' as const,
      title: 'Stocks & Equities',
      desc: 'Shares, stock ticker, market growth rate & dividend yield',
      icon: Coins,
      gradient: 'from-teal-500 to-emerald-950',
      tag: 'Equity',
    },
    {
      type: 'crypto' as const,
      title: 'Crypto & Staking',
      desc: 'Coin holdings, crypto appreciation & staking yield rate',
      icon: Coins,
      gradient: 'from-emerald-800 to-zinc-950',
      tag: 'Digital Asset',
    },
    {
      type: 'forex' as const,
      title: 'Foreign Currency (Forex)',
      desc: 'Holdings in EUR, GBP, JPY, CAD with live exchange rates',
      icon: DollarSign,
      gradient: 'from-teal-700 to-slate-950',
      tag: 'Forex',
    },
    {
      type: 'income' as const,
      title: 'Active Income / Salary',
      desc: 'Recurring monthly paycheck with annual increment appraisal',
      icon: Briefcase,
      gradient: 'from-green-500 to-emerald-900',
      tag: 'Inflow',
    },
    {
      type: 'emi' as const,
      title: 'Loan Liability & EMI',
      desc: 'Auto loan, mortgage, or credit with monthly auto-deduction',
      icon: CreditCard,
      gradient: 'from-rose-500 to-red-950',
      tag: 'Liability',
    },
    {
      type: 'expense' as const,
      title: 'Recurring Monthly Bill',
      desc: 'Utilities, subscriptions, or living expenses auto-debited',
      icon: Receipt,
      gradient: 'from-orange-500 to-red-900',
      tag: 'Deduction',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#181818] border border-[#282828] w-full max-w-2xl rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#282828]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-bold">
              <Sparkles className="w-4 h-4 fill-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Add New Portfolio Item</h2>
              <p className="text-xs text-[#b3b3b3]">
                Select the asset, appreciating investment, or deduction you want to track
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

        {/* Grid of Choices */}
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                onClick={() => {
                  onSelect(opt.type);
                  onClose();
                }}
                className="group flex items-start gap-3.5 p-3.5 bg-[#242424] hover:bg-[#2e2e2e] active:bg-[#333333] border border-transparent hover:border-[#4d4d4d] rounded-xl text-left transition-all cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-lg bg-gradient-to-br ${opt.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-white group-hover:text-[#1ed760] transition-colors">
                      {opt.title}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b3b3b3] bg-[#181818] px-2 py-0.5 rounded-full">
                      {opt.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#b3b3b3] mt-1 line-clamp-2 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#121212] border-t border-[#282828] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-[#4d4d4d] hover:border-white text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
