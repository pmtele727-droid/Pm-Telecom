import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  UploadCloud,
  DownloadCloud,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  HardDrive,
  Download,
  Upload,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { AppBackupData, Category, DriveBackupFile, StockItem } from '../types/inventory';
import { googleSignIn, logout, getAccessToken } from '../services/firebaseAuth';
import {
  uploadBackupToDrive,
  listDriveBackups,
  downloadBackupFromDrive,
  deleteBackupFromDrive,
} from '../services/googleDrive';
import {
  buildBackupData,
  downloadLocalBackupJSON,
  setLastDriveBackupTime,
  getLastDriveBackupTime,
} from '../services/storage';

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StockItem[];
  categories: Category[];
  onRestoreData: (backupData: AppBackupData) => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

export const GoogleDriveBackupModal: React.FC<GoogleDriveBackupModalProps> = ({
  isOpen,
  onClose,
  items,
  categories,
  onRestoreData,
  currentUser,
  onUserChange,
}) => {
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Confirmation state for destructive Drive deletion or Restore
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    isDestructive: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'নিশ্চিত করুন',
    isDestructive: false,
    onConfirm: async () => {},
  });

  const lastBackupTime = getLastDriveBackupTime();

  // Load backups when modal opens and user is logged in
  useEffect(() => {
    if (isOpen && currentUser) {
      loadBackupsList();
    }
  }, [isOpen, currentUser]);

  const loadBackupsList = async () => {
    setIsLoadingBackups(true);
    try {
      const files = await listDriveBackups();
      setDriveBackups(files);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: 'ড্রাইভ থেকে তালিকা লোড করতে সমস্যা হয়েছে', type: 'error' });
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onUserChange(res.user);
        setStatusMessage({ text: `সফলভাবে গুগল সাইন-ইন সম্পন্ন হয়েছে (${res.user.email})`, type: 'success' });
        loadBackupsList();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setStatusMessage({ text: 'গুগল সাইন-ইন ব্যর্থ হয়েছে: ' + (err.message || 'অপ্রত্যাশিত সমস্যা'), type: 'error' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onUserChange(null);
    setDriveBackups([]);
    setStatusMessage({ text: 'গুগল ড্রাইভ সংযোগ বিচ্ছিন্ন করা হয়েছে', type: 'info' });
  };

  // Upload current stock backup to Google Drive
  const handleBackupNow = async () => {
    if (!currentUser) {
      setStatusMessage({ text: 'অনুগ্রহ করে প্রথমে গুগল দিয়ে সাইন-ইন করুন', type: 'error' });
      return;
    }

    setIsBackingUp(true);
    setStatusMessage(null);
    try {
      const backupData = buildBackupData(items, categories);
      const newFile = await uploadBackupToDrive(backupData);
      const nowStr = new Date().toLocaleString('bn-BD');
      setLastDriveBackupTime(nowStr);
      setStatusMessage({
        text: `গুগল ড্রাইভে স্টক ডাটা সফলভাবে ব্যাকআপ রাখা হয়েছে! (${newFile.name})`,
        type: 'success',
      });
      loadBackupsList();
    } catch (err: any) {
      console.error('Backup error:', err);
      setStatusMessage({ text: 'ব্যাকআপ তৈরিতে ত্রুটি: ' + (err.message || ''), type: 'error' });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Prompt confirmation before restoring backup from Drive
  const promptRestore = (file: DriveBackupFile) => {
    setConfirmModal({
      isOpen: true,
      title: 'গুগল ড্রাইভ থেকে স্টক রিস্টোর করবেন?',
      description: `ফাইল: "${file.name}"। এটি রিস্টোর করলে আপনার বর্তমান স্টকের ডাটা এই ব্যাকআপ দিয়ে প্রতিস্থাপিত হবে। আপনি কি নিশ্চিত?`,
      confirmText: 'হ্যাঁ, রিস্টোর করুন',
      isDestructive: false,
      onConfirm: async () => {
        setIsRestoring(true);
        try {
          const data = await downloadBackupFromDrive(file.id);
          if (data && Array.isArray(data.items)) {
            onRestoreData(data);
            setStatusMessage({
              text: `সফলভাবে ${data.items.length} টি পণ্যের ব্যাকআপ রিস্টোর করা হয়েছে!`,
              type: 'success',
            });
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          } else {
            throw new Error('অকার্যকর ব্যাকআপ ফাইল');
          }
        } catch (err: any) {
          console.error(err);
          setStatusMessage({ text: 'রিস্টোর করতে সমস্যা হয়েছে: ' + (err.message || ''), type: 'error' });
        } finally {
          setIsRestoring(false);
        }
      },
    });
  };

  // Prompt confirmation before deleting backup from Drive (Workspace guidelines mandate confirmation!)
  const promptDelete = (file: DriveBackupFile) => {
    setConfirmModal({
      isOpen: true,
      title: 'গুগল ড্রাইভ থেকে ব্যাকআপ মুছবেন?',
      description: `ফাইল "${file.name}" গুগল ড্রাইভ থেকে স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      confirmText: 'মুছে ফেলুন',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteBackupFromDrive(file.id);
          setStatusMessage({ text: `ব্যাকআপ ফাইলটি গুগল ড্রাইভ থেকে মুছে ফেলা হয়েছে।`, type: 'info' });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          loadBackupsList();
        } catch (err: any) {
          console.error(err);
          setStatusMessage({ text: 'মুছে ফেলতে সমস্যা হয়েছে: ' + (err.message || ''), type: 'error' });
        }
      },
    });
  };

  // Restore from local JSON file
  const handleLocalFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && Array.isArray(json.items)) {
          setConfirmModal({
            isOpen: true,
            title: 'লোকাল ফাইল থেকে ব্যাকআপ রিস্টোর করবেন?',
            description: `ফাইলটিতে ${json.items.length} টি পণ্য পাওয়া গেছে। বর্তমান স্টকের সাথে প্রতিস্থাপিত করতে চান?`,
            confirmText: 'হ্যাঁ, রিস্টোর করুন',
            isDestructive: false,
            onConfirm: async () => {
              onRestoreData(json);
              setStatusMessage({ text: 'লোকাল ফাইল থেকে রিস্টোর সম্পন্ন হয়েছে!', type: 'success' });
              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
          });
        } else {
          alert('অকার্যকর ব্যাকআপ ফাইল');
        }
      } catch (err) {
        alert('ফাইল পড়তে সমস্যা হয়েছে');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Google Drive ব্যাকআপ ও রিস্টোর</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                  Irfan creation
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                আপনার দোকানের যাবতীয় স্টক ডাটা নিরাপদে গুগল ড্রাইভে সংরক্ষণ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                  : 'bg-blue-950/60 border border-blue-500/40 text-blue-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Google Account Connection Section */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>গুগল ড্রাইভ সংযোগ অবস্থা</span>
              </p>
              {currentUser ? (
                <div className="mt-1">
                  <p className="text-xs text-white font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>কানেক্টেড: <strong>{currentUser.email}</strong></span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ব্যাকআপ ফাইল আপনার ড্রাইভের নিরাপদ প্রাইভেট স্টোরেজে সংরক্ষিত হবে।
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  ড্রাইভে অটো ব্যাকআপ সেভ করার জন্য গুগল একাউন্ট দিয়ে সাইন-ইন করুন।
                </p>
              )}
            </div>

            <div>
              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>সাইন-আউট</span>
                </button>
              ) : (
                /* Official Google Sign-In Button as mandated in guidelines */
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoggingIn ? 'কানেক্ট হচ্ছে...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Backup Action Card */}
          <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-emerald-950/40 border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-400" />
                <span>নতুন ব্যাকআপ তৈরি করুন</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                বর্তমান {items.length} টি পণ্য ও ক্রয়মূল্য হিসাব গুগল ড্রাইভে সুরক্ষিত রাখুন।
              </p>
              {lastBackupTime && (
                <p className="text-[11px] text-emerald-400 mt-1">
                  সর্বশেষ ড্রাইভ ব্যাকআপ: {lastBackupTime}
                </p>
              )}
            </div>

            <button
              onClick={handleBackupNow}
              disabled={!currentUser || isBackingUp}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ড্রাইভে আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>ড্রাইভে এখনই ব্যাকআপ রাখুন</span>
                </>
              )}
            </button>
          </div>

          {/* Drive Backups List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>গুগল ড্রাইভের ব্যাকআপ তালিকা ({driveBackups.length})</span>
              </h3>
              {currentUser && (
                <button
                  onClick={loadBackupsList}
                  disabled={isLoadingBackups}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                  <span>রিফ্রেশ</span>
                </button>
              )}
            </div>

            {!currentUser ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                ড্রাইভের পূর্বের ব্যাকআপ ফাইল দেখতে অনুগ্রহ করে গুগল দিয়ে সাইন-ইন করুন।
              </div>
            ) : isLoadingBackups ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>গুগল ড্রাইভ চেক করা হচ্ছে...</span>
              </div>
            ) : driveBackups.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                গুগল ড্রাইভে এখনো কোনো ব্যাকআপ নেই। উপরের বাটনে ক্লিক করে নতুন ব্যাকআপ তৈরি করুন।
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {driveBackups.map((file) => {
                  const dateDisplay = new Date(file.createdTime).toLocaleString('bn-BD', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });

                  return (
                    <div
                      key={file.id}
                      className="bg-slate-850 bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {dateDisplay} • {file.description || 'Irfan creation backup'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => promptRestore(file)}
                          disabled={isRestoring}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-colors"
                          title="এই ব্যাকআপটি রিস্টোর করুন"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>রিস্টোর</span>
                        </button>

                        <button
                          onClick={() => promptDelete(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="ড্রাইভ থেকে মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Local Redundancy Backup Section */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 mb-2.5">
              অতিরিক্ত নিরাপত্তা (লোকাল অফলাইন ব্যাকআপ)
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => downloadLocalBackupJSON(items, categories)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>JSON ব্যাকআপ ডাউনলোড</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>ফাইল আপলোড করে রিস্টোর</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleLocalFileRestore}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal for Destructive/Restore operations (MANDATORY per Workspace guidelines) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  confirmModal.isDestructive
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={() => confirmModal.onConfirm()}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
