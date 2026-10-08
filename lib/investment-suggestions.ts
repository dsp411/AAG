import { PortfolioData, BankAccount } from '@/types/finance';
import { calculateSummaryMetrics } from './initial-data';

export type OpportunityCategory = 'fd' | 'stock' | 'crypto' | 'property' | 'business' | 'forex';

export interface InvestmentOpportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  badge: string;
  badgeColor: string; // Tailwind class, e.g. 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  expectedAnnualReturn: number; // percentage, e.g. 14.5
  monthlyYieldPercent: number; // percentage paid out monthly (e.g. 0.35% for dividends/rents)
  riskLevel: 1 | 2 | 3 | 4 | 5; // 1 = minimal risk, 5 = highest risk
  riskLabel: 'Capital Guaranteed' | 'Low Risk' | 'Moderate' | 'Growth' | 'High Alpha';
  tagline: string;
  description: string;
  keyHighlights: string[];
  minimumInvestment: number;
  recommendedAmount: number;
  ticker?: string;
  institution?: string;
  defaultTenureMonths?: number;
  projectedAnnualReturn: (amount: number) => number;
  projectedMonthlyCashflow: (amount: number) => number;
  autoPayload: {
    type: 'fd' | 'stock' | 'crypto' | 'property' | 'business';
    data: any;
  };
}

export interface PortfolioYieldAnalysis {
  totalLiquidCash: number;
  recommendedEmergencyFund: number;
  deployableCash: number;
  currentCashWeightedApy: number;
  annualCashEarnings: number;
  opportunityCostAnnual: number; // Missed return per year vs 12.5% balanced allocation
  currentPortfolioYield: number; // weighted yield across all assets
  potentialPortfolioYield: number; // achievable with suggestions
  monthlyPassiveBoostPotential: number;
  allocationBreakdown: {
    cashPercent: number;
    fdPercent: number;
    equitiesPercent: number;
    cryptoPercent: number;
    realEstatePercent: number;
    businessPercent: number;
  };
  recommendations: InvestmentOpportunity[];
}

