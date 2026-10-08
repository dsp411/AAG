import { PayoutRecord, PayoutStatus, PortfolioData, UserAccount } from '@/types/finance';
import { calculateMonthlyFinances } from '@/lib/payout-calculator';
import {
  getServerAccount,
  getServerAccounts,
  saveServerAccount,
  getServerPortfolio,
  saveServerPortfolio,
} from '@/lib/server-storage';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PAYOUTS_FILE = path.join(DATA_DIR, 'aeg_payouts.json');

// In-memory cache for fast payout record lookup
let memoryPayouts: PayoutRecord[] | null = null;

async function ensurePayoutsFile(): Promise<PayoutRecord[]> {
  if (memoryPayouts) return memoryPayouts;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}

  try {
    const raw = await fs.readFile(PAYOUTS_FILE, 'utf-8');
    memoryPayouts = JSON.parse(raw);
    return memoryPayouts || [];
  } catch {
    memoryPayouts = [];
    try {
      await fs.writeFile(PAYOUTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    } catch {}
    return [];
  }
}

export async function savePayoutRecord(record: PayoutRecord): Promise<void> {
  const records = await ensurePayoutsFile();
  const existingIdx = records.findIndex(r => r.id === record.id);
  if (existingIdx >= 0) {
    records[existingIdx] = record;
  } else {
    records.unshift(record);
  }
  memoryPayouts = records;
  try {
    await fs.writeFile(PAYOUTS_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save payout record to disk:', err);
  }
}

export async function getPayoutHistoryForUser(username: string): Promise<PayoutRecord[]> {
  const records = await ensurePayoutsFile();
  return records.filter(r => r.username.toLowerCase() === username.toLowerCase());
}

export async function getAllPayoutRecords(): Promise<PayoutRecord[]> {
  return await ensurePayoutsFile();
}

/**
 * Executes the automated monthly background payout for an in-app user account.
 * 
 * 1. Calculates exact monthly Net Profit: (Total Monthly Revenue - Total Monthly Expenses).
 * 2. Credits that exact amount directly into the user's in-app Bank Account (e.g. Primary Checking / High Yield Vault).
 * 3. Handles edge cases:
 *    - Zero profit: logs skipped_zero_profit (break-even).
 *    - Negative net profit (loss): logs skipped_loss and records carryover balance.
 *    - Positive net profit: adds imaginary funds directly to in-app bank balance and logs transaction.
 */
export async function executeMonthlyPayoutForUser(
  username: string,
  options?: {
    billingPeriod?: string;
    targetBankAccountId?: string;
    force?: boolean;
  }
): Promise<{
  success: boolean;
  status: PayoutStatus;
  payoutRecord?: PayoutRecord;
  message: string;
  creditedBankName?: string;
  newBankBalance?: number;
}> {
  const user = await getServerAccount(username);
  if (!user) {
    return {
      success: false,
      status: 'failed',
      message: `User account @${username} not found.`,
    };
  }

  const portfolio = await getServerPortfolio(username);
  if (!portfolio) {
    return {
      success: false,
      status: 'failed',
      message: `Portfolio for @${username} not found.`,
    };
  }

  const now = new Date();
  const billingPeriod =
    options?.billingPeriod ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const idempotencyKey = `payout_${user.username.toLowerCase()}_${billingPeriod}_m${portfolio.simulatedMonth}`;

  // 1. Idempotency Check
  const records = await ensurePayoutsFile();
  const existingPayout = records.find(r => r.idempotencyKey === idempotencyKey);
  if (existingPayout && existingPayout.status === 'succeeded' && !options?.force) {
    return {
      success: true,
      status: existingPayout.status,
      payoutRecord: existingPayout,
      message: `Payout for @${username} for period ${billingPeriod} was already credited to bank.`,
    };
  }

  // 2. Identify Target In-App Bank Account
  const targetId = options?.targetBankAccountId || user.connectedBankAccountId;
  const connectedBank =
    portfolio.bankAccounts.find(b => b.id === targetId) ||
    portfolio.bankAccounts.find(b => b.isPrimaryForAutoDebit) ||
    portfolio.bankAccounts[0];

  if (!connectedBank) {
    return {
      success: false,
      status: 'failed',
      message: `No in-app bank account found to deposit payout for @${username}.`,
    };
  }

  // 3. Calculate Itemized Monthly Net Profit
  const currentLossCarryover = user.lossCarryoverBalance || 0;
  const finances = calculateMonthlyFinances(portfolio, currentLossCarryover);

  const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = now.toISOString();

  // 4. Edge Case Handling
  // Case A: Break-Even (Net Profit == 0)
  if (finances.grossNetProfit === 0) {
    const record: PayoutRecord = {
      id: payoutId,
      userId: user.id,
      username: user.username,
      billingPeriod,
      monthIndex: portfolio.simulatedMonth,
      totalRevenue: finances.totalRevenue,
      totalExpenses: finances.totalExpenses,
      grossNetProfit: 0,
      carriedLossDeducted: 0,
      netPayoutAmount: 0,
      newLossCarryover: currentLossCarryover,
      currency: user.currency || 'USD',
      status: 'skipped_zero_profit',
      connectedBankAccountId: connectedBank.id,
      connectedBankName: connectedBank.bankName,
      idempotencyKey,
      breakdown: finances.breakdown,
      executedAt: nowIso,
      createdAt: nowIso,
    };

    await savePayoutRecord(record);

    return {
      success: true,
      status: 'skipped_zero_profit',
      payoutRecord: record,
      creditedBankName: connectedBank.bankName,
      newBankBalance: connectedBank.balance,
      message: `Monthly net profit was $0.00 (break-even). In-app bank account balance unchanged.`,
    };
  }

  // Case B: Net Loss (Net Profit < 0)
  if (finances.grossNetProfit < 0 || finances.netPayoutAmount === 0) {
    user.lossCarryoverBalance = finances.newLossCarryover;
    await saveServerAccount(user);

    const record: PayoutRecord = {
      id: payoutId,
      userId: user.id,
      username: user.username,
      billingPeriod,
      monthIndex: portfolio.simulatedMonth,
      totalRevenue: finances.totalRevenue,
      totalExpenses: finances.totalExpenses,
      grossNetProfit: finances.grossNetProfit,
      carriedLossDeducted: finances.carriedLossDeducted,
      netPayoutAmount: 0,
      newLossCarryover: finances.newLossCarryover,
      currency: user.currency || 'USD',
      status: 'skipped_loss',
      connectedBankAccountId: connectedBank.id,
      connectedBankName: connectedBank.bankName,
      idempotencyKey,
      failureReason:
        finances.grossNetProfit < 0
          ? `Net monthly loss of -$${Math.abs(finances.grossNetProfit).toLocaleString()}. Carried forward into reserve loss balance.`
          : `Profit of $${finances.grossNetProfit.toLocaleString()} was fully allocated to offset previous carried loss.`,
      breakdown: finances.breakdown,
      executedAt: nowIso,
      createdAt: nowIso,
    };

    await savePayoutRecord(record);

    return {
      success: true,
      status: 'skipped_loss',
      payoutRecord: record,
      creditedBankName: connectedBank.bankName,
      newBankBalance: connectedBank.balance,
      message:
        finances.grossNetProfit < 0
          ? `Net monthly loss (-$${Math.abs(finances.grossNetProfit).toLocaleString()}). No funds deposited. Loss rolled over.`
          : `Profit was used to offset previous loss balance. No net payout due.`,
    };
  }

  // Case C: Positive Net Profit -> Direct In-App Bank Account Credit
  const transferRef = `inapp_pay_${Date.now()}`;
  connectedBank.balance += finances.netPayoutAmount;
  user.lossCarryoverBalance = 0;
  await saveServerAccount(user);

  // Append entry to simulation log
  portfolio.simulationLogs.unshift({
    id: `log_payout_${Date.now()}`,
    timestamp: nowIso,
    simulatedMonth: portfolio.simulatedMonth,
    simulatedDateString: billingPeriod,
    type: 'salary_deposit',
    title: `Automated Net Profit Payout (+${finances.netPayoutAmount.toLocaleString()})`,
    amount: finances.netPayoutAmount,
    direction: 'inflow',
    bankAccountAffected: connectedBank.bankName,
    details: `Transferred exact monthly net profit ($${finances.totalRevenue.toLocaleString()} revenue - $${finances.totalExpenses.toLocaleString()} expenses) into in-app bank account ${connectedBank.bankName} (Ref: ${transferRef}).`,
  });

  await saveServerPortfolio(username, portfolio);

  // Record Succeeded Transaction in Payout Ledger
  const successRecord: PayoutRecord = {
    id: payoutId,
    userId: user.id,
    username: user.username,
    billingPeriod,
    monthIndex: portfolio.simulatedMonth,
    totalRevenue: finances.totalRevenue,
    totalExpenses: finances.totalExpenses,
    grossNetProfit: finances.grossNetProfit,
    carriedLossDeducted: finances.carriedLossDeducted,
    netPayoutAmount: finances.netPayoutAmount,
    newLossCarryover: 0,
    currency: user.currency || 'USD',
    status: 'succeeded',
    connectedBankAccountId: connectedBank.id,
    connectedBankName: connectedBank.bankName,
    gatewayTransferId: transferRef,
    idempotencyKey,
    breakdown: finances.breakdown,
    executedAt: nowIso,
    createdAt: nowIso,
  };

  await savePayoutRecord(successRecord);

  return {
    success: true,
    status: 'succeeded',
    payoutRecord: successRecord,
    creditedBankName: connectedBank.bankName,
    newBankBalance: connectedBank.balance,
    message: `Successfully transferred exact net profit of $${finances.netPayoutAmount.toLocaleString()} into your in-app ${connectedBank.bankName}.`,
  };
}

/**
 * Runs the monthly background payout for all registered users.
 * Designed to be triggered by server cron jobs once a month.
 */
export async function executeMonthlyPayoutsForAllUsers(
  billingPeriod?: string
): Promise<{
  totalProcessed: number;
  succeeded: number;
  skipped: number;
  failed: number;
  results: Array<{ username: string; status: PayoutStatus; amount: number; message: string }>;
}> {
  const allUsers = await getServerAccounts();
  const results: Array<{ username: string; status: PayoutStatus; amount: number; message: string }> =
    [];

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const u of allUsers) {
    try {
      const res = await executeMonthlyPayoutForUser(u.username, { billingPeriod });
      results.push({
        username: u.username,
        status: res.status,
        amount: res.payoutRecord?.netPayoutAmount || 0,
        message: res.message,
      });

      if (res.status === 'succeeded') succeeded++;
      else if (res.status.startsWith('skipped')) skipped++;
      else failed++;
    } catch (err: any) {
      failed++;
      results.push({
        username: u.username,
        status: 'failed',
        amount: 0,
        message: err?.message || 'Unexpected payout execution failure',
      });
    }
  }

  return {
    totalProcessed: allUsers.length,
    succeeded,
    skipped,
    failed,
    results,
  };
}
