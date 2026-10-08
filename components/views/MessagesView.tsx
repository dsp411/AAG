'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/initial-data';
import { ChatMessage, UserAccount, SharedFinancialData } from '@/types/finance';
import { SendMoneyModal } from '@/components/modals/SendMoneyModal';
import { ShareAssetModal } from '@/components/modals/ShareAssetModal';
import { UsernameModal } from '@/components/modals/UsernameModal';
import {
  Search,
  Send,
  Image as ImageIcon,
  Film,
  Video,
  Paperclip,
  Upload,
  Play,
  DollarSign,
  Share2,
  Check,
  CheckCheck,
  User,
  Sparkles,
  Car,
  Building,
  Briefcase,
  TrendingUp,
  X,
  Plus,
  MessageCircle,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  Zap,
  Edit2,
  AtSign,
} from 'lucide-react';

interface MessagesViewProps {
  initialChatUsername?: string;
}

export function MessagesView({ initialChatUsername }: MessagesViewProps) {
  const {
    currentUser,
    allUsers,
    portfolio,
    fetchChatMessages,
    fetchChatThreads,
    sendChatMessage,
    markThreadRead,
  } = usePortfolio();

  const [activePartner, setActivePartner] = useState<UserAccount | null>(() => {
    if (initialChatUsername && allUsers?.length) {
      const match = allUsers.find(
        u => u.username.toLowerCase() === initialChatUsername.toLowerCase()
      );
      if (match) return match;
    }
    if (currentUser && allUsers?.length > 1) {
      const other = allUsers.find(
        u => u.username.toLowerCase() !== currentUser.username.toLowerCase()
      );
      if (other) return other;
    }
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [threads, setThreads] = useState<any[]>([]);

  // Username modal state
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

  // Gallery & Media Modal state (Device Gallery photos & videos + curated presets)
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'upload' | 'photos' | 'videos' | 'url'>('upload');
  const [modalMediaUrl, setModalMediaUrl] = useState('');
  const [modalCaption, setModalCaption] = useState('');
  const [modalSelectedMedia, setModalSelectedMedia] = useState<{
    url: string;
    type: 'photo' | 'video';
    name?: string;
  } | null>(null);

  // Composer direct media attachment from device gallery
  const [composerAttachment, setComposerAttachment] = useState<{
    url: string;
    type: 'photo' | 'video';
    name?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Send Money Modal state
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);

  // Share Asset Modal state
  const [shareAssetModalOpen, setShareAssetModalOpen] = useState(false);

  // Image Lightbox state
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threads on mount
  const refreshThreads = useCallback(async () => {
    if (!currentUser) return;
    try {
      const t = await fetchChatThreads();
      setThreads(t);
    } catch {}
  }, [currentUser, fetchChatThreads]);

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      fetchChatThreads().then(t => {
        if (isMounted) {
          setThreads(t);
          setActivePartner(prev => {
            if (prev) return prev;
            if (t.length > 0) return t[0].participant;
            return allUsers.find(u => u.username.toLowerCase() !== currentUser.username.toLowerCase()) || null;
          });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser, fetchChatThreads, allUsers]);

  // Load messages whenever activePartner changes
  const activePartnerUsername = activePartner?.username;

  useEffect(() => {
    if (!currentUser || !activePartnerUsername) return;

    let isMounted = true;
    const loadMsgs = async () => {
      try {
        const msgs = await fetchChatMessages(activePartnerUsername);
        if (isMounted) {
          setMessages(msgs);
          await markThreadRead(activePartnerUsername);
          const t = await fetchChatThreads();
          if (isMounted) setThreads(t);
        }
      } catch {}
    };

    loadMsgs();
    const interval = setInterval(loadMsgs, 3000); // 3s polling for real-time feel
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser, activePartnerUsername, fetchChatMessages, markThreadRead, fetchChatThreads]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUser) return null;

  const currency = currentUser.currency || 'USD';

  // Search filter candidates (exclude self)
  const candidateUsers = allUsers.filter(
    u => u.username.toLowerCase() !== currentUser.username.toLowerCase()
  );

  const cleanSearchTerm = searchQuery.trim().toLowerCase().replace('@', '');

  const filteredSearchUsers = cleanSearchTerm
    ? candidateUsers.filter(
        u =>
          u.username.toLowerCase().includes(cleanSearchTerm) ||
          u.fullName.toLowerCase().includes(cleanSearchTerm)
      )
    : [];

  const handleSelectPartner = (u: UserAccount) => {
    setActivePartner(u);
    setSearchQuery('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'composer' | 'modal') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Please select an image or video file from your device gallery.');
      return;
    }

    const type: 'photo' | 'video' = isVideo ? 'video' : 'photo';
    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      if (target === 'composer') {
        setComposerAttachment({
          url: resultUrl,
          type,
          name: file.name,
        });
      } else {
        setModalSelectedMedia({
          url: resultUrl,
          type,
          name: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !composerAttachment) || !activePartner) return;

    const textToSend = inputMessage.trim();
    const attach = composerAttachment;
    setInputMessage('');
    setComposerAttachment(null);

    const res = await sendChatMessage(
      activePartner.username,
      textToSend || undefined,
      attach?.type === 'photo' ? attach.url : undefined,
      undefined,
      attach?.type === 'video' ? attach.url : undefined,
      attach?.type
    );
    if (res.success && res.message) {
      setMessages(prev => [...prev, res.message!]);
      refreshThreads();
    }
  };

  const handleSendFromModal = async () => {
    if (!activePartner || !modalSelectedMedia) return;
    const { url, type } = modalSelectedMedia;
    const caption = modalCaption.trim();

    setGalleryModalOpen(false);
    setModalSelectedMedia(null);
    setModalCaption('');
    setModalMediaUrl('');

    const res = await sendChatMessage(
      activePartner.username,
      caption || undefined,
      type === 'photo' ? url : undefined,
      undefined,
      type === 'video' ? url : undefined,
      type
    );
    if (res.success && res.message) {
      setMessages(prev => [...prev, res.message!]);
      refreshThreads();
    }
  };

  const handleShareAssetData = async (data: SharedFinancialData) => {
    if (!activePartner) return;
    const res = await sendChatMessage(
      activePartner.username,
      `Shared ${data.type.toUpperCase()}: ${data.title}`,
      undefined,
      data
    );
    if (res.success && res.message) {
      setMessages(prev => [...prev, res.message!]);
      refreshThreads();
    }
  };

  const curatedPhotoPresets = [
    { label: 'Supercar Fleet', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80', desc: 'Exotic Vehicles' },
    { label: 'Marina Penthouse', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', desc: 'Luxury Real Estate' },
    { label: 'Private Jet Aviation', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80', desc: 'Gulfstream Travel' },
    { label: 'Luxury Chronograph', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80', desc: 'Swiss Horology' },
    { label: 'Crypto Trading Setup', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', desc: 'Multi-Monitor Desk' },
    { label: 'Gold Bullion Reserve', url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80', desc: 'Physical Vaults' },
  ];

  const curatedVideoPresets = [
    { label: 'V12 Hypercar Acceleration', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', desc: '4K Supercar Showcase Reel' },
    { label: 'Skyline Penthouse Tour', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', desc: 'Luxury Architecture Walkthrough' },
    { label: 'High-Roller Lifestyle Reel', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4', desc: 'Executive Travel & Ambition' },
    { label: 'Compound Wealth Momentum', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', desc: 'Financial Growth Visualizer' },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-2xl bg-[#000000] border border-[#282828] overflow-hidden shadow-2xl">
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: THREADS & SEARCH */}
        <aside className="w-80 md:w-88 border-r border-[#262626] flex flex-col bg-[#121212] shrink-0">
          {/* Top User Header & Make/Change Username Option */}
          <div className="p-3.5 border-b border-[#262626] flex items-center justify-between bg-[#161616]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-xs sm:text-sm text-white font-mono truncate">
                    @{currentUser.username}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
                </div>
                <div className="text-[10px] text-[#888] truncate">{currentUser.fullName}</div>
              </div>
            </div>

            {/* Option to Make / Change Username */}
            <button
              onClick={() => setIsUsernameModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-[#1ed760] text-[11px] font-bold border border-[#383838] flex items-center gap-1 transition-all cursor-pointer shrink-0"
              title="Change your @username handle"
            >
              <Edit2 className="w-3 h-3" />
              <span>Username</span>
            </button>
          </div>

          {/* Search User Input by @username */}
          <div className="p-3 border-b border-[#222] bg-[#141414]">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search @username (3-10 letters or numbers)..."
                className="w-full pl-9 pr-8 py-2 bg-[#202020] text-white placeholder-[#777] rounded-xl text-xs focus:outline-none focus:border-[#1ed760] border border-[#333] font-mono transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#777] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-xl bg-[#181818] border border-[#333] divide-y divide-[#262626] shadow-2xl">
                {filteredSearchUsers.length === 0 ? (
                  <div className="p-4 text-center space-y-1">
                    <p className="text-xs text-[#888]">
                      No user found matching <strong className="text-white">@{cleanSearchTerm}</strong>
                    </p>
                    <p className="text-[10px] text-[#666]">
                      Usernames are 3-10 letters or numbers combinations.
                    </p>
                  </div>
                ) : (
                  filteredSearchUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectPartner(u)}
                      className="w-full p-3 text-left flex items-center justify-between hover:bg-[#222] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1ed760] to-teal-800 text-black font-bold flex items-center justify-center text-xs shrink-0 shadow">
                          {u.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white font-mono truncate flex items-center gap-1 group-hover:text-[#1ed760] transition-colors">
                            <span>@{u.username}</span>
                          </div>
                          <div className="text-[11px] text-[#888] truncate">
                            {u.fullName} {u.occupationTitle ? `· ${u.occupationTitle}` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#1ed760] text-black text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        Chat
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* All Users / Active Conversations Section Header */}
          <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-[#888] uppercase tracking-wider font-bold bg-[#121212]">
            <span>Direct Chats ({candidateUsers.length})</span>
            <span className="text-[10px] text-[#1ed760] font-mono lowercase">click to message</span>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto scroll-smooth divide-y divide-[#1e1e1e]">
            {candidateUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#777]">
                No other user accounts found. Register another account to chat!
              </div>
            ) : (
              candidateUsers.map(user => {
                const isActive = activePartner?.username.toLowerCase() === user.username.toLowerCase();
                const threadInfo = threads.find(
                  t => t.participant.username.toLowerCase() === user.username.toLowerCase()
                );
                const lastMsg = threadInfo?.lastMessage;
                const unread = threadInfo?.unreadCount || 0;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectPartner(user)}
                    className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isActive ? 'bg-[#202020]' : 'hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1ed760] to-emerald-900 text-black font-extrabold flex items-center justify-center text-sm shadow-md">
                          {user.fullName.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#1ed760] border-2 border-[#121212] rounded-full"></span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono truncate">
                            @{user.username}
                          </span>
                          {lastMsg && (
                            <span className="text-[10px] text-[#777]">
                              {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#888] truncate flex items-center gap-1 mt-0.5">
                          {lastMsg ? (
                            <>
                              {lastMsg.senderUsername === currentUser.username && (
                                <span className="text-[#666]">You:</span>
                              )}
                              <span className="truncate">
                                {lastMsg.text || (lastMsg.photoUrl ? '📷 Photo' : '💰 Shared Financial Data')}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#1ed760]/80 italic">Click to start chatting</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#1ed760] text-black font-extrabold text-[10px] flex items-center justify-center shrink-0 ml-2 shadow">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT MAIN PANEL: ACTIVE CHAT CONVERSATION */}
        {activePartner ? (
          <main className="flex-1 flex flex-col bg-[#121212] relative">
            {/* Chat Top Header */}
            <div className="px-6 py-3.5 border-b border-[#262626] bg-[#161616] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1ed760] to-teal-800 text-black font-extrabold flex items-center justify-center text-sm shadow">
                  {activePartner.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-white font-mono">
                      @{activePartner.username}
                    </span>
                    <span className="text-[9px] text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/20 px-1.5 py-0.5 rounded-full font-bold">
                      Verified User
                    </span>
                  </div>
                  <div className="text-[11px] text-[#888]">
                    {activePartner.fullName} · {activePartner.occupationTitle || 'Executive'}
                  </div>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShareAssetModalOpen(true)}
                  className="px-3.5 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-bold uppercase tracking-wider transition-all border border-[#383838] flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Share property or vehicle specs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Asset</span>
                </button>
                <button
                  onClick={() => setSendMoneyModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  title="Wire money directly into bank account"
                >
                  <DollarSign className="w-3.5 h-3.5 fill-black stroke-[3]" />
                  <span>Send Money</span>
                </button>
              </div>
            </div>

            {/* Messages Scrollable Feed */}
            <div className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#202020] flex items-center justify-center mx-auto text-[#1ed760] shadow-md">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white font-mono">
                    Direct conversation with @{activePartner.username}
                  </h4>
                  <p className="text-xs text-[#888] max-w-sm mx-auto leading-relaxed">
                    Send messages, photos, share real estate or car specs, or wire cash directly into their in-app bank account.
                  </p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderUsername.toLowerCase() === currentUser.username.toLowerCase();
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-md ${
                          isMine
                            ? 'bg-[#1ed760] text-black rounded-br-xs font-medium'
                            : 'bg-[#222222] text-white rounded-bl-xs border border-[#333]'
                        }`}
                      >
                        {/* Text Content */}
                        {msg.text && (
                          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </div>
                        )}

                        {/* Video Attachment from Gallery / Camera Roll */}
                        {(msg.videoUrl || (msg.mediaType === 'video' && msg.mediaUrl)) && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-black/20 bg-black shadow-lg">
                            <video
                              src={msg.videoUrl || msg.mediaUrl}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full max-h-80 rounded-xl bg-black object-contain"
                            />
                            <div
                              className={`px-3 py-1.5 text-[11px] font-mono flex items-center justify-between border-t ${
                                isMine
                                  ? 'bg-black/15 text-black border-black/10'
                                  : 'bg-[#181818] text-[#aaa] border-[#333]'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 font-bold">
                                <Film className="w-3.5 h-3.5 text-[#1ed760]" />
                                <span>Video Clip</span>
                              </span>
                              <span className="opacity-75 text-[10px]">Tap to play</span>
                            </div>
                          </div>
                        )}

                        {/* Photo Attachment from Gallery / Camera Roll */}
                        {((msg.photoUrl || (msg.mediaType === 'photo' && msg.mediaUrl)) && !msg.videoUrl && msg.mediaType !== 'video') && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-black/10 relative group">
                            <img
                              src={msg.photoUrl || msg.mediaUrl}
                              alt="Shared photo"
                              className="w-full max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-xl"
                              onClick={() => setLightboxImageUrl(msg.photoUrl || msg.mediaUrl || null)}
                            />
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view full photo
                            </div>
                          </div>
                        )}

                        {/* Rich Shared Financial Data Card */}
                        {msg.sharedData && (
                          <div
                            className={`mt-2.5 p-3.5 rounded-xl border ${
                              isMine
                                ? 'bg-black/10 border-black/20 text-black'
                                : 'bg-[#181818] border-[#333] text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                              <span>{msg.sharedData.type.replace('_', ' ')}</span>
                              {msg.sharedData.amount && (
                                <span className="font-mono font-extrabold text-sm">
                                  {formatCurrency(msg.sharedData.amount, currency)}
                                </span>
                              )}
                            </div>

                            <div className="text-sm font-bold">{msg.sharedData.title}</div>
                            {msg.sharedData.subtitle && (
                              <div className="text-xs opacity-80 mt-0.5">{msg.sharedData.subtitle}</div>
                            )}

                            {msg.sharedData.imageUrl && (
                              <img
                                src={msg.sharedData.imageUrl}
                                alt="Shared asset"
                                className="mt-2 rounded-lg w-full max-h-40 object-cover"
                              />
                            )}

                            {msg.sharedData.details && (
                              <div className="mt-2 pt-2 border-t border-current/10 grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                                {Object.entries(msg.sharedData.details).map(([k, v]) => (
                                  <div key={k}>
                                    <span className="opacity-60 capitalize">{k}: </span>
                                    <span className="font-bold">{v}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timestamp & Status */}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isMine ? 'text-black/70' : 'text-[#777]'
                          }`}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMine && (
                            msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-black" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-black/70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Message Composer */}
            <div className="p-3 sm:p-4 border-t border-[#262626] bg-[#161616] space-y-2">
              {/* Attachment preview banner */}
              {composerAttachment && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202020] border border-[#333] animate-fadeIn">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {composerAttachment.type === 'video' ? (
                      <div className="w-10 h-10 rounded-lg bg-black border border-[#383838] flex items-center justify-center text-[#1ed760] shrink-0">
                        <Film className="w-5 h-5" />
                      </div>
                    ) : (
                      <img
                        src={composerAttachment.url}
                        alt="Attachment"
                        className="w-10 h-10 rounded-lg object-cover border border-[#383838] shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#1ed760]/20 text-[#1ed760] text-[9px] font-mono uppercase">
                          {composerAttachment.type}
                        </span>
                        <span className="truncate">{composerAttachment.name || 'Gallery Media Attached'}</span>
                      </div>
                      <div className="text-[10px] text-[#888]">Ready to send with your message</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setComposerAttachment(null)}
                    className="p-1 rounded-full text-[#888] hover:text-white hover:bg-[#333] transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form Input Bar */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Hidden input to pick files directly from device gallery */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={e => handleFileSelect(e, 'composer')}
                />

                {/* Direct Device Gallery File Picker Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-[#b3b3b3] hover:text-[#1ed760] transition-colors cursor-pointer shrink-0"
                  title="Upload Photo or Video directly from Device Gallery"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Open Media Gallery Modal */}
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(true)}
                  className="p-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-[#b3b3b3] hover:text-[#1ed760] transition-colors cursor-pointer shrink-0"
                  title="Open Gallery (Photos & Videos)"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={
                    composerAttachment
                      ? `Add caption or message @${activePartner.username}...`
                      : `Message @${activePartner.username}...`
                  }
                  className="flex-1 py-2.5 px-4 bg-[#202020] text-white placeholder-[#777] rounded-full text-xs sm:text-sm focus:outline-none focus:border-[#1ed760] border border-[#333] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() && !composerAttachment}
                  className="p-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] disabled:opacity-40 text-black transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 shadow-md"
                  title="Send Message"
                >
                  <Send className="w-4 h-4 fill-black stroke-[2.5]" />
                </button>
              </form>
            </div>
          </main>
        ) : (
          <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[#121212] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#202020] flex items-center justify-center text-[#1ed760] shadow-md">
              <AtSign className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Find Users on AAG</h3>
              <p className="text-xs text-[#888] max-w-sm mx-auto mt-1">
                Type an <strong className="text-white">@username</strong> (3-10 letters or numbers) in the left search bar to find users and send messages, cash wires, photos, and videos.
              </p>
            </div>
          </main>
        )}
      </div>

      {/* Username Modal (Make / Change Username of 3-10 letters or numbers) */}
      <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
      />

      {/* Send Money Modal */}
      {activePartner && (
        <SendMoneyModal
          isOpen={sendMoneyModalOpen}
          onClose={() => setSendMoneyModalOpen(false)}
          preselectedRecipient={activePartner.username}
        />
      )}

      {/* Share Asset Modal */}
      <ShareAssetModal
        isOpen={shareAssetModalOpen}
        onClose={() => setShareAssetModalOpen(false)}
        recipientUsername={activePartner?.username || ''}
        onShare={handleShareAssetData}
      />

      {/* Media Gallery & Device Upload Modal (Photos & Videos) */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
          <div className="bg-[#181818] border border-[#333] rounded-2xl w-full max-w-xl overflow-hidden text-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#282828] flex items-center justify-between bg-[#141414] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760]">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Media Gallery</h3>
                  <p className="text-[11px] text-[#888]">
                    Send photos and videos to <strong className="text-white">@{activePartner?.username}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setGalleryModalOpen(false);
                  setModalSelectedMedia(null);
                  setModalCaption('');
                }}
                className="text-[#888] hover:text-white p-1 rounded-full hover:bg-[#282828] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery Tabs */}
            <div className="flex items-center border-b border-[#262626] bg-[#121212] px-4 pt-2 gap-2 shrink-0 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setGalleryTab('upload')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  galleryTab === 'upload'
                    ? 'border-[#1ed760] text-white'
                    : 'border-transparent text-[#888] hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Device Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setGalleryTab('photos')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  galleryTab === 'photos'
                    ? 'border-[#1ed760] text-white'
                    : 'border-transparent text-[#888] hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setGalleryTab('videos')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  galleryTab === 'videos'
                    ? 'border-[#1ed760] text-white'
                    : 'border-transparent text-[#888] hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setGalleryTab('url')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  galleryTab === 'url'
                    ? 'border-[#1ed760] text-white'
                    : 'border-transparent text-[#888] hover:text-white'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Direct URL</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Tab 1: Upload from Device Gallery */}
              {galleryTab === 'upload' && (
                <div className="space-y-4">
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={e => handleFileSelect(e, 'modal')}
                  />

                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#383838] hover:border-[#1ed760] rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#141414] hover:bg-[#1a1a1a] group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#202020] group-hover:bg-[#1ed760]/20 text-[#888] group-hover:text-[#1ed760] flex items-center justify-center mx-auto transition-colors mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Choose Photos or Videos from Device Gallery
                    </h4>
                    <p className="text-xs text-[#888] max-w-xs mx-auto">
                      Click to open camera roll, file gallery, or photo library (supports JPEG, PNG, WEBP, MP4, MOV, WEBM)
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Photos Gallery */}
              {galleryTab === 'photos' && (
                <div className="space-y-2">
                  <div className="text-xs text-[#888] font-semibold">Select a luxury photo preset:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {curatedPhotoPresets.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setModalSelectedMedia({
                            url: preset.url,
                            type: 'photo',
                            name: preset.label,
                          })
                        }
                        className={`group relative rounded-xl overflow-hidden border text-left cursor-pointer transition-all ${
                          modalSelectedMedia?.url === preset.url
                            ? 'border-[#1ed760] ring-2 ring-[#1ed760]/40'
                            : 'border-[#2e2e2e] hover:border-[#555]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-2 bg-[#181818] border-t border-[#262626]">
                          <div className="text-[11px] font-bold text-white truncate">{preset.label}</div>
                          <div className="text-[10px] text-[#888] truncate">{preset.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Videos Gallery */}
              {galleryTab === 'videos' && (
                <div className="space-y-2">
                  <div className="text-xs text-[#888] font-semibold">Select a high-resolution video reel:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {curatedVideoPresets.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setModalSelectedMedia({
                            url: preset.url,
                            type: 'video',
                            name: preset.label,
                          })
                        }
                        className={`group relative rounded-xl overflow-hidden border text-left cursor-pointer transition-all bg-[#141414] ${
                          modalSelectedMedia?.url === preset.url
                            ? 'border-[#1ed760] ring-2 ring-[#1ed760]/40'
                            : 'border-[#2e2e2e] hover:border-[#555]'
                        }`}
                      >
                        <div className="h-28 bg-black relative flex items-center justify-center">
                          <video
                            src={preset.url}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg">
                              <Play className="w-5 h-5 fill-black ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="p-2.5 bg-[#181818] border-t border-[#262626]">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <Film className="w-3.5 h-3.5 text-[#1ed760] shrink-0" />
                            <span>{preset.label}</span>
                          </div>
                          <div className="text-[10px] text-[#888] mt-0.5">{preset.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: URL Input */}
              {galleryTab === 'url' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-1">
                      Direct Photo or Video URL
                    </label>
                    <input
                      type="url"
                      value={modalMediaUrl}
                      onChange={e => {
                        const val = e.target.value;
                        setModalMediaUrl(val);
                        if (val.trim()) {
                          const isVid = val.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i);
                          setModalSelectedMedia({
                            url: val.trim(),
                            type: isVid ? 'video' : 'photo',
                            name: isVid ? 'Video Link' : 'Photo Link',
                          });
                        }
                      }}
                      placeholder="https://... (image or .mp4 video link)"
                      className="w-full p-2.5 bg-[#121212] border border-[#333] rounded-xl text-xs text-white focus:outline-none focus:border-[#1ed760]"
                    />
                  </div>
                </div>
              )}

              {/* Selected Media Preview & Caption */}
              {modalSelectedMedia && (
                <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2e2e2e] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#262626] pb-2">
                    <span className="flex items-center gap-1.5 text-[#1ed760]">
                      <Check className="w-4 h-4" />
                      <span>Ready to Send ({modalSelectedMedia.type.toUpperCase()})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalSelectedMedia(null)}
                      className="text-xs text-[#888] hover:text-white"
                    >
                      Remove
                    </button>
                  </div>

                  {modalSelectedMedia.type === 'video' ? (
                    <video
                      src={modalSelectedMedia.url}
                      controls
                      playsInline
                      className="w-full max-h-56 rounded-lg bg-black object-contain"
                    />
                  ) : (
                    <img
                      src={modalSelectedMedia.url}
                      alt="Selected preview"
                      className="w-full max-h-56 rounded-lg object-contain bg-black/40"
                    />
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider mb-1">
                      Add a Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={modalCaption}
                      onChange={e => setModalCaption(e.target.value)}
                      placeholder="Say something about this photo or video..."
                      className="w-full p-2 bg-[#121212] border border-[#333] rounded-lg text-xs text-white focus:outline-none focus:border-[#1ed760]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#262626] bg-[#141414] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setGalleryModalOpen(false);
                  setModalSelectedMedia(null);
                  setModalCaption('');
                }}
                className="px-4 py-2 rounded-full bg-[#242424] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2c2c2c] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendFromModal}
                disabled={!modalSelectedMedia}
                className="px-5 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] disabled:opacity-40 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5 fill-black stroke-[2.5]" />
                <span>Send to @{activePartner?.username}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImageUrl}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setLightboxImageUrl(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
