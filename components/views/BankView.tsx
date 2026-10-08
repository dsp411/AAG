'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { BankAccount } from '@/types/finance';
import { formatCurrency, calculateCreditScore, calculateEmergencyFundMetrics } from '@/lib/initial-data';
import { calculateMonthlyFinances } from '@/lib/payout-calculator';
import {
  Landmark,
  Plus,
  ArrowRightLeft,
  Trash2,
  Edit2,
  CheckCircle,
  Send,
  Clock,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Play,
  ShieldCheck,
  Award,
  FileText,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { MonthlyPayoutModal } from '@/components/modals/MonthlyPayoutModal';
import { BankStatementModal } from '@/components/modals/BankStatementModal';

interface BankViewProps {
  openAddBankModal: () => void;
  openTransferModal: () => void;
  openEditBankModal: (bank: BankAccount) => void;
  openSendMoneyModal?: (preselectedBankId?: string) => void;
  openMonthlyPayoutModal?: () => void;
}

export function BankView({
  openAddBankModal,
  openTransferModal,
  openEditBankModal,
  openSendMoneyModal,
  openMonthlyPayoutModal,
}: BankViewProps) {
  const { portfolio, currentUser, deleteBankAccount, updateBankAccount, refreshPortfolio } = usePortfolio();
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isExecutingPayout, setIsExecutingPayout] = useState(false);
  const [payoutNotification, setPayoutNotification] = useState<string | null>(null);
  const [statementBank, setStatementBank] = useState<BankAccount | null>(null);
  const [showCreditFactors, setShowCreditFactors] = useState(false);

  if (!portfolio) return null;

  const banks = portfolio.bankAccounts;
  const currency = portfolio.user.currency;
  const totalLiquid = banks.reduce((sum, b) => sum + b.balance, 0);

  // Calculate real-time itemized monthly finances
  const finances = calculateMonthlyFinances(portfolio, currentUser?.lossCarryoverBalance || 0);

  // Real-Life Banking & Financial Health Engine
  const creditAnalysis = calculateCreditScore(portfolio);
  const emergencyAnalysis = calculateEmergencyFundMetrics(portfolio);

  const primaryBank =
    banks.find(b => b.id === currentUser?.connectedBankAccountId) ||
    banks.find(b => b.isPrimaryForAutoDebit) ||
    banks[0];

  const makePrimary = (bank: BankAccount) => {
    portfolio.bankAccounts.forEach(b => {
      updateBankAccount({ ...b, isPrimaryForAutoDebit: b.id === bank.id });
    });
  };

  const handleQuickExecutePayout = async () => {
    if (!currentUser?.username) return;
    setIsExecutingPayout(true);
    setPayoutNotification(null);
    try {
      const res = await fetch('/api/payout/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          force: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPayoutNotification(data.message || `Deposited +${formatCurrency(finances.netPayoutAmount, currency)} into ${primaryBank?.bankName}`);
        await refreshPortfolio();
      } else {
        setPayoutNotification(data.error || data.message || 'Payout failed.');
      }
    } catch (err: any) {
      setPayoutNotification(err?.message || 'Error processing payout.');
    } finally {
      setIsExecutingPayout(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Spotify Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-emerald-950/60 via-[#181818] to-[#121212] p-6 rounded-lg">
        {/* Cover Art Tile */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-gradient-to-br from-emerald-600 to-teal-950 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0">
          <Landmark className="w-20 h-20 text-white" />
        </div>

        {/* Album Metadata */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
            Liquid Capital & Bank Vaults
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Bank Accounts
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3]">
            <span className="text-white font-bold">{portfolio.user.fullName}</span>
            <span>·</span>
            <span>{banks.length} in-app accounts</span>
            <span>·</span>
            <span className="font-mono text-[#1ed760] font-bold">
              {formatCurrency(totalLiquid, currency)} total liquid balance
            </span>
          </div>
        </div>
      </div>

      {/* Real-Life Banking Intelligence & Credit Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: FICO-Grade Credit Score */}
        <div className="bg-[#181818] border border-[#2b2b2b] rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1ed760]/15 flex items-center justify-center text-[#1ed760] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider block">
                  Real-Life Credit Standing
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>FICO® Credit Score</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${creditAnalysis.badgeBg}`}>
                    {creditAnalysis.tier}
                  </span>
                </h3>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {creditAnalysis.score}
                <span className="text-xs text-[#888] font-normal"> / 850</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#242424]">
            <div className="p-2.5 rounded-lg bg-[#121212] border border-[#222]">
              <span className="text-[10px] text-[#888] block">Prime Loan Discount</span>
              <span className="font-mono font-bold text-[#1ed760] text-xs">
                -{creditAnalysis.primeRateDiscountPercent}% APR Benefit
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#121212] border border-[#222]">
              <span className="text-[10px] text-[#888] block">Credit Line Multiplier</span>
              <span className="font-mono font-bold text-white text-xs">
                {creditAnalysis.maxBorrowingPowerMultiplier}x Asset Tier
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={() => setShowCreditFactors(!showCreditFactors)}
              className="text-[#1ed760] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <span>{showCreditFactors ? 'Hide FICO Factors' : 'View 5 Credit Score Factors'}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCreditFactors ? 'rotate-90' : ''}`} />
            </button>
            <span className="text-[10px] text-[#777]">Updated continuously</span>
          </div>

          {showCreditFactors && (
            <div className="space-y-2 pt-2 border-t border-[#262626] text-xs">
              {creditAnalysis.factors.map(factor => (
                <div key={factor.category} className="p-2.5 rounded-lg bg-[#141414] border border-[#242424] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block text-[11px]">{factor.category}</span>
                    <span className="text-[10px] text-[#888] block">{factor.description}</span>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px]">
                    <span className="text-[#1ed760] font-bold">{factor.pointsEarned}</span>
                    <span className="text-[#666]"> / {factor.maxPoints} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Emergency Fund & Financial Runway */}
        <div className="bg-[#181818] border border-[#2b2b2b] rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider block">
                    Financial Survival Health
                  </span>
                  <h3 className="text-base font-bold text-white">Emergency Fund Runway</h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
                  {emergencyAnalysis.runwayMonths >= 999 ? '∞' : `${emergencyAnalysis.runwayMonths} Mo`}
                </span>
                <span className="text-[10px] text-[#1ed760] font-bold block uppercase tracking-wider">
                  {emergencyAnalysis.statusTier}
                </span>
              </div>
            </div>

            {/* Progress bar towards 6-month gold standard */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#888]">6-Month Target Reserve ({formatCurrency(emergencyAnalysis.targetFund6Months, currency)})</span>
                <span className="font-mono text-white font-bold">{emergencyAnalysis.healthPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#121212] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-[#1ed760] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, emergencyAnalysis.healthPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#242424] text-xs text-[#aaa] mt-2">
            <span className="text-white font-bold block mb-0.5">Financial Advisor Insight:</span>
            <span>{emergencyAnalysis.advice}</span>
          </div>
        </div>
      </div>

      {/* Automated Monthly Background Payout Spotlight Card */}
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1ed760]/15 flex items-center justify-center text-[#1ed760] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Automated Monthly Net Profit Payout
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] text-[10px] font-bold uppercase tracking-wider">
                  Active in Background
                </span>
              </div>
              <p className="text-xs text-[#a7a7a7] mt-0.5">
                Automatically calculates monthly net profit (Revenue - Expenses) and adds the exact amount into your in-app <strong className="text-white">{primaryBank?.bankName || 'Primary Bank'}</strong>.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleQuickExecutePayout}
              disabled={isExecutingPayout}
              className="px-4 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isExecutingPayout ? 'Crediting...' : 'Add Monthly Profit Now'}</span>
            </button>
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-bold uppercase tracking-wider border border-[#383838] transition-all cursor-pointer"
            >
              Payout Breakdown
            </button>
          </div>
        </div>

        {/* Real-time Math Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#262626] text-xs">
          <div className="p-3 rounded-lg bg-[#121212] border border-[#242424]">
            <div className="text-[#888] text-[11px] font-medium">1. Total Monthly Revenue</div>
            <div className="text-base font-bold font-mono text-[#1ed760] mt-0.5">
              +{formatCurrency(finances.totalRevenue, currency)}/mo
            </div>
            <div className="text-[10px] text-[#666] mt-0.5">
              Salaries, businesses, rentals & dividends
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#121212] border border-[#242424]">
            <div className="text-[#888] text-[11px] font-medium">2. Total Monthly Expenses</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              -{formatCurrency(finances.totalExpenses, currency)}/mo
            </div>
            <div className="text-[10px] text-[#666] mt-0.5">
              EMIs, lifestyle living & insurance
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#121212] border border-[#1ed760]/30">
            <div className="text-[#888] text-[11px] font-medium">3. Exact Profit to Bank Account</div>
            <div className="text-base font-bold font-mono text-[#1ed760] mt-0.5">
              +{formatCurrency(finances.netPayoutAmount, currency)}/mo
            </div>
            <div className="text-[10px] text-[#888] mt-0.5 truncate">
              Credited to: {primaryBank?.bankName || 'Primary Vault'}
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {payoutNotification && (
          <div className="p-3 rounded-lg bg-[#141414] border border-[#1ed760]/50 text-xs text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1ed760] shrink-0" />
              <span>{payoutNotification}</span>
            </div>
            <button
              onClick={() => setPayoutNotification(null)}
              className="text-[#888] hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Primary Action Buttons Row */}
      <div className="flex items-center gap-3 px-1 flex-wrap">
        <button
          onClick={openAddBankModal}
          className="px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-102 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Bank Account</span>
        </button>

        <button
          onClick={openTransferModal}
          disabled={banks.length < 2}
          className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#282828] text-white text-xs font-bold uppercase tracking-wider border border-[#383838] hover:border-white transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Transfer Between Accounts</span>
        </button>

        {openSendMoneyModal && (
          <button
            onClick={() => openSendMoneyModal()}
            className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#282828] text-white hover:text-[#1ed760] text-xs font-bold uppercase tracking-wider border border-[#383838] hover:border-[#1ed760]/50 flex items-center gap-2 transition-all cursor-pointer"
            title="Send money directly to other users bank account"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Wire to User</span>
          </button>
        )}
      </div>

      {/* Grid of Bank Accounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map(bank => {
          const isPrimary = bank.isPrimaryForAutoDebit;

          return (
            <div
              key={bank.id}
              className="bg-[#181818] hover:bg-[#222] p-5 rounded-xl border border-[#282828] transition-all duration-200 group flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-950 flex items-center justify-center text-white shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[170px]">
                        {bank.bankName}
                      </h4>
                      <p className="text-xs text-[#b3b3b3] font-mono mt-0.5">
                        {bank.accountType} · {bank.accountNumberMasked}
                      </p>
                    </div>
                  </div>

                  {isPrimary && (
                    <span className="text-[10px] text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Primary
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-[11px] text-[#b3b3b3] uppercase tracking-wider font-bold block">
                    Available Balance
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                    {formatCurrency(bank.balance, bank.currency || currency)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-[#121212] rounded-lg border border-[#242424]">
                    <span className="text-[#888] block text-[10px]">Annual APY:</span>
                    <span className="text-[#1ed760] font-bold">{bank.interestRateApy}% p.a.</span>
                  </div>
                  <div className="p-2 bg-[#121212] rounded-lg border border-[#242424]">
                    <span className="text-[#888] block text-[10px]">Routing #:</span>
                    <span className="text-white font-bold truncate block">{bank.routingNumber || '021000021'}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] px-1">
                  <span className="text-[#888]">Overdraft Protection:</span>
                  <span className={bank.overdraftProtectionEnabled ? 'text-[#1ed760] font-bold' : 'text-[#888]'}>
                    {bank.overdraftProtectionEnabled ? '✓ Sweep Active' : 'Off'}
                  </span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#282828] text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatementBank(bank)}
                    className="px-2.5 py-1 rounded-full bg-[#242424] hover:bg-[#333] text-white text-[11px] font-bold flex items-center gap-1 border border-[#383838] transition-colors cursor-pointer"
                    title="View official ledger statement"
                  >
                    <FileText className="w-3 h-3 text-[#1ed760]" />
                    <span>Statement</span>
                  </button>

                  {!isPrimary ? (
                    <button
                      onClick={() => makePrimary(bank)}
                      className="text-[11px] text-[#b3b3b3] hover:text-[#1ed760] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                    >
                      Set Primary
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#1ed760] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Primary Vault</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditBankModal(bank)}
                    className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#333333] transition-colors cursor-pointer"
                    title="Edit bank account details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {banks.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete account ${bank.bankName}?`)) deleteBankAccount(bank.id);
                      }}
                      className="p-1.5 text-[#b3b3b3] hover:text-[#f3727f] rounded-full hover:bg-[#333333] transition-colors cursor-pointer"
                      title="Delete bank account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for monthly payout history and details */}
      <MonthlyPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
      />

      {/* Official Bank Account Statement Modal */}
      <BankStatementModal
        isOpen={!!statementBank}
        bank={statementBank}
        onClose={() => setStatementBank(null)}
      />
    </div>
  );
}
