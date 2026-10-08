'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import { X, TrendingUp, Landmark, Coins, DollarSign, Briefcase, AlertCircle } from 'lucide-react';

interface GrowthAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: 'fd' | 'stock' | 'crypto' | 'forex' | 'income';
  itemToEdit?: any;
}

export function GrowthAssetModal({
  isOpen,
  onClose,
  initialCategory = 'fd',
  itemToEdit,
}: GrowthAssetModalProps) {
  const {
    addFixedDeposit,
    updateFixedDeposit,
    addStock,
    updateStock,
    addCrypto,
    updateCrypto,
    addForex,
    updateForex,
    addIncomeSource,
    updateIncomeSource,
    portfolio,
  } = usePortfolio();

  const [category, setCategory] = useState<'fd' | 'stock' | 'crypto' | 'forex' | 'income'>(
    () => initialCategory
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultBankId = portfolio?.bankAccounts[0]?.id || '';

  // FD Fields
  const [fdName, setFdName] = useState(() => (initialCategory === 'fd' && itemToEdit ? itemToEdit.name : ''));
  const [fdInstitution, setFdInstitution] = useState(() => (initialCategory === 'fd' && itemToEdit ? itemToEdit.institution : ''));
  const [fdPrincipal, setFdPrincipal] = useState<number>(() => (initialCategory === 'fd' && itemToEdit ? itemToEdit.principal : 50000));
  const [fdRate, setFdRate] = useState<number>(() => (initialCategory === 'fd' && itemToEdit ? itemToEdit.interestRateYearly : 7.2));
  const [fdCompounding, setFdCompounding] = useState<'Monthly' | 'Quarterly' | 'Annually'>(() => (initialCategory === 'fd' && itemToEdit ? itemToEdit.compoundingFrequency : 'Monthly'));
  const [fdTenure, setFdTenure] = useState<number>(() => (initialCategory === 'fd' && itemToEdit ? itemToEdit.tenureMonths : 12));
  const [fdAutoBankId, setFdAutoBankId] = useState(() => (initialCategory === 'fd' && itemToEdit ? itemToEdit.autoCreditBankId : defaultBankId));
  const [fdFundingBankId, setFdFundingBankId] = useState(() => defaultBankId);

  // Stock Fields
  const [ticker, setTicker] = useState(() => (initialCategory === 'stock' && itemToEdit ? itemToEdit.ticker : ''));
  const [companyName, setCompanyName] = useState(() => (initialCategory === 'stock' && itemToEdit ? itemToEdit.companyName : ''));
  const [shares, setShares] = useState<number>(() => (initialCategory === 'stock' && itemToEdit ? itemToEdit.shares : 100));
  const [buyPrice, setBuyPrice] = useState<number>(() => (initialCategory === 'stock' && itemToEdit ? itemToEdit.buyPrice : 150));
  const [currentPrice, setCurrentPrice] = useState<number>(() => (initialCategory === 'stock' && itemToEdit ? itemToEdit.currentPrice : 150));
  const [stockGrowth, setStockGrowth] = useState<number>(() => (initialCategory === 'stock' && itemToEdit ? itemToEdit.expectedAnnualGrowth : 10));
  const [stockDividend, setStockDividend] = useState<number>(() => (initialCategory === 'stock' && itemToEdit ? itemToEdit.dividendYieldYearly : 1.5));
  const [stockBankId, setStockBankId] = useState(() => (initialCategory === 'stock' && itemToEdit ? (itemToEdit.autoCreditDividendsToBankId || defaultBankId) : defaultBankId));
  const [stockFundingBankId, setStockFundingBankId] = useState(() => defaultBankId);

  // Crypto Fields
  const [cryptoSymbol, setCryptoSymbol] = useState(() => (initialCategory === 'crypto' && itemToEdit ? itemToEdit.symbol : ''));
  const [cryptoName, setCryptoName] = useState(() => (initialCategory === 'crypto' && itemToEdit ? itemToEdit.name : ''));
  const [cryptoQty, setCryptoQty] = useState<number>(() => (initialCategory === 'crypto' && itemToEdit ? itemToEdit.quantity : 1));
  const [cryptoBuyPrice, setCryptoBuyPrice] = useState<number>(() => (initialCategory === 'crypto' && itemToEdit ? itemToEdit.buyPrice : 2500));
  const [cryptoCurrentPrice, setCryptoCurrentPrice] = useState<number>(() => (initialCategory === 'crypto' && itemToEdit ? itemToEdit.currentPrice : 2500));
  const [cryptoGrowth, setCryptoGrowth] = useState<number>(() => (initialCategory === 'crypto' && itemToEdit ? itemToEdit.expectedAnnualGrowth : 18));
  const [cryptoStaking, setCryptoStaking] = useState<number>(() => (initialCategory === 'crypto' && itemToEdit ? itemToEdit.stakingYieldYearly : 0));
  const [cryptoFundingBankId, setCryptoFundingBankId] = useState(() => defaultBankId);

  // Forex Fields
  const [fxCode, setFxCode] = useState<CurrencyCode>(() => (initialCategory === 'forex' && itemToEdit ? itemToEdit.currencyCode : 'EUR'));
  const [fxName, setFxName] = useState(() => (initialCategory === 'forex' && itemToEdit ? itemToEdit.currencyName : 'Euro'));
  const [fxAmount, setFxAmount] = useState<number>(() => (initialCategory === 'forex' && itemToEdit ? itemToEdit.amount : 10000));
  const [fxBuyRate, setFxBuyRate] = useState<number>(() => (initialCategory === 'forex' && itemToEdit ? itemToEdit.buyExchangeRate : 1.08));
  const [fxCurrentRate, setFxCurrentRate] = useState<number>(() => (initialCategory === 'forex' && itemToEdit ? itemToEdit.currentExchangeRate : 1.08));
  const [fxNotes, setFxNotes] = useState(() => (initialCategory === 'forex' && itemToEdit ? (itemToEdit.notes || '') : ''));
  const [fxFundingBankId, setFxFundingBankId] = useState(() => defaultBankId);

  // Income Fields
  const [incName, setIncName] = useState(() => (initialCategory === 'income' && itemToEdit ? itemToEdit.name : ''));
  const [incType, setIncType] = useState<'Salary' | 'Business' | 'Consulting' | 'Royalties' | 'Pensions' | 'Other'>(() => (initialCategory === 'income' && itemToEdit ? itemToEdit.sourceType : 'Salary'));
  const [incAmount, setIncAmount] = useState<number>(() => (initialCategory === 'income' && itemToEdit ? itemToEdit.monthlyAmount : 12000));
  const [incBankId, setIncBankId] = useState(() => (initialCategory === 'income' && itemToEdit ? itemToEdit.destinationBankId : defaultBankId));
  const [incAppraisal, setIncAppraisal] = useState<number>(() => (initialCategory === 'income' && itemToEdit ? itemToEdit.annualAppraisalRate : 5));

  if (!isOpen) return null;

  const currency = portfolio?.user.currency || 'USD';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (category === 'fd') {
      if (!fdName.trim()) return;
      if (itemToEdit) {
        updateFixedDeposit({
          ...itemToEdit,
          name: fdName.trim(),
          institution: fdInstitution.trim() || 'Bank FD',
          principal: Number(fdPrincipal),
          interestRateYearly: Number(fdRate),
          compoundingFrequency: fdCompounding,
          tenureMonths: Number(fdTenure),
          autoCreditBankId: fdAutoBankId || defaultBankId,
        });
      } else {
        const res = addFixedDeposit(
          {
            name: fdName.trim(),
            institution: fdInstitution.trim() || 'Bank FD',
            principal: Number(fdPrincipal),
            interestRateYearly: Number(fdRate),
            compoundingFrequency: fdCompounding,
            startDate: new Date().toISOString().split('T')[0],
            tenureMonths: Number(fdTenure),
            autoCreditBankId: fdAutoBankId || defaultBankId,
          },
          fdFundingBankId
        );
        if (res && !res.success) {
          setErrorMsg(res.error || 'Failed to book Fixed Deposit');
          return;
        }
      }
    } else if (category === 'stock') {
      if (!ticker.trim()) return;
      if (itemToEdit) {
        updateStock({
          ...itemToEdit,
          ticker: ticker.trim().toUpperCase(),
          companyName: companyName.trim() || ticker.trim(),
          shares: Number(shares),
          buyPrice: Number(buyPrice),
          currentPrice: Number(currentPrice),
          expectedAnnualGrowth: Number(stockGrowth),
          dividendYieldYearly: Number(stockDividend),
          autoCreditDividendsToBankId: stockBankId || undefined,
        });
      } else {
        const res = addStock(
          {
            ticker: ticker.trim().toUpperCase(),
            companyName: companyName.trim() || ticker.trim(),
            shares: Number(shares),
            buyPrice: Number(buyPrice),
            currentPrice: Number(currentPrice),
            expectedAnnualGrowth: Number(stockGrowth),
            dividendYieldYearly: Number(stockDividend),
            autoCreditDividendsToBankId: stockBankId || undefined,
          },
          stockFundingBankId
        );
        if (res && !res.success) {
          setErrorMsg(res.error || 'Failed to purchase stocks');
          return;
        }
      }
    } else if (category === 'crypto') {
      if (!cryptoSymbol.trim()) return;
      if (itemToEdit) {
        updateCrypto({
          ...itemToEdit,
          symbol: cryptoSymbol.trim().toUpperCase(),
          name: cryptoName.trim() || cryptoSymbol.trim(),
          quantity: Number(cryptoQty),
          buyPrice: Number(cryptoBuyPrice),
          currentPrice: Number(cryptoCurrentPrice),
          expectedAnnualGrowth: Number(cryptoGrowth),
          stakingYieldYearly: Number(cryptoStaking),
        });
      } else {
        const res = addCrypto(
          {
            symbol: cryptoSymbol.trim().toUpperCase(),
            name: cryptoName.trim() || cryptoSymbol.trim(),
            quantity: Number(cryptoQty),
            buyPrice: Number(cryptoBuyPrice),
            currentPrice: Number(cryptoCurrentPrice),
            expectedAnnualGrowth: Number(cryptoGrowth),
            stakingYieldYearly: Number(cryptoStaking),
          },
          cryptoFundingBankId
        );
        if (res && !res.success) {
          setErrorMsg(res.error || 'Failed to acquire crypto asset');
          return;
        }
      }
    } else if (category === 'forex') {
      if (itemToEdit) {
        updateForex({
          ...itemToEdit,
          currencyCode: fxCode,
          currencyName: fxName,
          amount: Number(fxAmount),
          buyExchangeRate: Number(fxBuyRate),
          currentExchangeRate: Number(fxCurrentRate),
          notes: fxNotes.trim() || undefined,
        });
      } else {
        const res = addForex(
          {
            currencyCode: fxCode,
            currencyName: fxName,
            amount: Number(fxAmount),
            buyExchangeRate: Number(fxBuyRate),
            currentExchangeRate: Number(fxCurrentRate),
            notes: fxNotes.trim() || undefined,
          },
          fxFundingBankId
        );
        if (res && !res.success) {
          setErrorMsg(res.error || 'Failed to acquire foreign currency reserve');
          return;
        }
      }
    } else if (category === 'income') {
      if (!incName.trim()) return;
      if (itemToEdit) {
        updateIncomeSource({
          ...itemToEdit,
          name: incName.trim(),
          sourceType: incType,
          monthlyAmount: Number(incAmount),
          destinationBankId: incBankId || defaultBankId,
          annualAppraisalRate: Number(incAppraisal),
        });
      } else {
        addIncomeSource({
          name: incName.trim(),
          sourceType: incType,
          monthlyAmount: Number(incAmount),
          destinationBankId: incBankId || defaultBankId,
          annualAppraisalRate: Number(incAppraisal),
        });
      }
    }

    onClose();
  };

  const getFundingBank = (id: string) => portfolio?.bankAccounts.find(b => b.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              {itemToEdit ? 'Edit Asset' : 'Add Appreciating Growth Asset'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Category selector */}
        {!itemToEdit && (
          <div className="grid grid-cols-5 p-1 mx-6 mt-4 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
            {[
              { id: 'fd', label: 'Fixed Dep.' },
              { id: 'stock', label: 'Stocks' },
              { id: 'crypto', label: 'Crypto' },
              { id: 'forex', label: 'Forex' },
              { id: 'income', label: 'Income' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategory(tab.id as any);
                  setErrorMsg(null);
                }}
                className={`py-1.5 font-medium rounded transition-colors cursor-pointer ${
                  category === tab.id
                    ? 'bg-slate-800 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* FD FORM */}
          {category === 'fd' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deposit Name *
                </label>
                <input
                  type="text"
                  value={fdName}
                  onChange={e => setFdName(e.target.value)}
                  placeholder="e.g. 12-Month High Yield Fixed Term"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Financial Institution
                  </label>
                  <input
                    type="text"
                    value={fdInstitution}
                    onChange={e => setFdInstitution(e.target.value)}
                    placeholder="e.g. Barclays or HDFC"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Principal Amount ($)
                  </label>
                  <input
                    type="number"
                    value={fdPrincipal}
                    onChange={e => setFdPrincipal(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Funding Bank Account */}
              {!itemToEdit && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Fund Deposit From Bank Vault</span>
                    </label>
                    {getFundingBank(fdFundingBankId) && (
                      <span className="text-[11px] font-mono text-emerald-400">
                        {formatCurrency(getFundingBank(fdFundingBankId)?.balance || 0, currency)} available
                      </span>
                    )}
                  </div>
                  <select
                    value={fdFundingBankId}
                    onChange={e => setFdFundingBankId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {portfolio?.bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumberMasked}) — {formatCurrency(b.balance, currency)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={fdRate}
                    onChange={e => setFdRate(Number(e.target.value))}
                    placeholder="e.g. 7.2"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={fdTenure}
                    onChange={e => setFdTenure(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Compounding
                  </label>
                  <select
                    value={fdCompounding}
                    onChange={e => setFdCompounding(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Maturity Payout Bank Account
                </label>
                <select
                  value={fdAutoBankId}
                  onChange={e => setFdAutoBankId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  {portfolio?.bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.accountNumberMasked})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* STOCK FORM */}
          {category === 'stock' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Stock Ticker *
                  </label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={e => setTicker(e.target.value.toUpperCase())}
                    placeholder="e.g. NVDA, AAPL, SPY"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. NVIDIA Corporation"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Shares
                  </label>
                  <input
                    type="number"
                    value={shares}
                    onChange={e => setShares(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Buy Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={buyPrice}
                    onChange={e => setBuyPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Current Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Funding Bank Account for Stock */}
              {!itemToEdit && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-teal-400" />
                      <span>Pay for Shares From Bank ({formatCurrency(shares * buyPrice, currency)})</span>
                    </label>
                    {getFundingBank(stockFundingBankId) && (
                      <span className="text-[11px] font-mono text-teal-400">
                        {formatCurrency(getFundingBank(stockFundingBankId)?.balance || 0, currency)} balance
                      </span>
                    )}
                  </div>
                  <select
                    value={stockFundingBankId}
                    onChange={e => setStockFundingBankId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  >
                    {portfolio?.bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumberMasked}) — {formatCurrency(b.balance, currency)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Growth (% / yr)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={stockGrowth}
                    onChange={e => setStockGrowth(Number(e.target.value))}
                    placeholder="e.g. 12"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Dividend Yield (% / yr)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={stockDividend}
                    onChange={e => setStockDividend(Number(e.target.value))}
                    placeholder="e.g. 1.5"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* CRYPTO FORM */}
          {category === 'crypto' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Crypto Symbol *
                  </label>
                  <input
                    type="text"
                    value={cryptoSymbol}
                    onChange={e => setCryptoSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g. BTC, ETH, SOL"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Asset Name</label>
                  <input
                    type="text"
                    value={cryptoName}
                    onChange={e => setCryptoName(e.target.value)}
                    placeholder="e.g. Bitcoin or Ethereum"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={cryptoQty}
                    onChange={e => setCryptoQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Buy Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={cryptoBuyPrice}
                    onChange={e => setCryptoBuyPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={cryptoCurrentPrice}
                    onChange={e => setCryptoCurrentPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Funding Bank Account for Crypto */}
              {!itemToEdit && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-purple-400" />
                      <span>Pay for Crypto From Bank ({formatCurrency(cryptoQty * cryptoBuyPrice, currency)})</span>
                    </label>
                    {getFundingBank(cryptoFundingBankId) && (
                      <span className="text-[11px] font-mono text-purple-400">
                        {formatCurrency(getFundingBank(cryptoFundingBankId)?.balance || 0, currency)} balance
                      </span>
                    )}
                  </div>
                  <select
                    value={cryptoFundingBankId}
                    onChange={e => setCryptoFundingBankId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {portfolio?.bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumberMasked}) — {formatCurrency(b.balance, currency)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Growth (% / yr)
                  </label>
                  <input
                    type="number"
                    value={cryptoGrowth}
                    onChange={e => setCryptoGrowth(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Staking Yield (% / yr)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={cryptoStaking}
                    onChange={e => setCryptoStaking(Number(e.target.value))}
                    placeholder="e.g. 4.5"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* FOREX FORM */}
          {category === 'forex' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={fxCode}
                    onChange={e => {
                      const code = e.target.value as CurrencyCode;
                      setFxCode(code);
                      setFxName(SUPPORTED_CURRENCIES[code]?.name || code);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Amount Held
                  </label>
                  <input
                    type="number"
                    value={fxAmount}
                    onChange={e => setFxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Funding Bank Account for Forex */}
              {!itemToEdit && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Convert Funds From Bank ({formatCurrency(fxAmount * fxBuyRate, currency)})</span>
                    </label>
                    {getFundingBank(fxFundingBankId) && (
                      <span className="text-[11px] font-mono text-cyan-400">
                        {formatCurrency(getFundingBank(fxFundingBankId)?.balance || 0, currency)} balance
                      </span>
                    )}
                  </div>
                  <select
                    value={fxFundingBankId}
                    onChange={e => setFxFundingBankId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    {portfolio?.bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumberMasked}) — {formatCurrency(b.balance, currency)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Buy Rate vs Base
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={fxBuyRate}
                    onChange={e => setFxBuyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Current Rate vs Base
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={fxCurrentRate}
                    onChange={e => setFxCurrentRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Holding Location / Notes</label>
                <input
                  type="text"
                  value={fxNotes}
                  onChange={e => setFxNotes(e.target.value)}
                  placeholder="e.g. European travel vault in Frankfurt"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </>
          )}

          {/* INCOME FORM */}
          {category === 'income' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Income Stream Name *
                </label>
                <input
                  type="text"
                  value={incName}
                  onChange={e => setIncName(e.target.value)}
                  placeholder="e.g. Primary Executive Tech Salary"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={incType}
                    onChange={e => setIncType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Salary">Salary / Compensation</option>
                    <option value="Business">Business Inflow</option>
                    <option value="Consulting">Consulting / Advisory</option>
                    <option value="Royalties">Royalties & IP</option>
                    <option value="Pensions">Pensions</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monthly Amount ($)
                  </label>
                  <input
                    type="number"
                    value={incAmount}
                    onChange={e => setIncAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Destination Bank Vault
                  </label>
                  <select
                    value={incBankId}
                    onChange={e => setIncBankId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {portfolio?.bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Annual Appraisal Raise (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={incAppraisal}
                    onChange={e => setIncAppraisal(Number(e.target.value))}
                    placeholder="e.g. 6.0"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              {itemToEdit ? 'Save Changes' : 'Confirm & Purchase Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
