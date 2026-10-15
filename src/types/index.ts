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
