"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Search,
  Gavel,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Building,
  Scale,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function AnalyticsPage() {
  const [matrixData, setMatrixData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [matrixRes, catRes] = await Promise.all([
        fetch("/api/analytics/risk_matrix"),
        fetch("/api/analytics/category_distribution")
      ]);

      if (!matrixRes.ok) throw new Error("Failed to fetch risk matrix");
      const matrix = await matrixRes.json();
      setMatrixData(matrix);

      if (catRes.ok) {
        const cat = await catRes.json();
        setCategoryData(cat.categories || []);
      }
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to load risk analytics from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const profiles = matrixData?.profiles || [];

  const dist = matrixData?.risk_distribution || {
    critical: 0,
    high: 0,
    medium: 0,
    low: profiles.length
  };

  const filteredProfiles = profiles.filter((p: any) => {
    const matchesSearch = p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === "ALL" || p.risk_level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] tracking-tight">
              Risk Prioritization &amp; Manufacturer Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-[#0B2559]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Core USP #2
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Data-driven manufacturer risk intelligence under Section 36 to target repeat offenders &amp; prioritize field enforcement audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-300 bg-white text-slate-700 hover:bg-gray-100 transition-colors shadow-2xs"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 text-[#0B2559] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/scan"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B2559] hover:bg-[#07193d] rounded-xl text-sm font-extrabold text-white transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            Schedule Priority Audit
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* 4-Tier Risk Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">
              Critical Risk
            </span>
            <div className="text-3xl font-extrabold text-rose-950 mt-1">{dist.critical}</div>
            <span className="text-[11px] text-rose-700 font-semibold">Immediate Seizure / Court</span>
          </div>
          <div className="p-3 bg-rose-100 border border-rose-200 rounded-xl text-rose-800">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
              High Risk
            </span>
            <div className="text-3xl font-extrabold text-amber-950 mt-1">{dist.high}</div>
            <span className="text-[11px] text-amber-700 font-semibold">Repeat Offender Multiplier</span>
          </div>
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B2559]">
              Medium Risk
            </span>
            <div className="text-3xl font-extrabold text-[#0B2559] mt-1">{dist.medium}</div>
            <span className="text-[11px] text-slate-600 font-semibold">Scheduled Audit Watchlist</span>
          </div>
          <div className="p-3 bg-blue-100 border border-blue-200 rounded-xl text-[#0B2559]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Low Risk / Compliant
            </span>
            <div className="text-3xl font-extrabold text-emerald-950 mt-1">{dist.low}</div>
            <span className="text-[11px] text-emerald-700 font-semibold">Clean Statutory Standing</span>
          </div>
          <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-white text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0B2559] focus:border-[#0B2559] sm:text-sm font-medium"
            placeholder="Search manufacturer by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterLevel === lvl
                  ? "bg-[#0B2559] text-white shadow-xs"
                  : "bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-300 font-semibold"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Manufacturer Risk Matrix Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-[#0B2559]" />
            <h3 className="text-sm font-extrabold text-[#0B2559]">
              Section 36 Enforcement &amp; Repeat Offender Index
            </h3>
          </div>
          <span className="text-xs text-gray-600 font-mono font-bold">
            Fine Tiers: ₹25k / ₹50k / ₹100k + Imprisonment
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-900">
            <thead className="text-xs uppercase text-gray-600 bg-gray-50 border-b border-gray-200 font-bold">
              <tr>
                <th className="px-6 py-4 font-bold">Manufacturer Entity</th>
                <th className="px-6 py-4 font-bold text-center">Risk Level</th>
                <th className="px-6 py-4 font-bold text-center">Inspections</th>
                <th className="px-6 py-4 font-bold text-center">Repeat Violations</th>
                <th className="px-6 py-4 font-bold">Section 36 Penalty Tier</th>
                <th className="px-6 py-4 font-bold">Recommended Enforcement Action</th>
                <th className="px-6 py-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProfiles.map((p: any, idx: number) => {
                const isLow = p.risk_level === "LOW";
                const isMed = p.risk_level === "MEDIUM";
                const isHigh = p.risk_level === "HIGH";
                const isCrit = p.risk_level === "CRITICAL";

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{p.manufacturer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isLow
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : isMed
                            ? "bg-blue-50 text-[#0B2559] border-blue-200"
                            : isHigh
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs font-bold text-slate-800">
                      {p.total_inspections}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-extrabold text-xs">
                      {p.repeat_violation_count > 0 ? (
                        <span className="text-rose-700">{p.repeat_violation_count}</span>
                      ) : (
                        <span className="text-emerald-700">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {p.penalty_tier}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                      {p.recommended_action}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href="/scan"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#0B2559] border border-blue-200 transition-colors shadow-2xs"
                      >
                        Audit Commodity
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                    No manufacturers match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
