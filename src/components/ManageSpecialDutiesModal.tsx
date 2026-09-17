import React, { useState } from 'react';
import { useHemo } from '../context/HemoContext';
import { useAuth } from '../context/AuthContext';
import { SpecialDutyOption, DUTY_COLOR_PRESETS, DutyColorPreset } from '../types';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Tag,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Palette,
} from 'lucide-react';

interface ManageSpecialDutiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageSpecialDutiesModal: React.FC<ManageSpecialDutiesModalProps> = ({ isOpen, onClose }) => {
  const {
    specialDutyOptions,
    addSpecialDutyOption,
    updateSpecialDutyOption,
    deleteSpecialDutyOption,
    resetSpecialDutyOptions,
    showToast,
  } = useHemo();
  const { canManageRoster } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [shortName, setShortName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<DutyColorPreset>(DUTY_COLOR_PRESETS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setLabel('');
    setCode('');
    setShortName('');
    setDescription('');
    setSelectedColor(DUTY_COLOR_PRESETS[Math.floor(Math.random() * DUTY_COLOR_PRESETS.length)] || DUTY_COLOR_PRESETS[0]);
  };

  const handleStartEdit = (opt: SpecialDutyOption) => {
    setIsEditing(true);
    setEditingId(opt.id);
    setLabel(opt.label);
    setCode(opt.code);
    setShortName(opt.shortName || opt.code);
    setDescription(opt.description || '');

    const foundPreset =
      DUTY_COLOR_PRESETS.find(
        (p) =>
          p.name.toLowerCase() === (opt.colorName || '').toLowerCase() ||
          p.dotColorHex.toLowerCase() === (opt.dotColorHex || '').toLowerCase() ||
          p.bgClass === opt.bgClass
      ) || DUTY_COLOR_PRESETS[0];

    setSelectedColor(foundPreset);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = label.trim();
    const cleanCode = (code.trim() || cleanLabel).toUpperCase();
    const cleanShort = (shortName.trim() || cleanCode).toUpperCase();

    if (!cleanLabel) {
      showToast('Nama tugas khusus wajib diisi', 'error');
      return;
    }
    if (!cleanCode) {
      showToast('Kode tugas khusus wajib diisi', 'error');
      return;
    }

    if (editingId) {
      // Update existing
      await updateSpecialDutyOption(editingId, {
        label: cleanLabel,
        code: cleanCode,
        shortName: cleanShort,
        description: description.trim(),
        colorName: selectedColor.name,
        dotColorHex: selectedColor.dotColorHex,
        bgClass: selectedColor.bgClass,
        badgeClass: selectedColor.badgeClass,
        textClass: selectedColor.textClass,
        borderClass: selectedColor.borderClass,
      });
    } else {
      // Add new
      await addSpecialDutyOption({
        label: cleanLabel,
        code: cleanCode,
        shortName: cleanShort,
        description: description.trim(),
        colorName: selectedColor.name,
        dotColorHex: selectedColor.dotColorHex,
        bgClass: selectedColor.bgClass,
        badgeClass: selectedColor.badgeClass,
        textClass: selectedColor.textClass,
        borderClass: selectedColor.borderClass,
        isCustom: true,
      });
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteSpecialDutyOption(id);
    setDeleteConfirmId(null);
  };

  const handleResetToDefaults = async () => {
    await resetSpecialDutyOptions();
    setIsEditing(false);
    setIsResetConfirming(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Kelola Pilihan Tugas Khusus
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {specialDutyOptions.length} Pilihan
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tambah, ubah nama/warna dot, atau hapus pilihan tugas khusus sistem
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Top Actions: Add & Reset */}
          {!isEditing && (
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                id="btn-add-special-duty"
                onClick={handleStartAdd}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tugas Khusus Baru</span>
              </button>

              {isResetConfirming ? (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/80 p-1.5 px-2.5 rounded-xl border border-amber-300 dark:border-amber-800">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                    Kembalikan 8 tugas standar?
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-all"
                  >
                    Ya, Pulihkan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirming(false)}
                    className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-all"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-reset-special-duty"
                  onClick={() => setIsResetConfirming(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-all cursor-pointer"
                  title="Pulihkan pilihan ke 8 tugas khusus bawaan awal"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pulihkan Standar Awal</span>
                </button>
              )}
            </div>
          )}

          {/* Form Add / Edit */}
          {isEditing && (
            <form
              onSubmit={handleSave}
              className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  {editingId ? 'Edit Pilihan Tugas Khusus' : 'Tambah Tugas Khusus Baru'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {editingId ? 'Memperbarui data opsi' : 'Menambahkan opsi baru ke sistem'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Lengkap Tugas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Contoh: Tugas Khusus Sterilisasi Alat"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Singkatan / Badge Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kode / Singkatan Badge <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={shortName}
                    onChange={(e) => {
                      setShortName(e.target.value.toUpperCase());
                      if (!code || code === shortName) setCode(e.target.value.toUpperCase());
                    }}
                    placeholder="Contoh: STERIL"
                    className="w-full px-3 py-2 text-xs uppercase font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deskripsi / Tanggung Jawab
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Pembersihan autoklaf, sterilisasi set punksi, pengecekan instrumen bedah minor"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pilihan Warna Dot & Badge */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Pilihan Warna Dot Indikator & Badge:</span>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    Terpilih: Dot {selectedColor.name}
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {DUTY_COLOR_PRESETS.map((preset) => {
                    const isSelected = selectedColor.name === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSelectedColor(preset)}
                        className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 ring-2 ring-blue-500 border-blue-500 shadow-xs font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 opacity-90'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full shrink-0 ${preset.bgClass} ring-1 ring-white dark:ring-slate-900 shadow-2xs`}
                        />
                        <span className="truncate text-[11px] text-slate-800 dark:text-slate-200">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Pratinjau Tampilan Dot & Badge:
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-500">Dot Sel:</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${selectedColor.bgClass} ring-2 ring-white dark:ring-slate-900 shadow-xs`}
                    />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold shadow-2xs ${selectedColor.badgeClass}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${selectedColor.bgClass} ring-1 ring-white/80`}
                    />
                    <span>{shortName || 'KODE'}</span>
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambahkan Tugas Khusus'}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Existing Special Duties */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
              <span>DAFTAR PILIHAN TUGAS KHUSUS AKTIF</span>
              <span>TOTAL: {specialDutyOptions.length}</span>
            </div>

            {specialDutyOptions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Belum ada pilihan tugas khusus.
                </p>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  Pulihkan 8 Tugas Khusus Standar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {specialDutyOptions.map((opt) => {
                  const isPendingDelete = deleteConfirmId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-200 dark:hover:border-blue-800/60 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left Details */}
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Dot indicator swatch */}
                        <div className="pt-0.5 shrink-0">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${opt.bgClass} ring-2 ring-white dark:ring-slate-900 shadow-xs`}
                            title={`Dot ${opt.colorName || 'Warna'}`}
                          />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                              {opt.label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                opt.badgeClass || 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${opt.bgClass}`} />
                              {opt.shortName || opt.code}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700">
                              Dot {opt.colorName || 'Kustom'}
                            </span>
                            {opt.isCustom && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                                Kustom
                              </span>
                            )}
                          </div>
                          {opt.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {isPendingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 p-1.5 rounded-xl border border-rose-200 dark:border-rose-800">
                            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 px-1">
                              Hapus?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDelete(opt.id)}
                              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-semibold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(opt)}
                              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all cursor-pointer"
                              title="Edit tugas khusus ini"
                            >
                              <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(opt.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-all cursor-pointer"
                              title="Hapus tugas khusus ini dari daftar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <HelpCircle className="w-4 h-4" />
            <span>Perubahan pilihan akan tersinkronisasi otomatis ke semua perangkat</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold hover:opacity-90 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
