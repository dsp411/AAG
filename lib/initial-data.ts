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
  SUPPORTED_CURRENCIES,
  CurrencyCode,
} from '@/types/finance';

export function calculateJobMonthlySalary(job: JobPosition): number {
  const hoursPerDay = job.hoursPerDay || 8;
  const daysPerWeek = job.daysPerWeek || 5;
  const weeksPerMonth = 4.333333333333334;

  if (job.rateBasis === 'per_hour') {
    return job.rateAmount * hoursPerDay * (daysPerWeek * weeksPerMonth);
  } else if (job.rateBasis === 'per_day') {
    return job.rateAmount * (daysPerWeek * weeksPerMonth);
  } else {
    return job.rateAmount;
  }
}

export function calculateJobDailyRate(job: JobPosition): number {
  const hoursPerDay = job.hoursPerDay || 8;
  const daysPerWeek = job.daysPerWeek || 5;
  const weeksPerMonth = 4.333333333333334;

  if (job.rateBasis === 'per_day') {
    return job.rateAmount;
  } else if (job.rateBasis === 'per_hour') {
    return job.rateAmount * hoursPerDay;
  } else {
    return job.rateAmount / (daysPerWeek * weeksPerMonth);
  }
}

export function calculateJobHourlyRate(job: JobPosition): number {
  const hoursPerDay = job.hoursPerDay || 8;
  const daysPerWeek = job.daysPerWeek || 5;
  const weeksPerMonth = 4.333333333333334;

  if (job.rateBasis === 'per_hour') {
    return job.rateAmount;
  } else if (job.rateBasis === 'per_day') {
    return job.rateAmount / hoursPerDay;
  } else {
    return job.rateAmount / ((daysPerWeek * weeksPerMonth) * hoursPerDay);
  }
}

export function getUserSimulatedAge(startingAge: number = 28, simulatedMonths: number = 0): {
  years: number;
  months: number;
  totalDecimal: number;
  label: string;
} {
  const totalMonths = Math.max(0, (startingAge || 28) * 12 + (simulatedMonths || 0));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const totalDecimal = +(years + months / 12).toFixed(2);
  const label = months === 0 ? `${years} yrs` : `${years} yrs ${months} mo${months > 1 ? 's' : ''}`;
  return { years, months, totalDecimal, label };
}

export const DEMO_USERS: UserAccount[] = [
  {
    id: 'user_davis',
    username: 'davis',
    password: 'password123',
    fullName: 'Davis Sandhu',
    email: 'davissandhu2@gmail.com',
    currency: 'USD',
    createdAt: '2026-01-15T09:00:00.000Z',
    bio: 'Tech entrepreneur, venture builder & multi-asset investor tracking compounding portfolios, exotic vehicles, luxury real estate, and financial independence.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isMasterAdmin: true,

    // Occupation & Career
    occupationTitle: 'Founder & Managing Partner',
    companyName: 'AAG Capital & Ventures',
    industry: 'FinTech, Artificial Intelligence & High-Performance Assets',
    careerLevel: 'Founder & CEO',
    monthlySalary: 28500,
    annualCareerRaiseRate: 8.5,
    experienceYears: 9,
    workHoursPerWeek: 48,

    // Life, Age & Lifespan
    startingAge: 28,
    birthDate: '1998-06-12',
    birthMonth: 6,
    targetRetirementAge: 45,
    lifeExpectancy: 88,
    locationCity: 'Bellevue & Seattle, WA',
    locationCountry: 'United States',
    relationshipStatus: 'In a Relationship',
    dependentsCount: 0,

    // Lifestyle & Standard of Living
    lifestyleTier: 'Luxury & High-Flyer',
    residenceType: 'Waterfront Villa & City Penthouse',
    monthlyLifestyleExpense: 8500,
    lifestyleBreakdown: {
      diningAndFineFood: 2500,
      travelAndAviation: 3000,
      fitnessAndWellness: 1000,
      shoppingAndWardrobe: 1200,
      hobbiesAndMotorsport: 800,
    },
    hobbies: [
      'Supercar Track Days',
      'Private Aviation & Jet Piloting',
      'Horology & Rare Timepieces',
      'Waterfront Boating & Yachting',
      'Venture Tech Investing',
    ],
    lifePhilosophy:
      'Relentless compounding of capital, physical peak health, absolute time sovereignty, and enduring enterprise impact.',
    lifeGoals: [
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
        title: 'Acquire 76ft Luxury Motor Yacht',
        targetAge: 30,
        targetNetWorth: 4000000,
        category: 'lifestyle',
        completed: true,
      },
      {
        id: 'goal_3',
        title: 'Complete Commercial Pilot Jet Certification',
        targetAge: 33,
        category: 'career',
        completed: false,
      },
      {
        id: 'goal_4',
        title: 'Achieve Complete Financial Freedom (FIRE Target)',
        targetAge: 45,
        targetNetWorth: 15000000,
        category: 'wealth',
        completed: false,
      },
    ],
  },
  {
    id: 'user_sophia',
    username: 'sophia',
    password: 'password123',
    fullName: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    currency: 'USD',
    createdAt: '2026-02-10T14:30:00.000Z',
    bio: 'Quantitative researcher and macro investor tracking high-yield FDs, global equities, crypto yields, and apartment mortgage amortizations.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    isMasterAdmin: false,

    occupationTitle: 'Lead Quantitative Strategist',
    companyName: 'Citadel Meridian Partners',
    industry: 'Quantitative Hedge Fund',
    careerLevel: 'Director',
    monthlySalary: 22000,
    annualCareerRaiseRate: 9.0,
    experienceYears: 7,
    workHoursPerWeek: 45,

    startingAge: 27,
    birthDate: '1999-04-18',
    birthMonth: 4,
    targetRetirementAge: 42,
    lifeExpectancy: 90,
    locationCity: 'Manhattan, New York',
    locationCountry: 'United States',
    relationshipStatus: 'Single',
    dependentsCount: 0,

    lifestyleTier: 'High-Income Executive',
    residenceType: 'High-Rise Luxury Loft',
    monthlyLifestyleExpense: 6200,
    lifestyleBreakdown: {
      diningAndFineFood: 2000,
      travelAndAviation: 2200,
      fitnessAndWellness: 800,
      shoppingAndWardrobe: 800,
      hobbiesAndMotorsport: 400,
    },
    hobbies: ['Macro Economic Research', 'Alpine Skiing', 'Fine Wine Tasting', 'Classical Piano', 'Pilates'],
    lifePhilosophy: 'Precision in risk management, compounding efficiency, and intellectual autonomy.',
    lifeGoals: [
      {
        id: 'goal_s1',
        title: 'Hit $3,000,000 Investment Portfolio',
        targetAge: 30,
        targetNetWorth: 3000000,
        category: 'wealth',
        completed: false,
      },
      {
        id: 'goal_s2',
        title: 'Launch Proprietary Global Macro Fund',
        targetAge: 35,
        category: 'career',
        completed: false,
      },
    ],
  },
];

