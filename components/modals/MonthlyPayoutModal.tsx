'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import { calculateMonthlyFinances } from '@/lib/payout-calculator';
import { PayoutRecord } from '@/types/finance';
import {
  X,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Landmark,
  ShieldCheck,
  Play,
  RotateCw,
  ArrowRight,
  Info,
} from 'lucide-react';

interface MonthlyPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonthlyPayoutModal({ isOpen, onClose }: MonthlyPayoutModalProps) {
  const { portfolio, currentUser, refreshPortfolio } = usePortfolio();
  const [history, setHistory] = useState<PayoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  const currency = currentUser?.currency || 'USD';

  // Calculate current real-time month finances
  const finances = portfolio
    ? calculateMonthlyFinances(portfolio, currentUser?.lossCarryoverBalance || 0)
    : null;

  const connectedBank =
    portfolio?.bankAccounts.find(b => b.id === currentUser?.connectedBankAccountId) ||
    portfolio?.bankAccounts.find(b => b.isPrimaryForAutoDebit) ||
    portfolio?.bankAccounts[0];

  const username = currentUser?.username;

  useEffect(() => {
    let isMounted = true;
    if (isOpen && username) {
      fetch(`/api/payout/history?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.success && Array.isArray(data.records)) {
            setHistory(data.records);
          }
        })
        .catch(err => {
          console.error('Failed to load payout history:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, username]);

  const fetchHistory = async () => {
    if (!username) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/payout/history?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setHistory(data.records);
      }
    } catch (err) {
      console.error('Failed to load payout history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !portfolio || !finances) return null;

  const handleExecuteNow = async () => {
    if (!currentUser?.username) return;
    setIsExecuting(true);
    setExecutionMessage(null);
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
        setExecutionMessage(data.message || 'Payout processed successfully!');
        await refreshPortfolio();
        await fetchHistory();
      } else {
        setExecutionMessage(data.error || data.message || 'Payout execution failed.');
      }
    } catch (err: any) {
      setExecutionMessage(err?.message || 'Network error executing payout.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-white shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#282828] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760]">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Automated Monthly Profit Payout
              </h2>
              <p className="text-xs text-[#a7a7a7]">
                Calculates net profit (Revenue - Expenses) and automatically adds the exact amount into your in-app bank account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#888] hover:text-white hover:bg-[#282828] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Status Message */}
          {executionMessage && (
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#1ed760]/50 text-xs text-white flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1ed760] shrink-0" />
              <span>{executionMessage}</span>
            </div>
          )}

          {/* 3 Step Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Monthly Revenue */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#262626]">
              <div className="flex items-center justify-between text-xs text-[#888]">
                <span>Total Monthly Revenue</span>
                <TrendingUp className="w-4 h-4 text-[#1ed760]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#1ed760] mt-1">
                +{formatCurrency(finances.totalRevenue, currency)}
              </div>
              <div className="text-[11px] text-[#777] mt-1 space-y-0.5">
                <div>Jobs & Salary: {formatCurrency(finances.breakdown.revenues.salariesAndJobs, currency)}</div>
                <div>Businesses: {formatCurrency(finances.breakdown.revenues.businessProfits, currency)}</div>
                <div>Rentals: {formatCurrency(finances.breakdown.revenues.rentalIncomes, currency)}</div>
              </div>
            </div>

            {/* 2. Monthly Expenses */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#262626]">
              <div className="flex items-center justify-between text-xs text-[#888]">
                <span>Total Monthly Expenses</span>
                <CreditCard className="w-4 h-4 text-[#888]" />
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                -{formatCurrency(finances.totalExpenses, currency)}
              </div>
              <div className="text-[11px] text-[#777] mt-1 space-y-0.5">
                <div>Loans & EMIs: {formatCurrency(finances.breakdown.expenses.emiObligations, currency)}</div>
                <div>Overheads: {formatCurrency(finances.breakdown.expenses.recurringExpenses, currency)}</div>
                <div>Property: {formatCurrency(finances.breakdown.expenses.propertyTaxesAndMaint, currency)}</div>
              </div>
            </div>

            {/* 3. Net Payout Amount */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#1ed760]/40">
              <div className="flex items-center justify-between text-xs text-[#888]">
                <span>Current Net Payout</span>
                <Landmark className="w-4 h-4 text-[#1ed760]" />
              </div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  finances.netPayoutAmount > 0 ? 'text-[#1ed760]' : 'text-white'
                }`}
              >
                {formatCurrency(finances.netPayoutAmount, currency)}
              </div>
              <div className="text-[11px] text-[#a7a7a7] mt-1">
                {finances.grossNetProfit > 0
                  ? `To: ${connectedBank?.bankName || 'Connected Vault'}`
                  : finances.grossNetProfit === 0
                  ? 'Break-even ($0 profit)'
                  : 'Net loss (rolls over)'}
              </div>
            </div>
          </div>

          {/* Automated Schedule & Gateway Info Bar */}
          <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-white">
                <Clock className="w-4 h-4 text-[#1ed760]" />
                <span>Runs automatically every month in the simulation</span>
              </div>
              <p className="text-[#888]">
                Credits the exact net profit directly into your in-app account: <strong className="text-white">{connectedBank?.bankName}</strong>.
              </p>
            </div>

            <button
              onClick={handleExecuteNow}
              disabled={isExecuting}
              className="px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isExecuting ? 'Crediting Bank...' : 'Add Monthly Profit to Bank Now'}</span>
            </button>
          </div>

          {/* Edge Cases Explanation Note */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#222] text-xs text-[#999] space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#1ed760]" />
              <span>Automated Edge-Case Rules:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Zero Profit:</strong> When revenue equals expenses, the system records a break-even log without triggering payment fees.</li>
              <li><strong>Negative Profit (Loss):</strong> When expenses exceed revenue, no payout is deducted; the loss carries forward to offset future profits.</li>
              <li><strong>Idempotency:</strong> Built-in duplicate protection guarantees that payouts never process twice for the same billing cycle.</li>
            </ul>
          </div>

          {/* Payout History Ledger */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3]">
                Payout Transaction History ({history.length})
              </h3>
              <button
                onClick={fetchHistory}
                disabled={isLoading}
                className="text-xs text-[#1ed760] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {history.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#121212] border border-[#222] text-center text-xs text-[#777]">
                No monthly background payouts recorded yet. Click &ldquo;Run Test Payout Now&rdquo; above to test.
              </div>
            ) : (
              <div className="rounded-xl border border-[#262626] overflow-hidden divide-y divide-[#222] bg-[#121212]">
                {history.map(record => (
                  <div key={record.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{record.billingPeriod}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            record.status === 'succeeded'
                              ? 'bg-[#1ed760]/20 text-[#1ed760]'
                              : record.status.startsWith('skipped')
                              ? 'bg-[#282828] text-[#a0a0a0]'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {record.status === 'succeeded'
                            ? 'Succeeded'
                            : record.status === 'skipped_zero_profit'
                            ? 'Break-Even'
                            : record.status === 'skipped_loss'
                            ? 'Loss Rollover'
                            : 'Failed'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777]">
                        Rev: {formatCurrency(record.totalRevenue, record.currency)} · Exp: {formatCurrency(record.totalExpenses, record.currency)} · Bank: {record.connectedBankName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#1ed760]">
                        {record.netPayoutAmount > 0
                          ? `+${formatCurrency(record.netPayoutAmount, record.currency)}`
                          : formatCurrency(0, record.currency)}
                      </div>
                      <div className="text-[10px] text-[#666] font-mono">
                        {new Date(record.executedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#888]">
            <ShieldCheck className="w-4 h-4 text-[#1ed760]" />
            <span>Secure automated settlement verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#282828] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
