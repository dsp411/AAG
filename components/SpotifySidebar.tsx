'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { NavTab } from './Navbar';
import { getUserSimulatedAge } from '@/lib/initial-data';
import { getSimulatedDateString } from '@/lib/simulation-engine';
import {
  Home,
  Clock,
  Plus,
  User,
  Library,
  Wallet,
  ArrowUpRight,
  MessageCircle,
  Sparkles,
  LayoutGrid,
  List,
  Calendar,
} from 'lucide-react';

interface SpotifySidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openQuickAddModal: () => void;
  openClearModal?: () => void;
  openInvestmentSuggestions?: () => void;
  openSendMoneyModal?: () => void;
}

type LibraryFilterCategory = 'all' | 'profile' | 'messages' | 'simulator';

export function SpotifySidebar({
  activeTab,
  setActiveTab,
  openAuthModal,
  openQuickAddModal,
  openClearModal,
  openInvestmentSuggestions,
  openSendMoneyModal,
}: SpotifySidebarProps) {
  const { currentUser, portfolio } = usePortfolio();
  const [filterCategory, setFilterCategory] = useState<LibraryFilterCategory>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const simulatedAge = getUserSimulatedAge(
    portfolio?.user?.startingAge || currentUser?.startingAge || 28,
    portfolio?.simulatedMonth || 0
  );

  const currentDateLabel = portfolio
    ? getSimulatedDateString(portfolio.simulationStartDate, portfolio.simulatedMonth)
    : 'Oct 2026';

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
  };

  const handleFilterClick = (cat: LibraryFilterCategory, targetTab?: NavTab) => {
    setFilterCategory(cat);
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 xl:w-72 bg-black flex-col gap-2 shrink-0 p-2 h-full select-none">
      {/* Top Box: Brand & Home Overview */}
      <div className="bg-[#121212] rounded-lg p-4 space-y-4">
        {/* Brand */}
        <div
          onClick={() => {
            setActiveTab('overview');
            setFilterCategory('all');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-extrabold text-sm shadow-[0_0_12px_rgba(30,215,96,0.35)]">
            <Wallet className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-[#1ed760] transition-colors">
              AAG
            </span>
          </div>
        </div>

        {/* Primary nav link: Home Overview */}
        <nav className="space-y-1 text-sm font-semibold">
          <button
            onClick={() => {
              setActiveTab('overview');
              setFilterCategory('all');
            }}
            className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'text-white bg-[#282828]'
                : 'text-[#b3b3b3] hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home Overview</span>
          </button>
        </nav>
      </div>

      {/* Second Box: Squared Elements Sidebar Buttons */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col p-4 overflow-hidden min-h-0">
        <div className="flex items-center justify-between text-[#b3b3b3] mb-3">
          <div className="flex items-center gap-2.5 font-semibold text-sm hover:text-white transition-colors cursor-default">
            <Library className="w-5 h-5 text-[#b3b3b3]" />
            <span>Your Library</span>
          </div>
          <div className="flex items-center gap-1">
            {/* View Mode Switcher (List vs Grid) */}
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
              title={viewMode === 'list' ? 'Switch to Grid View' : 'Switch to List View'}
            >
              {viewMode === 'list' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={openQuickAddModal}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
              title="Add new asset, job, or liability"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* High Return Investment Suggestion Pill Card */}
        {openInvestmentSuggestions && (
          <button
            onClick={openInvestmentSuggestions}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-emerald-950/70 to-[#181818] hover:from-emerald-900/80 border border-emerald-500/30 text-left transition-all mb-2 cursor-pointer group shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#1ed760]/10 border border-[#1ed760]/30 flex items-center justify-center text-[#1ed760] shrink-0">
                <Sparkles className="w-3.5 h-3.5 fill-[#1ed760]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-[#1ed760] transition-colors truncate">
                  Invest for More Return
                </div>
                <div className="text-[10px] text-[#a7a7a7] truncate">
                  Deploy cash at higher yields
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#1ed760] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-1" />
          </button>
        )}

        {/* Pinned Category Filter Pills for the 3 Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleFilterClick('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterClick('profile', 'profile')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'profile' || (filterCategory === 'all' && activeTab === 'profile')
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => handleFilterClick('messages', 'messages')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'messages' || (filterCategory === 'all' && activeTab === 'messages')
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => handleFilterClick('simulator', 'simulator')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === 'simulator' || (filterCategory === 'all' && activeTab === 'simulator')
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Time Machine
          </button>
        </div>

        {/* Squared Elements Navigation Area (Only Profile, Messages, Time Machine) */}
        <div className="flex-1 overflow-y-auto scroll-smooth space-y-1.5 pr-1 mt-2">
          {viewMode === 'list' ? (
            /* LIST VIEW: Prominent Squared Elements with Details */
            <>
              {/* 1. User Profile Button */}
              {(filterCategory === 'all' || filterCategory === 'profile') && (
                <button
                  onClick={() => handleSelectTab('profile')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer group relative ${
                    activeTab === 'profile'
                      ? 'bg-[#282828] text-white shadow-sm ring-1 ring-[#1ed760]/30'
                      : 'hover:bg-[#1a1a1a] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {/* Squared Element Visual */}
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-[#1ed760] via-teal-700 to-slate-900 flex items-center justify-center shrink-0 shadow-md overflow-hidden border transition-transform group-hover:scale-105 ${
                      activeTab === 'profile'
                        ? 'border-[#1ed760] shadow-[0_0_12px_rgba(30,215,96,0.25)]'
                        : 'border-[#333333]'
                    }`}
                  >
                    {currentUser?.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-black stroke-[2.5]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-semibold truncate flex items-center justify-between">
                      <span className="truncate group-hover:text-[#1ed760] transition-colors">
                        {currentUser?.fullName || 'Profile & Life'}
                      </span>
                      <span className="text-[10px] text-[#1ed760] font-mono font-bold bg-[#1ed760]/10 px-1.5 py-0.5 rounded shrink-0 ml-1">
                        Age {simulatedAge.label}
                      </span>
                    </div>
                    <div className="text-[#b3b3b3] text-xs truncate mt-0.5">
                      {currentUser?.occupationTitle || 'Career'} · {currentUser?.lifestyleTier || 'Lifestyle'}
                    </div>
                  </div>
                  {activeTab === 'profile' && (
                    <div className="w-1 h-6 bg-[#1ed760] rounded-full absolute left-0 shrink-0" />
                  )}
                </button>
              )}

              {/* 2. Message Button */}
              {(filterCategory === 'all' || filterCategory === 'messages') && (
                <button
                  onClick={() => handleSelectTab('messages')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer group relative ${
                    activeTab === 'messages'
                      ? 'bg-[#282828] text-white shadow-sm ring-1 ring-[#1ed760]/30'
                      : 'hover:bg-[#1a1a1a] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {/* Squared Element Visual */}
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center shrink-0 shadow-md border transition-transform group-hover:scale-105 ${
                      activeTab === 'messages'
                        ? 'border-[#1ed760] shadow-[0_0_12px_rgba(30,215,96,0.25)]'
                        : 'border-[#333333]'
                    }`}
                  >
                    <MessageCircle className="w-6 h-6 text-[#1ed760]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-semibold truncate flex items-center justify-between">
                      <span className="truncate group-hover:text-[#1ed760] transition-colors">
                        Direct Messages
                      </span>
                      <span className="text-[10px] text-[#1ed760] font-mono font-bold bg-[#1ed760]/10 px-1.5 py-0.5 rounded shrink-0 ml-1">
                        Chat
                      </span>
                    </div>
                    <div className="text-[#b3b3b3] text-xs truncate mt-0.5">
                      Direct Messaging · Photos · Wires
                    </div>
                  </div>
                  {activeTab === 'messages' && (
                    <div className="w-1 h-6 bg-[#1ed760] rounded-full absolute left-0 shrink-0" />
                  )}
                </button>
              )}

              {/* 3. Time Machine Button */}
              {(filterCategory === 'all' || filterCategory === 'simulator') && (
                <button
                  onClick={() => handleSelectTab('simulator')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer group relative ${
                    activeTab === 'simulator'
                      ? 'bg-[#282828] text-white shadow-sm ring-1 ring-[#1ed760]/30'
                      : 'hover:bg-[#1a1a1a] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {/* Squared Element Visual */}
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-emerald-700 via-teal-800 to-zinc-950 flex items-center justify-center shrink-0 shadow-md border transition-transform group-hover:scale-105 ${
                      activeTab === 'simulator'
                        ? 'border-[#1ed760] shadow-[0_0_12px_rgba(30,215,96,0.25)]'
                        : 'border-[#333333]'
                    }`}
                  >
                    <Clock className="w-6 h-6 text-[#1ed760]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-semibold truncate flex items-center justify-between">
                      <span className="truncate group-hover:text-[#1ed760] transition-colors">
                        Time Machine
                      </span>
                      <span className="text-[10px] text-[#1ed760] font-mono font-bold bg-[#1ed760]/10 px-1.5 py-0.5 rounded shrink-0 ml-1">
                        {currentDateLabel}
                      </span>
                    </div>
                    <div className="text-[#b3b3b3] text-xs truncate mt-0.5">
                      72h Real World Pace · Ledger
                    </div>
                  </div>
                  {activeTab === 'simulator' && (
                    <div className="w-1 h-6 bg-[#1ed760] rounded-full absolute left-0 shrink-0" />
                  )}
                </button>
              )}
            </>
          ) : (
            /* GRID VIEW: Distinctive Square Cards */
            <div className="grid grid-cols-1 gap-2">
              {/* 1. User Profile Square Card */}
              {(filterCategory === 'all' || filterCategory === 'profile') && (
                <button
                  onClick={() => handleSelectTab('profile')}
                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer group border flex items-center gap-3 ${
                    activeTab === 'profile'
                      ? 'bg-[#282828] border-[#1ed760] shadow-[0_0_16px_rgba(30,215,96,0.2)]'
                      : 'bg-[#181818] border-[#242424] hover:bg-[#202020] hover:border-[#383838]'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1ed760] via-teal-700 to-slate-900 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                    {currentUser?.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-black stroke-[2.5]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1ed760]">PROFILE</span>
                      <span className="text-[10px] text-[#a0a0a0] font-mono">Age {simulatedAge.years}y</span>
                    </div>
                    <div className="text-white text-sm font-bold truncate mt-0.5 group-hover:text-[#1ed760] transition-colors">
                      {currentUser?.fullName || 'Profile & Life'}
                    </div>
                    <div className="text-[#a0a0a0] text-xs truncate mt-0.5">
                      {currentUser?.occupationTitle || 'Career'}
                    </div>
                  </div>
                </button>
              )}

              {/* 2. Message Square Card */}
              {(filterCategory === 'all' || filterCategory === 'messages') && (
                <button
                  onClick={() => handleSelectTab('messages')}
                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer group border flex items-center gap-3 ${
                    activeTab === 'messages'
                      ? 'bg-[#282828] border-[#1ed760] shadow-[0_0_16px_rgba(30,215,96,0.2)]'
                      : 'bg-[#181818] border-[#242424] hover:bg-[#202020] hover:border-[#383838]'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center shrink-0 shadow-md">
                    <MessageCircle className="w-7 h-7 text-[#1ed760]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1ed760]">MESSAGES</span>
                      <span className="text-[10px] text-[#a0a0a0] font-mono">Direct DMs</span>
                    </div>
                    <div className="text-white text-sm font-bold truncate mt-0.5 group-hover:text-[#1ed760] transition-colors">
                      Direct Chat
                    </div>
                    <div className="text-[#a0a0a0] text-xs truncate mt-0.5">
                      Chat, Photos & Wires
                    </div>
                  </div>
                </button>
              )}

              {/* 3. Time Machine Square Card */}
              {(filterCategory === 'all' || filterCategory === 'simulator') && (
                <button
                  onClick={() => handleSelectTab('simulator')}
                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer group border flex items-center gap-3 ${
                    activeTab === 'simulator'
                      ? 'bg-[#282828] border-[#1ed760] shadow-[0_0_16px_rgba(30,215,96,0.2)]'
                      : 'bg-[#181818] border-[#242424] hover:bg-[#202020] hover:border-[#383838]'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-700 via-teal-800 to-zinc-950 flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="w-7 h-7 text-[#1ed760]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1ed760]">TIMELINE</span>
                      <span className="text-[10px] text-[#a0a0a0] font-mono">{currentDateLabel}</span>
                    </div>
                    <div className="text-white text-sm font-bold truncate mt-0.5 group-hover:text-[#1ed760] transition-colors">
                      Time Machine
                    </div>
                    <div className="text-[#a0a0a0] text-xs truncate mt-0.5">
                      Ledger · 72h / Month Pace
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="pt-3 border-t border-[#242424] mt-2">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-[#181818] transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-7 h-7 rounded-full bg-[#1ed760] text-black font-bold flex items-center justify-center text-xs shrink-0">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                  {currentUser.authProvider === 'google' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center p-0.5 shadow">
                      <svg className="w-full h-full" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-xs font-bold truncate flex items-center gap-1.5">
                    <span className="truncate">{currentUser.fullName}</span>
                    {currentUser.isMasterAdmin && (
                      <span className="text-[9px] bg-[#1ed760]/20 text-[#1ed760] font-mono px-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[#b3b3b3] text-[11px] font-mono truncate">
                    {currentUser.email || `@${currentUser.username}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {openClearModal && (
                  <button
                    onClick={openClearModal}
                    className="text-[10px] text-[#f3727f] hover:text-white uppercase font-bold tracking-wider px-2 py-1 rounded-full border border-rose-500/30 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="Clear Everything & Reset Portfolio"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-[10px] text-[#b3b3b3] hover:text-white uppercase font-bold tracking-wider px-2 py-1 rounded-full border border-[#4d4d4d] hover:border-white transition-colors cursor-pointer"
                  title="Switch account"
                >
                  Switch
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-2 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

