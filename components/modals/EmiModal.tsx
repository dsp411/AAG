'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { EmiLiability } from '@/types/finance';
import { X, CreditCard, Calculator } from 'lucide-react';

interface EmiModalProps {
  isOpen: boolean;
  onClose: () => void;
  emiToEdit?: EmiLiability | null;
}

export function EmiModal({ isOpen, onClose, emiToEdit }: EmiModalProps) {
  const { addEmi, updateEmi, portfolio } = usePortfolio();

  const [name, setName] = useState(() => emiToEdit?.name || '');
  const [loanType, setLoanType] = useState<'Car Loan' | 'Home Mortgage' | 'Personal Loan' | 'Commercial Loan'>(() => emiToEdit?.loanType || 'Car Loan');
  const [principalOriginal, setPrincipalOriginal] = useState<number>(() => emiToEdit?.principalOriginal ?? 60000);
  const [remainingPrincipal, setRemainingPrincipal] = useState<number>(() => emiToEdit?.remainingPrincipal ?? 60000);
  const [interestRateYearly, setInterestRateYearly] = useState<number>(() => emiToEdit?.interestRateYearly ?? 5.5);
  const [tenureMonthsOriginal, setTenureMonthsOriginal] = useState<number>(() => emiToEdit?.tenureMonthsOriginal ?? 60);
  const [monthlyEmiAmount, setMonthlyEmiAmount] = useState<number>(() => emiToEdit?.monthlyEmiAmount ?? 1145);
  const [linkedBankAccountId, setLinkedBankAccountId] = useState(() => emiToEdit?.linkedBankAccountId || portfolio?.bankAccounts[0]?.id || '');
  const [autoDebitEnabled, setAutoDebitEnabled] = useState(() => emiToEdit?.autoDebitEnabled ?? true);

  // Helper formula to compute estimated standard EMI
  const calculateStandardEmi = (p: number, rateYearly: number, months: number) => {
    if (months <= 0 || p <= 0) return 0;
    const r = rateYearly / 100 / 12;
    if (r === 0) return Math.round(p / months);
    const emi = (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  };

  const handleRecalculateEmi = () => {
    const computed = calculateStandardEmi(principalOriginal, interestRateYearly, tenureMonthsOriginal);
    setMonthlyEmiAmount(computed);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (emiToEdit) {
      updateEmi({
        ...emiToEdit,
        name: name.trim(),
        loanType,
        principalOriginal: Number(principalOriginal),
        remainingPrincipal: Number(remainingPrincipal),
        interestRateYearly: Number(interestRateYearly),
        tenureMonthsOriginal: Number(tenureMonthsOriginal),
        monthlyEmiAmount: Number(monthlyEmiAmount),
        linkedBankAccountId: linkedBankAccountId || portfolio?.bankAccounts[0]?.id || '',
        autoDebitEnabled,
      });
    } else {
      addEmi({
        name: name.trim(),
        loanType,
        principalOriginal: Number(principalOriginal),
        remainingPrincipal: Number(remainingPrincipal),
        interestRateYearly: Number(interestRateYearly),
        tenureMonthsOriginal: Number(tenureMonthsOriginal),
        monthlyEmiAmount: Number(monthlyEmiAmount),
        linkedBankAccountId: linkedBankAccountId || portfolio?.bankAccounts[0]?.id || '',
        autoDebitEnabled,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">
              {emiToEdit ? 'Edit EMI / Loan Agreement' : 'Add Loan / EMI Obligation'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Loan / Agreement Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Tesla Model S Auto Loan or Villa Mortgage"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Loan Category
              </label>
              <select
                value={loanType}
                onChange={e => setLoanType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Car Loan">Car / Vehicle Loan</option>
                <option value="Home Mortgage">Home Mortgage</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Commercial Loan">Commercial Property Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.05"
                value={interestRateYearly}
                onChange={e => setInterestRateYearly(Number(e.target.value))}
                placeholder="e.g. 5.5"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Original Principal Amount ($)
              </label>
              <input
                type="number"
                value={principalOriginal}
                onChange={e => setPrincipalOriginal(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Current Remaining Balance ($)
              </label>
              <input
                type="number"
                value={remainingPrincipal}
                onChange={e => setRemainingPrincipal(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Total Tenure (Months)
              </label>
              <input
                type="number"
                value={tenureMonthsOriginal}
                onChange={e => setTenureMonthsOriginal(Number(e.target.value))}
                placeholder="e.g. 60 or 360"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Monthly EMI Amount ($)
                </label>
                <button
                  type="button"
                  onClick={handleRecalculateEmi}
                  className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3" />
                  <span>Calc</span>
                </button>
              </div>
              <input
                type="number"
                value={monthlyEmiAmount}
                onChange={e => setMonthlyEmiAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Debited From Bank Account
            </label>
            <select
              value={linkedBankAccountId}
              onChange={e => setLinkedBankAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-rose-500"
            >
              {portfolio?.bankAccounts.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bankName} (Avail: ${b.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoDebitToggle"
              checked={autoDebitEnabled}
              onChange={e => setAutoDebitEnabled(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-0"
            />
            <label htmlFor="autoDebitToggle" className="text-xs text-slate-300 cursor-pointer">
              Enable automatic monthly EMI debit from this bank account during time simulation
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg"
            >
              {emiToEdit ? 'Save Agreement' : 'Record Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ExpenseModal({
  isOpen,
  onClose,
  expenseToEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: any;
}) {
  const { addRecurringExpense, updateRecurringExpense, portfolio } = usePortfolio();

  const [name, setName] = useState(() => expenseToEdit?.name || '');
  const [category, setCategory] = useState<any>(() => expenseToEdit?.category || 'Utilities');
  const [monthlyAmount, setMonthlyAmount] = useState<number>(() => expenseToEdit?.monthlyAmount ?? 450);
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(() => expenseToEdit?.dueDayOfMonth ?? 1);
  const [linkedBankAccountId, setLinkedBankAccountId] = useState(() => expenseToEdit?.linkedBankAccountId || portfolio?.bankAccounts[0]?.id || '');
  const [autoDebitEnabled, setAutoDebitEnabled] = useState(() => expenseToEdit?.autoDebitEnabled ?? true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (expenseToEdit) {
      updateRecurringExpense({
        ...expenseToEdit,
        name: name.trim(),
        category,
        monthlyAmount: Number(monthlyAmount),
        dueDayOfMonth: Number(dueDayOfMonth),
        linkedBankAccountId: linkedBankAccountId || portfolio?.bankAccounts[0]?.id || '',
        autoDebitEnabled,
      });
    } else {
      addRecurringExpense({
        name: name.trim(),
        category,
        monthlyAmount: Number(monthlyAmount),
        dueDayOfMonth: Number(dueDayOfMonth),
        linkedBankAccountId: linkedBankAccountId || portfolio?.bankAccounts[0]?.id || '',
        autoDebitEnabled,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white">
            {expenseToEdit ? 'Edit Recurring Bill' : 'Add Recurring Bill / Expense'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Bill / Expense Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Fiber Internet, Club Membership, Health Insurance"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Utilities">Utilities</option>
                <option value="Insurance">Insurance</option>
                <option value="Subscriptions">Subscriptions & Software</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Education">Education</option>
                <option value="Family">Family</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monthly Amount ($)
              </label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={e => setMonthlyAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Payment Bank Account
            </label>
            <select
              value={linkedBankAccountId}
              onChange={e => setLinkedBankAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-rose-500"
            >
              {portfolio?.bankAccounts.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bankName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg"
            >
              {expenseToEdit ? 'Save Bill' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