export function createDavisPortfolio(customUser?: UserAccount): PortfolioData {
  const user = customUser || DEMO_USERS[0];
  const cars: CarAsset[] = [
    {
      id: 'car_1',
      name: 'Porsche 911 GT3 (992)',
      make: 'Porsche',
      model: '911 GT3',
      year: 2024,
      vehicleType: 'supercar',
      condition: 'Brand New',
      licensePlate: 'P911-WTH',
      purchasePrice: 228000,
      currentValue: 242000,
      annualDepreciationRate: -3.0,
      interestRateYearly: 4.8,
      monthlyInsuranceCost: 380,
      purchasedFromBankId: 'bank_chase',
      imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      ],
      notes: 'Shark Blue, Carbon Ceramics, Track Package. Maintained in private garage.',
    },
    {
      id: 'car_2',
      name: 'Tesla Model S Plaid',
      make: 'Tesla',
      model: 'Model S Plaid',
      year: 2024,
      vehicleType: 'car',
      condition: 'Brand New',
      licensePlate: 'EV-PLAID',
      purchasePrice: 94000,
      currentValue: 82000,
      annualDepreciationRate: 12.0,
      interestRateYearly: 5.2,
      linkedLoanId: 'emi_tesla',
      monthlyInsuranceCost: 260,
      purchasedFromBankId: 'bank_chase',
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
      ],
      notes: 'Daily driver with Full Self-Driving. Active 4-year low APR auto loan.',
    },
    {
      id: 'veh_jet_1',
      name: 'Gulfstream G280 Executive Jet',
      make: 'Gulfstream',
      model: 'G280',
      year: 2023,
      vehicleType: 'jet',
      condition: 'Second Hand',
      licensePlate: 'N882AE',
      purchasePrice: 8500000,
      currentValue: 8250000,
      annualDepreciationRate: 4.5,
      interestRateYearly: 6.2,
      monthlyInsuranceCost: 4200,
      purchasedFromBankId: 'bank_schwab',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      ],
      notes: 'Corporate jet for global logistics and cross-border branch management. Range: 3,600 nm.',
    },
    {
      id: 'veh_yacht_1',
      name: 'Sunseeker 76 Luxury Yacht',
      make: 'Sunseeker',
      model: '76 Yacht',
      year: 2023,
      vehicleType: 'yacht',
      condition: 'Brand New',
      licensePlate: 'M-DUBAI-76',
      purchasePrice: 4200000,
      currentValue: 3980000,
      annualDepreciationRate: 6.0,
      interestRateYearly: 5.8,
      monthlyInsuranceCost: 2800,
      purchasedFromBankId: 'bank_dbs',
      imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
      ],
      notes: 'Moored at Dubai Marina. 4 en-suite cabins, hydraulic bathing platform.',
    },
    {
      id: 'veh_bike_1',
      name: 'Ducati Panigale V4 SP2',
      make: 'Ducati',
      model: 'Panigale V4 SP2',
      year: 2024,
      vehicleType: 'bike',
      condition: 'Brand New',
      licensePlate: 'V4-SP2',
      purchasePrice: 41500,
      currentValue: 40200,
      annualDepreciationRate: 8.0,
      interestRateYearly: 4.9,
      monthlyInsuranceCost: 140,
      purchasedFromBankId: 'bank_chase',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
      ],
      notes: 'Winter Test Livery, carbon wheels, dry clutch. Track day machine.',
    },
  ];

  const bankAccounts: BankAccount[] = [
    {
      id: 'bank_chase',
      bankName: 'JPMorgan Chase Private Client',
      accountType: 'Checking',
      accountNumberMasked: '••• 8841',
      routingNumber: '021000021',
      balance: 142500,
      currency: 'USD',
      interestRateApy: 10.0,
      isPrimaryForAutoDebit: true,
      overdraftProtectionEnabled: true,
      backupSweepBankId: 'bank_schwab',
      dailyTransferLimit: 250000,
    },
    {
      id: 'bank_schwab',
      bankName: 'Charles Schwab High-Yield Vault',
      accountType: 'High-Yield Savings',
      accountNumberMasked: '••• 4092',
      routingNumber: '121000358',
      balance: 285000,
      currency: 'USD',
      interestRateApy: 10.0,
      isPrimaryForAutoDebit: false,
      overdraftProtectionEnabled: false,
      dailyTransferLimit: 500000,
    },
    {
      id: 'bank_dbs',
      bankName: 'DBS Wealth Singapore Reserve',
      accountType: 'Forex Reserve',
      accountNumberMasked: '••• 6120',
      routingNumber: 'DBSSSGSGXXX',
      balance: 95000,
      currency: 'USD',
      interestRateApy: 10.0,
      isPrimaryForAutoDebit: false,
      overdraftProtectionEnabled: false,
      dailyTransferLimit: 1000000,
    },
  ];

  const properties: PropertyAsset[] = [
    {
      id: 'prop_bellevue',
      name: 'Bellevue Waterfront Villa',
      propertyType: 'Residential',
      address: '942 Lake Washington Blvd, Bellevue, WA',
      purchasePrice: 1650000,
      currentValue: 1980000,
      annualAppreciationRate: 5.8,
      isRented: true,
      tenantName: 'Dr. Marcus Vance (Tech VP)',
      monthlyRentalIncome: 9200,
      linkedMortgageId: 'emi_mortgage_bellevue',
      annualPropertyTax: 16500,
      monthlyMaintenance: 450,
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      ],
      notes: 'Waterfront luxury estate with private boat dock, infinity pool, and smart security system.',
    },
    {
      id: 'prop_austin',
      name: 'Austin Tech Corridor Loft',
      propertyType: 'Commercial',
      address: '401 Colorado St #18B, Austin, TX',
      purchasePrice: 620000,
      currentValue: 710000,
      annualAppreciationRate: 6.2,
      isRented: true,
      tenantName: 'AeroLogic AI Design Studio',
      monthlyRentalIncome: 4600,
      linkedMortgageId: 'emi_mortgage_austin',
      annualPropertyTax: 8400,
      monthlyMaintenance: 320,
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      ],
      notes: 'High-ceiling industrial creative office loft in downtown Austin leased to a growing AI firm.',
    },
  ];

  const fixedDeposits: FixedDepositAsset[] = [
    {
      id: 'fd_1',
      name: 'HDFC High-Yield Fixed Term 12M',
      institution: 'HDFC Global / Federal Bank',
      principal: 120000,
      currentAccruedValue: 124800,
      interestRateYearly: 7.6,
      compoundingFrequency: 'Monthly',
      startDate: '2026-04-01',
      tenureMonths: 12,
      monthsElapsed: 5,
      isMatured: false,
      autoCreditBankId: 'bank_chase',
    },
    {
      id: 'fd_2',
      name: 'Barclays 24-Month Guaranteed Growth',
      institution: 'Barclays Private Bank',
      principal: 200000,
      currentAccruedValue: 211200,
      interestRateYearly: 6.8,
      compoundingFrequency: 'Quarterly',
      startDate: '2025-10-15',
      tenureMonths: 24,
      monthsElapsed: 11,
      isMatured: false,
      autoCreditBankId: 'bank_schwab',
    },
  ];

  const stocks: StockAsset[] = [
    {
      id: 'stock_nvda',
      ticker: 'NVDA',
      companyName: 'NVIDIA Corporation',
      shares: 600,
      buyPrice: 92.5,
      currentPrice: 138.4,
      expectedAnnualGrowth: 18.5,
      dividendYieldYearly: 0.2,
      autoCreditDividendsToBankId: 'bank_schwab',
    },
    {
      id: 'stock_aapl',
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      shares: 450,
      buyPrice: 175.0,
      currentPrice: 228.6,
      expectedAnnualGrowth: 11.2,
      dividendYieldYearly: 0.6,
      autoCreditDividendsToBankId: 'bank_schwab',
    },
    {
      id: 'stock_spy',
      ticker: 'SPY',
      companyName: 'SPDR S&P 500 ETF Trust',
      shares: 320,
      buyPrice: 470.0,
      currentPrice: 574.0,
      expectedAnnualGrowth: 9.5,
      dividendYieldYearly: 1.35,
      autoCreditDividendsToBankId: 'bank_schwab',
    },
  ];

  const crypto: CryptoAsset[] = [
    {
      id: 'crypto_btc',
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 3.42,
      buyPrice: 44500,
      currentPrice: 68500,
      expectedAnnualGrowth: 22.0,
      stakingYieldYearly: 0,
    },
    {
      id: 'crypto_eth',
      symbol: 'ETH',
      name: 'Ethereum (Staked)',
      quantity: 28.5,
      buyPrice: 2400,
      currentPrice: 3450,
      expectedAnnualGrowth: 18.0,
      stakingYieldYearly: 4.1,
    },
    {
      id: 'crypto_sol',
      symbol: 'SOL',
      name: 'Solana',
      quantity: 180,
      buyPrice: 85,
      currentPrice: 156,
      expectedAnnualGrowth: 25.0,
      stakingYieldYearly: 6.2,
    },
  ];

  const forex: ForexAsset[] = [
    {
      id: 'fx_eur',
      currencyCode: 'EUR',
      currencyName: 'Euro',
      amount: 45000,
      buyExchangeRate: 1.06,
      currentExchangeRate: 1.085,
      notes: 'European vacation & business hedging holding in Frankfurt',
    },
    {
      id: 'fx_gbp',
      currencyCode: 'GBP',
      currencyName: 'British Pound Sterling',
      amount: 25000,
      buyExchangeRate: 1.25,
      currentExchangeRate: 1.282,
      notes: 'London property fund deposit',
    },
    {
      id: 'fx_sgd',
      currencyCode: 'SGD',
      currencyName: 'Singapore Dollar',
      amount: 60000,
      buyExchangeRate: 0.74,
      currentExchangeRate: 0.765,
      notes: 'Asia-Pacific reserve liquidity',
    },
  ];

  const incomeSources: IncomeSource[] = [
    {
      id: 'inc_salary',
      name: 'Executive Tech Base Compensation',
      sourceType: 'Salary',
      monthlyAmount: 24500,
      destinationBankId: 'bank_chase',
      annualAppraisalRate: 6.0,
    },
    {
      id: 'inc_consulting',
      name: 'Board Advisory & Venture Retainer',
      sourceType: 'Consulting',
      monthlyAmount: 6000,
      destinationBankId: 'bank_chase',
      annualAppraisalRate: 4.0,
    },
  ];

  const emis: EmiLiability[] = [
    {
      id: 'emi_mortgage_bellevue',
      name: 'Bellevue Waterfront Mortgage',
      loanType: 'Home Mortgage',
      principalOriginal: 1200000,
      remainingPrincipal: 980000,
      interestRateYearly: 5.4,
      tenureMonthsOriginal: 360,
      tenureMonthsRemaining: 284,
      monthlyEmiAmount: 6742,
      linkedBankAccountId: 'bank_chase',
      linkedAssetType: 'property',
      linkedAssetId: 'prop_bellevue',
      autoDebitEnabled: true,
    },
    {
      id: 'emi_mortgage_austin',
      name: 'Austin Commercial Loan',
      loanType: 'Commercial Loan',
      principalOriginal: 450000,
      remainingPrincipal: 368000,
      interestRateYearly: 6.1,
      tenureMonthsOriginal: 240,
      tenureMonthsRemaining: 188,
      monthlyEmiAmount: 3250,
      linkedBankAccountId: 'bank_chase',
      linkedAssetType: 'property',
      linkedAssetId: 'prop_austin',
      autoDebitEnabled: true,
    },
    {
      id: 'emi_tesla',
      name: 'Tesla Model S Plaid Auto Loan',
      loanType: 'Car Loan',
      principalOriginal: 750000 / 10, // 75,000
      remainingPrincipal: 48500,
      interestRateYearly: 3.99,
      tenureMonthsOriginal: 60,
      tenureMonthsRemaining: 38,
      monthlyEmiAmount: 1380,
      linkedBankAccountId: 'bank_chase',
      linkedAssetType: 'car',
      linkedAssetId: 'car_2',
      autoDebitEnabled: true,
    },
  ];

  const recurringExpenses: RecurringExpense[] = [
    {
      id: 'exp_luxury_ins',
      name: 'Chubb Comprehensive Umbrella & Auto Insurance',
      category: 'Insurance',
      monthlyAmount: 820,
      dueDayOfMonth: 5,
      linkedBankAccountId: 'bank_chase',
      autoDebitEnabled: true,
    },
    {
      id: 'exp_utilities',
      name: 'Properties Power, Fiber & Water Utilities',
      category: 'Utilities',
      monthlyAmount: 650,
      dueDayOfMonth: 12,
      linkedBankAccountId: 'bank_chase',
      autoDebitEnabled: true,
    },
    {
      id: 'exp_lifestyle',
      name: 'Concierge, Health Club & Professional Memberships',
      category: 'Lifestyle',
      monthlyAmount: 950,
      dueDayOfMonth: 1,
      linkedBankAccountId: 'bank_chase',
      autoDebitEnabled: true,
    },
  ];

  const businesses: BusinessAsset[] = [
    {
      id: 'biz_1',
      name: 'Sandhu Freight & Global Logistics',
      industry: 'Supply Chain & Freight Tech',
      valuation: 1850000,
      ownershipPercentage: 85,
      annualGrowthRate: 16.5,
      monthlyNetProfit: 22400,
      destinationBankId: 'bank_chase',
      reinvestProfits: false,
      incorporationYear: 2021,
      registrationNumber: 'LLC-IL-99214',
      notes: 'Cross-border fleet logistics and warehouse fulfillment centers.',
      branches: [
        {
          id: 'branch_1',
          name: 'Midwest Mega-Hub',
          location: 'Chicago, IL (O\'Hare Industrial)',
          address: '4400 Logistics Way, Des Plaines, IL',
          managerName: 'Marcus Vance',
          employeeCount: 42,
          capitalInvested: 620000,
          monthlyRevenue: 98000,
          monthlyExpenses: 74000,
          valuation: 850000,
          status: 'Active',
          notes: 'Primary freight sorting and dispatch terminal.',
        },
        {
          id: 'branch_2',
          name: 'Southwest Distribution Depot',
          location: 'Dallas, TX (DFW Corridor)',
          address: '1200 Alliance Pkwy, Fort Worth, TX',
          managerName: 'Elena Rostova',
          employeeCount: 28,
          capitalInvested: 410000,
          monthlyRevenue: 64000,
          monthlyExpenses: 49000,
          valuation: 550000,
          status: 'Active',
          notes: 'High volume regional cross-dock facility.',
        },
        {
          id: 'branch_3',
          name: 'Southeast Cold Storage Expansion',
          location: 'Atlanta, GA (Airport Gateway)',
          address: '880 Interstate Gateway, College Park, GA',
          managerName: 'Derrick Hall',
          employeeCount: 16,
          capitalInvested: 350000,
          monthlyRevenue: 38000,
          monthlyExpenses: 31000,
          valuation: 450000,
          status: 'Expanding',
          notes: 'Phase 2 refrigerated expansion with automated packing.',
        },
      ],
    },
    {
      id: 'biz_2',
      name: 'Aura Artisan Coffee Roasters',
      industry: 'Specialty Beverage & Cafés',
      valuation: 620000,
      ownershipPercentage: 100,
      annualGrowthRate: 12.0,
      monthlyNetProfit: 8600,
      destinationBankId: 'bank_schwab',
      reinvestProfits: false,
      incorporationYear: 2023,
      registrationNumber: 'CORP-TX-44182',
      notes: 'Direct-trade specialty micro-roastery and flagship espresso bar experiences.',
      branches: [
        {
          id: 'branch_aura_1',
          name: 'Downtown Roastery & Tasting Room',
          location: 'Austin, TX - South Congress',
          address: '1402 S Congress Ave, Austin, TX',
          managerName: 'Chloe Bennett',
          employeeCount: 14,
          capitalInvested: 240000,
          monthlyRevenue: 42000,
          monthlyExpenses: 34500,
          valuation: 360000,
          status: 'Active',
          notes: 'Includes on-site Diedrich 12kg roaster and barista training lab.',
        },
        {
          id: 'branch_aura_2',
          name: 'Domain Tech Center Kiosk',
          location: 'Austin, TX - The Domain',
          address: '11500 Century Oaks Terrace, Austin, TX',
          managerName: 'Liam Morales',
          employeeCount: 7,
          capitalInvested: 95000,
          monthlyRevenue: 26000,
          monthlyExpenses: 21500,
          valuation: 160000,
          status: 'Active',
          notes: 'High-footprint grab-and-go kiosk catering to tech campuses.',
        },
        {
          id: 'branch_aura_3',
          name: 'Denver Highlands Boutique',
          location: 'Denver, CO - Highlands',
          address: '3200 Tejon St, Denver, CO',
          managerName: 'Sophia Lin',
          employeeCount: 0,
          capitalInvested: 110000,
          monthlyRevenue: 0,
          monthlyExpenses: 4500,
          valuation: 100000,
          status: 'Renovating',
          notes: 'Under architectural fit-out. Grand opening planned next quarter.',
        },
      ],
    },
  ];

  const jobs: JobPosition[] = [
    {
      id: 'job_arch_1',
      title: 'Principal AI & Cloud Architect',
      company: 'OmniTech Enterprise Systems',
      category: 'Tech',
      rateBasis: 'per_hour',
      rateAmount: 125, // $125/hr
      hoursPerDay: 8,
      daysPerWeek: 5,
      destinationBankId: 'bank_chase',
      isActive: true,
      annualAppraisalRate: 8.0,
      totalEarningsToDate: 450000,
      shiftsCompleted: 240,
      description: 'Distributed infrastructure design, latency optimization, and core banking ledger systems.',
      startDate: '2025-03-01',
    },
    {
      id: 'job_advisor_2',
      title: 'Senior Strategic Venture Advisor',
      company: 'Aura Capital Partners',
      category: 'Executive',
      rateBasis: 'per_day',
      rateAmount: 1600, // $1,600/day
      hoursPerDay: 8,
      daysPerWeek: 2, // 2 advisory days per week
      destinationBankId: 'bank_schwab',
      isActive: true,
      annualAppraisalRate: 6.0,
      totalEarningsToDate: 180000,
      shiftsCompleted: 75,
      description: 'Corporate growth roadmap, M&A due diligence, and capital allocation strategy.',
      startDate: '2025-08-15',
    },
  ];

  const initialDate = '2026-10-01';
  const initialAssets =
    cars.reduce((sum, c) => sum + c.currentValue, 0) +
    bankAccounts.reduce((sum, b) => sum + b.balance, 0) +
    properties.reduce((sum, p) => sum + p.currentValue, 0) +
    businesses.reduce((sum, b) => sum + b.valuation * (b.ownershipPercentage / 100), 0) +
    fixedDeposits.reduce((sum, f) => sum + f.currentAccruedValue, 0) +
    stocks.reduce((sum, s) => sum + s.shares * s.currentPrice, 0) +
    crypto.reduce((sum, cr) => sum + cr.quantity * cr.currentPrice, 0) +
    forex.reduce((sum, fx) => sum + fx.amount * fx.currentExchangeRate, 0);

  const initialLiabilities = emis.reduce((sum, e) => sum + e.remainingPrincipal, 0);

  return {
    user,
    simulatedMonth: 0,
    simulationStartDate: initialDate,
    cars,
    bankAccounts,
    properties,
    businesses,
    fixedDeposits,
    stocks,
    crypto,
    forex,
    jobs,
    incomeSources,
    emis,
    recurringExpenses,
    simulationLogs: [
      {
        id: 'log_init',
        timestamp: new Date().toISOString(),
        simulatedMonth: 0,
        simulatedDateString: 'Oct 2026 (Initial Baseline)',
        type: 'salary_deposit',
        title: 'Portfolio Baseline Established',
        amount: initialAssets - initialLiabilities,
        direction: 'valuation_up',
        details: 'Initial net worth snapshot calibrated across 7 asset classes, jobs, and active debt schedules.',
      },
    ],
    historyPoints: [
      {
        monthIndex: 0,
        dateLabel: 'Oct 2026',
        totalAssets: Math.round(initialAssets),
        totalLiabilities: Math.round(initialLiabilities),
        netWorth: Math.round(initialAssets - initialLiabilities),
        liquidCash: Math.round(bankAccounts.reduce((sum, b) => sum + b.balance, 0)),
      },
    ],
    lastSettledTimestamp: new Date().toISOString(),
  };
}