export function analyzePortfolioForInvestment(portfolio: PortfolioData): PortfolioYieldAnalysis {
  const metrics = calculateSummaryMetrics(portfolio);
  const totalAssets = Math.max(1, metrics.totalAssets);
  const totalLiquidCash = metrics.bankVal;

  // Calculate user's monthly commitments (EMIs + recurring expenses + lifestyle living expense)
  const monthlyEmis = metrics.monthlyEmis;
  const monthlyExpenses = portfolio.recurringExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
  const monthlyLifestyle = portfolio.user.monthlyLifestyleExpense || 2500;
  const totalMonthlyBurn = monthlyEmis + monthlyExpenses + monthlyLifestyle;

  // 6 months of buffer is standard golden-rule emergency fund
  const recommendedEmergencyFund = Math.max(5000, totalMonthlyBurn * 6);
  const deployableCash = Math.max(0, totalLiquidCash - recommendedEmergencyFund);

  // Compute current weighted bank cash APY
  let totalCashInterestYearly = 0;
  portfolio.bankAccounts.forEach(b => {
    totalCashInterestYearly += b.balance * ((b.interestRateApy || 1.5) / 100);
  });
  const currentCashWeightedApy = totalLiquidCash > 0
    ? (totalCashInterestYearly / totalLiquidCash) * 100
    : 1.5;

  // If deployable cash were invested in a balanced 12.5% return vehicle instead of sitting in cash at ~1.5%:
  const benchmarkRate = 12.5;
  const cashDragApyDiff = Math.max(0, benchmarkRate - currentCashWeightedApy);
  const opportunityCostAnnual = Math.round(deployableCash * (cashDragApyDiff / 100));

  // Current weighted yield across whole portfolio:
  // FDs (~7.5%), Stocks (~11% + 2% div), Crypto (~18%), Properties (~5.5% app + rental yield), Businesses (~15% + dividend)
  let totalAnnualYieldDollars = totalCashInterestYearly;
  portfolio.fixedDeposits.forEach(f => {
    totalAnnualYieldDollars += f.currentAccruedValue * (f.interestRateYearly / 100);
  });
  portfolio.stocks.forEach(s => {
    const val = s.shares * s.currentPrice;
    totalAnnualYieldDollars += val * ((s.expectedAnnualGrowth + s.dividendYieldYearly) / 100);
  });
  portfolio.crypto.forEach(c => {
    const val = c.quantity * c.currentPrice;
    totalAnnualYieldDollars += val * ((c.expectedAnnualGrowth + c.stakingYieldYearly) / 100);
  });
  portfolio.properties.forEach(p => {
    const capitalAppreciation = p.currentValue * (p.annualAppreciationRate / 100);
    const annualRent = p.isRented ? p.monthlyRentalIncome * 12 : 0;
    totalAnnualYieldDollars += (capitalAppreciation + annualRent);
  });
  (portfolio.businesses || []).forEach(b => {
    const myVal = b.valuation * (b.ownershipPercentage / 100);
    const growth = myVal * (b.annualGrowthRate / 100);
    const dividends = b.monthlyNetProfit * 12 * (b.ownershipPercentage / 100);
    totalAnnualYieldDollars += (growth + dividends);
  });

  const currentPortfolioYield = Number(((totalAnnualYieldDollars / totalAssets) * 100).toFixed(1));
  const potentialPortfolioYield = Number(Math.min(22, currentPortfolioYield + (deployableCash > 5000 ? 4.2 : 2.5)).toFixed(1));

  // Asset allocation percentages
  const allocationBreakdown = {
    cashPercent: Math.round((totalLiquidCash / totalAssets) * 100),
    fdPercent: Math.round((metrics.fdVal / totalAssets) * 100),
    equitiesPercent: Math.round((metrics.stockVal / totalAssets) * 100),
    cryptoPercent: Math.round((metrics.cryptoVal / totalAssets) * 100),
    realEstatePercent: Math.round((metrics.propVal / totalAssets) * 100),
    businessPercent: Math.round((metrics.businessesVal / totalAssets) * 100),
  };

  // Smart baseline suggestions scaled to deployable cash
  const baseInvestmentSize = Math.max(1000, Math.round(deployableCash > 0 ? deployableCash * 0.4 : 5000));

  const recommendations: InvestmentOpportunity[] = [
    {
      id: 'sug_fd_high_yield',
      title: 'High-Yield Compounding Vault FD',
      category: 'fd',
      badge: 'Guaranteed Return',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      expectedAnnualReturn: 8.5,
      monthlyYieldPercent: 0.708,
      riskLevel: 1,
      riskLabel: 'Capital Guaranteed',
      tagline: 'Lock in 8.5% guaranteed annual compounding with zero market volatility.',
      description:
        'Ideal safe haven for surplus cash. Earns 8.50% annual interest compounded monthly, backed by institutional banking reserve protection. Far outperforms basic 1.5% checking accounts.',
      keyHighlights: [
        '100% Capital Guaranteed principal protection',
        '8.50% APY compounded monthly',
        'Automatic reinvestment or monthly interest payout to checking',
        'Zero stock market exposure or downside risk',
      ],
      minimumInvestment: 1000,
      recommendedAmount: Math.min(50000, Math.max(2500, Math.round(baseInvestmentSize * 0.5))),
      institution: 'J.P. Morgan Institutional Vault',
      defaultTenureMonths: 12,
      projectedAnnualReturn: (amt: number) => Math.round(amt * 0.085),
      projectedMonthlyCashflow: (amt: number) => Math.round((amt * 0.085) / 12),
      autoPayload: {
        type: 'fd',
        data: {
          name: 'J.P. Morgan 8.5% High-Yield Vault',
          institution: 'J.P. Morgan Institutional Vault',
          interestRateYearly: 8.5,
          compoundingFrequency: 'Monthly',
          tenureMonths: 12,
        },
      },
    },
    {
      id: 'sug_stock_sp500',
      title: 'S&P 500 Core Index (VOO / SPY)',
      category: 'stock',
      badge: 'Core Wealth Compounder',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      expectedAnnualReturn: 12.8,
      monthlyYieldPercent: 0.17,
      riskLevel: 2,
      riskLabel: 'Moderate',
      tagline: 'Own the 500 most profitable companies globally with 12.8% historical return + dividends.',
      description:
        'The undisputed foundation of global billionaire portfolios. Automatically participates in the upside of Apple, Microsoft, Nvidia, Google, and Amazon with annual dividend distribution.',
      keyHighlights: [
        '12.8% projected annual compound rate',
        '+2.1% annual quarterly dividend payout to bank account',
        'Instant diversification across 500 global market leaders',
        'Ideal for compounding net worth over 3-10 years',
      ],
      minimumInvestment: 500,
      recommendedAmount: Math.min(100000, Math.max(3000, Math.round(baseInvestmentSize * 0.75))),
      ticker: 'VOO',
      projectedAnnualReturn: (amt: number) => Math.round(amt * 0.128),
      projectedMonthlyCashflow: (amt: number) => Math.round((amt * 0.021) / 12),
      autoPayload: {
        type: 'stock',
        data: {
          ticker: 'VOO',
          companyName: 'Vanguard S&P 500 Index ETF',
          buyPrice: 512,
          currentPrice: 512,
          expectedAnnualGrowth: 11.2,
          dividendYieldYearly: 2.1,
        },
      },
    },
    {
      id: 'sug_stock_tech_leaders',
      title: 'AI & Cloud Mega-Cap Leaders (MSFT / NVDA)',
      category: 'stock',
      badge: 'High-Growth Equities',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      expectedAnnualReturn: 16.5,
      monthlyYieldPercent: 0.12,
      riskLevel: 3,
      riskLabel: 'Growth',
      tagline: 'Ride the generational wave of enterprise AI computing and cloud software.',
      description:
        'Concentrated position in high-margin technology market makers. Generates strong double-digit capital appreciation supported by massive corporate free cash flows.',
      keyHighlights: [
        '16.5% expected annual growth rate',
        'Industry monopolistic pricing power and software gross margins',
        'Automated monthly simulation tracking in portfolio',
        'Accelerates long-term timeline to net worth targets',
      ],
      minimumInvestment: 1000,
      recommendedAmount: Math.min(75000, Math.max(2500, Math.round(baseInvestmentSize * 0.5))),
      ticker: 'NVDA',
      projectedAnnualReturn: (amt: number) => Math.round(amt * 0.165),
      projectedMonthlyCashflow: (amt: number) => Math.round((amt * 0.015) / 12),
      autoPayload: {
        type: 'stock',
        data: {
          ticker: 'NVDA',
          companyName: 'NVIDIA AI Sovereign Infrastructure',
          buyPrice: 135,
          currentPrice: 135,
          expectedAnnualGrowth: 16.5,
          dividendYieldYearly: 1.2,
        },
      },
    },
    {
      id: 'sug_property_rental',
      title: 'Turnkey Luxury Rental Property',
      category: 'property',
      badge: 'High Cashflow & Hard Asset',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      expectedAnnualReturn: 14.2,
      monthlyYieldPercent: 0.72,
      riskLevel: 2,
      riskLabel: 'Moderate',
      tagline: 'Dual return engine: +8.6% rental yield paid monthly + 5.6% property capital appreciation.',
      description:
        'Acquire high-demand residential or executive rental property. Deposits predictable monthly rent directly into your bank vault while the physical brick-and-mortar property appreciates over time.',
      keyHighlights: [
        'Immediate monthly rental income deposited directly into checking',
        '5.6% annual property value appreciation compounding year over year',
        'Inflation-hedged tangible physical asset with tenant contract',
        'Substantial boost to monthly passive cash flow',
      ],
      minimumInvestment: 50000,
      recommendedAmount: Math.max(120000, Math.round(deployableCash > 40000 ? deployableCash * 0.8 : 150000)),
      projectedAnnualReturn: (amt: number) => Math.round(amt * 0.142),
      projectedMonthlyCashflow: (amt: number) => Math.round((amt * 0.086) / 12),
      autoPayload: {
        type: 'property',
        data: {
          name: 'Executive Marina Water View Residence',
          propertyType: 'Rental Villa',
          address: '42 Oceanfront Promenade, Marina Bay',
          purchasePrice: 280000,
          currentValue: 280000,
          annualAppreciationRate: 5.6,
          isRented: true,
          tenantName: 'Dr. Alistair Vance',
          monthlyRentalIncome: 2450,
          annualPropertyTax: 3200,
          monthlyMaintenance: 350,
        },
      },
    },
    {
      id: 'sug_business_expansion',
      title: 'Commercial Enterprise & Branch Expansion',
      category: 'business',
      badge: 'Maximum Return (24% ROCE)',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      expectedAnnualReturn: 24.0,
      monthlyYieldPercent: 1.5,
      riskLevel: 4,
      riskLabel: 'High Alpha',
      tagline: 'Inject capital into high-margin logistics, specialty retail, or tech franchises.',
      description:
        'The highest return on invested capital in the economy. Generates aggressive commercial dividends deposited every single month while enterprise equity valuation grows rapidly.',
      keyHighlights: [
        '24.0% - 30.0% annualized return on invested capital',
        'Generates huge monthly owner dividend payouts directly to bank',
        'Fast-tracks multi-millionaire status in the simulation timeline',
        'Scalable branch network with dedicated operational managers',
      ],
      minimumInvestment: 15000,
      recommendedAmount: Math.max(25000, Math.round(deployableCash > 20000 ? deployableCash * 0.6 : 35000)),
      projectedAnnualReturn: (amt: number) => Math.round(amt * 0.24),
      projectedMonthlyCashflow: (amt: number) => Math.round((amt * 0.18) / 12),
      autoPayload: {
        type: 'business',
        data: {
          name: 'AAG Global Express Logistics & Freight',
          industry: 'Freight & Fleet Logistics',
          valuation: 220000,
          ownershipPercentage: 100,
          annualGrowthRate: 15.0,
          monthlyNetProfit: 4500,
          reinvestProfits: false,
          branches: [
            {
              name: 'Central Metro Hub',
              location: 'Downtown Metro Terminal',
              employeeCount: 8,
              capitalInvested: 65000,
              monthlyRevenue: 18500,
              monthlyExpenses: 14000,
              valuation: 120000,
              status: 'Active',
            },
          ],
        },
      },
    },
    {
      id: 'sug_crypto_staking',
      title: 'Staked Blue-Chip Layer-1 (Ethereum / Solana)',
      category: 'crypto',
      badge: 'Asymmetric Tech Upside',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      expectedAnnualReturn: 21.5,
      monthlyYieldPercent: 0.45,
      riskLevel: 4,
      riskLabel: 'High Alpha',
      tagline: '5.5% annual on-chain staking yield + 16.0% expected network capital appreciation.',
      description:
        'High-conviction digital commodity staking. Earn regular validation protocol rewards every month while holding decentralized compute layer assets for exponential upside.',
      keyHighlights: [
        '+5.5% programmatic staking rewards credited continuously',
        'High historical upside during liquidity cycles',
        'Liquid proof-of-stake verification',
        'Portfolio-diversifying uncorrelated alpha',
      ],
      minimumInvestment: 500,
      recommendedAmount: Math.min(40000, Math.max(1500, Math.round(baseInvestmentSize * 0.3))),
      ticker: 'ETH',
      projectedAnnualReturn: (amt: number) => Math.round(amt * 0.215),
      projectedMonthlyCashflow: (amt: number) => Math.round((amt * 0.055) / 12),
      autoPayload: {
        type: 'crypto',
        data: {
          symbol: 'ETH',
          name: 'Ethereum Staked Protocol (stETH)',
          buyPrice: 3200,
          currentPrice: 3200,
          expectedAnnualGrowth: 16.0,
          stakingYieldYearly: 5.5,
        },
      },
    },
  ];

  // Calculate monthly passive boost potential if deployable cash is allocated into the recommendations
  const averageMonthlyYieldRate = 0.007; // ~8.4% annual cashflow yield
  const monthlyPassiveBoostPotential = Math.round(deployableCash * averageMonthlyYieldRate);

  return {
    totalLiquidCash,
    recommendedEmergencyFund,
    deployableCash,
    currentCashWeightedApy,
    annualCashEarnings: Math.round(totalCashInterestYearly),
    opportunityCostAnnual,
    currentPortfolioYield,
    potentialPortfolioYield,
    monthlyPassiveBoostPotential,
    allocationBreakdown,
    recommendations,
  };
}

