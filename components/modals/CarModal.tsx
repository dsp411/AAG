'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { CarAsset, VehicleType, VehicleCondition } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import { PhotoPicker } from '../PhotoPicker';
import {
  X,
  Car,
  Plane,
  Ship,
  Bike,
  Sparkles,
  DollarSign,
  Landmark,
  Percent,
  Compass,
} from 'lucide-react';

interface CarModalProps {
  isOpen: boolean;
  onClose: () => void;
  carToEdit?: CarAsset | null;
}

const VEHICLE_CATEGORIES: { id: VehicleType; label: string; icon: any }[] = [
  { id: 'car', label: 'Car / Luxury Sedan', icon: Car },
  { id: 'supercar', label: 'Supercar / Exotic', icon: Sparkles },
  { id: 'jet', label: 'Private Jet', icon: Plane },
  { id: 'plane', label: 'Prop Airplane', icon: Plane },
  { id: 'yacht', label: 'Luxury Yacht', icon: Ship },
  { id: 'superyacht', label: 'Superyacht', icon: Ship },
  { id: 'bike', label: 'Superbike / Motorcycle', icon: Bike },
  { id: 'helicopter', label: 'Helicopter', icon: Compass },
  { id: 'commercial', label: 'Commercial Fleet', icon: Car },
];

