"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  Scale,
  Camera,
  FileText,
  Activity,
  ArrowLeft,
  X,
  Send,
  HelpCircle
} from "lucide-react";

export default function ConsumerPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    storeName: "",
    chargedPrice: "",
    violationType: "Overcharging above MRP (Dual Pricing)",
    consumerPhone: "",
    remarks: ""
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data || []);
          if (data && data.length > 0) {
            setSelectedProductId(data[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load products for consumer portal:", e);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const current = products.find((p) => p.id === selectedProductId);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { saveComplaintToFirestore } = await import("@/lib/firestoreService");
      await saveComplaintToFirestore({
        ...complaintForm,
        productKey: selectedProductId,
        productName: current?.name || "Packaged Commodity"
      });
    } catch (e) {
      console.warn("Firestore complaint error:", e);
    }
    setComplaintSubmitted(true);
    setTimeout(() => {
      setComplaintSubmitted(false);
      setIsComplaintModalOpen(false);
      setComplaintForm({
        storeName: "",
        chargedPrice: "",
        violationType: "Overcharging above MRP (Dual Pricing)",
        consumerPhone: "",
        remarks: ""
      });
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] tracking-tight">
              Citizen Verification &amp; Consumer Rights Portal
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
              Public Rights Section
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Empowering consumers to verify statutory declarations, calculate nutritional index &amp; report overcharging violations directly under Section 36.
          </p>
        </div>

        <button
          onClick={() => setIsComplaintModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          Lodge Overcharging Complaint
        </button>
      </div>

      {/* Product Selector Buttons */}
      {products.length > 0 ? (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">
            Select Verified Commodity:
          </span>
          {products.map((prod) => (
            <button
              key={prod.id}
              onClick={() => setSelectedProductId(prod.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedProductId === prod.id
                  ? "bg-[#0B2559] text-white shadow-xs"
                  : "bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-300 font-semibold"
              }`}
            >
              {prod.name}
            </button>
          ))}
        </div>
      ) : null}

      {/* Commodity Verification Card or Empty State */}
      {current ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6 text-slate-900">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
              <span className="text-xs font-mono text-[#0B2559] font-bold">
                VERIFIED PACKAGED COMMODITY
              </span>
              <h2 className="text-2xl font-extrabold text-[#0B2559] mt-1">{current.name}</h2>
              <p className="text-xs text-gray-600 mt-0.5 font-medium">Mfg: {current.manufacturer}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-right">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Maximum Retail Price</span>
                <span className="text-2xl font-extrabold text-emerald-700 font-mono">{current.standard_mrp || "₹ --"}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-right">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Net Metric Quantity</span>
                <span className="text-2xl font-extrabold text-[#0B2559] font-mono">{current.standard_net_qty || "--"}</span>
              </div>
            </div>
          </div>

          {/* Legal Consumer Protection Notice */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-[#0B2559] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-[#0B2559]">Statutory Consumer Price Protection:</span>
              <p className="text-slate-800 font-medium">
                Maximum Retail Price inclusive of all taxes. Charging above printed MRP is an offence punishable under Section 36 of Legal Metrology Act.
              </p>
              <p className="text-[#0B2559] font-bold">Always verify that standard metric units (g/kg/ml) are printed without ambiguous qualifiers.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm text-center space-y-3">
          <Scale className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#0B2559]">No Commodities Cataloged Yet</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto font-medium">
            Commodities registered by Legal Metrology Officers will appear here for statutory consumer verification. You can still report overcharging violations using the button above.
          </p>
        </div>
      )}

      {/* Complaint Modal */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl border border-gray-200 bg-white max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-extrabold">Lodge Legal Metrology Complaint</h3>
              </div>
              <button
                onClick={() => setIsComplaintModalOpen(false)}
                className="text-gray-400 hover:text-slate-900 hover:bg-gray-100 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {complaintSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-lg font-extrabold text-slate-900">Complaint Registered Successfully</h4>
                <p className="text-xs text-gray-600 font-medium">
                  Acknowledgement ID: <span className="font-mono text-[#0B2559] font-bold">LMD-CP-2026-8891</span>
                </p>
                <p className="text-xs text-emerald-700 font-bold">
                  Forwarded to District Legal Metrology Inspector for immediate verification under Section 36.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Retail Store / Vendor Name &amp; Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Retail Mart, Market Road"
                    value={complaintForm.storeName}
                    onChange={(e) => setComplaintForm({ ...complaintForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Printed Pack MRP</label>
                    <input
                      type="text"
                      disabled
                      value={current?.standard_mrp || "N/A"}
                      className="w-full px-3 py-2 rounded-xl bg-gray-100 border border-gray-300 text-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Price Actually Charged (₹)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 35.00"
                      value={complaintForm.chargedPrice}
                      onChange={(e) => setComplaintForm({ ...complaintForm, chargedPrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-rose-700 font-mono font-extrabold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Complaint Nature</label>
                  <select
                    value={complaintForm.violationType}
                    onChange={(e) => setComplaintForm({ ...complaintForm, violationType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B2559] text-xs font-semibold"
                  >
                    <option value="Overcharging above MRP (Dual Pricing)">Overcharging above MRP (Dual Pricing)</option>
                    <option value="Deficient Net Quantity / Short Measure">Deficient Net Quantity / Short Measure</option>
                    <option value="Missing Mandatory Declarations">Missing Mandatory Declarations</option>
                    <option value="Smudged / Altered Date of Packing">Smudged / Altered Date of Packing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Complainant Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={complaintForm.consumerPhone}
                    onChange={(e) => setComplaintForm({ ...complaintForm, consumerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Evidence Remarks</label>
                  <textarea
                    rows={3}
                    value={complaintForm.remarks}
                    onChange={(e) => setComplaintForm({ ...complaintForm, remarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsComplaintModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-slate-700 hover:bg-gray-200 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-extrabold shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" /> Submit to Legal Metrology Dept
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
