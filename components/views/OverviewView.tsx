'use client';

import React from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import {
  calculateSummaryMetrics,
  formatCurrency,
  getUserSimulatedAge,
  calculateCreditScore,
  calculateEmergencyFundMetrics,
} from '@/lib/initial-data';
import { analyzePortfolioForInvestment } from '@/lib/investment-suggestions';
import { NetWorthChart } from '../NetWorthChart';
import {
  Car,
  Building,
  Landmark,
  TrendingUp,
  CreditCard,
  Briefcase,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Plus,
  Coins,
  DollarSign,
  ChevronRight,
  SlidersHorizontal,
  Zap,
  Trash2,
  User,
  Sparkles,
  Flame,
  MessageCircle,
  Send,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { NavTab } from '../Navbar';

interface OverviewViewProps {
  setActiveTab: (tab: NavTab) => void;
  openAddModal: (type: 'job' | 'car' | 'bank' | 'property' | 'growth' | 'emi') => void;
  openPriceAdjuster?: () => void;
  openShiftModal?: () => void;
  openClearModal?: () => void;
  openUpgradeModal?: (type: 'car' | 'property' | 'business', id?: string) => void;
  openInvestmentSuggestions?: () => void;
  openSendMoneyModal?: () => void;
}

export function OverviewView({
  setActiveTab,
  openAddModal,
  openPriceAdjuster,
  openShiftModal,
  openClearModal,
  openUpgradeModal,
  openInvestmentSuggestions,
  openSendMoneyModal,
}: OverviewViewProps) {
  const { portfolio, advanceMonth } = usePortfolio();

  if (!portfolio) return null;

  const metrics = calculateSummaryMetrics(portfolio);
  const yieldAnalysis = analyzePortfolioForInvestment(portfolio);
  const currency = portfolio.user.currency;
  const recentLogs = portfolio.simulationLogs.slice(0, 8);
  const jobsCount = portfolio.jobs?.length || 0;
  const activeJobsCount = portfolio.jobs?.filter(j => j.isActive).length || 0;

  const simulatedAge = getUserSimulatedAge(
    portfolio.user.startingAge || 28,
    portfolio.simulatedMonth || 0
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickTiles = [
    {
      title: 'Profile & Lifestyle',
      subtitle: `Age ${simulatedAge.years}y · ${portfolio.user.occupationTitle || 'Career'} · ${portfolio.user.lifestyleTier || 'Standard'}`,
      icon: User,
      gradient: 'from-purple-600 via-indigo-700 to-slate-950',
      tab: 'profile' as NavTab,
    },
    {
      title: 'Careers & Jobs',
      subtitle: `${jobsCount} jobs (${activeJobsCount} active) · +${formatCurrency(metrics.monthlyJobSalaries || 0, currency)}/mo`,
      icon: Briefcase,
      gradient: 'from-emerald-500 to-teal-950',
      tab: 'jobs' as NavTab,
    },
    {
      title: 'Vehicle Fleet',
      subtitle: `${portfolio.cars.length} cars · ${formatCurrency(metrics.carsVal, currency, true)}`,
      icon: Car,
      gradient: 'from-emerald-700 to-zinc-900',
      tab: 'cars' as NavTab,
    },
    {
      title: 'Real Estate',
      subtitle: `${portfolio.properties.length} props · ${formatCurrency(metrics.propVal, currency, true)}`,
      icon: Building,
      gradient: 'from-emerald-600 to-teal-950',
      tab: 'properties' as NavTab,
    },
    {
      title: 'Enterprises & Branches',
      subtitle: `${portfolio.businesses?.length || 0} entities · ${metrics.branchesCount || 0} branches · ${formatCurrency(metrics.businessesVal, currency, true)}`,
      icon: Briefcase,
      gradient: 'from-teal-700 to-zinc-900',
      tab: 'businesses' as NavTab,
    },
    {
      title: 'Bank Vaults',
      subtitle: `${portfolio.bankAccounts.length} accounts · ${formatCurrency(metrics.bankVal, currency, true)}`,
      icon: Landmark,
      gradient: 'from-emerald-600 to-slate-900',
      tab: 'banks' as NavTab,
    },
    {
      title: 'Direct Messages & Wires',
      subtitle: 'Secure Chat · Photos · P2P Bank Wires',
      icon: MessageCircle,
      gradient: 'from-emerald-700 via-teal-800 to-slate-950',
      tab: 'messages' as NavTab,
    },
    {
      title: 'Fixed Deposits',
      subtitle: `${portfolio.fixedDeposits.length} FDs · ${formatCurrency(metrics.fdVal, currency, true)}`,
      icon: TrendingUp,
      gradient: 'from-indigo-600 to-purple-950',
      tab: 'growth' as NavTab,
    },
    {
      title: 'Equities & Stocks',
      subtitle: `${portfolio.stocks.length} equities · ${formatCurrency(metrics.stockVal, currency, true)}`,
      icon: Coins,
      gradient: 'from-teal-600 to-emerald-950',
      tab: 'growth' as NavTab,
    },
    {
      title: 'Active EMIs',
      subtitle: `${portfolio.emis.length} loans · -${formatCurrency(metrics.monthlyEmis, currency)}/mo`,
      icon: CreditCard,
      gradient: 'from-rose-600 to-red-950',
      tab: 'loans' as NavTab,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Spotify Top Greeting & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {getGreeting()}, {portfolio.user.fullName}
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30">
              Age {simulatedAge.label}
            </span>
            {portfolio.user.occupationTitle && (
              <span className="text-xs text-[#b3b3b3] hidden sm:inline">
                · {portfolio.user.occupationTitle}
              </span>
            )}
          </div>
          <p className="text-xs text-[#b3b3b3] mt-1">
            Wealth & life compounding on month {portfolio.simulatedMonth}. {portfolio.user.lifestyleTier || 'Luxury & High-Flyer'} lifestyle active.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {openShiftModal && (
            <button
              onClick={openShiftModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              title="Clock In & Work Shift (Collect defined salary/wage)"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Clock In / Work Shift</span>
            </button>
          )}

          {openPriceAdjuster && (
            <button
              onClick={openPriceAdjuster}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#181818] hover:bg-[#282828] text-white hover:text-[#1ed760] border border-[#3e3e3e] hover:border-[#1ed760]/50 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#1ed760]" />
              <span>Adjust Prices</span>
            </button>
          )}

          {openClearModal && (
            <button
              onClick={openClearModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#181818] hover:bg-rose-500/10 text-[#b3b3b3] hover:text-rose-400 border border-[#3e3e3e] hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
              title="Clear Portfolio Data / Reset"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 6-Tile Quick Navigation Grid (Spotify Signature style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickTiles.map((tile, idx) => {
          const Icon = tile.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(tile.tab)}
              className="group flex items-center justify-between bg-[#181818] hover:bg-[#282828] rounded-[6px] overflow-hidden transition-all duration-200 cursor-pointer shadow-md pr-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${tile.gradient} flex items-center justify-center shrink-0 shadow-md`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{tile.title}</div>
                  <div className="text-xs text-[#b3b3b3] truncate mt-0.5">{tile.subtitle}</div>
                </div>
              </div>

              {/* Green Play Button appearing on hover */}
              <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-[0_8px_8px_rgba(0,0,0,0.3)] group-hover:scale-105 active:scale-95 shrink-0">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Investment Advisory: High Return Radar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#181818] to-slate-900 border border-emerald-500/30 p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#1ed760]/10 border border-[#1ed760]/30 flex items-center justify-center text-[#1ed760] shrink-0">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-[#1ed760] uppercase tracking-wider bg-[#1ed760]/15 border border-[#1ed760]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#1ed760]" />
                  High Return Radar
                </span>
                {yieldAnalysis.opportunityCostAnnual > 0 && (
                  <span className="text-[10px] font-bold text-slate-300 bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 rounded-full">
                    Cash Drag: -{formatCurrency(yieldAnalysis.opportunityCostAnnual, currency)}/yr missed
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Target Portfolio Yield: {yieldAnalysis.potentialPortfolioYield}% APY
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1.5">
                Suggested Investments: Deploy Idle Cash for Higher Returns
              </h2>
              <p className="text-xs text-[#b3b3b3] mt-0.5 max-w-2xl leading-relaxed">
                You currently hold {formatCurrency(yieldAnalysis.totalLiquidCash, currency)} liquid cash ({formatCurrency(yieldAnalysis.deployableCash, currency)} deployable surplus above your 6-month safety buffer). Putting this capital to work across high-yield vaults, equities, and rental cashflow can boost your return by up to <span className="text-[#1ed760] font-bold">+{(yieldAnalysis.potentialPortfolioYield - yieldAnalysis.currentPortfolioYield).toFixed(1)}% p.a.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {openInvestmentSuggestions && (
              <button
                onClick={openInvestmentSuggestions}
                className="px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_2px_14px_rgba(30,215,96,0.35)] hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Get More Return & Deploy</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div
            onClick={openInvestmentSuggestions}
            className="p-3 rounded-xl bg-[#141414]/90 hover:bg-[#1f1f1f] border border-[#282828] hover:border-emerald-500/40 cursor-pointer transition-all group"
          >
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              High-Yield Vault FD
            </div>
            <div className="text-base font-extrabold text-white mt-0.5 font-mono group-hover:text-[#1ed760] transition-colors">
              +8.5% <span className="text-[10px] font-normal text-[#a7a7a7]">Guaranteed</span>
            </div>
            <div className="text-[10px] text-[#777] mt-0.5">Capital safe · Monthly interest</div>
          </div>

          <div
            onClick={openInvestmentSuggestions}
            className="p-3 rounded-xl bg-[#141414]/90 hover:bg-[#1f1f1f] border border-[#282828] hover:border-cyan-500/40 cursor-pointer transition-all group"
          >
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              S&P 500 Index (VOO)
            </div>
            <div className="text-base font-extrabold text-white mt-0.5 font-mono group-hover:text-cyan-400 transition-colors">
              +12.8% <span className="text-[10px] font-normal text-[#a7a7a7]">Equities</span>
            </div>
            <div className="text-[10px] text-[#777] mt-0.5">500 global giants + dividends</div>
          </div>

          <div
            onClick={openInvestmentSuggestions}
            className="p-3 rounded-xl bg-[#141414]/90 hover:bg-[#1f1f1f] border border-[#282828] hover:border-emerald-500/40 cursor-pointer transition-all group"
          >
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Rental Real Estate
            </div>
            <div className="text-base font-extrabold text-white mt-0.5 font-mono group-hover:text-emerald-400 transition-colors">
              +14.2% <span className="text-[10px] font-normal text-[#a7a7a7]">Cashflow</span>
            </div>
            <div className="text-[10px] text-[#777] mt-0.5">+8.6% rent + 5.6% value growth</div>
          </div>

          <div
            onClick={openInvestmentSuggestions}
            className="p-3 rounded-xl bg-[#141414]/90 hover:bg-[#1f1f1f] border border-[#282828] hover:border-teal-500/40 cursor-pointer transition-all group"
          >
            <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
              Enterprise Branches
            </div>
            <div className="text-base font-extrabold text-white mt-0.5 font-mono group-hover:text-teal-400 transition-colors">
              +24.0% <span className="text-[10px] font-normal text-[#a7a7a7]">ROCE</span>
            </div>
            <div className="text-[10px] text-[#777] mt-0.5">High commercial monthly dividends</div>
          </div>
        </div>
      </div>

      {/* Hero Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-[#181818] hover:bg-[#222222] rounded-lg p-5 transition-colors border border-transparent hover:border-[#282828]">
          <div className="flex items-center justify-between text-xs text-[#b3b3b3]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Net Worth</span>
            <span className="text-[10px] text-[#1ed760] font-bold">Assets - Debts</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(metrics.netWorth, currency)}
          </div>
          <div className="text-xs text-[#b3b3b3] mt-2 flex items-center gap-1.5">
            <span>Liquid:</span>
            <span className="text-white font-mono">{formatCurrency(metrics.bankVal, currency, true)}</span>
            <span>·</span>
            <span>Fixed:</span>
            <span className="text-white font-mono">{formatCurrency(metrics.fixedAssets, currency, true)}</span>
          </div>
        </div>

        {/* Total Assets */}
        <div className="bg-[#181818] hover:bg-[#222222] rounded-lg p-5 transition-colors border border-transparent hover:border-[#282828]">
          <div className="flex items-center justify-between text-xs text-[#b3b3b3]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Assets</span>
            <span className="text-[10px] text-white font-mono">
              {portfolio.cars.length + portfolio.properties.length + portfolio.fixedDeposits.length + portfolio.stocks.length} Assets
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(metrics.totalAssets, currency)}
          </div>
          <div className="text-xs text-[#b3b3b3] mt-2 truncate">
            {portfolio.properties.length} Props · {portfolio.cars.length} Cars · {portfolio.bankAccounts.length} Banks
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="bg-[#181818] hover:bg-[#222222] rounded-lg p-5 transition-colors border border-transparent hover:border-[#282828]">
          <div className="flex items-center justify-between text-xs text-[#b3b3b3]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Liabilities</span>
            <span className="text-[10px] text-[#f3727f] font-mono">
              {metrics.debtToAssetRatio.toFixed(1)}% Debt/Asset
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#f3727f] mt-1 tabular-nums">
            {formatCurrency(metrics.totalLiabilities, currency)}
          </div>
          <div className="text-xs text-[#b3b3b3] mt-2">
            Monthly EMI: <span className="text-white font-mono">{formatCurrency(metrics.monthlyEmis, currency)}/mo</span>
          </div>
        </div>

        {/* Net Monthly Cashflow */}
        <div className="bg-[#181818] hover:bg-[#222222] rounded-lg p-5 transition-colors border border-transparent hover:border-[#282828]">
          <div className="flex items-center justify-between text-xs text-[#b3b3b3]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Net Cashflow</span>
            <span
              className={`text-[10px] font-bold ${
                metrics.netMonthlyCashflow >= 0 ? 'text-[#1ed760]' : 'text-[#f3727f]'
              }`}
            >
              {metrics.netMonthlyCashflow >= 0 ? '+Surplus' : '-Deficit'}
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono mt-1 tabular-nums ${
              metrics.netMonthlyCashflow >= 0 ? 'text-[#1ed760]' : 'text-[#f3727f]'
            }`}
          >
            {metrics.netMonthlyCashflow >= 0 ? '+' : ''}
            {formatCurrency(metrics.netMonthlyCashflow, currency)}
            <span className="text-xs text-[#b3b3b3] font-normal">/mo</span>
          </div>
          <div className="text-xs text-[#b3b3b3] mt-2">
            In: <span className="text-[#1ed760] font-mono">{formatCurrency(metrics.totalMonthlyInflow, currency, true)}</span> · Out: <span className="text-[#f3727f] font-mono">{formatCurrency(metrics.totalMonthlyOutflow, currency, true)}</span>
          </div>
        </div>
      </div>

      {/* Real-Life Banking Health & Credit Intelligence */}
      {(() => {
        const creditAnalysis = calculateCreditScore(portfolio);
        const emergencyAnalysis = calculateEmergencyFundMetrics(portfolio);

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setActiveTab('banks')}
              className="p-4 rounded-xl bg-[#181818] hover:bg-[#202020] border border-[#282828] hover:border-[#1ed760]/40 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#1ed760]/15 flex items-center justify-center text-[#1ed760] shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">FICO® Credit Standing</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${creditAnalysis.badgeBg}`}>
                      {creditAnalysis.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888] mt-0.5 truncate">
                    Borrowing Power: {creditAnalysis.maxBorrowingPowerMultiplier}x Asset Tier · -{creditAnalysis.primeRateDiscountPercent}% APR Benefit
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-bold font-mono text-white group-hover:text-[#1ed760] transition-colors">
                  {creditAnalysis.score}
                </span>
                <span className="text-[10px] text-[#888] block">/ 850 Max</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('banks')}
              className="p-4 rounded-xl bg-[#181818] hover:bg-[#202020] border border-[#282828] hover:border-blue-500/40 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Emergency Fund Health</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {emergencyAnalysis.statusTier}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888] mt-0.5 truncate">
                    {formatCurrency(emergencyAnalysis.liquidCash, currency, true)} Liquid Reserves · {emergencyAnalysis.healthPercent}% of 6-mo goal
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-bold font-mono text-white group-hover:text-blue-400 transition-colors">
                  {emergencyAnalysis.runwayMonths >= 999 ? '∞' : `${emergencyAnalysis.runwayMonths} Mo`}
                </span>
                <span className="text-[10px] text-[#888] block">Runway</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Net Worth Chart styled with Spotify Dark Theme */}
      <NetWorthChart historyPoints={portfolio.historyPoints} currency={currency} />

      {/* Spotify Tracklist-styled Recent Ledger Activity */}
      <div className="bg-[#181818] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Transactions & Accruals</h3>
            <p className="text-xs text-[#b3b3b3] mt-0.5">
              Live feed of auto-credited salaries, rental deposits, FD compounding, and EMI deductions
            </p>
          </div>
          <button
            onClick={() => setActiveTab('simulator')}
            className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3] hover:text-white transition-colors"
          >
            Show All ({portfolio.simulationLogs.length}) →
          </button>
        </div>

        {/* Tracklist Table Header */}
        <div className="border-b border-[#282828] pb-2 text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider grid grid-cols-12 px-3">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Title & Details</div>
          <div className="col-span-3 text-right">Account / Route</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {/* Tracklist Rows */}
        <div className="divide-y divide-[#282828]/40">
          {recentLogs.map((log, index) => {
            const isInflow = log.direction === 'inflow' || log.direction === 'valuation_up';
            const isAlert = log.direction === 'alert';

            return (
              <div
                key={log.id}
                className="grid grid-cols-12 items-center px-3 py-3 rounded-md hover:bg-[#282828] transition-colors group text-xs"
              >
                <div className="col-span-1 text-[#b3b3b3] font-mono group-hover:text-white">
                  {index + 1}
                </div>
                <div className="col-span-6 min-w-0 pr-2">
                  <div className="text-white font-bold truncate flex items-center gap-2">
                    <span>{log.title}</span>
                    <span className="text-[10px] text-[#b3b3b3] font-mono">
                      {log.simulatedDateString}
                    </span>
                  </div>
                  <div className="text-[#b3b3b3] text-[11px] truncate mt-0.5">
                    {log.details}
                  </div>
                </div>
                <div className="col-span-3 text-right text-[#b3b3b3] truncate font-mono text-[11px]">
                  {log.bankAccountAffected || 'Portfolio Engine'}
                </div>
                <div className="col-span-2 text-right font-mono font-bold">
                  <span
                    className={
                      isAlert
                        ? 'text-[#ffa42b]'
                        : isInflow
                        ? 'text-[#1ed760]'
                        : 'text-[#f3727f]'
                    }
                  >
                    {isInflow ? '+' : '-'}
                    {formatCurrency(log.amount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
