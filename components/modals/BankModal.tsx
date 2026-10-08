'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { BankAccount, BankAccountType, SUPPORTED_CURRENCIES, CurrencyCode } from '@/types/finance';
import { X, Landmark, ArrowRightLeft } from 'lucide-react';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankToEdit?: BankAccount | null;
}

export function BankModal({ isOpen, onClose, bankToEdit }: BankModalProps) {
  const { addBankAccount, updateBankAccount, portfolio } = usePortfolio();

  const [bankName, setBankName] = useState(() => bankToEdit?.bankName || '');
  const [accountType, setAccountType] = useState<BankAccountType>(() => bankToEdit?.accountType || 'Checking');
  const [accountNumberMasked, setAccountNumberMasked] = useState(() => bankToEdit?.accountNumberMasked || `••• ${Math.floor(1000 + Math.random() * 9000)}`);
  const [routingNumber, setRoutingNumber] = useState(() => bankToEdit?.routingNumber || '021000021');
  const [balance, setBalance] = useState<number>(() => bankToEdit?.balance ?? 25000);
  const [currency, setCurrency] = useState<CurrencyCode>(() => bankToEdit?.currency || portfolio?.user.currency || 'USD');
  const [interestRateApy, setInterestRateApy] = useState<number>(() => bankToEdit?.interestRateApy ?? 10.0);
  const [isPrimaryForAutoDebit, setIsPrimaryForAutoDebit] = useState(() => bankToEdit?.isPrimaryForAutoDebit ?? (portfolio?.bankAccounts.length === 0));
  const [overdraftProtectionEnabled, setOverdraftProtectionEnabled] = useState(() => bankToEdit?.overdraftProtectionEnabled ?? true);
  const [backupSweepBankId, setBackupSweepBankId] = useState<string>(() => bankToEdit?.backupSweepBankId || '');

  if (!isOpen) return null;

  const otherBanks = (portfolio?.bankAccounts || []).filter(b => b.id !== bankToEdit?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) return;

    const safeBalance = Math.max(0, isNaN(Number(balance)) ? 0 : Number(balance));
    const safeApy = Math.max(0, isNaN(Number(interestRateApy)) ? 0 : Number(interestRateApy));

    if (bankToEdit) {
      updateBankAccount({
        ...bankToEdit,
        bankName: bankName.trim(),
        accountType,
        accountNumberMasked,
        routingNumber: routingNumber.trim(),
        balance: safeBalance,
        currency,
        interestRateApy: safeApy,
        isPrimaryForAutoDebit,
        overdraftProtectionEnabled,
        backupSweepBankId: backupSweepBankId || undefined,
      });
    } else {
      addBankAccount({
        bankName: bankName.trim(),
        accountType,
        accountNumberMasked,
        routingNumber: routingNumber.trim(),
        balance: safeBalance,
        currency,
        interestRateApy: safeApy,
        isPrimaryForAutoDebit,
        overdraftProtectionEnabled,
        backupSweepBankId: backupSweepBankId || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-[#242424] border border-[#383838] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#333333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1ed760]/10 flex items-center justify-center text-[#1ed760]">
              <Landmark className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {bankToEdit ? 'Edit Bank Account' : 'Add Bank Vault Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#333333] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Institution Name *
            </label>
            <input
              type="text"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="e.g. JPMorgan Chase or Charles Schwab"
              className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white placeholder-[#7c7c7c] rounded-full border border-transparent focus:border-white focus:outline-none transition-all [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={e => setAccountType(e.target.value as BankAccountType)}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              >
                <option value="Checking">Checking</option>
                <option value="High-Yield Savings">High-Yield Savings</option>
                <option value="Savings">Savings</option>
                <option value="Business Checking">Business Checking</option>
                <option value="Forex Reserve">Forex Reserve</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Masked Account #
              </label>
              <input
                type="text"
                value={accountNumberMasked}
                onChange={e => setAccountNumberMasked(e.target.value)}
                placeholder="••• 4821"
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Routing / SWIFT #
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={e => setRoutingNumber(e.target.value)}
                placeholder="e.g. 021000021"
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Annual Yield (APY %)
              </label>
              <input
                type="number"
                step="0.05"
                value={interestRateApy}
                onChange={e => setInterestRateApy(Number(e.target.value))}
                placeholder="e.g. 4.8"
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Current Available Balance
            </label>
            <input
              type="number"
              value={balance}
              onChange={e => setBalance(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              required
            />
          </div>

          {/* Real Bank Overdraft & Sweep Protection Options */}
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2a2a2a] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Overdraft & Sweep Protection
                </span>
                <span className="text-[11px] text-[#888] block">
                  Prevents bounced EMI debits by automatically sweeping funds from secondary bank.
                </span>
              </div>
              <input
                type="checkbox"
                id="odCheck"
                checked={overdraftProtectionEnabled}
                onChange={e => setOverdraftProtectionEnabled(e.target.checked)}
                className="rounded bg-[#121212] border-[#383838] text-[#1ed760] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>

            {overdraftProtectionEnabled && otherBanks.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider mb-1">
                  Backup Sweep Account
                </label>
                <select
                  value={backupSweepBankId}
                  onChange={e => setBackupSweepBankId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg border border-[#333] focus:border-white focus:outline-none"
                >
                  <option value="">Any available account with balance</option>
                  {otherBanks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (Bal: ${Math.round(b.balance).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="primaryCheck"
              checked={isPrimaryForAutoDebit}
              onChange={e => setIsPrimaryForAutoDebit(e.target.checked)}
              className="rounded bg-[#121212] border-[#383838] text-[#1ed760] focus:ring-0"
            />
            <label htmlFor="primaryCheck" className="text-xs text-[#b3b3b3] cursor-pointer">
              Set as primary account for automatic EMI & expense deductions
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#b3b3b3] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider rounded-full shadow-md cursor-pointer transition-all"
            >
              {bankToEdit ? 'Save Changes' : 'Add Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TransferModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { transferFunds, portfolio } = usePortfolio();
  const [sourceId, setSourceId] = useState(() => portfolio?.bankAccounts[0]?.id || '');
  const [destId, setDestId] = useState(() => portfolio?.bankAccounts[1]?.id || portfolio?.bankAccounts[0]?.id || '');
  const [amount, setAmount] = useState<number>(5000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!sourceId || !destId || sourceId === destId) {
      setErrorMsg('Please select two distinct bank accounts.');
      return;
    }
    const res = transferFunds(sourceId, destId, Number(amount));
    if (!res.success) {
      setErrorMsg(res.error || 'Transfer failed');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#1ed760]" />
            <h3 className="text-sm font-semibold text-white">Transfer Funds Between Accounts</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">From Source Account</label>
            <select
              value={sourceId}
              onChange={e => setSourceId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#1ed760]"
            >
              {portfolio?.bankAccounts.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bankName} (Avail: ${b.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">To Destination Account</label>
            <select
              value={destId}
              onChange={e => setDestId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#1ed760]"
            >
              {portfolio?.bankAccounts.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bankName} (Current: ${b.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Transfer Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-[#1ed760]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-md"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
