'use client';

import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Link as LinkIcon,
  Sparkles,
  X,
  Check,
  Star,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { compressImage } from '@/lib/image-utils';

export interface PhotoPreset {
  id: string;
  name: string;
  url: string;
  tag: string;
}

export const VEHICLE_PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'porsche_911',
    name: 'Porsche 911 GT3 Shark Blue',
    url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Supercar',
  },
  {
    id: 'supercar_black',
    name: 'Stealth Matte Black Exotic',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    tag: 'Supercar',
  },
  {
    id: 'supercar_red',
    name: 'Rosso Performance Hypercar',
    url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hypercar',
  },
  {
    id: 'tesla_plaid',
    name: 'Tesla Model S Plaid / Electric GT',
    url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    tag: 'Electric',
  },
  {
    id: 'suv_gwagon',
    name: 'Matte Black Luxury G-Wagon',
    url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1200&q=80',
    tag: 'Luxury SUV',
  },
  {
    id: 'luxury_sedan',
    name: 'Executive Maybach / S-Class',
    url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Executive',
  },
  {
    id: 'private_jet',
    name: 'Gulfstream Transcontinental Jet',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    tag: 'Private Jet',
  },
  {
    id: 'luxury_yacht',
    name: 'Sunseeker Oceanfront Superyacht',
    url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    tag: 'Superyacht',
  },
  {
    id: 'superbike',
    name: 'Ducati Panigale Track Superbike',
    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    tag: 'Superbike',
  },
];

export const PROPERTY_PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'waterfront_penthouse',
    name: 'Waterfront Sky Penthouse',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    tag: 'Penthouse',
  },
  {
    id: 'modern_mansion',
    name: 'Bellevue Waterfront Luxury Villa',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Luxury Villa',
  },
  {
    id: 'infinity_pool_estate',
    name: 'Infinity Pool Mediterranean Estate',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Resort Estate',
  },
  {
    id: 'austin_loft',
    name: 'Austin Modern Tech Commercial Loft',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    tag: 'Commercial Loft',
  },
  {
    id: 'highrise_condo',
    name: 'Downtown Architectural High-Rise',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    tag: 'Condo',
  },
  {
    id: 'commercial_tower',
    name: 'Corporate Financial Tower',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    tag: 'Corporate',
  },
  {
    id: 'coastal_beach_house',
    name: 'Miami Oceanfront Beach Villa',
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    tag: 'Beachfront',
  },
  {
    id: 'modern_interior',
    name: 'Minimalist Architectural Interior',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    tag: 'Interior',
  },
];

export interface PhotoPickerProps {
  label?: string;
  category: 'vehicle' | 'property';
  imageUrl?: string;
  photos?: string[];
  onChange?: (url: string) => void;
  onChangeCover?: (url: string) => void;
  onChangePhotos?: (photos: string[]) => void;
}

