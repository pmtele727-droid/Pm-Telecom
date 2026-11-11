import { AppBackupData, Category, StockHistoryEntry, StockItem } from '../types/inventory';
import { DEFAULT_CATEGORIES, INITIAL_STOCK_ITEMS } from '../data/defaultData';

const ITEMS_KEY = 'irfan_creation_items_v1';
const CATEGORIES_KEY = 'irfan_creation_categories_v1';
const HISTORY_KEY = 'irfan_creation_history_v1';
const LAST_DRIVE_BACKUP_KEY = 'irfan_creation_last_drive_backup';

export function getStoredItems(): StockItem[] {
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    if (!data) {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_STOCK_ITEMS));
      return INITIAL_STOCK_ITEMS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read stored items', e);
    return INITIAL_STOCK_ITEMS;
  }
}

export function saveStoredItems(items: StockItem[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items', e);
  }
}

export function getStoredCategories(): Category[] {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read stored categories', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function getStoredHistory(): StockHistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read stock history', e);
    return [];
  }
}

export function addStoredHistory(entry: Omit<StockHistoryEntry, 'id' | 'date'>): void {
  try {
    const list = getStoredHistory();
    const newEntry: StockHistoryEntry = {
      ...entry,
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
    };
    // keep last 200 history logs
    const updated = [newEntry, ...list].slice(0, 200);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history entry', e);
  }
}

export function getLastDriveBackupTime(): string | null {
  return localStorage.getItem(LAST_DRIVE_BACKUP_KEY);
}

export function setLastDriveBackupTime(timeStr: string): void {
  localStorage.setItem(LAST_DRIVE_BACKUP_KEY, timeStr);
}

/**
 * Generates the full AppBackupData structure for export or Google Drive sync.
 */
export function buildBackupData(items: StockItem[], categories: Category[]): AppBackupData {
  const history = getStoredHistory();
  const totalStockUnits = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalInvestment = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPurchasePrice || 0),
    0
  );

  return {
    appName: 'Irfan Creation Stock Manager',
    shopName: 'Irfan creation',
    version: '1.0.0',
    backupDate: new Date().toISOString(),
    totalItemsCount: items.length,
    totalStockUnits,
    totalInvestment,
    items,
    categories,
    history,
  };
}

/**
 * Direct file download of JSON backup to device.
 */
export function downloadLocalBackupJSON(items: StockItem[], categories: Category[]): void {
  const backup = buildBackupData(items, categories);
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Irfan_Creation_Stock_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Direct CSV / Excel export (ONLY purchase price, strictly no selling price as requested!).
 */
export function downloadInventoryCSV(items: StockItem[], categories: Category[]): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.nameBn || c.name]));
  
  // CSV Headers: Bengali & English friendly
  const headers = [
    'আইটেম নাম (Item Name)',
    'ক্যাটাগরি (Category)',
    'ব্র্যান্ড (Brand)',
    'মডেল (Model)',
    'ভ্যারিয়েন্ট / টাইপ (Variant)',
    'স্টক পরিমাণ (Stock Qty)',
    'একক ক্রয়মূল্য ৳ (Unit Purchase Price)',
    'মোট ক্রয়মূল্য ৳ (Total Purchase Cost)',
    'পাইকার / মহাজন (Supplier)',
    'নোট (Notes)',
  ];

  const rows = items.map((item) => {
    const totalCost = Number(item.quantity || 0) * Number(item.unitPurchasePrice || 0);
    const catName = categoryMap.get(item.category) || item.category;
    
    // Escape quotes for CSV
    const clean = (val: string | number | undefined) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      clean(item.name),
      clean(catName),
      clean(item.brand),
      clean(item.model),
      clean(item.variant),
      item.quantity,
      item.unitPurchasePrice,
      totalCost,
      clean(item.supplier),
      clean(item.notes),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // Add UTF-8 BOM for Bengali in Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Irfan_Creation_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
