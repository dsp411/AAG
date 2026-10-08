'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { CarAsset, PropertyAsset, BusinessAsset } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import {
  X,
  Zap,
  Sparkles,
  Car,
  Building,
  Briefcase,
  Landmark,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface AssetUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: 'car' | 'property' | 'business';
  targetId?: string;
}

interface UpgradePreset {
  name: string;
  cost: number;
  description: string;
  valueBoostMultiplier: number;
  category: 'car' | 'property' | 'business';
}

const UPGRADE_PRESETS: UpgradePreset[] = [
  // Vehicle Upgrades
  {
    name: 'Stage 2 Twin-Turbo & ECU Remap',
    cost: 15000,
    description: '+180 Horsepower, high-flow exhaust, optimized torque curve & dyno tune',
    valueBoostMultiplier: 1.25,
    category: 'car',
  },
  {
    name: 'Full Ceramic Pro & Self-Healing PPF',
    cost: 6500,
    description: 'Lifetime hydrophobic shield, high-gloss finish, scratch protection',
    valueBoostMultiplier: 1.2,
    category: 'car',
  },
  {
    name: 'Bespoke Alcantara & Carbon Interior',
    cost: 12000,
    description: 'Hand-stitched leather, ambient fiber optics, carbon fiber dashboard',
    valueBoostMultiplier: 1.3,
    category: 'car',
  },
  {
    name: 'Armored Ballistic Protection B6 Package',
    cost: 65000,
    description: 'Bulletproof glass, reinforced chassis, run-flat tires, emergency air filtration',
    valueBoostMultiplier: 1.35,
    category: 'car',
  },
  {
    name: 'High-Altitude Avionics & Jet Overhaul',
    cost: 120000,
    description: 'Next-gen radar, satellite broadband, refurbished turbine core',
    valueBoostMultiplier: 1.4,
    category: 'car',
  },

  // Property Upgrades
  {
    name: 'Infinity Pool & Heated Spa Pavilion',
    cost: 45000,
    description: 'Saltwater filtration, LED mood lighting, imported travertine deck',
    valueBoostMultiplier: 1.35,
    category: 'property',
  },
  {
    name: 'Rooftop Solar Array & Tesla Powerwall Hub',
    cost: 28000,
    description: '15kW solar generation, off-grid battery storage, net metering yield',
    valueBoostMultiplier: 1.3,
    category: 'property',
  },
  {
    name: 'Chef Michelin Gourmet Kitchen Remodel',
    cost: 55000,
    description: 'Sub-Zero & Wolf appliances, quartzite waterfall island, custom cabinetry',
    valueBoostMultiplier: 1.4,
    category: 'property',
  },
  {
    name: 'Smart Home Automation & Biometric Security',
    cost: 18000,
    description: 'Integrated lighting, automated blinds, 4K thermal cameras, keyless locks',
    valueBoostMultiplier: 1.25,
    category: 'property',
  },
  {
    name: 'Luxury Penthouse Master Suite Extension',
    cost: 75000,
    description: 'Walk-in boutique closet, marble bathroom with sauna, panoramic terrace',
    valueBoostMultiplier: 1.45,
    category: 'property',
  },

  // Business Upgrades
  {
    name: 'Enterprise AI & Robotic Process Automation',
    cost: 50000,
    description: 'Automates customer workflows, reduces operating cost, boosts throughput',
    valueBoostMultiplier: 1.5,
    category: 'business',
  },
  {
    name: 'Nationwide Multi-Channel Marketing Blitz',
    cost: 35000,
    description: 'Targeted ad campaigns, influencer sponsorships, conversion optimization',
    valueBoostMultiplier: 1.4,
    category: 'business',
  },
  {
    name: 'Cloud Infrastructure & High-Security SOC2',
    cost: 25000,
    description: 'Multi-region redundancy, zero-trust security architecture, API speedup',
    valueBoostMultiplier: 1.35,
    category: 'business',
  },
  {
    name: 'Logistics Fleet Expansion & Warehouse Hub',
    cost: 100000,
    description: 'Acquires commercial delivery vans and leases centralized fulfillment space',
    valueBoostMultiplier: 1.4,
    category: 'business',
  },
];

