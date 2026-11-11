import React, { useState, useEffect } from 'react';
import { X, PlusCircle, PackageCheck, AlertCircle } from 'lucide-react';
import { StockItem } from '../types/inventory';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StockItem[];
  preSelectedItem?: StockItem | null;
  onRestock: (
    itemId: string,
    addedQuantity: number,
    newPurchasePrice?: number,
    note?: string
  ) => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  items,
  preSelectedItem,
  onRestock,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [addedQuantity, setAddedQuantity] = useState<number>(10);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [note, setNote] = useState<string>('নতুন চালান ঢুকানো');

  useEffect(() => {
    if (preSelectedItem) {
      setSelectedItemId(preSelectedItem.id);
      setPurchasePrice(preSelectedItem.unitPurchasePrice);
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
      setPurchasePrice(items[0].unitPurchasePrice);
    }
  }, [preSelectedItem, items, isOpen]);

  const currentItem = items.find((i) => i.id === selectedItemId);

  const handleItemChange = (id: string) => {
    setSelectedItemId(id);
    const it = items.find((i) => i.id === id);
    if (it) {
      setPurchasePrice(it.unitPurchasePrice);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || addedQuantity <= 0) return;

    onRestock(selectedItemId, Number(addedQuantity), Number(purchasePrice), note.trim());
    onClose();
  };

  const newTotalQty = (currentItem?.quantity || 0) + Number(addedQuantity || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>স্টক চালান / মাল রিস্টক</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">দোকানে নতুন আসা মাল স্টকে জমা করুন</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Select Item */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              কোন মালের স্টক বাড়াবেন? <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.brand} - {it.model} ({it.variant || it.name}) [বর্তমান স্টক: {it.quantity} পিস]
                </option>
              ))}
            </select>
          </div>

          {currentItem && (
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <p className="text-slate-400">বর্তমান স্টক:</p>
                <p className="text-white font-bold text-sm">{currentItem.quantity} পিস</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">চালান যোগের পর হবে:</p>
                <p className="text-emerald-400 font-bold text-sm">{newTotalQty} পিস</p>
              </div>
            </div>
          )}

          {/* Added Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              নতুন আসা মালের পরিমাণ (পিস) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={addedQuantity}
              onChange={(e) => setAddedQuantity(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-lg font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Unit Purchase Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              প্রতি পিসের কেনা দাম (৳ ক্রয়মূল্য)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-slate-400 font-bold">৳</span>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-base font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              পাইকারি দাম পরিবর্তন হয়ে থাকলে নতুন কেনা দাম বসাতে পারেন।
            </p>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              চালান নোট বা মেমো নং
            </label>
            <input
              type="text"
              placeholder="যেমন: চকবাজার মেমো #৪৫২ বা নতুন চালান"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              স্টকে যোগ করুন
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
