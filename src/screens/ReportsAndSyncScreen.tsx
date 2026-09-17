import React, { useState, useMemo, useEffect } from 'react';
import { useHemo } from '../context/HemoContext';
import { FairSchedulerEngine } from '../domain/FairSchedulerEngine';
import { GoogleSheetsService } from '../domain/GoogleSheetsService';
import { GoogleScriptGuideModal } from '../components/GoogleScriptGuideModal';
import { ImportScheduleModal } from '../components/ImportScheduleModal';
import { ReadOnlyBanner } from '../components/ReadOnlyBanner';
import {
  FileSpreadsheet,
  Award,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Database,
  Building,
  Cloud,
  ShieldCheck,
  Laptop,
  Lock,
  Unlock,
  Server,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Activity,
} from 'lucide-react';

export const ReportsAndSyncScreen: React.FC = () => {
  const {
    isAdmin,
    currentMonth,
    nurses,
    machines,
    bays,
    specialDutyOptions,
    assignments,
    doctors,
    doctorDuties,
    settings,
    updateSettings,
    syncWithGoogleSheets,
    syncAllToGoogleSheets,
    fetchDataFromGoogleSheets,
    syncAllDataToCloud,
    fetchDataFromCloud,
    isCloudConnected,
    isCloudLoaded,
    resetToInitialData,
    showToast,
  } = useHemo();

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingAllSheets, setIsSyncingAllSheets] = useState(false);
  const [isFetchingSheets, setIsFetchingSheets] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [showCloudAdvanced, setShowCloudAdvanced] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isFairnessReportOpen, setIsFairnessReportOpen] = useState(false);
  const [isWebhookCardOpen, setIsWebhookCardOpen] = useState(false);
  const [isWebhookLocked, setIsWebhookLocked] = useState(true);
  const [isBackupCardOpen, setIsBackupCardOpen] = useState(false);

  // Editable settings form
  const [hospitalName, setHospitalName] = useState(settings.hospitalName);
  const [roomName, setRoomName] = useState(settings.roomName);
  const [headNurseName, setHeadNurseName] = useState(settings.headNurseName);
  const [headNursePhone, setHeadNursePhone] = useState(settings.headNursePhone);
  const [googleSheetWebhookUrl, setGoogleSheetWebhookUrl] = useState(
    settings.googleSheetWebhookUrl
  );
  const [googleSpreadsheetIdOrUrl, setGoogleSpreadsheetIdOrUrl] = useState(
    settings.googleSpreadsheetIdOrUrl
  );
  const [autoSync, setAutoSync] = useState(settings.autoSyncGoogleSheets);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ isSuccess: boolean; message: string; latencyMs?: number } | null>(null);

  useEffect(() => {
    setHospitalName(settings.hospitalName);
    setRoomName(settings.roomName);
    setHeadNurseName(settings.headNurseName);
    setHeadNursePhone(settings.headNursePhone);
    setGoogleSheetWebhookUrl(settings.googleSheetWebhookUrl);
    setGoogleSpreadsheetIdOrUrl(settings.googleSpreadsheetIdOrUrl);
    setAutoSync(settings.autoSyncGoogleSheets);
  }, [
    settings.hospitalName,
    settings.roomName,
    settings.headNurseName,
    settings.headNursePhone,
    settings.googleSheetWebhookUrl,
    settings.googleSpreadsheetIdOrUrl,
    settings.autoSyncGoogleSheets,
  ]);

  // Compute fairness report for current month
  const fairnessReport = useMemo(() => {
    return FairSchedulerEngine.calculateFairnessReport(
      currentMonth,
      nurses,
      machines,
      assignments
    );
  }, [currentMonth, nurses, machines, assignments]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    updateSettings({
      ...settings,
      hospitalName: hospitalName.trim(),
      roomName: roomName.trim(),
      headNurseName: headNurseName.trim(),
      headNursePhone: headNursePhone.trim(),
      googleSheetWebhookUrl: googleSheetWebhookUrl.trim(),
      googleSpreadsheetIdOrUrl: googleSpreadsheetIdOrUrl.trim(),
      autoSyncGoogleSheets: autoSync,
    });
    showToast('Pengaturan sistem & integrasi berhasil disimpan', 'success');
  };

  const handleSaveUnitIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    updateSettings({
      ...settings,
      hospitalName: hospitalName.trim(),
      roomName: roomName.trim(),
      headNurseName: headNurseName.trim(),
      headNursePhone: headNursePhone.trim(),
    });
    showToast('Identitas unit & rumah sakit berhasil disimpan', 'success');
  };

  const handleSaveWebhookSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;
    updateSettings({
      ...settings,
      googleSheetWebhookUrl: googleSheetWebhookUrl.trim(),
      googleSpreadsheetIdOrUrl: googleSpreadsheetIdOrUrl.trim(),
      autoSyncGoogleSheets: autoSync,
    });
    setIsWebhookLocked(true);
    showToast('Pengaturan Webhook berhasil dikunci & disimpan permanen', 'success');
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    const result = await GoogleSheetsService.testConnection(googleSheetWebhookUrl);
    setIsTestingConnection(false);
    setConnectionTestResult(result);
    showToast(result.message, result.isSuccess ? 'success' : 'error');
  };

  const handleManualSync = async () => {
    if (!isAdmin) return;
    setIsSyncing(true);
    await syncWithGoogleSheets(googleSheetWebhookUrl);
    setIsSyncing(false);
  };

  const handleSyncAllToGoogleSheets = async () => {
    if (!isAdmin) return;
    setIsSyncingAllSheets(true);
    await syncAllToGoogleSheets(googleSheetWebhookUrl);
    setIsSyncingAllSheets(false);
  };

  const handleFetchAllFromGoogleSheets = async () => {
    setIsFetchingSheets(true);
    await fetchDataFromGoogleSheets(googleSheetWebhookUrl);
    setIsFetchingSheets(false);
  };

  const handleExportJSON = () => {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      nurses,
      machines,
      assignments,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hemo-shift-backup-${currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File backup JSON berhasil diunduh', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.nurses && parsed.machines && parsed.assignments) {
          localStorage.setItem('hemo_nurses_v1', JSON.stringify(parsed.nurses));
          localStorage.setItem('hemo_machines_v1', JSON.stringify(parsed.machines));
          localStorage.setItem('hemo_assignments_v1', JSON.stringify(parsed.assignments));
          if (parsed.settings) {
            localStorage.setItem('hemo_settings_v1', JSON.stringify(parsed.settings));
          }
          showToast('Data berhasil dipulihkan dari backup. Memuat ulang...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast('Format file backup tidak valid', 'error');
        }
      } catch {
        showToast('Gagal membaca file backup', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-24 space-y-5">
      <ReadOnlyBanner actionDescription="menyinkronkan data cloud, merubah pengaturan unit, atau memulihkan/mereset database" />

      {/* Google Sheets Integration (Collapsible Accordion) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Integrasi Google Sheets & Webhook
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Sinkronisasi 2-Arah
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Webhook Terkunci
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Koneksi Google Spreadsheet untuk ekspor/impor master perawat, 25 mesin HD, dokter, dan jadwal bulanan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {googleSpreadsheetIdOrUrl && (
              <a
                href={
                  googleSpreadsheetIdOrUrl.startsWith('http')
                    ? googleSpreadsheetIdOrUrl
                    : `https://docs.google.com/spreadsheets/d/${googleSpreadsheetIdOrUrl}/edit`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors min-h-[40px]"
              >
                Buka Sheets <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsGoogleSheetsOpen(!isGoogleSheetsOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors min-h-[40px] cursor-pointer"
            >
              {isGoogleSheetsOpen ? (
                <>
                  <span>Sembunyikan Panel</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Tampilkan Integrasi Sheets</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Content for Google Sheets */}
        {isGoogleSheetsOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Pusat sinkronisasi spreadsheet tanpa batasan kuota.
              </span>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Panduan Setup Webhook <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2-Way Sync Action Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Sinkronisasi 2-Arah Google Sheets (Perawat, Dokter, Jadwal, Tugas Khusus & Bay)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Tarik data dari Google Sheets ke perangkat ini atau kirim data lokal saat ini ke Google Sheets:
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <span>{nurses.length} Perawat</span>
                  <span>•</span>
                  <span>{doctors.length} Dokter HD</span>
                  <span>•</span>
                  <span>{bays.length} Bay</span>
                  <span>•</span>
                  <span>{specialDutyOptions.length} Tugas Khusus</span>
                  <span>•</span>
                  <span>{assignments.length} Jadwal</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* Tarik dari Google Sheets */}
                <button
                  onClick={handleFetchAllFromGoogleSheets}
                  disabled={isFetchingSheets || !googleSheetWebhookUrl}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 active:scale-95 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl font-bold text-xs shadow-xs transition-all disabled:opacity-50 min-h-[44px]"
                  title="Tarik data staf perawat, dokter, jadwal perawat & dokter, tugas khusus, dan data bay dari Google Sheets"
                >
                  <Download className={`w-4 h-4 ${isFetchingSheets ? 'animate-bounce' : 'text-emerald-600'}`} />
                  <span>{isFetchingSheets ? 'Menarik Data 2-Arah...' : 'Tarik dari Google Sheets'}</span>
                </button>

                {/* Kirim Semua ke Google Sheets */}
                {isAdmin && (
                  <button
                    onClick={handleSyncAllToGoogleSheets}
                    disabled={isSyncingAllSheets || !googleSheetWebhookUrl}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50 min-h-[44px]"
                    title="Kirim seluruh perawat, dokter, mesin, bay, tugas khusus, dan matriks jadwal format .xlsx kalender ke Google Sheets"
                  >
                    <Upload className={`w-4 h-4 ${isSyncingAllSheets ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingAllSheets ? 'Mengekspor...' : 'Kirim Semua ke Sheets (.xlsx)'}</span>
                  </button>
                )}

                {/* Sync Jadwal Saja */}
                {isAdmin && (
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing || !googleSheetWebhookUrl}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 active:scale-95 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 min-h-[44px]"
                    title="Sinkronkan matriks jadwal kalender bulan aktif dan jadwal dokter ke Google Sheets"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyinkronkan...' : 'Sync Matriks Jadwal'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sync Status Banner */}
            {settings.lastSyncTimestamp && (
              <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Terakhir disinkronkan:{' '}
                    <b>{new Date(settings.lastSyncTimestamp).toLocaleString('id-ID')}</b>
                  </span>
                </div>
                <span className="font-mono text-[11px] bg-emerald-100/70 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg max-w-xs truncate">
                  {settings.lastSyncStatus || 'OK (200)'}
                </span>
              </div>
            )}

            {/* Sub-collapsible for Webhook URL Configuration */}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Konfigurasi URL Webhook & Spreadsheet
                </span>
                <button
                  type="button"
                  onClick={() => setIsWebhookCardOpen(!isWebhookCardOpen)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {isWebhookCardOpen ? 'Tutup URL Webhook' : 'Ubah URL Webhook'}
                  {isWebhookCardOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {isWebhookCardOpen && (
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-[11px] leading-relaxed">
                        {isWebhookLocked
                          ? 'Pengaturan Webhook sedang terkunci untuk keamanan. Klik "Buka Kunci" jika ingin mengubah tautan.'
                          : 'Pengaturan Webhook dibuka kuncinya. Silakan masukkan URL Google Apps Script Anda.'}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsWebhookLocked(!isWebhookLocked)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-[11px] shrink-0 transition-colors shadow-2xs"
                      >
                        {isWebhookLocked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Buka Kunci Edit</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kunci Kembali</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveWebhookSettings} className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Google Apps Script Web App URL (/exec):
                      </label>
                      <input
                        type="url"
                        value={googleSheetWebhookUrl}
                        disabled={isWebhookLocked}
                        onChange={(e) => setGoogleSheetWebhookUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        className={`w-full px-3 py-2 rounded-xl font-mono text-slate-800 dark:text-slate-200 border text-xs ${
                          isWebhookLocked
                            ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-75'
                            : 'bg-white dark:bg-slate-900 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
                        }`}
                      />
                      {googleSheetWebhookUrl.includes('docs.google.com/spreadsheets/d/') && !googleSheetWebhookUrl.includes('/exec') && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Perhatian: URL ini adalah link Spreadsheet biasa, bukan Webhook!</span>
                            <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                              Spreadsheet biasa tidak bisa menerima kiriman data langsung dari browser. Silakan pasang Apps Script melalui menu <b>Ekstensi &rarr; Apps Script</b> di Spreadsheet Anda, lakukan <b>Deploy &rarr; New Deployment &rarr; Web App (Who has access: Anyone)</b>, lalu salin URL yang berakhiran <code>/exec</code>.
                            </p>
                          </div>
                        </div>
                      )}
                      {googleSheetWebhookUrl.trim().endsWith('/dev') && (
                        <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Perhatian: URL berakhiran /dev (Test Mode)!</span>
                            <p className="mt-0.5 text-[11px] text-rose-800 dark:text-rose-300">
                              URL /dev memerlukan login akun Google pengembang dan akan memblokir sinkronisasi. Harap deploy ulang dengan <b>Deploy &rarr; New Deployment &rarr; Web App</b> dan salin URL versi produksi yang berakhiran <code>/exec</code>.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tautan / ID Spreadsheet Google (Opsional - untuk tombol buka cepat):
                      </label>
                      <input
                        type="text"
                        value={googleSpreadsheetIdOrUrl}
                        disabled={isWebhookLocked}
                        onChange={(e) => setGoogleSpreadsheetIdOrUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                        className={`w-full px-3 py-2 rounded-xl font-mono text-slate-800 dark:text-slate-200 border text-xs ${
                          isWebhookLocked
                            ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-75'
                            : 'bg-white dark:bg-slate-900 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>

                    {/* Test Connection Result Alert */}
                    {connectionTestResult && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          connectionTestResult.isSuccess
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        {connectionTestResult.isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <span className="font-bold">
                            {connectionTestResult.isSuccess ? 'Uji Koneksi Berhasil' : 'Uji Koneksi Gagal'}
                          </span>
                          <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed">
                            {connectionTestResult.message}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoSync}
                          disabled={isWebhookLocked}
                          onChange={(e) => setAutoSync(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 disabled:opacity-50"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Otomatis sinkron ke Google Sheets saat generate jadwal atau edit sif
                        </span>
                      </label>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingConnection || !googleSheetWebhookUrl.trim()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                        title="Periksa apakah Webhook aktif dan dapat diakses dari browser"
                      >
                        <Activity className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isTestingConnection ? 'animate-spin' : ''}`} />
                        <span>{isTestingConnection ? 'Menguji Koneksi...' : 'Uji Koneksi Webhook'}</span>
                      </button>

                      {isAdmin && !isWebhookLocked && (
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all"
                        >
                          <Lock className="w-4 h-4" />
                          Kunci & Simpan Webhook
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fairness & Workload Analysis Card (Collapsible Accordion) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/80 dark:border-amber-800/60 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Laporan Analisis Beban Kerja & Keadilan Sif
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Skor: {fairnessReport.fairnessScorePercent}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluasi proporsionalitas jadwal sif (Pagi/Siang/Libur/Cuti) dan alokasi mesin per perawat untuk bulan {currentMonth}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsFairnessReportOpen(!isFairnessReportOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors min-h-[40px] cursor-pointer"
            >
              {isFairnessReportOpen ? (
                <>
                  <span>Sembunyikan Laporan</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Buka Laporan Keadilan</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Content for Fairness Report */}
        {isFairnessReportOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
            {/* Mini stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Rata-rata Sif Kerja</span>
                <div className="font-bold text-slate-800 dark:text-white text-base mt-0.5">
                  {fairnessReport.avgShiftsPerNurse} Sif / Orang
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Rentang Beban Sif</span>
                <div className="font-bold text-slate-800 dark:text-white text-base mt-0.5">
                  Min: {fairnessReport.minShifts} | Max: {fairnessReport.maxShifts}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Rata-rata Alokasi Mesin</span>
                <div className="font-bold text-slate-800 dark:text-white text-base mt-0.5">
                  {fairnessReport.avgMachinesPerNurse} Mesin / Sif
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Hari Libur Tim</span>
                <div className="font-bold text-slate-800 dark:text-white text-base mt-0.5">
                  {fairnessReport.totalOffDays} Hari
                </div>
              </div>
            </div>

            {/* Nurse Fairness Distribution Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Nama Perawat</th>
                      <th className="py-2.5 px-2 text-center">Jabatan</th>
                      <th className="py-2.5 px-2 text-center text-sky-700 dark:text-sky-400">Pagi</th>
                      <th className="py-2.5 px-2 text-center text-amber-700 dark:text-amber-400">Siang</th>
                      <th className="py-2.5 px-2 text-center text-slate-500 dark:text-slate-400">Libur</th>
                      <th className="py-2.5 px-2 text-center text-teal-700 dark:text-teal-400">Cuti</th>
                      <th className="py-2.5 px-2 text-center font-bold text-slate-900 dark:text-white">Total Dinas</th>
                      <th className="py-2.5 px-2 text-center font-bold text-blue-700 dark:text-blue-400">Total Mesin</th>
                      <th className="py-2.5 px-2 text-center font-bold text-purple-700 dark:text-purple-400">Mesin Isolasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fairnessReport.nurseStats.map((stat, idx) => (
                      <tr key={stat.nurseId} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-800/40'}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{stat.nurseName}</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 dark:text-slate-400">{stat.role}</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-sky-700 dark:text-sky-400">
                          {stat.pagiCount}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-amber-700 dark:text-amber-400">
                          {stat.siangCount}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-500 dark:text-slate-400">{stat.liburCount}</td>
                        <td className="py-2.5 px-2 text-center text-teal-700 dark:text-teal-400">{stat.cutiCount}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-900 dark:text-white">
                          {stat.totalWorkingShifts}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-blue-700 dark:text-blue-400">
                          {stat.totalMachinesAssigned}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-purple-700 dark:text-purple-400">
                          {stat.isolationMachinesHandled}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cloud Firestore (Latar Belakang & Diagnostik Drawer) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/80 dark:border-sky-800/60 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Database Cloud Firestore (Latar Belakang)
                </h4>
                {isCloudConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Terhubung Real-Time (Auto-Sync)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Menghubungkan...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perubahan jadwal, mesin, dan perawat otomatis tersimpan di latar belakang ke Cloud Firestore.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCloudAdvanced(!showCloudAdvanced)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            <span>{showCloudAdvanced ? 'Tutup Diagnostik Cloud' : 'Opsi Lanjutan / Diagnostik Cloud'}</span>
            {showCloudAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Advanced Cloud Controls */}
        {showCloudAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-300">
              <span className="font-bold block mb-0.5">Catatan Diagnostik:</span>
              Tombol manual di bawah ini digunakan untuk sinkronisasi paksa ke database Cloud Firestore.
            </div>

            {/* Cloud Status Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  Jadwal di Cloud
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {assignments.length} Sif Terkunci
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  Data Perawat
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {nurses.length} Perawat
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  Mesin HD
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {machines.length} Mesin
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={async () => {
                  setIsSyncingCloud(true);
                  await fetchDataFromCloud();
                  setIsSyncingCloud(false);
                }}
                disabled={isSyncingCloud}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-2xl font-bold text-xs shadow-xs transition-all disabled:opacity-50 min-h-[44px]"
                title="Tarik dan perbarui data dari Cloud Firestore ke perangkat ini"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>{isSyncingCloud ? 'Menarik...' : 'Tarik Manual dari Cloud'}</span>
              </button>

              <button
                onClick={async () => {
                  setIsSyncingCloud(true);
                  await syncAllDataToCloud();
                  setIsSyncingCloud(false);
                }}
                disabled={isSyncingCloud}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-2xl font-bold text-xs shadow-md shadow-sky-500/25 transition-all disabled:opacity-50 min-h-[44px]"
                title="Unggah dan simpan seluruh data lokal ke Cloud Firestore"
              >
                <Upload className={`w-4 h-4 ${isSyncingCloud ? 'animate-bounce' : ''}`} />
                <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Unggah Manual ke Cloud'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Jadwal dari Excel / CSV */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-emerald-600/5 dark:from-emerald-950/40 dark:to-slate-900 rounded-3xl p-5 border border-emerald-300/60 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Import Jadwal Bulanan dari Excel / File
              </h3>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                Fitur Baru
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Unggah file (.xlsx, .xls, .csv) atau salin-tempel matriks jadwal perawat.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-500/25 transition-all active:scale-98 shrink-0 min-h-[44px]"
          >
            <Upload className="w-4 h-4" />
            <span>Buka Pengimpor Jadwal</span>
          </button>
        )}
      </div>

      {/* Unit Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/60">
            <Building className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Identitas Unit & Rumah Sakit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Nama instansi, unit hemodialisis, dan kontak Kepala Ruangan untuk kepala surat laporan dinas dan WhatsApp.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveUnitIdentity} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Rumah Sakit</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Ruangan / Unit</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kepala Ruangan (KARU)
              </label>
              <input
                type="text"
                value={headNurseName}
                onChange={(e) => setHeadNurseName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp KARU (Untuk Laporan)
              </label>
              <input
                type="tel"
                value={headNursePhone}
                onChange={(e) => setHeadNursePhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-500/25 transition-all min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                Simpan Identitas Unit
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Backup & Restore Data Card - Collapsed by default for minimalist interface */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Cadangan File Offline & Pemulihan (JSON)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ekspor file cadangan lokal mandiri atau reset basis data.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBackupCardOpen(!isBackupCardOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            {isBackupCardOpen ? (
              <>
                <span>Sembunyikan</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Buka Cadangan</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {isBackupCardOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simpan cadangan offline data perawat, 25 mesin, dan jadwal sif ke format JSON, atau unduh data dokter ke CSV.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors min-h-[40px]"
              >
                <Download className="w-4 h-4" />
                Unduh JSON
              </button>

              <button
                onClick={() => GoogleSheetsService.exportDoctorsToCSV(doctors)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold rounded-xl transition-colors min-h-[40px]"
                title="Unduh daftar master data dokter jaga ke file CSV"
              >
                <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                CSV Dokter
              </button>

              <button
                onClick={() => GoogleSheetsService.exportDoctorScheduleToCSV(currentMonth, doctorDuties, doctors)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold rounded-xl transition-colors min-h-[40px]"
                title="Unduh jadwal dokter jaga bulan aktif ke file CSV"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                CSV Jadwal Dokter
              </button>

              {isAdmin && (
                <>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl cursor-pointer transition-colors min-h-[40px]">
                    <Upload className="w-4 h-4" />
                    Pulihkan JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'PERINGATAN: Apakah Anda yakin ingin mereset data? Data perawat akan dikosongkan dan susunan 30 mesin HD (A01-A12, C01-C04, B01-B09, C05-C09) akan disiapkan kembali.'
                        )
                      ) {
                        resetToInitialData();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold rounded-xl transition-colors ml-auto min-h-[40px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Data
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Guide Modal */}
      <GoogleScriptGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Import Schedule Modal */}
      {isImportModalOpen && (
        <ImportScheduleModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          defaultMonth={currentMonth}
        />
      )}
    </div>
  );
};
