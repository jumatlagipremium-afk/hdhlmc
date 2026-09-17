export type NurseRole = 'KARU' | 'KATIM' | 'PELAKSANA';

export type HeadNurseReportFormat = 'RINGKAS' | 'NAMA_PERAWAT';

export interface NurseRoleInfo {
  title: string;
  badgeClass: string;
}

export const NURSE_ROLE_INFO: Record<NurseRole, NurseRoleInfo> = {
  KARU: { title: 'Kepala Ruangan', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
  KATIM: { title: 'PJ Sif / Katim', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  PELAKSANA: { title: 'Perawat Pelaksana', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export interface Nurse {
  id: number;
  name: string;
  nip: string;
  phone: string; // e.g. "081234567801"
  role: NurseRole;
  isActive: boolean;
  defaultOffDay?: number | null; // 1 for Mon, 7 for Sun
  skillLevel: 'Senior' | 'Medium' | 'Junior';
  specialDuty?: string | null; // e.g. "BHP", "NATRIUM RO", "FARMASI & LOGISTIK", etc.
  isPermanent?: boolean; // Locked & permanently persisted
}

export interface SpecialDutyOption {
  id: string; // Unique identifier or code
  code: string; // Identifier used in assignments & profile
  label: string; // Full readable name (e.g. "Tugas Khusus BHP (Bahan Habis Pakai)")
  shortName: string; // Short badge label (e.g. "BHP")
  description: string;
  colorName: string; // 'Biru' | 'Merah' | 'Kuning' | 'Hijau' | 'Oranye' | 'Merah Tua' | 'Ungu' | 'Indigo' | 'Teal' | 'Sky' | 'Pink' | 'Lime'
  dotColorHex: string; // Hex code for indicator dot
  bgClass: string; // Tailwind background class for dot (e.g. "bg-blue-500")
  badgeClass?: string;
  textClass?: string;
  borderClass?: string;
  isCustom?: boolean;
}

export interface DutyColorPreset {
  name: string;
  dotColorHex: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  textClass: string;
}

export const DUTY_COLOR_PRESETS: DutyColorPreset[] = [
  {
    name: 'Biru',
    dotColorHex: '#3b82f6',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-300 dark:border-blue-700',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  {
    name: 'Merah',
    dotColorHex: '#f43f5e',
    bgClass: 'bg-rose-500',
    borderClass: 'border-rose-300 dark:border-rose-700',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
    textClass: 'text-rose-700 dark:text-rose-300',
  },
  {
    name: 'Kuning',
    dotColorHex: '#fbbf24',
    bgClass: 'bg-amber-400',
    borderClass: 'border-amber-300 dark:border-amber-700',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  {
    name: 'Hijau',
    dotColorHex: '#10b981',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    name: 'Oranye',
    dotColorHex: '#f97316',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-300 dark:border-orange-700',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800',
    textClass: 'text-orange-700 dark:text-orange-300',
  },
  {
    name: 'Merah Tua',
    dotColorHex: '#dc2626',
    bgClass: 'bg-red-600',
    borderClass: 'border-red-300 dark:border-red-700',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800',
    textClass: 'text-red-700 dark:text-red-300',
  },
  {
    name: 'Ungu',
    dotColorHex: '#9333ea',
    bgClass: 'bg-purple-600',
    borderClass: 'border-purple-300 dark:border-purple-700',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
    textClass: 'text-purple-700 dark:text-purple-300',
  },
  {
    name: 'Indigo',
    dotColorHex: '#6366f1',
    bgClass: 'bg-indigo-500',
    borderClass: 'border-indigo-300 dark:border-indigo-700',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
    textClass: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    name: 'Teal',
    dotColorHex: '#14b8a6',
    bgClass: 'bg-teal-500',
    borderClass: 'border-teal-300 dark:border-teal-700',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800',
    textClass: 'text-teal-700 dark:text-teal-300',
  },
  {
    name: 'Sky',
    dotColorHex: '#0284c7',
    bgClass: 'bg-sky-500',
    borderClass: 'border-sky-300 dark:border-sky-700',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800',
    textClass: 'text-sky-700 dark:text-sky-300',
  },
  {
    name: 'Pink',
    dotColorHex: '#ec4899',
    bgClass: 'bg-pink-500',
    borderClass: 'border-pink-300 dark:border-pink-700',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/70 dark:text-pink-300 dark:border-pink-800',
    textClass: 'text-pink-700 dark:text-pink-300',
  },
  {
    name: 'Lime',
    dotColorHex: '#84cc16',
    bgClass: 'bg-lime-500',
    borderClass: 'border-lime-300 dark:border-lime-700',
    badgeClass: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-950/70 dark:text-lime-300 dark:border-lime-800',
    textClass: 'text-lime-700 dark:text-lime-300',
  },
];

export const DEFAULT_SPECIAL_DUTY_OPTIONS: SpecialDutyOption[] = [
  {
    id: 'BHP',
    code: 'BHP',
    label: 'Tugas Khusus BHP (Bahan Habis Pakai)',
    shortName: 'BHP',
    description: 'Pengelolaan spuit, bloodline, AV fistula, dialyzer, heparin, kassa, & desinfektan mesin HD',
    colorName: 'Biru',
    dotColorHex: '#3b82f6',
    bgClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800',
    isCustom: false,
  },
  {
    id: 'FARMASI_LOGISTIK',
    code: 'FARMASI LOGISTIK',
    label: 'Tugas Khusus Farmasi Logistik',
    shortName: 'FARMASI LOGISTIK',
    description: 'Pengelolaan obat emergensi, EPO / Eritropoietin, zat besi IV, amprah farmasi & logistik umum ruangan',
    colorName: 'Merah',
    dotColorHex: '#f43f5e',
    bgClass: 'bg-rose-500',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-800',
    isCustom: false,
  },
  {
    id: 'NATRIUM_RO',
    code: 'NATRIUM RO',
    label: 'Tugas Khusus Natrium RO & Water Treatment',
    shortName: 'NATRIUM RO',
    description: 'Pemantauan Water Treatment RO, uji TDS & klorin, mixing konsentrat natrium bikarbonat harian',
    colorName: 'Kuning',
    dotColorHex: '#fbbf24',
    bgClass: 'bg-amber-400',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
    isCustom: false,
  },
  {
    id: 'PJ_SHIF',
    code: 'PJ SHIF',
    label: 'Tugas Khusus PJ Shif (Katim / Leader)',
    shortName: 'PJ SHIF',
    description: 'Koordinator pelayanan perawat, memimpin operan dan koordinasi pelayanan sif HD',
    colorName: 'Hijau',
    dotColorHex: '#10b981',
    bgClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    isCustom: false,
  },
  {
    id: 'CITO',
    code: 'CITO',
    label: 'CITO & Penanggung Jawab Isolasi',
    shortName: 'CITO',
    description: 'Penanganan tindakan HD darurat/cito serta penanggung jawab mutlak Alokasi Mesin Isolasi (C08 & C09)',
    colorName: 'Merah Tua',
    dotColorHex: '#dc2626',
    bgClass: 'bg-red-600',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800',
    textClass: 'text-red-700 dark:text-red-300',
    borderClass: 'border-red-200 dark:border-red-800',
    isCustom: false,
  },
];

export interface SpecialDutyInfo {
  code: string;
  label: string;
  shortName: string;
  description: string;
  badgeClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  iconName: 'Package' | 'Droplets' | 'Pill' | 'RefreshCw' | 'ShieldAlert' | 'FileCheck2' | 'Tag' | 'Zap' | 'AlertTriangle';
}

export const SPECIAL_DUTY_OPTIONS: Record<string, SpecialDutyInfo> = {
  'CITO': {
    code: 'CITO',
    label: 'CITO (HD Darurat & Mesin Isolasi)',
    shortName: 'CITO',
    description: 'Penanganan tindakan HD darurat/cito serta penanggung jawab mutlak Alokasi Mesin Isolasi (C08 & C09)',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800',
    textClass: 'text-red-700 dark:text-red-300',
    bgClass: 'bg-red-50 dark:bg-red-950/40',
    borderClass: 'border-red-200 dark:border-red-800',
    iconName: 'Zap',
  },
  'BHP': {
    code: 'BHP',
    label: 'BHP (Bahan Habis Pakai)',
    shortName: 'BHP',
    description: 'Pengelolaan spuit, bloodline, AV fistula, dialyzer, heparin, kassa, & desinfektan mesin HD',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    textClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    borderClass: 'border-blue-200 dark:border-blue-800',
    iconName: 'Package',
  },
  'NATRIUM RO': {
    code: 'NATRIUM RO',
    label: 'NATRIUM RO (Water Treatment & Bikarbonat)',
    shortName: 'NATRIUM RO',
    description: 'Pemantauan Water Treatment RO, uji TDS & klorin, mixing konsentrat natrium bikarbonat harian',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-800',
    iconName: 'Droplets',
  },
  'FARMASI LOGISTIK': {
    code: 'FARMASI LOGISTIK',
    label: 'FARMASI LOGISTIK (Obat & Amprah)',
    shortName: 'FARMASI LOGISTIK',
    description: 'Pengelolaan obat emergensi, EPO / Eritropoietin, zat besi IV, amprah farmasi & logistik umum ruangan',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
    textClass: 'text-rose-700 dark:text-rose-300',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-200 dark:border-rose-800',
    iconName: 'Pill',
  },
  'FARMASI & LOGISTIK': {
    code: 'FARMASI LOGISTIK',
    label: 'FARMASI LOGISTIK (Obat & Amprah)',
    shortName: 'FARMASI LOGISTIK',
    description: 'Pengelolaan obat emergensi, EPO / Eritropoietin, zat besi IV, amprah farmasi & logistik umum ruangan',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
    textClass: 'text-rose-700 dark:text-rose-300',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-200 dark:border-rose-800',
    iconName: 'Pill',
  },
  'PJ SHIF': {
    code: 'PJ SHIF',
    label: 'PJ SHIF (Katim / Leader)',
    shortName: 'PJ SHIF',
    description: 'Koordinator pelayanan perawat, memimpin operan dan koordinasi pelayanan sif HD',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    iconName: 'Tag',
  },
};

/**
 * Parses multiple special duties from a string (comma, semicolon, or slash separated)
 */
export const parseSpecialDuties = (dutyStr?: string | null): string[] => {
  if (!dutyStr || typeof dutyStr !== 'string') return [];
  const parsed = dutyStr
    .split(/[,;/]+/)
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false;
      const lower = s.toLowerCase();
      return (
        lower !== '-' &&
        lower !== 'null' &&
        lower !== 'undefined' &&
        lower !== 'none' &&
        lower !== 'tidak ada' &&
        lower !== 'tidak' &&
        lower !== 'belum ada'
      );
    });
  return Array.from(new Set(parsed));
};

/**
 * Formats multiple special duty codes into a standardized comma-separated string
 */
export const formatSpecialDuties = (duties: string[]): string | null => {
  if (!Array.isArray(duties)) return null;
  const unique = Array.from(
    new Set(
      duties
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter((s) => {
          if (!s) return false;
          const lower = s.toLowerCase();
          return (
            lower !== '-' &&
            lower !== 'null' &&
            lower !== 'undefined' &&
            lower !== 'none' &&
            lower !== 'tidak ada' &&
            lower !== 'tidak' &&
            lower !== 'belum ada'
          );
        })
    )
  );
  return unique.length > 0 ? unique.join(', ') : null;
};

export type MachineStatus = 'AKTIF' | 'TIDAK_DIGUNAKAN' | 'MAINTENANCE' | 'RUSAK';

export const MACHINE_STATUS_INFO: Record<MachineStatus, { label: string; colorClass: string; dotClass: string }> = {
  AKTIF: { label: 'Aktif Normal', colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-300', dotClass: 'bg-emerald-600' },
  TIDAK_DIGUNAKAN: { label: 'Tidak Digunakan', colorClass: 'bg-slate-200 text-slate-800 border-slate-400', dotClass: 'bg-slate-500' },
  MAINTENANCE: { label: 'Dalam Perawatan', colorClass: 'bg-amber-100 text-amber-900 border-amber-300', dotClass: 'bg-amber-600' },
  RUSAK: { label: 'Rusak / Off', colorClass: 'bg-rose-100 text-rose-900 border-rose-300', dotClass: 'bg-rose-600' },
};

export type MachineCategory = 'REGULER' | 'HEPATITIS_B' | 'HEPATITIS_C' | 'ISOLASI';

export const MACHINE_CATEGORY_INFO: Record<MachineCategory, { label: string; isSpecial: boolean; badgeClass: string }> = {
  REGULER: { label: 'Reguler', isSpecial: false, badgeClass: 'bg-slate-200 text-slate-800 font-bold' },
  HEPATITIS_B: { label: 'Hepatitis B', isSpecial: true, badgeClass: 'bg-purple-100 text-purple-900 font-black border border-purple-300' },
  HEPATITIS_C: { label: 'Hepatitis C', isSpecial: true, badgeClass: 'bg-pink-100 text-pink-900 font-black border border-pink-300' },
  ISOLASI: { label: 'Isolasi Khusus', isSpecial: true, badgeClass: 'bg-red-100 text-red-900 font-black border border-red-300' },
};

export type MachineOperationalShift = 'ALL' | 'PAGI' | 'SIANG';

export const MACHINE_OPERATIONAL_SHIFT_INFO: Record<MachineOperationalShift, { label: string; shortLabel: string; badgeClass: string }> = {
  ALL: { label: 'Semua Sif (Pagi & Siang)', shortLabel: 'Pagi & Siang', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PAGI: { label: 'Khusus Sif Pagi', shortLabel: 'Hanya Pagi', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300' },
  SIANG: { label: 'Khusus Sif Siang', shortLabel: 'Hanya Siang', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
};

export interface Machine {
  id: number; // 1 to 30
  code: string; // "A01", "B01", etc.
  name: string; // "Mesin HD A01"
  bay: string; // "Bay A (Reguler)", etc.
  category: MachineCategory;
  status: MachineStatus; // Global default fallback status
  brandModel: string;
  notes?: string;
  operationalShift?: MachineOperationalShift;
  statusPagi?: MachineStatus; // Status khusus Sif Pagi
  statusSiang?: MachineStatus; // Status khusus Sif Siang
}

/**
 * Returns the effective status for a machine on a given shift ('PAGI' | 'SIANG').
 * Prioritizes shift-specific status (statusPagi / statusSiang).
 * Falls back to TIDAK_DIGUNAKAN if operationalShift is strictly configured for the opposite shift.
 * Otherwise defaults to machine.status or 'AKTIF'.
 */
export const getMachineStatusForShift = (
  machine: Machine,
  shift: 'PAGI' | 'SIANG'
): MachineStatus => {
  if (shift === 'PAGI') {
    if (machine.statusPagi) return machine.statusPagi;
    if (machine.operationalShift === 'SIANG') return 'TIDAK_DIGUNAKAN';
    return machine.status || 'AKTIF';
  } else {
    if (machine.statusSiang) return machine.statusSiang;
    if (machine.operationalShift === 'PAGI') return 'TIDAK_DIGUNAKAN';
    return machine.status || 'AKTIF';
  }
};

export type ShiftType = 'PAGI' | 'SIANG' | 'LIBUR' | 'CUTI' | 'SAKIT';

export const SHIFT_TYPE_INFO: Record<ShiftType, { code: string; label: string; timeRange: string; isWorkShift: boolean; badgeClass: string; textClass: string; bgClass: string }> = {
  PAGI: { code: 'P', label: 'Sif Pagi', timeRange: '07.00 - 14.00 WIB', isWorkShift: true, badgeClass: 'bg-sky-500 text-white', textClass: 'text-sky-700', bgClass: 'bg-sky-50 border-sky-200' },
  SIANG: { code: 'S', label: 'Sif Siang', timeRange: '12.00 - 19.00 WIB', isWorkShift: true, badgeClass: 'bg-amber-500 text-white', textClass: 'text-amber-700', bgClass: 'bg-amber-50 border-amber-200' },
  LIBUR: { code: 'L', label: 'Libur / Off', timeRange: '-', isWorkShift: false, badgeClass: 'bg-slate-400 text-white', textClass: 'text-slate-600', bgClass: 'bg-slate-100 border-slate-200' },
  CUTI: { code: 'C', label: 'Cuti Tahunan', timeRange: '-', isWorkShift: false, badgeClass: 'bg-teal-500 text-white', textClass: 'text-teal-700', bgClass: 'bg-teal-50 border-teal-200' },
  SAKIT: { code: 'Skt', label: 'Sakit / Izin', timeRange: '-', isWorkShift: false, badgeClass: 'bg-rose-500 text-white', textClass: 'text-rose-700', bgClass: 'bg-rose-50 border-rose-200' },
};

export interface ShiftAssignment {
  id: string; // unique ID
  date: string; // "YYYY-MM-DD" e.g. "2026-09-01"
  shiftType: ShiftType;
  nurseId: number;
  nurseName: string;
  nursePhone: string;
  assignedMachineIds: number[];
  isLeader: boolean;
  isWhatsAppSent: boolean;
  notes: string;
  specialDuty?: string | null; // e.g. "BHP", "NATRIUM RO", "FARMASI & LOGISTIK", etc.
}

export interface AppSettings {
  id: number;
  hospitalName: string;
  roomName: string;
  headNurseName: string;
  headNursePhone: string;
  googleSheetWebhookUrl: string;
  googleSpreadsheetIdOrUrl: string;
  autoSyncGoogleSheets: boolean;
  minNursesPerShift: number;
  maxConsecutiveWorkDays: number;
  lastSyncTimestamp?: number;
  lastSyncStatus?: string;
}

export interface NurseMonthlyStat {
  nurseId: number;
  nurseName: string;
  role: NurseRole;
  pagiCount: number;
  siangCount: number;
  liburCount: number;
  cutiCount: number;
  sakitCount: number;
  totalWorkingShifts: number;
  totalMachinesAssigned: number;
  avgMachinesPerShift: number;
  isolationMachinesHandled: number;
}

export interface FairnessReport {
  monthString: string;
  totalNurses: number;
  totalDays: number;
  totalPagiShifts: number;
  totalSiangShifts: number;
  totalOffDays: number;
  avgShiftsPerNurse: number;
  minShifts: number;
  maxShifts: number;
  avgMachinesPerNurse: number;
  fairnessScorePercent: number; // 0 - 100%
  nurseStats: NurseMonthlyStat[];
}

export type UserRole = 'admin' | 'karu' | 'nurse';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  nurseId?: number | null;
  phone?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisteredAccountSummary {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  nurseId?: number | null;
  phone?: string;
  createdAt?: string;
  password?: string;
}

export type DoctorRole = 'DPJP' | 'DOKTER_RUANGAN';

export interface Doctor {
  id: number;
  name: string; // e.g. "dr. Hendra Wijaya, Sp.PD-KGH"
  sip: string; // SIP / NIP
  phone: string; // e.g. "081234567800"
  role: DoctorRole;
  specialization?: string; // e.g. "Sp.PD-KGH", "Sp.PD", "Dokter Bersertifikat HD"
  isActive: boolean;
}

export interface DoctorShiftDuty {
  date: string; // YYYY-MM-DD
  pagiDoctorId?: number | null;
  pagiDoctorName?: string;
  siangDoctorId?: number | null;
  siangDoctorName?: string;
  notes?: string;
}

export type SheetsSyncStatus = 'idle' | 'fetching' | 'saving' | 'saved' | 'error' | 'offline';