export function createCleanPortfolio(user: UserAccount): PortfolioData {
  const bankAccounts: BankAccount[] = [
    {
      id: 'bank_starter',
      bankName: 'Main Vault Account',
      accountType: 'Savings',
      accountNumberMasked: '••• 1001',
      routingNumber: '071000013',
      balance: 10000,
      currency: user.currency,
      interestRateApy: 10.0,
      isPrimaryForAutoDebit: true,
      overdraftProtectionEnabled: false,
      dailyTransferLimit: 100000,
    },
  ];

  return {
    user,
    simulatedMonth: 0,
    simulationStartDate: new Date().toISOString().split('T')[0],
    lastSettledTimestamp: new Date().toISOString(),
    cars: [],
    bankAccounts,
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
        id: 'log_init_clean',
        timestamp: new Date().toISOString(),
        simulatedMonth: 0,
        simulatedDateString: 'Day 1 Baseline',
        type: 'salary_deposit',
        title: 'Fresh Ledger Initialized',
        amount: 10000,
        direction: 'inflow',
        details: 'Initial starter account initialized. Add your cars, bank accounts, properties, businesses, FDs, jobs, and EMIs.',
      },
    ],
    historyPoints: [
      {
        monthIndex: 0,
        dateLabel: 'Month 0',
        totalAssets: 10000,
        totalLiabilities: 0,
        netWorth: 10000,
        liquidCash: 10000,
      },
    ],
  };
}

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'USD',
  compact: boolean = false
): string {
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (compact && absAmount >= 1_000_000) {
    const formatted = (absAmount / 1_000_000).toFixed(2) + 'M';
    return `${isNegative ? '-' : ''}${config.symbol}${formatted}`;
  } else if (compact && absAmount >= 1_000) {
    const formatted = (absAmount / 1_000).toFixed(1) + 'k';
    return `${isNegative ? '-' : ''}${config.symbol}${formatted}`;
  }

  const parts = Math.round(absAmount).toLocaleString('en-US');
  return `${isNegative ? '-' : ''}${config.symbol}${parts}`;
}

