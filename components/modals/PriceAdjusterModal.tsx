'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import {
  X,
  Search,
  SlidersHorizontal,
  Car,
  Building,
  Briefcase,
  TrendingUp,
  CreditCard,
  Receipt,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface PriceAdjusterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryFilter = 'all' | 'cars' | 'properties' | 'businesses' | 'growth' | 'liabilities' | 'inflows';

export function PriceAdjusterModal({ isOpen, onClose }: PriceAdjusterModalProps) {
  if (!isOpen) return null;
  return <PriceAdjusterModalContent onClose={onClose} />;
}

function PriceAdjusterModalContent({ onClose }: { onClose: () => void }) {
  const { portfolio, bulkUpdatePrices } = usePortfolio();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Price adjustment states initialized directly from portfolio
  const [carPrices, setCarPrices] = useState<Record<string, number>>(() => {
    const cp: Record<string, number> = {};
    portfolio?.cars.forEach(c => { cp[c.id] = c.currentValue; });
    return cp;
  });

  const [propPrices, setPropPrices] = useState<Record<string, number>>(() => {
    const pp: Record<string, number> = {};
    portfolio?.properties.forEach(p => { pp[p.id] = p.currentValue; });
    return pp;
  });

  const [bizValuations, setBizValuations] = useState<Record<string, number>>(() => {
    const bp: Record<string, number> = {};
    (portfolio?.businesses || []).forEach(b => { bp[b.id] = b.valuation; });
    return bp;
  });

  const [branchValuations, setBranchValuations] = useState<Record<string, { valuation: number; businessId: string }>>(() => {
    const brp: Record<string, { valuation: number; businessId: string }> = {};
    (portfolio?.businesses || []).forEach(b => {
      (b.branches || []).forEach(br => {
        brp[br.id] = { valuation: br.valuation, businessId: b.id };
      });
    });
    return brp;
  });

  const [stockPrices, setStockPrices] = useState<Record<string, number>>(() => {
    const sp: Record<string, number> = {};
    portfolio?.stocks.forEach(s => { sp[s.id] = s.currentPrice; });
    return sp;
  });

  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>(() => {
    const crp: Record<string, number> = {};
    portfolio?.crypto.forEach(cr => { crp[cr.id] = cr.currentPrice; });
    return crp;
  });

  const [forexRates, setForexRates] = useState<Record<string, number>>(() => {
    const fxp: Record<string, number> = {};
    portfolio?.forex.forEach(fx => { fxp[fx.id] = fx.currentExchangeRate; });
    return fxp;
  });

  const [fdPrincipals, setFdPrincipals] = useState<Record<string, number>>(() => {
    const fdp: Record<string, number> = {};
    portfolio?.fixedDeposits.forEach(f => { fdp[f.id] = f.principal; });
    return fdp;
  });

  const [emiPrincipals, setEmiPrincipals] = useState<Record<string, number>>(() => {
    const ep: Record<string, number> = {};
    portfolio?.emis.forEach(e => { ep[e.id] = e.remainingPrincipal; });
    return ep;
  });

  const [expenseAmounts, setExpenseAmounts] = useState<Record<string, number>>(() => {
    const expp: Record<string, number> = {};
    portfolio?.recurringExpenses.forEach(exp => { expp[exp.id] = exp.monthlyAmount; });
    return expp;
  });

  const [incomeAmounts, setIncomeAmounts] = useState<Record<string, number>>(() => {
    const incp: Record<string, number> = {};
    portfolio?.incomeSources.forEach(inc => { incp[inc.id] = inc.monthlyAmount; });
    return incp;
  });

  if (!portfolio) return null;

  const currency = portfolio.user.currency || 'USD';

  // Apply a bulk percentage adjustment to the currently visible items or active category
  const handleBulkPercent = (percent: number) => {
    const factor = 1 + percent / 100;

    if (activeCategory === 'all' || activeCategory === 'cars') {
      setCarPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(0, Math.round(next[id] * factor));
        });
        return next;
      });
    }

    if (activeCategory === 'all' || activeCategory === 'properties') {
      setPropPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(0, Math.round(next[id] * factor));
        });
        return next;
      });
    }

    if (activeCategory === 'all' || activeCategory === 'businesses') {
      setBizValuations(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(0, Math.round(next[id] * factor));
        });
        return next;
      });
      setBranchValuations(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = { ...next[id], valuation: Math.max(0, Math.round(next[id].valuation * factor)) };
        });
        return next;
      });
    }

    if (activeCategory === 'all' || activeCategory === 'growth') {
      setStockPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(0.01, +(next[id] * factor).toFixed(2));
        });
        return next;
      });
      setCryptoPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(0.0001, +(next[id] * factor).toFixed(4));
        });
        return next;
      });
    }

    if (activeCategory === 'all' || activeCategory === 'liabilities') {
      setEmiPrincipals(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(0, Math.round(next[id] * factor));
        });
        return next;
      });
      setExpenseAmounts(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(0, Math.round(next[id] * factor));
        });
        return next;
      });
    }

    if (activeCategory === 'all' || activeCategory === 'inflows') {
      setIncomeAmounts(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(0, Math.round(next[id] * factor));
        });
        return next;
      });
    }
  };

  // Reset to original portfolio values
  const handleResetToCurrent = () => {
    const cp: Record<string, number> = {};
    portfolio.cars.forEach(c => { cp[c.id] = c.currentValue; });
    setCarPrices(cp);

    const pp: Record<string, number> = {};
    portfolio.properties.forEach(p => { pp[p.id] = p.currentValue; });
    setPropPrices(pp);

    const bp: Record<string, number> = {};
    const brp: Record<string, { valuation: number; businessId: string }> = {};
    (portfolio.businesses || []).forEach(b => {
      bp[b.id] = b.valuation;
      (b.branches || []).forEach(br => {
        brp[br.id] = { valuation: br.valuation, businessId: b.id };
      });
    });
    setBizValuations(bp);
    setBranchValuations(brp);

    const sp: Record<string, number> = {};
    portfolio.stocks.forEach(s => { sp[s.id] = s.currentPrice; });
    setStockPrices(sp);

    const crp: Record<string, number> = {};
    portfolio.crypto.forEach(cr => { crp[cr.id] = cr.currentPrice; });
    setCryptoPrices(crp);

    const fxp: Record<string, number> = {};
    portfolio.forex.forEach(fx => { fxp[fx.id] = fx.currentExchangeRate; });
    setForexRates(fxp);

    const fdp: Record<string, number> = {};
    portfolio.fixedDeposits.forEach(f => { fdp[f.id] = f.principal; });
    setFdPrincipals(fdp);

    const ep: Record<string, number> = {};
    portfolio.emis.forEach(e => { ep[e.id] = e.remainingPrincipal; });
    setEmiPrincipals(ep);

    const expp: Record<string, number> = {};
    portfolio.recurringExpenses.forEach(exp => { expp[exp.id] = exp.monthlyAmount; });
    setExpenseAmounts(expp);

    const incp: Record<string, number> = {};
    portfolio.incomeSources.forEach(inc => { incp[inc.id] = inc.monthlyAmount; });
    setIncomeAmounts(incp);
  };

  // Save changes
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const carUpdates = Object.entries(carPrices).map(([id, currentValue]) => ({ id, currentValue }));
    const propUpdates = Object.entries(propPrices).map(([id, currentValue]) => ({ id, currentValue }));
    const bizUpdates = Object.entries(bizValuations).map(([id, valuation]) => ({ id, valuation }));
    const branchUpdates = Object.entries(branchValuations).map(([branchId, item]) => ({
      branchId,
      businessId: item.businessId,
      valuation: item.valuation,
    }));
    const stockUpdates = Object.entries(stockPrices).map(([id, currentPrice]) => ({ id, currentPrice }));
    const cryptoUpdates = Object.entries(cryptoPrices).map(([id, currentPrice]) => ({ id, currentPrice }));
    const forexUpdates = Object.entries(forexRates).map(([id, currentExchangeRate]) => ({ id, currentExchangeRate }));
    const fdUpdates = Object.entries(fdPrincipals).map(([id, principal]) => ({ id, principal }));
    const emiUpdates = Object.entries(emiPrincipals).map(([id, remainingPrincipal]) => ({ id, remainingPrincipal }));
    const expenseUpdates = Object.entries(expenseAmounts).map(([id, monthlyAmount]) => ({ id, monthlyAmount }));
    const incomeUpdates = Object.entries(incomeAmounts).map(([id, monthlyAmount]) => ({ id, monthlyAmount }));

    bulkUpdatePrices({
      cars: carUpdates,
      properties: propUpdates,
      businesses: bizUpdates,
      branches: branchUpdates,
      stocks: stockUpdates,
      crypto: cryptoUpdates,
      forex: forexUpdates,
      fixedDeposits: fdUpdates,
      emis: emiUpdates,
      recurringExpenses: expenseUpdates,
      incomeSources: incomeUpdates,
    });

    setSuccessMessage('All asset and liability prices successfully recalculated and updated!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const q = search.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-[#282828] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#282828] flex items-center justify-between shrink-0 bg-[#202020]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 flex items-center justify-center text-[#1ed760]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Quick Price & Valuation Adjuster</span>
                <span className="text-[10px] bg-[#1ed760] text-black font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Engine
                </span>
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Directly adjust current market values of any asset, enterprise, branch, or liability.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white p-2 rounded-full hover:bg-[#282828] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Category Pills & Percentage Tweakers */}
        <div className="p-4 border-b border-[#282828] bg-[#141414] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {(
              [
                { id: 'all', label: 'All Items' },
                { id: 'cars', label: 'Cars' },
                { id: 'properties', label: 'Real Estate' },
                { id: 'businesses', label: 'Businesses & Branches' },
                { id: 'growth', label: 'Stocks & Crypto' },
                { id: 'liabilities', label: 'Debt & Bills' },
                { id: 'inflows', label: 'Salaries & Inflows' },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === tab.id
                    ? 'bg-white text-black'
                    : 'bg-[#242424] text-[#b3b3b3] hover:text-white hover:bg-[#2e2e2e]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Bulk % Adjusters */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <span className="text-[11px] text-[#b3b3b3] hidden md:inline">Shift Values:</span>
            <button
              type="button"
              onClick={() => handleBulkPercent(5)}
              className="px-2.5 py-1 rounded bg-[#1ed760]/10 hover:bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30 text-xs font-bold font-mono transition-colors"
              title="Increase visible items by +5%"
            >
              +5%
            </button>
            <button
              type="button"
              onClick={() => handleBulkPercent(10)}
              className="px-2.5 py-1 rounded bg-[#1ed760]/10 hover:bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30 text-xs font-bold font-mono transition-colors"
              title="Increase visible items by +10%"
            >
              +10%
            </button>
            <button
              type="button"
              onClick={() => handleBulkPercent(-5)}
              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold font-mono transition-colors"
              title="Decrease visible items by -5%"
            >
              -5%
            </button>
            <button
              type="button"
              onClick={() => handleBulkPercent(-10)}
              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold font-mono transition-colors"
              title="Decrease visible items by -10%"
            >
              -10%
            </button>
            <button
              type="button"
              onClick={handleResetToCurrent}
              className="p-1.5 rounded hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-colors"
              title="Reset to current portfolio state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search bar inside modal */}
        <div className="px-4 py-2 bg-[#181818] border-b border-[#282828]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by name, model, ticker, or location..."
              className="w-full bg-[#121212] border border-[#282828] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#727272] focus:outline-none focus:border-[#1ed760]"
            />
          </div>
        </div>

        {/* Scrollable Items Form */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {successMessage && (
            <div className="p-3 bg-[#1ed760]/10 border border-[#1ed760]/30 rounded-lg flex items-center gap-2 text-xs text-[#1ed760] font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Cars Group */}
          {(activeCategory === 'all' || activeCategory === 'cars') && portfolio.cars.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
                <Car className="w-4 h-4 text-[#1ed760]" />
                <span>Vehicle Fleet ({portfolio.cars.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolio.cars
                  .filter(c => !q || c.make.toLowerCase().includes(q) || c.model.toLowerCase().includes(q))
                  .map(car => (
                    <div
                      key={car.id}
                      className="bg-[#202020] border border-[#282828] rounded-lg p-3 flex items-center justify-between gap-3 hover:border-[#383838] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold truncate">
                          {car.year} {car.make} {car.model}
                        </div>
                        <div className="text-[#888] text-[11px]">
                          Original Purchase: {formatCurrency(car.purchasePrice, currency)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#888] font-mono">{currency}</span>
                        <input
                          type="number"
                          value={carPrices[car.id] !== undefined ? carPrices[car.id] : car.currentValue}
                          onChange={e =>
                            setCarPrices(prev => ({ ...prev, [car.id]: Math.max(0, Number(e.target.value)) }))
                          }
                          className="w-28 bg-[#121212] border border-[#383838] focus:border-[#1ed760] rounded px-2 py-1 text-right text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Properties Group */}
          {(activeCategory === 'all' || activeCategory === 'properties') && portfolio.properties.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Real Estate ({portfolio.properties.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolio.properties
                  .filter(p => !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q))
                  .map(prop => (
                    <div
                      key={prop.id}
                      className="bg-[#202020] border border-[#282828] rounded-lg p-3 flex items-center justify-between gap-3 hover:border-[#383838] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold truncate">{prop.name}</div>
                        <div className="text-[#888] text-[11px] truncate">{prop.address}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#888] font-mono">{currency}</span>
                        <input
                          type="number"
                          value={propPrices[prop.id] !== undefined ? propPrices[prop.id] : prop.currentValue}
                          onChange={e =>
                            setPropPrices(prev => ({ ...prev, [prop.id]: Math.max(0, Number(e.target.value)) }))
                          }
                          className="w-32 bg-[#121212] border border-[#383838] focus:border-[#1ed760] rounded px-2 py-1 text-right text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Businesses & Branches Group */}
          {(activeCategory === 'all' || activeCategory === 'businesses') && (portfolio.businesses || []).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>Businesses & Branches ({(portfolio.businesses || []).length})</span>
              </div>
              <div className="space-y-3">
                {(portfolio.businesses || [])
                  .filter(b => !q || b.name.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q))
                  .map(biz => (
                    <div key={biz.id} className="bg-[#202020] border border-[#282828] rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-white text-sm font-bold">{biz.name}</div>
                          <div className="text-[11px] text-[#888]">
                            {biz.industry} · {biz.ownershipPercentage}% Ownership · {biz.branches?.length || 0} branches
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-[#888] font-mono">Valuation:</span>
                          <input
                            type="number"
                            value={bizValuations[biz.id] !== undefined ? bizValuations[biz.id] : biz.valuation}
                            onChange={e =>
                              setBizValuations(prev => ({ ...prev, [biz.id]: Math.max(0, Number(e.target.value)) }))
                            }
                            className="w-32 bg-[#121212] border border-[#383838] focus:border-[#1ed760] rounded px-2 py-1 text-right text-xs font-mono font-bold text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Branches sub-rows */}
                      {biz.branches && biz.branches.length > 0 && (
                        <div className="pl-4 border-l-2 border-[#383838] space-y-2 mt-2">
                          <div className="text-[10px] text-[#888] uppercase font-bold tracking-wider">
                            Branch Valuations
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {biz.branches.map(br => (
                              <div
                                key={br.id}
                                className="bg-[#181818] border border-[#2e2e2e] rounded p-2 flex items-center justify-between gap-2"
                              >
                                <span className="text-xs text-[#ccc] truncate">{br.name}</span>
                                <input
                                  type="number"
                                  value={
                                    branchValuations[br.id]?.valuation !== undefined
                                      ? branchValuations[br.id].valuation
                                      : br.valuation
                                  }
                                  onChange={e =>
                                    setBranchValuations(prev => ({
                                      ...prev,
                                      [br.id]: { valuation: Math.max(0, Number(e.target.value)), businessId: biz.id },
                                    }))
                                  }
                                  className="w-24 bg-[#101010] border border-[#383838] rounded px-1.5 py-0.5 text-right text-xs font-mono text-[#1ed760] font-semibold focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Stocks & Crypto Group */}
          {(activeCategory === 'all' || activeCategory === 'growth') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Liquid Growth Assets (Stocks, Crypto, Forex)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolio.stocks
                  .filter(s => !q || s.ticker.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q))
                  .map(stock => (
                    <div
                      key={stock.id}
                      className="bg-[#202020] border border-[#282828] rounded-lg p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold font-mono">{stock.ticker}</div>
                        <div className="text-[#888] text-[11px] truncate">
                          {stock.companyName} · {stock.shares} shares
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#888] font-mono">$/share</span>
                        <input
                          type="number"
                          step="0.01"
                          value={stockPrices[stock.id] !== undefined ? stockPrices[stock.id] : stock.currentPrice}
                          onChange={e =>
                            setStockPrices(prev => ({ ...prev, [stock.id]: Math.max(0.01, Number(e.target.value)) }))
                          }
                          className="w-24 bg-[#121212] border border-[#383838] focus:border-[#1ed760] rounded px-2 py-1 text-right text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}

                {portfolio.crypto
                  .filter(c => !q || c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
                  .map(coin => (
                    <div
                      key={coin.id}
                      className="bg-[#202020] border border-[#282828] rounded-lg p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold font-mono">{coin.symbol}</div>
                        <div className="text-[#888] text-[11px] truncate">
                          {coin.name} · {coin.quantity} tokens
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#888] font-mono">$/token</span>
                        <input
                          type="number"
                          step="0.001"
                          value={cryptoPrices[coin.id] !== undefined ? cryptoPrices[coin.id] : coin.currentPrice}
                          onChange={e =>
                            setCryptoPrices(prev => ({ ...prev, [coin.id]: Math.max(0.0001, Number(e.target.value)) }))
                          }
                          className="w-24 bg-[#121212] border border-[#383838] focus:border-[#1ed760] rounded px-2 py-1 text-right text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Debt & Liabilities Group */}
          {(activeCategory === 'all' || activeCategory === 'liabilities') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <span>Liabilities & Outflows</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolio.emis
                  .filter(e => !q || e.name.toLowerCase().includes(q) || e.loanType.toLowerCase().includes(q))
                  .map(emi => (
                    <div
                      key={emi.id}
                      className="bg-[#202020] border border-[#282828] rounded-lg p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold truncate">{emi.name}</div>
                        <div className="text-[#888] text-[11px]">
                          {emi.loanType} · {emi.interestRateYearly}% APR
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#888] font-mono">Principal</span>
                        <input
                          type="number"
                          value={emiPrincipals[emi.id] !== undefined ? emiPrincipals[emi.id] : emi.remainingPrincipal}
                          onChange={e =>
                            setEmiPrincipals(prev => ({ ...prev, [emi.id]: Math.max(0, Number(e.target.value)) }))
                          }
                          className="w-28 bg-[#121212] border border-[#383838] focus:border-[#1ed760] rounded px-2 py-1 text-right text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}

                {portfolio.recurringExpenses
                  .filter(exp => !q || exp.name.toLowerCase().includes(q))
                  .map(exp => (
                    <div
                      key={exp.id}
                      className="bg-[#202020] border border-[#282828] rounded-lg p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold truncate">{exp.name}</div>
                        <div className="text-[#888] text-[11px]">{exp.category} Expense</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#888] font-mono">/month</span>
                        <input
                          type="number"
                          value={expenseAmounts[exp.id] !== undefined ? expenseAmounts[exp.id] : exp.monthlyAmount}
                          onChange={e =>
                            setExpenseAmounts(prev => ({ ...prev, [exp.id]: Math.max(0, Number(e.target.value)) }))
                          }
                          className="w-24 bg-[#121212] border border-[#383838] focus:border-[#1ed760] rounded px-2 py-1 text-right text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Inflows Group */}
          {(activeCategory === 'all' || activeCategory === 'inflows') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Salaries & Inflow Sources</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolio.incomeSources
                  .filter(inc => !q || inc.name.toLowerCase().includes(q))
                  .map(inc => (
                    <div
                      key={inc.id}
                      className="bg-[#202020] border border-[#282828] rounded-lg p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold truncate">{inc.name}</div>
                        <div className="text-[#888] text-[11px]">{inc.sourceType}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#888] font-mono">/month</span>
                        <input
                          type="number"
                          value={incomeAmounts[inc.id] !== undefined ? incomeAmounts[inc.id] : inc.monthlyAmount}
                          onChange={e =>
                            setIncomeAmounts(prev => ({ ...prev, [inc.id]: Math.max(0, Number(e.target.value)) }))
                          }
                          className="w-28 bg-[#121212] border border-[#383838] focus:border-[#1ed760] rounded px-2 py-1 text-right text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#282828] bg-[#1a1a1a] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-[#444] text-white text-xs font-bold hover:border-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider transition-all transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Apply & Recalculate All Prices</span>
          </button>
        </div>
      </div>
    </div>
  );
}
