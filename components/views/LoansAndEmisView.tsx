'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { EmiLiability, RecurringExpense } from '@/types/finance';
import { formatCurrency, calculateCreditScore } from '@/lib/initial-data';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle,
  Zap,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { LoanPrepaymentModal } from '@/components/modals/LoanPrepaymentModal';

interface LoansAndEmisViewProps {
  openAddEmiModal: () => void;
  openAddExpenseModal: () => void;
  openEditEmiModal: (emi: EmiLiability) => void;
  openEditExpenseModal: (exp: RecurringExpense) => void;
}

export function LoansAndEmisView({
  openAddEmiModal,
  openAddExpenseModal,
  openEditEmiModal,
  openEditExpenseModal,
}: LoansAndEmisViewProps) {
  const { portfolio, deleteEmi, updateEmi, payoffEmi, deleteRecurringExpense, updateRecurringExpense } = usePortfolio();
  const [payoffError, setPayoffError] = useState<string | null>(null);
  const [prepayEmi, setPrepayEmi] = useState<EmiLiability | null>(null);

  if (!portfolio) return null;

  const currency = portfolio.user.currency;
  const emis = portfolio.emis;
  const expenses = portfolio.recurringExpenses;

  const totalOutstanding = emis.reduce((sum, e) => sum + e.remainingPrincipal, 0);
  const totalMonthlyEmis = emis.reduce((sum, e) => sum + (e.remainingPrincipal > 0 ? e.monthlyEmiAmount : 0), 0);
  const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);

  const handlePayoff = (emi: EmiLiability) => {
    setPayoffError(null);
    const targetBank = portfolio.bankAccounts.find(b => b.id === emi.linkedBankAccountId) || portfolio.bankAccounts[0];
    if (!targetBank) return;

    if (confirm(`Pay off remaining balance of ${formatCurrency(emi.remainingPrincipal, currency)} for "${emi.name}" using funds from ${targetBank.bankName}?`)) {
      const res = payoffEmi(emi.id, targetBank.id);
      if (!res.success) {
        setPayoffError(res.error || 'Failed to payoff loan');
      }
    }
  };

  const toggleEmiAutoDebit = (emi: EmiLiability) => {
    updateEmi({
      ...emi,
      autoDebitEnabled: !emi.autoDebitEnabled,
    });
  };

  const toggleExpenseAutoDebit = (exp: RecurringExpense) => {
    updateRecurringExpense({
      ...exp,
      autoDebitEnabled: !exp.autoDebitEnabled,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Spotify Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-rose-950/60 via-[#181818] to-[#121212] p-6 rounded-lg">
        {/* Cover Art Tile */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-gradient-to-br from-rose-600 to-red-950 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0">
          <CreditCard className="w-20 h-20 text-white" />
        </div>

        {/* Album Metadata */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
            Debt Liabilities & Amortization
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Loans, EMIs & Expenses
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3]">
            <span className="text-white font-bold">{portfolio.user.fullName}</span>
            <span>·</span>
            <span>{emis.length} loans logged</span>
            <span>·</span>
            <span className="font-mono text-[#f3727f] font-bold">
              {formatCurrency(totalOutstanding, currency)} remaining debt
            </span>
            <span>·</span>
            <span className="font-mono text-white font-bold">
              -{formatCurrency(totalMonthlyEmis + totalMonthlyExpenses, currency)}/mo auto-deductions
            </span>
          </div>
        </div>
      </div>

      {/* Real-Life Banking Credit Impact Card */}
      {(() => {
        const creditAnalysis = calculateCreditScore(portfolio);
        return (
          <div className="p-4 rounded-xl bg-[#181818] border border-[#2e2e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1ed760]/15 flex items-center justify-center text-[#1ed760] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block">
                  Credit Impact & Leverage Health · Score {creditAnalysis.score} ({creditAnalysis.tier})
                </span>
                <span className="text-[#888] block text-[11px] mt-0.5">
                  Making on-time EMI auto-debits directly strengthens your FICO® score. Prepaying principal decreases debt utilization and unlocks prime loan discounts!
                </span>
              </div>
            </div>
            <div className="shrink-0 font-mono text-[11px] px-3 py-1.5 rounded-lg bg-[#121212] border border-[#242424] text-[#1ed760] font-bold">
              ✓ On-Time Payment History Boost Active
            </div>
          </div>
        );
      })()}

      {/* Pill Actions */}
      <div className="flex items-center gap-3 px-2 flex-wrap">
        <button
          onClick={openAddEmiModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Loan / EMI</span>
        </button>

        <button
          onClick={openAddExpenseModal}
          className="px-5 py-2.5 rounded-full bg-transparent hover:bg-[#282828] text-white text-xs font-bold uppercase tracking-wider border border-[#4d4d4d] hover:border-white transition-all cursor-pointer"
        >
          Add Recurring Bill
        </button>
      </div>

      {payoffError && (
        <div className="p-4 bg-[#f3727f]/10 border border-[#f3727f]/30 text-[#f3727f] rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{payoffError}</span>
        </div>
      )}

      {/* 1. EMIs & Loans Section */}
      <div className="bg-[#181818] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Active Loan Contracts & Monthly EMIs</h3>
        </div>

        {emis.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#b3b3b3]">
            No active loan contracts. You are 100% debt-free!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emis.map(emi => {
              const isCleared = emi.remainingPrincipal <= 0;
              const paidDown = emi.principalOriginal - emi.remainingPrincipal;
              const paidPct = Math.min(100, Math.max(0, (paidDown / emi.principalOriginal) * 100));
              const targetBank = portfolio.bankAccounts.find(b => b.id === emi.linkedBankAccountId);

              return (
                <div
                  key={emi.id}
                  className={`p-5 rounded-lg border transition-colors space-y-4 ${
                    isCleared
                      ? 'bg-[#141414] border-[#1ed760]/30 opacity-75'
                      : 'bg-[#121212] border-[#282828] hover:border-[#383838]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{emi.name}</h4>
                      <p className="text-xs text-[#b3b3b3] mt-0.5">
                        {emi.loanType} · {emi.interestRateYearly}% p.a.
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-base font-bold font-mono ${
                          isCleared ? 'text-[#1ed760]' : 'text-[#f3727f]'
                        }`}
                      >
                        {isCleared ? 'PAID OFF' : `-${formatCurrency(emi.monthlyEmiAmount, currency)}/mo`}
                      </div>
                      <div className="text-[11px] text-[#b3b3b3] font-mono">
                        {isCleared ? '0' : emi.tenureMonthsRemaining} mos left
                      </div>
                    </div>
                  </div>

                  {/* Spotify Playback Scrubber Style Amortization Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#b3b3b3]">
                        Balance: <strong className="text-white">{formatCurrency(emi.remainingPrincipal, currency)}</strong>
                      </span>
                      <span className="text-[#b3b3b3]">
                        {paidPct.toFixed(0)}% paid of {formatCurrency(emi.principalOriginal, currency)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#282828] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${paidPct}%` }}
                        className={`h-full ${isCleared ? 'bg-[#1ed760]' : 'bg-[#f3727f]'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 bg-[#181818] rounded text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] block font-sans">Debited From</span>
                      <span className="text-white truncate block">{targetBank?.bankName || 'Primary Checking'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] block font-sans">Auto-Debit</span>
                      <span className={`font-bold ${emi.autoDebitEnabled ? 'text-[#1ed760]' : 'text-[#ffa42b]'}`}>
                        {emi.autoDebitEnabled ? 'Active (Monthly)' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#282828] text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isCleared && (
                        <>
                          <button
                            onClick={() => setPrepayEmi(emi)}
                            className="px-2.5 py-1 rounded-full bg-[#1ed760]/10 hover:bg-[#1ed760]/20 text-[#1ed760] text-[11px] font-bold border border-[#1ed760]/30 transition-all cursor-pointer flex items-center gap-1"
                            title="Prepay extra principal to reduce tenure and interest"
                          >
                            <Zap className="w-3 h-3 fill-[#1ed760]" />
                            <span>Prepay Principal</span>
                          </button>
                          <button
                            onClick={() => handlePayoff(emi)}
                            className="text-[11px] text-[#b3b3b3] hover:text-white hover:underline font-bold uppercase tracking-wider"
                          >
                            Payoff All
                          </button>
                          <span className="text-[#7c7c7c]">·</span>
                          <button
                            onClick={() => toggleEmiAutoDebit(emi)}
                            className="text-[11px] text-[#b3b3b3] hover:text-white uppercase font-bold tracking-wider"
                          >
                            {emi.autoDebitEnabled ? 'Pause' : 'Resume'}
                          </button>
                        </>
                      )}
                      {isCleared && (
                        <span className="text-[11px] text-[#1ed760] font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Debt Cleared</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditEmiModal(emi)} className="p-1 text-[#b3b3b3] hover:text-white">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteEmi(emi.id)} className="p-1 text-[#b3b3b3] hover:text-[#f3727f]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Recurring Expenses Section */}
      <div className="bg-[#181818] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recurring Expenses & Subscriptions</h3>
          <button
            onClick={openAddExpenseModal}
            className="text-xs font-bold uppercase tracking-wider text-[#1ed760] hover:underline"
          >
            + Add Bill
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {expenses.map(exp => {
            const targetBank = portfolio.bankAccounts.find(b => b.id === exp.linkedBankAccountId);

            return (
              <div key={exp.id} className="p-4 bg-[#121212] rounded-lg border border-[#282828] space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{exp.name}</h4>
                    <p className="text-xs text-[#b3b3b3]">{exp.category} · Due Day {exp.dueDayOfMonth}</p>
                  </div>
                  <div className="text-sm font-bold font-mono text-[#f3727f]">
                    -{formatCurrency(exp.monthlyAmount, currency)}/mo
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#282828]">
                  <span className="text-[#b3b3b3] truncate">{targetBank?.bankName || 'Primary Vault'}</span>
                  <button
                    onClick={() => toggleExpenseAutoDebit(exp)}
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                      exp.autoDebitEnabled ? 'bg-[#1ed760]/10 text-[#1ed760]' : 'bg-[#282828] text-[#b3b3b3]'
                    }`}
                  >
                    {exp.autoDebitEnabled ? 'Auto-Pay' : 'Manual'}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-1 pt-1">
                  <button onClick={() => openEditExpenseModal(exp)} className="p-1 text-[#b3b3b3] hover:text-white">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteRecurringExpense(exp.id)} className="p-1 text-[#b3b3b3] hover:text-[#f3727f]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loan Principal Prepayment Modal */}
      <LoanPrepaymentModal
        emi={prepayEmi}
        isOpen={!!prepayEmi}
        onClose={() => setPrepayEmi(null)}
      />
    </div>
  );
}
