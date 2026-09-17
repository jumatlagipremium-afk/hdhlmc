import React, { useState, useEffect } from 'react';
import { useHemo } from '../context/HemoContext';
import {
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  WifiOff,
  FileSpreadsheet,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Cloud,
  ArrowDownToLine,
  Send,
  X,
} from 'lucide-react';

export interface SheetsSyncIndicatorProps {
  onOpenSettings?: () => void;
}

export const SheetsSyncIndicator: React.FC<SheetsSyncIndicatorProps> = ({ onOpenSettings }) => {
  const {
    settings,
    sheetsSyncStatus,
    sheetsSyncMessage,
    lastSheetsSyncTime,
    triggerAutoSaveToGoogleSheets,
    fetchDataFromGoogleSheets,
    isSyncing,
  } = useHemo();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showFullBanner, setShowFullBanner] = useState<boolean>(false);

  const hasWebhook = Boolean(
    settings.googleSheetWebhookUrl && settings.googleSheetWebhookUrl.includes('/exec')
  );

  // Automatically expand banner when saving, fetching, or error occurs,
  // and keep full banner visible for 4.5s after saved before collapsing to compact pill
  useEffect(() => {
    if (sheetsSyncStatus === 'saving' || sheetsSyncStatus === 'fetching' || sheetsSyncStatus === 'error') {
      setShowFullBanner(true);
    } else if (sheetsSyncStatus === 'saved') {
      setShowFullBanner(true);
      const timer = setTimeout(() => {
        setShowFullBanner(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [sheetsSyncStatus]);

  // Format last sync time nicely in Indonesian format
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Belum pernah';
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} WIB`;
  };

  // If no webhook configured yet, don't show the floating indicator
  if (!hasWebhook) {
    return null;
  }

  return (
    <aside
      aria-label="Google Sheets Sync Status"
      className="fixed bottom-20 right-3 sm:right-6 sm:bottom-6 z-40 flex flex-col items-end pointer-events-none"
    >
      {/* Expanded Modal / Action Card (Emergency controls & manual sync) */}
      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detail Sinkronisasi Google Sheets"
          className="pointer-events-auto mb-2 w-[calc(100vw-24px)] max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                Google Sheets Auto-Sync
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-2.5">
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              {sheetsSyncStatus === 'saving' && (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
              )}
              {sheetsSyncStatus === 'saved' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {sheetsSyncStatus === 'fetching' && (
                <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0 mt-0.5" />
              )}
              {sheetsSyncStatus === 'error' && (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              {sheetsSyncStatus === 'offline' && (
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              {sheetsSyncStatus === 'idle' && (
                <Cloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {sheetsSyncStatus === 'saving'
                    ? 'Menyimpan ke Google Sheets...'
                    : sheetsSyncStatus === 'saved'
                    ? 'Semua data tersimpan otomatis di Google Sheets'
                    : sheetsSyncStatus === 'fetching'
                    ? 'Menarik data terbaru dari Google Sheets...'
                    : sheetsSyncStatus === 'error'
                    ? 'Gagal sinkron ke Google Sheets'
                    : sheetsSyncStatus === 'offline'
                    ? 'Mode Offline (Tersimpan di perangkat)'
                    : 'Tersambung dengan Google Sheets'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Terakhir disimpan: <b className="text-slate-700 dark:text-slate-300">{formatTime(lastSheetsSyncTime)}</b>
                </p>
              </div>
            </div>

            {/* Emergency Actions Explanation */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Jadwal otomatis tersimpan di latar belakang. Jika koneksi sempat terputus, Anda dapat menekan tombol opsi darurat berikut:
            </p>

            {/* Manual Action Buttons (Emergency Fallback) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  triggerAutoSaveToGoogleSheets(true);
                }}
                disabled={isSyncing || sheetsSyncStatus === 'saving'}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                title="Kirim paksa jadwal saat ini ke Google Sheets"
              >
                <Send className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Mengirim...' : 'Sync Sekarang'}</span>
              </button>

              <button
                onClick={async () => {
                  await fetchDataFromGoogleSheets();
                }}
                disabled={isSyncing || sheetsSyncStatus === 'fetching'}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                title="Tarik data mutakhir dari Google Sheets"
              >
                <ArrowDownToLine className={`w-3.5 h-3.5 ${sheetsSyncStatus === 'fetching' ? 'animate-bounce' : ''}`} />
                <span>Tarik Data</span>
              </button>
            </div>

            {settings.googleSpreadsheetIdOrUrl && (
              <a
                href={settings.googleSpreadsheetIdOrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 pt-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Buka Google Spreadsheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Floating Status Pill */}
      <div className="pointer-events-auto">
        {showFullBanner ? (
          /* Detailed Pill when status changes (Menyimpan... or Semua data tersimpan...) */
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shadow-lg border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md ${
              sheetsSyncStatus === 'saving'
                ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20 animate-pulse'
                : sheetsSyncStatus === 'saved'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : sheetsSyncStatus === 'fetching'
                ? 'bg-sky-600 text-white border-sky-500 shadow-sky-500/20'
                : sheetsSyncStatus === 'error'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
                : sheetsSyncStatus === 'offline'
                ? 'bg-amber-600 text-white border-amber-500 shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-slate-900/10'
            }`}
          >
            {sheetsSyncStatus === 'saving' && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            )}
            {sheetsSyncStatus === 'saved' && (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            )}
            {sheetsSyncStatus === 'fetching' && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            )}
            {sheetsSyncStatus === 'error' && (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            {sheetsSyncStatus === 'offline' && (
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
            )}
            {sheetsSyncStatus === 'idle' && (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}

            <span className="tracking-tight select-none">
              {sheetsSyncStatus === 'saving'
                ? 'Menyimpan...'
                : sheetsSyncStatus === 'saved'
                ? 'Semua data tersimpan otomatis di Google Sheets'
                : sheetsSyncStatus === 'fetching'
                ? 'Menyegarkan dari Google Sheets...'
                : sheetsSyncStatus === 'error'
                ? 'Gagal simpan (Klik untuk retry)'
                : sheetsSyncStatus === 'offline'
                ? 'Offline (Tersimpan di perangkat)'
                : 'Tersinkron ke Google Sheets'}
            </span>

            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 opacity-80" />
            )}
          </button>
        ) : (
          /* Sleek Compact Pill (Quiet state) */
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="Klik untuk opsi sinkronisasi Google Sheets"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold">Sheets: Tersimpan</span>
            {lastSheetsSyncTime && (
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono hidden xs:inline">
                {formatTime(lastSheetsSyncTime).slice(0, 5)}
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
