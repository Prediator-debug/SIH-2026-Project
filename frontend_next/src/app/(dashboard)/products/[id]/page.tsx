"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Barcode,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Scale,
  Calendar,
  Sparkles
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const products = await res.json();
          const found = products.find((p: any) => p.id === id) || products[0];
          setProduct(found);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading || !product) {
    return (
      <div className="py-20 text-center text-gray-500 font-medium">
        Loading commodity specifications...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2.5 bg-white rounded-xl hover:bg-gray-100 transition-colors text-slate-700 hover:text-[#0B2559] border border-gray-300 shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0B2559] px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                {product.id}
              </span>
              <h1 className="text-2xl font-extrabold text-[#0B2559] tracking-tight">
                {product.name}
              </h1>
            </div>
            <p className="text-gray-600 text-xs mt-1 font-medium">
              {product.manufacturer} • {product.category}
            </p>
          </div>
        </div>

        <Link
          href="/scan"
          className="flex items-center gap-2 px-4 py-2 bg-[#0B2559] hover:bg-[#07193d] rounded-xl text-xs font-extrabold text-white transition-all shadow-md"
        >
          <Scale className="w-4 h-4 text-amber-400" />
          Scan Packaged Unit
        </Link>
      </div>

      {/* Commodity Specifications Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6 text-slate-900">
        <h3 className="text-sm font-extrabold text-[#0B2559] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0B2559]" /> Statutory Pre-Registration Record
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-gray-500 block uppercase font-bold">Registered Barcode (EAN)</span>
            <span className="font-mono text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Barcode className="w-5 h-5 text-[#0B2559]" />
              {product.barcode || "8901234567890"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-gray-500 block uppercase font-bold">Standard Metric Quantity</span>
            <span className="font-mono text-base font-extrabold text-[#0B2559]">
              {product.standard_net_qty || "100g"}
            </span>
            <span className="text-[10px] text-gray-500 block font-medium">Rule 12 Standard Units</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-gray-500 block uppercase font-bold">Registered MRP</span>
            <span className="font-mono text-base font-extrabold text-emerald-700">
              {product.standard_mrp || "₹125.00"}
            </span>
            <span className="text-[10px] text-gray-500 block font-medium">Inclusive of all taxes</span>
          </div>
        </div>

        {/* Legal Metrology Requirements for this category */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-[#0B2559] uppercase tracking-wider">
            Mandatory Declarations Required Under Rule 6(1)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2.5 font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rule 6(1)(a) — Complete Name &amp; Address of Manufacturer / Packer</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2.5 font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rule 6(1)(b) — Generic Name of Packaged Commodity</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2.5 font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rule 6(1)(c) — Net Quantity in Standard Metric Units (g/kg/ml/l)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2.5 font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rule 6(1)(d) — Month and Year of Manufacture or Pre-packing</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2.5 font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rule 6(1)(e) — Maximum Retail Price (MRP) 'incl. of all taxes'</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2.5 font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rule 6(1)(n) — Consumer Care Contact Details (Name, Address, Tel, Email)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