export function PhotoPicker({
  label = 'Asset Photos & Imagery',
  category,
  imageUrl = '',
  photos = [],
  onChange,
  onChangeCover,
  onChangePhotos,
}: PhotoPickerProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute unified list of photos
  const currentCover = imageUrl || (photos.length > 0 ? photos[0] : '');
  const allPhotos: string[] = Array.from(
    new Set([currentCover, ...photos].filter(Boolean))
  );

  const presets = category === 'vehicle' ? VEHICLE_PHOTO_PRESETS : PROPERTY_PHOTO_PRESETS;

  // Helper to commit cover changes
  const handleSetCover = (url: string) => {
    if (onChangeCover) {
      onChangeCover(url);
    } else if (onChange) {
      onChange(url);
    }
  };

  // Helper to commit photos changes
  const handleUpdatePhotosList = (newPhotos: string[]) => {
    if (onChangePhotos) {
      onChangePhotos(newPhotos);
    }
    // If current cover is removed or empty, make first item cover
    if (!newPhotos.includes(currentCover)) {
      handleSetCover(newPhotos[0] || '');
    }
  };

  // Add photo to collection
  const handleAddPhoto = (url: string) => {
    if (!url) return;
    const trimmed = url.trim();
    if (!allPhotos.includes(trimmed)) {
      const nextPhotos = [...allPhotos, trimmed];
      handleUpdatePhotosList(nextPhotos);
      if (!currentCover) {
        handleSetCover(trimmed);
      }
    } else if (!currentCover) {
      handleSetCover(trimmed);
    }
  };

  // Remove photo from collection
  const handleRemovePhoto = (urlToRemove: string) => {
    const nextPhotos = allPhotos.filter(u => u !== urlToRemove);
    handleUpdatePhotosList(nextPhotos);
    if (currentCover === urlToRemove) {
      handleSetCover(nextPhotos[0] || '');
    }
  };

  // Handle uploaded files
  const processFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    setIsProcessing(true);
    const addedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }
        // Compress to keep local storage performant
        const compressed = await compressImage(file, 1280, 960, 0.82);
        addedUrls.push(compressed);
      }

      if (addedUrls.length === 0) {
        setUploadError('Please select valid image files (JPG, PNG, WebP).');
      } else {
        const merged = Array.from(new Set([...allPhotos, ...addedUrls]));
        handleUpdatePhotosList(merged);
        if (!currentCover) {
          handleSetCover(addedUrls[0]);
        }
      }
    } catch {
      setUploadError('Unable to process photo. Please try a different image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      handleAddPhoto(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

  return (
    <div className="space-y-3.5 p-4 bg-[#141414] border border-[#303030] rounded-xl select-none">
      {/* Header with photo count */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#1ed760]" />
          <span>{label}</span>
          {allPhotos.length > 0 && (
            <span className="ml-1 text-[11px] font-mono text-[#1ed760] bg-[#1ed760]/10 px-2 py-0.5 rounded-full border border-[#1ed760]/30 font-bold">
              {allPhotos.length} {allPhotos.length === 1 ? 'photo' : 'photos'}
            </span>
          )}
        </label>

        {allPhotos.length > 0 && (
          <button
            type="button"
            onClick={() => {
              handleUpdatePhotosList([]);
              handleSetCover('');
            }}
            className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Cover Photo Showcase */}
      {currentCover ? (
        <div className="space-y-2">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#383838] bg-black group shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentCover}
              alt="Primary Cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Cover Badge Overlay */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#1ed760]/40 text-[#1ed760] text-[11px] font-bold shadow-md">
              <Star className="w-3 h-3 fill-[#1ed760]" />
              <span>Primary Cover Photo</span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <span className="text-xs font-semibold text-white">Featured in Garage & Listings</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(currentCover)}
                  className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold backdrop-blur-sm flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  Expand
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(currentCover)}
                  className="px-2.5 py-1 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white text-[11px] font-bold shadow cursor-pointer"
                >
                  Remove Cover
                </button>
              </div>
            </div>
          </div>

          {/* Photo Gallery Thumbnail Strip */}
          {allPhotos.length > 1 && (
            <div>
              <p className="text-[11px] font-semibold text-[#a0a0a0] mb-1.5 flex items-center justify-between">
                <span>Gallery Photos ({allPhotos.length})</span>
                <span className="text-[10px] text-[#707070]">Click star to set as cover</span>
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                {allPhotos.map((url, idx) => {
                  const isCover = url === currentCover;
                  return (
                    <div
                      key={idx}
                      className={`relative w-20 h-14 shrink-0 rounded-lg overflow-hidden border group transition-all cursor-pointer ${
                        isCover
                          ? 'border-[#1ed760] ring-2 ring-[#1ed760]/40'
                          : 'border-[#383838] hover:border-white'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      {isCover && (
                        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#1ed760] text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleSetCover(url);
                            }}
                            className="p-1 rounded bg-[#1ed760] text-black hover:scale-110 transition-transform"
                            title="Set as Cover"
                          >
                            <Star className="w-2.5 h-2.5 fill-black" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleRemovePhoto(url);
                          }}
                          className="p-1 rounded bg-rose-600 text-white hover:scale-110 transition-transform"
                          title="Remove Photo"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 text-center rounded-xl border border-dashed border-[#383838] bg-[#1a1a1a]">
          <Camera className="w-6 h-6 text-[#707070] mx-auto mb-1" />
          <p className="text-xs text-[#b3b3b3] font-medium">No photo attached yet</p>
          <p className="text-[11px] text-[#707070]">Choose from curated presets, upload from device, or paste a URL below</p>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="pt-2 border-t border-[#262626]">
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-[#1ed760] text-black shadow-md'
                : 'bg-[#202020] text-[#a0a0a0] hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Curated Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#1ed760] text-black shadow-md'
                : 'bg-[#202020] text-[#a0a0a0] hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload From Device</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#1ed760] text-black shadow-md'
                : 'bg-[#202020] text-[#a0a0a0] hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Tab 1: Presets Gallery */}
        {activeTab === 'presets' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#8e8e8e]">
                Click any preset to add to photos:
              </span>
              <span className="text-[10px] text-[#666]">Instant preview</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {presets.map(p => {
                const isAttached = allPhotos.includes(p.url);
                const isCover = currentCover === p.url;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddPhoto(p.url)}
                    className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                      isCover
                        ? 'border-[#1ed760] ring-1 ring-[#1ed760]'
                        : isAttached
                        ? 'border-[#3be477]/60'
                        : 'border-[#303030] hover:border-[#1ed760]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-between p-2">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-[#1ed760] border border-[#1ed760]/30 backdrop-blur-sm">
                          {p.tag}
                        </span>
                        {isCover && (
                          <span className="w-4 h-4 rounded-full bg-[#1ed760] text-black flex items-center justify-center">
                            <Star className="w-2.5 h-2.5 fill-black" />
                          </span>
                        )}
                        {!isCover && isAttached && (
                          <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-white truncate drop-shadow">
                        {p.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Files / Drag & Drop */}
        {activeTab === 'upload' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#1ed760] bg-[#1ed760]/10'
                : 'border-[#383838] hover:border-[#1ed760]/60 bg-[#1a1a1a]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            {isProcessing ? (
              <div className="py-2 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 text-[#1ed760] animate-spin" />
                <p className="text-xs text-[#1ed760] font-bold">Optimizing and compressing photo...</p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-[#282828] text-[#1ed760] flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white">Click to browse or drag & drop photos here</p>
                <p className="text-[11px] text-[#8e8e8e] mt-1">
                  Supports multiple JPG, PNG, WEBP files from your computer or smartphone camera
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#252525] text-[#1ed760] text-[11px] font-bold">
                  <Plus className="w-3 h-3" />
                  Select Multiple Photos
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Paste Direct URL */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={e => setCustomUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... or any web photo URL"
                className="flex-1 px-3.5 py-2.5 text-xs bg-[#1a1a1a] text-white placeholder-[#707070] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!customUrlInput.trim()}
                className="px-4 py-2.5 bg-[#1ed760] hover:bg-[#3be477] disabled:opacity-50 text-black text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>
            <p className="text-[11px] text-[#777]">
              Enter any direct image link to add it to your vehicle or property gallery.
            </p>
          </div>
        )}
      </div>

      {/* Expanded Modal Preview Lightbox */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden bg-[#181818] border border-[#383838] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhotoUrl}
              alt="Expanded Preview"
              className="max-w-full max-h-[75vh] object-contain mx-auto"
            />
            <div className="p-3 bg-[#121212] flex items-center justify-between border-t border-[#262626]">
              <span className="text-xs text-[#a0a0a0]">High-Resolution Asset Preview</span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="px-3 py-1 rounded-full bg-[#282828] hover:bg-[#383838] text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
