import React, { useState, useMemo } from 'react';
import { useHemo } from '../context/HemoContext';
import { ShiftAssignment, ShiftType, SHIFT_TYPE_INFO, NURSE_ROLE_INFO } from '../types';
import { EditAssignmentModal } from '../components/EditAssignmentModal';
import { HeadNurseReportModal } from '../components/HeadNurseReportModal';
import { RegenerateMachineAllocationModal } from '../components/RegenerateMachineAllocationModal';
import { WhatsAppDispatchModal } from '../components/WhatsAppDispatchModal';
import { WhatsAppBroadcastModal } from '../components/WhatsAppBroadcastModal';
import { SpecialDutyBadge } from '../components/SpecialDutyBadge';
import { ReadOnlyBanner } from '../components/ReadOnlyBanner';
import { DailyDoctorDutyCard } from '../components/DailyDoctorDutyCard';
import { WhatsAppDispatcher } from '../domain/WhatsAppDispatcher';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Sparkles,
  Send,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Cpu,
  Phone,
  Shield,
  MessageSquare,
  Copy,
  Clock,
  Filter,
  Download,
} from 'lucide-react';

export const DailyDispatchScreen: React.FC = () => {
  const {
    isAdmin,
    selectedDate,
    selectDate,
    dailyAssignments,
    nurses,
    machines,
    settings,
    dispatchWhatsAppToNurse,
    dispatchGroupBroadcast,
    generateDailyMachineAllocation,
    updateAssignment,
    isGenerating,
    isSyncing,
    fetchDataFromCloud,
    showToast,
  } = useHemo();

  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'PAGI' | 'SIANG' | 'OFF'>('ALL');
  const [reallocateShiftTarget, setReallocateShiftTarget] = useState<'ALL' | 'PAGI' | 'SIANG'>('ALL');
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);
  const [dispatchingAssignment, setDispatchingAssignment] = useState<ShiftAssignment | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isHeadNurseModalOpen, setIsHeadNurseModalOpen] = useState(false);
  const [isReallocateModalOpen, setIsReallocateModalOpen] = useState(false);

  // Parse current date
  const dateObj = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    } catch {
      // fallback
    }
    return new Date();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const prev = new Date(dateObj);
    prev.setDate(prev.getDate() - 1);
    const dStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(
      prev.getDate()
    ).padStart(2, '0')}`;
    selectDate(dStr);
  };

  const handleNextDay = () => {
    const next = new Date(dateObj);
    next.setDate(next.getDate() + 1);
    const dStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(
      next.getDate()
    ).padStart(2, '0')}`;
    selectDate(dStr);
  };

  const handleToday = () => {
    const today = new Date();
    const dStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    selectDate(dStr);
  };

  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(
      tomorrow.getDate()
    ).padStart(2, '0')}`;
    selectDate(dStr);
  };

  // Group metrics sorted by machine allocation order
  const pagiList = useMemo(
    () => WhatsAppDispatcher.sortAssignmentsByMachineOrder(dailyAssignments.filter((a) => a.shiftType === 'PAGI'), machines),
    [dailyAssignments, machines]
  );
  const siangList = useMemo(
    () => WhatsAppDispatcher.sortAssignmentsByMachineOrder(dailyAssignments.filter((a) => a.shiftType === 'SIANG'), machines),
    [dailyAssignments, machines]
  );
  const offList = useMemo(
    () => dailyAssignments.filter((a) => a.shiftType === 'LIBUR' || a.shiftType === 'CUTI' || a.shiftType === 'SAKIT'),
    [dailyAssignments]
  );

  const filteredAssignments = useMemo(() => {
    if (shiftFilter === 'PAGI') return pagiList;
    if (shiftFilter === 'SIANG') return siangList;
    if (shiftFilter === 'OFF') return offList;
    return [...pagiList, ...siangList, ...offList];
  }, [shiftFilter, pagiList, siangList, offList]);

  const activeMachinesCount = useMemo(
    () =>
      machines.filter(
        (m) =>
          (m.status || 'AKTIF').toUpperCase() === 'AKTIF' &&
          m.status !== 'MAINTENANCE' &&
          m.status !== 'RUSAK' &&
          m.status !== 'TIDAK_DIGUNAKAN'
      ).length,
    [machines]
  );

  return (
    <div className="pb-24 space-y-4">
      <ReadOnlyBanner actionDescription="merubah alokasi mesin atau jadwal sif harian" />

      {/* Top Date Navigator & Quick Actions - Minimalist Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xs border border-slate-200/80 dark:border-slate-800 transition-all space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Date Selector & Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => selectDate(e.target.value)}
                  className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm border-none focus:outline-hidden bg-transparent cursor-pointer"
                />
              </div>

              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToday}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Hari Ini
              </button>
              <button
                onClick={handleTomorrow}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Besok
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {WhatsAppDispatcher.formatIndonesianDate(selectedDate)}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap self-end lg:self-auto text-xs">
            {isAdmin && (
              <button
                onClick={() => {
                  const target = shiftFilter === 'PAGI' ? 'PAGI' : shiftFilter === 'SIANG' ? 'SIANG' : 'ALL';
                  setReallocateShiftTarget(target);
                  setIsReallocateModalOpen(true);
                }}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50"
                title="Generate Ulang Alokasi Mesin Adil"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {isGenerating
                    ? 'Mengalokasikan...'
                    : shiftFilter === 'PAGI'
                    ? 'Alokasi Pagi'
                    : shiftFilter === 'SIANG'
                    ? 'Alokasi Siang'
                    : 'Alokasi Mesin'}
                </span>
              </button>
            )}

            <button
              onClick={() => fetchDataFromCloud()}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-semibold transition-all"
              title="Tarik data jadwal dari Cloud Firestore"
            >
              <Download className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Menarik...' : 'Tarik Cloud'}</span>
            </button>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 font-semibold transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Broadcast WA</span>
            </button>

            <button
              onClick={() => setIsHeadNurseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 font-semibold transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Laporan Karu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shift Segmented Tabs - Minimalist & Low Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setShiftFilter('ALL')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              shiftFilter === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5 opacity-70" />
            <span>Semua Staf</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              shiftFilter === 'ALL' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {nurses.length}
            </span>
          </button>

          <button
            onClick={() => setShiftFilter('PAGI')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              shiftFilter === 'PAGI'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Sif Pagi (07-14)</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              shiftFilter === 'PAGI' ? 'bg-sky-700/90 text-white' : 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
            }`}>
              {pagiList.length}
            </span>
          </button>

          <button
            onClick={() => setShiftFilter('SIANG')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              shiftFilter === 'SIANG'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-amber-300" />
            <span>Sif Siang (12-19)</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              shiftFilter === 'SIANG' ? 'bg-amber-700/90 text-white' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}>
              {siangList.length}
            </span>
          </button>

          <button
            onClick={() => setShiftFilter('OFF')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              shiftFilter === 'OFF'
                ? 'bg-slate-700 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Libur / Cuti</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              shiftFilter === 'OFF' ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {offList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Dokter Jaga Ruangan HD Hari Ini */}
      <DailyDoctorDutyCard />

      {/* Daily Nurse Assignment Cards Grid */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mx-auto text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/80 shadow-2xs">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Belum Ada Jadwal Pada Tanggal Ini
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {isAdmin
                  ? 'Silakan klik tombol "Alokasi Mesin Adil" atau buka tab "Jadwal Bulanan" untuk menyusun jadwal perawat secara otomatis.'
                  : 'Jadwal dinas untuk tanggal ini belum diterbitkan oleh Kepala Ruangan (Karu).'}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => generateDailyMachineAllocation(selectedDate)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-2xl text-xs font-extrabold shadow-soft-md transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                Generate Jadwal Tanggal Ini
              </button>
            )}
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const shiftInfo = SHIFT_TYPE_INFO[assignment.shiftType];
            const nurse = nurses.find((n) => n.id === assignment.nurseId);
            const roleInfo = nurse ? NURSE_ROLE_INFO[nurse.role] : NURSE_ROLE_INFO.PELAKSANA;
            const isWork = shiftInfo.isWorkShift;
            const assignedMachines = WhatsAppDispatcher.getAssignedMachinesForAssignment(assignment, machines);

            return (
              <div
                key={assignment.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border transition-all duration-150 shadow-2xs ${
                  isWork
                    ? 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Icon, Nama Perawat, Peran/Jabatan, Tugas Khusus */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Ikon */}
                    <div
                      className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        nurse?.role === 'KARU'
                          ? 'bg-amber-500 text-white'
                          : assignment.isLeader
                          ? 'bg-indigo-600 text-white'
                          : assignment.shiftType === 'PAGI'
                          ? 'bg-sky-600 text-white'
                          : assignment.shiftType === 'SIANG'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {assignment.nurseName.charAt(0)}
                    </div>

                    {/* Nama Perawat, Peran/Jabatan, Tugas Khusus */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                        {assignment.nurseName}
                      </h4>
                      {assignment.isLeader && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 rounded-md whitespace-nowrap">
                          👑 PJ SIF
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap ${roleInfo.badgeClass}`}>
                        {roleInfo.title}
                      </span>
                      {assignment.specialDuty && (
                        <SpecialDutyBadge
                          duty={assignment.specialDuty}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>

                  {/* Right: Sif & Kirim WA */}
                  <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                    {/* Sif */}
                    <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${shiftInfo.bgClass} ${shiftInfo.textClass}`}>
                      <span className={`w-4 h-4 rounded-md flex items-center justify-center font-bold text-[9px] ${shiftInfo.badgeClass}`}>
                        {shiftInfo.code}
                      </span>
                      <span>{shiftInfo.label}</span>
                    </div>

                    {/* Kirim WA */}
                    <button
                      onClick={() => setDispatchingAssignment(assignment)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                      title="Kirim notifikasi tugas via WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim WA</span>
                    </button>
                  </div>
                </div>

                {/* Alokasi Mesin */}
                {isWork && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
                        <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        Alokasi Mesin:
                      </span>

                      {assignedMachines.length === 0 ? (
                        <span className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Belum ada mesin
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {assignedMachines.map((m) => {
                            if (!m) return null;
                            const isSpecial = m.category !== 'REGULER';
                            return (
                              <span
                                key={m.id}
                                className={`px-2 py-0.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                                  m.category === 'ISOLASI'
                                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/80'
                                    : m.category === 'HEPATITIS_B'
                                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800/80'
                                    : m.category === 'HEPATITIS_C'
                                    ? 'bg-pink-50 dark:bg-pink-950/50 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-800/80'
                                    : 'bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/70'
                                }`}
                              >
                                <b className="font-mono font-bold text-sky-700 dark:text-sky-300">{m.code}</b>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  ({m.bay.split(' ')[0]})
                                </span>
                                {isSpecial && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title={m.category} />
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {dispatchingAssignment && (
        <WhatsAppDispatchModal
          isOpen={!!dispatchingAssignment}
          assignment={dispatchingAssignment}
          onClose={() => setDispatchingAssignment(null)}
        />
      )}

      {isBroadcastModalOpen && (
        <WhatsAppBroadcastModal
          isOpen={isBroadcastModalOpen}
          initialShiftFilter={shiftFilter === 'PAGI' ? 'PAGI' : shiftFilter === 'SIANG' ? 'SIANG' : null}
          onClose={() => setIsBroadcastModalOpen(false)}
        />
      )}

      {editingAssignment && (
        <EditAssignmentModal
          assignment={editingAssignment}
          machines={machines}
          onClose={() => setEditingAssignment(null)}
          onSave={updateAssignment}
          showSpecialDuty={true}
        />
      )}

      {isHeadNurseModalOpen && (
        <HeadNurseReportModal onClose={() => setIsHeadNurseModalOpen(false)} />
      )}

      {isReallocateModalOpen && (
        <RegenerateMachineAllocationModal
          isOpen={isReallocateModalOpen}
          onClose={() => setIsReallocateModalOpen(false)}
          defaultScope="DAILY"
          defaultShift={reallocateShiftTarget}
        />
      )}
    </div>
  );
};
