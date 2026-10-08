import fs from 'fs/promises';
import path from 'path';
import { UserAccount, PortfolioData, ChatMessage, SharedFinancialData } from '@/types/finance';
import { DEMO_USERS, createDavisPortfolio, createCleanPortfolio } from '@/lib/initial-data';
import { syncOfflineElapsedProfitAndBanking } from '@/lib/simulation-engine';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'aeg_accounts.json');
const PORTFOLIOS_FILE = path.join(DATA_DIR, 'aeg_portfolios.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'aeg_messages.json');

// In-memory cache for fast access
let memoryAccounts: UserAccount[] | null = null;
let memoryPortfolios: Record<string, PortfolioData> | null = null;
let memoryMessages: ChatMessage[] | null = null;

const INITIAL_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_demo_1',
    senderUsername: 'sophia',
    receiverUsername: 'davis',
    text: 'Hey Davis! Saw your new 911 GT3 RS in your fleet. Looks absolutely incredible! 🔥',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: true,
  },
  {
    id: 'msg_demo_2',
    senderUsername: 'davis',
    receiverUsername: 'sophia',
    text: 'Thanks Sophia! Just collected it this weekend. Check out the spec card:',
    sharedData: {
      type: 'car',
      title: 'Porsche 911 GT3 RS (992)',
      subtitle: 'Weissach Package · 4.0L Naturally Aspirated Flat-6',
      amount: 275000,
      imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      details: {
        power: '518 hp @ 8,500 rpm',
        acceleration: '0-60 mph in 3.0s',
        topSpeed: '184 mph',
      },
    },
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    read: true,
  },
  {
    id: 'msg_demo_3',
    senderUsername: 'sophia',
    receiverUsername: 'davis',
    text: 'Insane build! Also sending over the return split for the joint venture consulting project we closed.',
    sharedData: {
      type: 'money_transfer',
      title: 'Direct Bank Wire Received',
      subtitle: 'From @sophia Main Vault → @davis Checking',
      amount: 12500,
      details: {
        reference: 'Q3 Enterprise Consulting Dividend',
        status: 'Completed',
      },
    },
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: true,
  },
  {
    id: 'msg_demo_4',
    senderUsername: 'davis',
    receiverUsername: 'sophia',
    text: 'Received! Credited right into the primary vault. Let me know when you want to look at the next commercial branch acquisition.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
  },
];

async function ensureDataFiles(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory exists or created
  }

  // Ensure accounts file
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    memoryAccounts = JSON.parse(raw);
  } catch {
    memoryAccounts = [...DEMO_USERS];
    await fs.writeFile(USERS_FILE, JSON.stringify(memoryAccounts, null, 2), 'utf-8');
  }

  // Ensure portfolios file
  try {
    const raw = await fs.readFile(PORTFOLIOS_FILE, 'utf-8');
    memoryPortfolios = JSON.parse(raw);
  } catch {
    memoryPortfolios = {
      davis: createDavisPortfolio(),
      sophia: createCleanPortfolio(DEMO_USERS[1]),
    };
    await fs.writeFile(PORTFOLIOS_FILE, JSON.stringify(memoryPortfolios, null, 2), 'utf-8');
  }

  // Ensure messages file
  try {
    const raw = await fs.readFile(MESSAGES_FILE, 'utf-8');
    memoryMessages = JSON.parse(raw);
  } catch {
    memoryMessages = [...INITIAL_DEMO_MESSAGES];
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(memoryMessages, null, 2), 'utf-8');
  }
}

export async function getServerAccounts(): Promise<UserAccount[]> {
  if (!memoryAccounts) {
    await ensureDataFiles();
  }
  return memoryAccounts || [...DEMO_USERS];
}

export async function getServerAccount(username: string): Promise<UserAccount | null> {
  const accounts = await getServerAccounts();
  return accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase()) || null;
}

