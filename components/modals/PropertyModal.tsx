'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { PropertyAsset, PropertyType } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import { PhotoPicker } from '../PhotoPicker';
import { X, Building, Landmark, DollarSign, AlertCircle, Sparkles } from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyToEdit?: PropertyAsset | null;
}

export function PropertyModal({ isOpen, onClose, propertyToEdit }: PropertyModalProps) {
  const { addProperty, updateProperty, portfolio } = usePortfolio();

  const [name, setName] = useState(() => propertyToEdit?.name || '');
  const [propertyType, setPropertyType] = useState<PropertyType>(
    () => propertyToEdit?.propertyType || 'Residential'
  );
  const [address, setAddress] = useState(() => propertyToEdit?.address || '');
  const [purchasePrice, setPurchasePrice] = useState<number>(() => propertyToEdit?.purchasePrice ?? 850000);
  const [currentValue, setCurrentValue] = useState<number>(() => propertyToEdit?.currentValue ?? 850000);
  const [annualAppreciationRate, setAnnualAppreciationRate] = useState<number>(
    () => propertyToEdit?.annualAppreciationRate ?? 5.5
  );
  const [isRented, setIsRented] = useState<boolean>(() => propertyToEdit?.isRented ?? false);
  const [tenantName, setTenantName] = useState(() => propertyToEdit?.tenantName || '');
  const [monthlyRentalIncome, setMonthlyRentalIncome] = useState<number>(
    () => propertyToEdit?.monthlyRentalIncome ?? 4200
  );
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(
    () => propertyToEdit?.annualPropertyTax ?? 8000
  );
  const [monthlyMaintenance, setMonthlyMaintenance] = useState<number>(
    () => propertyToEdit?.monthlyMaintenance ?? 300
  );
  const [purchasedFromBankId, setPurchasedFromBankId] = useState<string>(
    () => propertyToEdit?.purchasedFromBankId || portfolio?.bankAccounts[0]?.id || ''
  );
  const [linkedMortgageId, setLinkedMortgageId] = useState<string>(
    () => propertyToEdit?.linkedMortgageId || ''
  );
  const [imageUrl, setImageUrl] = useState<string>(() => propertyToEdit?.imageUrl || '');
  const [photos, setPhotos] = useState<string[]>(
    () => propertyToEdit?.photos || (propertyToEdit?.imageUrl ? [propertyToEdit.imageUrl] : [])
  );
  const [notes, setNotes] = useState(() => propertyToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currency = portfolio?.user.currency || 'USD';
  const selectedFundingBank = portfolio?.bankAccounts.find(b => b.id === purchasedFromBankId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Property name is required.');
      return;
    }

    const primaryImage = imageUrl.trim() || (photos[0] ? photos[0].trim() : undefined);
    const validPhotos = photos.length > 0 ? photos : (primaryImage ? [primaryImage] : undefined);

    if (propertyToEdit) {
      updateProperty({
        ...propertyToEdit,
        name: name.trim(),
        propertyType,
        address: address.trim(),
        purchasePrice: Number(purchasePrice),
        currentValue: Number(currentValue),
        annualAppreciationRate: Number(annualAppreciationRate),
        isRented,
        tenantName: isRented ? tenantName.trim() : undefined,
        monthlyRentalIncome: isRented ? Number(monthlyRentalIncome) : 0,
        annualPropertyTax: Number(annualPropertyTax),
        monthlyMaintenance: Number(monthlyMaintenance),
        purchasedFromBankId: purchasedFromBankId || undefined,
        linkedMortgageId: linkedMortgageId || undefined,
        imageUrl: primaryImage,
        photos: validPhotos,
        notes: notes.trim() || undefined,
      });
      onClose();
    } else {
      const res = addProperty({
        name: name.trim(),
        propertyType,
        address: address.trim(),
        purchasePrice: Number(purchasePrice),
        currentValue: Number(currentValue),
        annualAppreciationRate: Number(annualAppreciationRate),
        isRented,
        tenantName: isRented ? tenantName.trim() : undefined,
        monthlyRentalIncome: isRented ? Number(monthlyRentalIncome) : 0,
        annualPropertyTax: Number(annualPropertyTax),
        monthlyMaintenance: Number(monthlyMaintenance),
        purchasedFromBankId: purchasedFromBankId || undefined,
        linkedMortgageId: linkedMortgageId || undefined,
        imageUrl: primaryImage,
        photos: validPhotos,
        notes: notes.trim() || undefined,
      });

      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to acquire real estate property');
        return;
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#202020] border border-[#383838] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030] bg-[#181818] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 flex items-center justify-center text-[#1ed760]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {propertyToEdit ? 'Edit Real Estate Asset' : 'Acquire Real Estate Property'}
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                {propertyToEdit
                  ? 'Update market valuation, rental yield, and mortgage liability'
                  : 'Funds will be automatically deducted from your designated bank account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#a0a0a0] hover:text-white hover:bg-[#303030] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-600/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Purchase Failed: Insufficient Funds</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Property Name */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Property Title / Description *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Waterfront Penthouse or Commercial Medical Plaza"
              className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#707070] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Property Category
              </label>
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3 py-2.5 text-xs bg-[#141414] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
              >
                <option value="Residential">Residential Luxury Home</option>
                <option value="Commercial">Commercial Office / Suite</option>
                <option value="Rental Villa">Vacation / Rental Villa</option>
                <option value="Apartment">Condo / High-Rise Apartment</option>
                <option value="Land">Land / Development Plot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Annual Appreciation (% p.a.)
              </label>
              <input
                type="number"
                step="0.1"
                value={annualAppreciationRate}
                onChange={e => setAnnualAppreciationRate(Number(e.target.value))}
                placeholder="e.g. 5.5"
                className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Physical Address / Location
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 840 Ocean Drive, Miami, FL"
              className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#707070] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
            />
          </div>

          {/* Photo Picker */}
          <PhotoPicker
            label="Property Photos & Architectural Showcase"
            category="property"
            imageUrl={imageUrl}
            photos={photos}
            onChangeCover={setImageUrl}
            onChangePhotos={setPhotos}
          />

          {/* Pricing & Bank Deduction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Acquisition Cost ({currency})
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Current Market Valuation ({currency})
              </label>
              <input
                type="number"
                value={currentValue}
                onChange={e => setCurrentValue(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Bank Deduction Selection Box */}
          {!propertyToEdit && (
            <div className="p-3.5 bg-[#141414] rounded-xl border border-[#383838] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#1ed760]" />
                  Funded from Bank Vault (Auto-Deduction)
                </span>
                {selectedFundingBank && (
                  <span className="text-[11px] font-mono text-[#a0a0a0]">
                    Balance: <span className={selectedFundingBank.balance >= purchasePrice ? 'text-[#1ed760] font-bold' : 'text-rose-400 font-bold'}>
                      {formatCurrency(selectedFundingBank.balance, currency)}
                    </span>
                  </span>
                )}
              </div>
              <select
                value={purchasedFromBankId}
                onChange={e => setPurchasedFromBankId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg border border-[#444] focus:border-[#1ed760] focus:outline-none"
              >
                {portfolio?.bankAccounts.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.bankName} ({bank.accountType}) — {formatCurrency(bank.balance, currency)} available
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#8e8e8e]">
                {formatCurrency(purchasePrice, currency)} will be directly debited from this vault upon acquisition.
              </p>
            </div>
          )}

          {/* Rental income toggle */}
          <div className="p-3.5 bg-[#141414] rounded-xl border border-[#383838] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Is this property leased / generating active rental income?
              </span>
              <input
                type="checkbox"
                checked={isRented}
                onChange={e => setIsRented(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1a1a1a] border-[#444] text-[#1ed760] focus:ring-[#1ed760] cursor-pointer"
              />
            </div>

            {isRented && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2a2a2a]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#a0a0a0] mb-1">
                    Monthly Rental Income ({currency})
                  </label>
                  <input
                    type="number"
                    value={monthlyRentalIncome}
                    onChange={e => setMonthlyRentalIncome(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 text-xs bg-[#1a1a1a] text-white font-mono rounded-lg border border-[#444] focus:border-[#1ed760] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#a0a0a0] mb-1">
                    Tenant / Lessee Name
                  </label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={e => setTenantName(e.target.value)}
                    placeholder="e.g. Corporate Tenant / Dr. Vance"
                    className="w-full px-3 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg border border-[#444] focus:border-[#1ed760] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Annual Property Tax ({currency})
              </label>
              <input
                type="number"
                value={annualPropertyTax}
                onChange={e => setAnnualPropertyTax(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Monthly HOA / Maintenance ({currency})
              </label>
              <input
                type="number"
                value={monthlyMaintenance}
                onChange={e => setMonthlyMaintenance(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Linked Mortgage / Loan
            </label>
            <select
              value={linkedMortgageId}
              onChange={e => setLinkedMortgageId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#141414] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none"
            >
              <option value="">No Mortgage (Owned 100% Free & Clear)</option>
              {portfolio?.emis.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({formatCurrency(e.monthlyEmiAmount, currency)}/mo · Balance: {formatCurrency(e.remainingPrincipal, currency)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Property Notes & Specifics
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Master suite balcony, 2-car garage, luxury fittings..."
              className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#707070] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#303030]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#444] hover:border-white text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              {propertyToEdit ? 'Save Property Changes' : 'Acquire Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
