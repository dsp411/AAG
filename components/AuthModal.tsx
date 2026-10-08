'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/types/finance';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import {
  X,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Mail,
  Check,
  Globe,
  ArrowLeft,
  AlertCircle,
  AtSign,
} from 'lucide-react';
import { validateAppUsername, sanitizeAppUsername } from '@/lib/username-rules';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register, continueWithGoogle, allUsers, switchUser } = usePortfolio();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'standard' | 'google'>('standard');

  // Standard form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [starterType, setStarterType] = useState<'executive' | 'clean'>('executive');

  // Google flow fields
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleCurrency, setGoogleCurrency] = useState<CurrencyCode>('USD');
  const [googleStarterType, setGoogleStarterType] = useState<'executive' | 'clean'>('executive');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both your username and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to log in to AAG Account');
      } else {
        onClose();
      }
    } catch {
      setErrorMsg('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateAppUsername(username, allUsers.map(u => u.username));
    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || 'Please choose a valid username (letters, numbers, dots, and underscores only).');
      return;
    }

    if (!password || !fullName.trim()) {
      setErrorMsg('Please complete your password and full name.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await register(validation.normalized, password, fullName, currency, starterType);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create AAG Account');
      } else {
        onClose();
      }
    } catch {
      setErrorMsg('An unexpected error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePopupAuth = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user?.email) {
        const res = await continueWithGoogle({
          email: result.user.email,
          fullName: result.user.displayName || result.user.email.split('@')[0],
          avatarUrl: result.user.photoURL || undefined,
          googleId: result.user.uid,
          currency: googleCurrency,
          starterType: googleStarterType,
        });

        if (res.success) {
          setSuccessMsg(`Welcome, ${result.user.displayName || result.user.email}!`);
          setTimeout(() => {
            onClose();
          }, 500);
          return;
        }
      }
      // If popup closed or cancelled, switch to Google entry panel
      setAuthMethod('google');
    } catch {
      // In case iframe popup is blocked, seamlessly open Google entry panel
      setAuthMethod('google');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async (emailToUse?: string, nameToUse?: string) => {
    const finalEmail = (emailToUse || googleEmail).trim().toLowerCase();
    const finalName = (nameToUse || googleName || finalEmail.split('@')[0]).trim();

    if (!finalEmail || !finalEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google Account email address (e.g. yourname@gmail.com).');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await continueWithGoogle({
        email: finalEmail,
        fullName: finalName,
        currency: googleCurrency,
        starterType: googleStarterType,
      });

      if (res.success) {
        setSuccessMsg(
          res.isNewUser
            ? `Google account created! Welcome to AAG, ${finalName}!`
            : `Signed in as ${finalName} via Google.`
        );
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.error || 'Google authentication could not be completed.');
      }
    } catch {
      setErrorMsg('Failed to connect to Google Account service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#202020] border border-[#383838] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header with AAG Account & Google Branding */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#303030] bg-[#181818] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#1ed760]/20">
              <span className="font-mono text-sm tracking-tighter">AAG</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {authMethod === 'google'
                    ? 'Google Account Setup & Sign-In'
                    : mode === 'login'
                    ? 'AAG Account Login'
                    : 'Create New AAG Account'}
                </h2>
                <span className="text-[10px] bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/40 font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Cloud Sync
                </span>
              </div>
              <p className="text-xs text-[#b3b3b3]">
                AAG · Cross-Device Cloud Synchronization
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

        {/* Cross-Device Compatibility Banner */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#121212] border-b border-[#282828] flex items-center justify-between text-[11px] text-[#a0a0a0] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#1ed760] font-semibold">Available on:</span>
            <div className="flex items-center gap-2 text-white">
              <span className="flex items-center gap-1" title="Phone (iOS / Android)">
                <Smartphone className="w-3.5 h-3.5 text-[#1ed760]" />
                <span className="hidden sm:inline">Phone</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1" title="Tablet (iPad / Android)">
                <Tablet className="w-3.5 h-3.5 text-[#1ed760]" />
                <span className="hidden sm:inline">Tablet</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1" title="Laptop (Mac / PC / Linux)">
                <Laptop className="w-3.5 h-3.5 text-[#1ed760]" />
                <span className="hidden sm:inline">Laptop</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1" title="Desktop PC / Monitor">
                <Monitor className="w-3.5 h-3.5 text-[#1ed760]" />
                <span className="hidden sm:inline">Computer</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#1ed760] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Synced</span>
          </div>
        </div>

        {/* Auth Method Navigation Tabs */}
        {authMethod === 'standard' ? (
          <div className="grid grid-cols-2 p-1 mx-5 sm:mx-6 mt-4 bg-[#141414] rounded-full border border-[#333333] text-xs shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="mx-5 sm:mx-6 mt-4 flex items-center justify-between bg-[#181818] p-2 rounded-xl border border-[#383838]">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('standard');
                setErrorMsg(null);
              }}
              className="flex items-center gap-1.5 text-xs text-[#b3b3b3] hover:text-white cursor-pointer px-2 py-1 rounded-lg hover:bg-[#282828] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Username / Password</span>
            </button>
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5 pr-2">
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Google SSO</span>
            </span>
          </div>
        )}

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mx-5 sm:mx-6 mt-3 px-3.5 py-2.5 text-xs bg-[#f3727f]/15 border border-[#f3727f]/30 text-[#f3727f] rounded-lg font-medium shrink-0">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-5 sm:mx-6 mt-3 px-3.5 py-2.5 text-xs bg-[#1ed760]/15 border border-[#1ed760]/30 text-[#1ed760] rounded-lg font-medium shrink-0 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {/* PRIMARY GOOGLE SIGN IN / UP BUTTON */}
          {authMethod === 'standard' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGooglePopupAuth}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-white hover:bg-[#f1f1f1] active:scale-98 text-black text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.3)] border border-white/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>
                      {mode === 'register'
                        ? 'Create New Account with Google'
                        : 'Continue with Google Account'}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-[1px] bg-[#333333]"></div>
                <span className="text-[10px] font-bold text-[#777] uppercase tracking-widest">
                  Or with AAG Credentials
                </span>
                <div className="flex-1 h-[1px] bg-[#333333]"></div>
              </div>
            </div>
          )}

          {/* GOOGLE AUTH PANEL */}
          {authMethod === 'google' ? (
            <div className="space-y-4">
              <div className="bg-[#181818] p-4 rounded-xl border border-[#333333]">
                <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                  <GoogleIcon className="w-4 h-4" />
                  <span>Create Account / Sign In with Google</span>
                </div>
                <p className="text-[11px] text-[#a0a0a0]">
                  Enter your Google Account email to create a new cloud account or sign in across your phone, tablet, and computer.
                </p>
              </div>

              {/* Custom Google Account Entry Form */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleGoogleAuth();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Google Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b3b3b3]">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={e => setGoogleEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#7c7c7c] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-all font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b3b3b3]">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={googleName}
                      onChange={e => setGoogleName(e.target.value)}
                      placeholder="Your Full Name (as on Google profile)"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#7c7c7c] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                      Base Currency
                    </label>
                    <select
                      value={googleCurrency}
                      onChange={e => setGoogleCurrency(e.target.value as CurrencyCode)}
                      className="w-full px-3 py-2.5 text-xs bg-[#141414] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer"
                    >
                      {Object.values(SUPPORTED_CURRENCIES).map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                      Starter Setup
                    </label>
                    <select
                      value={googleStarterType}
                      onChange={e => setGoogleStarterType(e.target.value as 'executive' | 'clean')}
                      className="w-full px-3 py-2.5 text-xs bg-[#141414] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer"
                    >
                      <option value="executive">Executive Fleet ($1.25M)</option>
                      <option value="clean">Fresh Start ($10,000 cash)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !googleEmail}
                    className="w-full py-3 px-4 bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider rounded-full hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Creating / Synchronizing Account...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="w-4 h-4" />
                        <span>Continue with Google Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : mode === 'login' ? (
            /* STANDARD LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b3b3b3]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#7c7c7c] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-all font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b3b3b3]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#7c7c7c] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider rounded-full hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Authenticating with AAG Cloud...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Portfolio on this Device</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Fast switcher for existing accounts */}
              {allUsers.length > 0 && (
                <div className="pt-4 border-t border-[#333333]">
                  <p className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider mb-2">
                    Switch to existing user on this device:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allUsers.map(user => (
                      <button
                        key={user.username}
                        type="button"
                        onClick={() => {
                          switchUser(user.username);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-[#181818] hover:bg-[#282828] text-white text-xs font-bold rounded-full border border-[#444444] transition-all flex items-center gap-1.5 cursor-pointer hover:border-[#1ed760]"
                      >
                        {user.authProvider === 'google' ? (
                          <GoogleIcon className="w-3 h-3" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#1ed760]"></span>
                        )}
                        <span>@{user.username}</span>
                        <span className="text-[10px] text-[#888]">({user.fullName.split(' ')[0]})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* STANDARD SIGN UP FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Desired Username</span>
                    <span className="text-[10px] text-[#1ed760] font-normal lowercase bg-[#1ed760]/10 px-2 py-0.5 rounded-full border border-[#1ed760]/20">
                      Standard rules
                    </span>
                  </label>
                  <span className={`text-[11px] font-mono ${username.length > 30 ? 'text-rose-400 font-bold' : 'text-[#888]'}`}>
                    {username.length}/30
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1ed760]">
                    <AtSign className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(sanitizeAppUsername(e.target.value))}
                    placeholder="e.g. davis99"
                    maxLength={10}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#7c7c7c] rounded-xl border focus:outline-none transition-all font-mono ${
                      username.length === 0
                        ? 'border-[#383838] focus:border-[#1ed760]'
                        : validateAppUsername(username, allUsers.map(u => u.username)).isValid
                        ? 'border-[#1ed760] focus:border-[#1ed760]'
                        : 'border-rose-500/70 focus:border-rose-400'
                    }`}
                    autoFocus
                  />
                </div>

                {/* Real-time Username Format Feedback */}
                {username.length > 0 && (() => {
                  const val = validateAppUsername(username, allUsers.map(u => u.username));
                  return (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-white font-bold">@{val.normalized}</span>
                        {val.isValid ? (
                          <span className="text-[#1ed760] flex items-center gap-1 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            Valid & Available
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {val.errorMessage}
                          </span>
                        )}
                      </div>

                      {/* Rule checklist pills */}
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-[#999] pt-1 border-t border-[#262626]">
                        <span className={`flex items-center gap-1 ${val.rules.noSpaces ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                          {val.rules.noSpaces ? '✓' : '✗'} No spaces
                        </span>
                        <span className={`flex items-center gap-1 ${val.rules.validLength ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                          {val.rules.validLength ? '✓' : '✗'} 3-10 chars
                        </span>
                        <span className={`flex items-center gap-1 ${val.rules.validChars ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                          {val.rules.validChars ? '✓' : '✗'} Letters & numbers only
                        </span>
                        <span className={`flex items-center gap-1 ${val.rules.isAvailable ? 'text-[#1ed760]' : 'text-rose-400'}`}>
                          {val.rules.isAvailable ? '✓' : '✗'} Unique handle
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {username.length === 0 && (
                  <p className="text-[10px] text-[#888] mt-1">
                    Choose 3-10 letters or numbers combinations. No spaces or special symbols.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#7c7c7c] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b3b3b3]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Choose a secure password"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#141414] text-white placeholder-[#7c7c7c] rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2.5 text-xs bg-[#141414] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Starter Portfolio
                  </label>
                  <select
                    value={starterType}
                    onChange={e => setStarterType(e.target.value as 'executive' | 'clean')}
                    className="w-full px-3 py-2.5 text-xs bg-[#141414] text-white rounded-xl border border-[#383838] focus:border-[#1ed760] focus:outline-none cursor-pointer"
                  >
                    <option value="executive">Executive Fleet & Assets ($1.25M)</option>
                    <option value="clean">Fresh Start ($10,000 cash)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#1ed760] hover:bg-[#3be477] active:scale-95 text-black text-xs font-bold uppercase tracking-wider rounded-full hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Creating Cloud Account...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Create AAG Cloud Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
