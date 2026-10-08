import { PortfolioData, PayoutBreakdown } from '@/types/finance';
import { calculateJobMonthlySalary } from '@/lib/initial-data';

export interface CalculatedMonthlyFinances {
  totalRevenue: number;
  totalExpenses: number;
  grossNetProfit: number;
  carriedLossDeducted: number;
  netPayoutAmount: number;
  newLossCarryover: number;
  breakdown: PayoutBreakdown;
}

/**
 * Calculates itemized revenues, expenses, and net profit for a portfolio.
 * Formula: Net Profit = Total Monthly Revenue - Total Monthly Expenses
 * Handles previous loss carryover offset.
 */
export function calculateMonthlyFinances(
  portfolio: PortfolioData,
  currentLossCarryover = 0
): CalculatedMonthlyFinances {
  const user = portfolio.user;
  const currency = user.currency || 'USD';

  // --- 1. REVENUE STREAMS ---
  // A. Businesses & Branches
  let businessProfits = 0;
  for (const biz of portfolio.businesses || []) {
    if (biz.reinvestProfits) {
      // If profits are retained for growth, not counted as distributable revenue
      continue;
    }
    if (biz.branches && biz.branches.length > 0) {
      const branchNet = biz.branches.reduce((acc, br) => {
        return acc + (br.status === 'Active' ? br.monthlyRevenue - br.monthlyExpenses : 0);
      }, 0);
      businessProfits += Math.max(0, Math.round(branchNet * (biz.ownershipPercentage / 100)));
    } else {
      businessProfits += Math.max(0, biz.monthlyNetProfit || 0);
    }
  }

  // B. Real Estate Rental Incomes
  const rentalIncomes = (portfolio.properties || []).reduce((acc, p) => {
    return acc + (p.isRented ? p.monthlyRentalIncome || 0 : 0);
  }, 0);

  // C. Careers, Jobs & Base Salaries
  let salariesAndJobs = user.monthlySalary || 0;
  for (const job of portfolio.jobs || []) {
    if (job.isActive) {
      salariesAndJobs += calculateJobMonthlySalary(job);
    }
  }
  for (const inc of portfolio.incomeSources || []) {
    salariesAndJobs += inc.monthlyAmount || 0;
  }

  // D. Dividends & Fixed Deposit Accrued Interests
  const stockDividends = (portfolio.stocks || []).reduce((acc, s) => {
    const annualDiv = s.shares * s.currentPrice * ((s.dividendYieldYearly || 0) / 100);
    return acc + Math.round(annualDiv / 12);
  }, 0);

  const fdInterest = (portfolio.fixedDeposits || []).reduce((acc, f) => {
    if (f.isMatured) return acc;
    return acc + Math.round((f.principal * (f.interestRateYearly / 100)) / 12);
  }, 0);

  const dividendsAndInterests = stockDividends + fdInterest;

  const totalRevenue = Math.round(
    businessProfits + rentalIncomes + salariesAndJobs + dividendsAndInterests
  );

  // --- 2. EXPENSE STREAMS ---
  // A. Active EMI Loan Obligations
  const emiObligations = (portfolio.emis || []).reduce((acc, e) => {
    return acc + (e.remainingPrincipal > 0 ? e.monthlyEmiAmount || 0 : 0);
  }, 0);

  // B. Recurring Overheads (Insurance, Utilities, Lifestyle)
  const recurringExpenses = (portfolio.recurringExpenses || []).reduce((acc, r) => {
    return acc + (r.monthlyAmount || 0);
  }, 0);

  // C. Property Maintenance & Taxes
  const propertyTaxesAndMaint = (portfolio.properties || []).reduce((acc, p) => {
    const monthlyTax = Math.round((p.annualPropertyTax || 0) / 12);
    return acc + (p.monthlyMaintenance || 0) + monthlyTax;
  }, 0);

  // D. Vehicle Insurance Costs
  const carInsurance = (portfolio.cars || []).reduce((acc, c) => {
    return acc + (c.monthlyInsuranceCost || 0);
  }, 0);

  // E. Personal Lifestyle Expenses
  const personalLifestyle = user.monthlyLifestyleExpense || 0;

  const totalExpenses = Math.round(
    emiObligations + recurringExpenses + propertyTaxesAndMaint + carInsurance + personalLifestyle
  );

  // --- 3. NET PROFIT CALCULATION ---
  const grossNetProfit = totalRevenue - totalExpenses;

  // --- 4. LOSS CARRYOVER & EDGE CASE HANDLING ---
  let carriedLossDeducted = 0;
  let netPayoutAmount = 0;
  let newLossCarryover = 0;

  if (grossNetProfit > 0) {
    if (currentLossCarryover > 0) {
      if (grossNetProfit >= currentLossCarryover) {
        carriedLossDeducted = currentLossCarryover;
        netPayoutAmount = grossNetProfit - currentLossCarryover;
        newLossCarryover = 0;
      } else {
        carriedLossDeducted = grossNetProfit;
        netPayoutAmount = 0; // Entire profit used to offset previous loss
        newLossCarryover = currentLossCarryover - grossNetProfit;
      }
    } else {
      netPayoutAmount = grossNetProfit;
      newLossCarryover = 0;
    }
  } else if (grossNetProfit < 0) {
    // Loss month: No payout generated, negative amount accumulated into loss carryover
    netPayoutAmount = 0;
    carriedLossDeducted = 0;
    newLossCarryover = currentLossCarryover + Math.abs(grossNetProfit);
  } else {
    // Exact zero break-even
    netPayoutAmount = 0;
    carriedLossDeducted = 0;
    newLossCarryover = currentLossCarryover;
  }

  return {
    totalRevenue,
    totalExpenses,
    grossNetProfit,
    carriedLossDeducted,
    netPayoutAmount,
    newLossCarryover,
    breakdown: {
      revenues: {
        businessProfits,
        rentalIncomes,
        salariesAndJobs,
        dividendsAndInterests,
        totalRevenue,
      },
      expenses: {
        businessOverheads: carInsurance + personalLifestyle,
        emiObligations,
        recurringExpenses,
        propertyTaxesAndMaint,
        totalExpenses,
      },
    },
  };
}
