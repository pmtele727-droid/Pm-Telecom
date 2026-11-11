import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Shield, Sparkles, Filter, PackageCheck, AlertCircle } from 'lucide-react';
import { StockItem } from '../types/inventory';

interface GlassQuickViewProps {
  items: StockItem[];
  onQuickAdjustQty: (item: StockItem, delta: number) => void;
  onEditItem: (item: StockItem) => void;
  onAddGlassItem: (defaultBrand?: string) => void;
}

export const GlassQuickView: React.FC<GlassQuickViewProps> = ({
  items,
  onQuickAdjustQty,
  onEditItem,
  onAddGlassItem,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter glass items
  const glassItems = useMemo(() => {
    return items.filter((item) => item.category === 'glass');
  }, [items]);

  // Extract all unique brands in glass category
  const glassBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    glassItems.forEach((item) => {
      if (item.brand) brandsSet.add(item.brand.trim());
    });
    return Array.from(brandsSet).sort();
  }, [glassItems]);

  // Filtered list
  const filteredGlass = useMemo(() => {
    return glassItems.filter((item) => {
      const matchesBrand =
        selectedBrand === 'all' || item.brand.toLowerCase() === selectedBrand.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.model.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.variant && item.variant.toLowerCase().includes(q));

      return matchesBrand && matchesSearch;
    });
  }, [glassItems, selectedBrand, searchQuery]);

  const totalGlassQty = filteredGlass.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalGlassPurchaseCost = filteredGlass.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPurchasePrice || 0),
    0
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 shadow-md">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>মোবাইল গ্লাস মডেল স্টক ম্যাট্রিক্স</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-medium">
                {filteredGlass.length} মডেল
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ফোনের মডেল অনুযায়ী কত পিস গ্লাস আছে এবং প্রতি পিসের কেনা দাম
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-2">
            <span className="text-slate-400">মোট গ্লাস স্টক:</span>
            <span className="text-emerald-400 font-bold text-sm">{totalGlassQty} পিস</span>
          </div>
          <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-2">
            <span className="text-slate-400">মোট গ্লাসের ক্রয়মূল্য:</span>
            <span className="text-white font-bold text-sm">৳{totalGlassPurchaseCost.toLocaleString('en-BD')}</span>
          </div>
          <button
            onClick={() => onAddGlassItem(selectedBrand !== 'all' ? selectedBrand : undefined)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন গ্লাস মডেল যোগ</span>
          </button>
        </div>
      </div>

      {/* Brand Selector Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4">
        {/* Brand tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedBrand('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              selectedBrand === 'all'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            সব ব্র্যান্ড ({glassItems.length})
          </button>

          {glassBrands.map((b) => {
            const count = glassItems.filter((i) => i.brand.toLowerCase() === b.toLowerCase()).length;
            return (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedBrand.toLowerCase() === b.toLowerCase()
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {b} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="মডেল সার্চ করুন (e.g. S24, 15 Pro)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Glass Models */}
      {filteredGlass.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
          <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">কোন গ্লাস মডেল পাওয়া যায়নি</p>
          <button
            onClick={() => onAddGlassItem()}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন গ্লাস মডেল যুক্ত করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredGlass.map((item) => {
            const isLowStock = Number(item.quantity) <= Number(item.lowStockThreshold || 5);
            const totalCost = Number(item.quantity) * Number(item.unitPurchasePrice);

            return (
              <div
                key={item.id}
                className={`bg-slate-800/70 border rounded-xl p-3.5 flex flex-col justify-between transition-all hover:border-slate-600 ${
                  isLowStock ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-700/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {item.brand}
                    </span>
                    {isLowStock ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        স্টক কম
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/60 text-slate-300">
                        ইন-স্টক
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onEditItem(item)}
                    className="text-sm font-bold text-white hover:text-emerald-300 cursor-pointer transition-colors line-clamp-1"
                    title={item.model}
                  >
                    {item.model}
                  </h3>

                  {item.variant && (
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      {item.variant}
                    </p>
                  )}
                </div>

                {/* Stock Controls & Pricing */}
                <div className="mt-3 pt-2.5 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[10px] text-slate-400">একক কেনা দাম</p>
                      <p className="text-xs font-bold text-white">৳{item.unitPurchasePrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">মোট ক্রয়মূল্য</p>
                      <p className="text-xs font-bold text-emerald-400">৳{totalCost.toLocaleString('en-BD')}</p>
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between bg-slate-900/90 rounded-lg p-1 border border-slate-700">
                    <button
                      onClick={() => onQuickAdjustQty(item, -1)}
                      disabled={item.quantity <= 0}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="১ পিস কমান (বিক্রি বা বাদ)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-baseline gap-1">
                      <span className={`text-base font-black ${isLowStock ? 'text-amber-400' : 'text-white'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-[10px] text-slate-400">পিস</span>
                    </div>

                    <button
                      onClick={() => onQuickAdjustQty(item, 1)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-emerald-900/50 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors"
                      title="১ পিস বাড়ান (নতুন স্টক)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
