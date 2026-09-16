"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ScanLine,
  Package,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Users,
  ShieldCheck,
  LogOut,
  User,
  Award,
  Key,
  MapPin,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronUp,
  Fingerprint,
  UserCog,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  Home
} from 'lucide-react';
import { clsx } from 'clsx';
import { getOfflineQueue, syncOfflineInspections } from '@/lib/offlineSync';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang: currentLang, changeLanguage, t } = useLanguage();
  const { user: authUser, logout, loading: authLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  // Offline Sync State
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Read language and check offline state
  useEffect(() => {
    try {
      const langStored = localStorage.getItem("lmd_lang") as any;
      if (langStored) changeLanguage(langStored);

      setIsOnline(navigator.onLine);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const currentUser = authUser;

  // Enforce Real Authentication
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [authLoading, currentUser, router]);

  // Show loading spinner while checking auth, or if redirecting
  if (authLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
        <div className="w-10 h-10 border-4 border-[#0B2559] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Monitor online/offline status and pending offline queue count
  const checkOfflineCount = () => {
    const queue = getOfflineQueue();
    const pending = queue.filter(item => item.sync_status === 'PENDING_SYNC');
    setOfflineCount(pending.length);
  };

  useEffect(() => {
    checkOfflineCount();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const timer = setInterval(checkOfflineCount, 4000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  // Handle manual sync of offline queue
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncOfflineInspections();
      alert(`Offline Sync Complete! ${res.synced_count} inspections synchronized to central server.`);
      checkOfflineCount();
    } catch (err: any) {
      alert(`Sync failed: ${err.message || 'Server connection error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch language
  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    changeLanguage(lang);
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = currentUser?.role === "admin" || currentUser?.email === "admin@lmd.gov.in";
  const isUser = currentUser?.role === "user" || currentUser?.email?.toLowerCase().startsWith("user") || currentUser?.email?.toLowerCase().startsWith("consumer");

  const officerNavItems = [
    { name: t('main_home_page'), href: '/', icon: Home },
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('new_scan'), href: '/scan', icon: ScanLine },
    { name: t('ecommerce_check'), href: '/ecommerce', icon: ShoppingBag },
    { name: t('products'), href: '/products', icon: Package },
    { name: t('inspections'), href: '/inspections', icon: ClipboardList },
    { name: t('reports'), href: '/reports', icon: FileText },
    { name: t('risk_analytics'), href: '/analytics', icon: BarChart3 },
  ];

  const userNavItems = [
    { name: t('main_home_page'), href: '/', icon: Home },
    { name: t('new_scan'), href: '/scan', icon: ScanLine },
    { name: t('ecommerce_check'), href: '/ecommerce', icon: ShoppingBag },
    { name: t('products'), href: '/products', icon: Package },
    { name: t('consumer_portal'), href: '/consumer', icon: Users },
  ];

  const navItems = isAdmin
    ? [...officerNavItems, { name: t('admin_terminal'), href: '/admin', icon: Settings }]
    : isUser
    ? userNavItems
    : officerNavItems;

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  const getDisplayName = () => {
    if (currentUser?.name && currentUser.name !== "Enforcement Officer") return currentUser.name;
    if (currentUser?.full_name) return currentUser.full_name;
    if (isAdmin) return "Dr. Arvind Saxena, IAS";
    if (isUser) return "Shri Aarav Sharma";
    return "Shri Shubham Sharma, ILM";
  };

  const getInitials = () => {
    const name = getDisplayName();
    if (!name) return "SS";
    const cleanName = name.replace(/^(Insp\.|Inspector|Officer|Dr\.|Mr\.|Mrs\.|Ms\.|Shri|Smt\.|Kumari)\s+/i, "").replace(/,.*$/, "").trim();
    const parts = cleanName.split(/[\s\/\-_]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return "SS";
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] overflow-hidden text-slate-900 font-sans">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Pure White Theme matching Homepage Header */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white text-slate-900 border-r border-gray-200 transition-all duration-300 ease-in-out lg:relative shadow-md",
          isCollapsed ? "w-[80px]" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo area with Main Page Upper Title */}
        <div className="flex items-center h-16 px-4 shrink-0 border-b border-gray-200 bg-white">
          <Link href={isUser ? "/consumer" : "/dashboard"} className={clsx("flex items-center text-slate-900 gap-3", isCollapsed ? "justify-center w-full" : "")}>
            <div className="relative flex items-center justify-center">
              <Shield className="w-8 h-8 shrink-0 text-[#0B2559]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col justify-center leading-tight">
                <span className="font-extrabold text-xs tracking-tight text-[#0B2559] leading-snug">
                  {t('packaged_commodities')}
                </span>
                <span className="font-black text-[11px] text-[#0B2559] tracking-tight">
                  {t('compliance_portal')}
                </span>
                <span className="text-[9px] text-gray-500 tracking-wider font-semibold uppercase mt-0.5">
                  {t('dept_govt_india')}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Go to Home Page Action Button */}
        <div className="px-3 pt-3 pb-1 bg-white">
          <Link
            href="/"
            className={clsx(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0B2559] hover:bg-[#07193d] text-white font-extrabold text-xs shadow-sm transition-all group",
              isCollapsed ? "justify-center" : ""
            )}
            title={t('go_to_home_page')}
          >
            <Home className="w-4 h-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span>{t('go_to_home_page')}</span>}
          </Link>
        </div>

        {/* Multilingual Selector (EN | हिन्दी | मराठी) - Clean Light Theme */}
        {!isCollapsed && (
          <div className="px-3 pt-2.5 pb-1 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-[11px]">
              <Globe className="w-3.5 h-3.5 text-[#0B2559] ml-1 shrink-0" />
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={clsx(
                  "flex-1 py-1 rounded-lg font-bold transition-all text-center",
                  currentLang === 'en' ? "bg-white text-[#0B2559] shadow-2xs font-extrabold border border-gray-200" : "text-slate-600 hover:text-slate-900"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('hi')}
                className={clsx(
                  "flex-1 py-1 rounded-lg font-bold transition-all text-center",
                  currentLang === 'hi' ? "bg-white text-[#0B2559] shadow-2xs font-extrabold border border-gray-200" : "text-slate-600 hover:text-slate-900"
                )}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('mr')}
                className={clsx(
                  "flex-1 py-1 rounded-lg font-bold transition-all text-center",
                  currentLang === 'mr' ? "bg-white text-[#0B2559] shadow-2xs font-extrabold border border-gray-200" : "text-slate-600 hover:text-slate-900"
                )}
              >
                मराठी
              </button>
            </div>
          </div>
        )}

        {/* Navigation - Clean Light Theme */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 custom-scrollbar px-3 space-y-1.5 bg-white">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-50/90 border-l-4 border-[#0B2559] text-[#0B2559] font-extrabold shadow-2xs"
                    : "text-slate-700 hover:bg-gray-100 hover:text-[#0B2559] font-semibold"
                )}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className={clsx("w-5 h-5 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-[#0B2559]" : "text-slate-500 group-hover:text-[#0B2559]")} />
                {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Offline Status & Batch Sync Engine Widget (SIH 2026 Section 25) */}
        {!isCollapsed && (
          <div className="mx-3 mb-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                )}
                <span className={clsx("font-bold text-[11px]", isOnline ? "text-emerald-700" : "text-rose-600")}>
                  {isOnline ? t('network_online') : t('offline_field_mode')}
                </span>
              </div>
              {offlineCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {offlineCount} {t('pending')}
                </span>
              )}
            </div>

            {offlineCount > 0 && isOnline && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-[#0B2559] hover:bg-[#07193d] text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <RefreshCw className={clsx("w-3 h-3 text-amber-400", isSyncing ? "animate-spin" : "")} />
                {isSyncing ? t('syncing_batch') : t('sync_offline_queue')}
              </button>
            )}
          </div>
        )}

        {/* Interactive Profile & Footer Menu - Light Theme */}
        <div className="relative p-3 border-t border-gray-200 shrink-0 bg-gray-50" ref={profileRef}>
          {/* Pop-up Menu Dropdown */}
          {isProfileMenuOpen && (
            <div
              className={clsx(
                "absolute bottom-full mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 text-xs animate-fade-in divide-y divide-gray-100",
                isCollapsed ? "left-2 w-64" : "left-3 right-3 w-[calc(100%-24px)]"
              )}
            >
              {/* Profile Card Header */}
              <div className="p-3 pb-3">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs",
                    isAdmin
                      ? "bg-purple-700 border-purple-400"
                      : isUser
                      ? "bg-emerald-700 border-emerald-400"
                      : "bg-[#0B2559] border-blue-400"
                  )}>
                    {getInitials()}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1 font-bold text-slate-900 text-sm truncate">
                      <span>{getDisplayName()}</span>
                      <ShieldCheck className={clsx("w-3.5 h-3.5 shrink-0", isAdmin ? "text-purple-600" : isUser ? "text-emerald-600" : "text-[#0B2559]")} />
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono truncate block">
                      {currentUser?.email || "officer@lmd.gov.in"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-[11px]">
                  <span className="text-gray-500 font-mono">{currentUser?.badge || "LMD-DEL-2024-984"}</span>
                  <span className={clsx(
                    "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    isAdmin
                      ? "text-purple-800 bg-purple-50 border-purple-200"
                      : isUser
                      ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                      : "text-blue-900 bg-blue-50 border-blue-200"
                  )}>
                    <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", isAdmin ? "bg-purple-600" : isUser ? "bg-emerald-600" : "bg-[#0B2559]")} />
                    {isAdmin ? t('super_admin') : isUser ? t('citizen_user') : t('on_duty')}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="py-1.5 space-y-0.5">
                {!isUser && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsIdModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-[#0B2559] hover:bg-gray-100 rounded-xl transition-colors font-semibold text-left"
                  >
                    <Award className="w-4 h-4 text-[#0B2559] shrink-0" />
                    <span>{t('view_officer_id')}</span>
                  </button>
                )}

                {isUser && (
                  <Link
                    href="/consumer"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors font-bold"
                  >
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('consumer_complaints_verification')}</span>
                  </Link>
                )}

                {!isUser && (
                  <Link
                    href="/inspections"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-[#0B2559] hover:bg-gray-100 rounded-xl transition-colors font-semibold"
                  >
                    <ClipboardList className="w-4 h-4 text-[#0B2559] shrink-0" />
                    <span>{t('my_inspection_logs')}</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-purple-800 hover:bg-purple-50 rounded-xl transition-colors font-bold"
                  >
                    <Settings className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{t('admin_terminal_rules')}</span>
                  </Link>
                )}
              </div>

              {/* Logout Button */}
              <div className="pt-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-colors font-bold text-left group"
                >
                  <LogOut className="w-4 h-4 text-rose-600 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                  <span>{t('sign_out_platform')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Trigger Button: Profile Card in Sidebar */}
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={clsx(
              "w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left group border border-transparent hover:border-gray-300 hover:bg-gray-100 cursor-pointer",
              isProfileMenuOpen ? "bg-white border-gray-300 shadow-xs" : ""
            )}
          >
            {/* Avatar with Status Pulse */}
            <div className="relative shrink-0">
              <div className={clsx(
                "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs font-bold text-sm tracking-tight text-white",
                isAdmin
                  ? "bg-purple-700 border-purple-400"
                  : isUser
                  ? "bg-emerald-700 border-emerald-400"
                  : "bg-[#0B2559] border-blue-400"
              )}>
                <span>{getInitials()}</span>
              </div>
              <span className={clsx(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full shadow-2xs",
                isAdmin ? "bg-purple-600" : isUser ? "bg-emerald-600" : "bg-[#0B2559]"
              )} />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1 truncate">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {getDisplayName()}
                  </span>
                  <ShieldCheck className={clsx("w-3.5 h-3.5 shrink-0 ml-1", isAdmin ? "text-purple-600" : isUser ? "text-emerald-600" : "text-[#0B2559]")} />
                </div>
                <span className="text-[11px] text-gray-500 truncate font-mono">
                  {currentUser?.email || "officer@lmd.gov.in"}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <ChevronUp className={clsx("w-4 h-4 text-gray-400 group-hover:text-slate-700 transition-transform", isProfileMenuOpen ? "rotate-180" : "")} />
            )}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-gray-300 text-slate-600 rounded-full p-1 hover:text-[#0B2559] hover:bg-gray-100 transition-colors hidden lg:flex items-center justify-center shadow-md z-50"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Desktop & Mobile Header Bar with Government Branding & Home Link */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-extrabold text-[#0B2559] text-xs sm:text-sm tracking-tight">
                {t('dept_consumer_affairs')}
              </span>
              <span className="hidden sm:inline text-xs text-gray-300 font-medium">|</span>
              <span className="hidden md:inline text-xs text-[#0B2559] font-bold">
                {t('packaged_commodities_compliance_portal')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isUser && (
              <button
                onClick={() => setIsIdModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-slate-700 hover:bg-gray-200 text-xs font-semibold transition"
                title={t('officer_id')}
              >
                <Award className="w-3.5 h-3.5 text-[#0B2559]" />
                <span>{t('officer_id')}</span>
              </button>
            )}

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B2559] hover:bg-[#07193d] text-white text-xs font-extrabold shadow-sm transition-all"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('go_to_home')}</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Official Government Officer Digital Smart ID Modal */}
      {isIdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative rounded-3xl border border-gray-200 bg-white p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in space-y-6">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B2559]/10 border border-[#0B2559]/20 flex items-center justify-center text-[#0B2559] shadow-xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0B2559] text-base tracking-wide uppercase">
                    {t('dept_consumer_affairs')}
                  </h3>
                  <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">
                    {t('lmd_govt_india')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsIdModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-amber-50/40 p-4 rounded-2xl border border-amber-200/60 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#0B2559] border-2 border-amber-400 flex items-center justify-center text-amber-300 font-extrabold text-2xl shadow-md shrink-0">
                  {getInitials()}
                </div>
                <div className="space-y-0.5 truncate">
                  <span className="text-[11px] font-mono text-[#0B2559] font-bold block">
                    ID: {currentUser?.badge || currentUser?.officerDetails?.badgeNumber || "LMD-DEL-2024-984"}
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 truncate">
                    {getDisplayName()}
                  </h4>
                  <span className="text-xs text-gray-600 font-medium block truncate">
                    {currentUser?.designation || currentUser?.officerDetails?.designation || (isAdmin ? "Central Super Administrator" : "Legal Metrology Enforcement Officer")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-semibold">{t('posting_jurisdiction')}</span>
                  <span className="font-bold text-gray-900 truncate block">
                    {currentUser?.jurisdiction || currentUser?.officerDetails?.jurisdictionZone || (isAdmin ? "All-India Central HQ" : "NCR & Northern Zone")}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-semibold">{t('statutory_warrant')}</span>
                  <span className="font-bold text-emerald-700 truncate block">
                    {currentUser?.statutoryAuthority || currentUser?.officerDetails?.warrantSection || (isAdmin ? "Section 52 Rules Power" : "Section 15, LM Act 2009")}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-semibold">{t('hrms_code')}</span>
                  <span className="font-mono text-[#0B2559] font-bold truncate block">
                    {currentUser?.employeeCode || currentUser?.officerDetails?.employeeCode || "GOI-EMP-784920"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-semibold">{t('official_phone')}</span>
                  <span className="font-mono text-[#0B2559] font-bold truncate block">
                    {currentUser?.officialPhone || currentUser?.officerDetails?.officialPhone || "+91 98765 43210"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-slate-800">
                  <Fingerprint className="w-5 h-5 text-[#0B2559] shrink-0" />
                  <div>
                    <span className="font-bold text-[#0B2559] block">{t('digital_signature_verified')}</span>
                    <span className="font-mono text-[9px] text-gray-500">SHA-256: 7A1B...8C90</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  {t('valid_till')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsIdModalOpen(false)}
                className="w-full py-3 rounded-xl bg-[#0B2559] hover:bg-[#07193d] font-bold text-white text-xs transition-all shadow-md active:scale-[0.99]"
              >
                {t('close_credential_card')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
