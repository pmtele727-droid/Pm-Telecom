import React from 'react';
import {
  PackagePlus,
  Cloud,
  FileSpreadsheet,
  Download,
  History,
  FolderTree,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddItem: () => void;
  onOpenDriveBackup: () => void;
  onOpenCategories: () => void;
  onOpenHistory: () => void;
  onOpenPrint: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  isDriveConnected: boolean;
  userEmail: string | null;
  activeTab: 'grouped' | 'all' | 'glass' | 'gadgets';
  setActiveTab: (tab: 'grouped' | 'all' | 'glass' | 'gadgets') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddItem,
  onOpenDriveBackup,
  onOpenCategories,
  onOpenHistory,
  onOpenPrint,
  onExportCSV,
  onExportJSON,
  isDriveConnected,
  userEmail,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Shop Branding */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950 font-black text-xl tracking-wider">
              IC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Irfan creation
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  স্টক ম্যানেজার
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>দোকানের গ্লাস, এয়ারপড, রাউটার ও গ্যাজেট ক্রয়মূল্য হিসাব</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-500"></span>
                <span className="text-amber-400 font-medium">শুধু ক্রয়মূল্য হিসাব</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Google Drive Status & Backup Button */}
            <button
              onClick={onOpenDriveBackup}
              type="button"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                isDriveConnected
                  ? 'bg-blue-950/60 border-blue-600/50 text-blue-300 hover:bg-blue-900/60'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Google Drive ব্যাকআপ ও রিস্টোর"
            >
              <Cloud className={`w-4 h-4 ${isDriveConnected ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>Google Drive ব্যাকআপ</span>
              {isDriveConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="কানেক্টেড"></span>
              )}
            </button>

            {/* Print Stock Sheet */}
            <button
              onClick={onOpenPrint}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="স্টক শিট প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>

            {/* Categories Customize */}
            <button
              onClick={onOpenCategories}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="ক্যাটাগরি কাস্টমাইজ"
            >
              <FolderTree className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">ক্যাটাগরি</span>
            </button>

            {/* History Logs */}
            <button
              onClick={onOpenHistory}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="স্টক হিস্ট্রি / চালান রেকর্ড"
            >
              <History className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">হিস্ট্রি</span>
            </button>

            {/* Quick Export CSV / Excel */}
            <button
              onClick={onExportCSV}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="এক্সেল (CSV) ডাউনলোড"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">এক্সেল</span>
            </button>

            {/* Add New Item Button */}
            <button
              onClick={onOpenAddItem}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <PackagePlus className="w-4 h-4" />
              <span>নতুন মাল যোগ করুন</span>
            </button>

          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-2 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('grouped')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'grouped'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>ক্যাটাগরি অনুযায়ী গ্রুপ ভিউ (Category View)</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>সব স্টক তালিকা (All Items)</span>
          </button>

          <button
            onClick={() => setActiveTab('glass')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'glass'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>ডিসপ্লে গ্লাস মডেল কুইক ভিউ (Glass Matrix)</span>
          </button>

          <button
            onClick={() => setActiveTab('gadgets')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'gadgets'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5 text-blue-400" />
            <span>এয়ারপড, রাউটার ও গ্যাজেট ভিউ</span>
          </button>
        </div>

      </div>
    </header>
  );
};
