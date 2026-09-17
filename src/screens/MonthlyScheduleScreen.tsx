import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useHemo } from '../context/HemoContext';
import { ShiftAssignment, ShiftType, SHIFT_TYPE_INFO, NURSE_ROLE_INFO, Nurse, parseSpecialDuties } from '../types';
import { GoogleSheetsService } from '../domain/GoogleSheetsService';
import { RegenerateMachineAllocationModal } from '../components/RegenerateMachineAllocationModal';
import { ImportScheduleModal } from '../components/ImportScheduleModal';
import { EditAssignmentModal } from '../components/EditAssignmentModal';
import { SpecialDutyModal } from '../components/SpecialDutyModal';
import { SpecialDutyBadge } from '../components/SpecialDutyBadge';
import { ReadOnlyBanner } from '../components/ReadOnlyBanner';
import { getSpecialDutyDotStyle, SPECIAL_DUTY_DOT_LEGENDS } from '../utils/specialDutyColors';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Upload,
  FileSpreadsheet,
  Filter,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Tag,
  Stethoscope,
  Clock,
} from 'lucide-react';
import { MonthlyDoctorScheduleView } from '../components/MonthlyDoctorScheduleView';
import { GoogleScriptGuideModal } from '../components/GoogleScriptGuideModal';

export const MonthlyScheduleScreen: React.FC = () => {
  const {
    isAdmin,
    currentMonth,
    setCurrentMonth,
    nurses,
    machines,
    assignments,
    setShift,
    updateAssignment,
    generateMonthlySchedule,
    resetMonthlySchedule,
    isGenerating,
    showToast,
    selectDate,
    settings,
    syncWithGoogleSheets,
    isSyncing,
  } = useHemo();

  const [scheduleCategory, setScheduleCategory] = useState<'NURSES' | 'DOCTORS'>('NURSES');
  const [selectedNurseFilter, setSelectedNurseFilter] = useState<number | 'ALL'>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [isReallocateModalOpen, setIsReallocateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSpecialDutyModalOpen, setIsSpecialDutyModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedDutyNurseId, setSelectedDutyNurseId] = useState<number | undefined>(undefined);
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);

  const handleSyncToGoogleSheets = async () => {
    if (!settings.googleSheetWebhookUrl) {
      setIsGuideModalOpen(true);
      return;
    }

    const parts = currentMonth.split('-');
    const year = parts[0];
    const mNum = parseInt(parts[1], 10);
    const mNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthTitle = `${mNames[mNum - 1] || parts[1]} ${year}`;

    showToast(`Mengirim matriks jadwal ${monthTitle} ke Google Sheets...`, 'info');
    const success = await syncWithGoogleSheets();
    if (success) {
      showToast(`Matriks jadwal ${monthTitle} berhasil dikirim ke tab "Matriks HD - ${monthTitle}"! Matriks bulan sebelumnya tetap tersimpan utuh.`, 'success');
    } else {
      showToast('Gagal mengirim ke Google Sheets. Periksa koneksi atau perbarui script Google Sheets via Panduan.', 'error');
    }
  };

  const handleResetSchedule = async () => {
    setIsResetting(true);
    try {
      const success = await resetMonthlySchedule(currentMonth);
      if (success) {
        setIsResetConfirmOpen(false);
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Table container ref for smooth horizontal scrolling
  const matrixContainerRef = useRef<HTMLDivElement>(null);

  // Real-time current date calculation
  const realTimeTodayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Month parsed
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  // Month navigation
  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Days in month calculation
  const totalDaysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  const daysArray = useMemo(() => {
    const days = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(year, month - 1, day);
      const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const isToday = dateStr === realTimeTodayStr;
      days.push({
        dayNumber: day,
        dateString: dateStr,
        dayName: dayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isSunday: dayOfWeek === 0,
        isToday,
      });
    }
    return days;
  }, [year, month, totalDaysInMonth, realTimeTodayStr]);

  // Full Month Matrix: visibleDays is always the full month
  const visibleDays = daysArray;

  // Auto scroll to today on load if today is in this month
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (matrixContainerRef.current) {
        const todayEl = matrixContainerRef.current.querySelector('[data-active-today="true"]');
        if (todayEl) {
          todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentMonth]);

  const scrollToActiveToday = () => {
    if (matrixContainerRef.current) {
      const todayEl = matrixContainerRef.current.querySelector('[data-active-today="true"]');
      if (todayEl) {
        todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  // Active Nurses filtered
  const filteredNurses = useMemo(() => {
    return nurses.filter((nurse) => {
      if (!nurse.isActive) return false;
      if (selectedNurseFilter !== 'ALL' && nurse.id !== selectedNurseFilter) return false;
      if (selectedRoleFilter !== 'ALL' && nurse.role !== selectedRoleFilter) return false;
      return true;
    });
  }, [nurses, selectedNurseFilter, selectedRoleFilter]);

  // Assignment Map for ultra-fast lookup: key = `${date}_${nurseId}`
  const assignmentMap = useMemo(() => {
    const map = new Map<string, ShiftType>();
    assignments.forEach((a) => {
      if (a.date.startsWith(currentMonth)) {
        map.set(`${a.date}_${a.nurseId}`, a.shiftType);
      }
    });
    return map;
  }, [assignments, currentMonth]);

  // Detailed Assignment Map: key = `${date}_${nurseId}` -> ShiftAssignment
  const assignmentDetailMap = useMemo(() => {
    const map = new Map<string, ShiftAssignment>();
    assignments.forEach((a) => {
      if (a.date.startsWith(currentMonth)) {
        map.set(`${a.date}_${a.nurseId}`, a);
      }
    });
    return map;
  }, [assignments, currentMonth]);

  const handleOpenEditModal = (dateStr: string, nurse: Nurse) => {
    if (!isAdmin) {
      showToast('Akses Dibatasi: Masuk sebagai Kepala Ruangan (Karu) atau Admin untuk merubah jadwal dinas.', 'info');
      return;
    }
    const existing = assignmentDetailMap.get(`${dateStr}_${nurse.id}`);
    if (existing) {
      setEditingAssignment(existing);
    } else {
      setEditingAssignment({
        id: `${dateStr}_${nurse.id}_${Date.now()}`,
        date: dateStr,
        shiftType: 'LIBUR',
        nurseId: nurse.id,
        nurseName: nurse.name,
        nursePhone: nurse.phone,
        assignedMachineIds: [],
        isLeader: nurse.role === 'KATIM',
        isWhatsAppSent: false,
        notes: '',
        specialDuty: null,
      });
    }
  };

  // Cycle shift on click: PAGI -> SIANG -> LIBUR -> CUTI -> SAKIT -> PAGI
  const handleCellClick = (dateStr: string, nurseId: number) => {
    if (!isAdmin) {
      showToast('Akses Dibatasi: Masuk sebagai Kepala Ruangan (Karu) atau Admin untuk merubah jadwal dinas.', 'info');
      return;
    }
    const key = `${dateStr}_${nurseId}`;
    const currentShift = assignmentMap.get(key);

    // Exact cycle requested:
    // P -> S -> L -> C -> SKT -> P
    let nextShift: ShiftType;
    if (currentShift === 'PAGI') {
      nextShift = 'SIANG';
    } else if (currentShift === 'SIANG') {
      nextShift = 'LIBUR';
    } else if (currentShift === 'LIBUR') {
      nextShift = 'CUTI';
    } else if (currentShift === 'CUTI') {
      nextShift = 'SAKIT';
    } else {
      // If currently 'SAKIT', or undefined/not set yet
      nextShift = 'PAGI';
    }

    setShift(dateStr, nurseId, nextShift);
  };

  // Month Name formatted (Indonesian)
  const monthNamesId = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const monthLabel = `${monthNamesId[month - 1]} ${year}`;

  // Monthly summary stats
  const monthlyStats = useMemo(() => {
    let totalP = 0;
    let totalS = 0;
    let totalL = 0;
    let totalC = 0;
    let totalSkt = 0;

    assignments.forEach((a) => {
      if (a.date.startsWith(currentMonth)) {
        if (a.shiftType === 'PAGI') totalP++;
        else if (a.shiftType === 'SIANG') totalS++;
        else if (a.shiftType === 'LIBUR') totalL++;
        else if (a.shiftType === 'CUTI') totalC++;
        else if (a.shiftType === 'SAKIT') totalSkt++;
      }
    });

    const activeCount = nurses.filter((n) => n.isActive).length;
    const avgShifts = activeCount > 0 ? ((totalP + totalS) / activeCount).toFixed(1) : '0';

    return { totalP, totalS, totalL, totalC, totalSkt, avgShifts };
  }, [assignments, currentMonth, nurses]);

  // Export CSV
  const handleExportCSV = () => {
    GoogleSheetsService.exportMonthlyScheduleToCSV(currentMonth, nurses, assignments);
    showToast(`Jadwal bulan ${monthLabel} berhasil diekspor ke CSV`, 'success');
  };

  return (
    <div className="pb-24 space-y-4">
      <ReadOnlyBanner actionDescription="menyusun jadwal 1 bulan, mengimpor Excel/Spreadsheet, atau merubah status sif dinas" />

      {/* Top Header & Monthly Control Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-200/80 dark:border-slate-800/80 space-y-3.5 transition-all">
        {/* Sub-view Category Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setScheduleCategory('NURSES')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scheduleCategory === 'NURSES'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Jadwal Tim Perawat & Mesin</span>
          </button>
          <button
            type="button"
            onClick={() => setScheduleCategory('DOCTORS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scheduleCategory === 'DOCTORS'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Jadwal Dokter Jaga HD</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Month Switcher */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs transition-all active:scale-95"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="font-black text-slate-900 dark:text-white text-base sm:text-lg min-w-[150px] text-center tracking-tight">
                {monthLabel}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs transition-all active:scale-95"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
            <button
              onClick={handleCurrentMonth}
              className="px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs transition-all active:scale-95"
            >
              Bulan Ini
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setSelectedDutyNurseId(undefined);
                    setIsSpecialDutyModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-soft-sm transition-all active:scale-95"
                  title="Menu khusus untuk menginput dan mengelola tugas khusus ruangan HD (BHP, Farmasi Logistik, Natrium RO, PJ Shif, CITO)"
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Input Tugas Khusus</span>
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-soft-sm transition-all active:scale-95"
                  title="Import jadwal dari file Excel (.xlsx, .xls, .csv), Google Sheets, atau Salin-Tempel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Import Excel</span>
                </button>
                <button
                  onClick={() => setIsReallocateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-extrabold shadow-soft-sm transition-all active:scale-95"
                  title="Generate ulang alokasi mesin adil untuk seluruh tanggal bulan ini tanpa merubah jadwal sif"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mesin Adil</span>
                </button>
                <button
                  onClick={() => generateMonthlySchedule(currentMonth)}
                  disabled={isGenerating || isResetting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-extrabold shadow-soft-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Generate otomatis jadwal 1 bulan adil: Senin-Sabtu (6 hari kerja) pembagian sif berimbang 50:50 (misal 13P:13S atau 15P:15S per staf), libur HANYA hari Minggu, Kepala Ruang setiap hari kerja sif pagi"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{isGenerating && !isResetting ? 'Menyusun...' : 'Auto-Jadwal 1 Bulan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  disabled={isGenerating || isResetting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Reset dan hapus seluruh jadwal dinas pada bulan ini tanpa menghapus data staf/perawat"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Reset Jadwal</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter bar & Mini Stats */}
        {scheduleCategory === 'NURSES' && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="ALL">Semua Jabatan</option>
                <option value="KARU">Kepala Ruangan (KARU)</option>
                <option value="KATIM">PJ Sif (Katim)</option>
                <option value="PELAKSANA">Pelaksana</option>
              </select>
              <select
                value={selectedNurseFilter}
                onChange={(e) =>
                  setSelectedNurseFilter(
                    e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                  )
                }
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="ALL">Semua Perawat ({filteredNurses.length})</option>
                {nurses.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 flex-wrap font-semibold">
              <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/50 px-2 py-1 rounded-lg border border-sky-200/60 dark:border-sky-800/60 text-sky-800 dark:text-sky-300">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Pagi: <b>{monthlyStats.totalP}</b>
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60 text-amber-800 dark:text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Siang: <b>{monthlyStats.totalS}</b>
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Libur: <b>{monthlyStats.totalL}</b>
              </span>
              <span className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/50 px-2 py-1 rounded-lg border border-teal-200/60 dark:border-teal-800/60 text-teal-800 dark:text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Cuti: <b>{monthlyStats.totalC}</b>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">
                Rata-rata: <b>{monthlyStats.avgShifts} sif/orang</b>
              </span>
            </div>
          </div>
        )}
      </div>

      {scheduleCategory === 'DOCTORS' ? (
        <MonthlyDoctorScheduleView currentMonth={currentMonth} />
      ) : (
        <>
          {/* Full Monthly Schedule Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-all">
        {/* Full Month Scope Controls with Real-Time Active Day Indicator */}
        <div className="px-4 py-3 bg-slate-50/90 dark:bg-slate-850/90 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Tampilan 1 Bulan Penuh</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-black">
                {totalDaysInMonth} Hari
              </span>
            </div>

            {/* Real-time active day status badge */}
            {daysArray.some((d) => d.isToday) && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                </span>
                <span>
                  Hari Aktif (Real Time): <b>{daysArray.find((d) => d.isToday)?.dayName}, {new Date().getDate()} {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][month - 1]} {year}</b>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {daysArray.some((d) => d.isToday) && (
              <button
                type="button"
                onClick={scrollToActiveToday}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-soft-sm transition-all active:scale-95"
                title="Gulir langsung ke kolom hari ini (Real Time)"
              >
                <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Fokus Hari Aktif</span>
              </button>
            )}
          </div>
        </div>

        {/* Helper guide */}
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <span className="flex items-center gap-1.5 flex-wrap">
                <span>
                  💡 <b>Tip:</b> Cukup <b>1 kali klik</b> pada jadwal sif untuk berganti otomatis (
                  <span className="text-sky-700 dark:text-sky-400 font-bold">P</span> &rarr;{' '}
                  <span className="text-amber-700 dark:text-amber-400 font-bold">S</span> &rarr;{' '}
                  <span className="text-slate-600 dark:text-slate-300 font-bold">L</span> &rarr;{' '}
                  <span className="text-teal-700 dark:text-teal-400 font-bold">C</span> &rarr;{' '}
                  <span className="text-rose-700 dark:text-rose-400 font-bold">SKT</span>). Kolom dengan bingkai biru terang dan badge <b>KINI</b> adalah hari aktif (Real Time).
                </span>
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <span>👁️</span> Mode Hanya Lihat: Anda sedang melihat jadwal dinas resmi HD 1 bulan penuh.
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-slate-400">
            Geser horizontal untuk meninjau seluruh {totalDaysInMonth} hari
          </span>
        </div>

        <div ref={matrixContainerRef} className="overflow-x-auto max-w-full mobile-smooth-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/95 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <th className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 w-[200px] min-w-[200px] max-w-[220px] sticky left-0 bg-slate-100 dark:bg-slate-800 z-30 border-r-2 border-slate-300 dark:border-slate-700 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.08)]">
                  Perawat ({filteredNurses.length})
                </th>
                {visibleDays.map((day) => (
                  <th
                    key={day.dayNumber}
                    data-active-today={day.isToday ? 'true' : 'false'}
                    onClick={() => selectDate(day.dateString)}
                    className={`py-2 px-1 text-center cursor-pointer min-w-[38px] max-w-[44px] font-semibold transition-all relative ${
                      day.isToday
                        ? 'bg-gradient-to-b from-sky-600 to-blue-700 text-white font-extrabold shadow-md border-x-2 border-sky-400 z-20 ring-2 ring-sky-400/80 ring-inset'
                        : day.isSunday
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold border-r border-slate-200 dark:border-slate-800'
                        : day.isWeekend
                        ? 'bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-r border-slate-200 dark:border-slate-800'
                        : 'text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 hover:bg-sky-100/50 dark:hover:bg-slate-750'
                    }`}
                    title={`Klik untuk buka tanggal ${day.dateString}${day.isToday ? ' (Hari Aktif Real Time)' : ''}`}
                  >
                    {day.isToday && (
                      <div className="flex items-center justify-center mb-0.5">
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-wider animate-pulse shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> KINI
                        </span>
                      </div>
                    )}
                    <div className={`text-[10px] uppercase ${day.isToday ? 'font-black text-amber-200' : 'font-normal'}`}>{day.dayName}</div>
                    <div className={`text-xs ${day.isToday ? 'font-black text-white text-sm scale-110 drop-shadow' : ''}`}>{day.dayNumber}</div>
                  </th>
                ))}
                <th className="py-2.5 px-2 font-semibold text-slate-700 dark:text-slate-200 text-center min-w-[45px] bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
                  P
                </th>
                <th className="py-2.5 px-2 font-semibold text-slate-700 dark:text-slate-200 text-center min-w-[45px] bg-slate-100 dark:bg-slate-800">
                  S
                </th>
                <th className="py-2.5 px-2 font-semibold text-slate-700 dark:text-slate-200 text-center min-w-[45px] bg-slate-100 dark:bg-slate-800">
                  L
                </th>
                <th className="py-2.5 px-2 font-semibold text-slate-700 dark:text-slate-200 text-center min-w-[50px] bg-slate-100 dark:bg-slate-800">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNurses.map((nurse, index) => {
                let nurseP = 0;
                let nurseS = 0;
                let nurseL = 0;
                let nurseC = 0;
                let nurseSkt = 0;

                // Accurately compute full month stats in memory
                daysArray.forEach((d) => {
                  const shift = assignmentMap.get(`${d.dateString}_${nurse.id}`) || 'LIBUR';
                  if (shift === 'PAGI') nurseP++;
                  else if (shift === 'SIANG') nurseS++;
                  else if (shift === 'LIBUR') nurseL++;
                  else if (shift === 'CUTI') nurseC++;
                  else if (shift === 'SAKIT') nurseSkt++;
                });

                return (
                  <tr
                    key={nurse.id}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors optimize-render ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-850'
                    }`}
                  >
                    {/* Sticky Nurse Name Column - Fully opaque, clearly visible when scrolling horizontally */}
                    <td
                      className={`py-2 px-3 font-medium sticky left-0 z-20 w-[200px] min-w-[200px] max-w-[220px] border-r-2 border-slate-300 dark:border-slate-700 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.08)] transition-colors ${
                        index % 2 === 0
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                          : 'bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 min-w-0">
                        <div className="truncate min-w-0 flex-1">
                          <span className="font-bold text-slate-950 dark:text-white block truncate text-xs sm:text-[13px]">
                            {nurse.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {nurse.role === 'KARU' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/60">
                                Karu (Pagi)
                              </span>
                            ) : nurse.role === 'KATIM' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-300/60">
                                PJ Sif (Katim)
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                                Pelaksana
                              </span>
                            )}
                            {nurse.skillLevel && (
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                                • {nurse.skillLevel}
                              </span>
                            )}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDutyNurseId(nurse.id);
                                  setIsSpecialDutyModalOpen(true);
                                }}
                                className="text-[9px] text-blue-700 dark:text-blue-300 hover:underline font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 ml-auto"
                                title="Input tugas khusus per tanggal untuk perawat ini"
                              >
                                + PIC Tgl
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Day Cells (Only renders visibleDays - super lightweight on mobile) */}
                    {visibleDays.map((day) => {
                      const key = `${day.dateString}_${nurse.id}`;
                      const shift = assignmentMap.get(key) || 'LIBUR';

                      const shiftInfo = SHIFT_TYPE_INFO[shift];
                      const fullAsg = assignmentDetailMap.get(key);
                      const isWorkShift = shift === 'PAGI' || shift === 'SIANG';
                      
                      // Get assigned special duties:
                      const inputtedDuty = fullAsg?.specialDuty;
                      const masterDutyFallback = isWorkShift ? nurse.specialDuty : null;
                      // Ambil tugas khusus: prioritaskan tugas khusus yang di-input pada tanggal tersebut, fallback ke tugas khusus master perawat
                      const rawDuty =
                        inputtedDuty !== undefined && inputtedDuty !== null && inputtedDuty.trim() !== ''
                          ? inputtedDuty
                          : masterDutyFallback;
                      const dutiesToRender = rawDuty ? parseSpecialDuties(rawDuty) : [];

                      const hasMachines = Boolean(fullAsg?.assignedMachineIds && fullAsg.assignedMachineIds.length > 0);

                      let cellBg = 'hover:bg-slate-100 dark:hover:bg-slate-800';
                      let cellText = 'text-slate-400';

                      if (shift === 'PAGI') {
                        cellBg = 'bg-sky-500 text-white font-bold hover:bg-sky-600';
                        cellText = 'text-white';
                      } else if (shift === 'SIANG') {
                        cellBg = 'bg-amber-500 text-white font-bold hover:bg-amber-600';
                        cellText = 'text-white';
                      } else if (shift === 'LIBUR') {
                        cellBg = day.isSunday ? 'bg-rose-50/60 text-slate-500' : 'text-slate-400';
                        cellText = 'text-slate-400';
                      } else if (shift === 'CUTI') {
                        cellBg = 'bg-teal-500 text-white font-bold hover:bg-teal-600';
                        cellText = 'text-white';
                      } else if (shift === 'SAKIT') {
                        cellBg = 'bg-rose-500 text-white font-bold hover:bg-rose-600';
                        cellText = 'text-white';
                      }

                      return (
                        <td
                          key={day.dayNumber}
                          onClick={() => handleCellClick(day.dateString, nurse.id)}
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleOpenEditModal(day.dateString, nurse);
                          }}
                          className={`py-1.5 px-0.5 text-center select-none transition-all relative group ${
                            isAdmin ? 'cursor-pointer hover:bg-sky-100/60 dark:hover:bg-sky-900/40 active:scale-95' : 'cursor-default'
                          } ${
                            day.isToday
                              ? 'border-x-2 border-sky-400 dark:border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-inner'
                              : day.isSunday
                              ? 'bg-rose-50/20 dark:bg-rose-950/20 border-r border-slate-100/60 dark:border-slate-800/60'
                              : 'border-r border-slate-100/60 dark:border-slate-800/60'
                          }`}
                          title={`${nurse.name} | ${day.dateString}${day.isToday ? ' [HARI AKTIF REAL TIME]' : ''}: ${shiftInfo?.label}${
                            dutiesToRender.length > 0 ? ` | Tugas: ${dutiesToRender.join(', ')}` : ''
                          }${hasMachines ? ` | Mesin: ${fullAsg?.assignedMachineIds.join(', ')}` : ''}${
                            isAdmin ? ' (Klik: P -> S -> L -> C -> SKT)' : ' (Mode Hanya Lihat)'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 mx-auto relative flex items-center justify-center rounded-lg text-xs transition-transform active:scale-90 ${cellBg} ${cellText} ${
                              day.isToday
                                ? 'ring-2 ring-sky-500 dark:ring-sky-300 ring-offset-1 dark:ring-offset-slate-900 font-black shadow-xs'
                                : ''
                            }`}
                          >
                            {shiftInfo?.code}

                            {/* Indicator for Special Duty with Distinct Colors */}
                            {dutiesToRender.length === 1 && (
                              <span
                                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                                  getSpecialDutyDotStyle(dutiesToRender[0]).ringClass
                                } ${getSpecialDutyDotStyle(dutiesToRender[0]).bgClass}`}
                                title={`Tugas Khusus: ${dutiesToRender[0]}`}
                              />
                            )}
                            {dutiesToRender.length > 1 && (
                              <div
                                className="absolute -top-1.5 -right-1.5 flex items-center -space-x-1 z-10 pointer-events-none"
                                title={`Tugas Khusus: ${dutiesToRender.join(', ')}`}
                              >
                                {dutiesToRender.slice(0, 3).map((d, idx) => {
                                  const style = getSpecialDutyDotStyle(d);
                                  return (
                                    <span
                                      key={idx}
                                      className={`w-2.5 h-2.5 rounded-full ${style.ringClass} ${style.bgClass}`}
                                      title={`Tugas: ${d}`}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Nurse Row Totals */}
                    <td className="py-2 px-1 text-center font-bold text-sky-700 dark:text-sky-400 bg-slate-50/80 dark:bg-slate-800/60 border-l border-slate-200 dark:border-slate-700">
                      {nurseP}
                    </td>
                    <td className="py-2 px-1 text-center font-bold text-amber-700 dark:text-amber-400 bg-slate-50/80 dark:bg-slate-800/60">
                      {nurseS}
                    </td>
                    <td className="py-2 px-1 text-center font-medium text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/60">
                      {nurseL}
                    </td>
                    <td className="py-2 px-1 text-center font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800">
                      <div className="flex flex-col items-center">
                        <span>{nurseP + nurseS}</span>
                        {nurse.role !== 'KARU' && nurseP > 0 && nurseS > 0 && Math.abs(nurseP - nurseS) <= 1 && (
                          <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1 rounded-sm">
                            50:50
                          </span>
                        )}
                        {nurse.role === 'KARU' && nurseP > 0 && (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                            Pagi
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Bottom Summary Rows for Daily Shift & Role Distribution */}
            <tfoot>
              {/* Row 1: Sif Pagi Count */}
              <tr className="bg-sky-50/70 dark:bg-sky-950/30 text-slate-700 dark:text-slate-300 border-t-2 border-slate-300 dark:border-slate-700 text-[11px]">
                <td className="py-1.5 px-3 sticky left-0 bg-sky-50 dark:bg-slate-850 z-20 w-[200px] min-w-[200px] max-w-[220px] border-r-2 border-slate-300 dark:border-slate-700 text-sky-900 dark:text-sky-200 font-bold shadow-[4px_0_10px_-2px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between">
                    <span>Sif Pagi (P)</span>
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                  </div>
                </td>
                {visibleDays.map((day) => {
                  let pCount = 0;
                  nurses.forEach((nurse) => {
                    const shift = assignmentMap.get(`${day.dateString}_${nurse.id}`);
                    if (shift === 'PAGI') pCount++;
                  });
                  return (
                    <td
                      key={day.dayNumber}
                      className="py-1 px-0.5 text-center font-bold text-sky-700 dark:text-sky-300 border-r border-slate-200 dark:border-slate-700"
                    >
                      {pCount > 0 ? pCount : '-'}
                    </td>
                  );
                })}
                <td colSpan={4} className="bg-sky-50 dark:bg-slate-850 border-l border-slate-200 dark:border-slate-700" />
              </tr>

              {/* Row 2: Sif Siang Count */}
              <tr className="bg-amber-50/70 dark:bg-amber-950/30 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                <td className="py-1.5 px-3 sticky left-0 bg-amber-50 dark:bg-slate-850 z-20 w-[200px] min-w-[200px] max-w-[220px] border-r-2 border-slate-300 dark:border-slate-700 text-amber-900 dark:text-amber-200 font-bold shadow-[4px_0_10px_-2px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between">
                    <span>Sif Siang (S)</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                </td>
                {visibleDays.map((day) => {
                  let sCount = 0;
                  nurses.forEach((nurse) => {
                    const shift = assignmentMap.get(`${day.dateString}_${nurse.id}`);
                    if (shift === 'SIANG') sCount++;
                  });
                  return (
                    <td
                      key={day.dayNumber}
                      className="py-1 px-0.5 text-center font-bold text-amber-700 dark:text-amber-300 border-r border-slate-200 dark:border-slate-700"
                    >
                      {sCount > 0 ? sCount : '-'}
                    </td>
                  );
                })}
                <td colSpan={4} className="bg-amber-50 dark:bg-slate-850 border-l border-slate-200 dark:border-slate-700" />
              </tr>

              {/* Row 3: PJ Sif / Katim Presence in Pagi vs Siang */}
              <tr className="bg-indigo-50/50 dark:bg-indigo-950/20 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 text-[10px]">
                <td className="py-1.5 px-3 sticky left-0 bg-indigo-50/80 dark:bg-slate-850 z-20 w-[200px] min-w-[200px] max-w-[220px] border-r-2 border-slate-300 dark:border-slate-700 text-indigo-900 dark:text-indigo-200 font-bold shadow-[4px_0_10px_-2px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between">
                    <span>Katim (P / S)</span>
                    <span className="text-[9px] px-1 bg-indigo-100 dark:bg-indigo-900 rounded font-semibold text-indigo-700 dark:text-indigo-300">PJ Sif</span>
                  </div>
                </td>
                {visibleDays.map((day) => {
                  let katimP = 0;
                  let katimS = 0;
                  nurses.forEach((nurse) => {
                    if (nurse.role === 'KATIM') {
                      const shift = assignmentMap.get(`${day.dateString}_${nurse.id}`);
                      if (shift === 'PAGI') katimP++;
                      else if (shift === 'SIANG') katimS++;
                    }
                  });
                  return (
                    <td
                      key={day.dayNumber}
                      className="py-1 px-0.5 text-center font-bold text-indigo-700 dark:text-indigo-300 border-r border-slate-200 dark:border-slate-700"
                      title={`Katim Pagi: ${katimP}, Katim Siang: ${katimS}`}
                    >
                      {katimP > 0 || katimS > 0 ? `${katimP}/${katimS}` : '-'}
                    </td>
                  );
                })}
                <td colSpan={4} className="bg-indigo-50/50 dark:bg-slate-850 border-l border-slate-200 dark:border-slate-700" />
              </tr>

              {/* Row 4: Total Dinas (P+S) */}
              <tr className="bg-slate-100/95 dark:bg-slate-800/95 font-semibold text-slate-700 dark:text-slate-200 border-t-2 border-slate-300 dark:border-slate-700">
                <td className="py-2 px-3 sticky left-0 bg-slate-100 dark:bg-slate-800 z-20 w-[200px] min-w-[200px] max-w-[220px] border-r-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.08)] font-bold">
                  Total Dinas (P+S)
                </td>
                {visibleDays.map((day) => {
                  let dailyWorkCount = 0;
                  nurses.forEach((nurse) => {
                    const shift = assignmentMap.get(`${day.dateString}_${nurse.id}`);
                    if (shift === 'PAGI' || shift === 'SIANG') dailyWorkCount++;
                  });

                  const isUnderstaffed = dailyWorkCount < 8 && !day.isSunday;

                  return (
                    <td
                      key={day.dayNumber}
                      className={`py-2 px-0.5 text-center text-xs transition-colors ${
                        day.isToday
                          ? 'border-x-2 border-b-2 border-sky-500 dark:border-sky-400 bg-sky-100 dark:bg-sky-900/70 text-sky-950 dark:text-sky-100 font-black'
                          : isUnderstaffed
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold border-r border-slate-200 dark:border-slate-700'
                          : 'text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-700'
                      }`}
                      title={`Total ${dailyWorkCount} perawat berdinas${day.isToday ? ' (Hari Aktif Real Time)' : ''}`}
                    >
                      {dailyWorkCount}
                    </td>
                  );
                })}
                <td colSpan={4} className="bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Legend & Quick Guidelines */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        {/* Row 1: Sif & Status */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-800 dark:text-slate-100">Kode Sif:</span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-md bg-sky-500 text-white font-bold flex items-center justify-center text-[10px]">
                P
              </span>
              Sif Pagi (07.00-14.00)
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                S
              </span>
              Sif Siang (12.00-19.00)
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-md bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                L
              </span>
              Libur / Off
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-md bg-teal-500 text-white font-bold flex items-center justify-center text-[10px]">
                C
              </span>
              Cuti Tahunan
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-md bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">
                Skt
              </span>
              Sakit / Izin
            </span>
            <span className="inline-flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-300 animate-pulse" />
              <span>Kolom Garis Biru = Hari Ini (Real Time)</span>
            </span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Standar HD: Rasio 1 Perawat : 2-3 Mesin Aktif
          </div>
        </div>

        {/* Row 2: Dot Warna Tugas Khusus (Diferensiasi Visual) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
            Warna Dot Tugas Khusus:
          </span>
          {SPECIAL_DUTY_DOT_LEGENDS.map((legend) => (
            <span
              key={legend.name}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-semibold ${legend.borderClass} ${legend.textClass} bg-white dark:bg-slate-800/80 shadow-2xs`}
              title={`${legend.label} ditandai dengan dot bulat ${legend.colorName}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${legend.dotBg} ring-1 ring-white dark:ring-slate-900 shadow-2xs`} />
              <span>
                {legend.label} <span className="font-normal opacity-75">({legend.colorName})</span>
              </span>
            </span>
          ))}
        </div>
      </div>
      </>
      )}

      {editingAssignment && (
        <EditAssignmentModal
          assignment={editingAssignment}
          machines={machines}
          onClose={() => setEditingAssignment(null)}
          onSave={(assignment, newShiftType, newMachines, isLeader, notes, specialDuty) => {
            updateAssignment(assignment, newShiftType, newMachines, isLeader, notes, specialDuty);
            setEditingAssignment(null);
          }}
        />
      )}

      {isReallocateModalOpen && (
        <RegenerateMachineAllocationModal
          isOpen={isReallocateModalOpen}
          onClose={() => setIsReallocateModalOpen(false)}
          defaultScope="MONTHLY"
        />
      )}

      {isImportModalOpen && (
        <ImportScheduleModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          defaultMonth={currentMonth}
        />
      )}

      {isSpecialDutyModalOpen && (
        <SpecialDutyModal
          isOpen={isSpecialDutyModalOpen}
          onClose={() => {
            setIsSpecialDutyModalOpen(false);
            setSelectedDutyNurseId(undefined);
          }}
          initialNurseId={selectedDutyNurseId}
        />
      )}

      {/* Confirmation Modal for Resetting Monthly Schedule */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-center text-slate-900 dark:text-white">
              Reset Jadwal Bulan {monthLabel}?
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 text-center mt-2 leading-relaxed">
              Tindakan ini akan <b>menghapus seluruh jadwal dinas</b> (Pagi, Siang, Libur, Cuti, Sakit) dan alokasi mesin pada bulan <b>{monthLabel}</b>.
            </p>

            <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <b>Data Staff Aman:</b> Seluruh data nama staf, nomor WhatsApp, jabatan, dan daftar mesin HD <b>TIDAK akan dihapus</b> dan tetap utuh tersimpan di sistem.
              </span>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetSchedule}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-soft-sm transition-all active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {isResetting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Mereset...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Ya, Reset Jadwal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Apps Script Guide Modal */}
      <GoogleScriptGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
};
