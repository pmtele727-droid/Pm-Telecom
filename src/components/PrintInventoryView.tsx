import React from 'react';
import { X, Printer } from 'lucide-react';
import { Category, StockItem } from '../types/inventory';

interface PrintInventoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  items: StockItem[];
  categories: Category[];
}

export const PrintInventoryView: React.FC<PrintInventoryViewProps> = ({
  isOpen,
  onClose,
  items,
  categories,
}) => {
  if (!isOpen) return null;

  const categoryMap = new Map(categories.map((c) => [c.id, c.nameBn || c.name]));
  const totalUnits = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
  const totalCost = items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPurchasePrice || 0),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
        
        {/* Controls bar (hidden during print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 print:hidden">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>প্রিন্ট প্রিভিউ (দোকানের স্টক শিট)</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-8 bg-white text-slate-900 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0">
          
          {/* Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              Irfan creation
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              দোকানের স্টক ইনভেন্টরি ও ক্রয়মূল্য তালিকা
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-2">
              <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
              <span>•</span>
              <span>মোট আইটেম: {items.length} টি</span>
              <span>•</span>
              <span>মোট স্টক: {totalUnits} পিস</span>
              <span>•</span>
              <span className="font-bold text-slate-900">
                মোট ক্রয়মূল্য: ৳{totalCost.toLocaleString('en-BD')}
              </span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 text-[11px] font-bold text-slate-700 uppercase">
                <th className="py-2 px-2">ক্রম</th>
                <th className="py-2 px-2">আইটেম ও মডেল</th>
                <th className="py-2 px-2">ক্যাটাগরি</th>
                <th className="py-2 px-2 text-center">স্টক (পিস)</th>
                <th className="py-2 px-2 text-right">একক ক্রয়মূল্য (৳)</th>
                <th className="py-2 px-2 text-right">মোট ক্রয়মূল্য (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => {
                const cost = Number(item.quantity || 0) * Number(item.unitPurchasePrice || 0);
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-2 font-medium">
                      <div>
                        <span className="font-bold">{item.brand}</span> {item.model}
                        {item.variant && (
                          <span className="text-slate-500 text-[11px] ml-1">({item.variant})</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-slate-600">
                      {categoryMap.get(item.category) || item.category}
                    </td>
                    <td className="py-2 px-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-2 px-2 text-right">৳{item.unitPurchasePrice}</td>
                    <td className="py-2 px-2 text-right font-bold">
                      ৳{cost.toLocaleString('en-BD')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800 font-bold bg-slate-100">
                <td colSpan={3} className="py-2.5 px-2 text-right">
                  সর্বমোট:
                </td>
                <td className="py-2.5 px-2 text-center text-sm">{totalUnits} পিস</td>
                <td className="py-2.5 px-2"></td>
                <td className="py-2.5 px-2 text-right text-sm">
                  ৳{totalCost.toLocaleString('en-BD')}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
            <span>Irfan creation - স্টক ও ক্রয়মূল্য রেকর্ড</span>
            <span>স্বাক্ষর: ____________________</span>
          </div>

        </div>

      </div>
    </div>
  );
};
