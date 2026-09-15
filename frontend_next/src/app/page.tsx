"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Search,
  BookOpen,
  Megaphone,
  Users,
  BarChart3,
  Shield,
  Scale,
  Globe,
  ChevronDown,
  ArrowRight,
  Camera,
  AlertTriangle,
  FileText,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  Barcode,
  Edit3,
  UploadCloud,
  Check,
  Building2,
  Info,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();



  // Accessibility Font Scaling
  const [fontSizeScale, setFontSizeScale] = useState<"sm" | "normal" | "lg">("normal");

  // Language Dropdown
  const [language, setLanguage] = useState<string>("English");
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);

  // Search input in navbar
  const [navSearchQuery, setNavSearchQuery] = useState<string>("");

  // Product Verification Tabs
  const [activeTab, setActiveTab] = useState<"barcode" | "details" | "upload">("barcode");

  // Interactive Verification states
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [productNameInput, setProductNameInput] = useState<string>("");
  const [categoryInput, setCategoryInput] = useState<string>("Food & Beverages");
  const [mrpInput, setMrpInput] = useState<string>("");
  const [netQtyInput, setNetQtyInput] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Modals
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [showAwarenessModal, setShowAwarenessModal] = useState<boolean>(false);
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);

  // Violation form states
  const [violationSubmitted, setViolationSubmitted] = useState<boolean>(false);
  const [violationData, setViolationData] = useState({
    productName: "",
    retailer: "",
    violationType: "Dual MRP / Overcharging (Rule 18)",
    city: "",
    description: "",
  });

  // Pre-configured sample products for one-click test
  const sampleProducts = [
    {
      barcode: "8901719101051",
      name: "Parle-G Original Gluco Biscuits 800g",
      category: "Food & Beverages",
      mrp: "85.00",
      netQty: "800g",
      manufacturer: "Parle Products Pvt. Ltd., Mumbai",
      compliant: true,
      rulesChecked: ["Rule 6(1)(a) Generic Name", "Rule 6(1)(b) Net Qty Standard", "Rule 18(2) Single MRP", "Rule 6(1)(e) Customer Care"],
    },
    {
      barcode: "8901262010054",
      name: "Amul Pasteurised Salted Butter 500g",
      category: "Food & Beverages",
      mrp: "275.00",
      netQty: "500g",
      manufacturer: "GCMMF Ltd., Anand - 388001",
      compliant: true,
      rulesChecked: ["Rule 6(1) Declarations Complete", "Standard Pack Sizes (Second Schedule)", "Veg Logo Display"],
    },
    {
      barcode: "8906007280145",
      name: "Fortune Sunlite Refined Sunflower Oil 1L",
      category: "Food & Beverages",
      mrp: "155.00",
      netQty: "1L",
      manufacturer: "Adani Wilmar Limited, Ahmedabad",
      compliant: true,
      rulesChecked: ["Standard Measurement (Litre)", "FSSAI & Metrology Alignment", "Consumer Care Toll-Free"],
    },
    {
      barcode: "8909999000123",
      name: "Generic Imported Wafer Sticks 250g (Sample)",
      category: "Food & Beverages",
      mrp: "299.00",
      netQty: "250g",
      manufacturer: "Unknown Foreign Importer",
      compliant: false,
      violations: [
        "Rule 6(1)(d): Month & Year of Import missing or illegible",
        "Rule 6(1)(g): Unit Sale Price (USP) per gram not declared",
        "Rule 6(1)(b): Importer address lacks PIN code and official jurisdiction"
      ],
    }
  ];

  const handleVerify = (barcodeToVerify?: string) => {
    const code = barcodeToVerify || barcodeInput;
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      const found = sampleProducts.find((p) => p.barcode === code.trim());
      if (found) {
        setVerificationResult(found);
      } else {
        // Fallback simulated check
        setVerificationResult({
          barcode: code || "8901030000000",
          name: productNameInput || "Tata Salt Vacuum Evaporated 1kg",
          category: categoryInput,
          mrp: mrpInput || "28.00",
          netQty: netQtyInput || "1kg",
          manufacturer: "Tata Consumer Products Ltd.",
          compliant: true,
          rulesChecked: [
            "Rule 6(1) Mandatory Declarations Verified",
            "Rule 18(2) Anti-Dual MRP Clear",
            "Second Schedule Standard Weight Compliance"
          ],
        });
      }
    }, 600);
  };

  const handleViolationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setViolationSubmitted(true);
    setTimeout(() => {
      setViolationSubmitted(false);
      setShowViolationModal(false);
      setViolationData({
        productName: "",
        retailer: "",
        violationType: "Dual MRP / Overcharging (Rule 18)",
        city: "",
        description: "",
      });
      alert("Complaint registered successfully under National Consumer Helpline / Legal Metrology Act Sec 36! Reference ID: DOCA-2026-" + Math.floor(100000 + Math.random() * 900000));
    }, 1200);
  };

  return (
    <div
      className={`min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-[#0B2559] selection:text-white ${fontSizeScale === "sm" ? "text-sm" : fontSizeScale === "lg" ? "text-lg" : "text-base"
        }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY BAR                                                        */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Emblem & Official Department Text Stack */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative h-12 w-9 sm:h-14 sm:w-10 shrink-0 flex items-center justify-center">
              <Image
                src="/portal/emblem_official.png"
                alt="Ashoka Emblem Government of India"
                width={40}
                height={68}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-extrabold text-[#0B2559] text-[12px] sm:text-[14px] tracking-tight">
                Department of Consumer Affairs
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-600 font-medium mt-0.5">
                Ministry of Consumer Affairs, Food &amp; Public Distribution
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
                Government of India
              </span>
            </div>
          </div>

          {/* Center: Portal Title & Tagline */}
          <div className="text-center hidden lg:block px-2 shrink-0">
            <h1 className="text-base lg:text-lg font-black text-[#0B2559] tracking-tight">
              Packaged Commodities Compliance Portal
            </h1>
            <p className="text-[10px] lg:text-[11px] text-gray-600 italic font-serif mt-0.5">
              Transparent Weights. Trusted Consumers. Stronger India.
            </p>
          </div>

          {/* Right: Accessibility Controls, Language, Login & G20 Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Accessibility Buttons (A- / A / A+) */}
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-gray-50 text-[11px] font-semibold text-gray-700 shadow-2xs">
              <button
                type="button"
                onClick={() => setFontSizeScale("sm")}
                title="Decrease Text Size"
                className={`px-1.5 py-1 hover:bg-gray-200 transition ${fontSizeScale === "sm" ? "bg-gray-300 text-navy font-bold" : ""}`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale("normal")}
                title="Normal Text Size"
                className={`px-1.5 py-1 border-x border-gray-300 hover:bg-gray-200 transition ${fontSizeScale === "normal" ? "bg-gray-300 text-navy font-bold" : ""}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale("lg")}
                title="Increase Text Size"
                className={`px-1.5 py-1 hover:bg-gray-200 transition ${fontSizeScale === "lg" ? "bg-gray-300 text-navy font-bold" : ""}`}
              >
                A+
              </button>
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-[#0B2559] px-2 py-1.5 rounded-md hover:bg-gray-100 transition"
              >
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span>{language}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      setLanguage("English");
                      setLangDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B2559] font-medium"
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("हिन्दी (Hindi)");
                      setLangDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B2559] font-medium"
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("मराठी (Marathi)");
                      setLangDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B2559] font-medium"
                  >
                    मराठी
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons / Officer Badge */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 bg-[#0B2559] text-white hover:bg-[#071a3d] text-xs font-semibold px-3 py-1.5 rounded-md transition shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="text-xs text-gray-500 hover:text-red-600 px-1 py-1"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#0B2559] border border-[#0B2559] hover:bg-blue-50/80 px-3 py-1.5 rounded-md transition"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-white bg-[#0B2559] hover:bg-[#071a3d] px-3.5 py-1.5 rounded-md transition shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* G20 India Official Logo */}
            <div className="shrink-0 flex items-center justify-center pl-2 sm:pl-3 border-l border-gray-200">
              <div className="relative h-10 w-20 flex items-center justify-center">
                <Image
                  src="/portal/g20_official.png"
                  alt="G20 India Presidency"
                  width={80}
                  height={42}
                  className="w-full h-full object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Portal Title shown on small viewports */}
        <div className="md:hidden text-center py-1.5 bg-blue-50/50 border-t border-blue-100">
          <h1 className="text-sm font-bold text-[#0B2559]">
            Packaged Commodities Compliance Portal
          </h1>
          <p className="text-[10px] text-gray-500 italic">
            Transparent Weights. Trusted Consumers. Stronger India.
          </p>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN NAVIGATION BAR (Solid Navy Background)                             */}
      {/* ========================================================================= */}
      <nav className="bg-[#0B2559] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-2 gap-3">
            {/* Horizontal Nav Links */}
            <div className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
              {/* Home (Active with Green Underline) */}
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 text-white font-semibold relative after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2.5px] after:bg-[#1E7B34] after:rounded-full"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("check-product-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-2.5 py-1.5 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition"
              >
                Check Product
              </button>

              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="px-2.5 py-1.5 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition"
              >
                Know the Rules
              </button>

              <button
                type="button"
                onClick={() => setShowAwarenessModal(true)}
                className="px-2.5 py-1.5 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition"
              >
                Consumer Awareness
              </button>

              <button
                type="button"
                onClick={() => setShowViolationModal(true)}
                className="px-2.5 py-1.5 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition"
              >
                Report Violation
              </button>

              <Link
                href="/dashboard"
                className="px-2.5 py-1.5 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="px-2.5 py-1.5 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition hidden sm:inline-block"
              >
                Resources
              </button>

              <button
                type="button"
                onClick={() => {
                  alert("Government of India - Legal Metrology Division, Department of Consumer Affairs, Krishi Bhawan, New Delhi.");
                }}
                className="px-2.5 py-1.5 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition hidden lg:inline-block"
              >
                About Us
              </button>
            </div>

            {/* Right Search Input Box */}
            <div className="relative w-full md:w-64 lg:w-72 shrink-0">
              <input
                type="text"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && navSearchQuery.trim()) {
                    setBarcodeInput(navSearchQuery);
                    const el = document.getElementById("check-product-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                    handleVerify(navSearchQuery);
                  }
                }}
                placeholder="Search products, rules, etc."
                className="w-full bg-white text-gray-900 placeholder-gray-400 text-xs sm:text-sm pl-3 pr-9 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => {
                  if (navSearchQuery.trim()) {
                    setBarcodeInput(navSearchQuery);
                    const el = document.getElementById("check-product-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                    handleVerify(navSearchQuery);
                  }
                }}
                title="Search"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (Exact Match with Reference UI Mockup)                    */}
      {/* ========================================================================= */}
      <section className="relative bg-[#F4F6F9] border-b border-gray-200 overflow-hidden min-h-[400px] md:min-h-[430px] lg:min-h-[460px] flex items-center">
        {/* Static Hero Background Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <Image
            src="/portal/slides/slide_1.jpeg"
            alt="Packaged Commodities: GoodLife Milk, SunPure Sunflower Oil, Nature's Bite Atta, Crispy Chips"
            fill
            sizes="100vw"
            className="w-full h-full object-cover object-center"
            priority={true}
            unoptimized
          />
        </div>

        {/* Soft left-side illumination gradient ensuring text is 100% crisp across any screen width */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:via-white/55 md:from-white/85 md:via-white/35 md:to-transparent pointer-events-none z-10" />

        {/* "Right Information, Stronger Consumers" Slogan with Indian Tricolor Accent */}
        <div className="absolute top-5 sm:top-6 right-6 sm:right-10 lg:right-14 z-20 pointer-events-none hidden md:block">
          <div className="flex flex-col items-end text-right select-none">
            <span
              className="text-[17px] lg:text-[21px] font-bold italic text-slate-700 tracking-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Right Information
            </span>
            <span
              className="text-[17px] lg:text-[21px] font-bold italic text-slate-700 tracking-tight -mt-1"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Stronger Consumers
            </span>
            <div className="w-32 lg:w-36 h-2 relative mt-1">
              <div className="h-[2.5px] w-full bg-gradient-to-r from-transparent via-[#FF9933] to-[#FF9933] rounded-full" />
              <div className="h-[3px] w-[90%] ml-auto bg-gradient-to-r from-transparent via-[#138808] to-[#138808] rounded-full mt-[1.5px]" />
            </div>
          </div>
        </div>



        {/* Foreground Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full">
          <div className="max-w-xl lg:max-w-[530px] space-y-4">
            {/* Small Green Badge Label */}
            <div className="inline-block">
              <span className="text-[#1E7B34] font-bold text-xs tracking-wider uppercase">
                ENSURING FAIR TRADE
              </span>
            </div>

            {/* Large Bold Navy Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-[#0B2559] leading-[1.15] tracking-tight">
              Check Compliance of <br className="hidden sm:inline" />
              Packaged Commodities
            </h2>

            {/* Subtext */}
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
              Verify whether a packaged product complies with the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>

            {/* Two CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("check-product-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#0B2559] hover:bg-[#071a3d] text-white px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition flex items-center gap-2"
              >
                <span>Check a Product</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-2xs transition"
              >
                Learn More
              </button>
            </div>

            {/* Row of 3 Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-gray-200/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100/90 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-[#0B2559]" />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  Consumer Protection
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100/90 flex items-center justify-center shrink-0">
                  <Scale className="w-3.5 h-3.5 text-[#0B2559]" />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  Fair Measurement
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100/90 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-[#0B2559]" />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  Trusted Marketplace
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. QUICK ACCESS CARDS ROW (5 Equal Width Cards)                           */}
      {/* ========================================================================= */}
      <section className="py-8 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Check Product (Blue) */}
            <div
              onClick={() => {
                const el = document.getElementById("check-product-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#EDF5FD] hover:bg-[#e1effc] border border-blue-200/80 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer shadow-2xs hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0B2559]">Check Product</h3>
                <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
                  Scan or enter details to verify compliance
                </p>
              </div>
            </div>

            {/* Card 2: Understand the Rules (Green) */}
            <div
              onClick={() => setShowRulesModal(true)}
              className="bg-[#EAF8EE] hover:bg-[#ddf3e3] border border-emerald-200/80 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer shadow-2xs hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-full bg-[#1E7B34] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">Understand the Rules</h3>
                <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
                  Learn about Legal Metrology Rules, 2011
                </p>
              </div>
            </div>

            {/* Card 3: Report a Violation (Yellow) */}
            <div
              onClick={() => setShowViolationModal(true)}
              className="bg-[#FEF8E7] hover:bg-[#fcf0d3] border border-amber-200/80 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer shadow-2xs hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">Report a Violation</h3>
                <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
                  Help us ensure fair trade
                </p>
              </div>
            </div>

            {/* Card 4: Consumer Awareness (Red/Pink) */}
            <div
              onClick={() => setShowAwarenessModal(true)}
              className="bg-[#FDEEF1] hover:bg-[#fadce2] border border-rose-200/80 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer shadow-2xs hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-full bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-950">Consumer Awareness</h3>
                <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
                  Tips, guides and resources
                </p>
              </div>
            </div>

            {/* Card 5: Compliance Dashboard (Purple) -> DIRECT INTEGRATION */}
            <Link
              href="/dashboard"
              className="bg-[#F4EEFA] hover:bg-[#ebdcf8] border border-purple-200/80 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer shadow-2xs hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-bold text-purple-950">Compliance Dashboard</h3>
                  <ArrowUpRight className="w-3 h-3 text-purple-700" />
                </div>
                <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
                  State-wise insights and reports
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THREE COLUMN CONTENT SECTION                                           */}
      {/* ========================================================================= */}
      <section id="check-product-section" className="py-12 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* COLUMN 1 (Wide White Card): "Check a Packaged Product" */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-black text-[#0B2559]">
                  Check a Packaged Product
                </h3>
                <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-200">
                  LM Rules 2011
                </span>
              </div>

              {/* Tab Switcher (3 Tabs) */}
              <div className="flex items-center border-b border-gray-200 mb-5 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("barcode")}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-t-lg transition border-b-2 ${activeTab === "barcode"
                      ? "bg-[#0B2559] text-white border-[#0B2559]"
                      : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-100"
                    }`}
                >
                  <Barcode className="w-4 h-4" />
                  <span>Scan Barcode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-t-lg transition border-b-2 ${activeTab === "details"
                      ? "bg-[#0B2559] text-white border-[#0B2559]"
                      : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-100"
                    }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Enter Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-t-lg transition border-b-2 ${activeTab === "upload"
                      ? "bg-[#0B2559] text-white border-[#0B2559]"
                      : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-100"
                    }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* TAB 1: SCAN BARCODE (Active in default design) */}
              {activeTab === "barcode" && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50/70 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-center mb-3">
                      <Barcode className="w-10 h-10 text-gray-700" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-xs mb-4">
                      Scan the barcode on the package to get product details and verify compliance.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-sm">
                      <button
                        type="button"
                        onClick={() => router.push("/scan")}
                        className="w-full bg-[#0B2559] hover:bg-[#071a3d] text-white py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Start Camera Scanner</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Barcode Quick Verification Input */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Or Test with Known Barcode:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        placeholder="e.g. 8901719101051 (Parle-G)"
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B2559]"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerify()}
                        disabled={isVerifying}
                        className="bg-[#0B2559] hover:bg-[#071a3d] text-white px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition"
                      >
                        {isVerifying ? "Checking..." : "Verify"}
                      </button>
                    </div>

                    {/* Quick Pill Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-gray-500 font-medium">Quick Demo:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setBarcodeInput("8901719101051");
                          handleVerify("8901719101051");
                        }}
                        className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded border border-gray-300 transition"
                      >
                        Parle-G 800g
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBarcodeInput("8901262010054");
                          handleVerify("8901262010054");
                        }}
                        className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded border border-gray-300 transition"
                      >
                        Amul Butter 500g
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBarcodeInput("8909999000123");
                          handleVerify("8909999000123");
                        }}
                        className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-300 transition"
                      >
                        Sample Violation
                      </button>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className="text-xs text-[#0B2559] font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Don&apos;t have a barcode? Enter details manually →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ENTER DETAILS */}
              {activeTab === "details" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerify();
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productNameInput}
                      onChange={(e) => setProductNameInput(e.target.value)}
                      placeholder="e.g. Aashirvaad Superior MP Shuddh Atta"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#0B2559]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#0B2559]"
                      >
                        <option>Food &amp; Beverages</option>
                        <option>Personal Care &amp; Cosmetics</option>
                        <option>Household Products</option>
                        <option>Healthcare &amp; OTC</option>
                        <option>Other Packaged Commodity</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Net Quantity
                      </label>
                      <input
                        type="text"
                        value={netQtyInput}
                        onChange={(e) => setNetQtyInput(e.target.value)}
                        placeholder="e.g. 5 kg or 1 L"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#0B2559]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Maximum Retail Price (MRP incl. of all taxes)
                    </label>
                    <input
                      type="text"
                      value={mrpInput}
                      onChange={(e) => setMrpInput(e.target.value)}
                      placeholder="₹ 245.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#0B2559]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-[#0B2559] hover:bg-[#071a3d] text-white py-2.5 rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    {isVerifying ? "Verifying Statutory Standards..." : "Verify Compliance Now"}
                  </button>
                </form>
              )}

              {/* TAB 3: UPLOAD IMAGE */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <div
                    onClick={() => router.push("/scan")}
                    className="border-2 border-dashed border-gray-300 hover:border-[#0B2559] rounded-xl p-6 text-center bg-gray-50/70 hover:bg-blue-50/30 cursor-pointer transition flex flex-col items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <UploadCloud className="w-7 h-7 text-[#0B2559]" />
                    </div>
                    <h4 className="text-xs font-bold text-[#0B2559] mb-1">
                      Upload Packaging Photo
                    </h4>
                    <p className="text-[11px] text-gray-500 max-w-xs mb-3">
                      Drag &amp; drop product label image or click to upload front/back packaging.
                    </p>
                    <button
                      type="button"
                      className="bg-[#0B2559] text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                    >
                      Browse Files &amp; Scan with AI
                    </button>
                  </div>

                  {/* Preloaded Sample Label Shortcut */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-xs font-bold text-gray-800">
                        Need test sample images?
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Test against real OCR compliant &amp; non-compliant packaging
                      </p>
                    </div>
                    <Link
                      href="/scan"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-md shadow-xs transition"
                    >
                      Open AI Scanner
                    </Link>
                  </div>
                </div>
              )}

              {/* Verification Result Drawer */}
              {verificationResult && (
                <div className="mt-5 p-4 rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      {verificationResult.compliant ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>COMPLIANT PRODUCT</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-700 font-bold text-xs bg-rose-50 border border-rose-300 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>NON-COMPLIANCE DETECTED</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setVerificationResult(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-gray-900">{verificationResult.name}</p>
                    <p className="text-gray-600">
                      <strong>Standard Net Qty:</strong> {verificationResult.netQty} | <strong>MRP:</strong> ₹{verificationResult.mrp}
                    </p>
                    <p className="text-gray-600">
                      <strong>Manufacturer:</strong> {verificationResult.manufacturer}
                    </p>
                  </div>

                  {verificationResult.compliant ? (
                    <div className="mt-3 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                      <p className="font-semibold mb-1">Statutory Checks Verified:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                        {verificationResult.rulesChecked?.map((rule: string, idx: number) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-3 bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-[11px] text-rose-900">
                      <p className="font-semibold mb-1">Deficiencies / Violations:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                        {verificationResult.violations?.map((viol: string, idx: number) => (
                          <li key={idx}>{viol}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => setShowViolationModal(true)}
                        className="mt-2 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded font-semibold transition"
                      >
                        Lodge Formal Complaint (Sec 36)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLUMN 2 (Light Blue Box): "Supported Product Categories" */}
            <div className="lg:col-span-3 bg-[#EDF5FD] border border-blue-200/80 rounded-xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#0B2559] mb-4">
                Supported Product Categories
              </h3>

              <div className="space-y-3 text-xs sm:text-sm font-medium text-gray-800">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/80 border border-blue-100 hover:bg-white transition">
                  <span className="text-xl">🍎</span>
                  <span>Food &amp; Beverages</span>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/80 border border-blue-100 hover:bg-white transition">
                  <span className="text-xl">💧</span>
                  <span>Personal Care &amp; Cosmetics</span>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/80 border border-blue-100 hover:bg-white transition">
                  <span className="text-xl">🏠</span>
                  <span>Household Products</span>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/80 border border-blue-100 hover:bg-white transition">
                  <span className="text-xl">➕</span>
                  <span>Healthcare &amp; OTC Products</span>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/80 border border-blue-100 hover:bg-white transition">
                  <span className="text-xl">📦</span>
                  <span>All other packaged commodities</span>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-lg bg-blue-100/60 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <p className="font-semibold mb-0.5">Mandatory Declarations Required:</p>
                <p className="text-[11px] text-blue-800">
                  Name &amp; address of manufacturer/packer, common or generic name, net quantity, month &amp; year of manufacture/import, retail sale price (MRP), and consumer care details.
                </p>
              </div>
            </div>

            {/* COLUMN 3 (White Card): "Latest Alerts & Updates" */}
            <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#0B2559]">
                  Latest Alerts &amp; Updates
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAlertsModal(true)}
                  className="text-xs font-semibold text-[#0B2559] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 3 Alerts List */}
              <div className="space-y-3.5">
                {/* Alert 1: Red Icon Box */}
                <div
                  onClick={() => setShowAlertsModal(true)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        Advisory on Correct Net Quantity Declaration
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">
                        Sep 5, 2025
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                      Ensure net quantity is declared in prescribed units as per LM Rules, 2011.
                    </p>
                  </div>
                </div>

                {/* Alert 2: Blue Icon Box */}
                <div
                  onClick={() => setShowAlertsModal(true)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        Revised Guidelines for Multipack Commodities
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">
                        Aug 28, 2025
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                      New guidelines issued for declaration on multipack packages.
                    </p>
                  </div>
                </div>

                {/* Alert 3: Green Icon Box */}
                <div
                  onClick={() => setShowAlertsModal(true)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        Awareness Campaign: Check Before You Buy
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">
                        Aug 12, 2025
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                      Join our campaign to promote informed and safe consumer choices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER (Solid Navy Background, White/Light Text)                       */}
      {/* ========================================================================= */}
      <footer className="bg-[#0B2559] text-white pt-10 pb-6 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Links Left | Social, Digital India & Helpline Right */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6">
            {/* Left Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-xs text-gray-300 font-medium">
              <button onClick={() => alert("Sitemap: / , /dashboard , /scan , /inspections , /reports , /login")} className="hover:text-white transition">
                Sitemap
              </button>
              <span className="text-gray-500">|</span>
              <button onClick={() => alert("Disclaimer: This portal is managed under the Legal Metrology Act, 2009 for regulatory compliance.")} className="hover:text-white transition">
                Disclaimer
              </button>
              <span className="text-gray-500">|</span>
              <button onClick={() => alert("Privacy Policy: All inspection and scan records are encrypted and retained under government compliance rules.")} className="hover:text-white transition">
                Privacy Policy
              </button>
              <span className="text-gray-500">|</span>
              <button onClick={() => alert("Terms of Use: Accessible to Indian citizens and authorized enforcement officers.")} className="hover:text-white transition">
                Terms of Use
              </button>
              <span className="text-gray-500">|</span>
              <button onClick={() => alert("Contact: Department of Consumer Affairs, Krishi Bhawan, New Delhi - 110001")} className="hover:text-white transition">
                Contact Us
              </button>
            </div>

            {/* Right: Follow Us, Digital India & Helpline */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {/* Follow Us & Social Icons */}
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <span className="font-semibold text-gray-200">Follow Us</span>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold cursor-pointer transition">
                    𝕏
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold cursor-pointer transition">
                    in
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold cursor-pointer transition">
                    ▶
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold cursor-pointer transition">
                    📷
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold cursor-pointer transition">
                    f
                  </span>
                </div>
              </div>

              {/* Digital India Logo */}
              <div className="h-10 px-3 shrink-0 flex items-center justify-center bg-white rounded-lg shadow-xs overflow-hidden">
                <Image
                  src="/portal/digital_india.svg"
                  alt="Digital India - Power To Empower"
                  width={100}
                  height={32}
                  className="h-7 w-auto object-contain"
                  unoptimized
                />
              </div>

              {/* Consumer Helpline 1915 */}
              <a
                href="tel:1915"
                className="flex items-center gap-2 bg-[#1E7B34] hover:bg-[#18642a] text-white px-3 py-1.5 rounded-lg shadow-sm transition text-xs font-bold"
              >
                <Phone className="w-3.5 h-3.5" />
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] text-emerald-100 font-normal">Toll-Free National</span>
                  <span>Consumer Helpline 1915</span>
                </div>
              </a>
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t border-blue-900/60 my-2" />

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 text-xs text-gray-400">
            <div>
              © 2025 Department of Consumer Affairs. All rights reserved.
            </div>
            <div className="font-medium text-gray-300">
              For a fair, transparent and consumer-friendly India.
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: REPORT VIOLATION                                                 */}
      {/* ========================================================================= */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Report a Packaging Violation</h3>
                  <p className="text-xs text-gray-500">Legal Metrology Act, 2009 (Sec 36)</p>
                </div>
              </div>
              <button
                onClick={() => setShowViolationModal(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleViolationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Product Name &amp; Brand *
                </label>
                <input
                  type="text"
                  required
                  value={violationData.productName}
                  onChange={(e) => setViolationData({ ...violationData, productName: e.target.value })}
                  placeholder="e.g. Mineral Water Bottle 1L / Brand XYZ"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0B2559]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Retailer, Mall, Airport or E-Commerce Platform *
                </label>
                <input
                  type="text"
                  required
                  value={violationData.retailer}
                  onChange={(e) => setViolationData({ ...violationData, retailer: e.target.value })}
                  placeholder="e.g. Metro Station Kiosk, Blinkit, Supermarket"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0B2559]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Violation Type
                  </label>
                  <select
                    value={violationData.violationType}
                    onChange={(e) => setViolationData({ ...violationData, violationType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0B2559]"
                  >
                    <option>Dual MRP / Overcharging (Rule 18)</option>
                    <option>Smudged / Altered MRP</option>
                    <option>Missing Net Quantity</option>
                    <option>Non-Standard Packaging Weight</option>
                    <option>Missing Manufacturer / Importer Address</option>
                    <option>No Consumer Care Contact Details</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={violationData.city}
                    onChange={(e) => setViolationData({ ...violationData, city: e.target.value })}
                    placeholder="e.g. New Delhi, MH"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0B2559]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Brief Description &amp; Evidence Summary
                </label>
                <textarea
                  rows={3}
                  value={violationData.description}
                  onChange={(e) => setViolationData({ ...violationData, description: e.target.value })}
                  placeholder="Explain the violation, charged price vs printed MRP..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0B2559]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowViolationModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={violationSubmitted}
                  className="px-5 py-2 bg-[#0B2559] hover:bg-[#071a3d] text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {violationSubmitted ? "Submitting..." : "Submit to Enforcement Wing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KNOW THE RULES                                                   */}
      {/* ========================================================================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2559]">
                    Legal Metrology (Packaged Commodities) Rules, 2011
                  </h3>
                  <p className="text-xs text-gray-500">Statutory Provisions &amp; Standards</p>
                </div>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-bold text-[#0B2559] mb-1">Rule 6: Mandatory Declarations</h4>
                <p>Every package must bear the following clear, unsmudged declarations:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                  <li>Name and complete address of the manufacturer, packer, or importer.</li>
                  <li>Common or generic name of the commodity contained in the package.</li>
                  <li>Net quantity in terms of standard unit of weight or measure (g, kg, ml, L, m).</li>
                  <li>Month and year in which the commodity is manufactured, packed or imported.</li>
                  <li>Retail sale price (MRP) in Indian currency, inclusive of all taxes.</li>
                  <li>Name, address, telephone number, and email of person or office for consumer complaints.</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-bold text-amber-900 mb-1">Rule 18(2): Prohibition of Dual MRP</h4>
                <p>
                  No manufacturer, packer, importer or seller shall alter, smudge, or paste another price over the retail sale price declared on the package. Charging above MRP or having two different MRPs for identical products at different venues (e.g. airports vs local markets) is an offence under Section 36 of the Act.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h4 className="font-bold text-emerald-900 mb-1">Second Schedule: Standard Package Sizes</h4>
                <p>
                  Specified commodities such as baby milk, biscuits, tea, salt, and edible oils must only be packed in prescribed standard quantities (e.g. 100g, 200g, 500g, 1kg) to prevent deceptive packaging.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="bg-[#0B2559] text-white px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Close Guidelines
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONSUMER AWARENESS                                               */}
      {/* ========================================================================= */}
      {showAwarenessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Jago Grahak Jago — Consumer Rights</h3>
                  <p className="text-xs text-gray-500">Know What to Check Before You Pay</p>
                </div>
              </div>
              <button
                onClick={() => setShowAwarenessModal(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Never Pay Above MRP:</strong> MRP is statutory and always includes all applicable taxes (GST). Extra &apos;cooling charges&apos; or &apos;convenience fee&apos; on packaged goods are illegal.</p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Inspect Net Weight:</strong> Ensure the package contains the exact declared weight and is not underweight. Use verified trade scales available at retail counters.</p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Check Customer Care Details:</strong> Every legal package must have an email, telephone, and postal address for grievances.</p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950">
                <strong>Need immediate assistance?</strong> Call National Consumer Helpline at <strong>1915</strong> or SMS &apos;CONSUMER&apos; to 8800001915.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex justify-end">
              <button
                onClick={() => setShowAwarenessModal(false)}
                className="bg-[#0B2559] text-white px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ALERTS & CIRCULARS                                               */}
      {/* ========================================================================= */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-[#0B2559]">
                Official Notifications &amp; Advisories
              </h3>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 border rounded-lg bg-gray-50">
                <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">CIRCULAR #2025/LM/09</span>
                <h4 className="font-bold text-gray-900 mt-1">Advisory on Correct Net Quantity Declaration</h4>
                <p className="text-gray-600 mt-1">State Enforcement Directorates are directed to conduct special drives verifying net quantity declarations on packaged food items and pulses.</p>
                <span className="text-[10px] text-gray-400 block mt-2">Published: Sep 5, 2025</span>
              </div>

              <div className="p-3 border rounded-lg bg-gray-50">
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">AMENDMENT 2025</span>
                <h4 className="font-bold text-gray-900 mt-1">Revised Guidelines for Multipack Commodities</h4>
                <p className="text-gray-600 mt-1">Multipacks containing individual units intended for separate sale must declare the individual unit price alongside the total package MRP.</p>
                <span className="text-[10px] text-gray-400 block mt-2">Published: Aug 28, 2025</span>
              </div>

              <div className="p-3 border rounded-lg bg-gray-50">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">CAMPAIGN</span>
                <h4 className="font-bold text-gray-900 mt-1">Nationwide Drive: Check Before You Buy</h4>
                <p className="text-gray-600 mt-1">Public advisory encouraging consumers to verify the unit sale price (USP) and mandatory details before purchasing packaged goods.</p>
                <span className="text-[10px] text-gray-400 block mt-2">Published: Aug 12, 2025</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex justify-end">
              <button
                onClick={() => setShowAlertsModal(false)}
                className="bg-[#0B2559] text-white px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
