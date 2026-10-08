'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Download,
  Image as ImageIcon,
} from 'lucide-react';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  photos: string[];
  initialIndex?: number;
}

export function PhotoGalleryModal({
  isOpen,
  onClose,
  title,
  subtitle,
  photos,
  initialIndex = 0,
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && photos.length > 1) {
        setCurrentIndex(prev => (prev + 1) % photos.length);
      }
      if (e.key === 'ArrowLeft' && photos.length > 1) {
        setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/92 backdrop-blur-lg select-none">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-[#141414] border border-[#2e2e2e] rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#252525] bg-[#181818]/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">{title}</h3>
              {subtitle && <p className="text-xs text-[#a0a0a0] truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#a0a0a0] px-2.5 py-1 rounded-full bg-[#202020] border border-[#303030]">
              {currentIndex + 1} / {photos.length}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#252525] hover:bg-[#353535] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Stage Image */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhoto}
            alt={`${title} - Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none shadow-2xl rounded-lg"
          />

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer backdrop-blur hover:scale-110 active:scale-95"
                title="Previous photo (Left arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex(prev => (prev + 1) % photos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer backdrop-blur hover:scale-110 active:scale-95"
                title="Next photo (Right arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="px-4 py-3 bg-[#181818] border-t border-[#252525] flex items-center justify-center gap-2 overflow-x-auto shrink-0">
            {photos.map((url, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-16 h-11 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'border-[#1ed760] scale-105 shadow-md'
                      : 'border-[#303030] opacity-60 hover:opacity-100 hover:border-white'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
