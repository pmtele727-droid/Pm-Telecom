export interface StockItem {
  id: string;
  name: string; // e.g. "iPhone 15 Pro Max 11D Glass", "AirPods Pro 2nd Gen", "TP-Link Archer C6"
  category: string; // "glass" | "airpods" | "router" | "charger" | "cable" | "powerbank" | "smartwatch" | "cover" | "others" | custom
  brand: string; // "Apple", "Samsung", "Xiaomi", "Realme", "TP-Link", etc.
  model: string; // "iPhone 15 Pro Max", "Archer C6 AC1200", etc.
  variant?: string; // "11D Glass", "Super D", "Matte", "Privacy", "White", "Single Band", etc.
  quantity: number; // Stock in pieces
  unitPurchasePrice: number; // কেনার দাম (প্রতি পিস)
  lowStockThreshold: number; // e.g. 5 pcs alert
  shelfLocation?: string; // র‍্যাক বা ড্রয়ার নং e.g. "Rack A-1", "Drawer 3"
  supplier?: string; // পাইকার / মহাজন
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string; // English
  nameBn: string; // Bengali
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface StockHistoryEntry {
  id: string;
  itemId: string;
  itemName: string;
  changeType: 'restock' | 'sale_deduct' | 'adjustment' | 'manual_edit';
  quantityChange: number; // +10 or -2
  previousQty: number;
  newQty: number;
  unitPurchasePrice?: number;
  date: string;
  note?: string;
}

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
  description?: string;
}

export interface AppBackupData {
  appName: string;
  shopName: string;
  version: string;
  backupDate: string;
  totalItemsCount: number;
  totalStockUnits: number;
  totalInvestment: number;
  items: StockItem[];
  categories: Category[];
  history: StockHistoryEntry[];
}
