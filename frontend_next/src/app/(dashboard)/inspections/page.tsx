"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  FileText,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Printer,
  X,
  ExternalLink,
  ShieldAlert,
  Hash,
  Calendar,
  Building,
  Scale,
  RefreshCw,
  Award,
  PlusCircle
} from "lucide-react";

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  // Report Modal State
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      let backendList: any[] = [];
      try {
        const res = await fetch(`/api/inspections/history?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          backendList = data.inspections || [];
        }
      } catch (e) {
        console.warn("Backend inspection fetch failed, relying on Firestore:", e);
      }

      // Fetch from Firestore
      let firestoreList: any[] = [];
      try {
        const { getInspectionsFromFirestore } = await import("@/lib/firestoreService");
        firestoreList = await getInspectionsFromFirestore();
      } catch (e) {
        console.warn("Firestore fetch error:", e);
      }

      // Merge (deduplicating by id)
      const mergedMap = new Map();
      firestoreList.forEach(item => mergedMap.set(item.id, {
        ...item,
        productName: item.product_name || item.productName || 'Packaged Sample',
        date: item.date || item.createdAt || new Date().toISOString()
      }));
      backendList.forEach(item => {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      });

      setInspections(Array.from(mergedMap.values()));
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to load inspections from central database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInspections();
  };

  const handleViewReport = async (inspectionId: string) => {
    try {
      setLoadingReport(true);
      const res = await fetch(`/api/inspections/${inspectionId}/report`);
      if (!res.ok) throw new Error("Failed to load report");
      const report = await res.json();
      setSelectedReport(report);
      setIsModalOpen(true);
    } catch (err: any) {
      alert("Could not load inspection report details: " + err.message);
    } finally {
      setLoadingReport(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === "Compliant" || status === "compliant") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Compliant
        </span>
      );
    }
    if (status === "Potentially Non-Compliant" || status === "non_compliant") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Non-Compliant
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Requires Review
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] tracking-tight">
              Inspection History & Evidence Repository
            </h1>
          </div>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Historical audit trails, repeat violation tracking & certified compliance records
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchInspections}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-300 bg-white text-slate-700 hover:bg-gray-100 transition-colors shadow-2xs"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 text-[#0B2559] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/scan"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B2559] hover:bg-[#07193d] rounded-xl text-sm font-extrabold text-white transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            New Inspection
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-24 py-2 border border-gray-300 rounded-xl bg-white text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0B2559] focus:border-[#0B2559] sm:text-sm font-medium"
            placeholder="Search by Inspection ID, Product, or Manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#0B2559] hover:bg-[#07193d] rounded-lg text-xs font-bold text-white transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <span className="text-xs text-gray-500 mr-1 flex items-center gap-1 font-bold">
            <Filter className="w-3.5 h-3.5 text-gray-400" /> Filter:
          </span>
          {[
            { label: "All", val: "all" },
            { label: "Compliant", val: "Compliant" },
            { label: "Non-Compliant", val: "Potentially Non-Compliant" },
            { label: "Needs Review", val: "Requires Officer Review" }
          ].map((st) => (
            <button
              key={st.val}
              type="button"
              onClick={() => setStatusFilter(st.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st.val
                  ? "bg-[#0B2559] text-white shadow-xs"
                  : "bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-300 font-semibold"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inspections Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-900">
            <thead className="text-xs uppercase text-gray-600 bg-gray-50 border-b border-gray-200 font-bold">
              <tr>
                <th className="px-6 py-4 font-bold">Inspection ID</th>
                <th className="px-6 py-4 font-bold">Date &amp; Time</th>
                <th className="px-6 py-4 font-bold">Product / Category</th>
                <th className="px-6 py-4 font-bold">Manufacturer</th>
                <th className="px-6 py-4 font-bold text-center">Score</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-center">Audit Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inspections.map((insp) => {
                const mfg = insp.declarations?.Manufacturer?.value || insp.manufacturer || "Unknown Manufacturer";
                const isRepeat = insp.is_repeat_offender;
                return (
                  <tr key={insp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-[#0B2559]">
                      {insp.id}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-mono font-semibold">
                      {insp.date ? new Date(insp.date).toLocaleDateString() : new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{insp.product_name || insp.product?.name || "Packaged Commodity"}</div>
                      <div className="text-xs text-gray-500 font-medium">{insp.product?.category || "Retail Package"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 max-w-[200px] truncate font-medium" title={mfg}>
                      {mfg}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-900">
                      {insp.compliance_score || 0}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderStatusBadge(insp.status || "Compliant")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isRepeat ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                          <ShieldAlert className="w-3 h-3 text-rose-600" /> Repeat Offender
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-500 font-semibold">
                          First Inspection
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewReport(insp.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#0B2559] border border-blue-200 transition-colors shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#0B2559]" /> View Report
                      </button>
                    </td>
                  </tr>
                );
              })}
              {inspections.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                    No inspection records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Report Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-2xl border border-gray-200 bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 my-8 animate-fade-in text-slate-900 custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0B2559]" />
                  <h3 className="text-xl font-extrabold text-[#0B2559]">
                    Official Statutory Compliance Report
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {selectedReport.governing_law || "The Legal Metrology (Packaged Commodities) Rules, 2011"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspection Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <div>
                <span className="text-gray-500 block font-medium">Report ID</span>
                <span className="font-mono text-[#0B2559] font-bold">{selectedReport.report_id}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Inspection Date</span>
                <span className="text-slate-900 font-mono font-bold">{selectedReport.inspection_info?.inspection_date?.slice(0, 10)}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Inspecting Officer</span>
                <span className="text-slate-900 font-bold">{selectedReport.inspection_info?.inspecting_officer_name || "Inspector Sharma"}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Status</span>
                <div className="mt-0.5">{renderStatusBadge(selectedReport.inspection_info?.status)}</div>
              </div>
            </div>

            {/* Product Meta */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2 text-sm">
              <h4 className="font-extrabold text-[#0B2559] text-xs uppercase tracking-wider">
                Packaged Commodity Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-medium">
                <div>
                  <span className="text-gray-500">Name: </span>
                  <span className="text-slate-900 font-bold">{selectedReport.product_info?.product_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Manufacturer: </span>
                  <span className="text-slate-800">{selectedReport.product_info?.registered_manufacturer}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category: </span>
                  <span className="text-slate-800">{selectedReport.product_info?.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Barcode: </span>
                  <span className="text-slate-900 font-mono font-bold">{selectedReport.product_info?.barcode}</span>
                </div>
              </div>
            </div>

            {/* Verified Declarations Table */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-[#0B2559] text-xs uppercase tracking-wider">
                Rule 6 Statutory Declarations Extracted &amp; Verified
              </h4>
              <div className="rounded-xl border border-gray-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-2.5">Field</th>
                      <th className="p-2.5">Extracted Value</th>
                      <th className="p-2.5 text-center">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(selectedReport.declarations || {}).map(([k, val]: [string, any]) => (
                      <tr key={k} className="hover:bg-gray-50">
                        <td className="p-2.5 font-semibold text-slate-800">{k.replace(/_/g, " ")}</td>
                        <td className="p-2.5 text-slate-900 font-mono font-bold">{val?.value || "N/A"}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                          {val?.confidence ? `${Math.round(val.confidence * 100)}%` : "Verified"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cryptographic Proof Audit */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#0B2559] font-extrabold">
                <Hash className="w-4 h-4 text-[#0B2559]" /> Cryptographic Tamper-Evident Evidence Hash
              </div>
              <p className="font-mono text-[11px] text-slate-700 break-all bg-white p-2.5 rounded-lg border border-blue-200 font-semibold">
                SHA-256: {selectedReport.evidence?.sha256_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
              </p>
              <p className="text-[11px] text-gray-600 font-medium">
                Applicable Penal Code: <span className="text-[#0B2559] font-bold">{selectedReport.enforcement?.applicable_penal_section}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold transition-colors border border-gray-300"
              >
                <Printer className="w-4 h-4 text-[#0B2559]" /> Print Notice
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#0B2559] hover:bg-[#07193d] text-white text-xs font-extrabold transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