export function AssetUpgradeModal({
  isOpen,
  onClose,
  targetType = 'car',
  targetId,
}: AssetUpgradeModalProps) {
  const { portfolio, upgradeCar, upgradeProperty, investInBusiness } = usePortfolio();

  const [assetType, setAssetType] = useState<'car' | 'property' | 'business'>(() => targetType);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(() => {
    if (targetId) return targetId;
    if (targetType === 'property') return portfolio?.properties[0]?.id || '';
    if (targetType === 'business') return (portfolio?.businesses || [])[0]?.id || '';
    return portfolio?.cars[0]?.id || '';
  });
  const [upgradeName, setUpgradeName] = useState<string>('');
  const [upgradeCost, setUpgradeCost] = useState<number>(15000);
  const [fundingBankId, setFundingBankId] = useState<string>(() => portfolio?.bankAccounts[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !portfolio) return null;

  const currency = portfolio.user.currency;
  const selectedBank = portfolio.bankAccounts.find(b => b.id === fundingBankId) || portfolio.bankAccounts[0];

  const filteredPresets = UPGRADE_PRESETS.filter(p => p.category === assetType);

  const applyPreset = (preset: UpgradePreset) => {
    setUpgradeName(preset.name);
    setUpgradeCost(preset.cost);
    setErrorMsg(null);
  };

  const handleExecuteUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedAssetId) {
      setErrorMsg('Please select an asset to upgrade.');
      return;
    }
    if (!upgradeName.trim()) {
      setErrorMsg('Please provide an upgrade title or select a preset.');
      return;
    }
    if (upgradeCost <= 0) {
      setErrorMsg('Upgrade cost must be greater than $0.');
      return;
    }
    if (!selectedBank) {
      setErrorMsg('Please choose a valid bank account.');
      return;
    }
    if (selectedBank.balance < upgradeCost) {
      setErrorMsg(
        `Insufficient funds in ${selectedBank.bankName}. Available: ${formatCurrency(
          selectedBank.balance,
          currency
        )}, Required: ${formatCurrency(upgradeCost, currency)}.`
      );
      return;
    }

    let result: { success: boolean; error?: string } = { success: false };

    if (assetType === 'car') {
      result = upgradeCar(selectedAssetId, Number(upgradeCost), upgradeName.trim(), selectedBank.id);
    } else if (assetType === 'property') {
      result = upgradeProperty(selectedAssetId, Number(upgradeCost), upgradeName.trim(), selectedBank.id);
    } else if (assetType === 'business') {
      result = investInBusiness(
        selectedAssetId,
        Number(upgradeCost),
        selectedBank.id,
        undefined,
        `Asset Upgrade: ${upgradeName.trim()}`
      );
    }

    if (!result.success) {
      setErrorMsg(result.error || 'Upgrade operation failed.');
    } else {
      setSuccessMsg(
        `Successfully installed ${upgradeName}! ${formatCurrency(
          upgradeCost,
          currency
        )} deducted from ${selectedBank.bankName}. Asset valuation increased!`
      );
      setTimeout(() => {
        onClose();
      }, 1400);
    }
  };

  // Find active asset name
  const currentAsset =
    assetType === 'car'
      ? portfolio.cars.find(c => c.id === selectedAssetId)
      : assetType === 'property'
      ? portfolio.properties.find(p => p.id === selectedAssetId)
      : (portfolio.businesses || []).find(b => b.id === selectedAssetId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#202020] border border-[#383838] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.85)] overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030] bg-[#181818] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-black shadow-md">
              <Zap className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Asset Upgrade & Capital Modification
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30">
                  Bank Auto-Deduction
                </span>
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                Install high-performance modifications, renovations, or business tech upgrades
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#a0a0a0] hover:text-white hover:bg-[#303030] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleExecuteUpgrade} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[78vh]">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-600/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Upgrade Failed: Insufficient Funds</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-[#1ed760]/20 border border-[#1ed760]/50 rounded-xl flex items-start gap-2.5 text-xs text-[#1ed760] animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-[#1ed760] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Upgrade Installed & Ledger Updated!</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Category Switcher */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Select Asset Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAssetType('car');
                  setSelectedAssetId(portfolio.cars[0]?.id || '');
                  setUpgradeName('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  assetType === 'car'
                    ? 'bg-[#1ed760] text-black border-[#1ed760] shadow-md scale-[1.02]'
                    : 'bg-[#181818] text-[#b3b3b3] border-[#333] hover:text-white hover:bg-[#252525]'
                }`}
              >
                <Car className="w-4 h-4" />
                Vehicles ({portfolio.cars.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssetType('property');
                  setSelectedAssetId(portfolio.properties[0]?.id || '');
                  setUpgradeName('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  assetType === 'property'
                    ? 'bg-[#1ed760] text-black border-[#1ed760] shadow-md scale-[1.02]'
                    : 'bg-[#181818] text-[#b3b3b3] border-[#333] hover:text-white hover:bg-[#252525]'
                }`}
              >
                <Building className="w-4 h-4" />
                Real Estate ({portfolio.properties.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssetType('business');
                  setSelectedAssetId((portfolio.businesses || [])[0]?.id || '');
                  setUpgradeName('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  assetType === 'business'
                    ? 'bg-[#1ed760] text-black border-[#1ed760] shadow-md scale-[1.02]'
                    : 'bg-[#181818] text-[#b3b3b3] border-[#333] hover:text-white hover:bg-[#252525]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Businesses ({(portfolio.businesses || []).length})
              </button>
            </div>
          </div>

          {/* Select Specific Asset */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Target Asset to Upgrade
            </label>
            <select
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none"
              required
            >
              <option value="" disabled>
                -- Choose an asset --
              </option>
              {assetType === 'car' &&
                portfolio.cars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.year} {c.make} {c.model}) — Current Value: {formatCurrency(c.currentValue, currency)}
                  </option>
                ))}
              {assetType === 'property' &&
                portfolio.properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.propertyType}) — Current Value: {formatCurrency(p.currentValue, currency)}
                  </option>
                ))}
              {assetType === 'business' &&
                (portfolio.businesses || []).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.industry}) — Equity Value: {formatCurrency(b.valuation * (b.ownershipPercentage / 100), currency)}
                  </option>
                ))}
            </select>
          </div>

          {/* Upgrade Presets Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
                Recommended High-Yield Upgrades
              </label>
              <span className="text-[11px] text-[#a0a0a0]">Click to select package</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredPresets.map((preset, idx) => {
                const isSelected = upgradeName === preset.name;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#282828] border-[#1ed760] ring-1 ring-[#1ed760]'
                        : 'bg-[#151515] border-[#2e2e2e] hover:border-[#444] hover:bg-[#1c1c1c]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                        <span className="text-xs font-mono font-bold text-[#1ed760] shrink-0">
                          {formatCurrency(preset.cost, currency)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a0a0a0] line-clamp-2 mt-1">
                        {preset.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#252525] text-[10px] text-[#1ed760] font-semibold">
                      <span>Valuation Multiplier:</span>
                      <span className="font-mono">+{Math.round((preset.valueBoostMultiplier - 1) * 100)}% ROI</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Upgrade Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Upgrade Package Title *
              </label>
              <input
                type="text"
                value={upgradeName}
                onChange={e => setUpgradeName(e.target.value)}
                placeholder="e.g. Carbon Aero Kit / Smart Solar Hub"
                className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#707070] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Modification Cost ({currency}) *
              </label>
              <input
                type="number"
                value={upgradeCost}
                onChange={e => setUpgradeCost(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Bank Auto-Deduction Vault Selector */}
          <div className="p-4 bg-[#141414] rounded-xl border border-[#383838] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-[#1ed760]" />
                Deduct Cost from Bank Account
              </span>
              {selectedBank && (
                <span className="text-xs font-mono">
                  Available:{' '}
                  <span
                    className={
                      selectedBank.balance >= upgradeCost ? 'text-[#1ed760] font-bold' : 'text-rose-400 font-bold'
                    }
                  >
                    {formatCurrency(selectedBank.balance, currency)}
                  </span>
                </span>
              )}
            </div>

            <select
              value={fundingBankId}
              onChange={e => setFundingBankId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#1c1c1c] text-white rounded-xl border border-[#444] focus:border-[#1ed760] focus:outline-none"
              required
            >
              {portfolio.bankAccounts.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bankName} ({b.accountType}) — {formatCurrency(b.balance, currency)} available
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between text-[11px] text-[#a0a0a0] pt-1">
              <span>Remaining Vault Balance After Upgrade:</span>
              <span
                className={`font-mono font-bold ${
                  (selectedBank?.balance || 0) - upgradeCost >= 0 ? 'text-white' : 'text-rose-400'
                }`}
              >
                {formatCurrency(Math.max(0, (selectedBank?.balance || 0) - upgradeCost), currency)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#303030]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#444] hover:border-white text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black" />
              Pay {formatCurrency(upgradeCost, currency)} & Install Upgrade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
