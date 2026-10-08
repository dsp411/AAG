'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import { UserAccount } from '@/types/finance';
import {
  X,
  Send,
  Landmark,
  User,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  DollarSign,
  MessageCircle,
} from 'lucide-react';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRecipientUsername?: string;
  preselectedRecipient?: string;
  preselectedAmount?: number;
  onSuccessOpenChat?: (username: string) => void;
}

export function SendMoneyModal({
  isOpen,
  onClose,
  preselectedRecipientUsername,
  preselectedRecipient,
  preselectedAmount,
  onSuccessOpenChat,
}: SendMoneyModalProps) {
  const { currentUser, allUsers, portfolio, transferMoneyToUser } = usePortfolio();

  const initialRecipient = preselectedRecipientUsername || preselectedRecipient || '';
  const [recipientQuery, setRecipientQuery] = useState(initialRecipient);
  const [selectedRecipient, setSelectedRecipient] = useState<UserAccount | null>(() => {
    if (initialRecipient && allUsers?.length) {
      return (
        allUsers.find(
          u => u.username.toLowerCase() === initialRecipient.toLowerCase()
        ) || null
      );
    }
    return null;
  });
  const [selectedBankId, setSelectedBankId] = useState<string>(() => {
    const primary =
      portfolio?.bankAccounts?.find(b => b.isPrimaryForAutoDebit) ||
      portfolio?.bankAccounts?.[0];
    return primary ? primary.id : '';
  });
  const [amountStr, setAmountStr] = useState(preselectedAmount ? preselectedAmount.toString() : '');
  const [memo, setMemo] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    transactionId: string;
    amount: number;
    recipient: UserAccount;
  } | null>(null);

  if (!isOpen || !currentUser || !portfolio) return null;

  const currency = currentUser.currency || 'USD';
  const availableBanks = portfolio.bankAccounts || [];
  const selectedBank = availableBanks.find(b => b.id === selectedBankId) || availableBanks[0];

  // Candidates for recipient search (exclude self)
  const candidateUsers = allUsers.filter(
    u => u.username.toLowerCase() !== currentUser.username.toLowerCase()
  );

  const filteredCandidates = recipientQuery.trim()
    ? candidateUsers.filter(
        u =>
          u.username.toLowerCase().includes(recipientQuery.toLowerCase().replace('@', '')) ||
          u.fullName.toLowerCase().includes(recipientQuery.toLowerCase())
      )
    : candidateUsers;

  const amount = parseFloat(amountStr) || 0;
  const isBalanceSufficient = selectedBank ? selectedBank.balance >= amount : false;

  const handleSelectRecipient = (u: UserAccount) => {
    setSelectedRecipient(u);
    setRecipientQuery(u.username);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetRecipient =
      selectedRecipient ||
      candidateUsers.find(u => u.username.toLowerCase() === recipientQuery.trim().toLowerCase().replace('@', ''));

    if (!targetRecipient) {
      setErrorMessage(`Please select a valid registered user to receive the money.`);
      return;
    }

    if (amount <= 0 || isNaN(amount)) {
      setErrorMessage('Please enter a valid transfer amount greater than zero.');
      return;
    }

    if (!selectedBank) {
      setErrorMessage('No bank account selected for funding.');
      return;
    }

    if (selectedBank.balance < amount) {
      setErrorMessage(
        `Insufficient funds in ${selectedBank.bankName}. Available: ${formatCurrency(
          selectedBank.balance,
          currency
        )}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await transferMoneyToUser(
        targetRecipient.username,
        selectedBank.id,
        amount,
        memo.trim() || undefined
      );

      if (res.success && res.transactionId) {
        setSuccessData({
          transactionId: res.transactionId,
          amount,
          recipient: targetRecipient,
        });
      } else {
        setErrorMessage(res.error || 'Failed to complete wire transfer.');
      }
    } catch {
      setErrorMessage('An unexpected network error occurred while processing wire transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden my-6 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282828] bg-gradient-to-r from-emerald-950 via-[#181818] to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 flex items-center justify-center text-[#1ed760]">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>P2P Bank Wire Transfer</span>
                <span className="text-[10px] font-bold text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/20 px-2 py-0.5 rounded-full">
                  Zero Fees
                </span>
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Instantly wire funds from your vault to another user&apos;s bank account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#282828] hover:bg-[#383838] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Screen */}
        {successData ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#1ed760]/20 border border-[#1ed760] flex items-center justify-center mx-auto text-[#1ed760] shadow-[0_0_30px_rgba(30,215,96,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs text-[#1ed760] font-bold uppercase tracking-wider">
                Wire Transfer Settled Instantly
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
                {formatCurrency(successData.amount, currency)}
              </h3>
              <p className="text-xs text-[#b3b3b3] mt-1">
                Successfully credited to <span className="text-white font-bold">@{successData.recipient.username}</span> ({successData.recipient.fullName})
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#282828] text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[#888]">
                <span>Transaction Ref:</span>
                <span className="text-white font-bold">{successData.transactionId}</span>
              </div>
              <div className="flex justify-between text-[#888]">
                <span>Debited From:</span>
                <span className="text-white">{selectedBank?.bankName}</span>
              </div>
              <div className="flex justify-between text-[#888]">
                <span>Recipient:</span>
                <span className="text-[#1ed760] font-bold">@{successData.recipient.username}</span>
              </div>
              {memo && (
                <div className="flex justify-between text-[#888]">
                  <span>Memo Note:</span>
                  <span className="text-white">{memo}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {onSuccessOpenChat && (
                <button
                  onClick={() => {
                    onClose();
                    onSuccessOpenChat(successData.recipient.username);
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Open Chat with @{successData.recipient.username}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="py-2.5 px-5 bg-[#282828] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Recipient Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                Send To (Search Username or Name)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#b3b3b3]">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={recipientQuery}
                  onChange={e => {
                    setRecipientQuery(e.target.value);
                    setSelectedRecipient(null);
                  }}
                  placeholder="Search @username (3-10 letters or numbers)..."
                  className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#333] rounded-lg text-xs text-white placeholder-[#777] focus:outline-none focus:border-[#1ed760] transition-colors font-mono"
                  autoFocus
                />
              </div>

              {/* Autocomplete Suggestions dropdown if not locked */}
              {!selectedRecipient && filteredCandidates.length > 0 && (
                <div className="mt-2 max-h-36 overflow-y-auto rounded-lg bg-[#141414] border border-[#2a2a2a] divide-y divide-[#222]">
                  {filteredCandidates.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectRecipient(u)}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#202020] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1ed760] text-black font-bold flex items-center justify-center text-[10px]">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">@{u.username}</div>
                          <div className="text-[10px] text-[#888]">{u.fullName}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#1ed760] font-bold">Select</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected recipient badge */}
              {selectedRecipient && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1ed760] text-black font-bold flex items-center justify-center text-xs">
                      {selectedRecipient.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1">
                        <span>@{selectedRecipient.username}</span>
                        <span className="text-[9px] text-[#1ed760] bg-[#1ed760]/10 px-1.5 py-0.2 rounded-full">
                          Verified Recipient
                        </span>
                      </div>
                      <div className="text-[10px] text-[#aaa]">{selectedRecipient.fullName} · Base: {selectedRecipient.currency}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecipient(null);
                      setRecipientQuery('');
                    }}
                    className="text-[#888] hover:text-white text-xs px-2 py-1"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Debit Source Bank */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                Debit From Your Bank Account
              </label>
              <select
                value={selectedBankId}
                onChange={e => setSelectedBankId(e.target.value)}
                className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-lg text-xs text-white focus:outline-none focus:border-[#1ed760] cursor-pointer"
              >
                {availableBanks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} — Available: {formatCurrency(b.balance, currency)}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3]">
                  Transfer Amount
                </label>
                {selectedBank && (
                  <span className="text-xs text-[#888]">
                    Available: <span className="text-[#1ed760] font-mono font-bold">{formatCurrency(selectedBank.balance, currency)}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white font-bold text-sm">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-base font-mono font-bold text-white focus:outline-none focus:border-[#1ed760] transition-colors"
                />
              </div>

              {/* Quick preset amount pills */}
              {selectedBank && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[500, 1000, 5000, 10000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmountStr(val.toString())}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-[#222] hover:bg-[#2c2c2c] text-[#b3b3b3] hover:text-white font-mono transition-colors"
                    >
                      ${val.toLocaleString()}
                    </button>
                  ))}
                  {selectedBank.balance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmountStr(Math.round(selectedBank.balance * 0.5).toString())}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-[#222] hover:bg-[#2c2c2c] text-[#1ed760] font-bold transition-colors"
                    >
                      50% Balance
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Memo Note */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                Reference / Memo (Optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="e.g. Consulting dividend, dinner split, car deposit..."
                className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-lg text-xs text-white focus:outline-none focus:border-[#1ed760] transition-colors"
              />
            </div>

            {/* Live Settlement Breakdown */}
            {amount > 0 && selectedBank && (
              <div className="p-3 rounded-lg bg-[#141414] border border-[#282828] text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-[#888]">
                  <span>Remaining Bank Balance:</span>
                  <span className={isBalanceSufficient ? 'text-white' : 'text-rose-400 font-bold'}>
                    {formatCurrency(selectedBank.balance - amount, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-[#888]">
                  <span>Settlement Speed:</span>
                  <span className="text-[#1ed760] font-bold">Instant (0s)</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#b3b3b3] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || amount <= 0 || !isBalanceSufficient}
                className="px-5 py-2.5 bg-[#1ed760] hover:bg-[#3be477] disabled:opacity-50 text-black text-xs font-extrabold uppercase tracking-wider rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Processing Wire...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 fill-black" />
                    <span>Send Wire Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