export function CarModal({ isOpen, onClose, carToEdit }: CarModalProps) {
  const { addCar, updateCar, portfolio } = usePortfolio();

  const [name, setName] = useState(() => carToEdit?.name || '');
  const [vehicleType, setVehicleType] = useState<VehicleType>(() => carToEdit?.vehicleType || 'car');
  const [condition, setCondition] = useState<VehicleCondition>(() => carToEdit?.condition || 'Brand New');
  const [make, setMake] = useState(() => carToEdit?.make || '');
  const [model, setModel] = useState(() => carToEdit?.model || '');
  const [year, setYear] = useState(() => carToEdit?.year || 2024);
  const [licensePlate, setLicensePlate] = useState(() => carToEdit?.licensePlate || '');
  const [purchasePrice, setPurchasePrice] = useState<number>(() => carToEdit?.purchasePrice || 85000);
  const [currentValue, setCurrentValue] = useState<number>(() => carToEdit?.currentValue || 85000);
  const [annualDepreciationRate, setAnnualDepreciationRate] = useState<number>(
    () => carToEdit?.annualDepreciationRate ?? 10
  );
  const [interestRateYearly, setInterestRateYearly] = useState<number>(
    () => carToEdit?.interestRateYearly ?? 5.5
  );
  const [monthlyInsuranceCost, setMonthlyInsuranceCost] = useState<number>(
    () => carToEdit?.monthlyInsuranceCost ?? 280
  );
  const [purchasedFromBankId, setPurchasedFromBankId] = useState<string>(
    () => carToEdit?.purchasedFromBankId || portfolio?.bankAccounts[0]?.id || ''
  );
  const [linkedLoanId, setLinkedLoanId] = useState<string>(() => carToEdit?.linkedLoanId || '');
  const [imageUrl, setImageUrl] = useState<string>(() => carToEdit?.imageUrl || '');
  const [photos, setPhotos] = useState<string[]>(() => carToEdit?.photos || (carToEdit?.imageUrl ? [carToEdit.imageUrl] : []));
  const [notes, setNotes] = useState(() => carToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currency = portfolio?.user.currency || 'USD';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Vehicle name is required.');
      return;
    }

    const primaryImage = imageUrl.trim() || (photos[0] ? photos[0].trim() : undefined);
    const validPhotos = photos.length > 0 ? photos : (primaryImage ? [primaryImage] : undefined);

    if (carToEdit) {
      updateCar({
        ...carToEdit,
        name: name.trim(),
        vehicleType,
        condition,
        make: make.trim() || 'Custom',
        model: model.trim() || 'Vehicle',
        year: Number(year),
        licensePlate: licensePlate.trim() || undefined,
        purchasePrice: Number(purchasePrice),
        currentValue: Number(currentValue),
        annualDepreciationRate: Number(annualDepreciationRate),
        interestRateYearly: Number(interestRateYearly),
        monthlyInsuranceCost: Number(monthlyInsuranceCost),
        purchasedFromBankId: purchasedFromBankId || undefined,
        linkedLoanId: linkedLoanId || undefined,
        imageUrl: primaryImage,
        photos: validPhotos,
        notes: notes.trim() || undefined,
      });
      onClose();
    } else {
      const res = addCar({
        name: name.trim(),
        vehicleType,
        condition,
        make: make.trim() || 'Custom',
        model: model.trim() || 'Vehicle',
        year: Number(year),
        licensePlate: licensePlate.trim() || undefined,
        purchasePrice: Number(purchasePrice),
        currentValue: Number(currentValue),
        annualDepreciationRate: Number(annualDepreciationRate),
        interestRateYearly: Number(interestRateYearly),
        monthlyInsuranceCost: Number(monthlyInsuranceCost),
        purchasedFromBankId: purchasedFromBankId || undefined,
        linkedLoanId: linkedLoanId || undefined,
        imageUrl: primaryImage,
        photos: validPhotos,
        notes: notes.trim() || undefined,
      });

      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to add vehicle');
        return;
      }
      onClose();
    }
  };

  const selectedBank = portfolio?.bankAccounts.find(b => b.id === purchasedFromBankId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#202020] border border-[#383838] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030] bg-[#181818] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 flex items-center justify-center text-[#1ed760]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {carToEdit ? 'Edit Fleet Asset' : 'Acquire New Fleet Asset (Car, Jet, Yacht, Bike)'}
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                Configure vehicle specifications, condition, depreciation, and realistic bank deduction.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#282828] hover:bg-[#383838] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-3 p-3 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl font-medium shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Vehicle Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VEHICLE_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = vehicleType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setVehicleType(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#1ed760]/15 border-[#1ed760] text-white shadow-md'
                        : 'bg-[#141414] border-[#303030] text-[#a0a0a0] hover:text-white hover:border-[#444]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#1ed760]' : 'text-[#888]'}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condition Selector: Brand New vs Second Hand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Condition *
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#141414] p-1 rounded-xl border border-[#303030]">
                <button
                  type="button"
                  onClick={() => {
                    setCondition('Brand New');
                    if (!carToEdit) setAnnualDepreciationRate(12);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    condition === 'Brand New'
                      ? 'bg-[#1ed760] text-black shadow-sm'
                      : 'text-[#a0a0a0] hover:text-white'
                  }`}
                >
                  Brand New
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCondition('Second Hand');
                    if (!carToEdit) setAnnualDepreciationRate(6);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    condition === 'Second Hand'
                      ? 'bg-[#1ed760] text-black shadow-sm'
                      : 'text-[#a0a0a0] hover:text-white'
                  }`}
                >
                  Second Hand
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Vehicle Name / Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Gulfstream G280 or Porsche 911"
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white placeholder-[#666] rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Make, Model, Year */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Make / Manufacturer
              </label>
              <input
                type="text"
                value={make}
                onChange={e => setMake(e.target.value)}
                placeholder="e.g. Gulfstream / Porsche"
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white placeholder-[#666] rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Model / Trim
              </label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. G280 / GT3"
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white placeholder-[#666] rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
          </div>

          {/* Photo Picker */}
          <PhotoPicker
            label="Vehicle Photos & Fleet Gallery"
            category="vehicle"
            imageUrl={imageUrl}
            photos={photos}
            onChangeCover={setImageUrl}
            onChangePhotos={setPhotos}
          />

          {/* Financials: Purchase Price & Valuation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Purchase Price ({currency}) *
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white font-mono font-bold rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Current Asset Valuation ({currency}) *
              </label>
              <input
                type="number"
                value={currentValue}
                onChange={e => setCurrentValue(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white font-mono font-bold rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Depreciation & Rate of Interest */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Depreciation Rate (%/yr)
              </label>
              <input
                type="number"
                step="0.1"
                value={annualDepreciationRate}
                onChange={e => setAnnualDepreciationRate(Number(e.target.value))}
                placeholder="e.g. 10 (or -3 for classic)"
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Rate of Interest (% p.a.)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRateYearly}
                onChange={e => setInterestRateYearly(Number(e.target.value))}
                placeholder="e.g. 5.5"
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Monthly Insurance/Hangar ($)
              </label>
              <input
                type="number"
                value={monthlyInsuranceCost}
                onChange={e => setMonthlyInsuranceCost(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white font-mono rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
          </div>

          {/* REALISTIC BANK ACCOUNT DEDUCTION SELECTOR */}
          {!carToEdit && (
            <div className="p-3.5 bg-[#161616] border border-[#2e2e2e] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1ed760] uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" />
                  <span>Deduct Purchase Amount From Bank</span>
                </label>
                {selectedBank && (
                  <span className="text-[11px] font-mono text-[#a0a0a0]">
                    Available: {formatCurrency(selectedBank.balance, currency)}
                  </span>
                )}
              </div>
              <select
                value={purchasedFromBankId}
                onChange={e => setPurchasedFromBankId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#121212] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer font-mono"
              >
                <option value="">No Direct Cash Deduction (Financed by Auto/Aviation Loan)</option>
                {portfolio?.bankAccounts.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} — Balance: {formatCurrency(b.balance, b.currency)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#888]">
                Real-life transaction engine: {formatCurrency(purchasePrice, currency)} will be deducted from your bank and recorded in your ledger.
              </p>
            </div>
          )}

          {/* License plate and linked loan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Registration / Tail / Hull Number
              </label>
              <input
                type="text"
                value={licensePlate}
                onChange={e => setLicensePlate(e.target.value)}
                placeholder="e.g. N882AE or M-DUBAI-76"
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Linked Loan / Mortgage EMI
              </label>
              <select
                value={linkedLoanId}
                onChange={e => setLinkedLoanId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none cursor-pointer"
              >
                <option value="">No Linked Loan (Owned Outright)</option>
                {portfolio?.emis.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} (${e.monthlyEmiAmount}/mo)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Specifications & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Flight range, berth location, interior trim, garage location..."
              className="w-full p-3 text-xs bg-[#141414] text-white rounded-xl border border-[#303030] focus:border-[#1ed760] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#303030]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{carToEdit ? 'Save Fleet Specs' : 'Acquire Vehicle Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SellCarModal({
  isOpen,
  onClose,
  car,
}: {
  isOpen: boolean;
  onClose: () => void;
  car: CarAsset | null;
}) {
  const { sellCar, portfolio } = usePortfolio();
  const [salePrice, setSalePrice] = useState<number>(() => car?.currentValue || 50000);
  const [depositBankId, setDepositBankId] = useState<string>(
    () => portfolio?.bankAccounts[0]?.id || ''
  );

  if (!isOpen || !car) return null;

  const currency = portfolio?.user.currency || 'USD';

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    sellCar(car.id, salePrice, depositBankId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-[#202020] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030] bg-[#181818]">
          <h3 className="text-base font-bold text-white">Liquidate Asset: {car.name}</h3>
          <button onClick={onClose} className="text-[#b3b3b3] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSell} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Agreed Sale Price ({currency})
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={e => setSalePrice(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white font-mono font-bold rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Deposit Funds Into
            </label>
            <select
              value={depositBankId}
              onChange={e => setDepositBankId(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer"
            >
              {portfolio?.bankAccounts.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bankName} (Current: {formatCurrency(b.balance, b.currency)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#303030]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#b3b3b3] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Complete Sale & Deposit Cash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
