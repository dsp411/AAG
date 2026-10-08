'use client';

import React, { useState } from 'react';
import { EmiLiability, BankAccount } from '@/types/finance';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import { X, CreditCard, Landmark, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface LoanPrepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  emi: EmiLiability | null;
}

export function LoanPrepaymentModal({ isOpen, onClose, emi }: LoanPrepaymentModalProps) {
  const { portfolio, prepayEmiPrincipal } = usePortfolio();

  const [prepayAmount, setPrepayAmount] = useState<number>(5000);
  const [selectedBankId, setSelectedBankId] = useState<string>(() => {
    return emi?.linkedBankAccountId || portfolio?.bankAccounts[0]?.id || '';
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !emi || !portfolio) return null;

  const currency = portfolio.user.currency || 'USD';
  const selectedBank = portfolio.bankAccounts.find(b => b.id === selectedBankId) || portfolio.bankAccounts[0];

  const safePrepay = Math.min(Math.max(1, prepayAmount || 0), emi.remainingPrincipal);
  const newPrincipal = Math.max(0, emi.remainingPrincipal - safePrepay);
  const tenureFraction = emi.remainingPrincipal > 0 ? newPrincipal / emi.remainingPrincipal : 0;
  const estimatedNewMonths = Math.max(0, Math.ceil(emi.tenureMonthsRemaining * tenureFraction));
  const monthsSaved = emi.tenureMonthsRemaining - estimatedNewMonths;

  // Approximate interest saved: Principal * (APR/100) * (monthsSaved / 12)
  const estimatedInterestSaved = Math.round(safePrepay * (emi.interestRateYearly / 100) * (monthsSaved / 12));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (safePrepay <= 0) {
      setError('Please enter a positive prepayment amount.');
      return;
    }

    if (!selectedBank) {
      setError('Please select a payment bank account.');
      return;
    }

    if (selectedBank.balance < safePrepay) {
      setError(
        `Insufficient balance in ${selectedBank.bankName}. Available: ${formatCurrency(selectedBank.balance, currency)}, Required: ${formatCurrency(safePrepay, currency)}`
      );
      return;
    }

    setIsSubmitting(true);
    const res = prepayEmiPrincipal(emi.id, safePrepay, selectedBank.id);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to process prepayment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-[#242424] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#333333]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1ed760]/15 flex items-center justify-center text-[#1ed760]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Prepay Loan Principal
              </h3>
              <p className="text-xs text-[#aaa]">Reduce debt tenure & save on interest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#333333] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Loan Info */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#2e2e2e]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{emi.name}</span>
              <span className="text-[11px] text-[#1ed760] font-mono font-bold">
                {emi.interestRateYearly}% APR
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#888] mt-1">
              <span>Outstanding Debt:</span>
              <span className="font-mono text-white font-bold">
                {formatCurrency(emi.remainingPrincipal, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#888] mt-0.5">
              <span>Remaining Schedule:</span>
              <span className="font-mono text-white">{emi.tenureMonthsRemaining} months left</span>
            </div>
          </div>

          {/* Prepayment Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Prepayment Amount *
              </label>
              <button
                type="button"
                onClick={() => setPrepayAmount(emi.remainingPrincipal)}
                className="text-[10px] text-[#1ed760] hover:underline font-bold uppercase cursor-pointer"
              >
                Pay in Full
              </button>
            </div>
            <input
              type="number"
              min="1"
              max={emi.remainingPrincipal}
              value={prepayAmount}
              onChange={e => setPrepayAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-sm bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              required
            />
          </div>

          {/* Funding Bank Selection */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Fund From Bank Account
            </label>
            <select
              value={selectedBankId}
              onChange={e => setSelectedBankId(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
            >
              {portfolio.bankAccounts.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bankName} (Available: {formatCurrency(b.balance, b.currency)})
                </option>
              ))}
            </select>
          </div>

          {/* Real-Life Amortization Impact Forecast */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#162218] to-[#121212] border border-[#1ed760]/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1ed760]">
              <Zap className="w-3.5 h-3.5 fill-[#1ed760]" />
              <span>Real-Life Amortization Savings</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 rounded bg-black/40 border border-[#2e2e2e]">
                <span className="text-[10px] text-[#888] block">New Balance</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(newPrincipal, currency)}
                </span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-[#2e2e2e]">
                <span className="text-[10px] text-[#888] block">Tenure Reduction</span>
                <span className="font-mono font-bold text-[#1ed760]">
                  -{monthsSaved} Months Faster
                </span>
              </div>
            </div>

            {estimatedInterestSaved > 0 && (
              <p className="text-[11px] text-[#aaa]">
                💡 You save approximately <strong className="text-white">{formatCurrency(estimatedInterestSaved, currency)}</strong> in compounding interest over the loan life.
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#b3b3b3] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#1ed760] hover:bg-[#3be477] active:scale-95 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider rounded-full shadow-md cursor-pointer transition-all"
            >
              {isSubmitting ? 'Processing...' : `Prepay ${formatCurrency(safePrepay, currency)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