export async function saveServerAccount(account: UserAccount): Promise<void> {
  await ensureDataFiles();
  const accounts = memoryAccounts || [];
  const existingIdx = accounts.findIndex(
    a => a.username.toLowerCase() === account.username.toLowerCase()
  );

  if (existingIdx >= 0) {
    accounts[existingIdx] = account;
  } else {
    accounts.push(account);
  }

  memoryAccounts = accounts;
  await fs.writeFile(USERS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
}

export async function getServerPortfolio(username: string): Promise<PortfolioData | null> {
  await ensureDataFiles();
  const cleanKey = username.trim().toLowerCase();
  const store = memoryPortfolios || {};
  const port = store[cleanKey] || null;
  if (port) {
    const syncRes = syncOfflineElapsedProfitAndBanking(port);
    if (syncRes.wasOffline && syncRes.monthsElapsed > 0) {
      store[cleanKey] = syncRes.portfolio;
      memoryPortfolios = store;
      try {
        await fs.writeFile(PORTFOLIOS_FILE, JSON.stringify(store, null, 2), 'utf-8');
      } catch {}
      return syncRes.portfolio;
    }
  }
  return port;
}

export async function saveServerPortfolio(username: string, portfolio: PortfolioData): Promise<void> {
  await ensureDataFiles();
  const cleanKey = username.trim().toLowerCase();
  const store = memoryPortfolios || {};
  store[cleanKey] = portfolio;
  memoryPortfolios = store;
  await fs.writeFile(PORTFOLIOS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

// ----------------- MESSAGING & CHAT STORAGE -----------------

export async function getServerMessages(userA: string, userB: string): Promise<ChatMessage[]> {
  await ensureDataFiles();
  const msgs = memoryMessages || [];
  const cleanA = userA.toLowerCase().trim();
  const cleanB = userB.toLowerCase().trim();

  return msgs
    .filter(
      m =>
        (m.senderUsername.toLowerCase() === cleanA && m.receiverUsername.toLowerCase() === cleanB) ||
        (m.senderUsername.toLowerCase() === cleanB && m.receiverUsername.toLowerCase() === cleanA)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function saveServerMessage(message: ChatMessage): Promise<ChatMessage> {
  await ensureDataFiles();
  const msgs = memoryMessages || [];
  const newMsg = {
    ...message,
    id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: message.timestamp || new Date().toISOString(),
  };

  msgs.push(newMsg);
  memoryMessages = msgs;
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(msgs, null, 2), 'utf-8');
  return newMsg;
}

export async function markServerMessagesAsRead(senderUsername: string, receiverUsername: string): Promise<void> {
  await ensureDataFiles();
  const msgs = memoryMessages || [];
  const cleanSender = senderUsername.toLowerCase().trim();
  const cleanReceiver = receiverUsername.toLowerCase().trim();

  let modified = false;
  msgs.forEach(m => {
    if (
      m.senderUsername.toLowerCase() === cleanSender &&
      m.receiverUsername.toLowerCase() === cleanReceiver &&
      !m.read
    ) {
      m.read = true;
      modified = true;
    }
  });

  if (modified) {
    memoryMessages = msgs;
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(msgs, null, 2), 'utf-8');
  }
}

export interface UserChatThreadSummary {
  participant: UserAccount;
  lastMessage: ChatMessage;
  unreadCount: number;
}

export async function getUserChatThreads(username: string): Promise<UserChatThreadSummary[]> {
  await ensureDataFiles();
  const cleanUser = username.toLowerCase().trim();
  const accounts = await getServerAccounts();
  const msgs = memoryMessages || [];

  // Group messages by counterpart
  const counterpartMap = new Map<string, { lastMsg: ChatMessage; unreadCount: number }>();

  msgs.forEach(m => {
    const isSender = m.senderUsername.toLowerCase() === cleanUser;
    const isReceiver = m.receiverUsername.toLowerCase() === cleanUser;

    if (!isSender && !isReceiver) return;

    const counterpart = isSender ? m.receiverUsername.toLowerCase() : m.senderUsername.toLowerCase();
    const existing = counterpartMap.get(counterpart);

    const isUnread = isReceiver && !m.read;

    if (!existing) {
      counterpartMap.set(counterpart, {
        lastMsg: m,
        unreadCount: isUnread ? 1 : 0,
      });
    } else {
      if (new Date(m.timestamp).getTime() > new Date(existing.lastMsg.timestamp).getTime()) {
        existing.lastMsg = m;
      }
      if (isUnread) {
        existing.unreadCount += 1;
      }
    }
  });

  const summaries: UserChatThreadSummary[] = [];

  for (const [otherUsername, info] of counterpartMap.entries()) {
    const userAcc =
      accounts.find(a => a.username.toLowerCase() === otherUsername) || {
        id: `user_${otherUsername}`,
        username: otherUsername,
        password: '',
        fullName: otherUsername.charAt(0).toUpperCase() + otherUsername.slice(1),
        currency: 'USD',
        createdAt: new Date().toISOString(),
      };

    summaries.push({
      participant: userAcc,
      lastMessage: info.lastMsg,
      unreadCount: info.unreadCount,
    });
  }

  // Sort by latest message descending
  return summaries.sort(
    (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  );
}

// ----------------- P2P BANK MONEY TRANSFER -----------------

export async function transferMoneyP2P(
  senderUsername: string,
  receiverUsername: string,
  fromBankAccountId: string,
  amount: number,
  memo?: string
): Promise<{
  success: boolean;
  error?: string;
  transactionId?: string;
  senderBankName?: string;
  receiverBankName?: string;
  updatedSenderPortfolio?: PortfolioData;
}> {
  await ensureDataFiles();
  const cleanSender = senderUsername.toLowerCase().trim();
  const cleanReceiver = receiverUsername.toLowerCase().trim();

  if (cleanSender === cleanReceiver) {
    return { success: false, error: 'Cannot transfer funds to your own username. Use internal transfer instead.' };
  }

  if (amount <= 0 || isNaN(amount)) {
    return { success: false, error: 'Please enter a valid positive transfer amount.' };
  }

  const senderAcc = await getServerAccount(cleanSender);
  const receiverAcc = await getServerAccount(cleanReceiver);

  if (!receiverAcc) {
    return { success: false, error: `Recipient @${cleanReceiver} does not exist in the database.` };
  }

  const senderPort = (await getServerPortfolio(cleanSender)) || (cleanSender === 'davis' ? createDavisPortfolio() : null);
  const receiverPort = (await getServerPortfolio(cleanReceiver)) || createCleanPortfolio(receiverAcc);

  if (!senderPort) {
    return { success: false, error: 'Sender portfolio not found.' };
  }

  const senderBank = senderPort.bankAccounts.find(b => b.id === fromBankAccountId) || senderPort.bankAccounts[0];
  if (!senderBank) {
    return { success: false, error: 'No sender bank account available.' };
  }

  if (senderBank.balance < amount) {
    return {
      success: false,
      error: `Insufficient balance in ${senderBank.bankName}. Available: $${senderBank.balance.toLocaleString()}, Required: $${amount.toLocaleString()}.`,
    };
  }

  // Select receiver's bank (primary or first)
  let receiverBank = receiverPort.bankAccounts.find(b => b.isPrimaryForAutoDebit) || receiverPort.bankAccounts[0];
  if (!receiverBank) {
    // Auto-create a primary bank account if none exists
    receiverBank = {
      id: `bank_${cleanReceiver}_vault`,
      bankName: 'Main Vault Account',
      accountType: 'Savings',
      accountNumberMasked: '••• 9901',
      balance: 0,
      currency: receiverAcc.currency || 'USD',
      interestRateApy: 3.5,
      isPrimaryForAutoDebit: true,
    };
    receiverPort.bankAccounts.push(receiverBank);
  }

  const txId = `wire_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();
  const cleanMemo = memo?.trim() ? ` (Memo: "${memo.trim()}")` : '';

  // 1. Debit sender
  senderBank.balance -= amount;
  senderPort.simulationLogs = [
    {
      id: `log_send_${txId}`,
      timestamp: nowIso,
      simulatedMonth: senderPort.simulatedMonth,
      simulatedDateString: `Month ${senderPort.simulatedMonth}`,
      type: 'asset_purchase',
      title: `Wire Sent to @${receiverAcc.username} (${receiverAcc.fullName})`,
      amount,
      direction: 'outflow',
      bankAccountAffected: senderBank.bankName,
      details: `Transferred $${amount.toLocaleString()} from ${senderBank.bankName} to @${receiverAcc.username}'s ${receiverBank.bankName}.${cleanMemo}`,
    },
    ...senderPort.simulationLogs,
  ];

  // 2. Credit receiver
  receiverBank.balance += amount;
  receiverPort.simulationLogs = [
    {
      id: `log_recv_${txId}`,
      timestamp: nowIso,
      simulatedMonth: receiverPort.simulatedMonth,
      simulatedDateString: `Month ${receiverPort.simulatedMonth}`,
      type: 'salary_deposit',
      title: `Wire Received from @${senderAcc?.username || cleanSender} (${senderAcc?.fullName || 'User'})`,
      amount,
      direction: 'inflow',
      bankAccountAffected: receiverBank.bankName,
      details: `Received $${amount.toLocaleString()} into ${receiverBank.bankName} from @${cleanSender}.${cleanMemo}`,
    },
    ...receiverPort.simulationLogs,
  ];

  // 3. Save both portfolios
  await saveServerPortfolio(cleanSender, senderPort);
  await saveServerPortfolio(cleanReceiver, receiverPort);

  // 4. Automatically generate a rich ChatMessage between them with SharedFinancialData
  const transferMessage: ChatMessage = {
    id: `msg_wire_${txId}`,
    senderUsername: cleanSender,
    receiverUsername: cleanReceiver,
    text: `💸 Sent $${amount.toLocaleString()} to your bank account!${memo ? ` Note: "${memo}"` : ''}`,
    sharedData: {
      type: 'money_transfer',
      title: `P2P Wire: $${amount.toLocaleString()}`,
      subtitle: `From @${cleanSender} (${senderBank.bankName}) → @${cleanReceiver} (${receiverBank.bankName})`,
      amount,
      currency: senderAcc?.currency || 'USD',
      details: {
        transactionId: txId,
        memo: memo || 'Instant Bank Wire',
        timestamp: nowIso,
        status: 'Settled Instantly',
      },
    },
    timestamp: nowIso,
    read: false,
  };

  await saveServerMessage(transferMessage);

  return {
    success: true,
    transactionId: txId,
    senderBankName: senderBank.bankName,
    receiverBankName: receiverBank.bankName,
    updatedSenderPortfolio: senderPort,
  };
}

