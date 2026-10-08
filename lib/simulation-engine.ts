import {
  PortfolioData,
  UserAccount,
  SimulationLogEntry,
  NetWorthHistoryPoint,
  BankAccount,
  FixedDepositAsset,
  StockAsset,
  CryptoAsset,
  CarAsset,
  PropertyAsset,
  BusinessAsset,
  EmiLiability,
  IncomeSource,
  JobPosition,
  RecurringExpense,
} from '@/types/finance';
import { calculateSummaryMetrics, calculateJobMonthlySalary, calculateCreditScore, safeNum } from './initial-data';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function getSimulatedDateString(startDateIso: string, monthsElapsed: number): string {
  const start = new Date(startDateIso || '2026-10-01');
  const d = new Date(start.getFullYear(), start.getMonth() + monthsElapsed, 1);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function advancePortfolioOneMonth(portfolio: PortfolioData): PortfolioData {
  const newMonthIndex = portfolio.simulatedMonth + 1;
  const newDateLabel = getSimulatedDateString(portfolio.simulationStartDate, newMonthIndex);
  const nowTimestamp = new Date().toISOString();
  const newLogs: SimulationLogEntry[] = [];

  // Deep clone collections and user profile
  const user: UserAccount = {
    ...portfolio.user,
    lifeGoals: (portfolio.user?.lifeGoals || []).map(g => ({ ...g })),
  };
  const bankAccounts: BankAccount[] = portfolio.bankAccounts.map(b => ({ ...b }));
  const properties: PropertyAsset[] = portfolio.properties.map(p => ({ ...p }));
  const businesses: BusinessAsset[] = (portfolio.businesses || []).map(b => ({
    ...b,
    branches: (b.branches || []).map(br => ({ ...br })),
  }));
  const cars: CarAsset[] = portfolio.cars.map(c => ({ ...c }));
  const fixedDeposits: FixedDepositAsset[] = portfolio.fixedDeposits.map(f => ({ ...f }));
  const stocks: StockAsset[] = portfolio.stocks.map(s => ({ ...s }));
  const crypto: CryptoAsset[] = portfolio.crypto.map(cr => ({ ...cr }));
  const forex = portfolio.forex.map(fx => ({ ...fx }));
  const jobs: JobPosition[] = (portfolio.jobs || []).map(j => ({ ...j }));
  const emis: EmiLiability[] = portfolio.emis.map(e => ({ ...e }));
  const recurringExpenses: RecurringExpense[] = portfolio.recurringExpenses.map(r => ({ ...r }));
  const incomeSources: IncomeSource[] = portfolio.incomeSources.map(i => ({ ...i }));

  const findBank = (id?: string): BankAccount | undefined => {
    if (!id) return bankAccounts.find(b => b.isPrimaryForAutoDebit) || bankAccounts[0];
    return bankAccounts.find(b => b.id === id) || bankAccounts[0];
  };

  // 0. User Age Progression & Lifespan Tracker
  const startingAge = user.startingAge || 28;
  const priorAgeYears = startingAge + Math.floor(portfolio.simulatedMonth / 12);
  const newAgeYears = startingAge + Math.floor(newMonthIndex / 12);
  const newAgeMonths = newMonthIndex % 12;

  // Birthday / Annual Life Milestone
  if (newAgeYears > priorAgeYears) {
    newLogs.push({
      id: `birthday_${user.username}_${newAgeYears}_${newMonthIndex}`,
      timestamp: nowTimestamp,
      simulatedMonth: newMonthIndex,
      simulatedDateString: newDateLabel,
      type: 'market_revaluation',
      title: `🎂 Happy ${newAgeYears}th Birthday, ${user.fullName}!`,
      amount: 0,
      direction: 'inflow',
      details: `Turned ${newAgeYears} years old. One full compounding year elapsed. Life experience, expertise, and assets continue to grow with time.`,
    });

    // Target Retirement Milestone Check
    if (user.targetRetirementAge && newAgeYears >= user.targetRetirementAge && priorAgeYears < user.targetRetirementAge) {
      newLogs.push({
        id: `fire_milestone_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'market_revaluation',
        title: `🏆 Reached Target Retirement Age (${user.targetRetirementAge})!`,
        amount: 0,
        direction: 'inflow',
        details: `Milestone Unlocked: You have reached your life retirement target age. Passive wealth cashflow now provides complete freedom.`,
      });
    }

    // Annual Occupation Merit Appraisal / Promotion Raise
    if (user.monthlySalary && user.monthlySalary > 0 && user.annualCareerRaiseRate && user.annualCareerRaiseRate > 0) {
      const raise = Math.round(user.monthlySalary * (user.annualCareerRaiseRate / 100));
      user.monthlySalary += raise;
      newLogs.push({
        id: `occ_raise_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'salary_deposit',
        title: `Career Promotion & Merit Raise (+${user.annualCareerRaiseRate}%)`,
        amount: raise,
        direction: 'inflow',
        details: `${user.occupationTitle || 'Executive'} monthly compensation elevated to $${user.monthlySalary.toLocaleString()}/mo.`,
      });
    }
  }

  // 0.2. Monthly Occupation Salary Inflow
  if (user.monthlySalary && user.monthlySalary > 0) {
    const primaryBank = findBank();
    if (primaryBank) {
      primaryBank.balance += user.monthlySalary;
      newLogs.push({
        id: `occ_salary_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'salary_deposit',
        title: `Career Salary: ${user.occupationTitle || 'Executive Compensation'}`,
        amount: user.monthlySalary,
        direction: 'inflow',
        bankAccountAffected: primaryBank.bankName,
        details: `${user.companyName ? user.companyName + ' · ' : ''}Credited to ${primaryBank.bankName}.`,
      });
    }
  }

  // 0.3. Monthly Lifestyle & Living Expenses Outflow
  if (user.monthlyLifestyleExpense && user.monthlyLifestyleExpense > 0) {
    const primaryBank = findBank();
    if (primaryBank) {
      primaryBank.balance -= user.monthlyLifestyleExpense;
      newLogs.push({
        id: `lifestyle_exp_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'expense_deducted',
        title: `Lifestyle Living: ${user.lifestyleTier || 'Living Expenses'}`,
        amount: user.monthlyLifestyleExpense,
        direction: 'outflow',
        bankAccountAffected: primaryBank.bankName,
        details: `Funded personal residence (${user.residenceType || 'residence'}), fine dining, wellness, and lifestyle upkeep.`,
      });
    }
  }

  // 0.5. Process Jobs & Defined Salaries (Hourly, Daily, or Monthly Fixed Basis)
  jobs.forEach(job => {
    if (!job.isActive) return;

    // Annual appraisal increase on salary rate
    if (newMonthIndex % 12 === 0 && job.annualAppraisalRate > 0) {
      const raiseAmount = job.rateAmount * (job.annualAppraisalRate / 100);
      job.rateAmount += raiseAmount;
      newLogs.push({
        id: `job_raise_${job.id}_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'salary_deposit',
        title: `${job.title} Merit Appraisal (+${job.annualAppraisalRate}%)`,
        amount: raiseAmount,
        direction: 'inflow',
        details: `Hourly/daily compensation increased following annual merit evaluation (${job.company}).`,
      });
    }

    const monthlyEarned = calculateJobMonthlySalary(job);
    const targetBank = findBank(job.destinationBankId);
    if (targetBank && monthlyEarned > 0) {
      targetBank.balance += monthlyEarned;
      job.totalEarningsToDate = (job.totalEarningsToDate || 0) + monthlyEarned;
      const shiftsInMonth = Math.round((job.daysPerWeek || 5) * 4.333);
      job.shiftsCompleted = (job.shiftsCompleted || 0) + shiftsInMonth;

      const rateDetails =
        job.rateBasis === 'per_hour'
          ? `$${job.rateAmount.toFixed(0)}/hr × ${job.hoursPerDay || 8} hrs/day × ${job.daysPerWeek || 5} days/wk`
          : job.rateBasis === 'per_day'
          ? `$${job.rateAmount.toFixed(0)}/day × ${job.daysPerWeek || 5} days/wk`
          : `$${job.rateAmount.toLocaleString()}/mo fixed`;

      newLogs.push({
        id: `job_pay_${job.id}_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'salary_deposit',
        title: `Salary Credited: ${job.title}`,
        amount: monthlyEarned,
        direction: 'inflow',
        bankAccountAffected: targetBank.bankName,
        details: `${job.company} · Rate: ${rateDetails}. Credited to ${targetBank.bankName}.`,
      });
    }
  });

  // 1. Process Income Sources (Salary, Business, Consulting)
  incomeSources.forEach(inc => {
    // If 12 months passed, apply appraisal
    if (newMonthIndex % 12 === 0 && inc.annualAppraisalRate > 0) {
      const raise = inc.monthlyAmount * (inc.annualAppraisalRate / 100);
      inc.monthlyAmount += raise;
      newLogs.push({
        id: `appraisal_${inc.id}_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'salary_deposit',
        title: `${inc.name} Annual Appraisal (+${inc.annualAppraisalRate}%)`,
        amount: raise,
        direction: 'inflow',
        details: `Monthly compensation elevated to $${Math.round(inc.monthlyAmount).toLocaleString()} following annual appraisal.`,
      });
    }

    const targetBank = findBank(inc.destinationBankId);
    if (targetBank) {
      targetBank.balance += inc.monthlyAmount;
      newLogs.push({
        id: `inc_${inc.id}_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'salary_deposit',
        title: `${inc.name} Deposited`,
        amount: inc.monthlyAmount,
        direction: 'inflow',
        bankAccountAffected: targetBank.bankName,
        details: `Credited to ${targetBank.bankName} (${targetBank.accountNumberMasked}).`,
      });
    }
  });

  // 2. Real Estate Properties: Monthly Appreciation & Rental Income
  properties.forEach(prop => {
    // Monthly capital appreciation
    const monthlyRate = prop.annualAppreciationRate / 100 / 12;
    const appreciationAmount = prop.currentValue * monthlyRate;
    prop.currentValue += appreciationAmount;

    // Rental yield collection
    if (prop.isRented && prop.monthlyRentalIncome > 0) {
      const primaryBank = findBank();
      if (primaryBank) {
        primaryBank.balance += prop.monthlyRentalIncome;
        newLogs.push({
          id: `rent_${prop.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'rental_income',
          title: `Rental Income: ${prop.name}`,
          amount: prop.monthlyRentalIncome,
          direction: 'inflow',
          bankAccountAffected: primaryBank.bankName,
          details: `Tenant ${prop.tenantName || 'Occupant'} transferred monthly rent.`,
        });
      }
    }
  });

  // 2.5. Business Enterprises & Branch Networks: Valuation Growth & Dividend Payout
  businesses.forEach(biz => {
    // Capital appreciation of enterprise
    if (biz.annualGrowthRate !== 0) {
      const monthlyRate = biz.annualGrowthRate / 100 / 12;
      const growthAmount = biz.valuation * monthlyRate;
      biz.valuation += growthAmount;
    }

    // Owner dividend distribution
    if (!biz.reinvestProfits && biz.monthlyNetProfit > 0) {
      const ownerDividend = biz.monthlyNetProfit * (biz.ownershipPercentage / 100);
      const targetBank = findBank(biz.destinationBankId);
      if (targetBank) {
        targetBank.balance += ownerDividend;
        newLogs.push({
          id: `biz_${biz.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'business_dividend',
          title: `${biz.name} Commercial Dividend (+${biz.ownershipPercentage}%)`,
          amount: ownerDividend,
          direction: 'inflow',
          bankAccountAffected: targetBank.bankName,
          details: `Deposited into ${targetBank.bankName}. Generated across ${biz.branches?.length || 0} active operating branches.`,
        });
      }
    }
  });

  // 3. Fixed Deposits (FDs): Compounding Interest & Maturity Transfer
  fixedDeposits.forEach(fd => {
    if (fd.isMatured) return;

    fd.monthsElapsed += 1;
    // Compounded interest for the month
    const monthlyInterestRate = fd.interestRateYearly / 100 / 12;
    const earnedThisMonth = fd.currentAccruedValue * monthlyInterestRate;
    fd.currentAccruedValue += earnedThisMonth;

    // Check for maturity
    if (fd.monthsElapsed >= fd.tenureMonths) {
      fd.isMatured = true;
      const targetBank = findBank(fd.autoCreditBankId);
      if (targetBank) {
        targetBank.balance += fd.currentAccruedValue;
        newLogs.push({
          id: `fd_mat_${fd.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'fd_matured',
          title: `FD Matured: ${fd.name}`,
          amount: fd.currentAccruedValue,
          direction: 'inflow',
          bankAccountAffected: targetBank.bankName,
          details: `Full principal ($${fd.principal.toLocaleString()}) and accrued compound interest ($${Math.round(fd.currentAccruedValue - fd.principal).toLocaleString()}) credited to ${targetBank.bankName}.`,
        });
      }
    } else {
      newLogs.push({
        id: `fd_int_${fd.id}_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'fd_interest',
        title: `FD Compounding: ${fd.institution}`,
        amount: earnedThisMonth,
        direction: 'valuation_up',
        details: `Earned $${Math.round(earnedThisMonth).toLocaleString()} at ${fd.interestRateYearly}% p.a. Total accrued: $${Math.round(fd.currentAccruedValue).toLocaleString()}.`,
      });
    }
  });

  // 4. Stocks / Equities: Price Growth & Dividend Payout
  stocks.forEach(stk => {
    // Expected annual growth converted to monthly with mild realistic jitter (±1.0%)
    const pseudoRandom = Math.sin(newMonthIndex * 13 + stk.ticker.charCodeAt(0)) * 0.015;
    const monthlyGrowthRate = stk.expectedAnnualGrowth / 100 / 12 + pseudoRandom;
    const previousVal = stk.currentPrice;
    stk.currentPrice = Math.max(1, stk.currentPrice * (1 + monthlyGrowthRate));

    // Dividend payout
    if (stk.dividendYieldYearly > 0) {
      const monthlyDividend = (stk.shares * stk.currentPrice * (stk.dividendYieldYearly / 100)) / 12;
      const targetBank = findBank(stk.autoCreditDividendsToBankId);
      if (targetBank && monthlyDividend > 5) {
        targetBank.balance += monthlyDividend;
        newLogs.push({
          id: `div_${stk.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'stock_dividend',
          title: `${stk.ticker} Dividend Cash Received`,
          amount: monthlyDividend,
          direction: 'inflow',
          bankAccountAffected: targetBank.bankName,
          details: `Dividend yield of ${stk.dividendYieldYearly}% paid on ${stk.shares} shares into ${targetBank.bankName}.`,
        });
      }
    }
  });

  // 5. Crypto: Market Price & Staking
  crypto.forEach(cr => {
    const pseudoRandom = Math.cos(newMonthIndex * 19 + cr.symbol.charCodeAt(0)) * 0.035;
    const monthlyGrowth = cr.expectedAnnualGrowth / 100 / 12 + pseudoRandom;
    cr.currentPrice = Math.max(0.1, cr.currentPrice * (1 + monthlyGrowth));

    if (cr.stakingYieldYearly > 0) {
      const stakingRewardCoins = cr.quantity * (cr.stakingYieldYearly / 100 / 12);
      cr.quantity += stakingRewardCoins;
      newLogs.push({
        id: `stake_${cr.id}_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'crypto_growth',
        title: `${cr.symbol} Staking Yield Accrued`,
        amount: stakingRewardCoins * cr.currentPrice,
        direction: 'valuation_up',
        details: `Compounded +${stakingRewardCoins.toFixed(4)} ${cr.symbol} from active node validation.`,
      });
    }
  });

  // 6. Foreign Currency: Mild exchange rate drift
  forex.forEach(fx => {
    const drift = Math.sin(newMonthIndex * 7 + fx.currencyCode.charCodeAt(0)) * 0.008;
    fx.currentExchangeRate = Number((fx.currentExchangeRate * (1 + drift)).toFixed(4));
  });

  // 7. Cars: Depreciation / Collector Valuation
  cars.forEach(car => {
    const monthlyDepRate = car.annualDepreciationRate / 100 / 12;
    const valChange = car.currentValue * monthlyDepRate;
    car.currentValue = Math.max(500, car.currentValue - valChange);
  });

  // 8. Bank Account Interest Credited (10% Annual APY Realistic Banking Accrual)
  bankAccounts.forEach(bank => {
    if (bank.balance > 0 && bank.interestRateApy > 0) {
      const interestEarned = Math.round((bank.balance * (bank.interestRateApy / 100)) / 12);
      if (interestEarned > 0) {
        bank.balance += interestEarned;
        newLogs.push({
          id: `bank_int_${bank.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'fd_interest',
          title: `Monthly Bank Interest (+${bank.interestRateApy}% APY)`,
          amount: interestEarned,
          direction: 'inflow',
          bankAccountAffected: bank.bankName,
          details: `Credited $${interestEarned.toLocaleString()} monthly interest into ${bank.bankName} (${bank.interestRateApy}% annual rate).`,
        });
      }
    }
  });

  // 9. EMIs / Loan Deductions (CRUCIAL USER REQUIREMENT)
  emis.forEach(emi => {
    if (emi.remainingPrincipal <= 0 || !emi.autoDebitEnabled) return;

    const targetBank = findBank(emi.linkedBankAccountId);
    const monthlyInterestRate = emi.interestRateYearly / 100 / 12;
    const interestPortion = emi.remainingPrincipal * monthlyInterestRate;

    let emiPayment = emi.monthlyEmiAmount;
    if (emi.remainingPrincipal + interestPortion < emiPayment) {
      // Payoff final remainder
      emiPayment = emi.remainingPrincipal + interestPortion;
    }

    const principalPortion = Math.max(0, emiPayment - interestPortion);

    if (targetBank) {
      if (targetBank.balance < emiPayment) {
        // Real Bank Overdraft & Sweep Protection Mechanism
        const shortfall = emiPayment - targetBank.balance;
        const sweepBank = targetBank.backupSweepBankId
          ? bankAccounts.find(b => b.id === targetBank.backupSweepBankId)
          : bankAccounts.find(b => b.id !== targetBank.id && b.balance >= shortfall);

        if (targetBank.overdraftProtectionEnabled && sweepBank && sweepBank.balance >= shortfall) {
          sweepBank.balance -= shortfall;
          targetBank.balance += shortfall;
          newLogs.push({
            id: `sweep_emi_${emi.id}_${newMonthIndex}`,
            timestamp: nowTimestamp,
            simulatedMonth: newMonthIndex,
            simulatedDateString: newDateLabel,
            type: 'salary_deposit',
            title: `🔄 Overdraft Sweep: Covered $${Math.round(shortfall).toLocaleString()}`,
            amount: shortfall,
            direction: 'inflow',
            bankAccountAffected: targetBank.bankName,
            details: `Overdraft Protection Active: Swept $${Math.round(shortfall).toLocaleString()} from ${sweepBank.bankName} into ${targetBank.bankName} to execute "${emi.name}" on-schedule and preserve credit score.`,
          });
        } else {
          // Low balance / Overdraft warning
          newLogs.push({
            id: `emi_od_${emi.id}_${newMonthIndex}`,
            timestamp: nowTimestamp,
            simulatedMonth: newMonthIndex,
            simulatedDateString: newDateLabel,
            type: 'overdraft_alert',
            title: `EMI Payment Alert: ${emi.name}`,
            amount: emiPayment,
            direction: 'alert',
            bankAccountAffected: targetBank.bankName,
            details: `Warning: ${targetBank.bankName} balance was low ($${Math.round(targetBank.balance).toLocaleString()}). Debit applied, account entered overdraft!`,
          });
        }
      }

      targetBank.balance = safeNum(targetBank.balance - emiPayment);
      emi.remainingPrincipal = Math.max(0, safeNum(emi.remainingPrincipal - principalPortion));
      emi.tenureMonthsRemaining = Math.max(0, emi.tenureMonthsRemaining - 1);

      if (emi.remainingPrincipal <= 0) {
        newLogs.push({
          id: `emi_done_${emi.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'emi_deducted',
          title: `LOAN FULLY CLEARED: ${emi.name}`,
          amount: emiPayment,
          direction: 'outflow',
          bankAccountAffected: targetBank.bankName,
          details: `Congratulations! Final installment cleared. Debt obligation erased from your liabilities.`,
        });
      } else {
        newLogs.push({
          id: `emi_paid_${emi.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'emi_deducted',
          title: `EMI Auto-Deducted: ${emi.name}`,
          amount: emiPayment,
          direction: 'outflow',
          bankAccountAffected: targetBank.bankName,
          details: `Debited from ${targetBank.bankName}. Principal paid: $${Math.round(principalPortion).toLocaleString()} | Interest: $${Math.round(interestPortion).toLocaleString()} | Balance remaining: $${Math.round(emi.remainingPrincipal).toLocaleString()} (${emi.tenureMonthsRemaining} mos left).`,
        });
      }
    }
  });

  // 10. Recurring Expenses Deductions
  recurringExpenses.forEach(exp => {
    if (!exp.autoDebitEnabled) return;
    const targetBank = findBank(exp.linkedBankAccountId);
    if (targetBank) {
      if (targetBank.balance < exp.monthlyAmount) {
        const shortfall = exp.monthlyAmount - targetBank.balance;
        const sweepBank = targetBank.backupSweepBankId
          ? bankAccounts.find(b => b.id === targetBank.backupSweepBankId)
          : bankAccounts.find(b => b.id !== targetBank.id && b.balance >= shortfall);

        if (targetBank.overdraftProtectionEnabled && sweepBank && sweepBank.balance >= shortfall) {
          sweepBank.balance -= shortfall;
          targetBank.balance += shortfall;
          newLogs.push({
            id: `sweep_exp_${exp.id}_${newMonthIndex}`,
            timestamp: nowTimestamp,
            simulatedMonth: newMonthIndex,
            simulatedDateString: newDateLabel,
            type: 'salary_deposit',
            title: `🔄 Overdraft Sweep for Bill: ${exp.name}`,
            amount: shortfall,
            direction: 'inflow',
            bankAccountAffected: targetBank.bankName,
            details: `Automated Sweep: Transferred $${Math.round(shortfall).toLocaleString()} from ${sweepBank.bankName} to ${targetBank.bankName} to pay monthly bill "${exp.name}".`,
          });
        }
      }
      targetBank.balance = safeNum(targetBank.balance - exp.monthlyAmount);
      newLogs.push({
        id: `exp_paid_${exp.id}_${newMonthIndex}`,
        timestamp: nowTimestamp,
        simulatedMonth: newMonthIndex,
        simulatedDateString: newDateLabel,
        type: 'expense_deducted',
        title: `Auto-Billed: ${exp.name}`,
        amount: exp.monthlyAmount,
        direction: 'outflow',
        bankAccountAffected: targetBank.bankName,
        details: `Monthly ${exp.category.toLowerCase()} deduction from ${targetBank.bankName}.`,
      });
    }
  });

  const updatedPortfolio: PortfolioData = {
    ...portfolio,
    user,
    simulatedMonth: newMonthIndex,
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
    simulationLogs: [...newLogs, ...portfolio.simulationLogs].slice(0, 150), // keep latest 150 logs
    historyPoints: [], // computed below
  };

  const metrics = calculateSummaryMetrics(updatedPortfolio);
  const creditAnalysis = calculateCreditScore(updatedPortfolio);
  user.creditScore = creditAnalysis.score;

  // Check Life Goals completion
  if (user.lifeGoals && user.lifeGoals.length > 0) {
    user.lifeGoals.forEach(goal => {
      if (goal.completed) return;
      if (goal.targetNetWorth && metrics.netWorth >= goal.targetNetWorth) {
        goal.completed = true;
        updatedPortfolio.simulationLogs.unshift({
          id: `goal_nw_${goal.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'market_revaluation',
          title: `🎯 Life Goal Achieved: ${goal.title}`,
          amount: goal.targetNetWorth,
          direction: 'valuation_up',
          details: `Net worth reached $${Math.round(metrics.netWorth).toLocaleString()}. Milestone achieved at age ${newAgeYears}!`,
        });
      } else if (goal.targetAge && newAgeYears >= goal.targetAge) {
        goal.completed = true;
        updatedPortfolio.simulationLogs.unshift({
          id: `goal_age_${goal.id}_${newMonthIndex}`,
          timestamp: nowTimestamp,
          simulatedMonth: newMonthIndex,
          simulatedDateString: newDateLabel,
          type: 'market_revaluation',
          title: `🎯 Life Milestone Reached: ${goal.title}`,
          amount: 0,
          direction: 'inflow',
          details: `Achieved milestone target at age ${newAgeYears}!`,
        });
      }
    });
  }

  const newHistoryPoint: NetWorthHistoryPoint = {
    monthIndex: newMonthIndex,
    dateLabel: newDateLabel,
    totalAssets: Math.round(metrics.totalAssets),
    totalLiabilities: Math.round(metrics.totalLiabilities),
    netWorth: Math.round(metrics.netWorth),
    liquidCash: Math.round(metrics.bankVal),
  };

  updatedPortfolio.historyPoints = [...portfolio.historyPoints, newHistoryPoint];

  return updatedPortfolio;
}

export function advancePortfolioNMonths(portfolio: PortfolioData, count: number): PortfolioData {
  let current = portfolio;
  for (let i = 0; i < count; i++) {
    current = advancePortfolioOneMonth(current);
  }
  return current;
}

export const REAL_HOURS_PER_SIMULATED_MONTH = 72;
export const MS_PER_SIMULATED_MONTH = REAL_HOURS_PER_SIMULATED_MONTH * 60 * 60 * 1000; // Exactly 72 hours (259,200,000 ms)

export interface MonthPacingProgress {
  progressPercent: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  hoursElapsedInCurrentMonth: number;
  realHoursPerMonth: number;
  formattedCountdown: string;
}

/**
 * Calculates current real-time progress towards the next in-app simulated month.
 * Rule: 1 in-app month completes every 72 hours of real-world time.
 */
export function getMonthProgressTowardsNextMonth(
  lastSettledIso?: string,
  now: Date = new Date()
): MonthPacingProgress {
  const lastTime = lastSettledIso ? new Date(lastSettledIso).getTime() : now.getTime();
  const validLastTime = isNaN(lastTime) ? now.getTime() : lastTime;
  const elapsedMs = Math.max(0, now.getTime() - validLastTime);
  const currentMonthCycleElapsedMs = elapsedMs % MS_PER_SIMULATED_MONTH;
  const progressPercent = Math.min(100, (currentMonthCycleElapsedMs / MS_PER_SIMULATED_MONTH) * 100);
  const msRemaining = Math.max(0, MS_PER_SIMULATED_MONTH - currentMonthCycleElapsedMs);

  const totalSeconds = Math.floor(msRemaining / 1000);
  const hoursRemaining = Math.floor(totalSeconds / 3600);
  const minutesRemaining = Math.floor((totalSeconds % 3600) / 60);
  const secondsRemaining = totalSeconds % 60;
  const hoursElapsedInCurrentMonth = +(currentMonthCycleElapsedMs / (60 * 60 * 1000)).toFixed(1);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedCountdown = `${hoursRemaining}h ${pad(minutesRemaining)}m`;

  return {
    progressPercent: +progressPercent.toFixed(1),
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
    hoursElapsedInCurrentMonth,
    realHoursPerMonth: REAL_HOURS_PER_SIMULATED_MONTH,
    formattedCountdown,
  };
}

/**
 * Synchronizes background profits and in-app timeline based on real-world elapsed time.
 * Standard: Exactly 1 in-app month is completed after 72 continuous hours of real-world time.
 */
export function syncOfflineElapsedProfitAndBanking(
  portfolio: PortfolioData,
  now: Date = new Date()
): {
  portfolio: PortfolioData;
  monthsElapsed: number;
  totalProfitCredited: number;
  wasOffline: boolean;
} {
  if (!portfolio) {
    return { portfolio, monthsElapsed: 0, totalProfitCredited: 0, wasOffline: false };
  }

  const nowTime = now.getTime();

  // If lastSettledTimestamp is missing or invalid, anchor it to right now to prevent abrupt jumping
  if (!portfolio.lastSettledTimestamp) {
    portfolio.lastSettledTimestamp = now.toISOString();
    return { portfolio, monthsElapsed: 0, totalProfitCredited: 0, wasOffline: false };
  }

  const lastSettledDate = new Date(portfolio.lastSettledTimestamp);
  let lastTime = lastSettledDate.getTime();
  if (isNaN(lastTime)) {
    portfolio.lastSettledTimestamp = now.toISOString();
    return { portfolio, monthsElapsed: 0, totalProfitCredited: 0, wasOffline: false };
  }

  // If last settlement is in the future or unreasonably far in the past (> 30 real-world days),
  // re-anchor to current time to avoid jumping months in seconds
  const maxReasonablePastMs = 30 * 24 * 60 * 60 * 1000;
  if (lastTime > nowTime || (nowTime - lastTime) > maxReasonablePastMs) {
    portfolio.lastSettledTimestamp = now.toISOString();
    return { portfolio, monthsElapsed: 0, totalProfitCredited: 0, wasOffline: false };
  }

  const diffMs = Math.max(0, nowTime - lastTime);
  const fullMonthsElapsed = Math.floor(diffMs / MS_PER_SIMULATED_MONTH);

  if (fullMonthsElapsed < 1) {
    // 72 real hours have not elapsed yet for the next month
    return { portfolio, monthsElapsed: 0, totalProfitCredited: 0, wasOffline: false };
  }

  // Advance the portfolio through the completed 72-hour intervals
  const monthsToApply = Math.min(24, fullMonthsElapsed); // Cap at 24 months for safety
  const previousTotalLiquid = portfolio.bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  const updated = advancePortfolioNMonths(portfolio, monthsToApply);

  const newTotalLiquid = updated.bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const netGain = Math.max(0, newTotalLiquid - previousTotalLiquid);

  // Advance settlement anchor by the exact multiples of 72 hours consumed
  const remainderMs = diffMs % MS_PER_SIMULATED_MONTH;
  const newSettledDate = new Date(nowTime - remainderMs);
  updated.lastSettledTimestamp = newSettledDate.toISOString();

  // Add an informative timeline log entry
  const primaryBank =
    updated.bankAccounts.find(b => b.isPrimaryForAutoDebit) || updated.bankAccounts[0];

  updated.simulationLogs.unshift({
    id: `offline_sync_${Date.now()}`,
    timestamp: now.toISOString(),
    simulatedMonth: updated.simulatedMonth,
    simulatedDateString: getSimulatedDateString(updated.simulationStartDate, updated.simulatedMonth),
    type: 'salary_deposit',
    title: `🕒 Automated 72-Hour Net Profit Payout (+${Math.round(netGain).toLocaleString()})`,
    amount: netGain,
    direction: 'inflow',
    bankAccountAffected: primaryBank?.bankName || 'Primary Bank',
    details: `Completed ${monthsToApply} in-app month(s) (${monthsToApply * REAL_HOURS_PER_SIMULATED_MONTH} real hours elapsed). Net profit and 10% annual bank interest credited.`,
  });

  return {
    portfolio: updated,
    monthsElapsed: monthsToApply,
    totalProfitCredited: netGain,
    wasOffline: true,
  };
}

