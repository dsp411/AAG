export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY' | 'SGD' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // For multi-currency conversion
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 1.08 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.28 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 0.012 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToUSD: 0.74 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 0.66 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 0.0067 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 0.76 },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rateToUSD: 0.27 },
};

export type LifestyleTier =
  | 'Frugal & Lean'
  | 'Comfortable Professional'
  | 'High-Income Executive'
  | 'Luxury & High-Flyer'
  | 'Ultra-HNW / Jet-Setter';

export interface LifeGoal {
  id: string;
  title: string;
  targetAge?: number;
  targetNetWorth?: number;
  category: 'wealth' | 'lifestyle' | 'career' | 'health';
  completed?: boolean;
}

export interface LifestyleBreakdown {
  diningAndFineFood: number;
  travelAndAviation: number;
  fitnessAndWellness: number;
  shoppingAndWardrobe: number;
  hobbiesAndMotorsport: number;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string; // Stored securely in user's isolated local database
  fullName: string;
  email?: string;
  currency: CurrencyCode;
  createdAt: string;
  bio?: string;
  avatarUrl?: string;
  authProvider?: 'aeg' | 'google';
  googleId?: string;
  isMasterAdmin?: boolean;

  // Occupation & Career
  occupationTitle?: string;
  companyName?: string;
  industry?: string;
  careerLevel?: string;
  monthlySalary?: number;
  annualCareerRaiseRate?: number;
  experienceYears?: number;
  workHoursPerWeek?: number;

  // Life, Age & Lifespan
  startingAge?: number; // baseline age at month 0 (e.g. 28)
  birthDate?: string;
  birthMonth?: number; // 1-12
  targetRetirementAge?: number; // e.g. 48
  lifeExpectancy?: number; // e.g. 88
  locationCity?: string;
  locationCountry?: string;
  relationshipStatus?: string;
  dependentsCount?: number;

  // Lifestyle & Standard of Living
  lifestyleTier?: LifestyleTier;
  residenceType?: string;
  monthlyLifestyleExpense?: number;
  lifestyleBreakdown?: LifestyleBreakdown;
  hobbies?: string[];
  lifePhilosophy?: string;
  lifeGoals?: LifeGoal[];

  // Automated Monthly Background Payout Settings
  payoutEnabled?: boolean;
  connectedBankAccountId?: string; // ID of bank account linked for automatic monthly payout
  lossCarryoverBalance?: number; // Retained loss balance to offset against future profitable months
  autoPayoutDayOfMonth?: number; // Default 1st of month

  // Real-Life Banking & Financial Health
  creditScore?: number; // Real-world FICO-grade credit score (300-850)
  emergencyFundGoalMonths?: number; // Target runway buffer (typically 3-6 months)
}

export type VehicleType =
  | 'car'
  | 'supercar'
  | 'plane'
  | 'jet'
  | 'yacht'
  | 'superyacht'
  | 'bike'
  | 'helicopter'
  | 'commercial';

export type VehicleCondition = 'Brand New' | 'Second Hand';

export interface CarAsset {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vehicleType?: VehicleType;
  condition?: VehicleCondition;
  licensePlate?: string;
  purchasePrice: number;
  currentValue: number;
  annualDepreciationRate: number; // e.g. 12%
  interestRateYearly?: number; // e.g. 5.5% auto finance rate
  linkedLoanId?: string;
  monthlyInsuranceCost: number;
  purchasedFromBankId?: string;
  imageUrl?: string;
  photos?: string[];
  notes?: string;
}

export type BankAccountType = 'Savings' | 'Checking' | 'High-Yield Savings' | 'Business Checking' | 'Forex Reserve';

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: BankAccountType;
  accountNumberMasked: string;
  routingNumber?: string; // 9-digit ABA Routing or SWIFT/BIC code
  balance: number;
  currency: CurrencyCode;
  interestRateApy: number; // Annual interest percentage
  isPrimaryForAutoDebit: boolean;
  overdraftProtectionEnabled?: boolean; // Real bank overdraft / sweep protection
  backupSweepBankId?: string; // Bank account used to automatically sweep funds if balance is insufficient
  dailyTransferLimit?: number; // Real-world daily security transfer limit
}

