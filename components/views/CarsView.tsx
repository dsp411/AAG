'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { CarAsset } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import { PhotoGalleryModal } from '@/components/modals/PhotoGalleryModal';
import {
  Car,
  Plus,
  Trash2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Edit2,
  CreditCard,
  Zap,
  Camera,
  Images,
} from 'lucide-react';

interface CarsViewProps {
  openAddCarModal: () => void;
  openSellCarModal: (car: CarAsset) => void;
  openEditCarModal: (car: CarAsset) => void;
  openUpgradeModal?: (type: 'car' | 'property' | 'business', id?: string) => void;
}

export function CarsView({
  openAddCarModal,
  openSellCarModal,
  openEditCarModal,
  openUpgradeModal,
}: CarsViewProps) {
  const { portfolio, deleteCar } = usePortfolio();
  const [galleryCar, setGalleryCar] = useState<CarAsset | null>(null);

  if (!portfolio) return null;

  const cars = portfolio.cars;
  const currency = portfolio.user.currency;

  const totalCarValue = cars.reduce((sum, c) => sum + c.currentValue, 0);
  const totalMonthlyInsurance = cars.reduce((sum, c) => sum + c.monthlyInsuranceCost, 0);

  const activeGalleryPhotos: string[] = galleryCar
    ? (Array.from(new Set([galleryCar.imageUrl, ...(galleryCar.photos || [])].filter(Boolean))) as string[])
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Spotify Album-Style Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-emerald-950/60 via-[#181818] to-[#121212] p-6 rounded-lg">
        {/* Cover Art Tile */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-gradient-to-br from-emerald-700 to-zinc-950 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0">
          <Car className="w-20 h-20 text-white" />
        </div>

        {/* Album Metadata */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
            Curated Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Vehicle Fleet
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3]">
            <span className="text-white font-bold">{portfolio.user.fullName}</span>
            <span>·</span>
            <span>{cars.length} vehicles</span>
            <span>·</span>
            <span className="font-mono text-[#1ed760] font-bold">
              {formatCurrency(totalCarValue, currency)} total valuation
            </span>
            <span>·</span>
            <span>Insurance: {formatCurrency(totalMonthlyInsurance, currency)}/mo</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-3 px-2 flex-wrap">
        <button
          onClick={openAddCarModal}
          className="w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer shrink-0"
          title="Acquire New Vehicle"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={openAddCarModal}
          className="px-5 py-2.5 rounded-full bg-white hover:bg-[#eeeeee] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Acquire Vehicle
        </button>

        {openUpgradeModal && cars.length > 0 && (
          <button
            onClick={() => openUpgradeModal('car')}
            className="px-5 py-2.5 rounded-full bg-[#282828] hover:bg-[#333] active:scale-95 text-[#1ed760] border border-[#1ed760]/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-[#1ed760]" />
            Upgrade / Tune Fleet
          </button>
        )}
      </div>

      {/* Grid of Cars */}
      {cars.length === 0 ? (
        <div className="bg-[#181818] rounded-lg p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#282828] text-[#b3b3b3] flex items-center justify-center mx-auto">
            <Car className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your garage is currently empty</h3>
          <p className="text-xs text-[#b3b3b3] max-w-sm mx-auto">
            Acquire your daily drivers, electric vehicles, planes, and yachts. Purchase price is automatically deducted from your bank vault.
          </p>
          <button
            onClick={openAddCarModal}
            className="px-6 py-3 bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Acquire First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cars.map(car => {
            const isAppreciating = car.annualDepreciationRate < 0;
            const linkedLoan = portfolio.emis.find(e => e.id === car.linkedLoanId);
            const carPhotos = Array.from(
              new Set([car.imageUrl, ...(car.photos || [])].filter(Boolean))
            ) as string[];
            const coverPhoto = car.imageUrl || carPhotos[0];

            return (
              <div
                key={car.id}
                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition-all duration-200 group flex flex-col justify-between shadow-md border border-[#262626] hover:border-[#383838]"
              >
                <div>
                  {/* Vehicle Card Header Photo Tile */}
                  <div
                    onClick={() => {
                      if (carPhotos.length > 0) {
                        setGalleryCar(car);
                      } else {
                        openEditCarModal(car);
                      }
                    }}
                    className="relative aspect-video rounded-lg bg-gradient-to-br from-[#2a2a2a] via-[#1e1e1e] to-black flex items-center justify-center mb-4 overflow-hidden border border-[#282828] group/img cursor-pointer"
                    title={carPhotos.length > 0 ? 'Click to view photo gallery' : 'Click to add vehicle photos'}
                  >
                    {coverPhoto ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverPhoto}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />

                        {/* Photo count indicator pill */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow">
                          <Camera className="w-3 h-3 text-[#1ed760]" />
                          <span>
                            {carPhotos.length} {carPhotos.length === 1 ? 'photo' : 'photos'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Car className="w-10 h-10 text-[#666] group-hover/img:text-white transition-colors" />
                        <span className="text-[10px] text-[#888] mt-1 group-hover/img:text-[#1ed760] font-semibold flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Add Photo
                        </span>
                      </div>
                    )}

                    {/* Circular Sell Action Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openSellCarModal(car);
                      }}
                      className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-[0_8px_8px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 cursor-pointer z-10"
                      title="Sell & Liquidate to Bank"
                    >
                      <DollarSign className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  <h3 className="text-white font-bold text-sm truncate">{car.name}</h3>
                  <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                    {car.year} · {car.make} {car.model}
                    {car.licensePlate && ` · ${car.licensePlate}`}
                  </p>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-base font-bold font-mono text-white tabular-nums">
                      {formatCurrency(car.currentValue, currency)}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${
                        isAppreciating ? 'text-[#1ed760]' : 'text-[#b3b3b3]'
                      }`}
                    >
                      {isAppreciating ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-[#1ed760]" />
                          <span>+{Math.abs(car.annualDepreciationRate)}%/yr</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-[#b3b3b3]" />
                          <span>-{car.annualDepreciationRate}%/yr</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Details stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#282828] text-[11px]">
                    <div>
                      <span className="text-[#b3b3b3] block">Bought:</span>
                      <span className="text-white font-mono">{formatCurrency(car.purchasePrice, currency)}</span>
                    </div>
                    <div>
                      <span className="text-[#b3b3b3] block">Insurance:</span>
                      <span className="text-white font-mono">{formatCurrency(car.monthlyInsuranceCost, currency)}/mo</span>
                    </div>
                  </div>

                  {linkedLoan && (
                    <div className="mt-2 p-2 bg-[#121212] rounded text-[11px] text-[#f3727f] flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1 truncate">
                        <CreditCard className="w-3 h-3 shrink-0" />
                        <span className="truncate">{linkedLoan.name}</span>
                      </span>
                      <span>-{formatCurrency(linkedLoan.monthlyEmiAmount, currency)}/mo</span>
                    </div>
                  )}

                  {car.notes && (
                    <p className="text-[11px] text-[#a0a0a0] italic mt-2 line-clamp-2">
                      &ldquo;{car.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#282828]">
                  <div className="flex items-center gap-2">
                    {openUpgradeModal && (
                      <button
                        onClick={() => openUpgradeModal('car', car.id)}
                        className="text-[11px] text-[#1ed760] hover:text-[#3be477] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        title="Upgrade vehicle performance, interior or armor"
                      >
                        <Zap className="w-3 h-3 fill-[#1ed760]" />
                        Upgrade
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (carPhotos.length > 0) {
                          setGalleryCar(car);
                        } else {
                          openEditCarModal(car);
                        }
                      }}
                      className="text-[11px] text-[#a0a0a0] hover:text-[#1ed760] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      title={carPhotos.length > 0 ? 'View photos' : 'Add photo'}
                    >
                      <Camera className="w-3 h-3" />
                      <span>{carPhotos.length > 0 ? 'Photos' : 'Add Photo'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCarModal(car)}
                      className="p-1.5 text-[#b3b3b3] hover:text-white rounded hover:bg-[#333] transition-colors cursor-pointer"
                      title="Edit vehicle details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCar(car.id)}
                      className="p-1.5 text-[#b3b3b3] hover:text-rose-400 rounded hover:bg-[#333] transition-colors cursor-pointer"
                      title="Delete vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Photo Gallery Modal */}
      {galleryCar && (
        <PhotoGalleryModal
          key={galleryCar.id}
          isOpen={!!galleryCar}
          onClose={() => setGalleryCar(null)}
          title={galleryCar.name}
          subtitle={`${galleryCar.year} ${galleryCar.make} ${galleryCar.model} · ${galleryCar.vehicleType || 'Vehicle'}`}
          photos={activeGalleryPhotos}
        />
      )}
    </div>
  );
}
