"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Barcode,
  Building2,
  Tag,
  CheckCircle2,
  X,
  RefreshCw,
  PackageCheck
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  barcode?: string;
  standard_net_qty?: string;
  standard_mrp?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    manufacturer: "",
    category: "Food & Beverage",
    barcode: "",
    standard_net_qty: "",
    standard_mrp: ""
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch registered commodities");
      const data = await res.json();
      setProducts(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to load products repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.manufacturer) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
      if (!res.ok) throw new Error("Failed to add product");
      setIsModalOpen(false);
      setNewProduct({
        name: "",
        manufacturer: "",
        category: "Food & Beverage",
        barcode: "",
        standard_net_qty: "",
        standard_mrp: ""
      });
      await fetchProducts();
    } catch (err: any) {
      alert("Could not register product: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["ALL", "Food & Beverage", "Dairy Products", "Staples & Flour", "FMCG / General"];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "ALL" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] tracking-tight">
              Registered Commodities Repository
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B2559] font-mono font-bold">
              {products.length} Items Cataloged
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Pre-registered packaged commodity standards database for automated discrepancy cross-verification
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-300 bg-white text-slate-700 hover:bg-gray-100 transition-colors shadow-2xs"
            title="Refresh Products"
          >
            <RefreshCw className={`w-4 h-4 text-[#0B2559] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B2559] hover:bg-[#07193d] rounded-xl text-sm font-extrabold text-white transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Register Commodity
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-white text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0B2559] focus:border-[#0B2559] sm:text-sm font-medium"
            placeholder="Search by Product Name, Manufacturer, Barcode, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#0B2559] text-white shadow-xs"
                  : "bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-300 font-semibold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-gray-100 rounded-xl border border-gray-300 p-1 shrink-0">
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-lg transition-colors ${
              view === "grid" ? "bg-white text-[#0B2559] shadow-2xs font-bold" : "text-gray-500 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-lg transition-colors ${
              view === "list" ? "bg-white text-[#0B2559] shadow-2xs font-bold" : "text-gray-500 hover:text-slate-900"
            }`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid or List View */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-[#0B2559] hover:shadow-md shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs text-[#0B2559] font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {product.id}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-gray-100 border border-gray-300 text-slate-800">
                    {product.category}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#0B2559] line-clamp-1 mb-1">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{product.manufacturer}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1 font-medium">
                    <Barcode className="w-3.5 h-3.5 text-gray-400" /> Barcode
                  </span>
                  <span className="font-mono text-slate-900 font-bold">{product.barcode || "N/A"}</span>
                </div>

                {product.standard_net_qty && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Standard Net Qty</span>
                    <span className="font-bold text-[#0B2559]">{product.standard_net_qty}</span>
                  </div>
                )}
                {product.standard_mrp && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Registered MRP</span>
                    <span className="font-extrabold text-emerald-700 font-mono text-sm">{product.standard_mrp}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-900">
              <thead className="text-xs uppercase text-gray-600 bg-gray-50 border-b border-gray-200 font-bold">
                <tr>
                  <th className="px-6 py-4 font-bold">Commodity ID</th>
                  <th className="px-6 py-4 font-bold">Product Name</th>
                  <th className="px-6 py-4 font-bold">Manufacturer</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold font-mono">Barcode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-[#0B2559]">
                      {p.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-xs font-medium">{p.manufacturer}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-slate-800 font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-900 font-bold">{p.barcode || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 text-[#0B2559]">
                <PackageCheck className="w-5 h-5 text-[#0B2559]" />
                <h3 className="text-lg font-bold">Register New Packaged Commodity</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Commodity / Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Salted Potato Chips 50g"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Manufacturer Name &amp; Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Foods Pvt Ltd, Okhla Ind Area, Delhi"
                  value={newProduct.manufacturer}
                  onChange={(e) => setNewProduct({ ...newProduct, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                  >
                    <option value="Food & Beverage">Food &amp; Beverage</option>
                    <option value="Dairy Products">Dairy Products</option>
                    <option value="Staples & Flour">Staples &amp; Flour</option>
                    <option value="FMCG / General">FMCG / General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">EAN-13 Barcode</label>
                  <input
                    type="text"
                    placeholder="e.g. 8901234567899"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 font-mono placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Standard Metric Net Qty</label>
                  <input
                    type="text"
                    placeholder="e.g. 50g or 100ml"
                    value={newProduct.standard_net_qty}
                    onChange={(e) => setNewProduct({ ...newProduct, standard_net_qty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Registered MRP (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹20.00"
                    value={newProduct.standard_mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, standard_mrp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2559]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-slate-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0B2559] hover:bg-[#07193d] text-white font-extrabold shadow-sm transition-all flex items-center gap-2"
                >
                  {submitting ? "Saving..." : "Save Commodity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
