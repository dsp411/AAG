'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { PropertyAsset } from '@/types/finance';
import { formatCurrency } from '@/lib/initial-data';
import { PhotoGalleryModal } from '@/components/modals/PhotoGalleryModal';
import {
  Building,
  Plus,
  TrendingUp,
  MapPin,
  Trash2,
  Edit2,
  UserCheck,
  CreditCard,
  Zap,
  Camera,
} from 'lucide-react';

interface PropertiesViewProps {
  openAddPropertyModal: () => void;
  openEditPropertyModal: (property: PropertyAsset) => void;
  openUpgradeModal?: (type: 'car' | 'property' | 'business', id?: string) => void;
}

export function PropertiesView({
  openAddPropertyModal,
  openEditPropertyModal,
  openUpgradeModal,
}: PropertiesViewProps) {
  const { portfolio, updateProperty, deleteProperty } = usePortfolio();
  const [galleryProperty, setGalleryProperty] = useState<PropertyAsset | null>(null);

  if (!portfolio) return null;

  const properties = portfolio.properties;
  const currency = portfolio.user.currency;

  const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0);
  const totalRental = properties
    .filter(p => p.isRented)
    .reduce((sum, p) => sum + p.monthlyRentalIncome, 0);

  const toggleRented = (property: PropertyAsset) => {
    updateProperty({
      ...property,
      isRented: !property.isRented,
    });
  };

  const activeGalleryPhotos: string[] = galleryProperty
    ? (Array.from(new Set([galleryProperty.imageUrl, ...(galleryProperty.photos || [])].filter(Boolean))) as string[])
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Spotify Album-Style Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-emerald-950/70 via-[#181818] to-[#121212] p-6 rounded-lg">
        {/* Cover Art Tile */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-gradient-to-br from-emerald-500 to-teal-900 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0">
          <Building className="w-20 h-20 text-white" />
        </div>

        {/* Header Metadata */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">
            Real Estate Portfolio
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Properties & Land
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3]">
            <span className="text-white font-bold">{portfolio.user.fullName}</span>
            <span>·</span>
            <span>{properties.length} properties</span>
            <span>·</span>
            <span className="font-mono text-[#1ed760] font-bold">
              {formatCurrency(totalValue, currency)} portfolio valuation
            </span>
            <span>·</span>
            <span className="text-[#1ed760] font-bold">
              +{formatCurrency(totalRental, currency)}/mo rental inflow
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-3 px-2 flex-wrap">
        <button
          onClick={openAddPropertyModal}
          className="w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer shrink-0"
          title="Acquire New Real Estate"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={openAddPropertyModal}
          className="px-5 py-2.5 rounded-full bg-white hover:bg-[#eeeeee] active:scale-95 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Acquire Property
        </button>

        {openUpgradeModal && properties.length > 0 && (
          <button
            onClick={() => openUpgradeModal('property')}
            className="px-5 py-2.5 rounded-full bg-[#282828] hover:bg-[#333] active:scale-95 text-[#1ed760] border border-[#1ed760]/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-[#1ed760]" />
            Renovate & Upgrade
          </button>
        )}
      </div>

      {/* Grid of Properties */}
      {properties.length === 0 ? (
        <div className="bg-[#181818] rounded-lg p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#282828] text-[#b3b3b3] flex items-center justify-center mx-auto">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No real estate holdings yet</h3>
          <p className="text-xs text-[#b3b3b3] max-w-sm mx-auto">
            Add residential villas, commercial towers, rental condos, and land. Track capital appreciation and monthly rental yields.
          </p>
          <button
            onClick={openAddPropertyModal}
            className="px-6 py-3 bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Acquire First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {properties.map(prop => {
            const capitalGain = prop.currentValue - prop.purchasePrice;
            const linkedMortgage = portfolio.emis.find(e => e.id === prop.linkedMortgageId);
            const propPhotos = Array.from(
              new Set([prop.imageUrl, ...(prop.photos || [])].filter(Boolean))
            ) as string[];
            const coverPhoto = prop.imageUrl || propPhotos[0];

            return (
              <div
                key={prop.id}
                className="bg-[#181818] hover:bg-[#282828] p-5 rounded-xl transition-all duration-200 group flex flex-col justify-between shadow-md border border-[#262626] hover:border-[#383838]"
              >
                <div>
                  {/* Architectural Photo Showcase Banner */}
                  <div
                    onClick={() => {
                      if (propPhotos.length > 0) {
                        setGalleryProperty(prop);
                      } else {
                        openEditPropertyModal(prop);
                      }
                    }}
                    className="relative aspect-video sm:aspect-[21/9] rounded-lg overflow-hidden mb-4 border border-[#2e2e2e] bg-gradient-to-br from-[#252525] to-[#151515] group/img cursor-pointer"
                    title={propPhotos.length > 0 ? 'Click to view photo gallery' : 'Click to add photos'}
                  >
                    {coverPhoto ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverPhoto}
                          alt={prop.name}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 shadow">
                          <Camera className="w-3.5 h-3.5 text-[#1ed760]" />
                          <span>
                            {propPhotos.length} {propPhotos.length === 1 ? 'photo' : 'photos'}
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 text-[#1ed760] text-[11px] font-bold backdrop-blur-md">
                          {prop.propertyType}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <Building className="w-10 h-10 text-[#666] group-hover/img:text-white transition-colors" />
                        <span className="text-[11px] text-[#888] mt-1.5 group-hover/img:text-[#1ed760] font-semibold flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" /> Add Architectural Photos
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-900 flex items-center justify-center text-white shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{prop.name}</h4>
                        <p className="text-xs text-[#b3b3b3] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#7c7c7c] shrink-0" />
                          <span className="truncate max-w-[200px]">{prop.address}</span>
                          <span>·</span>
                          <span className="text-[#1ed760] font-bold">{prop.propertyType}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-white tabular-nums">
                        {formatCurrency(prop.currentValue, currency)}
                      </div>
                      <div className="text-[11px] font-mono text-[#1ed760] font-bold flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{prop.annualAppreciationRate}%/yr</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Gain Row */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-[#121212] rounded text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] uppercase font-bold block font-sans">Bought</span>
                      <span className="text-white">{formatCurrency(prop.purchasePrice, currency)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] uppercase font-bold block font-sans">Gain</span>
                      <span className="text-[#1ed760] font-bold">+{formatCurrency(capitalGain, currency)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#b3b3b3] uppercase font-bold block font-sans">Tax/HOA</span>
                      <span className="text-[#b3b3b3]">
                        {formatCurrency(prop.annualPropertyTax / 12 + prop.monthlyMaintenance, currency)}/mo
                      </span>
                    </div>
                  </div>

                  {/* Tenant & Rent Status */}
                  <div className="mt-3 p-3 bg-[#121212] rounded flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck
                        className={`w-4 h-4 ${
                          prop.isRented ? 'text-[#1ed760]' : 'text-[#7c7c7c]'
                        }`}
                      />
                      <span className="text-[#b3b3b3]">Tenant:</span>
                      <span className="font-bold text-white">
                        {prop.isRented ? prop.tenantName || 'Active Tenant' : 'Vacant Unit'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {prop.isRented && (
                        <span className="font-mono text-[#1ed760] font-bold">
                          +{formatCurrency(prop.monthlyRentalIncome, currency)}/mo
                        </span>
                      )}
                      <button
                        onClick={() => toggleRented(prop)}
                        className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                          prop.isRented
                            ? 'border border-[#4d4d4d] text-[#b3b3b3] hover:text-white'
                            : 'bg-[#1ed760] text-black'
                        }`}
                      >
                        {prop.isRented ? 'Vacant' : 'Mark Leased'}
                      </button>
                    </div>
                  </div>

                  {linkedMortgage && (
                    <div className="mt-2 p-2.5 bg-[#121212] rounded text-xs text-[#f3727f] flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1.5 truncate">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Mortgage: {linkedMortgage.name}</span>
                      </span>
                      <span>-{formatCurrency(linkedMortgage.monthlyEmiAmount, currency)}/mo</span>
                    </div>
                  )}

                  {prop.notes && (
                    <p className="text-[11px] text-[#a0a0a0] italic mt-2.5 line-clamp-2">
                      &ldquo;{prop.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#282828]">
                  <div className="flex items-center gap-2">
                    {openUpgradeModal && (
                      <button
                        onClick={() => openUpgradeModal('property', prop.id)}
                        className="text-[11px] text-[#1ed760] hover:text-[#3be477] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        title="Renovate or add luxury amenities"
                      >
                        <Zap className="w-3 h-3 fill-[#1ed760]" />
                        Renovate
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (propPhotos.length > 0) {
                          setGalleryProperty(prop);
                        } else {
                          openEditPropertyModal(prop);
                        }
                      }}
                      className="text-[11px] text-[#a0a0a0] hover:text-[#1ed760] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      title={propPhotos.length > 0 ? 'View photos' : 'Add photo'}
                    >
                      <Camera className="w-3 h-3" />
                      <span>{propPhotos.length > 0 ? 'Photos' : 'Add Photo'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditPropertyModal(prop)}
                      className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#333333] transition-colors cursor-pointer"
                      title="Edit property details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProperty(prop.id)}
                      className="p-1.5 text-[#b3b3b3] hover:text-[#f3727f] rounded-full hover:bg-[#333333] transition-colors cursor-pointer"
                      title="Delete property"
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
      {galleryProperty && (
        <PhotoGalleryModal
          key={galleryProperty.id}
          isOpen={!!galleryProperty}
          onClose={() => setGalleryProperty(null)}
          title={galleryProperty.name}
          subtitle={`${galleryProperty.address} · ${galleryProperty.propertyType}`}
          photos={activeGalleryPhotos}
        />
      )}
    </div>
  );
}
