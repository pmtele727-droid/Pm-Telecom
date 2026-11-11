/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  AppBackupData,
  Category,
  StockHistoryEntry,
  StockItem,
} from './types/inventory';
import {
  getStoredItems,
  saveStoredItems,
  getStoredCategories,
  saveStoredCategories,
  getStoredHistory,
  addStoredHistory,
  downloadInventoryCSV,
  downloadLocalBackupJSON,
} from './services/storage';
import { initAuth, getAccessToken } from './services/firebaseAuth';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { GlassQuickView } from './components/GlassQuickView';
import { ItemTable } from './components/ItemTable';
import { ItemModal } from './components/ItemModal';
import { RestockModal } from './components/RestockModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { GoogleDriveBackupModal } from './components/GoogleDriveBackupModal';
import { StockHistoryModal } from './components/StockHistoryModal';
import { PrintInventoryView } from './components/PrintInventoryView';
import { AlertTriangle, Plus, Cloud, Package, Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<StockItem[]>(() => getStoredItems());
  const [categories, setCategories] = useState<Category[]>(() => getStoredCategories());
  const [history, setHistory] = useState<StockHistoryEntry[]>(() => getStoredHistory());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'all' | 'glass' | 'gadgets'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLowStockFiltered, setIsLowStockFiltered] = useState<boolean>(false);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [initialCategoryForModal, setInitialCategoryForModal] = useState<string>('glass');
  const [initialBrandForModal, setInitialBrandForModal] = useState<string>('Apple');

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [preSelectedRestockItem, setPreSelectedRestockItem] = useState<StockItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<StockItem | null>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setIsDriveConnected(!!token);
      },
      () => {
        setCurrentUser(null);
        setIsDriveConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save items whenever changed
  const updateItems = (newItems: StockItem[]) => {
    setItems(newItems);
    saveStoredItems(newItems);
  };

  // Save categories whenever changed
  const updateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    saveStoredCategories(newCategories);
  };

  // Quick Inline Adjust Qty (+1 or -1)
  const handleQuickAdjustQty = (item: StockItem, delta: number) => {
    const prevQty = Number(item.quantity || 0);
    const newQty = Math.max(0, prevQty + delta);
    if (newQty === prevQty) return;

    const updated = items.map((i) =>
      i.id === item.id ? { ...i, quantity: newQty, updatedAt: new Date().toISOString() } : i
    );
    updateItems(updated);

    // Record in history log
    addStoredHistory({
      itemId: item.id,
      itemName: `${item.brand} ${item.model} (${item.variant || item.name})`,
      changeType: delta > 0 ? 'restock' : 'sale_deduct',
      quantityChange: delta,
      previousQty: prevQty,
      newQty: newQty,
      unitPurchasePrice: item.unitPurchasePrice,
      note: delta > 0 ? 'স্টক বাড়ানো হয়েছে' : 'স্টক কমানো হয়েছে',
    });
    setHistory(getStoredHistory());
  };

  // Save New or Edited Item
  const handleSaveItem = (
    itemData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    const now = new Date().toISOString();
    if (id) {
      // Editing existing
      const prev = items.find((i) => i.id === id);
      const updated = items.map((i) =>
        i.id === id
          ? {
              ...i,
              ...itemData,
              updatedAt: now,
            }
          : i
      );
      updateItems(updated);

      if (prev && prev.quantity !== itemData.quantity) {
        addStoredHistory({
          itemId: id,
          itemName: itemData.name,
          changeType: 'manual_edit',
          quantityChange: itemData.quantity - prev.quantity,
          previousQty: prev.quantity,
          newQty: itemData.quantity,
          unitPurchasePrice: itemData.unitPurchasePrice,
          note: 'তথ্য এডিট করা হয়েছে',
        });
        setHistory(getStoredHistory());
      }
    } else {
      // Adding new
      const newItem: StockItem = {
        ...itemData,
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newItem, ...items];
      updateItems(updated);

      addStoredHistory({
        itemId: newItem.id,
        itemName: newItem.name,
        changeType: 'restock',
        quantityChange: newItem.quantity,
        previousQty: 0,
        newQty: newItem.quantity,
        unitPurchasePrice: newItem.unitPurchasePrice,
        note: 'নতুন পণ্য স্টকে যুক্ত করা হয়েছে',
      });
      setHistory(getStoredHistory());
    }
  };

  // Delete item handler
  const handleDeleteItem = (item: StockItem) => {
    setDeleteConfirmItem(item);
  };

  const confirmDelete = () => {
    if (!deleteConfirmItem) return;
    const updated = items.filter((i) => i.id !== deleteConfirmItem.id);
    updateItems(updated);

    addStoredHistory({
      itemId: deleteConfirmItem.id,
      itemName: deleteConfirmItem.name,
      changeType: 'manual_edit',
      quantityChange: -deleteConfirmItem.quantity,
      previousQty: deleteConfirmItem.quantity,
      newQty: 0,
      note: 'পণ্য স্টক তালিকা থেকে মুছে ফেলা হয়েছে',
    });
    setHistory(getStoredHistory());
    setDeleteConfirmItem(null);
  };

  // Quick Restock Invoice handler
  const handleRestock = (
    itemId: string,
    addedQuantity: number,
    newPurchasePrice?: number,
    note?: string
  ) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const prevQty = Number(item.quantity || 0);
    const newQty = prevQty + Number(addedQuantity);
    const priceToSet = newPurchasePrice !== undefined && newPurchasePrice > 0 ? newPurchasePrice : item.unitPurchasePrice;

    const updated = items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            quantity: newQty,
            unitPurchasePrice: priceToSet,
            updatedAt: new Date().toISOString(),
          }
        : i
    );
    updateItems(updated);

    addStoredHistory({
      itemId: item.id,
      itemName: `${item.brand} ${item.model}`,
      changeType: 'restock',
      quantityChange: addedQuantity,
      previousQty: prevQty,
      newQty: newQty,
      unitPurchasePrice: priceToSet,
      note: note || 'চালান যুক্ত করা হয়েছে',
    });
    setHistory(getStoredHistory());
  };

  // Add Category
  const handleAddCategory = (cat: Category) => {
    const updated = [...categories, cat];
    updateCategories(updated);
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter((c) => c.id !== catId);
    updateCategories(updated);
  };

  // Restore Entire Backup from Google Drive or JSON file
  const handleRestoreBackupData = (backup: AppBackupData) => {
    if (backup.items && Array.isArray(backup.items)) {
      updateItems(backup.items);
    }
    if (backup.categories && Array.isArray(backup.categories)) {
      updateCategories(backup.categories);
    }
    if (backup.history && Array.isArray(backup.history)) {
      localStorage.setItem('irfan_creation_history_v1', JSON.stringify(backup.history));
      setHistory(backup.history);
    }
  };

  // Quick add item open helpers
  const handleOpenAddItem = (cat = 'glass', brand = 'Apple') => {
    setEditingItem(null);
    setInitialCategoryForModal(cat);
    setInitialBrandForModal(brand);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleOpenRestock = (item?: StockItem) => {
    setPreSelectedRestockItem(item || null);
    setIsRestockModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        onOpenAddItem={() => handleOpenAddItem()}
        onOpenDriveBackup={() => setIsDriveModalOpen(true)}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onExportCSV={() => downloadInventoryCSV(items, categories)}
        onExportJSON={() => downloadLocalBackupJSON(items, categories)}
        isDriveConnected={isDriveConnected}
        userEmail={currentUser?.email || null}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Stats Summary Bar */}
        <StatsCards
          items={items}
          onSelectLowStock={() => setIsLowStockFiltered((prev) => !prev)}
          isLowStockFiltered={isLowStockFiltered}
        />

        {/* Tab 1: Screen Glass Quick View */}
        {activeTab === 'glass' && (
          <GlassQuickView
            items={items}
            onQuickAdjustQty={handleQuickAdjustQty}
            onEditItem={handleEditItem}
            onAddGlassItem={(brand) => handleOpenAddItem('glass', brand || 'Apple')}
          />
        )}

        {/* Tab 2: Gadgets Only (AirPods, Routers, Cables, Chargers, etc.) */}
        {activeTab === 'gadgets' && (
          <div className="mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      এয়ারপড, রাউটার ও গ্যাজেট আইটেম স্টক
                    </h2>
                    <p className="text-xs text-slate-400">
                      দোকানের গ্যাজেট পণ্যের তালিকা ও মোট কেনা দামের হিসাব
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAddItem('airpods', 'Apple')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন গ্যাজেট যোগ করুন</span>
                </button>
              </div>
            </div>

            <ItemTable
              items={items.filter((i) => i.category !== 'glass')}
              categories={categories.filter((c) => c.id !== 'glass')}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onQuickAdjustQty={handleQuickAdjustQty}
              onOpenRestockModal={handleOpenRestock}
              onOpenAddItem={() => handleOpenAddItem('airpods')}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              isLowStockFiltered={isLowStockFiltered}
              setIsLowStockFiltered={setIsLowStockFiltered}
            />
          </div>
        )}

        {/* Tab 3: Complete Inventory Table (All items including glass, AirPods, routers) */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Quick Glass highlight card on top of all items */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>গ্লাস মডেল অনুযায়ী দ্রুত স্টক দেখতে চান?</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                      মডেল ম্যাট্রিক্স
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    iPhone, Samsung, Xiaomi, Realme সহ সব মডেলের গ্লাস আলাদা দেখতে গ্লাস ভিউ ট্যাব ব্যবহার করুন।
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('glass')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                গ্লাস মডেল ভিউ খুলুন →
              </button>
            </div>

            <ItemTable
              items={items}
              categories={categories}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onQuickAdjustQty={handleQuickAdjustQty}
              onOpenRestockModal={handleOpenRestock}
              onOpenAddItem={() => handleOpenAddItem()}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              isLowStockFiltered={isLowStockFiltered}
              setIsLowStockFiltered={setIsLowStockFiltered}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Irfan creation</span>
            <span>•</span>
            <span>স্টক ও ক্রয়মূল্য হিসাব ব্যবস্থাপনা</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <Cloud className="w-3 h-3" />
              <span>Google Drive ব্যাকআপ</span>
            </button>
            <span>•</span>
            <button
              onClick={() => downloadInventoryCSV(items, categories)}
              className="hover:text-slate-300"
            >
              CSV ডাউনলোড
            </button>
            <span>•</span>
            <button
              onClick={() => downloadLocalBackupJSON(items, categories)}
              className="hover:text-slate-300"
            >
              JSON ডাউনলোড
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        editItem={editingItem}
        categories={categories}
        initialCategory={initialCategoryForModal}
        initialBrand={initialBrandForModal}
      />

      {/* Restock Invoice Modal */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        items={items}
        preSelectedItem={preSelectedRestockItem}
        onRestock={handleRestock}
      />

      {/* Categories Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        items={items}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Google Drive Backup & Restore Modal */}
      <GoogleDriveBackupModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        items={items}
        categories={categories}
        onRestoreData={handleRestoreBackupData}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          setIsDriveConnected(!!user);
        }}
      />

      {/* Stock History Modal */}
      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
      />

      {/* Printable Sheet Modal */}
      <PrintInventoryView
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        items={items}
        categories={categories}
      />

      {/* Delete Item Confirmation Dialog */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">পণ্যটি ডিলিট করতে চান?</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  <strong>{deleteConfirmItem.brand} {deleteConfirmItem.model}</strong> ({deleteConfirmItem.quantity} পিস, কেনা দাম ৳{deleteConfirmItem.unitPurchasePrice}) স্টক তালিকা থেকে মুছে ফেলা হবে।
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all active:scale-95"
              >
                ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