export interface CompoundProjectionPoint {
  year: number;
  month: number;
  cashInBankBalance: number;
  investedBalance: number;
  additionalGain: number;
}

export function simulateInvestmentGrowth(
  principal: number,
  annualReturnRate: number,
  tenureYears: number,
  monthlyAdditionalDeposit: number = 0,
  bankApyRate: number = 1.5
): CompoundProjectionPoint[] {
  const points: CompoundProjectionPoint[] = [];
  let investedBalance = principal;
  let bankBalance = principal;

  const monthlyInvestedRate = annualReturnRate / 100 / 12;
  const monthlyBankRate = bankApyRate / 100 / 12;

  const totalMonths = tenureYears * 12;

  // Record baseline at year 0
  points.push({
    year: 0,
    month: 0,
    cashInBankBalance: Math.round(bankBalance),
    investedBalance: Math.round(investedBalance),
    additionalGain: 0,
  });

  for (let m = 1; m <= totalMonths; m++) {
    // Add monthly contributions
    investedBalance += monthlyAdditionalDeposit;
    bankBalance += monthlyAdditionalDeposit;

    // Apply monthly compound growth
    investedBalance += investedBalance * monthlyInvestedRate;
    bankBalance += bankBalance * monthlyBankRate;

    // Save snapshot at each year mark
    if (m % 12 === 0) {
      const year = m / 12;
      points.push({
        year,
        month: m,
        cashInBankBalance: Math.round(bankBalance),
        investedBalance: Math.round(investedBalance),
        additionalGain: Math.max(0, Math.round(investedBalance - bankBalance)),
      });
    }
  }

  return points;
}
