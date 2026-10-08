'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { BusinessAsset, BusinessBranch, BranchStatus } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import { X, Store, MapPin, Users, DollarSign, Landmark, AlertCircle } from 'lucide-react';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessAsset;
  branchToEdit?: BusinessBranch | null;
}

export function BranchModal({ isOpen, onClose, business, branchToEdit }: BranchModalProps) {
  const { addBranch, updateBranch, portfolio } = usePortfolio();

  const [name, setName] = useState(() => branchToEdit?.name || '');
  const [location, setLocation] = useState(() => branchToEdit?.location || '');
  const [address, setAddress] = useState(() => branchToEdit?.address || '');
  const [managerName, setManagerName] = useState(() => branchToEdit?.managerName || '');
  const [employeeCount, setEmployeeCount] = useState<number>(() => branchToEdit?.employeeCount ?? 12);
  const [capitalInvested, setCapitalInvested] = useState<number>(() => branchToEdit?.capitalInvested ?? 150000);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(() => branchToEdit?.monthlyRevenue ?? 35000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(() => branchToEdit?.monthlyExpenses ?? 26000);
  const [valuation, setValuation] = useState<number>(() => branchToEdit?.valuation ?? 250000);
  const [status, setStatus] = useState<BranchStatus>(() => branchToEdit?.status || 'Active');
  const [fundingBankId, setFundingBankId] = useState<string>(
    () => portfolio?.bankAccounts[0]?.id || ''
  );
  const [notes, setNotes] = useState(() => branchToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !portfolio) return null;

  const currency = portfolio.user.currency;
  const selectedFundingBank = portfolio.bankAccounts.find(b => b.id === fundingBankId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !location.trim()) {
      setErrorMsg('Branch name and location are required.');
      return;
    }

    if (branchToEdit) {
      updateBranch(business.id, {
        ...branchToEdit,
        name: name.trim(),
        location: location.trim(),
        address: address.trim() || undefined,
        managerName: managerName.trim() || undefined,
        employeeCount: Number(employeeCount) || 0,
        capitalInvested: Number(capitalInvested) || 0,
        monthlyRevenue: Number(monthlyRevenue) || 0,
        monthlyExpenses: Number(monthlyExpenses) || 0,
        valuation: Number(valuation) || 0,
        status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } else {
      const res = addBranch(
        business.id,
        {
          name: name.trim(),
          location: location.trim(),
          address: address.trim() || undefined,
          managerName: managerName.trim() || undefined,
          employeeCount: Number(employeeCount) || 0,
          capitalInvested: Number(capitalInvested) || 0,
          monthlyRevenue: Number(monthlyRevenue) || 0,
          monthlyExpenses: Number(monthlyExpenses) || 0,
          valuation: Number(valuation) || 0,
          status,
          notes: notes.trim() || undefined,
        },
        fundingBankId
      );

      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to open branch');
        return;
      }
      onClose();
    }
  };

  const netMonthlyMargin = monthlyRevenue - monthlyExpenses;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="bg-[#181818] border border-[#282828] w-full max-w-lg rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#282828] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-bold">
              <Store className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {branchToEdit ? 'Edit Branch Location' : `Add Branch to ${business.name}`}
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Regional facility, retail storefront, warehouse hub, or operating location
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-600/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Expansion Failed: Insufficient Funds</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Branch Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Branch / Location Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Downtown Flagship Terminal"
                required
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white placeholder-[#7c7c7c] rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Operating Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as BranchStatus)}
                className="w-full px-3 py-2.5 text-xs bg-[#121212] text-white rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Expanding">Expanding</option>
                <option value="Renovating">Renovating</option>
                <option value="Planned">Planned</option>
              </select>
            </div>
          </div>

          {/* Location & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                City / Region *
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Chicago, IL (West Loop)"
                required
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white placeholder-[#7c7c7c] rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 1200 Logistics Way"
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white placeholder-[#7c7c7c] rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
          </div>

          {/* Manager & Headcount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Branch Manager / Lead
              </label>
              <input
                type="text"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white placeholder-[#7c7c7c] rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Staff Count (Headcount)
              </label>
              <input
                type="number"
                value={employeeCount}
                onChange={e => setEmployeeCount(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
          </div>

          {/* Monthly Financials */}
          <div className="p-3.5 bg-[#121212] rounded-xl border border-[#282828] space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Monthly Operational Cashflow
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#b3b3b3] mb-1">
                  Monthly Revenue ({currency})
                </label>
                <input
                  type="number"
                  value={monthlyRevenue}
                  onChange={e => setMonthlyRevenue(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 text-xs bg-[#181818] text-white font-mono rounded-lg border border-[#333333] focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#b3b3b3] mb-1">
                  Monthly Expenses ({currency})
                </label>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={e => setMonthlyExpenses(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 text-xs bg-[#181818] text-white font-mono rounded-lg border border-[#333333] focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#222222]">
              <span className="text-[#b3b3b3]">Net Monthly Operating Profit:</span>
              <span
                className={`font-mono font-bold ${
                  netMonthlyMargin >= 0 ? 'text-[#1ed760]' : 'text-[#f3727f]'
                }`}
              >
                {netMonthlyMargin >= 0 ? '+' : ''}{formatCurrency(Math.round(netMonthlyMargin), currency)}/mo
              </span>
            </div>
          </div>

          {/* Capital Invested & Valuation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Capital Invested ({currency})
              </label>
              <input
                type="number"
                value={capitalInvested}
                onChange={e => setCapitalInvested(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Branch Valuation ({currency})
              </label>
              <input
                type="number"
                value={valuation}
                onChange={e => setValuation(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
          </div>

          {/* Funding Bank Selector for New Branch */}
          {!branchToEdit && capitalInvested > 0 && (
            <div className="p-3.5 bg-[#121212] rounded-xl border border-[#282828] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#1ed760]" />
                  Funded from Bank Vault (Auto-Debit)
                </span>
                {selectedFundingBank && (
                  <span className="text-[11px] font-mono">
                    Available:{' '}
                    <span
                      className={
                        selectedFundingBank.balance >= capitalInvested
                          ? 'text-[#1ed760] font-bold'
                          : 'text-rose-400 font-bold'
                      }
                    >
                      {formatCurrency(selectedFundingBank.balance, currency)}
                    </span>
                  </span>
                )}
              </div>
              <select
                value={fundingBankId}
                onChange={e => setFundingBankId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#181818] text-white rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
              >
                {portfolio.bankAccounts.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} ({b.accountType}) — {formatCurrency(b.balance, currency)} available
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Branch Notes / Specifics
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Lease expiration, square footage, equipment..."
              className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white placeholder-[#7c7c7c] rounded-xl border border-[#333] focus:border-[#1ed760] focus:outline-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#282828]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#4d4d4d] hover:border-white text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {branchToEdit ? 'Save Branch' : 'Add Branch Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
