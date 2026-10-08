'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PortfolioData,
  UserAccount,
  CarAsset,
  BankAccount,
  PropertyAsset,
  BusinessAsset,
  BusinessBranch,
  FixedDepositAsset,
  StockAsset,
  CryptoAsset,
  ForexAsset,
  IncomeSource,
  JobPosition,
  SalaryRateBasis,
  EmiLiability,
  RecurringExpense,
  CurrencyCode,
  ChatMessage,
  SharedFinancialData,
} from '@/types/finance';
import { DEMO_USERS, createDavisPortfolio, createCleanPortfolio } from './initial-data';
import { advancePortfolioOneMonth, advancePortfolioNMonths, syncOfflineElapsedProfitAndBanking } from './simulation-engine';
import {
  saveUserToFirestore,
  getUserFromFirestore,
  getAllUsersFromFirestore,
  savePortfolioToFirestore,
  getPortfolioFromFirestore,
  testFirestoreConnection,
} from './firebase';

interface AuthAndPortfolioContextType {
  currentUser: UserAccount | null;
  allUsers: UserAccount[];
  portfolio: PortfolioData | null;
  isLoading: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  isMasterAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    password: string,
    fullName: string,
    currency: CurrencyCode,
    starterType: 'executive' | 'clean'
  ) => Promise<{ success: boolean; error?: string }>;
  continueWithGoogle: (params: {
    email: string;
    fullName: string;
    avatarUrl?: string;
    googleId?: string;
    currency?: CurrencyCode;
    starterType?: 'executive' | 'clean';
  }) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  logout: () => void;
  switchUser: (username: string) => void;
  updateUserProfile: (profileUpdates: Partial<UserAccount>) => void;
  refreshPortfolio: () => Promise<void>;

  // Simulation controls & Reset
  advanceMonth: (months?: number) => void;
  resetSimulation: () => void;
  clearEverything: (mode?: 'blank_slate' | 'reset_clean_starter' | 'reset_demo_portfolio' | 'reset_timeline') => void;

  // Jobs & Defined Salary (Hourly & Daily Shifts)
  addJob: (job: Omit<JobPosition, 'id' | 'totalEarningsToDate' | 'shiftsCompleted'>) => void;
  updateJob: (job: JobPosition) => void;
  deleteJob: (id: string) => void;
  doJobShift: (
    jobId: string,
    hoursWorked?: number,
    daysWorked?: number,
    note?: string
  ) => { success: boolean; earnedAmount: number; error?: string };

  // Asset CRUD
  addCar: (car: Omit<CarAsset, 'id'>) => { success: boolean; error?: string };
  updateCar: (car: CarAsset) => void;
  upgradeCar: (carId: string, upgradeCost: number, upgradeName: string, bankAccountId: string) => { success: boolean; error?: string };
  deleteCar: (id: string) => void;
  sellCar: (id: string, salePrice: number, depositBankId: string) => void;

  addBankAccount: (bank: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (bank: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  transferFunds: (sourceBankId: string, destBankId: string, amount: number) => { success: boolean; error?: string };

  addProperty: (prop: Omit<PropertyAsset, 'id'>) => { success: boolean; error?: string };
  updateProperty: (prop: PropertyAsset) => void;
  upgradeProperty: (propertyId: string, upgradeCost: number, upgradeName: string, bankAccountId: string) => { success: boolean; error?: string };
  deleteProperty: (id: string) => void;

  // Business & Branches CRUD
  addBusiness: (
    business: Omit<BusinessAsset, 'id' | 'branches'>,
    initialBranches?: Omit<BusinessBranch, 'id'>[],
    fundingBankId?: string,
    purchaseCost?: number
  ) => { success: boolean; error?: string };
  updateBusiness: (business: BusinessAsset) => void;
  deleteBusiness: (id: string) => void;
  addBranch: (businessId: string, branch: Omit<BusinessBranch, 'id'>, fundingBankId?: string) => { success: boolean; error?: string };
  updateBranch: (businessId: string, branch: BusinessBranch) => void;
  deleteBranch: (businessId: string, branchId: string) => void;
  investInBusiness: (businessId: string, amount: number, bankAccountId: string, targetBranchId?: string, note?: string) => { success: boolean; error?: string };

  // Master Admin Controls (davissandhu2@gmail.com only)
  updateMasterRates: (settings: {
    propertyAppreciationRate?: number;
    propertyMortgageRate?: number;
    vehicleDepreciationRate?: number;
    vehicleFinanceRate?: number;
  }) => { success: boolean; error?: string };

  addFixedDeposit: (
    fd: Omit<FixedDepositAsset, 'id' | 'monthsElapsed' | 'isMatured' | 'currentAccruedValue'>,
    fundingBankId?: string
  ) => { success: boolean; error?: string };
  updateFixedDeposit: (fd: FixedDepositAsset) => void;
  deleteFixedDeposit: (id: string) => void;

  addStock: (stock: Omit<StockAsset, 'id'>, fundingBankId?: string) => { success: boolean; error?: string };
  updateStock: (stock: StockAsset) => void;
  deleteStock: (id: string) => void;

  addCrypto: (crypto: Omit<CryptoAsset, 'id'>, fundingBankId?: string) => { success: boolean; error?: string };
  updateCrypto: (crypto: CryptoAsset) => void;
  deleteCrypto: (id: string) => void;

  addForex: (forex: Omit<ForexAsset, 'id'>, fundingBankId?: string) => { success: boolean; error?: string };
  updateForex: (forex: ForexAsset) => void;
  deleteForex: (id: string) => void;

  addIncomeSource: (income: Omit<IncomeSource, 'id'>) => void;
  updateIncomeSource: (income: IncomeSource) => void;
  deleteIncomeSource: (id: string) => void;

  addEmi: (emi: Omit<EmiLiability, 'id' | 'tenureMonthsRemaining'>) => void;
  updateEmi: (emi: EmiLiability) => void;
  deleteEmi: (id: string) => void;
  payoffEmi: (id: string, bankAccountId: string) => { success: boolean; error?: string };
  prepayEmiPrincipal: (id: string, amount: number, bankAccountId: string) => { success: boolean; error?: string };
  toggleOverdraftProtection: (bankId: string, enabled: boolean, backupSweepBankId?: string) => void;

  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
  updateRecurringExpense: (expense: RecurringExpense) => void;
  deleteRecurringExpense: (id: string) => void;

  // Currency & Backup
  bulkUpdatePrices: (updates: {
    cars?: { id: string; currentValue: number }[];
    properties?: { id: string; currentValue: number; monthlyRentalIncome?: number }[];
    businesses?: { id: string; valuation: number; monthlyNetProfit?: number }[];
    branches?: { businessId: string; branchId: string; valuation: number; monthlyRevenue?: number; monthlyExpenses?: number }[];
    stocks?: { id: string; currentPrice: number }[];
    crypto?: { id: string; currentPrice: number }[];
    forex?: { id: string; currentExchangeRate: number }[];
    fixedDeposits?: { id: string; principal: number }[];
    emis?: { id: string; remainingPrincipal: number }[];
    recurringExpenses?: { id: string; monthlyAmount: number }[];
    incomeSources?: { id: string; monthlyAmount: number }[];
  }) => void;
  changeBaseCurrency: (currency: CurrencyCode) => void;
  exportPortfolio: () => string;
  importPortfolio: (jsonData: string) => boolean;

  // Social Chat & P2P Money Transfer
  sendChatMessage: (
    receiverUsername: string,
    text?: string,
    photoUrl?: string,
    sharedData?: SharedFinancialData,
    videoUrl?: string,
    mediaType?: 'photo' | 'video'
  ) => Promise<{ success: boolean; message?: ChatMessage; error?: string }>;
  fetchChatMessages: (counterpartUsername: string) => Promise<ChatMessage[]>;
  fetchChatThreads: () => Promise<any[]>;
  markThreadRead: (counterpartUsername: string) => Promise<void>;
  transferMoneyToUser: (
    receiverUsername: string,
    fromBankAccountId: string,
    amount: number,
    memo?: string
  ) => Promise<{ success: boolean; error?: string; transactionId?: string }>;
}

const PortfolioContext = createContext<AuthAndPortfolioContextType | null>(null);

const STORAGE_KEY_USERS = 'omniwealth_all_users_v2';
const STORAGE_KEY_ACTIVE_USER = 'omniwealth_active_user_v2';
const portfolioKey = (username: string) => `omniwealth_portfolio_v2_${username.toLowerCase()}`;

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<UserAccount[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(DEMO_USERS[0]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(createDavisPortfolio);

  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Load client localStorage and cloud accounts on mount
  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (!isMounted) return;
      try {
        // 1. Load users from localStorage
        const storedUsersRaw = localStorage.getItem(STORAGE_KEY_USERS);
        let list: UserAccount[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : DEMO_USERS;
        if (!storedUsersRaw) {
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEMO_USERS));
        }

        // 2. Determine active user
        const activeUsername = localStorage.getItem(STORAGE_KEY_ACTIVE_USER) || 'davis';
        const user = list.find(u => u.username.toLowerCase() === activeUsername.toLowerCase()) || list[0];

        setAllUsers(list);
        setCurrentUser(user);

        // 3. Load portfolio for active user
        const raw = localStorage.getItem(portfolioKey(user.username));
        if (raw) {
          const parsed: PortfolioData = JSON.parse(raw);
          const defaultDavis = createDavisPortfolio();
          if (!parsed.businesses) {
            parsed.businesses = user.username.toLowerCase() === 'davis' ? defaultDavis.businesses : [];
          }
          if (parsed.cars) {
            parsed.cars = parsed.cars.map(c => {
              const match = defaultDavis.cars.find(dc => dc.id === c.id);
              return {
                ...c,
                imageUrl: c.imageUrl || match?.imageUrl,
                photos: c.photos && c.photos.length > 0 ? c.photos : (c.imageUrl ? [c.imageUrl] : match?.photos),
              };
            });
          }
          if (parsed.properties) {
            parsed.properties = parsed.properties.map(p => {
              const match = defaultDavis.properties.find(dp => dp.id === p.id);
              return {
                ...p,
                imageUrl: p.imageUrl || match?.imageUrl,
                photos: p.photos && p.photos.length > 0 ? p.photos : (p.imageUrl ? [p.imageUrl] : match?.photos),
              };
            });
          }
          const syncRes = syncOfflineElapsedProfitAndBanking(parsed);
          setPortfolio(syncRes.portfolio);
          if (syncRes.wasOffline && syncRes.monthsElapsed > 0) {
            try {
              localStorage.setItem(portfolioKey(user.username), JSON.stringify(syncRes.portfolio));
            } catch {}
          }
        } else {
          const initial = user.username.toLowerCase() === 'davis' ? createDavisPortfolio() : createCleanPortfolio(user);
          const syncRes = syncOfflineElapsedProfitAndBanking(initial);
          setPortfolio(syncRes.portfolio);
        }
      } catch (err) {
        console.warn('Error reading localStorage on mount:', err);
      }
    });

    // Test Firestore connection
    testFirestoreConnection().then(connected => {
      if (connected) {
        // Fetch from Firestore
        getAllUsersFromFirestore().then(firestoreUsers => {
          if (isMounted && firestoreUsers.length > 0) {
            setAllUsers(prev => {
              const map = new Map(prev.map(u => [u.username.toLowerCase(), u]));
              firestoreUsers.forEach(acc => {
                if (!map.has(acc.username.toLowerCase())) {
                  map.set(acc.username.toLowerCase(), acc);
                }
              });
              const merged = Array.from(map.values());
              try {
                localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }).catch(() => {});
      }
    });

    // Also fetch server storage
    fetch('/api/aeg-account/users')
      .then(r => r.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.accounts)) {
          setAllUsers(prev => {
            const map = new Map(prev.map(u => [u.username.toLowerCase(), u]));
            data.accounts.forEach((acc: UserAccount) => {
              if (!map.has(acc.username.toLowerCase())) {
                map.set(acc.username.toLowerCase(), acc);
              }
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch(() => {
        // Offline or server booting
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const savePortfolio = useCallback((updated: PortfolioData) => {
    setPortfolio(updated);
    if (updated.user?.username) {
      try {
        localStorage.setItem(portfolioKey(updated.user.username), JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving portfolio to local cache:', err);
      }

      // Synchronize to Firestore database
      savePortfolioToFirestore(updated.user.username, updated).catch(err => {
        console.warn('Firestore sync warning:', err);
      });

      // Synchronize to cloud server in background
      setSyncStatus('syncing');
      fetch('/api/aeg-account/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: updated.user.username,
          portfolio: updated,
        }),
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            setSyncStatus('synced');
          } else {
            setSyncStatus('offline');
          }
        })
        .catch(() => {
          setSyncStatus('offline');
        });
    }
  }, []);

  const loadPortfolioForUser = useCallback(async (user: UserAccount) => {
    // 1. Check local cache first
    const raw = localStorage.getItem(portfolioKey(user.username));
    if (raw) {
      try {
        const parsed: PortfolioData = JSON.parse(raw);
        const defaultDavis = createDavisPortfolio();
        if (!parsed.businesses) {
          parsed.businesses = user.username.toLowerCase() === 'davis' ? defaultDavis.businesses : [];
        }
        if (parsed.cars) {
          parsed.cars = parsed.cars.map(c => {
            const match = defaultDavis.cars.find(dc => dc.id === c.id);
            return {
              ...c,
              imageUrl: c.imageUrl || match?.imageUrl,
              photos: c.photos && c.photos.length > 0 ? c.photos : (c.imageUrl ? [c.imageUrl] : match?.photos),
            };
          });
        }
        if (parsed.properties) {
          parsed.properties = parsed.properties.map(p => {
            const match = defaultDavis.properties.find(dp => dp.id === p.id);
            return {
              ...p,
              imageUrl: p.imageUrl || match?.imageUrl,
              photos: p.photos && p.photos.length > 0 ? p.photos : (p.imageUrl ? [p.imageUrl] : match?.photos),
            };
          });
        }
        setPortfolio(parsed);
      } catch (e) {
        console.error('Failed to parse user portfolio JSON:', e);
      }
    }

    // 2. Check Firestore database for live cross-device updates
    try {
      const firestorePortfolio = await getPortfolioFromFirestore(user.username);
      if (firestorePortfolio) {
        const syncRes = syncOfflineElapsedProfitAndBanking(firestorePortfolio);
        setPortfolio(syncRes.portfolio);
        try {
          localStorage.setItem(portfolioKey(user.username), JSON.stringify(syncRes.portfolio));
        } catch {}
        return;
      }
    } catch {}

    // 3. Refresh from server for cross-device updates
    try {
      const res = await fetch(`/api/aeg-account/sync?username=${encodeURIComponent(user.username)}`);
      const data = await res.json();
      if (data.success && data.portfolio) {
        const syncRes = syncOfflineElapsedProfitAndBanking(data.portfolio);
        setPortfolio(syncRes.portfolio);
        try {
          localStorage.setItem(portfolioKey(user.username), JSON.stringify(syncRes.portfolio));
        } catch {}
        return;
      }
    } catch {}

    // Default portfolio if none exists
    if (!raw) {
      const initial = user.username.toLowerCase() === 'davis'
        ? createDavisPortfolio()
        : createCleanPortfolio(user);
      initial.lastSettledTimestamp = new Date().toISOString();
      savePortfolio(initial);
    }
  }, [savePortfolio]);

  const refreshPortfolio = useCallback(async () => {
    if (currentUser) {
      await loadPortfolioForUser(currentUser);
    }
  }, [currentUser, loadPortfolioForUser]);

  const login = async (username: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim().toLowerCase();

    // 1. Attempt server-side login for true cross-device authentication
    try {
      const res = await fetch('/api/aeg-account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: pass }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const found = data.user;
        setCurrentUser(found);
        localStorage.setItem(STORAGE_KEY_ACTIVE_USER, found.username);

        setAllUsers(prev => {
          const filtered = prev.filter(u => u.username.toLowerCase() !== cleanUser);
          const next = [...filtered, found];
          try {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(next));
          } catch {}
          return next;
        });

        if (data.portfolio) {
          setPortfolio(data.portfolio);
          try {
            localStorage.setItem(portfolioKey(found.username), JSON.stringify(data.portfolio));
          } catch {}
        } else {
          loadPortfolioForUser(found);
        }
        setSyncStatus('synced');
        return { success: true };
      } else if (res.status === 401 || res.status === 404) {
        return { success: false, error: data.error || 'Invalid AAG account credentials.' };
      }
    } catch (netErr) {
      console.warn('Network login failed, trying local fallback:', netErr);
    }

    // 2. Fallback to local storage credentials if offline
    const found = allUsers.find(u => u.username.toLowerCase() === cleanUser);
    if (!found) {
      return { success: false, error: 'No AAG account found with this username. Please sign up.' };
    }
    if (found.password !== pass) {
      return { success: false, error: 'Invalid password. Please check and try again.' };
    }

    setCurrentUser(found);
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, found.username);
    loadPortfolioForUser(found);
    return { success: true };
  };

  const register = async (
    username: string,
    pass: string,
    fullName: string,
    currency: CurrencyCode,
    starterType: 'executive' | 'clean'
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, error: 'Username must be at least 3 alphanumeric characters.' };
    }
    if (pass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // 1. Attempt server-side registration
    try {
      const res = await fetch('/api/aeg-account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          password: pass,
          fullName: fullName.trim() || cleanUser,
          currency,
          starterType,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const newUser = data.user;
        setAllUsers(prev => {
          const next = [...prev.filter(u => u.username.toLowerCase() !== cleanUser), newUser];
          try {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(next));
          } catch {}
          return next;
        });

        setCurrentUser(newUser);
        localStorage.setItem(STORAGE_KEY_ACTIVE_USER, newUser.username);

        if (data.portfolio) {
          setPortfolio(data.portfolio);
          try {
            localStorage.setItem(portfolioKey(newUser.username), JSON.stringify(data.portfolio));
          } catch {}
        }
        setSyncStatus('synced');
        return { success: true };
      } else if (data.error) {
        return { success: false, error: data.error };
      }
    } catch (netErr) {
      console.warn('Network registration failed, falling back to local:', netErr);
    }

    // 2. Fallback to local storage registration if offline
    if (allUsers.some(u => u.username.toLowerCase() === cleanUser)) {
      return { success: false, error: 'Username already taken. Please choose another.' };
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      username: cleanUser,
      password: pass,
      fullName: fullName.trim() || cleanUser,
      currency,
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveUserToFirestore(newUser).catch(err => console.warn('Firestore user save warning:', err));
    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));

    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, newUser.username);

    // Initial portfolio
    let newPortfolio: PortfolioData;
    if (starterType === 'executive') {
      const sample = createDavisPortfolio();
      sample.user = newUser;
      sample.bankAccounts.forEach(b => (b.currency = currency));
      newPortfolio = sample;
    } else {
      newPortfolio = createCleanPortfolio(newUser);
    }

    savePortfolio(newPortfolio);
    return { success: true };
  };

  const continueWithGoogle = async (params: {
    email: string;
    fullName: string;
    avatarUrl?: string;
    googleId?: string;
    currency?: CurrencyCode;
    starterType?: 'executive' | 'clean';
  }): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.fullName.trim() || cleanEmail.split('@')[0];
    const cleanCurrency = params.currency || 'USD';
    const cleanStarter = params.starterType || 'executive';

    // 1. Attempt Server-side Google Auth
    try {
      const res = await fetch('/api/aeg-account/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: cleanName,
          avatarUrl: params.avatarUrl,
          googleId: params.googleId,
          currency: cleanCurrency,
          starterType: cleanStarter,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const found: UserAccount = data.user;
        setCurrentUser(found);
        localStorage.setItem(STORAGE_KEY_ACTIVE_USER, found.username);

        setAllUsers(prev => {
          const filtered = prev.filter(
            u =>
              u.username.toLowerCase() !== found.username.toLowerCase() &&
              (!u.email || u.email.toLowerCase() !== cleanEmail)
          );
          const next = [...filtered, found];
          try {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(next));
          } catch {}
          return next;
        });

        if (data.portfolio) {
          setPortfolio(data.portfolio);
          try {
            localStorage.setItem(portfolioKey(found.username), JSON.stringify(data.portfolio));
          } catch {}
        } else {
          loadPortfolioForUser(found);
        }

        setSyncStatus('synced');
        return { success: true, isNewUser: data.isNewUser };
      } else if (data.error) {
        return { success: false, error: data.error };
      }
    } catch (netErr) {
      console.warn('Server-side Google auth failed, using local fallback:', netErr);
    }

    // 2. Local fallback for Google accounts
    const isDavisMaster = cleanEmail === 'davissandhu2@gmail.com';
    const baseUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') || 'google_user';
    const existing = allUsers.find(
      u => (u.email && u.email.toLowerCase() === cleanEmail) || u.username.toLowerCase() === baseUsername
    );

    if (existing) {
      const updatedUser: UserAccount = {
        ...existing,
        email: cleanEmail,
        authProvider: 'google',
        avatarUrl: params.avatarUrl || existing.avatarUrl,
        isMasterAdmin: isDavisMaster || existing.isMasterAdmin,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, updatedUser.username);
      loadPortfolioForUser(updatedUser);
      return { success: true, isNewUser: false };
    }

    const newUser: UserAccount = {
      id: `usr_google_${Date.now()}`,
      username: baseUsername,
      password: `google_oauth_${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      currency: cleanCurrency,
      createdAt: new Date().toISOString().split('T')[0],
      avatarUrl: params.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      authProvider: 'google',
      isMasterAdmin: isDavisMaster,
    };

    saveUserToFirestore(newUser).catch(err => console.warn('Firestore user save warning:', err));
    const nextUsers = [...allUsers, newUser];
    setAllUsers(nextUsers);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(nextUsers));
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, newUser.username);

    const initial =
      cleanStarter === 'executive' || isDavisMaster
        ? {
            ...createDavisPortfolio(),
            user: newUser,
          }
        : createCleanPortfolio(newUser);

    savePortfolio(initial);
    return { success: true, isNewUser: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setPortfolio(null);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
  };

  const switchUser = (username: string) => {
    const target = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, target.username);
      loadPortfolioForUser(target);
    }
  };

  const updateUserProfile = (profileUpdates: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updatedUser: UserAccount = {
      ...currentUser,
      ...profileUpdates,
    };
    setCurrentUser(updatedUser);

    setAllUsers(prev => {
      const filtered = prev.filter(u => u.username.toLowerCase() !== updatedUser.username.toLowerCase());
      const next = [...filtered, updatedUser];
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(next));
      } catch {}
      return next;
    });

    saveUserToFirestore(updatedUser).catch(err => console.warn('Firestore user update warning:', err));

    if (portfolio) {
      const updatedPortfolio: PortfolioData = {
        ...portfolio,
        user: {
          ...portfolio.user,
          ...profileUpdates,
        },
      };
      savePortfolio(updatedPortfolio);
    }
  };

  // Simulation Controls
  const advanceMonth = (months: number = 1) => {
    if (!portfolio) return;
    const updated = months === 1
      ? advancePortfolioOneMonth(portfolio)
      : advancePortfolioNMonths(portfolio, months);
    // Refresh settlement anchor so the next 72-hour period starts from this manual action
    updated.lastSettledTimestamp = new Date().toISOString();
    savePortfolio(updated);
  };

  const resetSimulation = () => {
    if (!currentUser) return;
    const fresh = currentUser.username.toLowerCase() === 'davis'
      ? createDavisPortfolio()
      : createCleanPortfolio(currentUser);
    fresh.lastSettledTimestamp = new Date().toISOString();
    savePortfolio(fresh);
  };

  // Automated background timeline check: 1 in-app month completes after 72 continuous hours of real-world time
  useEffect(() => {
    if (!portfolio?.user?.username) return;
    const interval = setInterval(() => {
      setPortfolio(current => {
        if (!current) return current;
        const syncRes = syncOfflineElapsedProfitAndBanking(current);
        if (syncRes.wasOffline && syncRes.monthsElapsed > 0) {
          try {
            localStorage.setItem(portfolioKey(current.user.username), JSON.stringify(syncRes.portfolio));
          } catch {}
          return syncRes.portfolio;
        }
        return current;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [portfolio?.user?.username]);

  const isMasterAdmin = Boolean(
    currentUser &&
      (currentUser.isMasterAdmin ||
        currentUser.email === 'davissandhu2@gmail.com' ||
        currentUser.username.toLowerCase() === 'davis')
  );

  // Car & Vehicle operations (Cars, Supercars, Jets, Planes, Yachts, Bikes)
  const addCar = (carData: Omit<CarAsset, 'id'>) => {
    if (!portfolio) return { success: false, error: 'No active portfolio' };
    const newCar: CarAsset = { ...carData, id: `veh_${Date.now()}` };

    let updatedBanks = [...portfolio.bankAccounts];
    let newLogs = [...portfolio.simulationLogs];

    if (carData.purchasePrice > 0) {
      const bank =
        updatedBanks.find(b => b.id === carData.purchasedFromBankId) ||
        updatedBanks.find(b => b.isPrimaryForAutoDebit) ||
        updatedBanks[0];

      if (!bank) {
        return { success: false, error: 'No bank account available to fund this vehicle purchase.' };
      }

      if (bank.balance < carData.purchasePrice) {
        return {
          success: false,
          error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${carData.purchasePrice.toLocaleString()}.`,
        };
      }

      const bankIndex = updatedBanks.findIndex(b => b.id === bank.id);
      updatedBanks[bankIndex] = {
        ...bank,
        balance: bank.balance - carData.purchasePrice,
      };

      newLogs = [
        {
          id: `purchase_veh_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'asset_purchase',
          title: `Vehicle Acquired: ${newCar.name}`,
          amount: carData.purchasePrice,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Purchased ${newCar.condition || 'Brand New'} ${newCar.year} ${newCar.make} ${newCar.model} (${newCar.vehicleType || 'car'}) for $${carData.purchasePrice.toLocaleString()} deducted from ${bank.bankName}.`,
        },
        ...newLogs,
      ];
    }

    savePortfolio({
      ...portfolio,
      cars: [newCar, ...portfolio.cars],
      bankAccounts: updatedBanks,
      simulationLogs: newLogs,
    });
    return { success: true };
  };

  const updateCar = (car: CarAsset) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      cars: portfolio.cars.map(c => (c.id === car.id ? car : c)),
    });
  };

  const upgradeCar = (
    carId: string,
    upgradeCost: number,
    upgradeName: string,
    bankAccountId: string
  ) => {
    if (!portfolio || upgradeCost <= 0) return { success: false, error: 'Invalid upgrade amount' };
    const car = portfolio.cars.find(c => c.id === carId);
    if (!car) return { success: false, error: 'Vehicle not found' };

    const bank =
      portfolio.bankAccounts.find(b => b.id === bankAccountId) ||
      portfolio.bankAccounts.find(b => b.isPrimaryForAutoDebit) ||
      portfolio.bankAccounts[0];

    if (!bank) return { success: false, error: 'Payment bank account not found' };
    if (bank.balance < upgradeCost) {
      return {
        success: false,
        error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${upgradeCost.toLocaleString()}.`,
      };
    }

    const valueBoost = Math.round(upgradeCost * 1.25);
    const updatedBanks = portfolio.bankAccounts.map(b =>
      b.id === bank.id ? { ...b, balance: b.balance - upgradeCost } : b
    );

    const updatedCars = portfolio.cars.map(c =>
      c.id === carId
        ? {
            ...c,
            currentValue: c.currentValue + valueBoost,
            notes: c.notes ? `${c.notes} · Upgraded: ${upgradeName} (+$${valueBoost.toLocaleString()})` : `Upgraded: ${upgradeName}`,
          }
        : c
    );

    savePortfolio({
      ...portfolio,
      cars: updatedCars,
      bankAccounts: updatedBanks,
      simulationLogs: [
        {
          id: `upgrade_veh_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'asset_purchase',
          title: `Vehicle Upgraded: ${car.name}`,
          amount: upgradeCost,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Installed ${upgradeName} on ${car.name}. Cost: $${upgradeCost.toLocaleString()} paid from ${bank.bankName}. Valuation increased by +$${valueBoost.toLocaleString()}.`,
        },
        ...portfolio.simulationLogs,
      ],
    });

    return { success: true };
  };

  const deleteCar = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      cars: portfolio.cars.filter(c => c.id !== id),
    });
  };

  const sellCar = (id: string, salePrice: number, depositBankId: string) => {
    if (!portfolio) return;
    const car = portfolio.cars.find(c => c.id === id);
    if (!car) return;

    const bank = portfolio.bankAccounts.find(b => b.id === depositBankId) || portfolio.bankAccounts[0];
    const updatedBanks = portfolio.bankAccounts.map(b =>
      b.id === bank.id ? { ...b, balance: b.balance + salePrice } : b
    );

    savePortfolio({
      ...portfolio,
      cars: portfolio.cars.filter(c => c.id !== id),
      bankAccounts: updatedBanks,
      simulationLogs: [
        {
          id: `sell_car_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'salary_deposit',
          title: `Vehicle Sold: ${car.name}`,
          amount: salePrice,
          direction: 'inflow',
          bankAccountAffected: bank.bankName,
          details: `Liquidated vehicle for $${salePrice.toLocaleString()} into ${bank.bankName}.`,
        },
        ...portfolio.simulationLogs,
      ],
    });
  };

  // Bank Account operations
  const addBankAccount = (bankData: Omit<BankAccount, 'id'>) => {
    if (!portfolio) return;
    const newBank: BankAccount = { ...bankData, id: `bank_${Date.now()}` };
    savePortfolio({
      ...portfolio,
      bankAccounts: [...portfolio.bankAccounts, newBank],
    });
  };

  const updateBankAccount = (bank: BankAccount) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      bankAccounts: portfolio.bankAccounts.map(b => (b.id === bank.id ? bank : b)),
    });
  };

  const deleteBankAccount = (id: string) => {
    if (!portfolio) return;
    if (portfolio.bankAccounts.length <= 1) return;
    savePortfolio({
      ...portfolio,
      bankAccounts: portfolio.bankAccounts.filter(b => b.id !== id),
    });
  };

  const transferFunds = (sourceBankId: string, destBankId: string, amount: number) => {
    if (!portfolio || amount <= 0) return { success: false, error: 'Invalid amount' };
    const source = portfolio.bankAccounts.find(b => b.id === sourceBankId);
    const dest = portfolio.bankAccounts.find(b => b.id === destBankId);

    if (!source || !dest) return { success: false, error: 'Account not found' };
    if (source.balance < amount) return { success: false, error: 'Insufficient funds in source account' };

    const updatedBanks = portfolio.bankAccounts.map(b => {
      if (b.id === sourceBankId) return { ...b, balance: b.balance - amount };
      if (b.id === destBankId) return { ...b, balance: b.balance + amount };
      return b;
    });

    savePortfolio({
      ...portfolio,
      bankAccounts: updatedBanks,
      simulationLogs: [
        {
          id: `transfer_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'salary_deposit',
          title: `Inter-Bank Transfer`,
          amount,
          direction: 'inflow',
          bankAccountAffected: dest.bankName,
          details: `Transferred $${amount.toLocaleString()} from ${source.bankName} to ${dest.bankName}.`,
        },
        ...portfolio.simulationLogs,
      ],
    });

    return { success: true };
  };

  // Property operations
  const addProperty = (propData: Omit<PropertyAsset, 'id'>) => {
    if (!portfolio) return { success: false, error: 'No active portfolio' };
    const newProp: PropertyAsset = { ...propData, id: `prop_${Date.now()}` };

    let updatedBanks = [...portfolio.bankAccounts];
    let newLogs = [...portfolio.simulationLogs];

    if (propData.purchasePrice > 0) {
      const bank =
        updatedBanks.find(b => b.id === propData.purchasedFromBankId) ||
        updatedBanks.find(b => b.isPrimaryForAutoDebit) ||
        updatedBanks[0];

      if (!bank) {
        return { success: false, error: 'No bank account available to fund this property purchase.' };
      }

      if (bank.balance < propData.purchasePrice) {
        return {
          success: false,
          error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${propData.purchasePrice.toLocaleString()}.`,
        };
      }

      const bankIndex = updatedBanks.findIndex(b => b.id === bank.id);
      updatedBanks[bankIndex] = {
        ...bank,
        balance: bank.balance - propData.purchasePrice,
      };

      newLogs = [
        {
          id: `purchase_prop_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'asset_purchase',
          title: `Real Estate Acquired: ${newProp.name}`,
          amount: propData.purchasePrice,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Purchased ${newProp.propertyType} at ${newProp.address} for $${propData.purchasePrice.toLocaleString()} deducted from ${bank.bankName}.`,
        },
        ...newLogs,
      ];
    }

    savePortfolio({
      ...portfolio,
      properties: [newProp, ...portfolio.properties],
      bankAccounts: updatedBanks,
      simulationLogs: newLogs,
    });
    return { success: true };
  };

  const updateProperty = (prop: PropertyAsset) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      properties: portfolio.properties.map(p => (p.id === prop.id ? prop : p)),
    });
  };

  const upgradeProperty = (
    propertyId: string,
    upgradeCost: number,
    upgradeName: string,
    bankAccountId: string
  ) => {
    if (!portfolio || upgradeCost <= 0) return { success: false, error: 'Invalid renovation amount' };
    const prop = portfolio.properties.find(p => p.id === propertyId);
    if (!prop) return { success: false, error: 'Property not found' };

    const bank =
      portfolio.bankAccounts.find(b => b.id === bankAccountId) ||
      portfolio.bankAccounts.find(b => b.isPrimaryForAutoDebit) ||
      portfolio.bankAccounts[0];

    if (!bank) return { success: false, error: 'Payment bank account not found' };
    if (bank.balance < upgradeCost) {
      return {
        success: false,
        error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${upgradeCost.toLocaleString()}.`,
      };
    }

    const valuationBoost = Math.round(upgradeCost * 1.35);
    const rentalBoost = Math.round(upgradeCost * 0.007);

    const updatedBanks = portfolio.bankAccounts.map(b =>
      b.id === bank.id ? { ...b, balance: b.balance - upgradeCost } : b
    );

    const updatedProperties = portfolio.properties.map(p =>
      p.id === propertyId
        ? {
            ...p,
            currentValue: p.currentValue + valuationBoost,
            monthlyRentalIncome: p.isRented ? p.monthlyRentalIncome + rentalBoost : p.monthlyRentalIncome,
          }
        : p
    );

    savePortfolio({
      ...portfolio,
      properties: updatedProperties,
      bankAccounts: updatedBanks,
      simulationLogs: [
        {
          id: `upgrade_prop_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'asset_purchase',
          title: `Property Renovated: ${prop.name}`,
          amount: upgradeCost,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Completed renovation "${upgradeName}" on ${prop.name}. Cost: $${upgradeCost.toLocaleString()} paid from ${bank.bankName}. Valuation increased by +$${valuationBoost.toLocaleString()}${prop.isRented ? ` and rent boosted by +$${rentalBoost.toLocaleString()}/mo.` : '.'}`,
        },
        ...portfolio.simulationLogs,
      ],
    });

    return { success: true };
  };

  const deleteProperty = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      properties: portfolio.properties.filter(p => p.id !== id),
    });
  };

  // Business & Branch operations
  const addBusiness = (
    businessData: Omit<BusinessAsset, 'id' | 'branches'>,
    initialBranches?: Omit<BusinessBranch, 'id'>[],
    fundingBankId?: string,
    purchaseCost?: number
  ) => {
    if (!portfolio) return { success: false, error: 'No active portfolio' };
    const newId = `biz_${Date.now()}`;
    const branches: BusinessBranch[] = (initialBranches || []).map((br, idx) => ({
      ...br,
      id: `branch_${Date.now()}_${idx}`,
    }));
    const newBiz: BusinessAsset = {
      ...businessData,
      id: newId,
      branches,
    };

    let updatedBanks = [...portfolio.bankAccounts];
    let newLogs = [...portfolio.simulationLogs];

    const cost = purchaseCost !== undefined ? purchaseCost : (businessData.valuation * (businessData.ownershipPercentage / 100));

    if (cost > 0) {
      const bank =
        updatedBanks.find(b => b.id === fundingBankId) ||
        updatedBanks.find(b => b.id === businessData.destinationBankId) ||
        updatedBanks.find(b => b.isPrimaryForAutoDebit) ||
        updatedBanks[0];

      if (!bank) {
        return { success: false, error: 'No bank account available to fund this business acquisition.' };
      }

      if (bank.balance < cost) {
        return {
          success: false,
          error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${cost.toLocaleString()}.`,
        };
      }

      const bankIndex = updatedBanks.findIndex(b => b.id === bank.id);
      updatedBanks[bankIndex] = {
        ...bank,
        balance: bank.balance - cost,
      };

      newLogs = [
        {
          id: `purchase_biz_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'business_investment',
          title: `Business Enterprise Acquired: ${newBiz.name}`,
          amount: cost,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Acquired ${newBiz.ownershipPercentage}% equity in ${newBiz.name} for $${cost.toLocaleString()} deducted from ${bank.bankName}.`,
        },
        ...newLogs,
      ];
    }

    savePortfolio({
      ...portfolio,
      businesses: [newBiz, ...(portfolio.businesses || [])],
      bankAccounts: updatedBanks,
      simulationLogs: newLogs,
    });
    return { success: true };
  };

  const updateBusiness = (biz: BusinessAsset) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      businesses: (portfolio.businesses || []).map(b => (b.id === biz.id ? biz : b)),
    });
  };

  const deleteBusiness = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      businesses: (portfolio.businesses || []).filter(b => b.id !== id),
    });
  };

  const addBranch = (
    businessId: string,
    branchData: Omit<BusinessBranch, 'id'>,
    fundingBankId?: string
  ) => {
    if (!portfolio) return { success: false, error: 'No active portfolio' };
    const newBranch: BusinessBranch = {
      ...branchData,
      id: `branch_${Date.now()}`,
    };

    let updatedBanks = [...portfolio.bankAccounts];
    let newLogs = [...portfolio.simulationLogs];

    if (branchData.capitalInvested > 0) {
      const bank =
        updatedBanks.find(b => b.id === fundingBankId) ||
        updatedBanks.find(b => b.isPrimaryForAutoDebit) ||
        updatedBanks[0];

      if (!bank) {
        return { success: false, error: 'No bank account available to fund branch expansion.' };
      }

      if (bank.balance < branchData.capitalInvested) {
        return {
          success: false,
          error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${branchData.capitalInvested.toLocaleString()}.`,
        };
      }

      const bankIndex = updatedBanks.findIndex(b => b.id === bank.id);
      updatedBanks[bankIndex] = {
        ...bank,
        balance: bank.balance - branchData.capitalInvested,
      };

      const bizName = portfolio.businesses?.find(b => b.id === businessId)?.name || 'Enterprise';

      newLogs = [
        {
          id: `open_branch_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'business_investment',
          title: `Branch Opened: ${newBranch.name}`,
          amount: branchData.capitalInvested,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Opened new branch ${newBranch.name} for ${bizName} with $${branchData.capitalInvested.toLocaleString()} initial capital paid from ${bank.bankName}.`,
        },
        ...newLogs,
      ];
    }

    savePortfolio({
      ...portfolio,
      businesses: (portfolio.businesses || []).map(biz => {
        if (biz.id === businessId) {
          return {
            ...biz,
            valuation: biz.valuation + Math.round(branchData.valuation || branchData.capitalInvested * 1.2),
            monthlyNetProfit: biz.monthlyNetProfit + Math.max(0, branchData.monthlyRevenue - branchData.monthlyExpenses),
            branches: [...(biz.branches || []), newBranch],
          };
        }
        return biz;
      }),
      bankAccounts: updatedBanks,
      simulationLogs: newLogs,
    });

    return { success: true };
  };

  const updateBranch = (businessId: string, updatedBranch: BusinessBranch) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      businesses: (portfolio.businesses || []).map(biz => {
        if (biz.id === businessId) {
          return {
            ...biz,
            branches: (biz.branches || []).map(br => (br.id === updatedBranch.id ? updatedBranch : br)),
          };
        }
        return biz;
      }),
    });
  };

  const deleteBranch = (businessId: string, branchId: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      businesses: (portfolio.businesses || []).map(biz => {
        if (biz.id === businessId) {
          return {
            ...biz,
            branches: (biz.branches || []).filter(br => br.id !== branchId),
          };
        }
        return biz;
      }),
    });
  };

  // Capital Investment into Business & Branches
  const investInBusiness = (
    businessId: string,
    amount: number,
    bankAccountId: string,
    targetBranchId?: string,
    note?: string
  ) => {
    if (!portfolio || amount <= 0) return { success: false, error: 'Invalid investment amount' };
    const bank = portfolio.bankAccounts.find(b => b.id === bankAccountId);
    if (!bank) return { success: false, error: 'Payment bank account not found' };
    if (bank.balance < amount) {
      return {
        success: false,
        error: `Insufficient balance in ${bank.bankName} ($${bank.balance.toLocaleString()} available)`,
      };
    }

    const biz = (portfolio.businesses || []).find(b => b.id === businessId);
    if (!biz) return { success: false, error: 'Business entity not found' };

    const updatedBanks = portfolio.bankAccounts.map(b =>
      b.id === bankAccountId ? { ...b, balance: b.balance - amount } : b
    );

    // Business valuation increases by 1.35x capital injected
    // Monthly net profit increases by ~1.2% of capital injected (14.4% annual ROI)
    const profitBoost = Math.round(amount * 0.012);
    const valuationBoost = Math.round(amount * 1.35);

    const updatedBusinesses = (portfolio.businesses || []).map(b => {
      if (b.id !== businessId) return b;
      let updatedBranches = b.branches || [];
      if (targetBranchId) {
        updatedBranches = updatedBranches.map(br => {
          if (br.id !== targetBranchId) return br;
          return {
            ...br,
            capitalInvested: br.capitalInvested + amount,
            valuation: br.valuation + valuationBoost,
            monthlyRevenue: br.monthlyRevenue + Math.round(amount * 0.02),
            monthlyExpenses: br.monthlyExpenses + Math.round(amount * 0.008),
            status: 'Expanding' as const,
          };
        });
      }
      return {
        ...b,
        valuation: b.valuation + valuationBoost,
        monthlyNetProfit: b.monthlyNetProfit + profitBoost,
        branches: updatedBranches,
      };
    });

    const targetBranch = targetBranchId ? biz.branches?.find(br => br.id === targetBranchId) : null;
    const branchName = targetBranch ? ` (${targetBranch.name})` : '';

    savePortfolio({
      ...portfolio,
      bankAccounts: updatedBanks,
      businesses: updatedBusinesses,
      simulationLogs: [
        {
          id: `invest_biz_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'business_investment',
          title: `Capital Injected: ${biz.name}${branchName}`,
          amount,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Injected $${amount.toLocaleString()} capital into ${biz.name}${branchName} via ${bank.bankName}. Boosted monthly profit by +$${profitBoost.toLocaleString()}/mo and enterprise valuation by +$${valuationBoost.toLocaleString()}.${note ? ` Note: ${note}` : ''}`,
        },
        ...portfolio.simulationLogs,
      ],
    });

    return { success: true };
  };

  // Master Admin Controls (davissandhu2@gmail.com only)
  const updateMasterRates = (settings: {
    propertyAppreciationRate?: number;
    propertyMortgageRate?: number;
    vehicleDepreciationRate?: number;
    vehicleFinanceRate?: number;
  }) => {
    if (!isMasterAdmin) {
      return {
        success: false,
        error: 'Permission Denied: Master rate tuning is restricted to davissandhu2@gmail.com only.',
      };
    }
    if (!portfolio) return { success: false, error: 'No active portfolio' };

    let updatedProperties = [...portfolio.properties];
    if (settings.propertyAppreciationRate !== undefined || settings.propertyMortgageRate !== undefined) {
      updatedProperties = updatedProperties.map(p => ({
        ...p,
        annualAppreciationRate:
          settings.propertyAppreciationRate !== undefined
            ? settings.propertyAppreciationRate
            : p.annualAppreciationRate,
        interestRateYearly:
          settings.propertyMortgageRate !== undefined ? settings.propertyMortgageRate : p.interestRateYearly,
      }));
    }

    let updatedCars = [...portfolio.cars];
    if (settings.vehicleDepreciationRate !== undefined || settings.vehicleFinanceRate !== undefined) {
      updatedCars = updatedCars.map(c => ({
        ...c,
        annualDepreciationRate:
          settings.vehicleDepreciationRate !== undefined
            ? settings.vehicleDepreciationRate
            : c.annualDepreciationRate,
        interestRateYearly:
          settings.vehicleFinanceRate !== undefined ? settings.vehicleFinanceRate : c.interestRateYearly,
      }));
    }

    savePortfolio({
      ...portfolio,
      properties: updatedProperties,
      cars: updatedCars,
      simulationLogs: [
        {
          id: `master_rates_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'market_revaluation',
          title: 'Master Economic Rates Updated by Super-Admin',
          amount: 0,
          direction: 'valuation_up',
          details: 'Global interest and depreciation algorithms re-calibrated by davissandhu2@gmail.com.',
        },
        ...portfolio.simulationLogs,
      ],
    });

    return { success: true };
  };

  // Fixed Deposit operations
  const addFixedDeposit = (
    fdData: Omit<FixedDepositAsset, 'id' | 'monthsElapsed' | 'isMatured' | 'currentAccruedValue'>,
    fundingBankId?: string
  ) => {
    if (!portfolio) return { success: false, error: 'No active portfolio' };
    const newFd: FixedDepositAsset = {
      ...fdData,
      id: `fd_${Date.now()}`,
      currentAccruedValue: fdData.principal,
      monthsElapsed: 0,
      isMatured: false,
    };

    let updatedBanks = [...portfolio.bankAccounts];
    let newLogs = [...portfolio.simulationLogs];

    if (fdData.principal > 0) {
      const bank =
        updatedBanks.find(b => b.id === fundingBankId) ||
        updatedBanks.find(b => b.id === fdData.autoCreditBankId) ||
        updatedBanks.find(b => b.isPrimaryForAutoDebit) ||
        updatedBanks[0];

      if (!bank) {
        return { success: false, error: 'No bank account available to fund this Fixed Deposit.' };
      }

      if (bank.balance < fdData.principal) {
        return {
          success: false,
          error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${fdData.principal.toLocaleString()}.`,
        };
      }

      const bankIndex = updatedBanks.findIndex(b => b.id === bank.id);
      updatedBanks[bankIndex] = {
        ...bank,
        balance: bank.balance - fdData.principal,
      };

      newLogs = [
        {
          id: `book_fd_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'asset_purchase',
          title: `Fixed Deposit Booked: ${newFd.name}`,
          amount: fdData.principal,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Deposited $${fdData.principal.toLocaleString()} into ${newFd.institution} at ${newFd.interestRateYearly}% APY for ${newFd.tenureMonths} months from ${bank.bankName}.`,
        },
        ...newLogs,
      ];
    }

    savePortfolio({
      ...portfolio,
      fixedDeposits: [newFd, ...portfolio.fixedDeposits],
      bankAccounts: updatedBanks,
      simulationLogs: newLogs,
    });

    return { success: true };
  };

  const updateFixedDeposit = (fd: FixedDepositAsset) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      fixedDeposits: portfolio.fixedDeposits.map(f => (f.id === fd.id ? fd : f)),
    });
  };

  const deleteFixedDeposit = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      fixedDeposits: portfolio.fixedDeposits.filter(f => f.id !== id),
    });
  };

  // Stocks operations
  const addStock = (stockData: Omit<StockAsset, 'id'>, fundingBankId?: string) => {
    if (!portfolio) return { success: false, error: 'No active portfolio' };
    const newStock: StockAsset = { ...stockData, id: `stock_${Date.now()}` };
    const totalCost = Math.round(stockData.shares * stockData.buyPrice);

    let updatedBanks = [...portfolio.bankAccounts];
    let newLogs = [...portfolio.simulationLogs];

    if (totalCost > 0) {
      const bank =
        updatedBanks.find(b => b.id === fundingBankId) ||
        updatedBanks.find(b => b.id === stockData.autoCreditDividendsToBankId) ||
        updatedBanks.find(b => b.isPrimaryForAutoDebit) ||
        updatedBanks[0];

      if (!bank) {
        return { success: false, error: 'No bank account available to fund stock purchase.' };
      }

      if (bank.balance < totalCost) {
        return {
          success: false,
          error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${totalCost.toLocaleString()}.`,
        };
      }

      const bankIndex = updatedBanks.findIndex(b => b.id === bank.id);
      updatedBanks[bankIndex] = {
        ...bank,
        balance: bank.balance - totalCost,
      };

      newLogs = [
        {
          id: `buy_stock_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'asset_purchase',
          title: `Stock Purchased: ${newStock.ticker}`,
          amount: totalCost,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Purchased ${newStock.shares} shares of ${newStock.companyName} (${newStock.ticker}) @ $${newStock.buyPrice.toFixed(2)}/share for $${totalCost.toLocaleString()} from ${bank.bankName}.`,
        },
        ...newLogs,
      ];
    }

    savePortfolio({
      ...portfolio,
      stocks: [newStock, ...portfolio.stocks],
      bankAccounts: updatedBanks,
      simulationLogs: newLogs,
    });

    return { success: true };
  };

  const updateStock = (stock: StockAsset) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      stocks: portfolio.stocks.map(s => (s.id === stock.id ? stock : s)),
    });
  };

  const deleteStock = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      stocks: portfolio.stocks.filter(s => s.id !== id),
    });
  };

  // Crypto operations
  const addCrypto = (cryptoData: Omit<CryptoAsset, 'id'>, fundingBankId?: string) => {
    if (!portfolio) return { success: false, error: 'No active portfolio' };
    const newCrypto: CryptoAsset = { ...cryptoData, id: `crypto_${Date.now()}` };
    const totalCost = Math.round(cryptoData.quantity * cryptoData.buyPrice);

    let updatedBanks = [...portfolio.bankAccounts];
    let newLogs = [...portfolio.simulationLogs];

    if (totalCost > 0) {
      const bank =
        updatedBanks.find(b => b.id === fundingBankId) ||
        updatedBanks.find(b => b.isPrimaryForAutoDebit) ||
        updatedBanks[0];

      if (!bank) {
        return { success: false, error: 'No bank account available to fund crypto purchase.' };
      }

      if (bank.balance < totalCost) {
        return {
          success: false,
          error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${totalCost.toLocaleString()}.`,
        };
      }

      const bankIndex = updatedBanks.findIndex(b => b.id === bank.id);
      updatedBanks[bankIndex] = {
        ...bank,
        balance: bank.balance - totalCost,
      };

      newLogs = [
        {
          id: `buy_crypto_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'asset_purchase',
          title: `Crypto Acquired: ${newCrypto.symbol}`,
          amount: totalCost,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Acquired ${newCrypto.quantity} ${newCrypto.symbol} (${newCrypto.name}) @ $${newCrypto.buyPrice.toLocaleString()}/unit for $${totalCost.toLocaleString()} from ${bank.bankName}.`,
        },
        ...newLogs,
      ];
    }

    savePortfolio({
      ...portfolio,
      crypto: [newCrypto, ...portfolio.crypto],
      bankAccounts: updatedBanks,
      simulationLogs: newLogs,
    });

    return { success: true };
  };

  const updateCrypto = (cryptoItem: CryptoAsset) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      crypto: portfolio.crypto.map(c => (c.id === cryptoItem.id ? cryptoItem : c)),
    });
  };

  const deleteCrypto = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      crypto: portfolio.crypto.filter(c => c.id !== id),
    });
  };

  // Forex operations
  const addForex = (forexData: Omit<ForexAsset, 'id'>, fundingBankId?: string) => {
    if (!portfolio) return { success: false, error: 'No active portfolio' };
    const newForex: ForexAsset = { ...forexData, id: `forex_${Date.now()}` };
    const totalCost = Math.round(forexData.amount * (forexData.buyExchangeRate || 1.0));

    let updatedBanks = [...portfolio.bankAccounts];
    let newLogs = [...portfolio.simulationLogs];

    if (totalCost > 0) {
      const bank =
        updatedBanks.find(b => b.id === fundingBankId) ||
        updatedBanks.find(b => b.isPrimaryForAutoDebit) ||
        updatedBanks[0];

      if (!bank) {
        return { success: false, error: 'No bank account available to fund forex purchase.' };
      }

      if (bank.balance < totalCost) {
        return {
          success: false,
          error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${totalCost.toLocaleString()}.`,
        };
      }

      const bankIndex = updatedBanks.findIndex(b => b.id === bank.id);
      updatedBanks[bankIndex] = {
        ...bank,
        balance: bank.balance - totalCost,
      };

      newLogs = [
        {
          id: `buy_forex_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'asset_purchase',
          title: `Forex Reserve: ${newForex.currencyCode}`,
          amount: totalCost,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Converted $${totalCost.toLocaleString()} to ${newForex.amount.toLocaleString()} ${newForex.currencyCode} (${newForex.currencyName}) at rate ${newForex.buyExchangeRate} from ${bank.bankName}.`,
        },
        ...newLogs,
      ];
    }

    savePortfolio({
      ...portfolio,
      forex: [newForex, ...portfolio.forex],
      bankAccounts: updatedBanks,
      simulationLogs: newLogs,
    });

    return { success: true };
  };

  const updateForex = (forexItem: ForexAsset) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      forex: portfolio.forex.map(f => (f.id === forexItem.id ? forexItem : f)),
    });
  };

  const deleteForex = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      forex: portfolio.forex.filter(f => f.id !== id),
    });
  };

  // Income sources operations
  const addIncomeSource = (incomeData: Omit<IncomeSource, 'id'>) => {
    if (!portfolio) return;
    const newInc: IncomeSource = { ...incomeData, id: `inc_${Date.now()}` };
    savePortfolio({ ...portfolio, incomeSources: [newInc, ...portfolio.incomeSources] });
  };

  const updateIncomeSource = (income: IncomeSource) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      incomeSources: portfolio.incomeSources.map(i => (i.id === income.id ? income : i)),
    });
  };

  const deleteIncomeSource = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      incomeSources: portfolio.incomeSources.filter(i => i.id !== id),
    });
  };

  // Jobs & Defined Salary (Hourly/Daily Shift Operations)
  const addJob = (jobData: Omit<JobPosition, 'id' | 'totalEarningsToDate' | 'shiftsCompleted'>) => {
    if (!portfolio) return;
    const newJob: JobPosition = {
      ...jobData,
      id: `job_${Date.now()}`,
      totalEarningsToDate: 0,
      shiftsCompleted: 0,
      startDate: jobData.startDate || new Date().toISOString().split('T')[0],
    };
    savePortfolio({
      ...portfolio,
      jobs: [newJob, ...(portfolio.jobs || [])],
    });
  };

  const updateJob = (job: JobPosition) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      jobs: (portfolio.jobs || []).map(j => (j.id === job.id ? job : j)),
    });
  };

  const deleteJob = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      jobs: (portfolio.jobs || []).filter(j => j.id !== id),
    });
  };

  const doJobShift = (
    jobId: string,
    hoursWorked?: number,
    daysWorked?: number,
    note?: string
  ): { success: boolean; earnedAmount: number; error?: string } => {
    if (!portfolio) return { success: false, earnedAmount: 0, error: 'Portfolio not loaded' };
    const job = (portfolio.jobs || []).find(j => j.id === jobId);
    if (!job) return { success: false, earnedAmount: 0, error: 'Job position not found' };

    let earned = 0;
    let shiftDesc = '';

    if (job.rateBasis === 'per_hour') {
      const hours = hoursWorked || job.hoursPerDay || 8;
      earned = job.rateAmount * hours;
      shiftDesc = `${hours} hours worked @ $${job.rateAmount.toFixed(0)}/hr`;
    } else if (job.rateBasis === 'per_day') {
      const days = daysWorked || 1;
      earned = job.rateAmount * days;
      shiftDesc = `${days} day(s) worked @ $${job.rateAmount.toFixed(0)}/day`;
    } else {
      const days = daysWorked || 1;
      const dailyRate = job.rateAmount / 22;
      earned = Math.round(dailyRate * days);
      shiftDesc = `${days} day(s) logged on monthly salary`;
    }

    const targetBank =
      portfolio.bankAccounts.find(b => b.id === job.destinationBankId) ||
      portfolio.bankAccounts.find(b => b.isPrimaryForAutoDebit) ||
      portfolio.bankAccounts[0];

    if (!targetBank) return { success: false, earnedAmount: 0, error: 'Target bank vault not found' };

    const updatedBanks = portfolio.bankAccounts.map(b =>
      b.id === targetBank.id ? { ...b, balance: b.balance + earned } : b
    );

    const updatedJobs = (portfolio.jobs || []).map(j =>
      j.id === job.id
        ? {
            ...j,
            totalEarningsToDate: (j.totalEarningsToDate || 0) + earned,
            shiftsCompleted: (j.shiftsCompleted || 0) + (daysWorked || 1),
          }
        : j
    );

    const logEntry = {
      id: `shift_${Date.now()}`,
      timestamp: new Date().toISOString(),
      simulatedMonth: portfolio.simulatedMonth,
      simulatedDateString: `Month ${portfolio.simulatedMonth}`,
      type: 'salary_deposit' as const,
      title: `Shift Wage Credited: ${job.title}`,
      amount: earned,
      direction: 'inflow' as const,
      bankAccountAffected: targetBank.bankName,
      details: `${job.company} · ${shiftDesc}${note ? ` (${note})` : ''}. Deposited directly to ${targetBank.bankName}.`,
    };

    savePortfolio({
      ...portfolio,
      bankAccounts: updatedBanks,
      jobs: updatedJobs,
      simulationLogs: [logEntry, ...portfolio.simulationLogs],
    });

    return { success: true, earnedAmount: earned };
  };

  // Clear Everything / Wipe Portfolio
  const clearEverything = (
    mode: 'blank_slate' | 'reset_clean_starter' | 'reset_demo_portfolio' | 'reset_timeline' = 'blank_slate'
  ) => {
    if (!portfolio || !currentUser) return;

    if (mode === 'reset_timeline') {
      resetSimulation();
      return;
    }

    if (mode === 'reset_clean_starter') {
      const clean = createCleanPortfolio(currentUser);
      savePortfolio(clean);
      return;
    }

    if (mode === 'reset_demo_portfolio') {
      const demo = createDavisPortfolio(currentUser);
      savePortfolio(demo);
      return;
    }

    // Full blank slate reset ($0 net worth, 0 assets, 0 liabilities, 0 cars, 0 properties, 0 loans, 0 jobs)
    const blankPortfolio: PortfolioData = {
      user: currentUser,
      simulatedMonth: 0,
      simulationStartDate: new Date().toISOString().split('T')[0],
      cars: [],
      bankAccounts: [
        {
          id: `bank_main_${Date.now()}`,
          bankName: 'Primary Vault (Blank Slate)',
          accountType: 'Checking',
          accountNumberMasked: '••• 0001',
          balance: 0,
          currency: currentUser.currency || 'USD',
          interestRateApy: 0,
          isPrimaryForAutoDebit: true,
        },
      ],
      properties: [],
      businesses: [],
      fixedDeposits: [],
      stocks: [],
      crypto: [],
      forex: [],
      jobs: [],
      incomeSources: [],
      emis: [],
      recurringExpenses: [],
      simulationLogs: [
        {
          id: `log_cleared_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: 0,
          simulatedDateString: 'Month 0 (Wiped Slate)',
          type: 'salary_deposit',
          title: 'Complete Ledger Wiped & Cleared',
          amount: 0,
          direction: 'valuation_up',
          details: 'All assets, liabilities, vehicles, properties, investments, and jobs have been wiped to a clean $0 zero-balance slate.',
        },
      ],
      historyPoints: [
        {
          monthIndex: 0,
          dateLabel: 'Month 0',
          totalAssets: 0,
          totalLiabilities: 0,
          netWorth: 0,
          liquidCash: 0,
        },
      ],
    };

    savePortfolio(blankPortfolio);
  };

  // EMI operations (Crucial for EMI tracking & auto-deduction)
  const addEmi = (emiData: Omit<EmiLiability, 'id' | 'tenureMonthsRemaining'>) => {
    if (!portfolio) return;
    const newEmi: EmiLiability = {
      ...emiData,
      id: `emi_${Date.now()}`,
      tenureMonthsRemaining: emiData.tenureMonthsOriginal,
    };
    savePortfolio({ ...portfolio, emis: [newEmi, ...portfolio.emis] });
  };

  const updateEmi = (emi: EmiLiability) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      emis: portfolio.emis.map(e => (e.id === emi.id ? emi : e)),
    });
  };

  const deleteEmi = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      emis: portfolio.emis.filter(e => e.id !== id),
    });
  };

  const payoffEmi = (id: string, bankAccountId: string) => {
    if (!portfolio) return { success: false, error: 'Portfolio not loaded' };
    const emi = portfolio.emis.find(e => e.id === id);
    const bank = portfolio.bankAccounts.find(b => b.id === bankAccountId);

    if (!emi || !bank) return { success: false, error: 'Loan or bank account not found' };
    if (bank.balance < emi.remainingPrincipal) {
      return { success: false, error: `Insufficient bank balance to payoff remaining $${Math.round(emi.remainingPrincipal).toLocaleString()}` };
    }

    const amountPaid = emi.remainingPrincipal;
    const updatedBanks = portfolio.bankAccounts.map(b =>
      b.id === bank.id ? { ...b, balance: b.balance - amountPaid } : b
    );
    const updatedEmis = portfolio.emis.map(e =>
      e.id === emi.id ? { ...e, remainingPrincipal: 0, tenureMonthsRemaining: 0 } : e
    );

    savePortfolio({
      ...portfolio,
      bankAccounts: updatedBanks,
      emis: updatedEmis,
      simulationLogs: [
        {
          id: `payoff_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'emi_deducted',
          title: `LOAN EARLY PAYOFF: ${emi.name}`,
          amount: amountPaid,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Lump-sum payoff of $${amountPaid.toLocaleString()} debited from ${bank.bankName}. Loan obligation eliminated!`,
        },
        ...portfolio.simulationLogs,
      ],
    });

    return { success: true };
  };

  const prepayEmiPrincipal = (id: string, amount: number, bankAccountId: string) => {
    if (!portfolio || amount <= 0) return { success: false, error: 'Please enter a valid prepayment amount.' };
    const emi = portfolio.emis.find(e => e.id === id);
    const bank = portfolio.bankAccounts.find(b => b.id === bankAccountId);

    if (!emi || !bank) return { success: false, error: 'Loan or bank account not found' };
    if (bank.balance < amount) {
      return {
        success: false,
        error: `Insufficient funds in ${bank.bankName}. Available: $${bank.balance.toLocaleString()}, Required: $${amount.toLocaleString()}`,
      };
    }

    const prepayment = Math.min(amount, emi.remainingPrincipal);
    const newPrincipal = Math.max(0, Math.round(emi.remainingPrincipal - prepayment));
    const tenureFraction = emi.remainingPrincipal > 0 ? newPrincipal / emi.remainingPrincipal : 0;
    const newRemainingMonths = Math.max(0, Math.ceil(emi.tenureMonthsRemaining * tenureFraction));

    const updatedBanks = portfolio.bankAccounts.map(b =>
      b.id === bank.id ? { ...b, balance: b.balance - prepayment } : b
    );
    const updatedEmis = portfolio.emis.map(e =>
      e.id === emi.id
        ? {
            ...e,
            remainingPrincipal: newPrincipal,
            tenureMonthsRemaining: newRemainingMonths,
          }
        : e
    );

    savePortfolio({
      ...portfolio,
      bankAccounts: updatedBanks,
      emis: updatedEmis,
      simulationLogs: [
        {
          id: `prepay_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'emi_deducted',
          title: `Principal Prepayment: ${emi.name}`,
          amount: prepayment,
          direction: 'outflow',
          bankAccountAffected: bank.bankName,
          details: `Prepaid $${prepayment.toLocaleString()} directly against loan principal from ${bank.bankName}. Outstanding principal reduced to $${newPrincipal.toLocaleString()} (${newRemainingMonths} months remaining).`,
        },
        ...portfolio.simulationLogs,
      ],
    });

    return { success: true };
  };

  const toggleOverdraftProtection = (bankId: string, enabled: boolean, backupSweepBankId?: string) => {
    if (!portfolio) return;
    const updatedBanks = portfolio.bankAccounts.map(b =>
      b.id === bankId
        ? {
            ...b,
            overdraftProtectionEnabled: enabled,
            backupSweepBankId: backupSweepBankId !== undefined ? backupSweepBankId : b.backupSweepBankId,
          }
        : b
    );
    savePortfolio({
      ...portfolio,
      bankAccounts: updatedBanks,
    });
  };

  // Recurring expense operations
  const addRecurringExpense = (expData: Omit<RecurringExpense, 'id'>) => {
    if (!portfolio) return;
    const newExp: RecurringExpense = { ...expData, id: `exp_${Date.now()}` };
    savePortfolio({ ...portfolio, recurringExpenses: [newExp, ...portfolio.recurringExpenses] });
  };

  const updateRecurringExpense = (exp: RecurringExpense) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      recurringExpenses: portfolio.recurringExpenses.map(e => (e.id === exp.id ? exp : e)),
    });
  };

  const deleteRecurringExpense = (id: string) => {
    if (!portfolio) return;
    savePortfolio({
      ...portfolio,
      recurringExpenses: portfolio.recurringExpenses.filter(e => e.id !== id),
    });
  };

  // Currency, Bulk Reprice & Backup
  const bulkUpdatePrices = (updates: {
    cars?: { id: string; currentValue: number }[];
    properties?: { id: string; currentValue: number; monthlyRentalIncome?: number }[];
    businesses?: { id: string; valuation: number; monthlyNetProfit?: number }[];
    branches?: { businessId: string; branchId: string; valuation: number; monthlyRevenue?: number; monthlyExpenses?: number }[];
    stocks?: { id: string; currentPrice: number }[];
    crypto?: { id: string; currentPrice: number }[];
    forex?: { id: string; currentExchangeRate: number }[];
    fixedDeposits?: { id: string; principal: number }[];
    emis?: { id: string; remainingPrincipal: number }[];
    recurringExpenses?: { id: string; monthlyAmount: number }[];
    incomeSources?: { id: string; monthlyAmount: number }[];
  }) => {
    if (!portfolio) return;

    let updatedCars = [...portfolio.cars];
    if (updates.cars && updates.cars.length > 0) {
      const map = new Map(updates.cars.map(c => [c.id, c.currentValue]));
      updatedCars = updatedCars.map(c => (map.has(c.id) ? { ...c, currentValue: map.get(c.id)! } : c));
    }

    let updatedProps = [...portfolio.properties];
    if (updates.properties && updates.properties.length > 0) {
      const map = new Map(updates.properties.map(p => [p.id, p]));
      updatedProps = updatedProps.map(p => {
        const u = map.get(p.id);
        if (!u) return p;
        return {
          ...p,
          currentValue: u.currentValue,
          monthlyRentalIncome: u.monthlyRentalIncome !== undefined ? u.monthlyRentalIncome : p.monthlyRentalIncome,
        };
      });
    }

    let updatedBiz = [...(portfolio.businesses || [])];
    if (updates.businesses && updates.businesses.length > 0) {
      const map = new Map(updates.businesses.map(b => [b.id, b]));
      updatedBiz = updatedBiz.map(b => {
        const u = map.get(b.id);
        if (!u) return b;
        return {
          ...b,
          valuation: u.valuation,
          monthlyNetProfit: u.monthlyNetProfit !== undefined ? u.monthlyNetProfit : b.monthlyNetProfit,
        };
      });
    }

    if (updates.branches && updates.branches.length > 0) {
      updates.branches.forEach(brUpdate => {
        updatedBiz = updatedBiz.map(b => {
          if (b.id !== brUpdate.businessId) return b;
          return {
            ...b,
            branches: (b.branches || []).map(br => {
              if (br.id !== brUpdate.branchId) return br;
              return {
                ...br,
                valuation: brUpdate.valuation,
                monthlyRevenue: brUpdate.monthlyRevenue !== undefined ? brUpdate.monthlyRevenue : br.monthlyRevenue,
                monthlyExpenses: brUpdate.monthlyExpenses !== undefined ? brUpdate.monthlyExpenses : br.monthlyExpenses,
              };
            }),
          };
        });
      });
    }

    let updatedStocks = [...portfolio.stocks];
    if (updates.stocks && updates.stocks.length > 0) {
      const map = new Map(updates.stocks.map(s => [s.id, s.currentPrice]));
      updatedStocks = updatedStocks.map(s => (map.has(s.id) ? { ...s, currentPrice: map.get(s.id)! } : s));
    }

    let updatedCrypto = [...portfolio.crypto];
    if (updates.crypto && updates.crypto.length > 0) {
      const map = new Map(updates.crypto.map(c => [c.id, c.currentPrice]));
      updatedCrypto = updatedCrypto.map(c => (map.has(c.id) ? { ...c, currentPrice: map.get(c.id)! } : c));
    }

    let updatedForex = [...portfolio.forex];
    if (updates.forex && updates.forex.length > 0) {
      const map = new Map(updates.forex.map(f => [f.id, f.currentExchangeRate]));
      updatedForex = updatedForex.map(f => (map.has(f.id) ? { ...f, currentExchangeRate: map.get(f.id)! } : f));
    }

    let updatedFDs = [...portfolio.fixedDeposits];
    if (updates.fixedDeposits && updates.fixedDeposits.length > 0) {
      const map = new Map(updates.fixedDeposits.map(f => [f.id, f.principal]));
      updatedFDs = updatedFDs.map(f => (map.has(f.id) ? { ...f, principal: map.get(f.id)! } : f));
    }

    let updatedEmis = [...portfolio.emis];
    if (updates.emis && updates.emis.length > 0) {
      const map = new Map(updates.emis.map(e => [e.id, e.remainingPrincipal]));
      updatedEmis = updatedEmis.map(e => (map.has(e.id) ? { ...e, remainingPrincipal: map.get(e.id)! } : e));
    }

    let updatedExpenses = [...portfolio.recurringExpenses];
    if (updates.recurringExpenses && updates.recurringExpenses.length > 0) {
      const map = new Map(updates.recurringExpenses.map(e => [e.id, e.monthlyAmount]));
      updatedExpenses = updatedExpenses.map(e => (map.has(e.id) ? { ...e, monthlyAmount: map.get(e.id)! } : e));
    }

    let updatedIncomes = [...portfolio.incomeSources];
    if (updates.incomeSources && updates.incomeSources.length > 0) {
      const map = new Map(updates.incomeSources.map(i => [i.id, i.monthlyAmount]));
      updatedIncomes = updatedIncomes.map(i => (map.has(i.id) ? { ...i, monthlyAmount: map.get(i.id)! } : i));
    }

    savePortfolio({
      ...portfolio,
      cars: updatedCars,
      properties: updatedProps,
      businesses: updatedBiz,
      stocks: updatedStocks,
      crypto: updatedCrypto,
      forex: updatedForex,
      fixedDeposits: updatedFDs,
      emis: updatedEmis,
      recurringExpenses: updatedExpenses,
      incomeSources: updatedIncomes,
      simulationLogs: [
        {
          id: `reprice_${Date.now()}`,
          timestamp: new Date().toISOString(),
          simulatedMonth: portfolio.simulatedMonth,
          simulatedDateString: `Month ${portfolio.simulatedMonth}`,
          type: 'market_revaluation',
          title: 'Market Prices & Valuations Updated',
          amount: 0,
          direction: 'valuation_up',
          details: 'Global asset and liability price valuations were adjusted.',
        },
        ...portfolio.simulationLogs,
      ],
    });
  };

  const changeBaseCurrency = (newCurrency: CurrencyCode) => {
    if (!portfolio || !currentUser) return;
    const updatedUser = { ...currentUser, currency: newCurrency };
    const updatedUsers = allUsers.map(u => (u.username === currentUser.username ? updatedUser : u));

    setCurrentUser(updatedUser);
    setAllUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));

    savePortfolio({ ...portfolio, user: updatedUser });
  };

  const exportPortfolio = () => {
    return JSON.stringify(portfolio, null, 2);
  };

  const importPortfolio = (jsonData: string) => {
    try {
      const parsed: PortfolioData = JSON.parse(jsonData);
      if (parsed && parsed.user && Array.isArray(parsed.bankAccounts)) {
        savePortfolio(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Social Chat & P2P Money Transfer implementations
  const sendChatMessage = async (
    receiverUsername: string,
    text?: string,
    photoUrl?: string,
    sharedData?: SharedFinancialData,
    videoUrl?: string,
    mediaType?: 'photo' | 'video'
  ): Promise<{ success: boolean; message?: ChatMessage; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    const determinedMediaType = mediaType || (videoUrl ? 'video' : photoUrl ? 'photo' : undefined);
    const mediaUri = (determinedMediaType === 'video' ? videoUrl : photoUrl) || videoUrl || photoUrl;

    const payload: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderUsername: currentUser.username,
      receiverUsername,
      text: text?.trim(),
      photoUrl: determinedMediaType === 'photo' ? mediaUri?.trim() : photoUrl?.trim(),
      videoUrl: determinedMediaType === 'video' ? mediaUri?.trim() : videoUrl?.trim(),
      mediaType: determinedMediaType,
      mediaUrl: mediaUri?.trim(),
      sharedData,
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: payload }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to send message.' };
    } catch {
      return { success: false, error: 'Network error sending message.' };
    }
  };

  const fetchChatMessages = async (counterpartUsername: string): Promise<ChatMessage[]> => {
    if (!currentUser) return [];
    try {
      const res = await fetch(
        `/api/chat/messages?u1=${encodeURIComponent(currentUser.username)}&u2=${encodeURIComponent(
          counterpartUsername
        )}`
      );
      const data = await res.json();
      if (data.success && data.messages) {
        return data.messages;
      }
      return [];
    } catch {
      return [];
    }
  };

  const fetchChatThreads = async (): Promise<any[]> => {
    if (!currentUser) return [];
    try {
      const res = await fetch(`/api/chat/messages?username=${encodeURIComponent(currentUser.username)}`);
      const data = await res.json();
      if (data.success && data.threads) {
        return data.threads;
      }
      return [];
    } catch {
      return [];
    }
  };

  const markThreadRead = async (counterpartUsername: string): Promise<void> => {
    if (!currentUser) return;
    try {
      await fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderUsername: counterpartUsername,
          receiverUsername: currentUser.username,
        }),
      });
    } catch {}
  };

  const transferMoneyToUser = async (
    receiverUsername: string,
    fromBankAccountId: string,
    amount: number,
    memo?: string
  ): Promise<{ success: boolean; error?: string; transactionId?: string }> => {
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderUsername: currentUser.username,
          receiverUsername,
          fromBankAccountId,
          amount,
          memo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.updatedSenderPortfolio) {
          setPortfolio(data.updatedSenderPortfolio);
          try {
            localStorage.setItem(portfolioKey(currentUser.username), JSON.stringify(data.updatedSenderPortfolio));
          } catch {}
        }
        return { success: true, transactionId: data.transactionId };
      }
      return { success: false, error: data.error || 'Transfer failed.' };
    } catch {
      return { success: false, error: 'Network error during money transfer.' };
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        currentUser,
        allUsers,
        portfolio,
        isLoading,
        syncStatus,
        isMasterAdmin,
        login,
        register,
        continueWithGoogle,
        logout,
        switchUser,
        updateUserProfile,
        refreshPortfolio,
        advanceMonth,
        resetSimulation,
        clearEverything,
        addJob,
        updateJob,
        deleteJob,
        doJobShift,
        addCar,
        updateCar,
        upgradeCar,
        deleteCar,
        sellCar,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        transferFunds,
        addProperty,
        updateProperty,
        upgradeProperty,
        deleteProperty,
        addBusiness,
        updateBusiness,
        deleteBusiness,
        addBranch,
        updateBranch,
        deleteBranch,
        investInBusiness,
        updateMasterRates,
        addFixedDeposit,
        updateFixedDeposit,
        deleteFixedDeposit,
        addStock,
        updateStock,
        deleteStock,
        addCrypto,
        updateCrypto,
        deleteCrypto,
        addForex,
        updateForex,
        deleteForex,
        addIncomeSource,
        updateIncomeSource,
        deleteIncomeSource,
        addEmi,
        updateEmi,
        deleteEmi,
        payoffEmi,
        prepayEmiPrincipal,
        toggleOverdraftProtection,
        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        bulkUpdatePrices,
        changeBaseCurrency,
        exportPortfolio,
        importPortfolio,
        sendChatMessage,
        fetchChatMessages,
        fetchChatThreads,
        markThreadRead,
        transferMoneyToUser,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
}
