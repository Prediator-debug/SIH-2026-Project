"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Award
} from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const json = await res.json();
      setData(json);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to Legal Metrology backend service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalScans = data?.total_scans ?? data?.total_inspections ?? 0;
  const complianceRate = data?.compliance_rate ?? 0;
  const activeViolations = data?.active_violations ?? data?.non_compliant_products ?? 0;
  const productsScanned = data?.products_scanned ?? 0;
  const trends = data?.trends || {
    total_scans: "0%",
    compliance_rate: "0%",
    active_violations: "0%",
    products_scanned: "0%"
  };

  const monthlyTrends = data?.monthly_trends || [];
  const violationTypes = data?.violation_types || [];
  const categoryData = data?.category_data || [];
  const recentScans = data?.recent_scans || [];

  const stats = [
    {
      title: "Total Inspections",
      value: totalScans.toLocaleString(),
      trend: trends.total_scans,
      isPositive: true,
      icon: ScanLine,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Compliance Rate",
      value: `${complianceRate}%`,
      trend: trends.compliance_rate,
      isPositive: true,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Active Violations",
      value: activeViolations.toLocaleString(),
      trend: trends.active_violations,
      isPositive: false,
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Products Cataloged",
      value: productsScanned.toLocaleString(),
      trend: trends.products_scanned,
      isPositive: true,
      icon: Package,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] tracking-tight">
              Enforcement Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 border border-emerald-300 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              PCR 2011 Rule Engine Live
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Department of Consumer Affairs • Legal Metrology (Packaged Commodities) Rules Enforcement Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-300 bg-white text-slate-700 hover:bg-gray-100 transition-colors shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-[#0B2559] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/scan"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2559] hover:bg-[#07193d] text-white font-bold text-sm shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            New Inspection Scan
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="underline text-xs hover:text-slate-900 font-bold">Retry</button>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {stat.title}
                  </span>
                  <div className="text-3xl font-extrabold text-[#0B2559] tracking-tight">
                    {stat.value}
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 flex items-center text-xs">
                {stat.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-600 mr-1" />
                )}
                <span className={`font-bold ${stat.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {stat.trend}
                </span>
                <span className="text-gray-500 ml-1.5 font-medium">vs past 30 days</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Top: Trends Area Chart (2 cols) + Statutory Breakdown Donut (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Trends Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0B2559]">Compliance Progression Trend</h2>
              <p className="text-xs text-gray-600 mt-0.5 font-medium">12-Month field audit compliance score trajectory</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0B2559] font-mono font-bold">
                Avg: {complianceRate}%
              </span>
            </div>
          </div>

          {monthlyTrends.length > 0 ? (
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B2559" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0B2559" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#cbd5e1",
                      borderRadius: "12px",
                      color: "#0f172a",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }}
                    itemStyle={{ color: "#0B2559", fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="compliance_rate"
                    name="Compliance %"
                    stroke="#0B2559"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCompliance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[290px] w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 rounded-xl">
              <ScanLine className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-slate-800">No monthly audit trends yet</p>
              <p className="text-xs text-gray-500 mt-1">Conducted field inspections will plot compliance trajectory over time.</p>
            </div>
          )}
        </div>

        {/* Violation Breakdown Donut Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#0B2559]">Statutory Infractions</h2>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">Violations logged by Legal Metrology rule</p>
          </div>

          {violationTypes.length > 0 ? (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={violationTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {violationTypes.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#cbd5e1",
                        borderRadius: "12px",
                        color: "#0f172a"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-gray-200">
                {violationTypes.slice(0, 4).map((v: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-[11px] text-gray-600 truncate font-medium">{v.name}</span>
                    <span className="text-[11px] font-bold text-slate-900 ml-auto font-mono">{v.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 rounded-xl my-auto">
              <ShieldCheck className="w-10 h-10 text-emerald-600/60 mb-2" />
              <p className="text-sm font-semibold text-slate-800">No active violations recorded</p>
              <p className="text-xs text-gray-500 mt-1">Statutory infractions will appear here upon inspection evaluation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Grid Bottom: Category Bar Chart + Recent Scans Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance by Category */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0B2559]">Category Verification</h2>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">Compliant vs violation audits per commodity sector</p>
          </div>

          {categoryData.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fill: "#475569", fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#cbd5e1",
                      borderRadius: "12px",
                      color: "#0f172a"
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#475569", fontSize: "0.8rem", paddingTop: "8px" }} />
                  <Bar dataKey="compliant" name="Compliant" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="non_compliant" name="Violations" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 rounded-xl">
              <Package className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-slate-800">No category audit records</p>
              <p className="text-xs text-gray-500 mt-1">Audit counts per commodity category will be charted here.</p>
            </div>
          )}
        </div>

        {/* Recent Scans Table */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0B2559]">Recent Inspections Log</h2>
              <p className="text-xs text-gray-600 mt-0.5 font-medium">Commodities evaluated under Section 6 declarations</p>
            </div>
            <Link
              href="/inspections"
              className="text-xs font-bold text-[#0B2559] hover:underline flex items-center gap-1 transition-colors"
            >
              View Full History <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="text-xs uppercase text-gray-600 bg-gray-50 border-b border-gray-200 font-bold">
                <tr>
                  <th className="px-4 py-3 font-bold">Inspection ID</th>
                  <th className="px-4 py-3 font-bold">Product Name</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold text-center">Score</th>
                  <th className="px-4 py-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentScans.length > 0 ? (
                  recentScans.map((scan: any) => {
                    const isCompliant = scan.overall_status === "compliant" || scan.overall_status === "Compliant";
                    return (
                      <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-[#0B2559] font-bold">
                          {scan.id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {scan.product_name}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                          {scan.category}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                          {scan.scan_date || "2026-09-10"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-mono text-xs font-extrabold text-slate-900">
                            {scan.compliance_score || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isCompliant
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
                            }`}
                          >
                            {isCompliant ? "Compliant" : "Non-Compliant"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">
                      No inspection records yet. Perform an AI scan to log your first inspection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
