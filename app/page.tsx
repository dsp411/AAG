'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PortfolioProvider, usePortfolio } from '@/lib/portfolio-context';
import { NavTab } from '@/components/Navbar';
import { SpotifySidebar } from '@/components/SpotifySidebar';
import { SpotifyTopBar } from '@/components/SpotifyTopBar';
import { SpotifyPlayerBar } from '@/components/SpotifyPlayerBar';
import { OverviewView } from '@/components/views/OverviewView';
import { ProfileView } from '@/components/views/ProfileView';
import { JobsView } from '@/components/views/JobsView';
import { CarsView } from '@/components/views/CarsView';
import { BankView } from '@/components/views/BankView';
import { PropertiesView } from '@/components/views/PropertiesView';
import { BusinessView } from '@/components/views/BusinessView';
import { GrowthAssetsView } from '@/components/views/GrowthAssetsView';
import { LoansAndEmisView } from '@/components/views/LoansAndEmisView';
import { SimulationLogsView } from '@/components/views/SimulationLogsView';
import { MessagesView } from '@/components/views/MessagesView';
import { AuthModal } from '@/components/AuthModal';
import { QuickAddModal } from '@/components/modals/QuickAddModal';
import { JobModal } from '@/components/modals/JobModal';
import { ShiftWorkModal } from '@/components/modals/ShiftWorkModal';
import { ClearEverythingModal } from '@/components/modals/ClearEverythingModal';
import { AssetUpgradeModal } from '@/components/modals/AssetUpgradeModal';
import { CarModal, SellCarModal } from '@/components/modals/CarModal';
import { BankModal, TransferModal } from '@/components/modals/BankModal';
import { PropertyModal } from '@/components/modals/PropertyModal';
import { BusinessModal } from '@/components/modals/BusinessModal';
import { BranchModal } from '@/components/modals/BranchModal';
import { GrowthAssetModal } from '@/components/modals/GrowthAssetModal';
import { EmiModal, ExpenseModal } from '@/components/modals/EmiModal';
import { PriceAdjusterModal } from '@/components/modals/PriceAdjusterModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { InvestmentSuggestionModal } from '@/components/modals/InvestmentSuggestionModal';
import { SendMoneyModal } from '@/components/modals/SendMoneyModal';
import { MonthlyPayoutModal } from '@/components/modals/MonthlyPayoutModal';
import {
  CarAsset,
  BankAccount,
  PropertyAsset,
  BusinessAsset,
  BusinessBranch,
  JobPosition,
  EmiLiability,
  RecurringExpense,
} from '@/types/finance';
import {
  Download,
  Upload,
  Shield,
  RefreshCw,
  Car,
  Landmark,
  Building,
  Briefcase,
  TrendingUp,
  CreditCard,
  Clock,
  Home,
  Trash2,
  Zap,
  User,
  MessageCircle,
  Send,
  ChevronUp,
} from 'lucide-react';

const emptySubscribe = () => () => {};

