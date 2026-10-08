'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { JobPosition, SalaryRateBasis } from '@/types/finance';
import { formatCurrency, calculateJobMonthlySalary, calculateJobDailyRate, calculateJobHourlyRate } from '@/lib/initial-data';
import {
  X,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Sparkles,
  Building,
  TrendingUp,
  Landmark,
  CheckCircle2,
} from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: JobPosition | null;
}

const CATEGORIES: JobPosition['category'][] = [
  'Tech',
  'Executive',
  'Consulting',
  'Healthcare',
  'Aviation',
  'Trades',
  'Gig & Shift',
  'Creative',
  'Finance',
  'Other',
];

export function JobModal({ isOpen, onClose, jobToEdit }: JobModalProps) {
  const { portfolio, currentUser, addJob, updateJob } = usePortfolio();

  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [company, setCompany] = useState(jobToEdit?.company || '');
  const [category, setCategory] = useState<JobPosition['category']>(jobToEdit?.category || 'Tech');
  const [rateBasis, setRateBasis] = useState<SalaryRateBasis>(jobToEdit?.rateBasis || 'per_hour');
  const [rateAmount, setRateAmount] = useState(jobToEdit ? String(jobToEdit.rateAmount) : '65');
  const [hoursPerDay, setHoursPerDay] = useState(jobToEdit ? String(jobToEdit.hoursPerDay) : '8');
  const [daysPerWeek, setDaysPerWeek] = useState(jobToEdit ? String(jobToEdit.daysPerWeek) : '5');
  const [destinationBankId, setDestinationBankId] = useState(
    jobToEdit?.destinationBankId || portfolio?.bankAccounts[0]?.id || ''
  );
  const [isActive, setIsActive] = useState(jobToEdit ? jobToEdit.isActive : true);
  const [annualAppraisalRate, setAnnualAppraisalRate] = useState(
    jobToEdit ? String(jobToEdit.annualAppraisalRate) : '5.0'
  );
  const [description, setDescription] = useState(jobToEdit?.description || '');

  if (!isOpen || !portfolio) return null;

  const currency = currentUser?.currency || 'USD';
  const numRate = parseFloat(rateAmount) || 0;
  const numHours = parseFloat(hoursPerDay) || 8;
  const numDays = parseFloat(daysPerWeek) || 5;

  const tempJob: JobPosition = {
    id: jobToEdit?.id || 'temp',
    title: title || 'New Position',
    company: company || 'Company',
    category,
    rateBasis,
    rateAmount: numRate,
    hoursPerDay: numHours,
    daysPerWeek: numDays,
    destinationBankId,
    isActive,
    annualAppraisalRate: parseFloat(annualAppraisalRate) || 0,
    totalEarningsToDate: jobToEdit?.totalEarningsToDate || 0,
    shiftsCompleted: jobToEdit?.shiftsCompleted || 0,
    description,
  };

  const monthlyEst = calculateJobMonthlySalary(tempJob);
  const dailyEst = calculateJobDailyRate(tempJob);
  const hourlyEst = calculateJobHourlyRate(tempJob);
  const annualEst = monthlyEst * 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || numRate <= 0) return;

    if (jobToEdit) {
      updateJob({
        ...jobToEdit,
        title: title.trim(),
        company: company.trim(),
        category,
        rateBasis,
        rateAmount: numRate,
        hoursPerDay: numHours,
        daysPerWeek: numDays,
        destinationBankId: destinationBankId || portfolio.bankAccounts[0]?.id || '',
        isActive,
        annualAppraisalRate: parseFloat(annualAppraisalRate) || 0,
        description: description.trim(),
      });
    } else {
      addJob({
        title: title.trim(),
        company: company.trim(),
        category,
        rateBasis,
        rateAmount: numRate,
        hoursPerDay: numHours,
        daysPerWeek: numDays,
        destinationBankId: destinationBankId || portfolio.bankAccounts[0]?.id || '',
        isActive,
        annualAppraisalRate: parseFloat(annualAppraisalRate) || 0,
        description: description.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#181818] border border-[#2e2e2e] w-full max-w-2xl rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.85)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#282828] bg-gradient-to-r from-emerald-950/30 via-[#181818] to-[#181818] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black font-bold flex items-center justify-center shrink-0 shadow-md">
              <Briefcase className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {jobToEdit ? 'Edit Job Position & Wage' : 'Add New Job & Defined Salary'}
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Configure defined pay rates credited on an hourly wage, daily rate, or monthly basis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Live Compensation Telemetry Card */}
          <div className="p-4 bg-[#121212] rounded-xl border border-[#282828] space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
              <span>Calculated Salary Compensation</span>
              <span className="text-[#1ed760] font-mono">Live Simulation Rate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-[#181818] p-2.5 rounded-lg border border-[#242424]">
                <span className="text-[10px] text-[#888] uppercase block font-bold">Per Hour</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  {formatCurrency(hourlyEst, currency)}/hr
                </span>
              </div>
              <div className="bg-[#181818] p-2.5 rounded-lg border border-[#242424]">
                <span className="text-[10px] text-[#888] uppercase block font-bold">Per Day (8h)</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  {formatCurrency(dailyEst, currency)}/day
                </span>
              </div>
              <div className="bg-[#181818] p-2.5 rounded-lg border border-[#242424]">
                <span className="text-[10px] text-[#888] uppercase block font-bold">Monthly Inflow</span>
                <span className="text-sm font-bold font-mono text-[#1ed760] mt-0.5 block">
                  +{formatCurrency(monthlyEst, currency)}/mo
                </span>
              </div>
              <div className="bg-[#181818] p-2.5 rounded-lg border border-[#242424]">
                <span className="text-[10px] text-[#888] uppercase block font-bold">Annual Gross</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  {formatCurrency(annualEst, currency, true)}/yr
                </span>
              </div>
            </div>
          </div>

          {/* 1. Job Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Lead Full-Stack Architect"
                className="w-full p-2.5 bg-[#121212] text-white text-xs rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Company / Employer *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google, Remote Consulting, Self-Employed"
                className="w-full p-2.5 bg-[#121212] text-white text-xs rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Rate Basis Picker: Hourly, Daily, or Monthly */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Salary Credit Basis Option *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRateBasis('per_hour')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  rateBasis === 'per_hour'
                    ? 'bg-[#1ed760]/15 border-[#1ed760] text-white'
                    : 'bg-[#141414] border-[#2e2e2e] text-[#b3b3b3] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-4 h-4 ${rateBasis === 'per_hour' ? 'text-[#1ed760]' : ''}`} />
                  <span className="font-bold text-xs">Per Hour ($/hr)</span>
                </div>
                <p className="text-[10px] mt-1 text-[#888]">Wages credited per hour worked or scheduled</p>
              </button>

              <button
                type="button"
                onClick={() => setRateBasis('per_day')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  rateBasis === 'per_day'
                    ? 'bg-[#1ed760]/15 border-[#1ed760] text-white'
                    : 'bg-[#141414] border-[#2e2e2e] text-[#b3b3b3] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className={`w-4 h-4 ${rateBasis === 'per_day' ? 'text-[#1ed760]' : ''}`} />
                  <span className="font-bold text-xs">Per Day ($/day)</span>
                </div>
                <p className="text-[10px] mt-1 text-[#888]">Day rate credited per workday / shift</p>
              </button>

              <button
                type="button"
                onClick={() => setRateBasis('monthly_fixed')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  rateBasis === 'monthly_fixed'
                    ? 'bg-[#1ed760]/15 border-[#1ed760] text-white'
                    : 'bg-[#141414] border-[#2e2e2e] text-[#b3b3b3] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <DollarSign className={`w-4 h-4 ${rateBasis === 'monthly_fixed' ? 'text-[#1ed760]' : ''}`} />
                  <span className="font-bold text-xs">Monthly Fixed</span>
                </div>
                <p className="text-[10px] mt-1 text-[#888]">Fixed monthly salaried compensation</p>
              </button>
            </div>
          </div>

          {/* 3. Rate Amount & Schedule (Hours/day, Days/week) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Rate Amount ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#888] text-xs font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={rateAmount}
                  onChange={e => setRateAmount(e.target.value)}
                  placeholder={rateBasis === 'per_hour' ? '65' : rateBasis === 'per_day' ? '500' : '10000'}
                  className="w-full pl-7 pr-3 py-2.5 bg-[#121212] text-white text-xs font-mono font-bold rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Hours Per Day
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={hoursPerDay}
                onChange={e => setHoursPerDay(e.target.value)}
                className="w-full p-2.5 bg-[#121212] text-white text-xs font-mono rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Work Days / Week
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={daysPerWeek}
                onChange={e => setDaysPerWeek(e.target.value)}
                className="w-full p-2.5 bg-[#121212] text-white text-xs font-mono rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Category & Destination Bank Vault */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Industry Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-[#121212] text-white text-xs rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Direct Deposit Bank Vault *
              </label>
              <select
                value={destinationBankId}
                onChange={e => setDestinationBankId(e.target.value)}
                className="w-full p-2.5 bg-[#121212] text-white text-xs font-mono rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
              >
                {portfolio.bankAccounts.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} ({formatCurrency(b.balance, b.currency || currency, true)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Appraisal Rate & Active Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Annual Appraisal Raise (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={annualAppraisalRate}
                  onChange={e => setAnnualAppraisalRate(e.target.value)}
                  className="w-full p-2.5 bg-[#121212] text-white text-xs font-mono rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#888] text-xs">
                  % p.a.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="activeJobCheckbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#1ed760] rounded cursor-pointer"
              />
              <label htmlFor="activeJobCheckbox" className="text-xs text-white cursor-pointer select-none">
                <span className="font-bold block">Active Employment</span>
                <span className="text-[#888] text-[11px]">Auto-credit monthly wage in simulation</span>
              </label>
            </div>
          </div>

          {/* 6. Description / Notes */}
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
              Role Description / Shift Notes
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Responsibilities, project milestones, shift schedule or contract details..."
              rows={2}
              className="w-full p-2.5 bg-[#121212] text-white text-xs rounded-lg border border-[#333] focus:border-[#1ed760] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#282828]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-[#4d4d4d] text-white text-xs font-bold uppercase tracking-wider hover:border-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{jobToEdit ? 'Save Changes' : 'Add Job Position'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
