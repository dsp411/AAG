'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { UserAccount, LifestyleTier, LifeGoal } from '@/types/finance';
import { validateAppUsername, sanitizeAppUsername } from '@/lib/username-rules';
import {
  X,
  User,
  Briefcase,
  Compass,
  Calendar,
  Target,
  Sparkles,
  DollarSign,
  TrendingUp,
  MapPin,
  Home,
  Heart,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AtSign,
  AlertCircle,
  Check,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { currentUser, portfolio, updateUserProfile, allUsers } = usePortfolio();

  const user = portfolio?.user || currentUser;

  const [activeTab, setActiveTab] = useState<'identity' | 'occupation' | 'lifestyle' | 'timeline' | 'goals'>('identity');

  // Identity Form State
  const [username, setUsername] = useState(user?.username || '');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [lifePhilosophy, setLifePhilosophy] = useState(user?.lifePhilosophy || '');

  // Occupation Form State
  const [occupationTitle, setOccupationTitle] = useState(user?.occupationTitle || 'Founder & Managing Partner');
  const [companyName, setCompanyName] = useState(user?.companyName || 'AAG Capital & Ventures');
  const [industry, setIndustry] = useState(user?.industry || 'FinTech & High-Performance Assets');
  const [careerLevel, setCareerLevel] = useState(user?.careerLevel || 'Founder & CEO');
  const [monthlySalary, setMonthlySalary] = useState(user?.monthlySalary?.toString() || '25000');
  const [annualCareerRaiseRate, setAnnualCareerRaiseRate] = useState(user?.annualCareerRaiseRate?.toString() || '8');
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears?.toString() || '8');
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState(user?.workHoursPerWeek?.toString() || '45');

  // Lifestyle Form State
  const [lifestyleTier, setLifestyleTier] = useState<LifestyleTier>(user?.lifestyleTier || 'Luxury & High-Flyer');
  const [residenceType, setResidenceType] = useState(user?.residenceType || 'Waterfront Villa & City Penthouse');
  const [locationCity, setLocationCity] = useState(user?.locationCity || 'Bellevue & Seattle, WA');
  const [locationCountry, setLocationCountry] = useState(user?.locationCountry || 'United States');
  const [monthlyLifestyleExpense, setMonthlyLifestyleExpense] = useState(user?.monthlyLifestyleExpense?.toString() || '7500');
  const [hobbiesText, setHobbiesText] = useState((user?.hobbies || ['Supercars', 'Private Aviation', 'Horology', 'Yachting']).join(', '));

  // Timeline & Age Form State
  const [startingAge, setStartingAge] = useState(user?.startingAge?.toString() || '28');
  const [targetRetirementAge, setTargetRetirementAge] = useState(user?.targetRetirementAge?.toString() || '45');
  const [lifeExpectancy, setLifeExpectancy] = useState(user?.lifeExpectancy?.toString() || '88');
  const [relationshipStatus, setRelationshipStatus] = useState(user?.relationshipStatus || 'Single');
  const [dependentsCount, setDependentsCount] = useState(user?.dependentsCount?.toString() || '0');

  // Life Goals State
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>(
    user?.lifeGoals && user.lifeGoals.length > 0
      ? user.lifeGoals
      : [
          {
            id: 'goal_1',
            title: 'Reach $5,000,000 Liquid Net Worth',
            targetAge: 32,
            targetNetWorth: 5000000,
            category: 'wealth',
            completed: false,
          },
          {
            id: 'goal_2',
            title: 'Acquire Flagship Waterfront Residence',
            targetAge: 35,
            targetNetWorth: 8000000,
            category: 'lifestyle',
            completed: false,
          },
          {
            id: 'goal_3',
            title: 'Achieve Complete Financial Freedom (FIRE Target)',
            targetAge: 45,
            targetNetWorth: 15000000,
            category: 'wealth',
            completed: false,
          },
        ]
  );

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAge, setNewGoalAge] = useState('');
  const [newGoalNetWorth, setNewGoalNetWorth] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'wealth' | 'lifestyle' | 'career' | 'health'>('wealth');

  if (!isOpen) return null;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const newGoal: LifeGoal = {
      id: `goal_${Date.now()}`,
      title: newGoalTitle.trim(),
      targetAge: newGoalAge ? parseFloat(newGoalAge) : undefined,
      targetNetWorth: newGoalNetWorth ? parseFloat(newGoalNetWorth) : undefined,
      category: newGoalCategory,
      completed: false,
    };
    setLifeGoals([...lifeGoals, newGoal]);
    setNewGoalTitle('');
    setNewGoalAge('');
    setNewGoalNetWorth('');
  };

  const handleToggleGoal = (goalId: string) => {
    setLifeGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setLifeGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const handleSave = () => {
    setUsernameError(null);

    const val = validateAppUsername(username, allUsers.map(u => u.username), user?.username);
    if (!val.isValid) {
      setUsernameError(val.errorMessage || 'Invalid username. Must be 3-10 letters or numbers combinations.');
      setActiveTab('identity');
      return;
    }

    const hobbiesArray = hobbiesText
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    const updates: Partial<UserAccount> = {
      username: val.normalized,
      fullName: fullName.trim() || user?.fullName || 'User',
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || user?.avatarUrl,
      lifePhilosophy: lifePhilosophy.trim(),

      // Occupation
      occupationTitle: occupationTitle.trim(),
      companyName: companyName.trim(),
      industry: industry.trim(),
      careerLevel,
      monthlySalary: Math.max(0, parseFloat(monthlySalary) || 0),
      annualCareerRaiseRate: Math.max(0, parseFloat(annualCareerRaiseRate) || 0),
      experienceYears: Math.max(0, parseInt(experienceYears, 10) || 0),
      workHoursPerWeek: Math.max(0, parseInt(workHoursPerWeek, 10) || 40),

      // Lifestyle
      lifestyleTier,
      residenceType: residenceType.trim(),
      locationCity: locationCity.trim(),
      locationCountry: locationCountry.trim(),
      monthlyLifestyleExpense: Math.max(0, parseFloat(monthlyLifestyleExpense) || 0),
      hobbies: hobbiesArray,

      // Timeline & Age
      startingAge: Math.max(18, parseInt(startingAge, 10) || 28),
      targetRetirementAge: Math.max(30, parseInt(targetRetirementAge, 10) || 48),
      lifeExpectancy: Math.max(60, parseInt(lifeExpectancy, 10) || 88),
      relationshipStatus,
      dependentsCount: Math.max(0, parseInt(dependentsCount, 10) || 0),

      // Goals
      lifeGoals,
    };

    updateUserProfile(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282828] bg-gradient-to-r from-[#202020] to-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 flex items-center justify-center text-[#1ed760]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Personal Profile & Lifestyle Engine</h2>
              <p className="text-xs text-[#b3b3b3]">
                Configure identity, occupation earnings, living standard, timeline, and life milestones
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#282828] bg-[#141414] px-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('identity')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'identity'
                ? 'border-[#1ed760] text-white'
                : 'border-transparent text-[#b3b3b3] hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Identity & Bio</span>
          </button>
          <button
            onClick={() => setActiveTab('occupation')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'occupation'
                ? 'border-[#1ed760] text-white'
                : 'border-transparent text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Occupation & Career</span>
          </button>
          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'lifestyle'
                ? 'border-[#1ed760] text-white'
                : 'border-transparent text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Lifestyle & Living</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-[#1ed760] text-white'
                : 'border-transparent text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Age & Time Horizon</span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'goals'
                ? 'border-[#1ed760] text-white'
                : 'border-transparent text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Life Goals ({lifeGoals.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* TAB 1: IDENTITY */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3] flex items-center gap-1.5">
                    <span>Username Handle</span>
                    <span className="text-[10px] text-[#1ed760] font-normal lowercase bg-[#1ed760]/10 px-2 py-0.5 rounded-full border border-[#1ed760]/20">
                      Standard format
                    </span>
                  </label>
                  <span className={`text-[11px] font-mono ${username.length > 30 ? 'text-rose-400 font-bold' : 'text-[#888]'}`}>
                    {username.length}/30
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1ed760]">
                    <AtSign className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(sanitizeAppUsername(e.target.value))}
                    placeholder="e.g. davis99"
                    maxLength={10}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-[#121212] border rounded-lg text-sm text-white focus:outline-none transition-colors font-mono ${
                      usernameError || !validateAppUsername(username, allUsers.map(u => u.username), user?.username).isValid
                        ? 'border-rose-500/70 focus:border-rose-400'
                        : 'border-[#333] focus:border-[#1ed760]'
                    }`}
                  />
                </div>

                {/* Real-time username validation helper */}
                {(() => {
                  const val = validateAppUsername(username, allUsers.map(u => u.username), user?.username);
                  return (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#141414] border border-[#262626] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-white font-semibold">@{val.normalized}</span>
                        {val.isValid ? (
                          <span className="text-[#1ed760] flex items-center gap-1 text-[11px] font-bold">
                            <Check className="w-3.5 h-3.5" />
                            Valid & Available
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 text-[11px] font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {val.errorMessage || usernameError}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-[#888] pt-1 border-t border-[#222]">
                        <span className={val.rules.noSpaces ? 'text-[#1ed760]' : 'text-rose-400'}>
                          {val.rules.noSpaces ? '✓' : '✗'} No spaces
                        </span>
                        <span className={val.rules.validLength ? 'text-[#1ed760]' : 'text-rose-400'}>
                          {val.rules.validLength ? '✓' : '✗'} 3-10 chars
                        </span>
                        <span className={val.rules.validChars ? 'text-[#1ed760]' : 'text-rose-400'}>
                          {val.rules.validChars ? '✓' : '✗'} Letters & numbers only
                        </span>
                        <span className={val.rules.isAvailable ? 'text-[#1ed760]' : 'text-rose-400'}>
                          {val.rules.isAvailable ? '✓' : '✗'} Unique handle
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Davis Sandhu"
                  className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                  Avatar Photo URL
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#242424] border border-[#3e3e3e] shrink-0 flex items-center justify-center">
                    {avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-[#b3b3b3]" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://... image link or leave blank for default"
                    className="flex-1 bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                </div>
                {/* Preset Avatars */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-[#b3b3b3]">Presets:</span>
                  {[
                    { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
                    { label: 'Executive Female', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
                    { label: 'Founder Modern', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                    { label: 'Tech Leader', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAvatarUrl(p.url)}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#242424] hover:bg-[#333] text-white transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                  Personal Biography & Story
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Share a short bio summarizing your background, experience, and passions..."
                  className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                  Core Life Philosophy / Vision
                </label>
                <input
                  type="text"
                  value={lifePhilosophy}
                  onChange={e => setLifePhilosophy(e.target.value)}
                  placeholder="e.g. Relentless compounding, physical peak health, absolute freedom, and enduring enterprise impact."
                  className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                />
              </div>
            </div>
          )}

          {/* TAB 2: OCCUPATION & CAREER */}
          {activeTab === 'occupation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Job Title / Occupation
                  </label>
                  <input
                    type="text"
                    value={occupationTitle}
                    onChange={e => setOccupationTitle(e.target.value)}
                    placeholder="e.g. Founder & Managing Partner"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. AAG Capital & Ventures"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    placeholder="e.g. FinTech, AI & High-Performance Assets"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Career Seniority Level
                  </label>
                  <select
                    value={careerLevel}
                    onChange={e => setCareerLevel(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                  >
                    <option value="Founder & CEO">Founder & CEO</option>
                    <option value="C-Suite Executive">C-Suite Executive (CTO/CFO/COO)</option>
                    <option value="Managing Director / VP">Managing Director / Vice President</option>
                    <option value="Senior Partner">Senior Partner / Principal</option>
                    <option value="Lead / Staff Specialist">Lead / Staff Specialist</option>
                    <option value="Senior Professional">Senior Professional</option>
                    <option value="Mid-Level Professional">Mid-Level Professional</option>
                    <option value="Private Investor / Tycoon">Private Investor / Tycoon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#282828]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5 flex items-center justify-between">
                    <span>Base Monthly Compensation</span>
                    <span className="text-[10px] text-[#1ed760] font-mono">Deposited every month</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-[#b3b3b3]" />
                    <input
                      type="number"
                      value={monthlySalary}
                      onChange={e => setMonthlySalary(e.target.value)}
                      placeholder="25000"
                      className="w-full bg-[#121212] border border-[#333] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#888] mt-1">
                    Annual base: ${((parseFloat(monthlySalary) || 0) * 12).toLocaleString()}/year
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5 flex items-center justify-between">
                    <span>Annual Career Raise / Appraisal %</span>
                    <span className="text-[10px] text-[#1ed760] font-mono">Applies every 12 months</span>
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-3 w-4 h-4 text-[#b3b3b3]" />
                    <input
                      type="number"
                      step="0.5"
                      value={annualCareerRaiseRate}
                      onChange={e => setAnnualCareerRaiseRate(e.target.value)}
                      placeholder="8"
                      className="w-full bg-[#121212] border border-[#333] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#888] mt-1">
                    Next year salary: ${(
                      (parseFloat(monthlySalary) || 0) *
                      (1 + (parseFloat(annualCareerRaiseRate) || 0) / 100)
                    ).toLocaleString()}/mo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Weekly Work Hours
                  </label>
                  <input
                    type="number"
                    value={workHoursPerWeek}
                    onChange={e => setWorkHoursPerWeek(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIFESTYLE & LIVING */}
          {activeTab === 'lifestyle' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                  Standard of Living Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      'Frugal & Lean',
                      'Comfortable Professional',
                      'High-Income Executive',
                      'Luxury & High-Flyer',
                      'Ultra-HNW / Jet-Setter',
                    ] as LifestyleTier[]
                  ).map(tier => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setLifestyleTier(tier)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        lifestyleTier === tier
                          ? 'border-[#1ed760] bg-[#1ed760]/10 text-white font-bold shadow-[0_0_15px_rgba(30,215,96,0.15)]'
                          : 'border-[#333] bg-[#121212] text-[#b3b3b3] hover:text-white hover:border-[#444]'
                      }`}
                    >
                      <div className="text-xs font-semibold">{tier}</div>
                      <div className="text-[10px] text-[#888] mt-1">
                        {tier === 'Frugal & Lean' && 'Minimalist essentials, maximum compounding velocity'}
                        {tier === 'Comfortable Professional' && 'Quality dining, clean urban residence, travel'}
                        {tier === 'High-Income Executive' && 'Premium apartments, fine dining, international trips'}
                        {tier === 'Luxury & High-Flyer' && 'Waterfront estates, supercars, private charters'}
                        {tier === 'Ultra-HNW / Jet-Setter' && 'Superyachts, global private residences, concierge'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Primary Residence Type
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 w-4 h-4 text-[#b3b3b3]" />
                    <input
                      type="text"
                      value={residenceType}
                      onChange={e => setResidenceType(e.target.value)}
                      placeholder="e.g. Waterfront Villa & Penthouse"
                      className="w-full bg-[#121212] border border-[#333] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5 flex items-center justify-between">
                    <span>Monthly Lifestyle Living Upkeep</span>
                    <span className="text-[10px] text-rose-400 font-mono">Auto-deducted monthly</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-[#b3b3b3]" />
                    <input
                      type="number"
                      value={monthlyLifestyleExpense}
                      onChange={e => setMonthlyLifestyleExpense(e.target.value)}
                      placeholder="7500"
                      className="w-full bg-[#121212] border border-[#333] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#888] mt-1">
                    Fine dining, travel, wellness, and personal lifestyle upkeep.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    City of Residence
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#b3b3b3]" />
                    <input
                      type="text"
                      value={locationCity}
                      onChange={e => setLocationCity(e.target.value)}
                      placeholder="e.g. Bellevue, WA or Manhattan, NY"
                      className="w-full bg-[#121212] border border-[#333] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={locationCountry}
                    onChange={e => setLocationCountry(e.target.value)}
                    placeholder="e.g. United States, Switzerland, UAE"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                  Hobbies, Passions & Motorsport (comma-separated)
                </label>
                <input
                  type="text"
                  value={hobbiesText}
                  onChange={e => setHobbiesText(e.target.value)}
                  placeholder="Supercar Track Days, Aviation, Horology, Yachting, Alpine Skiing"
                  className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                />
              </div>
            </div>
          )}

          {/* TAB 4: AGE & TIME HORIZON */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#181818] to-slate-900/40 border border-[#1ed760]/30">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                  <Sparkles className="w-4 h-4 text-[#1ed760]" />
                  <span>Time & Money Compounding Engine</span>
                </div>
                <p className="text-xs text-[#b3b3b3]">
                  As you simulate time forward in the Time Machine (+1 Mo, +1 Year, or Live Auto-Play), your
                  <strong> age grows precisely with time</strong>. Each full year elapsed triggers birthdays, career
                  merit appraisals, compounding interest, and progress toward your target retirement!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Baseline Starting Age
                  </label>
                  <input
                    type="number"
                    value={startingAge}
                    onChange={e => setStartingAge(e.target.value)}
                    placeholder="28"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                  <p className="text-[11px] text-[#888] mt-1">Starting age at Day 1</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Target Retirement Age
                  </label>
                  <input
                    type="number"
                    value={targetRetirementAge}
                    onChange={e => setTargetRetirementAge(e.target.value)}
                    placeholder="45"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                  <p className="text-[11px] text-[#888] mt-1">Financial freedom target age</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Target Life Expectancy
                  </label>
                  <input
                    type="number"
                    value={lifeExpectancy}
                    onChange={e => setLifeExpectancy(e.target.value)}
                    placeholder="88"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                  <p className="text-[11px] text-[#888] mt-1">Long-term vision horizon</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#282828]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Relationship Status
                  </label>
                  <select
                    value={relationshipStatus}
                    onChange={e => setRelationshipStatus(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                  >
                    <option value="Single">Single</option>
                    <option value="In a Relationship">In a Relationship</option>
                    <option value="Engaged">Engaged</option>
                    <option value="Married">Married</option>
                    <option value="Family with Children">Family with Children</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                    Number of Dependents
                  </label>
                  <input
                    type="number"
                    value={dependentsCount}
                    onChange={e => setDependentsCount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1ed760] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIFE GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Life Goals & Milestone Bucket List</h3>
                  <p className="text-xs text-[#b3b3b3]">
                    Objectives will automatically unlock as your age progresses or net worth hits the target.
                  </p>
                </div>
              </div>

              {/* Goals list */}
              <div className="space-y-2">
                {lifeGoals.map(goal => (
                  <div
                    key={goal.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      goal.completed
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-[#121212] border-[#333] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          goal.completed
                            ? 'bg-[#1ed760] border-[#1ed760] text-black'
                            : 'border-[#555] hover:border-white'
                        }`}
                      >
                        {goal.completed && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold truncate ${
                            goal.completed ? 'line-through text-emerald-300/80' : 'text-white'
                          }`}
                        >
                          {goal.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#888] mt-0.5">
                          {goal.targetAge && <span>Target Age: {goal.targetAge}y</span>}
                          {goal.targetNetWorth && (
                            <span>Net Worth: ${goal.targetNetWorth.toLocaleString()}</span>
                          )}
                          <span className="capitalize px-1.5 py-0.2 rounded bg-[#242424] text-[10px]">
                            {goal.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-[#666] hover:text-rose-400 p-1.5 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Goal Form */}
              <form onSubmit={handleAddGoal} className="p-3 rounded-lg bg-[#141414] border border-[#2e2e2e] space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Add New Life Goal</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newGoalTitle}
                      onChange={e => setNewGoalTitle(e.target.value)}
                      placeholder="Goal description (e.g. Own First Supercar)"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#1ed760]"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={newGoalAge}
                      onChange={e => setNewGoalAge(e.target.value)}
                      placeholder="Target Age (e.g. 35)"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#1ed760]"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={newGoalNetWorth}
                      onChange={e => setNewGoalNetWorth(e.target.value)}
                      placeholder="Target NW ($)"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#1ed760]"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <select
                    value={newGoalCategory}
                    onChange={e => setNewGoalCategory(e.target.value as any)}
                    className="bg-[#1a1a1a] border border-[#333] rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="wealth">Category: Wealth</option>
                    <option value="lifestyle">Category: Lifestyle</option>
                    <option value="career">Category: Career</option>
                    <option value="health">Category: Health</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#1ed760] text-black font-bold text-xs rounded hover:bg-[#1fdf64] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Goal</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#282828] bg-[#141414]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-[#444] text-xs font-bold text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(30,215,96,0.3)] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Life Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