export function calculateSummaryMetrics(portfolio: PortfolioData) {
  const businesses = portfolio.businesses || [];
  const jobs = portfolio.jobs || [];
  const carsVal = portfolio.cars.reduce((sum, c) => sum + c.currentValue, 0);
  const bankVal = portfolio.bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const propVal = portfolio.properties.reduce((sum, p) => sum + p.currentValue, 0);
  const businessesVal = businesses.reduce((sum, b) => sum + b.valuation * (b.ownershipPercentage / 100), 0);
  const branchesCount = businesses.reduce((sum, b) => sum + (b.branches?.length || 0), 0);
  const branchesVal = businesses.reduce((sum, b) => sum + (b.branches?.reduce((bs, br) => bs + br.valuation, 0) || 0), 0);
  const fdVal = portfolio.fixedDeposits.reduce((sum, f) => sum + f.currentAccruedValue, 0);
  const stockVal = portfolio.stocks.reduce((sum, s) => sum + s.shares * s.currentPrice, 0);
  const cryptoVal = portfolio.crypto.reduce((sum, cr) => sum + cr.quantity * cr.currentPrice, 0);
  const forexVal = portfolio.forex.reduce((sum, fx) => sum + fx.amount * fx.currentExchangeRate, 0);

  const totalAssets = carsVal + bankVal + propVal + businessesVal + fdVal + stockVal + cryptoVal + forexVal;
  const totalLiabilities = portfolio.emis.reduce((sum, e) => sum + e.remainingPrincipal, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Liquid assets = Bank + Liquid Stocks + Liquid Crypto + Forex
  const liquidAssets = bankVal + stockVal + cryptoVal + forexVal;
  const fixedAssets = carsVal + propVal + businessesVal + fdVal;

  // Monthly inflows: Salaries (from income sources + hourly/daily defined jobs) + Rental Incomes + Business Net Profit + Monthly stock dividend yield + monthly FD interest
  const monthlyJobSalaries = jobs.filter(j => j.isActive).reduce((sum, j) => sum + calculateJobMonthlySalary(j), 0);
  const monthlyFixedSalary = portfolio.incomeSources.reduce((sum, inc) => sum + inc.monthlyAmount, 0);
  const monthlySalary = monthlyFixedSalary + monthlyJobSalaries;
  const monthlyRent = portfolio.properties.filter(p => p.isRented).reduce((sum, p) => sum + p.monthlyRentalIncome, 0);
  const monthlyBusinessProfit = businesses
    .filter(b => !b.reinvestProfits)
    .reduce((sum, b) => sum + b.monthlyNetProfit * (b.ownershipPercentage / 100), 0);
  const monthlyStockDividends = portfolio.stocks.reduce((sum, s) => sum + (s.shares * s.currentPrice * (s.dividendYieldYearly / 100)) / 12, 0);
  const monthlyFdInterest = portfolio.fixedDeposits.reduce((sum, f) => sum + (f.principal * (f.interestRateYearly / 100)) / 12, 0);
  const totalMonthlyInflow = monthlySalary + monthlyRent + monthlyBusinessProfit + monthlyStockDividends + monthlyFdInterest;

  // Monthly outflows: Active EMIs + Recurring Expenses + Monthly property tax/maintenance
  const monthlyEmis = portfolio.emis.reduce((sum, e) => sum + (e.remainingPrincipal > 0 ? e.monthlyEmiAmount : 0), 0);
  const monthlyExpenses = portfolio.recurringExpenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);
  const monthlyCarInsurance = portfolio.cars.reduce((sum, c) => sum + c.monthlyInsuranceCost, 0);
  const monthlyPropMaintenance = portfolio.properties.reduce((sum, p) => sum + p.monthlyMaintenance + (p.annualPropertyTax / 12), 0);
  const totalMonthlyOutflow = monthlyEmis + monthlyExpenses + monthlyCarInsurance + monthlyPropMaintenance;

  const netMonthlyCashflow = totalMonthlyInflow - totalMonthlyOutflow;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const liquidityRunwayMonths = totalMonthlyOutflow > 0 ? liquidAssets / totalMonthlyOutflow : 999;

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    liquidAssets,
    fixedAssets,
    carsVal,
    bankVal,
    propVal,
    businessesVal,
    branchesCount,
    branchesVal,
    fdVal,
    stockVal,
    cryptoVal,
    forexVal,
    totalMonthlyInflow,
    totalMonthlyOutflow,
    netMonthlyCashflow,
    monthlySalary,
    monthlyFixedSalary,
    monthlyJobSalaries,
    jobsCount: jobs.length,
    activeJobsCount: jobs.filter(j => j.isActive).length,
    monthlyRent,
    monthlyBusinessProfit,
    monthlyEmis,
    monthlyExpenses,
    debtToAssetRatio,
    liquidityRunwayMonths,
  };
}

