export type TahapSkripsi = 'proposal' | 'seminar' | 'sidang';

export type StatusBimbingan = 'Aman' | 'Perlu perhatian' | 'Terlambat';

export type StatusRevisi = 'belum_dikerjakan' | 'diunggah' | 'terverifikasi';

export interface FilePerbaikan {
  namaFile: string;
  ukuran: string;
  uploadedAt: string;
  catatanMahasiswa?: string;
}

export interface RevisiTask {
  id: string;
  studentId: string;
  sessionId: string;
  deskripsi: string;
  tenggat: string; // YYYY-MM-DD
  status: StatusRevisi;
  filePerbaikan?: FilePerbaikan;
  verifiedAt?: string;
  catatanDosen?: string;
}

export interface GuidanceSession {
  id: string;
  studentId: string;
  tanggal: string; // YYYY-MM-DD
  topik: string;
  hasil: string;
  createdAt: string;
}

export interface Student {
  id: string;
  nim: string;
  nama: string;
  judul: string;
  tahap: TahapSkripsi;
  email: string;
  angkatan: string;
  pembimbing: string;
  createdAt: string;
}

export interface StatusDetail {
  status: StatusBimbingan;
  alasan: string;
  hariSejakBimbinganTerakhir: number | null;
  revisiLewatTenggatCount: number;
  revisiMendekatiTenggatCount: number;
  lastSessionDate: string | null;
}

export type Role = 'dosen' | 'mahasiswa';

// ==========================================
// TIPE DATA UNTUK FITUR ASISTEN AI AGENT
// ==========================================

export type AgentName = 'Pengingat Proaktif' | 'Briefing Mingguan' | 'Pemeriksa Revisi';

export type KeputusanDosen =
  | 'Disetujui & Terkirim'
  | 'Diedit & Terkirim'
  | 'Ditolak'
  | 'Ditinjau'
  | 'Diverifikasi';

export interface AgentLogEntry {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm
  agentName: AgentName;
  action: string;
  targetStudent?: string;
  reason: string;
  decision: KeputusanDosen;
  notes?: string;
}

export interface ReminderDraft {
  studentId: string;
  nama: string;
  nim: string;
  subjek: string;
  pesan: string;
  urgensi: string;
  statusPengiriman?: 'menunggu' | 'terkirim' | 'ditolak';
}

export interface WeeklyBriefingPriority {
  studentId: string;
  nama: string;
  nim: string;
  tahap: string;
  alasan: string;
  tindakan: string;
  urgensi: string;
}

export interface WeeklyBriefing {
  analisisKeseluruhan: string;
  prioritasMahasiswa: WeeklyBriefingPriority[];
  rekomendasiJadwal?: string;
  generatedAt: string;
}

export interface RevisionChecklistItem {
  poin: string;
  status: 'Tampak terpenuhi' | 'Sebagian' | 'Belum terlihat';
  alasan: string;
}

export interface RevisionAnalysis {
  ringkasan: string;
  catatanUmum: string;
  checklist: RevisionChecklistItem[];
  tugasRevisi?: string;
  namaMahasiswa?: string;
  generatedAt?: string;
}

