'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/types/finance';
import { getSimulatedDateString } from '@/lib/simulation-engine';
import { getUserSimulatedAge } from '@/lib/initial-data';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  UserPlus,
  RotateCcw,
  LogOut,
  FastForward,
  Plus,
  Wallet,
  SlidersHorizontal,
  Zap,
  Trash2,
  Briefcase,
  User,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Send,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface SpotifyTopBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openQuickAddModal: () => void;
  openPriceAdjuster?: () => void;
  openClearModal?: () => void;
  openShiftModal?: () => void;
  openInvestmentSuggestions?: () => void;
  openSendMoneyModal?: () => void;
}

export function SpotifyTopBar({
  activeTab,
  setActiveTab,
  openAuthModal,
  searchQuery,
  setSearchQuery,
  openQuickAddModal,
  openPriceAdjuster,
  openClearModal,
  openShiftModal,
  openInvestmentSuggestions,
  openSendMoneyModal,
}: SpotifyTopBarProps) {
  const {
    currentUser,
    allUsers,
    switchUser,
    logout,
    advanceMonth,
    resetSimulation,
    changeBaseCurrency,
    portfolio,
  } = usePortfolio();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const currentDateLabel = portfolio
    ? getSimulatedDateString(portfolio.simulationStartDate, portfolio.simulatedMonth)
    : 'Oct 2026';

  const simulatedAge = getUserSimulatedAge(
    portfolio?.user?.startingAge || currentUser?.startingAge || 28,
    portfolio?.simulatedMonth || 0
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#121212]/95 backdrop-blur-md px-6 flex items-center justify-between gap-4 border-b border-[#282828]/50">
      {/* Left: Navigation Buttons & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        {/* Mobile brand indicator */}
        <div
          onClick={() => setActiveTab('overview')}
          className="md:hidden flex items-center gap-1.5 cursor-pointer shrink-0"
          title="AAG Home"
        >
          <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-extrabold text-xs shadow-md">
            <Wallet className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
        </div>

        {/* Back / Forward circle buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="w-8 h-8 rounded-full bg-black/60 text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Overview"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className="w-8 h-8 rounded-full bg-black/60 text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Simulator"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search Pill Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#b3b3b3]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search assets, vehicles, bank accounts, or loans..."
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] text-white placeholder-[#7c7c7c] text-xs font-normal pl-9 pr-4 py-2.5 rounded-full border border-transparent focus:border-white focus:outline-none transition-all [box-shadow:rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset]"
          />
        </div>
      </div>

      {/* Right: Primary Action, Next Month Fast-Forward, Currency, User Menu */}
      <div className="flex items-center gap-2.5">
        {/* Primary Action: New Item */}
        <button
          onClick={openQuickAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Item</span>
        </button>

        {/* Advance +1 Month Button (Spotify Theme Secondary CTA) */}
        <button
          onClick={() => advanceMonth(1)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#181818] hover:bg-[#282828] text-white hover:text-[#1ed760] text-xs font-bold uppercase tracking-wider border border-[#4d4d4d] hover:border-[#1ed760]/50 transition-all cursor-pointer active:scale-95"
          title="Advance timeline by 1 month"
        >
          <FastForward className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Next Month</span>
          <span className="sm:hidden">+1 Mo</span>
        </button>

        {/* Currency Pill Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setCurrencyDropdownOpen(!currencyDropdownOpen);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#242424] text-white text-xs font-bold uppercase tracking-wider border border-[#4d4d4d] hover:border-white transition-all cursor-pointer"
          >
            <span>{currentUser?.currency || 'USD'}</span>
            <ChevronDown className="w-3 h-3 text-[#b3b3b3]" />
          </button>

          {currencyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-[#b3b3b3] uppercase tracking-wider">
                Display Currency
              </div>
              {Object.values(SUPPORTED_CURRENCIES).map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    changeBaseCurrency(c.code);
                    setCurrencyDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    currentUser?.currency === c.code
                      ? 'text-[#1ed760] font-bold bg-[#333333]'
                      : 'text-white hover:bg-[#333333]'
                  }`}
                >
                  <span>{c.code} ({c.symbol})</span>
                  <span className="text-[11px] text-[#b3b3b3]">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Pill Button */}
        <div className="relative">
          {currentUser ? (
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setCurrencyDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1 pr-3 rounded-full bg-[#181818] hover:bg-[#282828] border border-transparent hover:border-[#4d4d4d] transition-all cursor-pointer"
            >
              <div className="relative w-7 h-7 rounded-full bg-[#1ed760] text-black font-bold flex items-center justify-center text-xs">
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
              <span className="text-white text-xs font-bold max-w-[100px] truncate hidden md:inline">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/20 px-1.5 py-0.5 rounded-full font-mono hidden sm:inline">
                {simulatedAge.years}y
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#b3b3b3]" />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 bg-white hover:bg-[#eeeeee] active:scale-95 text-black font-bold text-xs uppercase tracking-wider rounded-full transition-transform cursor-pointer"
            >
              Log In
            </button>
          )}

          {/* User Dropdown */}
          {userDropdownOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-64 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#383838]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">{currentUser.fullName}</p>
                  <span className="text-[10px] bg-[#1ed760]/20 text-[#1ed760] font-mono font-bold px-1.5 py-0.5 rounded">
                    Age {simulatedAge.years}
                  </span>
                </div>
                <p className="text-[11px] text-[#b3b3b3] font-mono">
                  {currentUser.email || `@${currentUser.username}`}
                </p>
                {currentUser.occupationTitle && (
                  <p className="text-[11px] text-[#1ed760] font-medium truncate mt-0.5">
                    {currentUser.occupationTitle}
                  </p>
                )}
                {currentUser.isMasterAdmin && (
                  <p className="text-[10px] text-[#1ed760] font-mono mt-0.5">★ Master Admin Privileges</p>
                )}
              </div>

              {/* Profile & Lifestyle Direct Link */}
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  setActiveTab('profile');
                }}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#333333] flex items-center justify-between font-semibold border-b border-[#383838]"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#1ed760]" />
                  <span>My Profile & Lifestyle</span>
                </div>
                <span className="text-[10px] text-[#b3b3b3] font-mono">{simulatedAge.label}</span>
              </button>

              {/* Investment Suggestions Link */}
              {openInvestmentSuggestions && (
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    openInvestmentSuggestions();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-[#333333] flex items-center justify-between font-semibold border-b border-[#383838]"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
                    <span>💡 High-Return Suggestions</span>
                  </div>
                  <span className="text-[10px] text-[#1ed760] font-bold bg-[#1ed760]/10 px-1.5 py-0.5 rounded">
                    More Return
                  </span>
                </button>
              )}

              <div className="px-3 py-1.5 text-[10px] font-bold text-[#b3b3b3] uppercase tracking-wider">
                Switch User
              </div>
              {allUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.username);
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    u.username === currentUser.username
                      ? 'text-[#1ed760] font-bold bg-[#333333]'
                      : 'text-white hover:bg-[#333333]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-[#181818] text-[10px] font-bold flex items-center justify-center text-white">
                      {u.fullName.charAt(0)}
                    </span>
                    <span className="truncate">{u.fullName}</span>
                  </div>
                  <span className="text-[10px] text-[#b3b3b3] font-mono">@{u.username}</span>
                </button>
              ))}

              <div className="border-t border-[#383838] my-1"></div>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  if (openShiftModal) openShiftModal();
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#1ed760] hover:bg-[#333333] flex items-center gap-2 font-semibold"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Clock In & Work Shift</span>
              </button>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  openAuthModal('register');
                }}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#333333] flex items-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#b3b3b3]" />
                <span>Create New Account</span>
              </button>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  resetSimulation();
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#ffa42b] hover:bg-[#333333] flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Timeline to Day 1</span>
              </button>

              {openClearModal && (
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    openClearModal();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear & Start from Beginning</span>
                </button>
              )}

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#f3727f] hover:bg-[#333333] flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
