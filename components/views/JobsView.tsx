'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { JobPosition, SalaryRateBasis } from '@/types/finance';
import {
  formatCurrency,
  calculateJobMonthlySalary,
  calculateJobDailyRate,
  calculateJobHourlyRate,
} from '@/lib/initial-data';
import {
  Briefcase,
  Plus,
  Clock,
  Calendar,
  Zap,
  DollarSign,
  TrendingUp,
  Edit2,
  Trash2,
  CheckCircle,
  Building,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Power,
} from 'lucide-react';

interface JobsViewProps {
  openAddJobModal: () => void;
  openEditJobModal: (job: JobPosition) => void;
  openShiftModal: (jobId?: string) => void;
}

// Pre-made career catalog opportunities for 1-click hire/application
const CAREER_CATALOG: Omit<JobPosition, 'id' | 'destinationBankId' | 'totalEarningsToDate' | 'shiftsCompleted'>[] = [
  {
    title: 'Lead AI Systems Architect',
    company: 'Neural Compute Labs',
    category: 'Tech',
    rateBasis: 'per_hour',
    rateAmount: 145,
    hoursPerDay: 8,
    daysPerWeek: 5,
    isActive: true,
    annualAppraisalRate: 8.5,
    description: 'High-throughput transformer models, GPU clusters, and real-time distributed inference engines.',
  },
  {
    title: 'Senior M&A Strategy Consultant',
    company: 'McKinsey & Bain Advisory',
    category: 'Consulting',
    rateBasis: 'per_day',
    rateAmount: 2200,
    hoursPerDay: 8,
    daysPerWeek: 3,
    isActive: true,
    annualAppraisalRate: 7.0,
    description: 'Cross-border enterprise mergers, capital structure diligence, and executive restructuring.',
  },
  {
    title: 'Commercial Airline Captain',
    company: 'Aegean & Global Airways',
    category: 'Aviation',
    rateBasis: 'per_day',
    rateAmount: 1750,
    hoursPerDay: 10,
    daysPerWeek: 3,
    isActive: true,
    annualAppraisalRate: 6.0,
    description: 'Long-haul widebody aircraft operations, flight navigation, and international routes.',
  },
  {
    title: 'Locum ER Emergency Physician',
    company: 'Metropolitan Trauma Hospital',
    category: 'Healthcare',
    rateBasis: 'per_hour',
    rateAmount: 320,
    hoursPerDay: 10,
    daysPerWeek: 3,
    isActive: true,
    annualAppraisalRate: 5.5,
    description: 'Emergency medicine, acute trauma stabilization, and critical care shift coverage.',
  },
  {
    title: 'Senior Frontend & UX Architect',
    company: 'OmniWealth Studio',
    category: 'Tech',
    rateBasis: 'per_hour',
    rateAmount: 95,
    hoursPerDay: 8,
    daysPerWeek: 5,
    isActive: true,
    annualAppraisalRate: 7.5,
    description: 'High-performance React architectures, dark mode design systems, and real-time ledger engines.',
  },
  {
    title: 'Fractional Chief Financial Officer (CFO)',
    company: 'Apex Venture Capital',
    category: 'Executive',
    rateBasis: 'per_day',
    rateAmount: 2800,
    hoursPerDay: 8,
    daysPerWeek: 2,
    isActive: true,
    annualAppraisalRate: 6.0,
    description: 'Portfolio company treasury oversight, Series B/C fundraising, and audit governance.',
  },
  {
    title: 'Master Electrical Contractor',
    company: 'Industrial Power Solutions',
    category: 'Trades',
    rateBasis: 'per_hour',
    rateAmount: 110,
    hoursPerDay: 8,
    daysPerWeek: 4,
    isActive: true,
    annualAppraisalRate: 5.0,
    description: 'Commercial grid installations, high-voltage substations, and architectural lighting.',
  },
  {
    title: 'Specialty Espresso Barista & Roaster',
    company: 'Blue Bottle & Artisan Roasters',
    category: 'Gig & Shift',
    rateBasis: 'per_hour',
    rateAmount: 28,
    hoursPerDay: 6,
    daysPerWeek: 4,
    isActive: true,
    annualAppraisalRate: 4.0,
    description: 'Specialty pour-overs, single-origin roasting, and hospitality service.',
  },
];

