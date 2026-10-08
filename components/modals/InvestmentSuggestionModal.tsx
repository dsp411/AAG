'use client';

import React, { useState, useMemo } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import {
  analyzePortfolioForInvestment,
  InvestmentOpportunity,
  simulateInvestmentGrowth,
} from '@/lib/investment-suggestions';
import {
  X,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Building,
  Coins,
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  SlidersHorizontal,
  Flame,
  Zap,
  Check,
} from 'lucide-react';

interface InvestmentSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAssetModal?: (type: 'fd' | 'stock' | 'crypto' | 'property' | 'business', defaultData?: any) => void;
}

export function InvestmentSuggestionModal({
  isOpen,
  onClose,
  onOpenAssetModal,
}: InvestmentSuggestionModalProps) {
  const {
    portfolio,
    addFixedDeposit,
    addStock,
    addCrypto,
    addProperty,
    addBusiness,
  } = usePortfolio();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedFundingBankId, setSelectedFundingBankId] = useState<string>(() => {
    const primary =
      portfolio?.bankAccounts?.find(b => b.isPrimaryForAutoDebit) ||
      portfolio?.bankAccounts?.[0];
    return primary?.id || '';
  });
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [executionStatus, setExecutionStatus] = useState<{ id: string; message: string; success: boolean } | null>(null);

  // Simulator state
  const [simAmount, setSimAmount] = useState<number>(() => {
    if (!portfolio) return 10000;
    const a = analyzePortfolioForInvestment(portfolio);
    if (a?.deployableCash && a.deployableCash > 5000) {
      return Math.round(a.deployableCash * 0.5);
    }
    return 10000;
  });
  const [simYears, setSimYears] = useState<number>(3);
  const [simRate, setSimRate] = useState<number>(14.2);
  const [simStrategyName, setSimStrategyName] = useState<string>('Balanced High-Yield (14.2%)');

  const analysis = useMemo(() => {
    if (!portfolio) return null;
    return analyzePortfolioForInvestment(portfolio);
  }, [portfolio]);

  if (!isOpen || !portfolio || !analysis) return null;

  const currency = portfolio.user.currency;
  const bankAccounts = portfolio.bankAccounts || [];
  const selectedBank = bankAccounts.find(b => b.id === selectedFundingBankId) || bankAccounts[0];

  const filteredOpportunities = analysis.recommendations.filter(opp => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'guaranteed') return opp.category === 'fd';
    if (activeCategoryFilter === 'equities') return opp.category === 'stock';
    if (activeCategoryFilter === 'property') return opp.category === 'property';
    if (activeCategoryFilter === 'business') return opp.category === 'business';
    if (activeCategoryFilter === 'crypto') return opp.category === 'crypto';
    return true;
  });

  const getCustomOrRecommendedAmount = (opp: InvestmentOpportunity) => {
    if (customAmounts[opp.id] !== undefined) return customAmounts[opp.id];
    // If deployable cash is less than default recommended, scale down to what's available
    const available = selectedBank ? selectedBank.balance : analysis.deployableCash;
    if (available > 0 && available < opp.recommendedAmount) {
      return Math.max(opp.minimumInvestment, Math.round(available * 0.7));
    }
    return opp.recommendedAmount;
  };

  const handleAmountChange = (oppId: string, value: number) => {
    setCustomAmounts(prev => ({ ...prev, [oppId]: Math.max(100, value) }));
  };

  const handleQuickDeploy = (opp: InvestmentOpportunity) => {
    const amountToDeploy = getCustomOrRecommendedAmount(opp);

    if (!selectedBank) {
      setExecutionStatus({
        id: opp.id,
        success: false,
        message: 'No bank account selected for funding.',
      });
      return;
    }

    if (selectedBank.balance < amountToDeploy) {
      setExecutionStatus({
        id: opp.id,
        success: false,
        message: `Insufficient balance in ${selectedBank.bankName}. Available: ${formatCurrency(selectedBank.balance, currency)}, Required: ${formatCurrency(amountToDeploy, currency)}.`,
      });
      return;
    }

    // Execute the asset creation directly
    try {
      if (opp.category === 'fd') {
        const payload = {
          name: opp.autoPayload.data.name,
          institution: opp.autoPayload.data.institution,
          principal: amountToDeploy,
          interestRateYearly: opp.expectedAnnualReturn,
          compoundingFrequency: opp.autoPayload.data.compoundingFrequency,
          startDate: new Date().toISOString().split('T')[0],
          tenureMonths: opp.defaultTenureMonths || 12,
          autoCreditBankId: selectedBank.id,
        };
        const res = addFixedDeposit(payload, selectedBank.id);
        if (res.success) {
          setExecutionStatus({
            id: opp.id,
            success: true,
            message: `Successfully booked ${formatCurrency(amountToDeploy, currency)} in ${opp.title} at ${opp.expectedAnnualReturn}% APY!`,
          });
        } else {
          setExecutionStatus({
            id: opp.id,
            success: false,
            message: res.error || 'Failed to book Fixed Deposit.',
          });
        }
      } else if (opp.category === 'stock') {
        const sharePrice = opp.autoPayload.data.currentPrice || 100;
        const shares = Math.max(1, Math.round(amountToDeploy / sharePrice));
        const payload = {
          ticker: opp.autoPayload.data.ticker,
          companyName: opp.autoPayload.data.companyName,
          shares,
          buyPrice: sharePrice,
          currentPrice: sharePrice,
          expectedAnnualGrowth: opp.autoPayload.data.expectedAnnualGrowth,
          dividendYieldYearly: opp.autoPayload.data.dividendYieldYearly,
          autoCreditDividendsToBankId: selectedBank.id,
        };
        const res = addStock(payload, selectedBank.id);
        if (res.success) {
          setExecutionStatus({
            id: opp.id,
            success: true,
            message: `Purchased ${shares} shares of ${opp.autoPayload.data.ticker} for ${formatCurrency(amountToDeploy, currency)}!`,
          });
        } else {
          setExecutionStatus({
            id: opp.id,
            success: false,
            message: res.error || 'Failed to buy stocks.',
          });
        }
      } else if (opp.category === 'crypto') {
        const unitPrice = opp.autoPayload.data.currentPrice || 3000;
        const quantity = Number((amountToDeploy / unitPrice).toFixed(4));
        const payload = {
          symbol: opp.autoPayload.data.symbol,
          name: opp.autoPayload.data.name,
          quantity,
          buyPrice: unitPrice,
          currentPrice: unitPrice,
          expectedAnnualGrowth: opp.autoPayload.data.expectedAnnualGrowth,
          stakingYieldYearly: opp.autoPayload.data.stakingYieldYearly,
        };
        const res = addCrypto(payload, selectedBank.id);
        if (res.success) {
          setExecutionStatus({
            id: opp.id,
            success: true,
            message: `Acquired and staked ${quantity} ${opp.autoPayload.data.symbol} for ${formatCurrency(amountToDeploy, currency)}!`,
          });
        } else {
          setExecutionStatus({
            id: opp.id,
            success: false,
            message: res.error || 'Failed to buy crypto.',
          });
        }
      } else if (opp.category === 'property') {
        const payload = {
          ...opp.autoPayload.data,
          purchasePrice: amountToDeploy,
          currentValue: amountToDeploy,
          purchasedFromBankId: selectedBank.id,
        };
        const res = addProperty(payload);
        if (res.success) {
          setExecutionStatus({
            id: opp.id,
            success: true,
            message: `Acquired ${opp.autoPayload.data.name} for ${formatCurrency(amountToDeploy, currency)}! Generating ${formatCurrency(opp.autoPayload.data.monthlyRentalIncome, currency)}/mo rent.`,
          });
        } else {
          setExecutionStatus({
            id: opp.id,
            success: false,
            message: res.error || 'Failed to acquire property.',
          });
        }
      } else if (opp.category === 'business') {
        const branches = opp.autoPayload.data.branches || [];
        const payload = {
          name: opp.autoPayload.data.name,
          industry: opp.autoPayload.data.industry,
          valuation: amountToDeploy * 1.5,
          ownershipPercentage: 100,
          annualGrowthRate: opp.autoPayload.data.annualGrowthRate,
          monthlyNetProfit: Math.round(amountToDeploy * 0.02),
          destinationBankId: selectedBank.id,
          reinvestProfits: false,
        };
        const res = addBusiness(payload, branches, selectedBank.id, amountToDeploy);
        if (res.success) {
          setExecutionStatus({
            id: opp.id,
            success: true,
            message: `Launched ${opp.autoPayload.data.name} with ${formatCurrency(amountToDeploy, currency)} initial capital!`,
          });
        } else {
          setExecutionStatus({
            id: opp.id,
            success: false,
            message: res.error || 'Failed to launch enterprise.',
          });
        }
      }
    } catch {
      setExecutionStatus({
        id: opp.id,
        success: false,
        message: 'Unexpected error executing investment.',
      });
    }
  };

  // Compound projection calculation
  const simulationProjection = simulateInvestmentGrowth(simAmount, simRate, simYears, 0, analysis.currentCashWeightedApy);
  const endPoint = simulationProjection[simulationProjection.length - 1] || {
    cashInBankBalance: simAmount,
    investedBalance: simAmount,
    additionalGain: 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#121212] border border-[#282828] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header with vibrant Spotify gradient banner */}
        <div className="relative px-6 py-6 bg-gradient-to-r from-emerald-950 via-[#181818] to-slate-950 border-b border-[#282828] flex items-start justify-between shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1ed760] via-teal-500 to-emerald-900 flex items-center justify-center shadow-[0_4px_20px_rgba(30,215,96,0.3)] shrink-0">
              <TrendingUp className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#1ed760] uppercase tracking-wider bg-[#1ed760]/10 border border-[#1ed760]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#1ed760]" />
                  Alpha Yield Optimizer
                </span>
                <span className="text-xs text-[#a7a7a7]">
                  Personalized for {portfolio.user.fullName}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                High-Return Investment Suggestions
              </h2>
              <p className="text-xs sm:text-sm text-[#b3b3b3] mt-0.5 max-w-2xl">
                Unlock higher returns by deploying idle bank cash into institutional fixed vaults, core index compounding, high-cashflow real estate, and enterprise equity.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {executionStatus && (
          <div
            className={`px-6 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold border-b ${
              executionStatus.success
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {executionStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{executionStatus.message}</span>
            </div>
            <button
              onClick={() => setExecutionStatus(null)}
              className="text-[#b3b3b3] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Top Intelligence Grid: Cash Drag & Yield Gap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Liquid Cash */}
            <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[#a7a7a7]">
                <span>Total Liquid Cash</span>
                <Landmark className="w-4 h-4 text-[#1ed760]" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {formatCurrency(analysis.totalLiquidCash, currency)}
              </div>
              <div className="text-[11px] text-[#b3b3b3] mt-1 flex items-center justify-between">
                <span>Weighted APY:</span>
                <span className="font-mono text-white font-bold">{analysis.currentCashWeightedApy.toFixed(1)}%</span>
              </div>
            </div>

            {/* Card 2: Deployable Surplus */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#181818] to-[#181818] border border-emerald-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>Deployable Surplus</span>
                <Zap className="w-4 h-4 text-[#1ed760]" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1ed760] mt-1">
                {formatCurrency(analysis.deployableCash, currency)}
              </div>
              <div className="text-[11px] text-[#b3b3b3] mt-1 truncate">
                After 6mo safety buffer ({formatCurrency(analysis.recommendedEmergencyFund, currency)})
              </div>
            </div>

            {/* Card 3: Cash Drag Opportunity Cost */}
            <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[#a7a7a7] font-semibold">
                <span>Cash Drag (Missed Return)</span>
                <AlertTriangle className="w-4 h-4 text-[#b3b3b3]" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                -{formatCurrency(analysis.opportunityCostAnnual, currency)}/yr
              </div>
              <div className="text-[11px] text-[#a7a7a7] mt-1">
                Lost yield compared to a 12.5% balanced allocation
              </div>
            </div>

            {/* Card 4: Potential Yield Boost */}
            <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[#a7a7a7]">
                <span>Target Portfolio Return</span>
                <Flame className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-baseline gap-2">
                <span>{analysis.potentialPortfolioYield}%</span>
                <span className="text-xs text-[#1ed760] font-bold">
                  (+{(analysis.potentialPortfolioYield - analysis.currentPortfolioYield).toFixed(1)}%)
                </span>
              </div>
              <div className="text-[11px] text-[#1ed760] mt-1 font-semibold">
                +{formatCurrency(analysis.monthlyPassiveBoostPotential, currency)}/mo potential cashflow
              </div>
            </div>
          </div>

          {/* Interactive Return Multiplier & Compound Growth Simulator */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1c1c1c] to-[#161616] border border-[#2a2a2a] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1ed760]/10 border border-[#1ed760]/30 flex items-center justify-center text-[#1ed760]">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Return Multiplier Simulator
                  </h3>
                  <p className="text-xs text-[#a7a7a7]">
                    See how much more wealth you generate by deploying capital vs leaving it in savings
                  </p>
                </div>
              </div>

              {/* Strategy selector dropdown / pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setSimRate(8.5);
                    setSimStrategyName('Guaranteed Vault FD (8.5%)');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    simRate === 8.5
                      ? 'bg-[#1ed760] text-black font-bold'
                      : 'bg-[#222] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  Safe 8.5%
                </button>
                <button
                  onClick={() => {
                    setSimRate(12.8);
                    setSimStrategyName('S&P 500 Index (12.8%)');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    simRate === 12.8
                      ? 'bg-[#1ed760] text-black font-bold'
                      : 'bg-[#222] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  Index 12.8%
                </button>
                <button
                  onClick={() => {
                    setSimRate(14.2);
                    setSimStrategyName('Rental Property (14.2%)');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    simRate === 14.2
                      ? 'bg-[#1ed760] text-black font-bold'
                      : 'bg-[#222] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  Rental 14.2%
                </button>
                <button
                  onClick={() => {
                    setSimRate(24.0);
                    setSimStrategyName('Business Enterprise (24.0%)');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    simRate === 24.0
                      ? 'bg-[#1ed760] text-black font-bold'
                      : 'bg-[#222] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  Alpha 24.0%
                </button>
              </div>
            </div>

            {/* Slider and Horizon Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#b3b3b3] font-semibold">Amount to Deploy</span>
                  <span className="text-[#1ed760] font-mono font-bold text-sm">
                    {formatCurrency(simAmount, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={Math.max(100000, analysis.totalLiquidCash * 1.2)}
                  step={500}
                  value={simAmount}
                  onChange={e => setSimAmount(Number(e.target.value))}
                  className="w-full h-2 bg-[#282828] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
                />
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#a7a7a7]">
                  <span>Quick Presets:</span>
                  <button
                    onClick={() => setSimAmount(5000)}
                    className="hover:text-white underline decoration-dotted"
                  >
                    $5k
                  </button>
                  <button
                    onClick={() => setSimAmount(10000)}
                    className="hover:text-white underline decoration-dotted"
                  >
                    $10k
                  </button>
                  {analysis.deployableCash > 10000 && (
                    <button
                      onClick={() => setSimAmount(Math.round(analysis.deployableCash))}
                      className="text-[#1ed760] font-bold hover:underline"
                    >
                      All Surplus ({formatCurrency(analysis.deployableCash, currency)})
                    </button>
                  )}
                  <button
                    onClick={() => setSimAmount(50000)}
                    className="hover:text-white underline decoration-dotted"
                  >
                    $50k
                  </button>
                  <button
                    onClick={() => setSimAmount(100000)}
                    className="hover:text-white underline decoration-dotted"
                  >
                    $100k
                  </button>
                </div>
              </div>

              {/* Horizon Buttons */}
              <div className="space-y-2">
                <span className="block text-xs text-[#b3b3b3] font-semibold">Time Horizon</span>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 3, 5, 10].map(y => (
                    <button
                      key={y}
                      onClick={() => setSimYears(y)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        simYears === y
                          ? 'bg-[#1ed760] border-[#1ed760] text-black shadow-md'
                          : 'bg-[#222] border-[#333] text-[#b3b3b3] hover:text-white'
                      }`}
                    >
                      {y} {y === 1 ? 'Yr' : 'Yrs'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulation Comparison Output */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#282828]">
              {/* Baseline Bank Result */}
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626]">
                <div className="text-[11px] text-[#a7a7a7] uppercase tracking-wider font-semibold">
                  In Low-Yield Bank ({analysis.currentCashWeightedApy.toFixed(1)}%)
                </div>
                <div className="text-lg font-bold text-[#b3b3b3] mt-1 font-mono">
                  {formatCurrency(endPoint.cashInBankBalance, currency)}
                </div>
                <div className="text-[10px] text-[#777] mt-0.5">
                  Earns only +{formatCurrency(endPoint.cashInBankBalance - simAmount, currency)} interest
                </div>
              </div>

              {/* Investment Strategy Result */}
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626]">
                <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold truncate">
                  With {simStrategyName}
                </div>
                <div className="text-lg font-bold text-white mt-1 font-mono">
                  {formatCurrency(endPoint.investedBalance, currency)}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5 font-semibold">
                  Earns +{formatCurrency(endPoint.investedBalance - simAmount, currency)} in returns
                </div>
              </div>

              {/* Extra Return Difference */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/60 to-black border border-emerald-500/40 relative">
                <div className="text-[11px] text-[#1ed760] uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Extra Return Gained
                </div>
                <div className="text-xl font-extrabold text-[#1ed760] mt-1 font-mono drop-shadow-[0_2px_8px_rgba(30,215,96,0.3)]">
                  +{formatCurrency(endPoint.additionalGain, currency)}
                </div>
                <div className="text-[10px] text-[#b3b3b3] mt-0.5">
                  Pure upside profit over {simYears} {simYears === 1 ? 'year' : 'years'}
                </div>
              </div>
            </div>
          </div>

          {/* Funding Source Selector & Category Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Recommendations' },
                { id: 'guaranteed', label: 'Guaranteed (8.5%)' },
                { id: 'equities', label: 'Stocks & Index (12-16%)' },
                { id: 'property', label: 'Rental Real Estate (14%)' },
                { id: 'business', label: 'Enterprises (24%)' },
                { id: 'crypto', label: 'Staking (21%)' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategoryFilter === cat.id
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#1c1c1c] text-[#a7a7a7] hover:text-white border border-[#2a2a2a]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Select Bank for Auto-Funding */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#a7a7a7] font-semibold whitespace-nowrap">Fund From:</span>
              <select
                value={selectedFundingBankId}
                onChange={e => setSelectedFundingBankId(e.target.value)}
                className="bg-[#1c1c1c] text-white text-xs rounded-lg px-3 py-1.5 border border-[#333] focus:border-[#1ed760] outline-none"
              >
                {bankAccounts.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} ({formatCurrency(b.balance, currency)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Curated High-Return Opportunities Grid */}
          <div className="space-y-4">
            {filteredOpportunities.map(opp => {
              const currentAmount = getCustomOrRecommendedAmount(opp);
              const projectedGain1Yr = opp.projectedAnnualReturn(currentAmount);
              const projectedMonthlyCash = opp.projectedMonthlyCashflow(currentAmount);

              let CategoryIcon = TrendingUp;
              if (opp.category === 'fd') CategoryIcon = ShieldCheck;
              if (opp.category === 'stock') CategoryIcon = TrendingUp;
              if (opp.category === 'property') CategoryIcon = Building;
              if (opp.category === 'business') CategoryIcon = Briefcase;
              if (opp.category === 'crypto') CategoryIcon = Coins;

              return (
                <div
                  key={opp.id}
                  className="p-5 rounded-2xl bg-[#181818] hover:bg-[#1a1a1a] border border-[#282828] hover:border-[#383838] transition-all space-y-4"
                >
                  {/* Top Bar: Icon, Title, Badge, Return % */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center shrink-0 text-[#1ed760]">
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            {opp.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opp.badgeColor}`}
                          >
                            {opp.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#a7a7a7] mt-0.5 max-w-xl">
                          {opp.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Return Highlights Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 bg-[#222] sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl">
                      <div className="text-xs text-[#a7a7a7] sm:text-right">Expected Annual Return</div>
                      <div className="text-xl sm:text-2xl font-black text-[#1ed760] font-mono">
                        +{opp.expectedAnnualReturn}% <span className="text-xs font-normal">p.a.</span>
                      </div>
                      {projectedMonthlyCash > 0 && (
                        <div className="text-[11px] text-emerald-400 font-semibold">
                          +{formatCurrency(projectedMonthlyCash, currency)}/mo passive cash
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {opp.keyHighlights.map((hl, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#cccccc]">
                        <Check className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>

                  {/* Investment Control & 1-Click Execution */}
                  <div className="pt-3 border-t border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Amount Input */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#a7a7a7] font-semibold whitespace-nowrap">
                        Deploy Capital:
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          value={currentAmount}
                          onChange={e => handleAmountChange(opp.id, Number(e.target.value))}
                          step={500}
                          min={opp.minimumInvestment}
                          className="w-36 bg-[#222] text-white text-xs font-mono font-bold rounded-lg px-3 py-2 border border-[#333] focus:border-[#1ed760] outline-none"
                        />
                      </div>
                      <div className="text-xs text-[#a7a7a7] hidden sm:block">
                        → 1-Yr Net Gain: <span className="text-[#1ed760] font-bold font-mono">+{formatCurrency(projectedGain1Yr, currency)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {onOpenAssetModal && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenAssetModal(opp.category as any, opp.autoPayload.data);
                          }}
                          className="px-3.5 py-2 rounded-full bg-transparent hover:bg-[#282828] text-white text-xs font-bold border border-[#444] transition-all"
                        >
                          Customize
                        </button>
                      )}

                      <button
                        onClick={() => handleQuickDeploy(opp)}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(30,215,96,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 fill-black" />
                        1-Click Invest & Deploy
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#181818] border-t border-[#282828] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs text-[#a7a7a7]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1ed760]" />
            <span>
              All investments automatically compound and log in your month-by-month financial timeline.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#262626] hover:bg-[#333] text-white font-bold transition-colors self-end sm:self-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
