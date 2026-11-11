import React from 'react';
import { Package, Boxes, AlertTriangle, Wallet } from 'lucide-react';
import { StockItem } from '../types/inventory';

interface StatsCardsProps {
  items: StockItem[];
  onSelectLowStock: () => void;
  isLowStockFiltered: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  items,
  onSelectLowStock,
  isLowStockFiltered,
}) => {
  const totalItemsCount = items.length;
  const totalStockUnits = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  
  // STRICTLY PURCHASE PRICE ONLY
  const totalPurchaseValue = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPurchasePrice || 0),
    0
  );

  const lowStockItems = items.filter(
    (item) => Number(item.quantity || 0) <= Number(item.lowStockThreshold || 5)
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Total Purchase Investment (Total Cost) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden group">
        <div className="absolute right-3 top-3 w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-slate-400">দোকানের মোট ক্রয়মূল্য (কেনা দাম)</p>
        <p className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-baseline gap-1">
          <span>৳</span>
          <span className="tracking-tight">{totalPurchaseValue.toLocaleString('en-BD')}</span>
        </p>
        <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
          <span>দোকানে থাকা সমস্ত মালের কেনা মূল্য</span>
        </p>
      </div>

      {/* Total Stock Pieces */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden group">
        <div className="absolute right-3 top-3 w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
          <Boxes className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-slate-400">সর্বমোট স্টক পরিমাণ</p>
        <p className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-baseline gap-1">
          <span className="tracking-tight">{totalStockUnits.toLocaleString()}</span>
          <span className="text-xs font-normal text-slate-400">পিস</span>
        </p>
        <p className="text-[11px] text-slate-400 mt-1">সব ক্যাটাগরি ও মডেল মিলিয়ে</p>
      </div>

      {/* Total Distinct Items/Models */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden group">
        <div className="absolute right-3 top-3 w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-slate-400">মোট আইটেম ও মডেল</p>
        <p className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-baseline gap-1">
          <span className="tracking-tight">{totalItemsCount}</span>
          <span className="text-xs font-normal text-slate-400">টি আইটেম</span>
        </p>
        <p className="text-[11px] text-slate-400 mt-1">গ্লাস, এয়ারপড, রাউটার ও এক্সেসরিজ</p>
      </div>

      {/* Low Stock Alert Card (Clickable Filter) */}
      <div
        onClick={onSelectLowStock}
        className={`border rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden cursor-pointer transition-all ${
          isLowStockFiltered
            ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40'
            : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
        }`}
      >
        <div className="absolute right-3 top-3 w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-amber-300">কম স্টক সতর্কতা (অর্ডার দরকার)</p>
        <p className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-baseline gap-1">
          <span className="text-amber-400 tracking-tight">{lowStockItems.length}</span>
          <span className="text-xs font-normal text-slate-400">টি আইটেম</span>
        </p>
        <p className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1 font-medium">
          {isLowStockFiltered ? '✓ ফিল্টার সক্রিয় (ক্লিক করে সব দেখুন)' : 'ক্লিক করে শুধু কম স্টক দেখুন →'}
        </p>
      </div>

    </div>
  );
};