export interface BankStatementTransaction {
  id: string;
  date: string;
  referenceId: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'interest' | 'emi_payment' | 'bill_payment' | 'payout' | 'sweep';
  description: string;
  amount: number;
  direction: 'credit' | 'debit';
  runningBalance: number;
  status: 'Completed' | 'Cleared' | 'Pending';
}

export type PropertyType = 'Residential' | 'Commercial' | 'Rental Villa' | 'Apartment' | 'Land';

export interface PropertyAsset {
  id: string;
  name: string;
  propertyType: PropertyType;
  address: string;
  purchasePrice: number;
  currentValue: number;
  annualAppreciationRate: number; // e.g. 5.5%
  interestRateYearly?: number; // Rate of mortgage interest
  isRented: boolean;
  tenantName?: string;
  monthlyRentalIncome: number;
  linkedMortgageId?: string;
  annualPropertyTax: number;
  monthlyMaintenance: number;
  purchasedFromBankId?: string;
  imageUrl?: string;
  photos?: string[];
  notes?: string;
}

export interface FixedDepositAsset {
  id: string;
  name: string;
  institution: string;
  principal: number;
  currentAccruedValue: number;
  interestRateYearly: number; // e.g. 7.5%
  compoundingFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  startDate: string;
  tenureMonths: number;
  monthsElapsed: number;
  isMatured: boolean;
  autoCreditBankId: string; // where principal + interest goes upon maturity
}

export interface StockAsset {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  expectedAnnualGrowth: number; // e.g. 11%
  dividendYieldYearly: number; // e.g. 2.4%
  autoCreditDividendsToBankId?: string;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  expectedAnnualGrowth: number; // e.g. 18%
  stakingYieldYearly: number; // e.g. 4.5%
}

export interface ForexAsset {
  id: string;
  currencyCode: CurrencyCode;
  currencyName: string;
  amount: number;
  buyExchangeRate: number; // Rate against user's base currency
  currentExchangeRate: number;
  notes?: string;
}

export type SalaryRateBasis = 'per_hour' | 'per_day' | 'monthly_fixed';

export interface JobPosition {
  id: string;
  title: string;
  company: string;
  category:
    | 'Tech'
    | 'Executive'
    | 'Consulting'
    | 'Healthcare'
    | 'Aviation'
    | 'Trades'
    | 'Gig & Shift'
    | 'Creative'
    | 'Finance'
    | 'Other';
  rateBasis: SalaryRateBasis; // 'per_hour' | 'per_day' | 'monthly_fixed'
  rateAmount: number; // e.g., $85/hour, $600/day, or $12,000/month
  hoursPerDay: number; // e.g. 8 hours standard
  daysPerWeek: number; // e.g. 5 days standard
  workingDaysPerMonth?: number; // e.g. 22
  destinationBankId: string; // destination bank account for salary / shifts
  isActive: boolean;
  annualAppraisalRate: number; // e.g. 5% annual raise
  totalEarningsToDate: number;
  shiftsCompleted: number;
  description?: string;
  startDate?: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  sourceType: 'Salary' | 'Business' | 'Consulting' | 'Royalties' | 'Pensions' | 'Other';
  monthlyAmount: number;
  destinationBankId: string;
  annualAppraisalRate: number; // e.g. 6% pay raise p.a.
}

export interface EmiLiability {
  id: string;
  name: string;
  loanType: 'Car Loan' | 'Home Mortgage' | 'Personal Loan' | 'Commercial Loan';
  principalOriginal: number;
  remainingPrincipal: number;
  interestRateYearly: number; // e.g. 6.8%
  tenureMonthsOriginal: number;
  tenureMonthsRemaining: number;
  monthlyEmiAmount: number;
  linkedBankAccountId: string;
  linkedAssetType?: 'car' | 'property' | 'none';
  linkedAssetId?: string;
  autoDebitEnabled: boolean;
}

export interface RecurringExpense {
  id: string;
  name: string;
  category: 'Utilities' | 'Insurance' | 'Subscriptions' | 'Maintenance' | 'Education' | 'Family' | 'Lifestyle' | 'Other';
  monthlyAmount: number;
  dueDayOfMonth: number;
  linkedBankAccountId: string;
  autoDebitEnabled: boolean;
}

export type BranchStatus = 'Active' | 'Expanding' | 'Renovating' | 'Planned';

