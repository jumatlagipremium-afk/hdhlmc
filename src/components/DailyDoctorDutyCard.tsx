import React, { useState } from 'react';
import { useHemo } from '../context/HemoContext';
import { Doctor } from '../types';
import { DoctorModal } from './DoctorModal';
import {
  Stethoscope,
  Phone,
  MessageSquare,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Edit3,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DailyDoctorDutyCard: React.FC = () => {
  const {
    isAdmin,
    selectedDate,
    doctors,
    doctorDuties,
    setDoctorDuty,
    dispatchDoctorWhatsApp,
    addDoctor,
    showToast,
  } = useHemo();

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeDoctors = doctors.filter((d) => d.isActive !== false);
  const duty = doctorDuties[selectedDate];

  const pagiDoctor = activeDoctors.find((d) => d.id === duty?.pagiDoctorId) ||
    (duty?.pagiDoctorName ? { name: duty.pagiDoctorName, id: -1, role: 'DOKTER_RUANGAN' as const, phone: '' } : undefined);

  const siangDoctor = activeDoctors.find((d) => d.id === duty?.siangDoctorId) ||
    (duty?.siangDoctorName ? { name: duty.siangDoctorName, id: -1, role: 'DOKTER_RUANGAN' as const, phone: '' } : undefined);

  const handlePagiSelect = (val: string) => {
    if (!isAdmin) {
      showToast('Akses Dibatasi: Masuk sebagai Karu / Admin untuk merubah dokter jaga.', 'info');
      return;
    }
    if (val === '') {
      setDoctorDuty(selectedDate, null, undefined);
    } else {
      setDoctorDuty(selectedDate, Number(val), undefined);
    }
  };

  const handleSiangSelect = (val: string) => {
    if (!isAdmin) {
      showToast('Akses Dibatasi: Masuk sebagai Karu / Admin untuk merubah dokter jaga.', 'info');
      return;
    }
    if (val === '') {
      setDoctorDuty(selectedDate, undefined, null);
    } else {
      setDoctorDuty(selectedDate, undefined, Number(val));
    }
  };

  const handleNotesBlur = (notesText: string) => {
    if (!isAdmin) return;
    setDoctorDuty(selectedDate, undefined, undefined, notesText.trim());
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-all">
        {/* Header - Compact Single Line with Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/80 dark:border-teal-800/80 shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                Dokter Jaga:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200/70 dark:border-sky-800/60">
                <span className="font-bold text-sky-600 dark:text-sky-400">Pagi:</span> {pagiDoctor?.name || 'Belum dipilih'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200/70 dark:border-indigo-800/60">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Siang:</span> {siangDoctor?.name || 'Belum dipilih'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingDoctor(null);
                  setIsDoctorModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden md:inline">Tambah Dokter</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
            >
              <span>{isExpanded ? 'Tutup' : 'Atur Dokter'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 2 Shift Columns: Pagi & Siang - Collapsed by default */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
          {/* SIF PAGI */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-sky-50/40 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-bold text-xs">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Dokter Jaga Sif Pagi</span>
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                07.00 - 14.00
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={duty?.pagiDoctorId || (duty?.pagiDoctorName ? -1 : '')}
                onChange={(e) => handlePagiSelect(e.target.value)}
                disabled={!isAdmin}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden disabled:bg-slate-50"
              >
                <option value="">-- Pilih Dokter Jaga Pagi --</option>
                {activeDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.role === 'DPJP' ? 'DPJP Konsultan' : 'Dokter Ruangan'})
                  </option>
                ))}
                {duty?.pagiDoctorName && !duty.pagiDoctorId && (
                  <option value="-1">{duty.pagiDoctorName} (Manual)</option>
                )}
              </select>

              {pagiDoctor && pagiDoctor.id > 0 && pagiDoctor.phone && (
                <button
                  type="button"
                  onClick={() => dispatchDoctorWhatsApp(pagiDoctor as Doctor, 'PAGI', selectedDate)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
                  title={`Kirim pemberitahuan jadwal ke ${pagiDoctor.name}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kirim WA</span>
                </button>
              )}
            </div>

            {pagiDoctor && pagiDoctor.id > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
                <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold">
                  {pagiDoctor.role === 'DPJP' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      DPJP Utama / Konsultan
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      Dokter Ruangan Bersertifikat Dialisis
                    </>
                  )}
                </span>
                {pagiDoctor.phone && (
                  <span className="text-slate-400">• {pagiDoctor.phone}</span>
                )}
              </div>
            )}
          </div>

          {/* SIF SIANG */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dokter Jaga Sif Siang</span>
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                12.00 - 19.00
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={duty?.siangDoctorId || (duty?.siangDoctorName ? -1 : '')}
                onChange={(e) => handleSiangSelect(e.target.value)}
                disabled={!isAdmin}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-50"
              >
                <option value="">-- Pilih Dokter Jaga Siang --</option>
                {activeDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.role === 'DPJP' ? 'DPJP Konsultan' : 'Dokter Ruangan'})
                  </option>
                ))}
                {duty?.siangDoctorName && !duty.siangDoctorId && (
                  <option value="-1">{duty.siangDoctorName} (Manual)</option>
                )}
              </select>

              {siangDoctor && siangDoctor.id > 0 && siangDoctor.phone && (
                <button
                  type="button"
                  onClick={() => dispatchDoctorWhatsApp(siangDoctor as Doctor, 'SIANG', selectedDate)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
                  title={`Kirim pemberitahuan jadwal ke ${siangDoctor.name}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kirim WA</span>
                </button>
              )}
            </div>

            {siangDoctor && siangDoctor.id > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
                <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold">
                  {siangDoctor.role === 'DPJP' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      DPJP Utama / Konsultan
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      Dokter Ruangan Bersertifikat Dialisis
                    </>
                  )}
                </span>
                {siangDoctor.phone && (
                  <span className="text-slate-400">• {siangDoctor.phone}</span>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Notes Toggle / Input */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {duty?.notes || showNotesInput ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Catatan:</span>
                <input
                  type="text"
                  defaultValue={duty?.notes || ''}
                  onBlur={(e) => handleNotesBlur(e.target.value)}
                  disabled={!isAdmin}
                  placeholder="misal: On-call jam 10.00 / Visite rawat bersama"
                  className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNotesInput(true)}
                className="text-[11px] text-slate-500 hover:text-teal-600 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>+ Tambah Catatan Dokter Jaga Hari Ini</span>
              </button>
            )}
          </div>
        )}
      </div>

      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onSave={(newDoc) => {
          addDoctor(newDoc);
          setIsDoctorModalOpen(false);
        }}
        doctor={editingDoctor}
      />
    </>
  );
};