/**
 * Defensive numeric sanitizer to guarantee unbreakable arithmetic across the app.
 * Guards against NaN, +/-Infinity, null, and undefined values.
 */
export function safeNum(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return num;
}

export interface CreditScoreResult {
  score: number;
  tier: 'Exceptional (Super-Prime)' | 'Very Good (Prime)' | 'Good (Standard Prime)' | 'Fair (Sub-Prime)' | 'Poor (High Risk)';
  color: string;
  badgeBg: string;
  maxBorrowingPowerMultiplier: number;
  primeRateDiscountPercent: number;
  factors: {
    category: string;
    pointsEarned: number;
    maxPoints: number;
    status: string;
    description: string;
  }[];
}

/**
 * Real-Life FICO / Experian credit scoring engine (300 to 850 range).
 * Factors:
 * 1. Payment History (35% - max 192 pts)
 * 2. Debt-to-Asset / Credit Utilization (30% - max 165 pts)
 * 3. Credit Longevity / Account Age (15% - max 83 pts)
 * 4. Credit & Asset Mix (10% - max 55 pts)
 * 5. Liquid Reserve Runway (10% - max 55 pts)
 */
export function calculateCreditScore(portfolio: PortfolioData): CreditScoreResult {
  const metrics = calculateSummaryMetrics(portfolio);
  const baseScore = 300; // Baseline floor

  // 1. Payment History (35% = 192.5 pts)
  // Check logs for overdrafts or missed payments
  const overdraftLogs = portfolio.simulationLogs.filter(
    l => l.type === 'overdraft_alert' || l.details?.toLowerCase().includes('overdraft')
  ).length;
  const emiPaidLogs = portfolio.simulationLogs.filter(
    l => l.type === 'emi_deducted' || l.title?.toLowerCase().includes('emi')
  ).length;

  let paymentHistoryPts = 160; // good baseline
  if (overdraftLogs === 0) paymentHistoryPts += 32;
  else paymentHistoryPts = Math.max(40, paymentHistoryPts - overdraftLogs * 25);
  if (emiPaidLogs >= 3) paymentHistoryPts = Math.min(192, paymentHistoryPts + 10);

  // 2. Debt-to-Asset Ratio / Utilization (30% = 165 pts)
  const dta = metrics.debtToAssetRatio;
  let debtUtilizationPts = 165;
  if (dta === 0) {
    debtUtilizationPts = 165;
  } else if (dta < 15) {
    debtUtilizationPts = 155;
  } else if (dta < 30) {
    debtUtilizationPts = 140;
  } else if (dta < 50) {
    debtUtilizationPts = 110;
  } else if (dta < 70) {
    debtUtilizationPts = 70;
  } else {
    debtUtilizationPts = 30;
  }

  // 3. Account Age & Longevity (15% = 82.5 pts)
  const months = portfolio.simulatedMonth || 0;
  let longevityPts = 50;
  if (months >= 24) longevityPts = 82;
  else if (months >= 12) longevityPts = 75;
  else if (months >= 6) longevityPts = 65;
  else longevityPts = 50 + months * 2;

  // 4. Asset & Account Mix (10% = 55 pts)
  let mixCount = 0;
  if (portfolio.bankAccounts.length > 0) mixCount++;
  if (portfolio.properties.length > 0) mixCount++;
  if (portfolio.cars.length > 0) mixCount++;
  if ((portfolio.businesses || []).length > 0) mixCount++;
  if (portfolio.fixedDeposits.length > 0) mixCount++;
  if (portfolio.stocks.length > 0) mixCount++;
  const mixPts = Math.min(55, 20 + mixCount * 6);

  // 5. Liquid Reserve Runway (10% = 55 pts)
  const runway = metrics.liquidityRunwayMonths;
  let runwayPts = 30;
  if (runway >= 12) runwayPts = 55;
  else if (runway >= 6) runwayPts = 48;
  else if (runway >= 3) runwayPts = 38;
  else if (runway >= 1) runwayPts = 20;
  else runwayPts = 5;

  const totalPoints = paymentHistoryPts + debtUtilizationPts + longevityPts + mixPts + runwayPts;
  const finalScore = Math.min(850, Math.max(300, Math.round(baseScore + totalPoints * 0.647)));

  let tier: CreditScoreResult['tier'] = 'Good (Standard Prime)';
  let color = '#1ed760';
  let badgeBg = 'bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]';
  let maxBorrowingPowerMultiplier = 3.5;
  let primeRateDiscountPercent = 1.0;

  if (finalScore >= 800) {
    tier = 'Exceptional (Super-Prime)';
    color = '#1ed760';
    badgeBg = 'bg-[#1ed760]/15 border-[#1ed760]/40 text-[#1ed760]';
    maxBorrowingPowerMultiplier = 5.0;
    primeRateDiscountPercent = 2.5;
  } else if (finalScore >= 740) {
    tier = 'Very Good (Prime)';
    color = '#3be477';
    badgeBg = 'bg-[#3be477]/15 border-[#3be477]/40 text-[#3be477]';
    maxBorrowingPowerMultiplier = 4.2;
    primeRateDiscountPercent = 1.75;
  } else if (finalScore >= 670) {
    tier = 'Good (Standard Prime)';
    color = '#eab308';
    badgeBg = 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400';
    maxBorrowingPowerMultiplier = 3.2;
    primeRateDiscountPercent = 0.5;
  } else if (finalScore >= 580) {
    tier = 'Fair (Sub-Prime)';
    color = '#f97316';
    badgeBg = 'bg-orange-500/15 border-orange-500/40 text-orange-400';
    maxBorrowingPowerMultiplier = 2.0;
    primeRateDiscountPercent = 0;
  } else {
    tier = 'Poor (High Risk)';
    color = '#ef4444';
    badgeBg = 'bg-red-500/15 border-red-500/40 text-red-400';
    maxBorrowingPowerMultiplier = 1.0;
    primeRateDiscountPercent = -2.0;
  }

  return {
    score: finalScore,
    tier,
    color,
    badgeBg,
    maxBorrowingPowerMultiplier,
    primeRateDiscountPercent,
    factors: [
      {
        category: 'Payment History (35%)',
        pointsEarned: Math.round(paymentHistoryPts),
        maxPoints: 192,
        status: overdraftLogs === 0 ? 'Flawless' : `${overdraftLogs} Alert(s)`,
        description: 'Auto-debits, on-time loan installments, and clean overdraft record.',
      },
      {
        category: 'Debt-to-Asset Ratio (30%)',
        pointsEarned: Math.round(debtUtilizationPts),
        maxPoints: 165,
        status: `${dta.toFixed(1)}% Debt`,
        description: dta < 20 ? 'Optimal leverage (< 20%)' : 'Moderate debt obligations.',
      },
      {
        category: 'Credit Age & Stability (15%)',
        pointsEarned: Math.round(longevityPts),
        maxPoints: 83,
        status: `${months} Mos History`,
        description: 'Active compounding history duration in the banking ledger.',
      },
      {
        category: 'Financial Asset Mix (10%)',
        pointsEarned: Math.round(mixPts),
        maxPoints: 55,
        status: `${mixCount} Asset Types`,
        description: 'Diversification across savings, equities, properties, and fixed deposits.',
      },
      {
        category: 'Liquidity Reserve Buffer (10%)',
        pointsEarned: Math.round(runwayPts),
        maxPoints: 55,
        status: runway >= 999 ? 'No Outflows' : `${runway.toFixed(1)} Mos Runway`,
        description: 'Liquid cash reserves available to service unexpected disruptions.',
      },
    ],
  };
}

