import React from 'react';
import { X, History, ArrowUpRight, ArrowDownRight, RefreshCcw, Clock } from 'lucide-react';
import { StockHistoryEntry } from '../types/inventory';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: StockHistoryEntry[];
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              <span>স্টক হিস্ট্রি ও চালানের লগ</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              মালের স্টক বাড়ানো, কমানো ও নতুন চালান আসার হিসাব
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>এখনো কোনো হিস্ট্রি রেকর্ড নেই। স্টক পরিবর্তন হলে এখানে দেখা যাবে।</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {history.map((h) => {
                const isPositive = h.quantityChange > 0;
                const formattedDate = new Date(h.date).toLocaleString('bn-BD', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                return (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-slate-850 bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{h.itemName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formattedDate} {h.note ? `• ${h.note}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-black text-sm ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${h.quantityChange}` : h.quantityChange} পিস
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {h.previousQty} → {h.newQty} পিস
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
