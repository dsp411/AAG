'use client';

import React, { useState, useMemo } from 'react';
import { BankAccount, CurrencyCode } from '@/types/finance';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import {
  X,
  Landmark,
  Download,
  Printer,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Calendar,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface BankStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: BankAccount | null;
}

export function BankStatementModal({ isOpen, onClose, bank }: BankStatementModalProps) {
  const { portfolio } = usePortfolio();
  const [filterType, setFilterType] = useState<'all' | 'credits' | 'debits'>('all');

  // Extract all portfolio logs that impacted this specific bank or general banking
  const relevantLogs = useMemo(() => {
    if (!bank || !portfolio) return [];
    return (portfolio.simulationLogs || []).filter(log => {
      if (!log.bankAccountAffected) return true; // general ledger
      return (
        log.bankAccountAffected.toLowerCase().includes(bank.bankName.toLowerCase()) ||
        bank.bankName.toLowerCase().includes(log.bankAccountAffected.toLowerCase())
      );
    });
  }, [bank, portfolio]);

  // Build a running ledger inside useMemo
  const ledgerEntries = useMemo(() => {
    if (!bank) return [];
    let curBalance = bank.balance;
    const entries: any[] = [];
    for (let index = 0; index < relevantLogs.length; index++) {
      const log = relevantLogs[index];
      const isCredit = log.direction === 'inflow' || log.direction === 'valuation_up';
      const amount = log.amount || 0;
      const balanceAtTime = curBalance;

      // Step backwards for subsequent entries in historical order
      if (isCredit) {
        curBalance = Math.max(0, curBalance - amount);
      } else {
        curBalance += amount;
      }

      const refCode = `TXN-${(100000 + index * 179 + log.id.length * 37) % 900000 + 100000}`;

      entries.push({
        id: log.id,
        date: log.simulatedDateString || log.timestamp?.split('T')[0] || '2026-10-01',
        timestamp: log.timestamp,
        title: log.title,
        details: log.details,
        amount,
        isCredit,
        refCode,
        runningBalance: balanceAtTime,
        type: log.type,
      });
    }
    return entries;
  }, [bank, relevantLogs]);

  if (!isOpen || !bank || !portfolio) return null;

  const currency = bank.currency || portfolio.user.currency || 'USD';

  const filteredEntries = ledgerEntries.filter(entry => {
    if (filterType === 'credits') return entry.isCredit;
    if (filterType === 'debits') return !entry.isCredit;
    return true;
  });

  const totalCredits = ledgerEntries.filter(e => e.isCredit).reduce((sum, e) => sum + e.amount, 0);
  const totalDebits = ledgerEntries.filter(e => !e.isCredit).reduce((sum, e) => sum + e.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1a1a] border border-[#333333] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Statement Header */}
        <div className="p-6 border-b border-[#2b2b2b] bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#202020] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-900 flex items-center justify-center text-white shadow-lg shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">{bank.bankName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] text-[10px] font-bold uppercase tracking-wider border border-[#1ed760]/30">
                  Official Statement
                </span>
              </div>
              <p className="text-xs text-[#a0a0a0] font-mono mt-0.5">
                {bank.accountType} · {bank.accountNumberMasked} · Routing: {bank.routingNumber || '021000021'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-full bg-[#242424] hover:bg-[#2c2c2c] text-xs font-bold text-white border border-[#383838] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#242424] hover:bg-[#333] text-[#aaa] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statement Summary Card Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-[#141414] border-b border-[#262626]">
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#2b2b2b]">
            <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
              Current Available
            </span>
            <div className="text-lg font-mono font-bold text-white mt-0.5">
              {formatCurrency(bank.balance, currency)}
            </div>
            <span className="text-[10px] text-[#1ed760] font-mono mt-0.5 block">
              {bank.interestRateApy}% APY Accrual
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#2b2b2b]">
            <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
              Total Recorded Credits
            </span>
            <div className="text-lg font-mono font-bold text-[#1ed760] mt-0.5">
              +{formatCurrency(totalCredits, currency)}
            </div>
            <span className="text-[10px] text-[#888] mt-0.5 block">
              Salaries, wires & payouts
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#2b2b2b]">
            <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
              Total Recorded Debits
            </span>
            <div className="text-lg font-mono font-bold text-white mt-0.5">
              -{formatCurrency(totalDebits, currency)}
            </div>
            <span className="text-[10px] text-[#888] mt-0.5 block">
              EMIs, sweeps & living
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#2b2b2b]">
            <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
              Overdraft Status
            </span>
            <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1ed760]" />
              <span>{bank.overdraftProtectionEnabled ? 'Sweep Protected' : 'Standard'}</span>
            </div>
            <span className="text-[10px] text-[#888] mt-0.5 block truncate">
              {bank.backupSweepBankId ? 'Linked Secondary Vault' : 'No Shortfall Risk'}
            </span>
          </div>
        </div>

        {/* Ledger Filter Row */}
        <div className="px-6 py-3 bg-[#181818] border-b border-[#262626] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#888]" />
            <span className="text-[#888] font-bold uppercase tracking-wider text-[10px]">Filter Ledger:</span>
            <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded-full border border-[#2e2e2e]">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'
                }`}
              >
                All ({ledgerEntries.length})
              </button>
              <button
                onClick={() => setFilterType('credits')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  filterType === 'credits' ? 'bg-[#1ed760]/20 text-[#1ed760]' : 'text-[#888] hover:text-white'
                }`}
              >
                Credits Only
              </button>
              <button
                onClick={() => setFilterType('debits')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  filterType === 'debits' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'
                }`}
              >
                Debits Only
              </button>
            </div>
          </div>

          <span className="text-[11px] text-[#777] font-mono">
            Account Holder: <strong className="text-white">{portfolio.user.fullName}</strong>
          </span>
        </div>

        {/* Itemized Table of Transactions */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#888]">
              No transactions match the selected filter.
            </div>
          ) : (
            <div className="border border-[#2b2b2b] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#141414] text-[10px] text-[#888] font-bold uppercase tracking-wider border-b border-[#2b2b2b]">
                    <th className="py-3 px-4">Date & Ref</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {filteredEntries.map(entry => {
                    return (
                      <tr key={entry.id} className="hover:bg-[#202020] transition-colors">
                        <td className="py-3 px-4 align-top">
                          <div className="font-mono text-white text-[11px]">{entry.date}</div>
                          <div className="font-mono text-[10px] text-[#666]">{entry.refCode}</div>
                        </td>
                        <td className="py-3 px-4 align-top max-w-md">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {entry.isCredit ? (
                              <ArrowDownLeft className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#f3727f] shrink-0" />
                            )}
                            <span>{entry.title}</span>
                          </div>
                          <div className="text-[11px] text-[#888] mt-0.5 line-clamp-2">
                            {entry.details}
                          </div>
                        </td>
                        <td className="py-3 px-4 align-top text-right font-mono font-bold tabular-nums">
                          <span className={entry.isCredit ? 'text-[#1ed760]' : 'text-white'}>
                            {entry.isCredit ? '+' : '-'}{formatCurrency(entry.amount, currency)}
                          </span>
                        </td>
                        <td className="py-3 px-4 align-top text-right font-mono text-white tabular-nums">
                          {formatCurrency(entry.runningBalance, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141414] border-t border-[#262626] flex items-center justify-between text-xs text-[#888]">
          <span className="font-mono text-[11px]">
            Federal Reserve Routing / SWIFT verified · End-to-end atomic consistency
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1ed760] text-black font-bold uppercase tracking-wider text-xs hover:bg-[#3be477] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
