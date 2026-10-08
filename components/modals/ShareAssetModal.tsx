'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency, calculateSummaryMetrics } from '@/lib/initial-data';
import { SharedFinancialData } from '@/types/finance';
import {
  X,
  Share2,
  Car,
  Building,
  Briefcase,
  TrendingUp,
  Coins,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';

interface ShareAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUsername?: string;
  onShare: (data: SharedFinancialData) => void;
}

export function ShareAssetModal({
  isOpen,
  onClose,
  recipientUsername = '',
  onShare,
}: ShareAssetModalProps) {
  const { portfolio } = usePortfolio();
  const [category, setCategory] = useState<'car' | 'property' | 'business' | 'stock' | 'stats'>('car');

  if (!isOpen || !portfolio) return null;

  const currency = portfolio.user.currency || 'USD';
  const metrics = calculateSummaryMetrics(portfolio);

  const handleShareCar = (car: any) => {
    onShare({
      type: 'car',
      title: `${car.year} ${car.make} ${car.model}`,
      subtitle: `${car.condition || 'Prestige'} · ${car.vehicleType || 'Vehicle'}`,
      amount: car.currentValue,
      currency,
      imageUrl: car.imageUrl,
      details: {
        purchasePrice: formatCurrency(car.purchasePrice, currency),
        insurance: `${formatCurrency(car.monthlyInsuranceCost, currency)}/mo`,
        licensePlate: car.licensePlate || 'PRIVATE',
      },
    });
    onClose();
  };

  const handleShareProperty = (prop: any) => {
    onShare({
      type: 'property',
      title: prop.name,
      subtitle: `${prop.propertyType} · ${prop.address}`,
      amount: prop.currentValue,
      currency,
      imageUrl: prop.imageUrl,
      details: {
        rentalIncome: prop.isRented ? `+${formatCurrency(prop.monthlyRentalIncome, currency)}/mo rent` : 'Owner-Occupied',
        appreciation: `+${prop.annualAppreciationRate}% p.a.`,
        tenant: prop.tenantName || 'None',
      },
    });
    onClose();
  };

  const handleShareBusiness = (biz: any) => {
    onShare({
      type: 'business',
      title: biz.name,
      subtitle: `${biz.industry} · ${biz.ownershipPercentage}% Ownership`,
      amount: biz.valuation,
      currency,
      details: {
        monthlyProfit: `+${formatCurrency(biz.monthlyNetProfit, currency)}/mo profit`,
        growthRate: `+${biz.annualGrowthRate}% p.a.`,
        branches: `${biz.branches?.length || 0} active operating locations`,
      },
    });
    onClose();
  };

  const handleShareStock = (stk: any) => {
    onShare({
      type: 'stock',
      title: `${stk.companyName} (${stk.ticker})`,
      subtitle: `${stk.shares.toLocaleString()} shares held`,
      amount: stk.shares * stk.currentPrice,
      currency,
      details: {
        pricePerShare: formatCurrency(stk.currentPrice, currency),
        expectedGrowth: `+${stk.expectedAnnualGrowth}% p.a.`,
        dividendYield: `${stk.dividendYieldYearly}% yield`,
      },
    });
    onClose();
  };

  const handleShareStats = () => {
    onShare({
      type: 'stats',
      title: `${portfolio.user.fullName} Portfolio Snapshot`,
      subtitle: `Verified Wealth Ledger · Month ${portfolio.simulatedMonth}`,
      amount: metrics.netWorth,
      currency,
      details: {
        totalAssets: formatCurrency(metrics.totalAssets, currency),
        totalLiabilities: formatCurrency(metrics.totalLiabilities, currency),
        netCashflow: `${metrics.netMonthlyCashflow >= 0 ? '+' : ''}${formatCurrency(metrics.netMonthlyCashflow, currency)}/mo`,
        career: portfolio.user.occupationTitle || 'Executive',
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden my-6 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282828] bg-gradient-to-r from-purple-950 via-[#181818] to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Share2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Share Financial Data Card</span>
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Send an interactive asset spec card to <span className="text-white font-mono font-bold">@{recipientUsername}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#282828] hover:bg-[#383838] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1 p-2 mx-6 mt-4 bg-[#141414] rounded-xl border border-[#282828] overflow-x-auto text-xs">
          {[
            { id: 'car', label: `Cars (${portfolio.cars.length})`, icon: Car },
            { id: 'property', label: `Properties (${portfolio.properties.length})`, icon: Building },
            { id: 'business', label: `Businesses (${portfolio.businesses?.length || 0})`, icon: Briefcase },
            { id: 'stock', label: `Equities (${portfolio.stocks.length})`, icon: TrendingUp },
            { id: 'stats', label: 'Net Worth Card', icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  active ? 'bg-white text-black shadow-sm' : 'text-[#a7a7a7] hover:text-white hover:bg-[#222]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* List of items to share */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-3">
          {category === 'car' && (
            portfolio.cars.length === 0 ? (
              <p className="text-xs text-[#888] text-center py-6">No cars in fleet yet. Add a vehicle first.</p>
            ) : (
              portfolio.cars.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleShareCar(c)}
                  className="p-3.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#282828] hover:border-[#1ed760]/50 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1ed760]/10 border border-[#1ed760]/30 flex items-center justify-center text-[#1ed760]">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#1ed760] transition-colors">
                        {c.year} {c.make} {c.model}
                      </div>
                      <div className="text-[11px] text-[#888]">
                        Valuation: <span className="text-white font-mono">{formatCurrency(c.currentValue, currency)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-[#242424] group-hover:bg-[#1ed760] text-[#ccc] group-hover:text-black text-xs font-bold transition-colors">
                    Share Card
                  </button>
                </div>
              ))
            )
          )}

          {category === 'property' && (
            portfolio.properties.length === 0 ? (
              <p className="text-xs text-[#888] text-center py-6">No properties in portfolio yet. Add real estate first.</p>
            ) : (
              portfolio.properties.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleShareProperty(p)}
                  className="p-3.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#282828] hover:border-[#1ed760]/50 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#1ed760] transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[#888]">
                        {p.address} · <span className="text-white font-mono">{formatCurrency(p.currentValue, currency)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-[#242424] group-hover:bg-[#1ed760] text-[#ccc] group-hover:text-black text-xs font-bold transition-colors">
                    Share Card
                  </button>
                </div>
              ))
            )
          )}

          {category === 'business' && (
            (portfolio.businesses?.length || 0) === 0 ? (
              <p className="text-xs text-[#888] text-center py-6">No business enterprises yet. Add a business first.</p>
            ) : (
              portfolio.businesses.map(b => (
                <div
                  key={b.id}
                  onClick={() => handleShareBusiness(b)}
                  className="p-3.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#282828] hover:border-[#1ed760]/50 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#1ed760] transition-colors">
                        {b.name}
                      </div>
                      <div className="text-[11px] text-[#888]">
                        {b.industry} · <span className="text-white font-mono">{formatCurrency(b.valuation, currency)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-[#242424] group-hover:bg-[#1ed760] text-[#ccc] group-hover:text-black text-xs font-bold transition-colors">
                    Share Card
                  </button>
                </div>
              ))
            )
          )}

          {category === 'stock' && (
            portfolio.stocks.length === 0 ? (
              <p className="text-xs text-[#888] text-center py-6">No stock holdings yet. Add equities first.</p>
            ) : (
              portfolio.stocks.map(s => (
                <div
                  key={s.id}
                  onClick={() => handleShareStock(s)}
                  className="p-3.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#282828] hover:border-[#1ed760]/50 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#1ed760] transition-colors">
                        {s.companyName} ({s.ticker})
                      </div>
                      <div className="text-[11px] text-[#888]">
                        {s.shares} shares · <span className="text-white font-mono">{formatCurrency(s.shares * s.currentPrice, currency)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-[#242424] group-hover:bg-[#1ed760] text-[#ccc] group-hover:text-black text-xs font-bold transition-colors">
                    Share Card
                  </button>
                </div>
              ))
            )
          )}

          {category === 'stats' && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 via-[#181818] to-slate-900 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1ed760] uppercase tracking-wider">
                  Verified Net Worth Snapshot
                </span>
                <span className="text-xs text-[#888] font-mono">Month {portfolio.simulatedMonth}</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {formatCurrency(metrics.netWorth, currency)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#aaa] font-mono pt-2 border-t border-[#2a2a2a]">
                <div>Assets: <span className="text-white">{formatCurrency(metrics.totalAssets, currency)}</span></div>
                <div>Debts: <span className="text-rose-400">{formatCurrency(metrics.totalLiabilities, currency)}</span></div>
                <div>Cashflow: <span className="text-[#1ed760]">+{formatCurrency(metrics.netMonthlyCashflow, currency)}/mo</span></div>
                <div>Fleet: <span className="text-white">{portfolio.cars.length} vehicles</span></div>
              </div>
              <button
                onClick={handleShareStats}
                className="w-full py-2.5 mt-2 bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 fill-black" />
                <span>Share Verified Snapshot in Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
