import React, { useState } from 'react';
import { X, Plus, Trash2, FolderTree, Tag, Check, AlertCircle } from 'lucide-react';
import { Category, StockItem } from '../types/inventory';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  items: StockItem[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  items,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [color, setColor] = useState('emerald');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() && !nameEn.trim()) {
      setError('ক্যাটাগরির নাম লিখুন');
      return;
    }

    const id = (nameEn.trim().toLowerCase().replace(/\s+/g, '-') || 'cat-' + Date.now());
    if (categories.some((c) => c.id === id)) {
      setError('এই নামের ক্যাটাগরি ইতিমধ্যে আছে');
      return;
    }

    onAddCategory({
      id,
      name: nameEn.trim() || nameBn.trim(),
      nameBn: nameBn.trim() || nameEn.trim(),
      icon: 'Package',
      color,
      isDefault: false,
    });

    setNameBn('');
    setNameEn('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-amber-400" />
              <span>ক্যাটাগরি কাস্টমাইজেশন</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">নতুন ক্যাটাগরি যোগ বা পরিবর্তন করুন</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>নতুন ক্যাটাগরি তৈরি করুন</span>
            </h3>

            {error && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  বাংলা নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ক্যামেরা লেন্স"
                  value={nameBn}
                  onChange={(e) => {
                    setNameBn(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  ইংরেজি নাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Camera Lens"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>ক্যাটাগরি যুক্ত করুন</span>
            </button>
          </form>

          {/* Current Categories List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              বর্তমান ক্যাটাগরি সমূহ ({categories.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categories.map((c) => {
                const count = items.filter((i) => i.category === c.id).length;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-850 bg-slate-800/60 border border-slate-700/80 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white text-sm">{c.nameBn || c.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {c.name} • {count} টি পণ্য আছে
                      </p>
                    </div>

                    {!c.isDefault && (
                      <button
                        onClick={() => onDeleteCategory(c.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 transition-colors"
                        title="ক্যাটাগরি মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
