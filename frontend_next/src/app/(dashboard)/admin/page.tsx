"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Settings,
  CheckCircle2,
  Sliders,
  Scale,
  Database,
  Lock,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  UserCog
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const [ocrThreshold, setOcrThreshold] = useState("0.85");
  const [penalTier1, setPenalTier1] = useState("25000");
  const [penalTier2, setPenalTier2] = useState("50000");
  const [penalTier3, setPenalTier3] = useState("100000");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        const authorized = user.email?.toLowerCase() === "admin@lmd.gov.in" || user.role === "admin";
        setIsAuthorized(authorized);
      } else {
        setIsAuthorized(false);
      }
    } catch (e) {
      console.error(e);
      setIsAuthorized(false);
    }
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const statutoryRules = [
    { id: "LM-001", rule: "Rule 6(1)(a)", desc: "Manufacturer / Packer Name & Address", status: "Active" },
    { id: "LM-002", rule: "Rule 6(1)(b)", desc: "Generic / Common Name of Commodity", status: "Active" },
    { id: "LM-003", rule: "Rule 6(1)(c)", desc: "Net Quantity in Standard Units (Rule 12)", status: "Active" },
    { id: "LM-004", rule: "Rule 6(1)(d)", desc: "Month & Year of Manufacture / Pre-packing", status: "Active" },
    { id: "LM-005", rule: "Rule 6(1)(e)", desc: "Maximum Retail Price (MRP) Inclusive of Taxes", status: "Active" },
    { id: "LM-006", rule: "Rule 6(1)(n)", desc: "Consumer Care Telephone & Email", status: "Active" },
    { id: "LM-007", rule: "Rule 6(1)(f)", desc: "Commodity Unit Sale Price (USP)", status: "Active" },
    { id: "LM-008", rule: "Rule 7", desc: "Minimum Numeral Height (1mm to 6mm by pack size)", status: "Active" },
    { id: "LM-010", rule: "Rule 18(2)", desc: "Dual Pricing & Overcharging Prohibition", status: "Active" },
    { id: "LM-013", rule: "Rule 23", desc: "Cryptographic Tamper-Evident Evidence Hash", status: "Active" }
  ];

  // Access control gate: Only admin@lmd.gov.in can access
  if (isAuthorized === false) {
    return (
      <div className="py-16 max-w-xl mx-auto animate-fade-in">
        <div className="rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center space-y-6 text-slate-900">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0B2559] tracking-tight">
              Admin Terminal Access Restricted
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              This terminal controls core Legal Metrology compliance algorithms, OCR thresholds, and statutory Section 36 penalties.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2 font-medium">
            <div className="flex justify-between items-center text-gray-600">
              <span>Required Authorized Account:</span>
              <span className="font-mono text-[#0B2559] font-bold">admin@lmd.gov.in</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Your Current Active Account:</span>
              <span className="font-mono text-slate-900 font-bold">{currentUser?.email || "officer@lmd.gov.in"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full py-2.5 rounded-xl border border-gray-300 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Return to Officer Dashboard
            </Link>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B2559] hover:bg-[#07193d] text-white text-xs font-extrabold transition-all shadow-md"
            >
              Sign In with admin@lmd.gov.in
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="py-20 text-center text-gray-500 text-sm font-medium">
        Verifying administrative authorization...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] tracking-tight">
              Administrative &amp; Rule Engine Settings
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B2559] font-mono font-bold">
              admin@lmd.gov.in • Super-Admin
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Configure Legal Metrology (Packaged Commodities) Rule parameters, OCR thresholds &amp; statutory penalties
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Regulatory enforcement settings updated successfully.
        </div>
      )}

      {/* Grid: Config Form & System Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rule Engine & Penalty Thresholds */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveConfig} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5 text-slate-900">
            <div className="flex items-center gap-2 text-[#0B2559] font-extrabold text-base">
              <Sliders className="w-5 h-5 text-[#0B2559]" />
              <h3>Enforcement Parameters &amp; Thresholds</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  AI OCR Confidence Cutoff (0.0 to 1.0)
                </label>
                <input
                  type="text"
                  value={ocrThreshold}
                  onChange={(e) => setOcrThreshold(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                />
                <span className="text-[10px] text-gray-500 mt-1 block font-medium">
                  Declarations below this score trigger mandatory officer review.
                </span>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Cryptographic Integrity Verification
                </label>
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> SHA-256 Enabled
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block font-medium">
                  Mandatory under SIH 2026 tamper-evident evidence requirements.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-3">
              <h4 className="text-xs font-extrabold text-[#0B2559] uppercase tracking-wider">
                Section 36 Statutory Fine Scale (INR)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
                <div>
                  <span className="text-gray-600 block font-semibold">First Offence (₹)</span>
                  <input
                    type="text"
                    value={penalTier1}
                    onChange={(e) => setPenalTier1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 font-mono font-bold mt-1"
                  />
                </div>
                <div>
                  <span className="text-gray-600 block font-semibold">Second Offence (₹)</span>
                  <input
                    type="text"
                    value={penalTier2}
                    onChange={(e) => setPenalTier2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-amber-700 font-mono font-bold mt-1"
                  />
                </div>
                <div>
                  <span className="text-gray-600 block font-semibold">Subsequent Offence (₹)</span>
                  <input
                    type="text"
                    value={penalTier3}
                    onChange={(e) => setPenalTier3(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-rose-700 font-mono font-bold mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0B2559] hover:bg-[#07193d] text-white font-extrabold text-xs shadow-md transition-all"
              >
                Save Configuration
              </button>
            </div>
          </form>

          {/* Active Legal Metrology Rule Registry */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center gap-2 text-[#0B2559] font-extrabold text-base">
              <Scale className="w-5 h-5 text-[#0B2559]" />
              <h3>Statutory Rule Registry (PCR 2011)</h3>
            </div>

            <div className="divide-y divide-gray-200 text-xs font-medium">
              {statutoryRules.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#0B2559] font-bold">{r.id}</span>
                      <span className="font-extrabold text-slate-900">{r.rule}</span>
                    </div>
                    <p className="text-gray-600 text-[11px] mt-0.5">{r.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Admin Officers & Database Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 text-xs text-slate-900">
            <div className="flex items-center gap-2 text-[#0B2559] font-extrabold text-base">
              <Users className="w-5 h-5 text-[#0B2559]" />
              <h3>Officer Roles &amp; Access</h3>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1 font-medium">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">Central Admin</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#0B2559] font-bold">Super-Admin</span>
              </div>
              <span className="text-[#0B2559] font-mono text-[11px] block font-bold">admin@lmd.gov.in</span>
              <span className="text-[10px] text-emerald-700 block font-bold">Status: Root Policy Controller</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1 font-medium">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">Inspector Rajesh Sharma</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-slate-800 font-bold">Officer</span>
              </div>
              <span className="text-slate-700 font-mono text-[11px] block font-semibold">officer@lmd.gov.in</span>
              <span className="text-[10px] text-emerald-700 block font-bold">Status: Active Field Auditor</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3 text-xs text-slate-900 font-medium">
            <div className="flex items-center gap-2 text-[#0B2559] font-extrabold text-base">
              <Database className="w-5 h-5 text-[#0B2559]" />
              <h3>Backend Storage Engine</h3>
            </div>
            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Database Engine:</span>
                <span className="font-mono text-slate-900 font-bold">SQLite Central Store</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">API Endpoint:</span>
                <span className="font-mono text-[#0B2559] font-bold">127.0.0.1:8000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">OCR Engine:</span>
                <span className="font-mono text-emerald-700 font-bold">EasyOCR PyTorch 2.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hashing:</span>
                <span className="font-mono text-[#0B2559] font-bold">SHA-256 Immutable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
