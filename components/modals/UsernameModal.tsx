'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { validateAppUsername, sanitizeAppUsername } from '@/lib/username-rules';
import {
  X,
  AtSign,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsernameModal({ isOpen, onClose }: UsernameModalProps) {
  const { currentUser, allUsers, updateUserProfile } = usePortfolio();
  const [usernameInput, setUsernameInput] = useState(() => currentUser?.username || '');
  const [fullNameInput, setFullNameInput] = useState(() => currentUser?.fullName || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !currentUser) return null;

  const otherUsernames = allUsers
    .filter(u => u.username.toLowerCase() !== currentUser.username.toLowerCase())
    .map(u => u.username);

  const validation = validateAppUsername(usernameInput, otherUsernames, currentUser.username);

  const handleSave = () => {
    setErrorMsg(null);

    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || 'Please enter a valid unique username.');
      return;
    }

    const cleanHandle = validation.normalized;
    updateUserProfile({
      username: cleanHandle,
      fullName: fullNameInput.trim() || currentUser.fullName,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#181818] border border-[#2e2e2e] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#282828] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760]">
              <AtSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Make / Change Your Username
              </h2>
              <p className="text-xs text-[#a7a7a7]">
                3-10 letters or numbers combinations used to find you and send messages & money
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#888] hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Display Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3]">
              Full Display Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={fullNameInput}
                onChange={e => setFullNameInput(e.target.value)}
                placeholder="Your Name"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#121212] border border-[#333] focus:border-[#1ed760] rounded-xl text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3]">
                Unique Username Handle
              </label>
              <span className="text-[11px] font-mono text-[#888]">
                {usernameInput.length}/10 chars
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1ed760]">
                <AtSign className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(sanitizeAppUsername(e.target.value))}
                placeholder="e.g. davis99"
                maxLength={10}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-[#121212] border rounded-xl text-sm text-white focus:outline-none transition-colors font-mono ${
                  usernameInput.length === 0
                    ? 'border-[#333] focus:border-[#1ed760]'
                    : validation.isValid
                    ? 'border-[#1ed760] focus:border-[#1ed760]'
                    : 'border-rose-500/70 focus:border-rose-400'
                }`}
                autoFocus
              />
            </div>

            {/* Validation Feedback */}
            {usernameInput.length > 0 && (
              <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-white font-bold">@{validation.normalized}</span>
                  {validation.isValid ? (
                    <span className="text-[#1ed760] flex items-center gap-1 font-bold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      Available & Ready
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-bold text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validation.errorMessage}
                    </span>
                  )}
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#888] pt-1.5 border-t border-[#222]">
                  <span className={validation.rules.noSpaces ? 'text-[#1ed760]' : 'text-rose-400'}>
                    {validation.rules.noSpaces ? '✓' : '✗'} No spaces
                  </span>
                  <span className={validation.rules.validLength ? 'text-[#1ed760]' : 'text-rose-400'}>
                    {validation.rules.validLength ? '✓' : '✗'} 3-10 characters
                  </span>
                  <span className={validation.rules.validChars ? 'text-[#1ed760]' : 'text-rose-400'}>
                    {validation.rules.validChars ? '✓' : '✗'} Letters & numbers only
                  </span>
                  <span className={validation.rules.isAvailable ? 'text-[#1ed760]' : 'text-rose-400'}>
                    {validation.rules.isAvailable ? '✓' : '✗'} Unique handle
                  </span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="text-xs text-rose-400 flex items-center gap-1.5 font-medium mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#888]">
            <ShieldCheck className="w-4 h-4 text-[#1ed760]" />
            <span>Instantly synced</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!validation.isValid || isSaved}
              className="px-5 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] active:scale-95 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Set Username</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