function DashboardContent() {
  const { portfolio, currentUser, exportPortfolio, importPortfolio } = usePortfolio();

  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to top when active tab changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top > 280) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [priceAdjusterModalOpen, setPriceAdjusterModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTargetType, setUpgradeTargetType] = useState<'car' | 'property' | 'business'>('car');
  const [upgradeTargetId, setUpgradeTargetId] = useState<string | undefined>(undefined);

  // Job & Shift Modals
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<JobPosition | null>(null);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftPreselectedJobId, setShiftPreselectedJobId] = useState<string | undefined>(undefined);

  const [carModalOpen, setCarModalOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<CarAsset | null>(null);

  const [sellCarModalOpen, setSellCarModalOpen] = useState(false);
  const [carToSell, setCarToSell] = useState<CarAsset | null>(null);

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankToEdit, setBankToEdit] = useState<BankAccount | null>(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<PropertyAsset | null>(null);

  const [businessModalOpen, setBusinessModalOpen] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState<BusinessAsset | null>(null);

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<BusinessBranch | null>(null);
  const [businessForBranch, setBusinessForBranch] = useState<BusinessAsset | null>(null);

  const [growthModalOpen, setGrowthModalOpen] = useState(false);
  const [growthCategory, setGrowthCategory] = useState<'fd' | 'stock' | 'crypto' | 'forex' | 'income'>('fd');
  const [growthItemToEdit, setGrowthItemToEdit] = useState<any>(null);

  const [investmentSuggestionsModalOpen, setInvestmentSuggestionsModalOpen] = useState(false);
  const [monthlyPayoutModalOpen, setMonthlyPayoutModalOpen] = useState(false);
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
  const [sendMoneyRecipient, setSendMoneyRecipient] = useState<string | undefined>(undefined);
  const [sendMoneyBankId, setSendMoneyBankId] = useState<string | undefined>(undefined);

  const [emiModalOpen, setEmiModalOpen] = useState(false);
  const [emiToEdit, setEmiToEdit] = useState<EmiLiability | null>(null);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<RecurringExpense | null>(null);

  const [jsonBackupModalOpen, setJsonBackupModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenAddJob = () => {
    setJobToEdit(null);
    setJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobPosition) => {
    setJobToEdit(job);
    setJobModalOpen(true);
  };

  const handleOpenShiftWork = (jobId?: string) => {
    setShiftPreselectedJobId(jobId);
    setShiftModalOpen(true);
  };

  const handleOpenAddBusiness = () => {
    setBusinessToEdit(null);
    setBusinessModalOpen(true);
  };

  const handleOpenEditBusiness = (biz: BusinessAsset) => {
    setBusinessToEdit(biz);
    setBusinessModalOpen(true);
  };

  const handleOpenAddBranch = (biz: BusinessAsset) => {
    setBusinessForBranch(biz);
    setBranchToEdit(null);
    setBranchModalOpen(true);
  };

  const handleOpenEditBranch = (biz: BusinessAsset, branch: BusinessBranch) => {
    setBusinessForBranch(biz);
    setBranchToEdit(branch);
    setBranchModalOpen(true);
  };

  const handleOpenUpgrade = (type: 'car' | 'property' | 'business', id?: string) => {
    setUpgradeTargetType(type);
    setUpgradeTargetId(id);
    setUpgradeModalOpen(true);
  };

  const handleQuickAdd = (type: 'job' | 'car' | 'bank' | 'property' | 'growth' | 'emi') => {
    if (type === 'job') {
      handleOpenAddJob();
    } else if (type === 'car') {
      setCarToEdit(null);
      setCarModalOpen(true);
    } else if (type === 'bank') {
      setBankToEdit(null);
      setBankModalOpen(true);
    } else if (type === 'property') {
      setPropertyToEdit(null);
      setPropertyModalOpen(true);
    } else if (type === 'growth') {
      setGrowthItemToEdit(null);
      setGrowthCategory('fd');
      setGrowthModalOpen(true);
    } else if (type === 'emi') {
      setEmiToEdit(null);
      setEmiModalOpen(true);
    }
  };

  const handleQuickAddOption = (
    type: 'job' | 'car' | 'bank' | 'property' | 'business' | 'fd' | 'stock' | 'crypto' | 'forex' | 'income' | 'emi' | 'expense'
  ) => {
    if (type === 'job') {
      handleOpenAddJob();
    } else if (type === 'car') {
      setCarToEdit(null);
      setCarModalOpen(true);
    } else if (type === 'bank') {
      setBankToEdit(null);
      setBankModalOpen(true);
    } else if (type === 'property') {
      setPropertyToEdit(null);
      setPropertyModalOpen(true);
    } else if (type === 'business') {
      setBusinessToEdit(null);
      setBusinessModalOpen(true);
    } else if (type === 'fd' || type === 'stock' || type === 'crypto' || type === 'forex' || type === 'income') {
      setGrowthItemToEdit(null);
      setGrowthCategory(type);
      setGrowthModalOpen(true);
    } else if (type === 'emi') {
      setEmiToEdit(null);
      setEmiModalOpen(true);
    } else if (type === 'expense') {
      setExpenseToEdit(null);
      setExpenseModalOpen(true);
    }
  };

  const handleExport = () => {
    const dataStr = exportPortfolio();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aag_${currentUser?.username || 'portfolio'}_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const ok = importPortfolio(importJsonText.trim());
    if (ok) {
      setImportStatus('Portfolio imported successfully!');
      setTimeout(() => {
        setJsonBackupModalOpen(false);
        setImportStatus(null);
        setImportJsonText('');
      }, 1000);
    } else {
      setImportStatus('Invalid JSON portfolio structure. Please check and retry.');
    }
  };

  const mobileNavItems: { tab: NavTab; label: string; icon: React.ElementType }[] = [
    { tab: 'overview', label: 'Home', icon: Home },
    { tab: 'profile', label: 'Profile', icon: User },
    { tab: 'messages', label: 'Messages', icon: MessageCircle },
    { tab: 'jobs', label: 'Jobs', icon: Briefcase },
    { tab: 'cars', label: 'Cars', icon: Car },
    { tab: 'banks', label: 'Banks', icon: Landmark },
    { tab: 'properties', label: 'Real Estate', icon: Building },
    { tab: 'businesses', label: 'Businesses', icon: Briefcase },
    { tab: 'growth', label: 'Growth & FDs', icon: TrendingUp },
    { tab: 'loans', label: 'Loans & EMI', icon: CreditCard },
    { tab: 'simulator', label: 'Ledger', icon: Clock },
  ];

  if (!isMounted) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1ed760] flex items-center justify-center shadow-[0_0_24px_rgba(30,215,96,0.3)] animate-pulse">
            <span className="text-black font-extrabold text-base tracking-tight">AAG</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
            <span>Loading Wealth Engine...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-[#ffffff] flex flex-col font-sans overflow-hidden select-none selection:bg-[#1ed760]/30 selection:text-white">
      {/* Main Center Area: Sidebar + Scrollable View */}
      <div className="flex-1 flex overflow-hidden p-1.5 sm:p-2 gap-2 pb-24 sm:pb-[98px]">
        {/* Left Spotify Sidebar (Desktop/Tablet) */}
        <SpotifySidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openAuthModal={handleOpenAuth}
          openQuickAddModal={() => setQuickAddModalOpen(true)}
          openClearModal={() => setClearModalOpen(true)}
          openInvestmentSuggestions={() => setInvestmentSuggestionsModalOpen(true)}
          openSendMoneyModal={() => setSendMoneyModalOpen(true)}
        />

        {/* Right Main Scrollable View Area */}
        <div
          ref={mainScrollRef}
          onScroll={handleScroll}
          className="flex-1 bg-[#121212] rounded-lg overflow-y-auto scroll-smooth flex flex-col relative focus:outline-none"
        >
          {/* Sticky Spotify Top Bar */}
          <SpotifyTopBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openAuthModal={handleOpenAuth}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            openQuickAddModal={() => setQuickAddModalOpen(true)}
            openPriceAdjuster={() => setPriceAdjusterModalOpen(true)}
            openClearModal={() => setClearModalOpen(true)}
            openShiftModal={() => handleOpenShiftWork()}
            openInvestmentSuggestions={() => setInvestmentSuggestionsModalOpen(true)}
            openSendMoneyModal={() => setSendMoneyModalOpen(true)}
          />

          {/* Mobile Quick Category Pills */}
          <div className="md:hidden px-4 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto scroll-smooth scrollbar-none border-b border-[#282828]/40 bg-[#121212]">
            {mobileNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white text-black'
                      : 'bg-[#242424] text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content View Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'overview' && (
              <OverviewView
                setActiveTab={setActiveTab}
                openAddModal={handleQuickAdd}
                openPriceAdjuster={() => setPriceAdjusterModalOpen(true)}
                openShiftModal={() => handleOpenShiftWork()}
                openClearModal={() => setClearModalOpen(true)}
                openUpgradeModal={handleOpenUpgrade}
                openInvestmentSuggestions={() => setInvestmentSuggestionsModalOpen(true)}
                openSendMoneyModal={() => setSendMoneyModalOpen(true)}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                onOpenEditModal={() => setProfileModalOpen(true)}
                onOpenTimeMachine={() => setActiveTab('simulator')}
              />
            )}

            {activeTab === 'jobs' && (
              <JobsView
                openAddJobModal={handleOpenAddJob}
                openEditJobModal={handleOpenEditJob}
                openShiftModal={handleOpenShiftWork}
              />
            )}

            {activeTab === 'cars' && (
              <CarsView
                openAddCarModal={() => {
                  setCarToEdit(null);
                  setCarModalOpen(true);
                }}
                openSellCarModal={car => {
                  setCarToSell(car);
                  setSellCarModalOpen(true);
                }}
                openEditCarModal={car => {
                  setCarToEdit(car);
                  setCarModalOpen(true);
                }}
                openUpgradeModal={handleOpenUpgrade}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesView initialChatUsername={sendMoneyRecipient} />
            )}

            {activeTab === 'banks' && (
              <BankView
                openAddBankModal={() => {
                  setBankToEdit(null);
                  setBankModalOpen(true);
                }}
                openTransferModal={() => setTransferModalOpen(true)}
                openEditBankModal={bank => {
                  setBankToEdit(bank);
                  setBankModalOpen(true);
                }}
                openSendMoneyModal={bankId => {
                  setSendMoneyBankId(bankId);
                  setSendMoneyModalOpen(true);
                }}
                openMonthlyPayoutModal={() => setMonthlyPayoutModalOpen(true)}
              />
            )}

            {activeTab === 'properties' && (
              <PropertiesView
                openAddPropertyModal={() => {
                  setPropertyToEdit(null);
                  setPropertyModalOpen(true);
                }}
                openEditPropertyModal={prop => {
                  setPropertyToEdit(prop);
                  setPropertyModalOpen(true);
                }}
                openUpgradeModal={handleOpenUpgrade}
              />
            )}

            {activeTab === 'businesses' && (
              <BusinessView
                openAddBusinessModal={handleOpenAddBusiness}
                openEditBusinessModal={handleOpenEditBusiness}
                openAddBranchModal={handleOpenAddBranch}
                openEditBranchModal={handleOpenEditBranch}
                openUpgradeModal={handleOpenUpgrade}
              />
            )}

            {activeTab === 'growth' && (
              <GrowthAssetsView
                openAddAssetModal={category => {
                  setGrowthItemToEdit(null);
                  setGrowthCategory(category);
                  setGrowthModalOpen(true);
                }}
                openEditModal={(type, item) => {
                  setGrowthCategory(type);
                  setGrowthItemToEdit(item);
                  setGrowthModalOpen(true);
                }}
                openInvestmentSuggestions={() => setInvestmentSuggestionsModalOpen(true)}
              />
            )}

            {activeTab === 'loans' && (
              <LoansAndEmisView
                openAddEmiModal={() => {
                  setEmiToEdit(null);
                  setEmiModalOpen(true);
                }}
                openAddExpenseModal={() => {
                  setExpenseToEdit(null);
                  setExpenseModalOpen(true);
                }}
                openEditEmiModal={emi => {
                  setEmiToEdit(emi);
                  setEmiModalOpen(true);
                }}
                openEditExpenseModal={exp => {
                  setExpenseToEdit(exp);
                  setExpenseModalOpen(true);
                }}
              />
            )}

            {activeTab === 'simulator' && <SimulationLogsView />}
          </main>

          {/* Spotify-styled Footer */}
          <footer className="border-t border-[#282828] bg-[#121212] py-6 px-6 text-xs text-[#b3b3b3] mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-wide">AAG</span>
                <span>·</span>
                <span>Personal Wealth, Careers, Fleet, Real Estate, Compound Growth & EMI Engine</span>
                {currentUser && (
                  <>
                    <span>·</span>
                    <span className="text-[#1ed760] font-mono font-semibold">@{currentUser.username}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setClearModalOpen(true)}
                  className="hover:text-rose-400 text-rose-500/80 transition-colors flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider text-[11px]"
                  title="Wipe or Reset Portfolio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear / Reset</span>
                </button>
                <span>·</span>
                <button
                  onClick={handleExport}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
                <span>·</span>
                <button
                  onClick={() => setJsonBackupModalOpen(true)}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider text-[11px]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Backup</span>
                </button>
              </div>
            </div>
          </footer>

          {/* Smooth Scroll To Top Floating Action Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-24 sm:bottom-28 right-4 sm:right-8 z-40 p-3 rounded-full bg-[#1ed760] text-black shadow-[0_6px_24px_rgba(30,215,96,0.45)] hover:bg-[#3be477] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group"
              aria-label="Smooth scroll to top"
              title="Smooth Scroll to Top"
            >
              <ChevronUp className="w-5 h-5 stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Spotify Bottom Simulation Player Bar */}
      <SpotifyPlayerBar
        onOpenLedger={() => setActiveTab('simulator')}
        onOpenPriceAdjuster={() => setPriceAdjusterModalOpen(true)}
      />

      {/* Profile & Lifestyle Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddModalOpen}
        onClose={() => setQuickAddModalOpen(false)}
        onSelect={handleQuickAddOption}
      />

      {/* Price Adjuster Modal */}
      <PriceAdjusterModal
        isOpen={priceAdjusterModalOpen}
        onClose={() => setPriceAdjusterModalOpen(false)}
      />

      {/* Asset Upgrade & Modification Modal */}
      <AssetUpgradeModal
        key={`${upgradeTargetType}_${upgradeTargetId || 'none'}_${upgradeModalOpen ? 'open' : 'closed'}`}
        isOpen={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          setUpgradeTargetId(undefined);
        }}
        targetType={upgradeTargetType}
        targetId={upgradeTargetId}
      />

      {/* Clear Everything & Wipe Modal */}
      <ClearEverythingModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
      />

      {/* Job & Shift Work Modals */}
      <JobModal
        key={jobToEdit?.id || (jobModalOpen ? 'open_job' : 'closed_job')}
        isOpen={jobModalOpen}
        onClose={() => {
          setJobModalOpen(false);
          setJobToEdit(null);
        }}
        jobToEdit={jobToEdit}
      />

      <ShiftWorkModal
        key={shiftPreselectedJobId || (shiftModalOpen ? 'open_shift' : 'closed_shift')}
        isOpen={shiftModalOpen}
        onClose={() => {
          setShiftModalOpen(false);
          setShiftPreselectedJobId(undefined);
        }}
        preselectedJobId={shiftPreselectedJobId}
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <CarModal
        key={carToEdit?.id || (carModalOpen ? 'open_car' : 'closed_car')}
        isOpen={carModalOpen}
        onClose={() => {
          setCarModalOpen(false);
          setCarToEdit(null);
        }}
        carToEdit={carToEdit}
      />

      <SellCarModal
        key={carToSell?.id || (sellCarModalOpen ? 'open_sell_car' : 'closed_sell_car')}
        isOpen={sellCarModalOpen}
        onClose={() => {
          setSellCarModalOpen(false);
          setCarToSell(null);
        }}
        car={carToSell}
      />

      <BankModal
        key={bankToEdit?.id || (bankModalOpen ? 'open_bank' : 'closed_bank')}
        isOpen={bankModalOpen}
        onClose={() => {
          setBankModalOpen(false);
          setBankToEdit(null);
        }}
        bankToEdit={bankToEdit}
      />

      <TransferModal
        key={transferModalOpen ? 'open_transfer' : 'closed_transfer'}
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />

      <PropertyModal
        key={propertyToEdit?.id || (propertyModalOpen ? 'open_prop' : 'closed_prop')}
        isOpen={propertyModalOpen}
        onClose={() => {
          setPropertyModalOpen(false);
          setPropertyToEdit(null);
        }}
        propertyToEdit={propertyToEdit}
      />

      <BusinessModal
        key={businessToEdit?.id || (businessModalOpen ? 'open_biz' : 'closed_biz')}
        isOpen={businessModalOpen}
        onClose={() => {
          setBusinessModalOpen(false);
          setBusinessToEdit(null);
        }}
        businessToEdit={businessToEdit}
      />

      {businessForBranch && (
        <BranchModal
          key={branchToEdit?.id || (branchModalOpen ? 'open_branch' : 'closed_branch')}
          isOpen={branchModalOpen}
          onClose={() => {
            setBranchModalOpen(false);
            setBranchToEdit(null);
          }}
          business={businessForBranch}
          branchToEdit={branchToEdit}
        />
      )}

      <GrowthAssetModal
        key={growthItemToEdit?.id || growthCategory || (growthModalOpen ? 'open_growth' : 'closed_growth')}
        isOpen={growthModalOpen}
        onClose={() => {
          setGrowthModalOpen(false);
          setGrowthItemToEdit(null);
        }}
        initialCategory={growthCategory}
        itemToEdit={growthItemToEdit}
      />

      <InvestmentSuggestionModal
        key={investmentSuggestionsModalOpen ? 'open_suggestions' : 'closed_suggestions'}
        isOpen={investmentSuggestionsModalOpen}
        onClose={() => setInvestmentSuggestionsModalOpen(false)}
        onOpenAssetModal={(type, data) => {
          if (type === 'fd' || type === 'stock' || type === 'crypto') {
            setGrowthCategory(type);
            setGrowthItemToEdit(data);
            setGrowthModalOpen(true);
          } else if (type === 'property') {
            setPropertyToEdit(data);
            setPropertyModalOpen(true);
          } else if (type === 'business') {
            setBusinessToEdit(data);
            setBusinessModalOpen(true);
          }
        }}
      />

      <EmiModal
        key={emiToEdit?.id || (emiModalOpen ? 'open_emi' : 'closed_emi')}
        isOpen={emiModalOpen}
        onClose={() => {
          setEmiModalOpen(false);
          setEmiToEdit(null);
        }}
        emiToEdit={emiToEdit}
      />

      <ExpenseModal
        key={expenseToEdit?.id || (expenseModalOpen ? 'open_expense' : 'closed_expense')}
        isOpen={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
      />

      {/* JSON Backup Modal */}
      {jsonBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#282828] w-full max-w-lg rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.8)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Import Portfolio Ledger JSON</h3>
              <button
                onClick={() => setJsonBackupModalOpen(false)}
                className="text-[#b3b3b3] hover:text-white text-xs uppercase font-bold"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-[#b3b3b3]">
              Paste exported JSON data below to restore your complete portfolio (cars, properties, bank accounts, jobs, stocks, FDs, and EMIs).
            </p>
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder='{"version": 1, "user": {...}, "cars": [...]}'
                rows={8}
                className="w-full p-3 text-xs bg-[#121212] text-white font-mono rounded-lg border border-[#333333] focus:border-white focus:outline-none"
              />

              {importStatus && (
                <p
                  className={`text-xs ${
                    importStatus.includes('successfully') ? 'text-[#1ed760]' : 'text-[#f3727f]'
                  }`}
                >
                  {importStatus}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJsonBackupModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#4d4d4d] text-white text-xs font-bold uppercase tracking-wider hover:border-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Import Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Send Money to User (P2P Wire) Modal */}
      {sendMoneyModalOpen && (
        <SendMoneyModal
          isOpen={sendMoneyModalOpen}
          onClose={() => {
            setSendMoneyModalOpen(false);
            setSendMoneyRecipient(undefined);
            setSendMoneyBankId(undefined);
          }}
          preselectedRecipientUsername={sendMoneyRecipient}
          onSuccessOpenChat={username => {
            setSendMoneyModalOpen(false);
            setSendMoneyRecipient(username);
            setActiveTab('messages');
          }}
        />
      )}

      {/* Monthly Net Profit Payout Modal */}
      {monthlyPayoutModalOpen && (
        <MonthlyPayoutModal
          isOpen={monthlyPayoutModalOpen}
          onClose={() => setMonthlyPayoutModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function HomeDashboardPage() {
  return (
    <PortfolioProvider>
      <DashboardContent />
    </PortfolioProvider>
  );
}
