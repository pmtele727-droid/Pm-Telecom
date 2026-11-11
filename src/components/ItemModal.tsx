import React, { useState, useEffect } from 'react';
import { X, Save, Package, Shield, Layers, DollarSign } from 'lucide-react';
import { Category, StockItem } from '../types/inventory';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  editItem?: StockItem | null;
  categories: Category[];
  initialCategory?: string;
  initialBrand?: string;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  categories,
  initialCategory,
  initialBrand,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('glass');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitPurchasePrice, setUnitPurchasePrice] = useState<number>(100);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [shelfLocation, setShelfLocation] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || '');
      setCategory(editItem.category || 'glass');
      setBrand(editItem.brand || '');
      setModel(editItem.model || '');
      setVariant(editItem.variant || '');
      setQuantity(Number(editItem.quantity || 0));
      setUnitPurchasePrice(Number(editItem.unitPurchasePrice || 0));
      setLowStockThreshold(Number(editItem.lowStockThreshold || 5));
      setShelfLocation(editItem.shelfLocation || '');
      setSupplier(editItem.supplier || '');
      setNotes(editItem.notes || '');
    } else {
      setName('');
      setCategory(initialCategory || 'glass');
      setBrand(initialBrand || 'Apple');
      setModel('');
      setVariant(initialCategory === 'glass' ? '11D Glass' : '');
      setQuantity(10);
      setUnitPurchasePrice(100);
      setLowStockThreshold(5);
      setShelfLocation('');
      setSupplier('');
      setNotes('');
    }
  }, [editItem, isOpen, initialCategory, initialBrand]);

  // Auto-generate item name if empty when model, brand, variant change
  const handleAutoName = () => {
    const parts = [brand, model, variant].filter(Boolean);
    if (parts.length > 0) {
      setName(parts.join(' '));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !model.trim()) return;

    const finalName = name.trim() || `${brand} ${model} ${variant}`.trim();
    const finalModel = model.trim() || finalName;

    onSave(
      {
        name: finalName,
        category,
        brand: brand.trim() || 'Generic',
        model: finalModel,
        variant: variant.trim(),
        quantity: Math.max(0, Number(quantity) || 0),
        unitPurchasePrice: Math.max(0, Number(unitPurchasePrice) || 0),
        lowStockThreshold: Math.max(1, Number(lowStockThreshold) || 5),
        shelfLocation: shelfLocation.trim(),
        supplier: supplier.trim(),
        notes: notes.trim(),
      },
      editItem?.id
    );
    onClose();
  };

  const calculatedTotalCost = Number(quantity || 0) * Number(unitPurchasePrice || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>{editItem ? 'পণ্যের তথ্য এডিট করুন' : 'নতুন স্টক পণ্য যোগ করুন'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              দোকানের স্টক তালিকা ও ক্রয়মূল্য আপডেট করুন (কোন বিক্রয় মূল্য প্রযোজ্য নয়)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ক্যাটাগরি <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value === 'glass' && !variant) {
                    setVariant('11D Glass');
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameBn || cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ব্র্যান্ড (Brand) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                list="brand-suggestions"
                placeholder="যেমন: Apple, Samsung, Xiaomi, TP-Link"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                onBlur={handleAutoName}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="brand-suggestions">
                <option value="Apple" />
                <option value="Samsung" />
                <option value="Xiaomi" />
                <option value="Realme" />
                <option value="Vivo" />
                <option value="Oppo" />
                <option value="OnePlus" />
                <option value="Infinix" />
                <option value="Tecno" />
                <option value="TP-Link" />
                <option value="Mercusys" />
                <option value="Tenda" />
                <option value="Lenovo" />
                <option value="Remax" />
                <option value="Baseus" />
                <option value="Anker" />
              </datalist>
            </div>
          </div>

          {/* Model & Variant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                মডেল নাম (Phone / Gadget Model) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: iPhone 15 Pro Max, Galaxy A15, Archer C6"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                onBlur={handleAutoName}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ভ্যারিয়েন্ট / টাইপ (Variant / Type)
              </label>
              <input
                type="text"
                list="variant-suggestions"
                placeholder="যেমন: 11D Glass, UV Curved, Privacy, Dual Band"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                onBlur={handleAutoName}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="variant-suggestions">
                <option value="11D Glass" />
                <option value="Super D" />
                <option value="UV Curved Glass" />
                <option value="Matte Anti-Glare" />
                <option value="Anti-Spy Privacy" />
                <option value="Camera Lens Protector" />
                <option value="Dual Band Gigabit" />
                <option value="Single Band 300Mbps" />
                <option value="ANC Active Noise Cancelling" />
                <option value="Type-C Fast Charging" />
              </datalist>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                পণ্যের পূর্ণ নাম (Item Title)
              </label>
              <button
                type="button"
                onClick={handleAutoName}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                স্বয়ংক্রিয় নাম তৈরি করুন
              </button>
            </div>
            <input
              type="text"
              placeholder="যেমন: iPhone 15 Pro Max 11D Super Clear Glass"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* QUANTITY & PURCHASE PRICE (Strictly Purchase Price Only!) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>স্টক ও ক্রয়মূল্য হিসাব (শুধু কেনা দাম)</span>
              </span>
              <span className="text-[11px] text-slate-400">বিক্রয় মূল্য ছাড়া হিসাব</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  স্টক সংখ্যা (পরিমাণ - পিস) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  একক ক্রয়মূল্য (৳ কেনা দাম) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={unitPurchasePrice}
                    onChange={(e) => setUnitPurchasePrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-base font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  মোট ক্রয়মূল্য (স্বয়ংক্রিয়)
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-emerald-400 flex items-center">
                  ৳{calculatedTotalCost.toLocaleString('en-BD')}
                </div>
              </div>
            </div>
          </div>

          {/* Location, Low Stock Threshold & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                র‍্যাক / ড্রয়ার লোকেশন
              </label>
              <input
                type="text"
                placeholder="যেমন: Glass Box A-1, Drawer 2"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                কম স্টক সতর্কতা লেভেল (পিস)
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                মহাজন / পাইকার নাম
              </label>
              <input
                type="text"
                placeholder="যেমন: চকবাজার পাইকারি, স্টার টেক"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              নোট বা মন্তব্য (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: ফুল গ্লু, ওয়ারেন্টি স্টিকার লাগানো, মাস্টার কপি ইত্যাদি"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editItem ? 'পরিবর্তন সংরক্ষণ করুন' : 'স্টকে যুক্ত করুন'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
