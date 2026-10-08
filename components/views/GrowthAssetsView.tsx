'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import { analyzePortfolioForInvestment } from '@/lib/investment-suggestions';
import {
  TrendingUp,
  Plus,
  Landmark,
  Coins,
  DollarSign,
  Briefcase,
  Trash2,
  Edit2,
  CheckCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  Building,
  ArrowUpRight,
  Check,
} from 'lucide-react';

interface GrowthAssetsViewProps {
  openAddAssetModal: (category: 'fd' | 'stock' | 'crypto' | 'forex' | 'income') => void;
  openEditModal: (type: 'fd' | 'stock' | 'crypto' | 'forex' | 'income', item: any) => void;
  openInvestmentSuggestions?: () => void;
}

export function GrowthAssetsView({
  openAddAssetModal,
  openEditModal,
  openInvestmentSuggestions,
}: GrowthAssetsViewProps) {
  const {
    portfolio,
    deleteFixedDeposit,
    deleteStock,
    deleteCrypto,
    deleteForex,
    deleteIncomeSource,
    addFixedDeposit,
    addStock,
    addCrypto,
  } = usePortfolio();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'suggestions' | 'fds' | 'stocks' | 'crypto' | 'forex' | 'incomes'>('all');
  const [suggestionStatus, setSuggestionStatus] = useState<string | null>(null);

  if (!portfolio) return null;

  const currency = portfolio.user.currency;
  const fds = portfolio.fixedDeposits;
  const stocks = portfolio.stocks;
  const crypto = portfolio.crypto;
  const forex = portfolio.forex;
  const incomes = portfolio.incomeSources;

  const totalFdVal = fds.reduce((sum, f) => sum + f.currentAccruedValue, 0);
  const totalStockVal = stocks.reduce((sum, s) => sum + s.shares * s.currentPrice, 0);
  const totalCryptoVal = crypto.reduce((sum, c) => sum + c.quantity * c.currentPrice, 0);
  const totalForexVal = forex.reduce((sum, f) => sum + f.amount * f.currentExchangeRate, 0);
  const totalMonthlyIncome = incomes.reduce((sum, i) => sum + i.monthlyAmount, 0);

  const totalGrowthVal = totalFdVal + totalStockVal + totalCryptoVal + totalForexVal;
  const yieldAnalysis = analyzePortfolioForInvestment(portfolio);

  return (
    <div className="space-y-6 pb-12">
      {/* Spotify Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-purple-900/60 via-[#181818] to-[#121212] p-6 rounded-lg">
        {/* Cover Art Tile */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-gradient-to-br from-purple-500 to-indigo-950 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0">
          <TrendingUp className="w-20 h-20 text-white" />
        </div>

        {/* Album Metadata */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
            Compounding Growth
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Appreciating Assets & FDs
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3]">
            <span className="text-white font-bold">{portfolio.user.fullName}</span>
            <span>·</span>
            <span className="font-mono text-[#1ed760] font-bold">
              {formatCurrency(totalGrowthVal, currency)} total holdings
            </span>
            <span>·</span>
            <span className="font-mono text-white font-bold">
              +{formatCurrency(totalMonthlyIncome, currency)}/mo compounding salary
            </span>
          </div>
        </div>
      </div>

      {/* Pill Actions */}
      <div className="flex items-center flex-wrap gap-3 px-2">
        <button
          onClick={() => {
            if (activeSubTab === 'stocks') openAddAssetModal('stock');
            else if (activeSubTab === 'crypto') openAddAssetModal('crypto');
            else if (activeSubTab === 'forex') openAddAssetModal('forex');
            else if (activeSubTab === 'incomes') openAddAssetModal('income');
            else openAddAssetModal('fd');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Investment</span>
        </button>

        <button
          onClick={() => {
            if (openInvestmentSuggestions) {
              openInvestmentSuggestions();
            } else {
              setActiveSubTab('suggestions');
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#282828] text-white hover:text-[#1ed760] border border-[#3e3e3e] hover:border-[#1ed760]/50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
          <span>Suggestions (+{yieldAnalysis.potentialPortfolioYield}%)</span>
        </button>
      </div>

      {/* Sub-tab pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#282828]">
        {[
          { id: 'all', label: `All Holdings (${fds.length + stocks.length + crypto.length + forex.length + incomes.length})` },
          { id: 'suggestions', label: `💡 High-Return Suggestions (${yieldAnalysis.recommendations.length})` },
          { id: 'fds', label: `Fixed Deposits (${fds.length})` },
          { id: 'stocks', label: `Equities (${stocks.length})` },
          { id: 'crypto', label: `Crypto (${crypto.length})` },
          { id: 'forex', label: `Foreign Currency (${forex.length})` },
          { id: 'incomes', label: `Salaries (${incomes.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeSubTab === tab.id
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Suggestion Feedback Toast */}
      {suggestionStatus && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{suggestionStatus}</span>
          </div>
          <button onClick={() => setSuggestionStatus(null)} className="text-[#a7a7a7] hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 0. High-Return Investment Suggestions Tab */}
      {activeSubTab === 'suggestions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Intelligence Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#181818] to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#1ed760] uppercase tracking-wider bg-[#1ed760]/15 border border-[#1ed760]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#1ed760]" />
                  Alpha Yield Optimizer
                </span>
                <span className="text-xs text-[#a7a7a7]">
                  {formatCurrency(yieldAnalysis.deployableCash, currency)} Deployable Surplus Available
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Suggested Investments: Maximize Your Yield
              </h3>
              <p className="text-xs text-[#b3b3b3] mt-0.5 max-w-xl">
                Deploying low-yield bank cash into high-compounding instruments boosts your weighted annual return from {yieldAnalysis.currentPortfolioYield}% to <span className="text-[#1ed760] font-bold">+{yieldAnalysis.potentialPortfolioYield}% APY</span>.
              </p>
            </div>

            {openInvestmentSuggestions && (
              <button
                onClick={openInvestmentSuggestions}
                className="px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(30,215,96,0.35)] shrink-0 self-start md:self-auto cursor-pointer hover:scale-105 active:scale-95"
              >
                Open Full Advisory Simulator
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yieldAnalysis.recommendations.map(opp => {
              const recommendedAmt = opp.recommendedAmount;
              const gain1Yr = opp.projectedAnnualReturn(recommendedAmt);
              const monthlyCash = opp.projectedMonthlyCashflow(recommendedAmt);

              let CategoryIcon = TrendingUp;
              if (opp.category === 'fd') CategoryIcon = ShieldCheck;
              if (opp.category === 'property') CategoryIcon = Building;
              if (opp.category === 'business') CategoryIcon = Briefcase;
              if (opp.category === 'crypto') CategoryIcon = Coins;

              const handleDeploy = () => {
                const primaryBank = portfolio.bankAccounts.find(b => b.isPrimaryForAutoDebit) || portfolio.bankAccounts[0];
                if (!primaryBank || primaryBank.balance < recommendedAmt) {
                  setSuggestionStatus(`Insufficient balance in ${primaryBank?.bankName || 'bank'}. Need ${formatCurrency(recommendedAmt, currency)}.`);
                  return;
                }

                if (opp.category === 'fd') {
                  const res = addFixedDeposit({
                    name: opp.autoPayload.data.name,
                    institution: opp.autoPayload.data.institution,
                    principal: recommendedAmt,
                    interestRateYearly: opp.expectedAnnualReturn,
                    compoundingFrequency: opp.autoPayload.data.compoundingFrequency,
                    startDate: new Date().toISOString().split('T')[0],
                    tenureMonths: opp.defaultTenureMonths || 12,
                    autoCreditBankId: primaryBank.id,
                  }, primaryBank.id);
                  if (res.success) {
                    setSuggestionStatus(`Successfully booked ${formatCurrency(recommendedAmt, currency)} in ${opp.title} at ${opp.expectedAnnualReturn}% APY!`);
                  }
                } else if (opp.category === 'stock') {
                  const sharePrice = opp.autoPayload.data.currentPrice || 100;
                  const shares = Math.max(1, Math.round(recommendedAmt / sharePrice));
                  const res = addStock({
                    ticker: opp.autoPayload.data.ticker,
                    companyName: opp.autoPayload.data.companyName,
                    shares,
                    buyPrice: sharePrice,
                    currentPrice: sharePrice,
                    expectedAnnualGrowth: opp.autoPayload.data.expectedAnnualGrowth,
                    dividendYieldYearly: opp.autoPayload.data.dividendYieldYearly,
                    autoCreditDividendsToBankId: primaryBank.id,
                  }, primaryBank.id);
                  if (res.success) {
                    setSuggestionStatus(`Purchased ${shares} shares of ${opp.autoPayload.data.ticker} for ${formatCurrency(recommendedAmt, currency)}!`);
                  }
                } else if (opp.category === 'crypto') {
                  const unitPrice = opp.autoPayload.data.currentPrice || 3000;
                  const quantity = Number((recommendedAmt / unitPrice).toFixed(4));
                  const res = addCrypto({
                    symbol: opp.autoPayload.data.symbol,
                    name: opp.autoPayload.data.name,
                    quantity,
                    buyPrice: unitPrice,
                    currentPrice: unitPrice,
                    expectedAnnualGrowth: opp.autoPayload.data.expectedAnnualGrowth,
                    stakingYieldYearly: opp.autoPayload.data.stakingYieldYearly,
                  }, primaryBank.id);
                  if (res.success) {
                    setSuggestionStatus(`Staked ${quantity} ${opp.autoPayload.data.symbol} for ${formatCurrency(recommendedAmt, currency)}!`);
                  }
                } else {
                  if (openInvestmentSuggestions) {
                    openInvestmentSuggestions();
                  }
                }
              };

              return (
                <div
                  key={opp.id}
                  className="p-5 rounded-2xl bg-[#181818] border border-[#282828] hover:border-[#383838] transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center shrink-0 text-[#1ed760]">
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-base font-bold text-white tracking-tight">
                            {opp.title}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opp.badgeColor}`}>
                            {opp.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#a7a7a7] mt-0.5">
                          {opp.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-[#1ed760] font-mono">
                        +{opp.expectedAnnualReturn}% <span className="text-[10px] font-normal text-[#a7a7a7]">p.a.</span>
                      </div>
                      {monthlyCash > 0 && (
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          +{formatCurrency(monthlyCash, currency)}/mo cashflow
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {opp.keyHighlights.slice(0, 3).map((hl, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#cccccc]">
                        <Check className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#262626] flex items-center justify-between gap-3">
                    <div className="text-xs text-[#a7a7a7]">
                      Deploy: <span className="text-white font-mono font-bold">{formatCurrency(recommendedAmt, currency)}</span>
                      <span className="text-[#1ed760] font-bold font-mono ml-1.5">(+{formatCurrency(gain1Yr, currency)}/yr)</span>
                    </div>

                    <button
                      onClick={handleDeploy}
                      className="px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3 h-3 fill-black" />
                      <span>1-Click Deploy</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Fixed Deposits Section */}
      {(activeSubTab === 'all' || activeSubTab === 'fds') && (
        <div className="bg-[#181818] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-400" />
              <span>Fixed Deposits (Compounded Interest)</span>
            </h3>
            <button
              onClick={() => openAddAssetModal('fd')}
              className="text-xs font-bold uppercase tracking-wider text-[#1ed760] hover:underline"
            >
              + Add FD
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fds.map(fd => {
              const interestEarned = fd.currentAccruedValue - fd.principal;
              const monthsLeft = Math.max(0, fd.tenureMonths - fd.monthsElapsed);
              const progressPct = Math.min(100, (fd.monthsElapsed / fd.tenureMonths) * 100);

              return (
                <div key={fd.id} className="p-4 bg-[#121212] rounded-lg space-y-3 border border-[#282828] hover:border-[#383838] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{fd.name}</h4>
                      <p className="text-xs text-[#b3b3b3]">{fd.institution} · {fd.compoundingFrequency} Compounding</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/20 px-2 py-0.5 rounded-full">
                      {fd.interestRateYearly}% p.a.
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2 bg-[#181818] rounded text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] block font-sans">Principal</span>
                      <span className="text-white">{formatCurrency(fd.principal, currency)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] block font-sans">Accrued Interest</span>
                      <span className="text-[#1ed760] font-bold">+{formatCurrency(interestEarned, currency)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] block font-sans">Maturity Value</span>
                      <span className="text-white font-bold">{formatCurrency(fd.currentAccruedValue, currency)}</span>
                    </div>
                  </div>

                  {/* Scrubber progress */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#b3b3b3] font-mono mb-1">
                      <span>Tenure: {fd.monthsElapsed}/{fd.tenureMonths} mos</span>
                      <span>{fd.isMatured ? 'Matured & Credited' : `${monthsLeft} mos remaining`}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#282828] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className={`h-full ${fd.isMatured ? 'bg-[#1ed760]' : 'bg-indigo-500'}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#282828]">
                    <span className="text-[#b3b3b3]">
                      Payout: {portfolio.bankAccounts.find(b => b.id === fd.autoCreditBankId)?.bankName || 'Primary Vault'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEditModal('fd', fd)} className="p-1 text-[#b3b3b3] hover:text-white">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteFixedDeposit(fd.id)} className="p-1 text-[#b3b3b3] hover:text-[#f3727f]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Equities & Stocks Table */}
      {(activeSubTab === 'all' || activeSubTab === 'stocks') && (
        <div className="bg-[#181818] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <span>Equities, Stocks & Global ETFs</span>
            </h3>
            <button
              onClick={() => openAddAssetModal('stock')}
              className="text-xs font-bold uppercase tracking-wider text-[#1ed760] hover:underline"
            >
              + Add Stock
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-[#282828] text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3 text-right">Shares</th>
                  <th className="py-2.5 px-3 text-right">Buy Price</th>
                  <th className="py-2.5 px-3 text-right">Current Price</th>
                  <th className="py-2.5 px-3 text-right">Market Value</th>
                  <th className="py-2.5 px-3 text-right">P&L</th>
                  <th className="py-2.5 px-3 text-right">Growth Yield</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282828]/40">
                {stocks.map(stk => {
                  const marketVal = stk.shares * stk.currentPrice;
                  const cost = stk.shares * stk.buyPrice;
                  const diff = marketVal - cost;

                  return (
                    <tr key={stk.id} className="hover:bg-[#242424] transition-colors group">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{stk.ticker}</div>
                        <div className="text-[11px] text-[#b3b3b3]">{stk.companyName}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white">{stk.shares}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#b3b3b3]">
                        {formatCurrency(stk.buyPrice, currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white font-bold">
                        {formatCurrency(stk.currentPrice, currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white font-bold">
                        {formatCurrency(marketVal, currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={diff >= 0 ? 'text-[#1ed760]' : 'text-[#f3727f]'}>
                          {diff >= 0 ? '+' : ''}{formatCurrency(diff, currency)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#1ed760] font-bold">
                        +{stk.expectedAnnualGrowth}%/yr
                        {stk.dividendYieldYearly > 0 && (
                          <span className="block text-[10px] text-[#b3b3b3]">
                            Div: {stk.dividendYieldYearly}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openEditModal('stock', stk)} className="p-1 text-[#b3b3b3] hover:text-white">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteStock(stk.id)} className="p-1 text-[#b3b3b3] hover:text-[#f3727f]">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Crypto Assets */}
      {(activeSubTab === 'all' || activeSubTab === 'crypto') && (
        <div className="bg-[#181818] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-purple-400" />
              <span>Crypto Holdings & Staking</span>
            </h3>
            <button
              onClick={() => openAddAssetModal('crypto')}
              className="text-xs font-bold uppercase tracking-wider text-[#1ed760] hover:underline"
            >
              + Add Crypto
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {crypto.map(cr => {
              const marketVal = cr.quantity * cr.currentPrice;
              const diff = marketVal - cr.quantity * cr.buyPrice;

              return (
                <div key={cr.id} className="p-4 bg-[#121212] rounded-lg border border-[#282828] hover:border-[#383838] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{cr.name}</h4>
                      <p className="text-xs text-[#b3b3b3] font-mono">{cr.symbol}</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-white">{formatCurrency(marketVal, currency)}</div>
                      <div className={`text-[10px] font-bold ${diff >= 0 ? 'text-[#1ed760]' : 'text-[#f3727f]'}`}>
                        {diff >= 0 ? '+' : ''}{formatCurrency(diff, currency)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 bg-[#181818] rounded text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] block font-sans">Coins</span>
                      <span className="text-white">{cr.quantity} {cr.symbol}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] block font-sans">Current Coin Price</span>
                      <span className="text-white">{formatCurrency(cr.currentPrice, currency)}</span>
                    </div>
                  </div>

                  {cr.stakingYieldYearly > 0 && (
                    <div className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded flex justify-between font-mono">
                      <span>Staking Yield</span>
                      <span className="font-bold">+{cr.stakingYieldYearly}% p.a.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#282828]">
                    <button onClick={() => openEditModal('crypto', cr)} className="p-1 text-[#b3b3b3] hover:text-white">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCrypto(cr.id)} className="p-1 text-[#b3b3b3] hover:text-[#f3727f]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Foreign Currencies (Forex) */}
      {(activeSubTab === 'all' || activeSubTab === 'forex') && (
        <div className="bg-[#181818] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              <span>Foreign Currency Holdings (Forex)</span>
            </h3>
            <button
              onClick={() => openAddAssetModal('forex')}
              className="text-xs font-bold uppercase tracking-wider text-[#1ed760] hover:underline"
            >
              + Add Forex
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {forex.map(fx => {
              const converted = fx.amount * fx.currentExchangeRate;

              return (
                <div key={fx.id} className="p-4 bg-[#121212] rounded-lg border border-[#282828] hover:border-[#383838] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{fx.currencyName}</h4>
                      <p className="text-xs text-[#b3b3b3] font-mono">{fx.amount.toLocaleString()} {fx.currencyCode}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-cyan-400">{formatCurrency(converted, currency)}</div>
                      <div className="text-[10px] text-[#b3b3b3] font-mono">Rate: {fx.currentExchangeRate}</div>
                    </div>
                  </div>

                  {fx.notes && (
                    <p className="text-xs text-[#b3b3b3] italic mt-1">&ldquo;{fx.notes}&rdquo;</p>
                  )}

                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#282828]">
                    <button onClick={() => openEditModal('forex', fx)} className="p-1 text-[#b3b3b3] hover:text-white">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteForex(fx.id)} className="p-1 text-[#b3b3b3] hover:text-[#f3727f]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Incomes & Salaries */}
      {(activeSubTab === 'all' || activeSubTab === 'incomes') && (
        <div className="bg-[#181818] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#1ed760]" />
              <span>Active Recurring Incomes (Appraising Salaries)</span>
            </h3>
            <button
              onClick={() => openAddAssetModal('income')}
              className="text-xs font-bold uppercase tracking-wider text-[#1ed760] hover:underline"
            >
              + Add Income
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incomes.map(inc => {
              const targetBank = portfolio.bankAccounts.find(b => b.id === inc.destinationBankId);

              return (
                <div key={inc.id} className="p-4 bg-[#121212] rounded-lg border border-[#282828] flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{inc.name}</h4>
                    <p className="text-xs text-[#b3b3b3] mt-0.5">
                      {inc.sourceType} · Credits {targetBank?.bankName || 'Primary Bank'}
                    </p>
                    {inc.annualAppraisalRate > 0 && (
                      <p className="text-xs text-[#1ed760] font-mono mt-1">
                        +{inc.annualAppraisalRate}% annual appraisal raise
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-mono text-[#1ed760]">
                      +{formatCurrency(inc.monthlyAmount, currency)}/mo
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <button onClick={() => openEditModal('income', inc)} className="p-1 text-[#b3b3b3] hover:text-white">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteIncomeSource(inc.id)} className="p-1 text-[#b3b3b3] hover:text-[#f3727f]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