export function JobsView({ openAddJobModal, openEditJobModal, openShiftModal }: JobsViewProps) {
  const { portfolio, currentUser, addJob, deleteJob, updateJob, doJobShift } = usePortfolio();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [instantShiftSuccess, setInstantShiftSuccess] = useState<string | null>(null);

  if (!portfolio) return null;

  const jobs = portfolio.jobs || [];
  const currency = currentUser?.currency || 'USD';

  const activeJobs = jobs.filter(j => j.isActive);
  const totalMonthlyJobIncome = activeJobs.reduce((sum, j) => sum + calculateJobMonthlySalary(j), 0);
  const totalCareerEarnings = jobs.reduce((sum, j) => sum + (j.totalEarningsToDate || 0), 0);
  const totalShiftsWorked = jobs.reduce((sum, j) => sum + (j.shiftsCompleted || 0), 0);

  const handleQuickShift = (job: JobPosition) => {
    const res = doJobShift(job.id, job.hoursPerDay || 8, 1);
    if (res.success) {
      setInstantShiftSuccess(`Earned +${formatCurrency(res.earnedAmount, currency)} from ${job.title}!`);
      setTimeout(() => setInstantShiftSuccess(null), 3000);
    }
  };

  const toggleJobActive = (job: JobPosition) => {
    updateJob({
      ...job,
      isActive: !job.isActive,
    });
  };

  const handleApplyCareer = (career: typeof CAREER_CATALOG[0]) => {
    const defaultBankId = portfolio.bankAccounts[0]?.id || '';
    addJob({
      ...career,
      destinationBankId: defaultBankId,
    });
  };

  const filteredJobs = activeFilter === 'all'
    ? jobs
    : activeFilter === 'active'
    ? jobs.filter(j => j.isActive)
    : jobs.filter(j => j.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Spotify Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-emerald-900/60 via-[#181818] to-[#121212] p-6 rounded-lg">
        {/* Cover Art Tile */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-gradient-to-br from-[#1ed760] via-emerald-800 to-black shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0 border border-[#282828]">
          <Briefcase className="w-20 h-20 text-black stroke-[2]" />
        </div>

        {/* Album Metadata */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider flex items-center gap-1.5">
            <span>Career & Defined Wages</span>
            <span className="text-[10px] bg-[#1ed760]/20 text-[#1ed760] px-2 py-0.5 rounded-full font-mono font-bold">
              Hourly · Daily · Monthly
            </span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Jobs & Career Center
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3]">
            <span className="text-white font-bold">{portfolio.user.fullName}</span>
            <span>·</span>
            <span>{jobs.length} jobs logged ({activeJobs.length} active)</span>
            <span>·</span>
            <span className="font-mono text-[#1ed760] font-bold">
              +{formatCurrency(totalMonthlyJobIncome, currency)}/mo automated salary
            </span>
            <span>·</span>
            <span className="font-mono text-white">
              {formatCurrency(totalCareerEarnings, currency, true)} career earnings ({totalShiftsWorked} shifts)
            </span>
          </div>
        </div>
      </div>

      {/* Pill Actions */}
      <div className="flex items-center flex-wrap gap-3 px-2">
        <button
          onClick={openAddJobModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Job Position</span>
        </button>

        <button
          onClick={() => openShiftModal()}
          disabled={jobs.length === 0}
          className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#282828] text-white hover:text-[#1ed760] border border-[#3e3e3e] hover:border-[#1ed760]/50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-40"
        >
          <Zap className="w-4 h-4 fill-current text-[#1ed760]" />
          <span>Clock In & Work Shift</span>
        </button>
      </div>

      {/* Success Banner if quick shift worked */}
      {instantShiftSuccess && (
        <div className="p-4 bg-[#1ed760]/15 border border-[#1ed760]/40 text-[#1ed760] rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-md">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{instantShiftSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#282828] scrollbar-none">
        {[
          { id: 'all', label: `All Jobs (${jobs.length})` },
          { id: 'active', label: `Active (${activeJobs.length})` },
          { id: 'tech', label: 'Tech' },
          { id: 'executive', label: 'Executive' },
          { id: 'consulting', label: 'Consulting' },
          { id: 'healthcare', label: 'Healthcare' },
          { id: 'aviation', label: 'Aviation' },
          { id: 'trades', label: 'Trades' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeFilter === tab.id
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Active Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="bg-[#181818] rounded-xl p-12 text-center space-y-4 border border-[#282828]">
          <div className="w-16 h-16 rounded-full bg-[#282828] text-[#b3b3b3] flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Jobs or Defined Salaries Logged</h3>
          <p className="text-xs text-[#b3b3b3] max-w-md mx-auto leading-relaxed">
            Create your custom job position with defined pay on an hourly wage, daily rate, or monthly salary, or apply to pre-made career opportunities below.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={openAddJobModal}
              className="px-6 py-3 bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              Add First Job
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map(job => {
            const monthlySalary = calculateJobMonthlySalary(job);
            const dailyRate = calculateJobDailyRate(job);
            const hourlyRate = calculateJobHourlyRate(job);
            const targetBank = portfolio.bankAccounts.find(b => b.id === job.destinationBankId) || portfolio.bankAccounts[0];

            return (
              <div
                key={job.id}
                className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between group shadow-md ${
                  job.isActive
                    ? 'bg-[#181818] hover:bg-[#222222] border-[#2e2e2e] hover:border-[#3e3e3e]'
                    : 'bg-[#141414] border-[#242424] opacity-75'
                }`}
              >
                <div className="space-y-3">
                  {/* Top: Category Badge & Active Toggle */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#282828] text-[#b3b3b3] border border-[#333]">
                      {job.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleJobActive(job)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                          job.isActive
                            ? 'bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 hover:bg-[#1ed760]/25'
                            : 'bg-[#282828] text-[#888] border border-[#383838] hover:text-white'
                        }`}
                        title={job.isActive ? 'Active for monthly simulation accrual' : 'Paused'}
                      >
                        {job.isActive ? '● Active' : '○ Paused'}
                      </button>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#1ed760] transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-[#b3b3b3] flex items-center gap-1.5 mt-0.5 truncate">
                      <Building className="w-3.5 h-3.5 text-[#888] shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </p>
                  </div>

                  {/* Rate Hero Tile */}
                  <div className="p-3 bg-[#121212] rounded-lg border border-[#242424] space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-[#888] uppercase font-bold tracking-wider">
                        Defined Pay Rate
                      </span>
                      <span className="text-[11px] font-mono text-[#1ed760] font-bold">
                        +{formatCurrency(monthlySalary, currency)}/mo
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold font-mono text-white tabular-nums">
                        {formatCurrency(job.rateAmount, currency)}
                        <span className="text-xs text-[#b3b3b3] font-normal">
                          {job.rateBasis === 'per_hour' ? '/hr' : job.rateBasis === 'per_day' ? '/day' : '/mo'}
                        </span>
                      </span>

                      <span className="text-[11px] text-[#888] font-mono">
                        {job.hoursPerDay || 8}h/day · {job.daysPerWeek || 5}d/wk
                      </span>
                    </div>
                  </div>

                  {/* Metrics: Bank Vault & Career Earnings */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-[#888] block text-[10px] uppercase font-bold">Direct Deposit</span>
                      <span className="text-white font-mono truncate block">
                        {targetBank?.bankName || 'Primary Vault'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#888] block text-[10px] uppercase font-bold">Career Earnings</span>
                      <span className="text-[#1ed760] font-mono font-bold truncate block">
                        {formatCurrency(job.totalEarningsToDate || 0, currency, true)} ({job.shiftsCompleted || 0} shifts)
                      </span>
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-[11px] text-[#888] italic line-clamp-2 border-t border-[#242424] pt-2">
                      &ldquo;{job.description}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#242424]">
                  <button
                    onClick={() => handleQuickShift(job)}
                    className="px-3 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Instantly do shift work and credit wage"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Work Shift</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openShiftModal(job.id)}
                      className="px-2 py-1 text-[11px] text-[#b3b3b3] hover:text-white rounded hover:bg-[#282828] transition-colors"
                      title="Custom shift clock-in"
                    >
                      Clock In
                    </button>
                    <button
                      onClick={() => openEditJobModal(job)}
                      className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#282828] transition-colors"
                      title="Edit job details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete job "${job.title}" at ${job.company}?`)) deleteJob(job.id);
                      }}
                      className="p-1.5 text-[#b3b3b3] hover:text-[#f3727f] rounded-full hover:bg-[#282828] transition-colors"
                      title="Delete job position"
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

      {/* 2. Career Opportunities & Market Catalog */}
      <div className="bg-[#181818] rounded-xl p-6 space-y-4 border border-[#282828] mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1ed760]" />
              <span>Career Opportunities & Market Catalog</span>
            </h3>
            <p className="text-xs text-[#b3b3b3] mt-0.5">
              Instantly apply and add defined wage positions to your active wealth portfolio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {CAREER_CATALOG.map((career, idx) => {
            const isAlreadyAdded = jobs.some(j => j.title === career.title && j.company === career.company);

            return (
              <div
                key={idx}
                className="p-4 bg-[#121212] hover:bg-[#1c1c1c] rounded-lg border border-[#242424] hover:border-[#383838] transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                      {career.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1ed760]">
                      {formatCurrency(career.rateAmount, currency)}
                      {career.rateBasis === 'per_hour' ? '/hr' : career.rateBasis === 'per_day' ? '/day' : '/mo'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1.5 group-hover:text-[#1ed760] transition-colors truncate">
                    {career.title}
                  </h4>
                  <p className="text-xs text-[#b3b3b3] truncate mt-0.5">{career.company}</p>

                  <p className="text-[11px] text-[#888] mt-2 line-clamp-2 leading-relaxed">
                    {career.description}
                  </p>
                </div>

                <button
                  onClick={() => handleApplyCareer(career)}
                  disabled={isAlreadyAdded}
                  className={`w-full py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isAlreadyAdded
                      ? 'bg-[#282828] text-[#888] cursor-default'
                      : 'bg-white hover:bg-[#1ed760] text-black hover:text-black shadow active:scale-95'
                  }`}
                >
                  {isAlreadyAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Hired & Active</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Accept Position</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
