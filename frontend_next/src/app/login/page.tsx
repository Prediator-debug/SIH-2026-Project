"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  UserCog,
  Users,
  ChevronDown,
  Check,
  Building2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  Flame,
  BadgeAlert,
  Phone,
  MapPin,
  FileCheck2,
  IdCard,
  Briefcase,
  KeyRound,
  Compass,
  FileText,
  Building,
  Landmark
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth, AccountRole, OfficerDetails, ConsumerDetails, AdminDetails } from "@/contexts/AuthContext";

interface RoleOption {
  id: AccountRole;
  title: string;
  subtitle: string;
  defaultEmail: string;
  icon: any;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

const roleOptions: RoleOption[] = [
  {
    id: "officer",
    title: "Enforcement Officer",
    subtitle: "Inspector of Legal Metrology (Sec 15)",
    defaultEmail: "officer@lmd.gov.in",
    icon: Shield,
    color: "text-indigo-400",
    badgeBg: "bg-indigo-600",
    badgeBorder: "border-indigo-500/40"
  },
  {
    id: "user",
    title: "Citizen / Consumer",
    subtitle: "Public Verification & Complaints (Sec 36)",
    defaultEmail: "user@labelcomply.in",
    icon: Users,
    color: "text-emerald-400",
    badgeBg: "bg-emerald-600",
    badgeBorder: "border-emerald-500/40"
  },
  {
    id: "admin",
    title: "Super-Admin",
    subtitle: "Central Policy & Rule Engine Director",
    defaultEmail: "admin@lmd.gov.in",
    icon: UserCog,
    color: "text-purple-400",
    badgeBg: "bg-purple-600",
    badgeBorder: "border-purple-500/40"
  }
];

const indianStates = [
  "Delhi (NCT)",
  "Maharashtra",
  "Karnataka",
  "Uttar Pradesh",
  "Gujarat",
  "Tamil Nadu",
  "West Bengal",
  "Rajasthan",
  "Telangana",
  "Punjab",
  "Central Directorate HQ (New Delhi)"
];

const officerDesignations = [
  "Inspector of Legal Metrology (ILM) - Class II Gazetted",
  "Assistant Controller of Legal Metrology (ACLM) - Class I",
  "Deputy Controller of Legal Metrology (DCLM)",
  "Senior Weights & Measures Enforcement Officer"
];

const adminDesignations = [
  "Director of Legal Metrology (DLM), Govt. of India",
  "Joint Secretary (Consumer Affairs & Metrology)",
  "Central Policy & Rule Engine Super-Administrator",
  "Chief Enforcement Controller (National Level)"
];

const adminDepartments = [
  "Department of Consumer Affairs (DoCA), Krishi Bhawan, New Delhi",
  "Central Legal Metrology Division & Standards Directorate",
  "National Test House & Verification Authority"
];

const consumerCategories = [
  "Individual Retail Consumer",
  "Household / Family Shopper",
  "Commercial / Wholesale Buyer",
  "Resident Welfare Association (RWA) Rep",
  "Senior Citizen Consumer"
];

export default function LoginPage() {
  const router = useRouter();
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    loading: authLoading, 
    isFirebaseReady 
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<AccountRole>("officer");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Basic Auth Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. Officer Real-World Parameters
  const [badgeNumber, setBadgeNumber] = useState("");
  const [officerDesignation, setOfficerDesignation] = useState(officerDesignations[0]);
  const [statePosting, setStatePosting] = useState(indianStates[0]);
  const [jurisdictionZone, setJurisdictionZone] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [officialPhone, setOfficialPhone] = useState("");
  const [warrantSection, setWarrantSection] = useState("Section 15 & 28, Legal Metrology Act 2009");

  // 2. Citizen / Consumer Real-World Parameters
  const [consumerState, setConsumerState] = useState(indianStates[0]);
  const [consumerCity, setConsumerCity] = useState("");
  const [consumerPin, setConsumerPin] = useState("");
  const [consumerCategory, setConsumerCategory] = useState(consumerCategories[0]);
  const [consumerPhone, setConsumerPhone] = useState("");

  // 3. Admin Real-World Parameters
  const [adminPost, setAdminPost] = useState(adminDesignations[0]);
  const [adminDepartment, setAdminDepartment] = useState(adminDepartments[0]);
  const [adminGovtCode, setAdminGovtCode] = useState("");
  const [adminClearance, setAdminClearance] = useState("Level 1 - Root Super-Admin (Sec 52 Gazette Authority)");
  const [adminExtension, setAdminExtension] = useState("");
  const [adminSecretKey, setAdminSecretKey] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = roleOptions.find((r) => r.id === selectedRole) || roleOptions[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRole = (role: AccountRole) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
    setError(null);
  };

  // Pre-fill helpers for all 3 roles
  const prefillSampleOfficer = () => {
    setName("Shri Shubham Sharma, ILM");
    setEmail("shubham.sharma@lmd.gov.in");
    setBadgeNumber("LMD-DEL-2024-984");
    setOfficerDesignation(officerDesignations[0]);
    setStatePosting(indianStates[0]);
    setJurisdictionZone("Zone 4 - North-West & Okhla Industrial Division");
    setEmployeeCode("GOI-EMP-784920");
    setOfficialPhone("+91 98765 43210");
    setPassword("OfficerPass@2026");
  };

  const prefillSampleCitizen = () => {
    setName("Shri Aarav Sharma");
    setEmail("aarav.consumer@gmail.com");
    setConsumerState(indianStates[0]);
    setConsumerCity("South Delhi");
    setConsumerPin("110017");
    setConsumerCategory(consumerCategories[0]);
    setConsumerPhone("+91 98112 77890");
    setPassword("CitizenPass@2026");
  };

  const prefillSampleAdmin = () => {
    setName("Dr. Arvind Saxena, IAS");
    setEmail("admin@lmd.gov.in");
    setAdminPost(adminDesignations[0]);
    setAdminDepartment(adminDepartments[0]);
    setAdminGovtCode("IAS-CENT-2016-8942");
    setAdminExtension("+91-11-2338-1234 (Krishi Bhawan)");
    setAdminSecretKey("LMD-CENTRAL-ROOT-2026");
    setPassword("AdminMaster@2026");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          throw new Error("Please enter full name.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }

        if (selectedRole === "officer") {
          // 1. Officer Signup
          const officerMeta: OfficerDetails = {
            badgeNumber: badgeNumber.trim() || "LMD-DEL-2024-984",
            designation: officerDesignation,
            jurisdictionZone: jurisdictionZone.trim() || "State Capital Division",
            statePosting,
            employeeCode: employeeCode.trim() || "GOI-EMP-784920",
            officialPhone: officialPhone.trim() || "+91 98765 43210",
            warrantSection
          };

          const { route } = await registerWithEmail(email, password, selectedRole, name, { officer: officerMeta });
          setSuccessMsg("Enforcement Officer authorized under Section 15! Redirecting to Dashboard...");
          setTimeout(() => router.push(route), 400);

        } else if (selectedRole === "admin") {
          // 2. Admin Signup
          const adminMeta: AdminDetails = {
            adminPost,
            ministryDepartment: adminDepartment,
            centralGovtCode: adminGovtCode.trim() || "IAS-CENT-2016-8942",
            securityClearance: adminClearance,
            officialExtension: adminExtension.trim() || "+91-11-2338-1234",
            adminSecretKey: adminSecretKey.trim() || "LMD-CENTRAL-ROOT-2026"
          };

          const { route } = await registerWithEmail(email, password, selectedRole, name, { admin: adminMeta });
          setSuccessMsg("Super-Administrator account registered! Redirecting to Admin Terminal...");
          setTimeout(() => router.push(route), 400);

        } else {
          // 3. Citizen / Consumer Signup
          const consumerMeta: ConsumerDetails = {
            mobilePhone: consumerPhone.trim() || "+91 98112 34567",
            state: consumerState,
            districtCity: consumerCity.trim() || "National Capital Region",
            pinCode: consumerPin.trim() || "110001",
            consumerCategory,
            idProofType: "Aadhaar / National ID"
          };

          const { route } = await registerWithEmail(email, password, selectedRole, name, { consumer: consumerMeta });
          setSuccessMsg("Citizen Consumer registered! Redirecting to Consumer Protection Portal...");
          setTimeout(() => router.push(route), 400);
        }
      } else {
        // Sign in
        const { route } = await loginWithEmail(email, password, selectedRole);
        setSuccessMsg("Authenticated successfully! Redirecting...");
        setTimeout(() => router.push(route), 400);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message || "Authentication failed. Please check credentials.";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) {
        msg = "Invalid email or password. Please verify your credentials.";
      } else if (msg.includes("auth/email-already-in-use")) {
        msg = "This email is already registered. Please sign in instead.";
      } else if (msg.includes("auth/user-not-found")) {
        msg = "No registered user found with this email. Please sign up.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password is too weak. Please use at least 6 characters.";
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const { route } = await loginWithGoogle(selectedRole);
      setSuccessMsg("Google sign-in verified! Redirecting...");
      setTimeout(() => router.push(route), 400);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google Authentication failed. Please retry.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (role: AccountRole) => {
    setSelectedRole(role);
    setError(null);
    setMode("signin");
    const opt = roleOptions.find(r => r.id === role);
    if (opt) {
      setEmail(opt.defaultEmail);
      setPassword("password123");
    }
  };

  const ActiveIcon = activeOption.icon;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center relative overflow-hidden text-slate-900 font-sans py-10 px-4">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#0B2559]/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-amber-500/10 blur-[120px]" />
      
      <div className={clsx("relative w-full z-10 transition-all duration-300", mode === "signup" ? "max-w-2xl" : "max-w-md")}>
        {/* Emblem Header matching Main Homepage */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="w-16 h-16 bg-[#0B2559] border-2 border-amber-400 rounded-2xl flex items-center justify-center shadow-md mb-3">
            <Shield className="w-9 h-9 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2559] tracking-tight">
            Packaged Commodities Compliance Portal
          </h1>
          <p className="text-gray-600 text-xs italic font-serif mt-1">
            Transparent Weights. Trusted Consumers. Stronger India.
          </p>
          <p className="text-[#0B2559] text-[11px] mt-1.5 uppercase tracking-wider font-extrabold">
            Department of Consumer Affairs • Govt. of India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
            <span className="text-[10px] text-[#0B2559] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
              Legal Metrology Act 2009 • PCR 2011
            </span>
            <span className={clsx(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border",
              isFirebaseReady 
                ? "bg-amber-100 text-amber-800 border-amber-300" 
                : "bg-blue-100 text-[#0B2559] border-blue-200"
            )}>
              <Flame className="w-3 h-3 text-amber-600" />
              {isFirebaseReady ? "Firebase Live" : "Auth Ready"}
            </span>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xl space-y-5">
          
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className={clsx(
                "flex-1 py-2 rounded-lg transition-all text-center",
                mode === "signin" ? "bg-[#0B2559] text-white shadow-sm font-bold" : "text-gray-600 hover:text-slate-900 font-medium"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={clsx(
                "flex-1 py-2 rounded-lg transition-all text-center",
                mode === "signup" ? "bg-[#0B2559] text-white shadow-sm font-bold" : "text-gray-600 hover:text-slate-900 font-medium"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google 1-Click Auth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting || authLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-300 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-xs hover:border-gray-400 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>{mode === "signin" ? "Sign in with Google" : "Quick Sign up with Google"}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Or with role parameters</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 3-Option Role Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[11px] font-bold text-[#0B2559] uppercase tracking-wider mb-1.5">
                Selected Account Role
              </label>

              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 border border-gray-300 text-left hover:border-gray-400 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0B2559]/30"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="p-1.5 rounded-xl bg-white border border-gray-200 text-[#0B2559] shadow-2xs">
                    <ActiveIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-sm font-extrabold text-[#0B2559] block">
                      {activeOption.title}
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate font-medium">
                      {activeOption.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={clsx(
                    "w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ml-2",
                    isDropdownOpen ? "rotate-180 text-[#0B2559]" : ""
                  )}
                />
              </button>

              {/* Dropdown Menu Items */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-2xl p-2 shadow-xl space-y-1">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = opt.id === selectedRole;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectRole(opt.id)}
                        className={clsx(
                          "w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group cursor-pointer",
                          isSelected
                            ? "bg-blue-50 border border-blue-200 shadow-xs"
                            : "hover:bg-gray-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="p-1.5 rounded-xl bg-white border border-gray-200 text-[#0B2559]">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 block">
                              {opt.title}
                            </span>
                            <span className="text-[10px] text-gray-500 block truncate">
                              {opt.subtitle}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0B2559] shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* 1. ROLE: OFFICER SIGNUP PARAMETERS                             */}
            {/* ============================================================== */}
            {mode === "signup" && selectedRole === "officer" && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0B2559]">
                    <BadgeAlert className="w-4 h-4 text-[#0B2559]" />
                    <span className="font-bold text-xs uppercase tracking-wide">
                      Enforcement Officer Service Parameters
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={prefillSampleOfficer}
                    className="text-[10px] text-white bg-[#0B2559] hover:bg-[#07193d] px-2.5 py-1 rounded-lg border border-blue-900 font-bold transition-colors shadow-xs"
                  >
                    ⚡ Pre-fill Sample Officer
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Officer Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Shri Shubham Sharma, ILM"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-[#0B2559]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Govt Email (@lmd.gov.in / @nic.in) *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="shubham.sharma@lmd.gov.in"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-[#0B2559]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Warrant / Service Badge No. *
                    </label>
                    <div className="relative">
                      <IdCard className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder="LMD-DEL-2024-984"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#0B2559]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Govt Employee / HRMS Code *
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        placeholder="GOI-EMP-784920"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#0B2559]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Rank / Designation *
                    </label>
                    <select
                      value={officerDesignation}
                      onChange={(e) => setOfficerDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#0B2559]"
                    >
                      {officerDesignations.map((des) => (
                        <option key={des} value={des} className="bg-white text-slate-900">
                          {des}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      State / UT Posting *
                    </label>
                    <select
                      value={statePosting}
                      onChange={(e) => setStatePosting(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#0B2559]"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st} className="bg-white text-slate-900">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Jurisdiction / Inspection Circle *
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={jurisdictionZone}
                        onChange={(e) => setJurisdictionZone(e.target.value)}
                        placeholder="Zone 4 - North-West Division"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-[#0B2559]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Official Field Mobile (OTP / 2FA) *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={officialPhone}
                        onChange={(e) => setOfficialPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-[#0B2559]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-xs text-[#0B2559]">
                  <FileCheck2 className="w-4 h-4 text-[#0B2559] shrink-0" />
                  <span className="text-[11px] leading-tight font-medium">
                    <strong>Statutory Authorization:</strong> {warrantSection} (Search, Sample Seizure & Notice Powers).
                  </span>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 2. ROLE: CITIZEN / CONSUMER SIGNUP PARAMETERS                  */}
            {/* ============================================================== */}
            {mode === "signup" && selectedRole === "user" && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-xs uppercase tracking-wide">
                      Citizen Consumer Profile (National Grievance Portal)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={prefillSampleCitizen}
                    className="text-[10px] text-white bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-800 font-bold transition-colors shadow-xs"
                  >
                    ⚡ Pre-fill Sample Citizen
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aarav.consumer@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Mobile Number (SMS Complaint OTP) *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={consumerPhone}
                        onChange={(e) => setConsumerPhone(e.target.value)}
                        placeholder="+91 98112 77890"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Consumer Category *
                    </label>
                    <select
                      value={consumerCategory}
                      onChange={(e) => setConsumerCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                    >
                      {consumerCategories.map((cat) => (
                        <option key={cat} value={cat} className="bg-white text-slate-900">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      State / UT of Residence *
                    </label>
                    <select
                      value={consumerState}
                      onChange={(e) => setConsumerState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st} className="bg-white text-slate-900">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      City / District & Postal PIN *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={consumerCity}
                        onChange={(e) => setConsumerCity(e.target.value)}
                        placeholder="South Delhi"
                        className="w-full px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={consumerPin}
                        onChange={(e) => setConsumerPin(e.target.value)}
                        placeholder="110017"
                        className="w-full px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-[11px] leading-tight font-medium">
                    <strong>Consumer Rights Protected:</strong> Section 36, Legal Metrology Act (Protection against dual pricing & charging above MRP).
                  </span>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. ROLE: CENTRAL ADMIN SIGNUP PARAMETERS                       */}
            {/* ============================================================== */}
            {mode === "signup" && selectedRole === "admin" && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-800">
                    <Landmark className="w-4 h-4 text-purple-700" />
                    <span className="font-bold text-xs uppercase tracking-wide">
                      Central Directorate Super-Administrator
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={prefillSampleAdmin}
                    className="text-[10px] text-white bg-purple-700 hover:bg-purple-800 px-2.5 py-1 rounded-lg border border-purple-800 font-bold transition-colors shadow-xs"
                  >
                    ⚡ Pre-fill Sample Admin
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Administrator Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Arvind Saxena, IAS"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Official Ministry Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@lmd.gov.in"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Central Civil Service / PPO Code *
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={adminGovtCode}
                        onChange={(e) => setAdminGovtCode(e.target.value)}
                        placeholder="IAS-CENT-2016-8942"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs font-mono focus:bg-white focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Direct Ministry Landline / Ext. *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={adminExtension}
                        onChange={(e) => setAdminExtension(e.target.value)}
                        placeholder="+91-11-2338-1234 (Krishi Bhawan)"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Administrative Post / Designation *
                    </label>
                    <select
                      value={adminPost}
                      onChange={(e) => setAdminPost(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                    >
                      {adminDesignations.map((des) => (
                        <option key={des} value={des} className="bg-white text-slate-900">
                          {des}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Ministry Division / Cadre *
                    </label>
                    <select
                      value={adminDepartment}
                      onChange={(e) => setAdminDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                    >
                      {adminDepartments.map((dept) => (
                        <option key={dept} value={dept} className="bg-white text-slate-900">
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Central Master Authorization Key *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={adminSecretKey}
                        onChange={(e) => setAdminSecretKey(e.target.value)}
                        placeholder="LMD-CENTRAL-ROOT-2026"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs font-mono focus:bg-white focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2.5 text-xs text-purple-900">
                  <Landmark className="w-4 h-4 text-purple-700 shrink-0" />
                  <span className="text-[11px] leading-tight font-medium">
                    <strong>Rule-Making Clearance:</strong> Section 52, Legal Metrology Act (Power to make, amend and notify Central PC Rules).
                  </span>
                </div>
              </div>
            )}

            {/* DEFAULT SIGN IN INPUTS (When mode is signin) */}
            {mode === "signin" && (
              <div>
                <label className="block text-[11px] font-bold text-[#0B2559] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@lmd.gov.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-[#0B2559] focus:ring-1 focus:ring-[#0B2559]"
                  />
                </div>
              </div>
            )}

            {/* Password Input (Universal) */}
            <div>
              <label className="block text-[11px] font-bold text-[#0B2559] uppercase tracking-wider mb-1.5">
                {mode === "signup" ? "Set Access Password *" : "Password"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-slate-900 placeholder-gray-400 text-xs focus:bg-white focus:outline-none focus:border-[#0B2559] focus:ring-1 focus:ring-[#0B2559]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className={clsx(
                "w-full py-3 rounded-xl font-extrabold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-[0.99] cursor-pointer",
                selectedRole === "admin"
                  ? "bg-purple-700 hover:bg-purple-800 shadow-purple-700/20"
                  : selectedRole === "user"
                  ? "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20"
                  : "bg-[#0B2559] hover:bg-[#07193d] shadow-blue-900/20"
              )}
            >
              <span>
                {mode === "signin" 
                  ? `Sign In as ${activeOption.title}` 
                  : selectedRole === "officer" 
                  ? "Enrol Enforcement Officer" 
                  : selectedRole === "admin"
                  ? "Authorize Central Administrator"
                  : "Register Consumer Account"}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Fill Chips */}
          <div className="pt-3 border-t border-gray-200">
            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-2 text-center tracking-wider">
              ⚡ 1-Click Instant Credentials (Demo Testing):
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill("officer")}
                className="p-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-white hover:border-[#0B2559] text-slate-700 hover:text-[#0B2559] font-bold transition-all text-center shadow-2xs cursor-pointer"
              >
                🛡️ Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("user")}
                className="p-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-white hover:border-emerald-600 text-slate-700 hover:text-emerald-700 font-bold transition-all text-center shadow-2xs cursor-pointer"
              >
                👥 Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("admin")}
                className="p-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-white hover:border-purple-600 text-slate-700 hover:text-purple-700 font-bold transition-all text-center shadow-2xs cursor-pointer"
              >
                ⚙️ Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
