import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Package,
  Boxes,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Category, StockItem } from '../types/inventory';

interface CategoryGroupedViewProps {
  categories: Category[];
  items: StockItem[];
  onQuickAdjustQty: (item: StockItem, delta: number) => void;
  onEditItem: (item: StockItem) => void;
  onDeleteItem: (item: StockItem) => void;
  onAddProductToCategory: (categoryId: string) => void;
}

export const CategoryGroupedView: React.FC<CategoryGroupedViewProps> = ({
  categories,
  items,
  onQuickAdjustQty,
  onEditItem,
  onDeleteItem,
  onAddProductToCategory,
}) => {
  // Keep track of which categories are expanded (default: all expanded)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <div className="space-y-5 mb-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>ক্যাটাগরি-ভিত্তিক স্টক ও মডেল ড্যাশবোর্ড</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                {categories.length} টি ক্যাটাগরি
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              প্রতিটি প্রধান ক্যাটাগরির অধীনে নির্দিষ্ট মডেল ও অবশিষ্ট পিসের নিখুঁত হিসাব
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span>
            মোট আইটেম: <strong className="text-white">{items.length}</strong>
          </span>
          <span>•</span>
          <span>
            মোট স্টক:{' '}
            <strong className="text-emerald-400">
              {items.reduce((sum, i) => sum + Number(i.quantity || 0), 0)} পিস
            </strong>
          </span>
        </div>
      </div>

      {/* Category Accordion / Groups */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const categoryItems = items.filter((item) => item.category === cat.id);
          const isCollapsed = !!collapsedCategories[cat.id];
          const totalUnits = categoryItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
          const totalCategoryCost = categoryItems.reduce(
            (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPurchasePrice || 0),
            0
          );

          return (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Category Header Row */}
              <div
                onClick={() => toggleCategory(cat.id)}
                className="p-4 sm:px-6 bg-slate-850 bg-slate-800/40 hover:bg-slate-800/70 border-b border-slate-800/80 cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-emerald-400" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                    <Package className="w-4 h-4" />
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>{cat.nameBn || cat.name}</span>
                      <span className="text-[11px] font-normal text-slate-400">({cat.name})</span>
                    </h3>
                  </div>
                </div>

                {/* Category Stats and Quick Add Button */}
                <div className="flex items-center gap-4 text-xs ml-8 md:ml-0" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2">
                    <span className="text-slate-400">মডেল সংখ্যা:</span>
                    <span className="text-white font-bold">{categoryItems.length} টি</span>
                  </div>

                  <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2">
                    <span className="text-slate-400">স্টক পরিমাণ:</span>
                    <span className="text-emerald-400 font-bold">{totalUnits} পিস</span>
                  </div>

                  <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 hidden sm:flex items-center gap-2">
                    <span className="text-slate-400">মোট ক্রয়মূল্য:</span>
                    <span className="text-slate-200 font-bold">
                      ৳{totalCategoryCost.toLocaleString('en-BD')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddProductToCategory(cat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">এই ক্যাটাগরিতে</span> মাল যোগ
                  </button>
                </div>
              </div>

              {/* Category Product Items Table / Grid */}
              {!isCollapsed && (
                <div>
                  {categoryItems.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      এই ক্যাটাগরিতে এখনো কোনো পণ্য যুক্ত করা হয়নি।
                      <button
                        onClick={() => onAddProductToCategory(cat.id)}
                        className="ml-2 text-emerald-400 hover:underline font-semibold"
                      >
                        + প্রথম মডেল যোগ করুন
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950/40 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="py-2.5 px-4">নির্দিষ্ট মডেল নাম</th>
                            <th className="py-2.5 px-3">ব্র্যান্ড</th>
                            <th className="py-2.5 px-3">ভ্যারিয়েন্ট / টাইপ</th>
                            <th className="py-2.5 px-3 text-center">অবশিষ্ট স্টক (পিস)</th>
                            <th className="py-2.5 px-3 text-right">একক কেনা দাম (৳)</th>
                            <th className="py-2.5 px-3 text-right">মোট কেনা দাম (৳)</th>
                            <th className="py-2.5 px-4 text-center">একশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {categoryItems.map((item) => {
                            const isLow = Number(item.quantity) <= Number(item.lowStockThreshold || 5);
                            const totalCost = Number(item.quantity) * Number(item.unitPurchasePrice);

                            return (
                              <tr
                                key={item.id}
                                className={`hover:bg-slate-800/30 transition-colors ${
                                  isLow ? 'bg-amber-950/10' : ''
                                }`}
                              >
                                <td className="py-3 px-4 font-bold text-white">
                                  <div className="flex items-center gap-2">
                                    <span
                                      onClick={() => onEditItem(item)}
                                      className="hover:text-emerald-300 cursor-pointer"
                                    >
                                      {item.model}
                                    </span>
                                    {isLow && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        স্টক কম
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-3 text-emerald-400 font-semibold">
                                  {item.brand}
                                </td>

                                <td className="py-3 px-3 text-slate-300">
                                  {item.variant || '—'}
                                </td>

                                {/* Stock Quantity with +/- */}
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => onQuickAdjustQty(item, -1)}
                                      disabled={item.quantity <= 0}
                                      className="w-6 h-6 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 flex items-center justify-center disabled:opacity-20"
                                      title="১ পিস কমান"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>

                                    <span
                                      className={`min-w-[42px] font-black text-sm ${
                                        isLow ? 'text-amber-400' : 'text-white'
                                      }`}
                                    >
                                      {item.quantity} পিস
                                    </span>

                                    <button
                                      onClick={() => onQuickAdjustQty(item, 1)}
                                      className="w-6 h-6 rounded bg-slate-800 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-400 flex items-center justify-center"
                                      title="১ পিস বাড়ান"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>

                                <td className="py-3 px-3 text-right font-medium text-slate-200">
                                  ৳{item.unitPurchasePrice}
                                </td>

                                <td className="py-3 px-3 text-right font-bold text-emerald-400">
                                  ৳{totalCost.toLocaleString('en-BD')}
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => onEditItem(item)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                                      title="এডিট"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteItem(item)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400"
                                      title="ডিলিট"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
