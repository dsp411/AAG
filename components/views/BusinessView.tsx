'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { BusinessAsset, BusinessBranch } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import {
  Briefcase,
  Plus,
  Building,
  Store,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Landmark,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface BusinessViewProps {
  openAddBusinessModal: () => void;
  openEditBusinessModal: (biz: BusinessAsset) => void;
  openAddBranchModal: (biz: BusinessAsset) => void;
  openEditBranchModal: (biz: BusinessAsset, branch: BusinessBranch) => void;
  openUpgradeModal?: (type: 'car' | 'property' | 'business', id?: string) => void;
}

export function BusinessView({
  openAddBusinessModal,
  openEditBusinessModal,
  openAddBranchModal,
  openEditBranchModal,
  openUpgradeModal,
}: BusinessViewProps) {
  const { portfolio, deleteBusiness, deleteBranch } = usePortfolio();

  // State to track expanded branch accordions
  const [expandedBizIds, setExpandedBizIds] = useState<Record<string, boolean>>(() => {
    // Expand all by default
    const initial: Record<string, boolean> = {};
    portfolio?.businesses?.forEach(b => {
      initial[b.id] = true;
    });
    return initial;
  });

  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');

  if (!portfolio) return null;

  const businesses = portfolio.businesses || [];
  const currency = portfolio.user.currency;

  const toggleExpand = (bizId: string) => {
    setExpandedBizIds(prev => ({
      ...prev,
      [bizId]: !prev[bizId],
    }));
  };

  // Aggregated totals
  const totalEnterpriseVal = businesses.reduce((sum, b) => sum + b.valuation, 0);
  const totalOwnedEquity = businesses.reduce(
    (sum, b) => sum + b.valuation * (b.ownershipPercentage / 100),
    0
  );
  const totalMonthlyDividends = businesses
    .filter(b => !b.reinvestProfits)
    .reduce((sum, b) => sum + b.monthlyNetProfit * (b.ownershipPercentage / 100), 0);
  const totalBranchesCount = businesses.reduce((sum, b) => sum + (b.branches?.length || 0), 0);
  const totalEmployees = businesses.reduce(
    (sum, b) => sum + (b.branches?.reduce((bs, br) => bs + br.employeeCount, 0) || 0),
    0
  );

  // Industry filters
  const industries = ['All', ...Array.from(new Set(businesses.map(b => b.industry)))];
  const filteredBusinesses =
    selectedIndustry === 'All'
      ? businesses
      : businesses.filter(b => b.industry === selectedIndustry);

  const getStatusBadge = (status: BusinessBranch['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case 'Expanding':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#539df5]/10 text-[#539df5] border border-[#539df5]/30 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Expanding
          </span>
        );
      case 'Renovating':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffa42b]/10 text-[#ffa42b] border border-[#ffa42b]/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Renovating
          </span>
        );
      case 'Planned':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Planned
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Spotify Album-Style Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-teal-950/60 via-[#181818] to-[#121212] p-6 rounded-lg">
        {/* Cover Art Tile */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-gradient-to-br from-teal-600 to-zinc-950 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0">
          <Briefcase className="w-20 h-20 text-white" />
        </div>

        {/* Album Metadata */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
            Commercial Empire
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Businesses & Branches
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3]">
            <span className="text-white font-bold">{portfolio.user.fullName}</span>
            <span>·</span>
            <span>{businesses.length} corporations / LLCs</span>
            <span>·</span>
            <span>{totalBranchesCount} physical & regional branches</span>
            <span>·</span>
            <span className="font-mono text-[#1ed760] font-bold">
              {formatCurrency(totalOwnedEquity, currency)} owned equity
            </span>
            <span>·</span>
            <span className="font-mono text-white font-bold">
              +{formatCurrency(totalMonthlyDividends, currency)}/mo dividends
            </span>
            <span>·</span>
            <span>{totalEmployees} team headcount</span>
          </div>
        </div>
      </div>

      {/* Action Buttons & Industry Pills Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={openAddBusinessModal}
            className="w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer shrink-0"
            title="Register New Business"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            onClick={openAddBusinessModal}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-[#eeeeee] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Add Business
          </button>

          {openUpgradeModal && businesses.length > 0 && (
            <button
              onClick={() => openUpgradeModal('business')}
              className="px-5 py-2.5 rounded-full bg-[#282828] hover:bg-[#333] active:scale-95 text-[#1ed760] border border-[#1ed760]/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-[#1ed760]" />
              Upgrade / Inject Capital
            </button>
          )}
        </div>

        {/* Industry Filter Pills */}
        {industries.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {industries.map(ind => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedIndustry === ind
                    ? 'bg-white text-black'
                    : 'bg-[#242424] text-[#b3b3b3] hover:text-white hover:bg-[#2e2e2e]'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Business Cards List */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-[#181818] rounded-lg p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#282828] text-[#b3b3b3] flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Businesses Found</h3>
          <p className="text-xs text-[#b3b3b3] max-w-sm mx-auto">
            Add your operating companies, franchises, startups, or retail chains and track their branch locations, revenues, and owner dividends.
          </p>
          <button
            onClick={openAddBusinessModal}
            className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            Register First Business
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBusinesses.map(biz => {
            const isExpanded = !!expandedBizIds[biz.id];
            const ownedValue = biz.valuation * (biz.ownershipPercentage / 100);
            const ownerMonthlyDividend = biz.monthlyNetProfit * (biz.ownershipPercentage / 100);
            const destinationBank = portfolio.bankAccounts.find(b => b.id === biz.destinationBankId);
            const branches = biz.branches || [];
            const totalBranchRev = branches.reduce((sum, br) => sum + br.monthlyRevenue, 0);
            const totalBranchExp = branches.reduce((sum, br) => sum + br.monthlyExpenses, 0);
            const totalBranchProfit = totalBranchRev - totalBranchExp;
            const totalBranchEmployees = branches.reduce((sum, br) => sum + br.employeeCount, 0);
            const totalBranchValuation = branches.reduce((sum, br) => sum + br.valuation, 0);

            return (
              <div
                key={biz.id}
                className="bg-[#181818] border border-[#282828] hover:border-[#383838] rounded-xl overflow-hidden shadow-lg transition-all duration-200"
              >
                {/* Business Header Card */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-600 to-zinc-800 flex items-center justify-center shrink-0 shadow-md">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-white tracking-tight">
                            {biz.name}
                          </h2>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#242424] text-[#b3b3b3] border border-[#333333]">
                            {biz.industry}
                          </span>
                          {biz.incorporationYear && (
                            <span className="text-[11px] text-[#7c7c7c]">
                              Est. {biz.incorporationYear}
                            </span>
                          )}
                          {biz.registrationNumber && (
                            <span className="text-[10px] text-[#7c7c7c] font-mono">
                              Reg #{biz.registrationNumber}
                            </span>
                          )}
                        </div>
                        {biz.notes && (
                          <p className="text-xs text-[#b3b3b3] mt-1 italic">
                            &ldquo;{biz.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-start flex-wrap">
                      {openUpgradeModal && (
                        <button
                          onClick={() => openUpgradeModal('business', biz.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#282828] text-white hover:text-[#1ed760] border border-[#3e3e3e] hover:border-[#1ed760]/50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-105"
                          title="Inject capital or install enterprise upgrades"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-[#1ed760] text-[#1ed760]" />
                          <span>Upgrade</span>
                        </button>
                      )}

                      <button
                        onClick={() => openAddBranchModal(biz)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-105"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add Branch</span>
                      </button>

                      <button
                        onClick={() => openEditBusinessModal(biz)}
                        className="p-2 rounded-full hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
                        title="Edit Business Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete business "${biz.name}" and all ${branches.length} branches from your portfolio?`)) {
                            deleteBusiness(biz.id);
                          }
                        }}
                        className="p-2 rounded-full hover:bg-[#282828] text-[#b3b3b3] hover:text-[#f3727f] transition-colors cursor-pointer"
                        title="Delete Business"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {/* Enterprise Value */}
                    <div className="bg-[#121212] p-3 rounded-lg border border-[#242424]">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#b3b3b3]">
                        Enterprise Value
                      </div>
                      <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
                        {formatCurrency(biz.valuation, currency)}
                      </div>
                      <div className="text-[11px] text-[#1ed760] font-semibold mt-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{biz.annualGrowthRate}% p.a. growth</span>
                      </div>
                    </div>

                    {/* Owned Stake */}
                    <div className="bg-[#121212] p-3 rounded-lg border border-[#242424]">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#b3b3b3]">
                        Your Equity ({biz.ownershipPercentage}%)
                      </div>
                      <div className="text-base sm:text-lg font-bold font-mono text-[#1ed760] mt-0.5">
                        {formatCurrency(ownedValue, currency)}
                      </div>
                      <div className="text-[11px] text-[#b3b3b3] mt-0.5">
                        Equity in net worth
                      </div>
                    </div>

                    {/* Monthly Net Dividend */}
                    <div className="bg-[#121212] p-3 rounded-lg border border-[#242424]">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#b3b3b3]">
                        Monthly Owner Payout
                      </div>
                      <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
                        {biz.reinvestProfits
                          ? 'Reinvested'
                          : `+${formatCurrency(ownerMonthlyDividend, currency)}/mo`}
                      </div>
                      <div className="text-[11px] text-[#b3b3b3] mt-0.5 truncate">
                        {biz.reinvestProfits
                          ? 'Retained for expansion'
                          : `Base: ${formatCurrency(biz.monthlyNetProfit, currency)}/mo`}
                      </div>
                    </div>

                    {/* Auto-Credit Destination Bank */}
                    <div className="bg-[#121212] p-3 rounded-lg border border-[#242424]">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#b3b3b3]">
                        Payout Bank Route
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white mt-1 truncate flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
                        <span className="truncate">{destinationBank ? destinationBank.bankName : 'Main Checking'}</span>
                      </div>
                      <div className="text-[11px] text-[#b3b3b3] mt-0.5">
                        Auto-credited on 1st
                      </div>
                    </div>
                  </div>

                  {/* Branches Toggle Header */}
                  <div
                    onClick={() => toggleExpand(biz.id)}
                    className="flex items-center justify-between pt-3 border-t border-[#242424] cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#1ed760]" />
                      <span className="text-xs font-bold text-white group-hover:text-[#1ed760] transition-colors">
                        Branch & Location Network ({branches.length} locations)
                      </span>
                      <span className="text-[11px] text-[#b3b3b3]">
                        · {totalBranchEmployees} total staff · {formatCurrency(totalBranchRev, currency, true)}/mo branch revenue
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[#b3b3b3] group-hover:text-white">
                      <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Branches Accordion List */}
                {isExpanded && (
                  <div className="bg-[#141414] border-t border-[#242424] p-4 sm:p-6 space-y-4">
                    {branches.length === 0 ? (
                      <div className="p-6 text-center bg-[#181818] rounded-lg border border-[#282828] space-y-2">
                        <Store className="w-8 h-8 text-[#b3b3b3] mx-auto opacity-60" />
                        <p className="text-xs text-white font-semibold">No branches added yet</p>
                        <p className="text-[11px] text-[#b3b3b3]">
                          Add stores, regional offices, warehouse hubs, or online outlets under {biz.name}.
                        </p>
                        <button
                          onClick={() => openAddBranchModal(biz)}
                          className="px-4 py-1.5 rounded-full bg-[#1ed760] text-black text-xs font-bold uppercase tracking-wider mt-2 hover:scale-105 transition-transform"
                        >
                          + Add First Branch
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {branches.map(branch => {
                          const netProfit = branch.monthlyRevenue - branch.monthlyExpenses;
                          const isProfitable = netProfit >= 0;

                          return (
                            <div
                              key={branch.id}
                              className="bg-[#1a1a1a] hover:bg-[#202020] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl p-4 transition-all duration-150 flex flex-col justify-between space-y-3 group"
                            >
                              {/* Top Bar */}
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1ed760] transition-colors">
                                      {branch.name}
                                    </h4>
                                    <div className="text-[11px] text-[#b3b3b3] flex items-center gap-1 mt-0.5 truncate">
                                      <MapPin className="w-3 h-3 text-[#1ed760] shrink-0" />
                                      <span className="truncate">{branch.location}</span>
                                    </div>
                                  </div>
                                  <div className="shrink-0">
                                    {getStatusBadge(branch.status)}
                                  </div>
                                </div>

                                {branch.address && (
                                  <p className="text-[10px] text-[#7c7c7c] mt-1 truncate">
                                    {branch.address}
                                  </p>
                                )}
                              </div>

                              {/* Branch Metrics */}
                              <div className="grid grid-cols-2 gap-2 text-xs bg-[#121212] p-2.5 rounded-lg border border-[#222222]">
                                <div>
                                  <span className="text-[10px] text-[#b3b3b3] uppercase font-bold tracking-wider block">
                                    Monthly Rev
                                  </span>
                                  <span className="font-mono text-white font-semibold">
                                    {formatCurrency(branch.monthlyRevenue, currency)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#b3b3b3] uppercase font-bold tracking-wider block">
                                    Expenses
                                  </span>
                                  <span className="font-mono text-[#f3727f] font-semibold">
                                    -{formatCurrency(branch.monthlyExpenses, currency)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#b3b3b3] uppercase font-bold tracking-wider block">
                                    Net Margin
                                  </span>
                                  <span
                                    className={`font-mono font-bold ${
                                      isProfitable ? 'text-[#1ed760]' : 'text-[#f3727f]'
                                    }`}
                                  >
                                    {isProfitable ? '+' : ''}
                                    {formatCurrency(netProfit, currency)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#b3b3b3] uppercase font-bold tracking-wider block">
                                    Branch Valuation
                                  </span>
                                  <span className="font-mono text-white font-semibold">
                                    {formatCurrency(branch.valuation, currency, true)}
                                  </span>
                                </div>
                              </div>

                              {/* Footer details & Actions */}
                              <div className="flex items-center justify-between text-[11px] text-[#b3b3b3] pt-1">
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-[#b3b3b3]" />
                                  <span>{branch.employeeCount} staff</span>
                                  {branch.managerName && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate max-w-[80px]" title={branch.managerName}>
                                        {branch.managerName}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditBranchModal(biz, branch)}
                                    className="p-1 text-[#b3b3b3] hover:text-white rounded hover:bg-[#282828] transition-colors"
                                    title="Edit Branch"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove branch "${branch.name}" from ${biz.name}?`)) {
                                        deleteBranch(biz.id, branch.id);
                                      }
                                    }}
                                    className="p-1 text-[#b3b3b3] hover:text-[#f3727f] rounded hover:bg-[#282828] transition-colors"
                                    title="Delete Branch"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
