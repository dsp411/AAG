'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/types/finance';
import { getSimulatedDateString } from '@/lib/simulation-engine';
import {
  Wallet,
  Car,
  Building,
  Landmark,
  TrendingUp,
  CreditCard,
  History,
  FastForward,
  User,
  LogOut,
  ChevronDown,
  UserPlus,
  RotateCcw,
  Sparkles,
  Briefcase,
  MessageCircle,
} from 'lucide-react';

export type NavTab = 'overview' | 'profile' | 'jobs' | 'cars' | 'banks' | 'properties' | 'growth' | 'businesses' | 'loans' | 'simulator' | 'messages';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export function Navbar({ activeTab, setActiveTab, openAuthModal }: NavbarProps) {
  const {
    currentUser,
    allUsers,
    portfolio,
    switchUser,
    logout,
    advanceMonth,
    resetSimulation,
    changeBaseCurrency,
  } = usePortfolio();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const currentDateLabel = portfolio
    ? getSimulatedDateString(portfolio.simulationStartDate, portfolio.simulatedMonth)
    : 'Oct 2026';

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'profile', label: 'Profile & Life', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'jobs', label: 'Careers & Jobs', icon: Briefcase },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'banks', label: 'Banks', icon: Landmark },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'businesses', label: 'Businesses', icon: Briefcase },
    { id: 'growth', label: 'Growth & FDs', icon: TrendingUp },
    { id: 'loans', label: 'Loans & EMIs', icon: CreditCard },
    { id: 'simulator', label: 'Time Engine', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  AAG
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-500 ml-2">
                  Personal Wealth & Career Terminal
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-7 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary actions & User controls */}
          <div className="flex items-center gap-2.5">
            {/* Quick Time Simulator Pill & Advance */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="px-2 py-0.5 text-slate-400 font-mono tabular-nums">
                {currentDateLabel}
              </span>
              <button
                onClick={() => advanceMonth(1)}
                title="Advance 1 Month: Accrues FDs, stocks, salary & auto-deducts EMIs"
                className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors"
              >
                <FastForward className="w-3 h-3" />
                <span>+1 Mo</span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setCurrencyDropdownOpen(!currencyDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
              >
                <span>{currentUser?.currency || 'USD'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
                  <div className="px-3 py-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Display Currency
                  </div>
                  {Object.values(SUPPORTED_CURRENCIES).map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        changeBaseCurrency(curr.code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                        currentUser?.currency === curr.code
                          ? 'bg-slate-800 text-emerald-400 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>
                        {curr.code} ({curr.symbol})
                      </span>
                      <span className="text-[11px] text-slate-500">{curr.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account & Switcher */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setCurrencyDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
              )}

              {userDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-400">@{currentUser.username}</p>
                  </div>

                  <div className="px-3 py-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Switch User Account
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
                          ? 'bg-slate-800/80 text-emerald-400 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] flex items-center justify-center text-slate-300">
                          {u.fullName.charAt(0)}
                        </span>
                        <span className="truncate">{u.fullName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">@{u.username}</span>
                    </button>
                  ))}

                  <div className="border-t border-slate-800 my-1"></div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openAuthModal('register');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Create New Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      resetSimulation();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Simulation to Baseline</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-900 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