export interface BusinessBranch {
  id: string;
  name: string;
  location: string; // e.g. "Chicago, IL - West Loop"
  address?: string;
  managerName?: string;
  employeeCount: number;
  capitalInvested: number; // Initial capital or equipment valuation
  monthlyRevenue: number;
  monthlyExpenses: number;
  valuation: number; // Branch entity asset valuation
  status: BranchStatus;
  openedDate?: string;
  notes?: string;
}

export interface BusinessAsset {
  id: string;
  name: string;
  industry: string; // e.g. "Freight & Logistics", "Specialty Coffee Roasters", "SaaS Tech"
  valuation: number; // Total Enterprise Valuation
  ownershipPercentage: number; // 1-100%
  annualGrowthRate: number; // e.g. 15%
  monthlyNetProfit: number; // Total base monthly profit / owner dividend
  destinationBankId?: string; // Auto-credits dividend to linked bank
  reinvestProfits: boolean; // If true, retains profits in business growth instead of payout
  branches: BusinessBranch[];
  incorporationYear?: number;
  registrationNumber?: string;
  notes?: string;
}

export interface SimulationLogEntry {
  id: string;
  timestamp: string;
  simulatedMonth: number;
  simulatedDateString: string;
  type:
    | 'salary_deposit'
    | 'rental_income'
    | 'business_dividend'
    | 'business_growth'
    | 'fd_interest'
    | 'fd_matured'
    | 'stock_growth'
    | 'stock_dividend'
    | 'crypto_growth'
    | 'forex_fluctuation'
    | 'emi_deducted'
    | 'expense_deducted'
    | 'car_depreciation'
    | 'property_appreciation'
    | 'market_revaluation'
    | 'business_investment'
    | 'asset_purchase'
    | 'overdraft_alert';
  title: string;
  amount: number;
  direction: 'inflow' | 'outflow' | 'valuation_up' | 'valuation_down' | 'alert';
  bankAccountAffected?: string;
  details: string;
}

export interface NetWorthHistoryPoint {
  monthIndex: number;
  dateLabel: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidCash: number;
}

export interface SharedFinancialData {
  type: 'car' | 'property' | 'business' | 'stock' | 'crypto' | 'stats' | 'money_transfer';
  title: string;
  subtitle: string;
  amount?: number;
  currency?: CurrencyCode;
  imageUrl?: string;
  details?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  text?: string;
  photoUrl?: string;
  videoUrl?: string;
  mediaType?: 'photo' | 'video';
  mediaUrl?: string;
  sharedData?: SharedFinancialData;
  timestamp: string;
  read: boolean;
}

export interface PortfolioData {
  user: UserAccount;
  simulatedMonth: number; // 0 = current day, 1 = 1 month later, etc.
  simulationStartDate: string; // ISO date
  lastSettledTimestamp?: string; // ISO timestamp of last offline time settlement
  cars: CarAsset[];
  bankAccounts: BankAccount[];
  properties: PropertyAsset[];
  businesses: BusinessAsset[];
  fixedDeposits: FixedDepositAsset[];
  stocks: StockAsset[];
  crypto: CryptoAsset[];
  forex: ForexAsset[];
  jobs?: JobPosition[];
  incomeSources: IncomeSource[];
  emis: EmiLiability[];
  recurringExpenses: RecurringExpense[];
  simulationLogs: SimulationLogEntry[];
  historyPoints: NetWorthHistoryPoint[];
}

export type PayoutStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'skipped_zero_profit'
  | 'skipped_loss'
  | 'failed';

export interface PayoutBreakdown {
  revenues: {
    businessProfits: number;
    rentalIncomes: number;
    salariesAndJobs: number;
    dividendsAndInterests: number;
    totalRevenue: number;
  };
  expenses: {
    businessOverheads: number;
    emiObligations: number;
    recurringExpenses: number;
    propertyTaxesAndMaint: number;
    totalExpenses: number;
  };
}

export interface PayoutRecord {
  id: string;
  userId: string;
  username: string;
  billingPeriod: string;
  monthIndex: number;
  totalRevenue: number;
  totalExpenses: number;
  grossNetProfit: number;
  carriedLossDeducted: number;
  netPayoutAmount: number;
  newLossCarryover: number;
  currency: CurrencyCode;
  status: PayoutStatus;
  connectedBankAccountId: string;
  connectedBankName: string;
  gatewayTransferId?: string;
  idempotencyKey: string;
  failureReason?: string;
  breakdown: PayoutBreakdown;
  executedAt: string;
  createdAt: string;
}

