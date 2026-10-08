'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { BusinessAsset } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import { X, Briefcase, Landmark, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessToEdit?: BusinessAsset | null;
}

export function BusinessModal({ isOpen, onClose, businessToEdit }: BusinessModalProps) {
  const { addBusiness, updateBusiness, portfolio } = usePortfolio();

  const [name, setName] = useState(() => businessToEdit?.name || '');
  const [industry, setIndustry] = useState(() => businessToEdit?.industry || 'Supply Chain & Freight Tech');
  const [valuation, setValuation] = useState<number>(() => businessToEdit?.valuation ?? 500000);
  const [ownershipPercentage, setOwnershipPercentage] = useState<number>(
    () => businessToEdit?.ownershipPercentage ?? 100
  );
  const [purchaseCost, setPurchaseCost] = useState<number>(() =>
    businessToEdit ? 0 : 250000
  );
  const [fundingBankId, setFundingBankId] = useState<string>(
    () => portfolio?.bankAccounts[0]?.id || ''
  );
  const [annualGrowthRate, setAnnualGrowthRate] = useState<number>(
    () => businessToEdit?.annualGrowthRate ?? 12.0
  );
  const [monthlyNetProfit, setMonthlyNetProfit] = useState<number>(
    () => businessToEdit?.monthlyNetProfit ?? 10000
  );
  const [destinationBankId, setDestinationBankId] = useState<string>(
    () => businessToEdit?.destinationBankId || (portfolio?.bankAccounts[0]?.id || '')
  );
  const [reinvestProfits, setReinvestProfits] = useState<boolean>(
    () => businessToEdit?.reinvestProfits ?? false
  );
  const [incorporationYear, setIncorporationYear] = useState<number>(
    () => businessToEdit?.incorporationYear ?? 2024
  );
  const [registrationNumber, setRegistrationNumber] = useState(
    () => businessToEdit?.registrationNumber || ''
  );
  const [notes, setNotes] = useState(() => businessToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currency = portfolio?.user.currency || 'USD';
  const selectedFundingBank = portfolio?.bankAccounts.find(b => b.id === fundingBankId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Company name is required.');
      return;
    }

    if (businessToEdit) {
      updateBusiness({
        ...businessToEdit,
        name: name.trim(),
        industry: industry.trim() || 'General Enterprise',
        valuation: Number(valuation),
        ownershipPercentage: Math.min(100, Math.max(1, Number(ownershipPercentage))),
        annualGrowthRate: Number(annualGrowthRate),
        monthlyNetProfit: Number(monthlyNetProfit),
        destinationBankId: destinationBankId || undefined,
        reinvestProfits: Boolean(reinvestProfits),
        incorporationYear: Number(incorporationYear) || undefined,
        registrationNumber: registrationNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } else {
      const res = addBusiness(
        {
          name: name.trim(),
          industry: industry.trim() || 'General Enterprise',
          valuation: Number(valuation),
          ownershipPercentage: Math.min(100, Math.max(1, Number(ownershipPercentage))),
          annualGrowthRate: Number(annualGrowthRate),
          monthlyNetProfit: Number(monthlyNetProfit),
          destinationBankId: destinationBankId || undefined,
          reinvestProfits: Boolean(reinvestProfits),
          incorporationYear: Number(incorporationYear) || undefined,
          registrationNumber: registrationNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        [],
        fundingBankId,
        Number(purchaseCost)
      );

      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to acquire business enterprise');
        return;
      }
      onClose();
    }
  };

  const industriesList = [
    'Supply Chain & Freight Tech',
    'Specialty Beverage & Cafés',
    'Enterprise SaaS & Software',
    'E-Commerce & Direct-to-Consumer',
    'Commercial Real Estate Development',
    'Healthcare & Medical Practices',
    'Management Consulting & Advisory',
    'Franchise Retail',
    'Manufacturing & Industrial',
    'Automotive & Fleet Services',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#181818] border border-[#282828] w-full max-w-xl rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#282828]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-bold">
              <Briefcase className="w-4 h-4 fill-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {businessToEdit ? 'Edit Business Enterprise' : 'Register / Acquire New Business'}
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Manage company valuation, equity purchase price, bank deduction, and owner dividends
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

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Company / Entity Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Apex Global Logistics LLC"
              required
              className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white placeholder-[#7c7c7c] rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
            />
          </div>

          {/* Industry Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Industry / Sector
              </label>
              <input
                type="text"
                list="industries_datalist"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="Select or type industry..."
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white placeholder-[#7c7c7c] rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
              <datalist id="industries_datalist">
                {industriesList.map(i => (
                  <option key={i} value={i} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Ownership Equity Stake (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={ownershipPercentage}
                onChange={e => setOwnershipPercentage(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>
          </div>

          {/* Funding Bank & Acquisition Cost */}
          {!businessToEdit && (
            <div className="p-3.5 bg-[#121212] rounded-xl border border-[#282828] space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Acquisition Funding & Bank Deduction</span>
                {selectedFundingBank && (
                  <span className="text-[11px] font-mono text-[#1ed760]">
                    {formatCurrency(selectedFundingBank.balance, currency)} available
                  </span>
                )}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#b3b3b3] mb-1">
                    Pay Acquisition From Bank Vault
                  </label>
                  <select
                    value={fundingBankId}
                    onChange={e => setFundingBankId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#181818] text-white rounded-lg border border-[#333333] focus:border-white focus:outline-none"
                  >
                    {portfolio?.bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumberMasked}) — {formatCurrency(b.balance, currency)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#b3b3b3] mb-1">
                    Acquisition Cost / Capital Paid ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={purchaseCost}
                    onChange={e => setPurchaseCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#181818] text-white font-mono rounded-lg border border-[#333333] focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Valuation & Profit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Total Enterprise Valuation ($)
              </label>
              <input
                type="number"
                min={0}
                value={valuation}
                onChange={e => setValuation(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Monthly Net Profit / Dividend ($/mo)
              </label>
              <input
                type="number"
                min={0}
                value={monthlyNetProfit}
                onChange={e => setMonthlyNetProfit(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>
          </div>

          {/* Dividend Bank & Reinvestment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Dividend Payout Bank Account
              </label>
              <select
                value={destinationBankId}
                onChange={e => setDestinationBankId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-[#121212] text-white rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              >
                {portfolio?.bankAccounts.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} ({b.accountNumberMasked})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Annual Appreciation (% p.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={annualGrowthRate}
                onChange={e => setAnnualGrowthRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>
          </div>

          {/* Registration & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Incorporation Year
              </label>
              <input
                type="number"
                value={incorporationYear}
                onChange={e => setIncorporationYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Registration / EIN Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={e => setRegistrationNumber(e.target.value)}
                placeholder="e.g. CORP-US-99120"
                className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white font-mono rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Strategic Notes / Thesis
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Scaling regional expansion, B2B enterprise contracts..."
              className="w-full px-4 py-2.5 text-xs bg-[#121212] text-white rounded-full border border-transparent focus:border-white focus:outline-none [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#282828]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-[#4d4d4d] hover:border-white text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {businessToEdit ? 'Save Changes' : 'Confirm & Acquire Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
