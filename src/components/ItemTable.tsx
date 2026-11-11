import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Minus,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Layers,
  ChevronDown,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { Category, StockItem } from '../types/inventory';

interface ItemTableProps {
  items: StockItem[];
  categories: Category[];
  onEditItem: (item: StockItem) => void;
  onDeleteItem: (item: StockItem) => void;
  onQuickAdjustQty: (item: StockItem, delta: number) => void;
  onOpenRestockModal: (item?: StockItem) => void;
  onOpenAddItem: () => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  isLowStockFiltered: boolean;
  setIsLowStockFiltered: (val: boolean) => void;
}

type SortField = 'name' | 'quantity' | 'unitPurchasePrice' | 'totalCost' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export const ItemTable: React.FC<ItemTableProps> = ({
  items,
  categories,
  onEditItem,
  onDeleteItem,
  onQuickAdjustQty,
  onOpenRestockModal,
  onOpenAddItem,
  selectedCategory,
  setSelectedCategory,
  isLowStockFiltered,
  setIsLowStockFiltered,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Extract all unique brands
  const allBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    items.forEach((item) => {
      if (item.brand) brandsSet.add(item.brand.trim());
    });
    return Array.from(brandsSet).sort();
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Low stock filter
        if (isLowStockFiltered && item.quantity > (item.lowStockThreshold || 5)) {
          return false;
        }

        // Brand filter
        if (selectedBrand !== 'all' && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Search filter
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchName = item.name.toLowerCase().includes(q);
          const matchModel = item.model.toLowerCase().includes(q);
          const matchBrand = item.brand.toLowerCase().includes(q);
          const matchVariant = item.variant?.toLowerCase().includes(q);
          const matchShelf = item.shelfLocation?.toLowerCase().includes(q);
          const matchSupplier = item.supplier?.toLowerCase().includes(q);
          if (!matchName && !matchModel && !matchBrand && !matchVariant && !matchShelf && !matchSupplier) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof StockItem];
        let valB: any = b[sortField as keyof StockItem];

        if (sortField === 'totalCost') {
          valA = Number(a.quantity || 0) * Number(a.unitPurchasePrice || 0);
          valB = Number(b.quantity || 0) * Number(b.unitPurchasePrice || 0);
        }

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });
  }, [items, selectedCategory, isLowStockFiltered, selectedBrand, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const totalFilteredCost = filteredItems.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPurchasePrice || 0),
    0
  );
  const totalFilteredUnits = filteredItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
      
      {/* Table Top Controls & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="পণ্য বা মডেল সার্চ করুন (যেমন: iPhone 15, S24, Archer C6, LP40)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                মুছুন
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRestockModal()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
              title="নতুন মাল দোকানে ঢুকানো"
            >
              <PlusCircle className="w-4 h-4" />
              <span>মাল রিস্টক চালান</span>
            </button>

            <button
              onClick={onOpenAddItem}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন আইটেম</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              সব ক্যাটাগরি ({items.length})
            </button>

            {categories.map((c) => {
              const count = items.filter((i) => i.category === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {c.nameBn || c.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Brand & Stock Status Filter */}
          <div className="flex items-center gap-2">
            
            {/* Brand Dropdown */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">সব ব্র্যান্ড</option>
              {allBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Low Stock Toggle Button */}
            <button
              onClick={() => setIsLowStockFiltered(!isLowStockFiltered)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isLowStockFiltered
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>কম স্টক</span>
            </button>

          </div>

        </div>

        {/* Filter Summary Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800">
          <div>
            দেখাচ্ছে: <span className="text-white font-medium">{filteredItems.length} টি পণ্য</span> (মোট{' '}
            <span className="text-emerald-400 font-bold">{totalFilteredUnits} পিস</span>)
          </div>
          <div>
            এই ফিল্টারের মোট ক্রয়মূল্য:{' '}
            <span className="text-white font-bold">৳{totalFilteredCost.toLocaleString('en-BD')}</span>
          </div>
        </div>

      </div>

      {/* Main Table / List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">কোন মাল পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            আপনার ফিল্টার বা সার্চ শব্দের সাথে মিলছে এমন কোন পণ্য স্টক তালিকায় নেই।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedBrand('all');
              setIsLowStockFiltered(false);
            }}
            className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
          >
            সব ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">
                  <button
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>আইটেম ও মডেল</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">ক্যাটাগরি</th>
                <th className="py-3 px-3">ড্রয়ার / র‍্যাক</th>
                <th className="py-3 px-3 text-center">
                  <button
                    onClick={() => toggleSort('quantity')}
                    className="inline-flex items-center gap-1 hover:text-white"
                  >
                    <span>স্টক পরিমাণ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    onClick={() => toggleSort('unitPurchasePrice')}
                    className="inline-flex items-center gap-1 hover:text-white ml-auto"
                  >
                    <span>একক ক্রয়মূল্য (৳)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    onClick={() => toggleSort('totalCost')}
                    className="inline-flex items-center gap-1 hover:text-white ml-auto"
                  >
                    <span>সর্বমোট কেনা দাম (৳)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {filteredItems.map((item) => {
                const cat = categoryMap.get(item.category);
                const isLowStock = Number(item.quantity) <= Number(item.lowStockThreshold || 5);
                const isOutOfStock = Number(item.quantity) === 0;
                const totalCost = Number(item.quantity) * Number(item.unitPurchasePrice);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isOutOfStock
                        ? 'bg-rose-950/10'
                        : isLowStock
                        ? 'bg-amber-950/10'
                        : ''
                    }`}
                  >
                    {/* Item & Model Details */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-400">
                            {item.brand}
                          </span>
                          {item.variant && (
                            <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
                              {item.variant}
                            </span>
                          )}
                        </div>
                        <p
                          onClick={() => onEditItem(item)}
                          className="font-bold text-white hover:text-emerald-300 cursor-pointer mt-0.5 line-clamp-1"
                          title={item.name}
                        >
                          {item.name}
                        </p>
                        {item.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {cat?.nameBn || cat?.name || item.category}
                      </span>
                    </td>

                    {/* Shelf Location */}
                    <td className="py-3.5 px-3 text-xs text-slate-300 whitespace-nowrap font-mono">
                      {item.shelfLocation ? (
                        <span className="bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
                          {item.shelfLocation}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Quantity with quick +/- buttons */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onQuickAdjustQty(item, -1)}
                          disabled={item.quantity <= 0}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors disabled:opacity-20 disabled:pointer-events-none"
                          title="১ পিস কমান"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <div className="min-w-[54px] text-center">
                          <span
                            className={`font-black text-sm ${
                              isOutOfStock
                                ? 'text-rose-400 font-bold'
                                : isLowStock
                                ? 'text-amber-400'
                                : 'text-white'
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">পিস</span>
                          {isLowStock && (
                            <div className="text-[9px] font-semibold text-amber-400 flex items-center justify-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>কম</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => onQuickAdjustQty(item, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-emerald-900/50 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors"
                          title="১ পিস বাড়ান"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Unit Purchase Price (৳) */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-semibold text-slate-200">
                      ৳{item.unitPurchasePrice.toLocaleString('en-BD')}
                    </td>

                    {/* Total Purchase Cost (৳) */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-emerald-400">
                      ৳{totalCost.toLocaleString('en-BD')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenRestockModal(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                          title="রিস্টক চালান যোগ করুন"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                          title="তথ্য এডিট করুন"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteItem(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-rose-400 transition-colors"
                          title="ডিলিট করুন"
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
  );
};