export interface EmergencyFundAnalysis {
  liquidCash: number;
  monthlyBurnRate: number;
  runwayMonths: number;
  targetFund6Months: number;
  surplusOrDeficit: number;
  statusTier: 'Fortress Reserve (12+ Mo)' | 'Fully Funded (6-12 Mo)' | 'Adequate (3-6 Mo)' | 'Vulnerable (1-3 Mo)' | 'Critical (< 1 Mo)';
  healthPercent: number;
  advice: string;
}

export function calculateEmergencyFundMetrics(portfolio: PortfolioData): EmergencyFundAnalysis {
  const metrics = calculateSummaryMetrics(portfolio);
  const liquidCash = portfolio.bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const monthlyBurnRate = metrics.totalMonthlyOutflow;
  const runwayMonths = monthlyBurnRate > 0 ? +(liquidCash / monthlyBurnRate).toFixed(1) : 999;
  const targetFund6Months = monthlyBurnRate * 6;
  const surplusOrDeficit = liquidCash - targetFund6Months;
  const healthPercent = Math.min(100, Math.round((liquidCash / Math.max(1, targetFund6Months)) * 100));

  let statusTier: EmergencyFundAnalysis['statusTier'] = 'Adequate (3-6 Mo)';
  let advice = 'Your liquid cushion is in healthy shape.';

  if (runwayMonths >= 12) {
    statusTier = 'Fortress Reserve (12+ Mo)';
    advice = 'Extraordinary liquidity! You can safely deploy surplus cash into higher-yielding growth assets.';
  } else if (runwayMonths >= 6) {
    statusTier = 'Fully Funded (6-12 Mo)';
    advice = 'Meets gold-standard financial planning guidelines. You are fully buffered against career or market shocks.';
  } else if (runwayMonths >= 3) {
    statusTier = 'Adequate (3-6 Mo)';
    advice = 'Solid baseline. Consider parking next month\'s net profits in High-Yield Savings to reach the 6-month tier.';
  } else if (runwayMonths >= 1) {
    statusTier = 'Vulnerable (1-3 Mo)';
    advice = 'Caution: Less than 3 months of runway. Prioritize liquid savings over discretionary purchases.';
  } else {
    statusTier = 'Critical (< 1 Mo)';
    advice = 'High Risk: Less than 1 month of living burn rate. Immediate cash conservation advised.';
  }

  return {
    liquidCash,
    monthlyBurnRate,
    runwayMonths,
    targetFund6Months,
    surplusOrDeficit,
    statusTier,
    healthPercent,
    advice,
  };
}
