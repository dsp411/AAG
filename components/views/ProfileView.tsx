'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import {
  formatCurrency,
  calculateSummaryMetrics,
  getUserSimulatedAge,
} from '@/lib/initial-data';
import { getSimulatedDateString } from '@/lib/simulation-engine';
import {
  User,
  Briefcase,
  Compass,
  Calendar,
  Clock,
  Target,
  Sparkles,
  TrendingUp,
  DollarSign,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  MapPin,
  Home,
  Heart,
  Edit3,
  CheckCircle2,
  Circle,
  Award,
  Zap,
  Shield,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenEditModal: () => void;
  onOpenTimeMachine: () => void;
}

export function ProfileView({ onOpenEditModal, onOpenTimeMachine }: ProfileViewProps) {
  const { portfolio, currentUser, advanceMonth, resetSimulation } = usePortfolio();

  const user = portfolio?.user || currentUser;
  const metrics = portfolio ? calculateSummaryMetrics(portfolio) : null;

  const simulatedMonth = portfolio?.simulatedMonth || 0;
  const startingAge = user?.startingAge || 28;
  const ageData = getUserSimulatedAge(startingAge, simulatedMonth);

  const targetRetirementAge = user?.targetRetirementAge || 45;
  const yearsUntilRetirement = Math.max(0, +(targetRetirementAge - ageData.totalDecimal).toFixed(1));
  const isRetiredOrFIRE = ageData.totalDecimal >= targetRetirementAge;

  const currentDateLabel = portfolio
    ? getSimulatedDateString(portfolio.simulationStartDate, portfolio.simulatedMonth)
    : 'Oct 2026';

  const simulatedYear = Math.floor(simulatedMonth / 12) + 1;
  const monthInYear = (simulatedMonth % 12) + 1;

  // Financial Metrics for Lifestyle & Career
  const netWorth = metrics?.netWorth || 0;
  const liquidCash = metrics?.bankVal || 0;
  const monthlySalary = user?.monthlySalary || 0;
  const monthlyLivingExpenses = user?.monthlyLifestyleExpense || 0;
  const monthlyRentalIncome = metrics?.monthlyRent || 0;
  const monthlyBusinessDividend = metrics?.monthlyBusinessProfit || 0;
  const totalPassiveMonthlyIncome = Math.max(
    0,
    (metrics?.totalMonthlyInflow || 0) - (metrics?.monthlySalary || 0)
  );

  // FIRE Ratio: Passive Income vs Living Expenses
  const fireRatio = monthlyLivingExpenses > 0
    ? Math.round((totalPassiveMonthlyIncome / monthlyLivingExpenses) * 100)
    : 100;

  // Projected Decades Timeline Data (Ages 25 to 75)
  const decadeMilestones = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70].map(targetAge => {
    const monthsFromNow = Math.max(0, (targetAge - ageData.totalDecimal) * 12);
    // Rough compounding projection at ~8% annualized
    const projectedMultiplier = Math.pow(1 + 0.08 / 12, monthsFromNow);
    const projectedNetWorth = Math.round(netWorth * projectedMultiplier + (monthlySalary * 0.4 * monthsFromNow));
    return {
      age: targetAge,
      projectedNetWorth,
      isPast: ageData.totalDecimal >= targetAge,
      isCurrentDecade: ageData.years >= targetAge && ageData.years < targetAge + 5,
      isRetirementTarget: targetAge === targetRetirementAge,
    };
  });

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* 1. Hero Spotify-Style Banner */}
      <div className="relative rounded-2xl bg-gradient-to-b from-emerald-800/80 via-emerald-950/60 to-[#121212] p-6 sm:p-8 border border-emerald-500/20 shadow-2xl overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1ed760]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#1ed760] via-teal-700 to-black p-1 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                {user?.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#181818] flex items-center justify-center text-4xl font-extrabold text-white">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <button
                onClick={onOpenEditModal}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-lg transition-transform active:scale-90"
                title="Edit Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* User Title & Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                  Verified Identity
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30 font-mono">
                  {user?.lifestyleTier || 'Luxury & High-Flyer'}
                </span>
                {user?.isMasterAdmin && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30">
                    ★ Master Admin
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {user?.fullName || 'Davis Sandhu'}
              </h1>

              {/* Occupation & Location */}
              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-[#b3b3b3] flex-wrap">
                <span className="flex items-center gap-1.5 text-white font-semibold">
                  <Briefcase className="w-4 h-4 text-[#1ed760]" />
                  {user?.occupationTitle || 'Founder & Managing Partner'}
                  {user?.companyName && ` · ${user.companyName}`}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#b3b3b3]" />
                  {user?.locationCity || 'Bellevue & Seattle, WA'}
                </span>
              </div>

              {/* Bio */}
              {user?.bio && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed pt-1">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center sm:justify-end gap-3 shrink-0">
            <button
              onClick={onOpenEditModal}
              className="px-5 py-2.5 rounded-full bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold transition-all border border-[#3e3e3e] flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1ed760]" />
              <span>Edit Profile & Lifestyle</span>
            </button>
            <button
              onClick={onOpenTimeMachine}
              className="px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] active:scale-95 text-black text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(30,215,96,0.35)]"
            >
              <Clock className="w-4 h-4" />
              <span>Time Machine</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Life & Age Growth Engine (Real-Time Telemetry Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Dynamic Age */}
        <div className="bg-[#181818] p-4 sm:p-5 rounded-xl border border-[#282828] hover:border-[#1ed760]/40 transition-colors">
          <div className="flex items-center justify-between text-[#b3b3b3] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Age</span>
            <Calendar className="w-4 h-4 text-[#1ed760]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
            <span>{ageData.years}</span>
            <span className="text-sm font-semibold text-[#1ed760]">yrs</span>
            <span className="text-lg font-bold text-slate-400">{ageData.months}</span>
            <span className="text-xs font-medium text-slate-500">mos</span>
          </div>
          <div className="text-[11px] text-[#888] mt-1.5 flex items-center justify-between">
            <span>Started at {startingAge}y</span>
            <span className="text-[#1ed760] font-mono">+{simulatedMonth} mos elapsed</span>
          </div>
        </div>

        {/* Card 2: Timeline Horizon Date */}
        <div className="bg-[#181818] p-4 sm:p-5 rounded-xl border border-[#282828] hover:border-[#1ed760]/40 transition-colors">
          <div className="flex items-center justify-between text-[#b3b3b3] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Timeline Date</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white truncate">
            {currentDateLabel}
          </div>
          <div className="text-[11px] text-[#888] mt-1.5 flex items-center justify-between">
            <span>Year {simulatedYear} · Month {monthInYear}</span>
            <span className="text-emerald-400 font-bold">Live Flowing</span>
          </div>
        </div>

        {/* Card 3: Target Retirement / FIRE Countdown */}
        <div className="bg-[#181818] p-4 sm:p-5 rounded-xl border border-[#282828] hover:border-[#1ed760]/40 transition-colors">
          <div className="flex items-center justify-between text-[#b3b3b3] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Retirement Horizon</span>
            <Target className="w-4 h-4 text-[#1ed760]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
            {isRetiredOrFIRE ? (
              <span className="text-[#1ed760] text-xl sm:text-2xl">Target Achieved!</span>
            ) : (
              <>
                <span>{yearsUntilRetirement}</span>
                <span className="text-sm font-semibold text-[#1ed760]">years left</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-[#888] mt-1.5 flex items-center justify-between">
            <span>Target Age: {targetRetirementAge}y</span>
            <span className="text-[#1ed760] font-mono">
              {isRetiredOrFIRE ? '100% Free' : `${Math.round(((ageData.totalDecimal - startingAge) / (targetRetirementAge - startingAge)) * 100)}% to FIRE`}
            </span>
          </div>
        </div>

        {/* Card 4: Total Net Worth Growth Velocity */}
        <div className="bg-[#181818] p-4 sm:p-5 rounded-xl border border-[#282828] hover:border-[#1ed760]/40 transition-colors">
          <div className="flex items-center justify-between text-[#b3b3b3] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Net Worth</span>
            <TrendingUp className="w-4 h-4 text-[#1ed760]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono truncate text-[#1ed760]">
            {formatCurrency(netWorth, user?.currency || 'USD')}
          </div>
          <div className="text-[11px] text-[#888] mt-1.5 flex items-center justify-between">
            <span>Liquid Vault:</span>
            <span className="text-white font-mono font-semibold">
              {formatCurrency(liquidCash, user?.currency || 'USD')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Time Machine & Age Accelerator Controller */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#141414] border border-[#282828] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#1ed760] fill-current" />
              <h2 className="text-base font-bold text-white">Time & Age Progression Accelerator</h2>
            </div>
            <p className="text-xs text-[#b3b3b3] mt-0.5">
              Advance time to compound interest, collect career salaries, deduct living expenses, and grow your age.
            </p>
          </div>

          {/* Live Banking Badge & Reset */}
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-full bg-[#1ed760]/15 border border-[#1ed760]/30 text-[#1ed760] text-xs font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse" />
              <span>Live Banking System (10% Annual APY)</span>
            </div>

            <button
              onClick={resetSimulation}
              className="p-2 rounded-full bg-[#242424] hover:bg-[#303030] text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
              title="Reset Timeline to Month 0 Baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#222]">
          <button
            onClick={() => advanceMonth(1)}
            className="p-2.5 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] hover:border-[#1ed760]/40 text-left transition-all"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>+1 Month</span>
              <span className="text-[10px] text-[#1ed760] font-mono">+1 Mo</span>
            </div>
            <div className="text-[10px] text-[#888] mt-0.5">Deposit salary & deduct living</div>
          </button>

          <button
            onClick={() => advanceMonth(3)}
            className="p-2.5 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] hover:border-[#1ed760]/40 text-left transition-all"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>+3 Months (Quarter)</span>
              <span className="text-[10px] text-cyan-400 font-mono">+1 Qtr</span>
            </div>
            <div className="text-[10px] text-[#888] mt-0.5">Quarterly dividends & compound</div>
          </button>

          <button
            onClick={() => advanceMonth(12)}
            className="p-2.5 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] border border-emerald-500/40 hover:border-[#1ed760] text-left transition-all"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>+1 Full Year (+1y Age)</span>
              <span className="text-[10px] text-[#1ed760] font-mono">🎂 Birthday</span>
            </div>
            <div className="text-[10px] text-[#888] mt-0.5">Birthday event & merit raise</div>
          </button>

          <button
            onClick={() => advanceMonth(60)}
            className="p-2.5 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] border border-[#3e3e3e] hover:border-[#1ed760]/60 text-left transition-all"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>+5 Years (Leap Forward)</span>
              <span className="text-[10px] text-[#1ed760] font-mono">+5 Years</span>
            </div>
            <div className="text-[10px] text-[#888] mt-0.5">Massive asset compounding</div>
          </button>
        </div>
      </div>

      {/* 4. Two-Column Detailed Profile: Occupation vs Lifestyle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Occupation & Career Engine */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] space-y-5">
          <div className="flex items-center justify-between border-b border-[#282828] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760]">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Occupation & Career Engine</h3>
                <p className="text-[11px] text-[#b3b3b3]">Primary vocation & cash generation stream</p>
              </div>
            </div>
            <button
              onClick={onOpenEditModal}
              className="text-xs font-semibold text-[#1ed760] hover:underline cursor-pointer"
            >
              Modify
            </button>
          </div>

          {/* Role Header */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#2e2e2e]">
            <div className="text-base font-bold text-white">
              {user?.occupationTitle || 'Founder & Managing Partner'}
            </div>
            <div className="text-xs text-[#1ed760] font-semibold mt-0.5">
              {user?.companyName || 'AAG Capital & Ventures'} · {user?.careerLevel || 'Executive'}
            </div>
            <div className="text-[11px] text-[#888] mt-2">
              Industry: <span className="text-white font-medium">{user?.industry || 'FinTech & AI'}</span>
            </div>
          </div>

          {/* Career Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
              <div className="text-[11px] text-[#888] uppercase tracking-wider">Monthly Base Salary</div>
              <div className="text-lg font-bold text-white font-mono mt-1 text-[#1ed760]">
                {formatCurrency(monthlySalary, user?.currency || 'USD')}
              </div>
              <div className="text-[10px] text-[#888] mt-0.5">
                ${(monthlySalary * 12).toLocaleString()} / year
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
              <div className="text-[11px] text-[#888] uppercase tracking-wider">Annual Raise %</div>
              <div className="text-lg font-bold text-white font-mono mt-1 text-cyan-400">
                +{user?.annualCareerRaiseRate || 8}%
              </div>
              <div className="text-[10px] text-[#888] mt-0.5">Compounded annually</div>
            </div>

            <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
              <div className="text-[11px] text-[#888] uppercase tracking-wider">Experience</div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {user?.experienceYears || 8} yrs
              </div>
              <div className="text-[10px] text-[#888] mt-0.5">Industry tenure</div>
            </div>

            <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
              <div className="text-[11px] text-[#888] uppercase tracking-wider">Work Hours</div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {user?.workHoursPerWeek || 45} hrs/wk
              </div>
              <div className="text-[10px] text-[#888] mt-0.5">Work commitment</div>
            </div>
          </div>
        </div>

        {/* Right Column: Lifestyle & Living Standard */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] space-y-5">
          <div className="flex items-center justify-between border-b border-[#282828] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Lifestyle & Living Standard</h3>
                <p className="text-[11px] text-[#b3b3b3]">Standard of living, residence, and personal upkeep</p>
              </div>
            </div>
            <button
              onClick={onOpenEditModal}
              className="text-xs font-semibold text-[#1ed760] hover:underline cursor-pointer"
            >
              Modify
            </button>
          </div>

          {/* Residence & Location */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#2e2e2e]">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Home className="w-4 h-4 text-[#1ed760]" />
                <span>{user?.residenceType || 'Waterfront Villa & Penthouse'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] font-bold">
                {user?.lifestyleTier || 'Luxury & High-Flyer'}
              </span>
            </div>
            <div className="text-xs text-[#888] mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{user?.locationCity || 'Bellevue & Seattle, WA'}, {user?.locationCountry || 'United States'}</span>
            </div>
          </div>

          {/* Monthly Living Expenses Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#b3b3b3]">Monthly Lifestyle Living Upkeep:</span>
              <span className="font-bold text-rose-400 font-mono">
                -{formatCurrency(monthlyLivingExpenses, user?.currency || 'USD')} / mo
              </span>
            </div>

            {/* FIRE Coverage Gauge */}
            <div className="p-3 rounded-lg bg-[#141414] border border-[#242424] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888]">Passive Income Coverage (FIRE Index):</span>
                <span className="font-mono font-bold text-[#1ed760]">
                  {fireRatio}% {fireRatio >= 100 ? '· Self-Sustaining' : '· Working'}
                </span>
              </div>
              <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-[#1ed760]"
                  style={{ width: `${Math.min(100, fireRatio)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hobbies & Passions */}
          {user?.hobbies && user.hobbies.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                Hobbies, Passions & Motorsport
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.hobbies.map(hobby => (
                  <span
                    key={hobby}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#242424] text-white border border-[#333]"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Life Philosophy */}
          {user?.lifePhilosophy && (
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs italic text-emerald-300">
              &ldquo;{user.lifePhilosophy}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* 5. Life Decades Timeline & Age Compounding Visualizer */}
      <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#282828] pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1ed760]" />
              <span>Life Timeline & Compounding Milestones</span>
            </h3>
            <p className="text-xs text-[#b3b3b3]">
              Projected wealth trajectory across each decade of life from Age 25 to 70
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/30 px-3 py-1 rounded-full self-start sm:self-auto">
            Current: {ageData.label}
          </div>
        </div>

        {/* Timeline Horizontal Track */}
        <div className="overflow-x-auto pb-3 pt-2 scrollbar-none">
          <div className="flex items-center gap-4 min-w-[750px]">
            {decadeMilestones.map(m => (
              <div
                key={m.age}
                className={`flex-1 p-3.5 rounded-xl border transition-all ${
                  m.isCurrentDecade
                    ? 'bg-[#1ed760]/10 border-[#1ed760] shadow-[0_0_20px_rgba(30,215,96,0.2)]'
                    : m.isRetirementTarget
                    ? 'bg-emerald-950/30 border-emerald-500/60'
                    : m.isPast
                    ? 'bg-[#141414] border-[#2e2e2e] opacity-75'
                    : 'bg-[#141414] border-[#282828]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-extrabold text-white font-mono text-sm">Age {m.age}</span>
                  {m.isCurrentDecade && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#1ed760] text-black">
                      YOU ARE HERE
                    </span>
                  )}
                  {m.isRetirementTarget && !m.isCurrentDecade && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-black">
                      FIRE TARGET
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-[#1ed760] font-mono mt-2">
                  {formatCurrency(m.projectedNetWorth, user?.currency || 'USD')}
                </div>
                <div className="text-[10px] text-[#888] mt-0.5">
                  {m.isPast ? 'History' : 'Projected NW'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Life Goals & Bucket List Checklist */}
      <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] space-y-4">
        <div className="flex items-center justify-between border-b border-[#282828] pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#1ed760]" />
              <span>Life Goals & Milestone Bucket List</span>
            </h3>
            <p className="text-xs text-[#b3b3b3]">
              Goals auto-complete as your age progresses or net worth surpasses target milestones
            </p>
          </div>
          <button
            onClick={onOpenEditModal}
            className="text-xs font-semibold text-[#1ed760] hover:underline cursor-pointer"
          >
            Manage Goals
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(user?.lifeGoals && user.lifeGoals.length > 0
            ? user.lifeGoals
            : [
                { id: 'g1', title: 'Reach $5,000,000 Liquid Net Worth', targetAge: 32, targetNetWorth: 5000000, category: 'wealth', completed: false },
                { id: 'g2', title: 'Acquire 76ft Luxury Motor Yacht', targetAge: 30, targetNetWorth: 4000000, category: 'lifestyle', completed: true },
                { id: 'g3', title: 'Achieve Complete Financial Freedom (FIRE Target)', targetAge: 45, targetNetWorth: 15000000, category: 'wealth', completed: false },
              ]
          ).map(goal => (
            <div
              key={goal.id}
              className={`p-4 rounded-xl border transition-all ${
                goal.completed
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#141414] border-[#282828] text-white hover:border-[#383838]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="pt-0.5">
                  {goal.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#1ed760] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${goal.completed ? 'line-through text-emerald-200/80' : 'text-white'}`}>
                    {goal.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#888] mt-1.5 font-mono">
                    {goal.targetAge && <span>Age: {goal.targetAge}y</span>}
                    {goal.targetNetWorth && (
                      <span>NW: ${goal.targetNetWorth.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
