import { GuidanceSession, RevisiTask, Student } from '../types';

export const DOSEN_NAME = 'Ratu Dintha Insyani Zukhruf FS, S.Pd., M.M';
export const PRODI_NAME = 'Program Studi Pendidikan Bisnis, FPEB, Universitas Pendidikan Indonesia';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'mhs-1',
    nim: '2201842',
    nama: 'Farhan Maulana',
    email: 'farhan.maulana@upi.edu',
    judul: 'Pengaruh Pembelajaran Simulasi Bisnis Berbasis Digital dan Literasi Keuangan Terhadap Minat Berwirausaha Mahasiswa',
    tahap: 'sidang',
    angkatan: '2022',
    pembimbing: DOSEN_NAME,
    createdAt: '2026-02-10',
  },
  {
    id: 'mhs-2',
    nim: '2203115',
    nama: 'Nadia Larasati',
    email: 'nadia.larasati@upi.edu',
    judul: 'Efektivitas Model Project-Based Learning Berbantuan E-Commerce Platform dalam Meningkatkan Keterampilan Pemasaran Digital Mahasiswa',
    tahap: 'proposal',
    angkatan: '2022',
    pembimbing: DOSEN_NAME,
    createdAt: '2026-08-15',
  },
  {
    id: 'mhs-3',
    nim: '2108743',
    nama: 'Rizky Dwi Pratama',
    email: 'rizky.pratama@upi.edu',
    judul: 'Analisis Faktor-Faktor Adopsi Social Commerce pada Usaha Rintisan Mahasiswa Pendidikan Bisnis Menggunakan UTAUT2',
    tahap: 'seminar',
    angkatan: '2021',
    pembimbing: DOSEN_NAME,
    createdAt: '2026-03-01',
  },
  {
    id: 'mhs-4',
    nim: '2205421',
    nama: 'Aulia Nur Salsabila',
    email: 'aulia.salsabila@upi.edu',
    judul: 'Pengaruh Personal Branding di TikTok dan Kualitas Konten Edukasi Bisnis Terhadap Keputusan Pembelian Produk UMKM Mahasiswa',
    tahap: 'proposal',
    angkatan: '2022',
    pembimbing: DOSEN_NAME,
    createdAt: '2026-07-20',
  },
  {
    id: 'mhs-5',
    nim: '2104928',
    nama: 'Dimas Arya Pangestu',
    email: 'dimas.arya@upi.edu',
    judul: 'Penerapan Experiential Learning pada Mata Kuliah Manajemen Ritel untuk Meningkatkan Kesiapan Kerja Mahasiswa',
    tahap: 'seminar',
    angkatan: '2021',
    pembimbing: DOSEN_NAME,
    createdAt: '2026-01-15',
  },
  {
    id: 'mhs-6',
    nim: '2207612',
    nama: 'Siti Rahmawati',
    email: 'siti.rahmawati@upi.edu',
    judul: 'Analisis Komparatif Perilaku Konsumen Generasi Z Terhadap Pembayaran Digital (QRIS vs Buy Now Pay Later) di Lingkungan Kampus',
    tahap: 'sidang',
    angkatan: '2022',
    pembimbing: DOSEN_NAME,
    createdAt: '2026-02-01',
  },
  {
    id: 'mhs-7',
    nim: '2004519',
    nama: 'Bagas Wicaksono',
    email: 'bagas.wicaksono@upi.edu',
    judul: 'Evaluasi Dampak Program Inkubator Bisnis FPEB UPI Terhadap Keberlanjutan Usaha Start-up Mahasiswa',
    tahap: 'sidang',
    angkatan: '2020',
    pembimbing: DOSEN_NAME,
    createdAt: '2025-09-01',
  },
  {
    id: 'mhs-8',
    nim: '2106334',
    nama: 'Putri Anggraini',
    email: 'putri.anggraini@upi.edu',
    judul: 'Pengembangan Bahan Ajar Digital Interaktif Materi Strategi Penetapan Harga Berbasis Kasus Bisnis Lokal Bandung',
    tahap: 'proposal',
    angkatan: '2021',
    pembimbing: DOSEN_NAME,
    createdAt: '2026-06-10',
  },
  {
    id: 'mhs-9',
    nim: '2009184',
    nama: 'Ilham Ramadhan',
    email: 'ilham.ramadhan@upi.edu',
    judul: 'Pengaruh Self-Efficacy dan Lingkungan Keluarga Terhadap Intensi Berwirausaha di Sektor Kuliner Mahasiswa FPEB UPI',
    tahap: 'seminar',
    angkatan: '2020',
    pembimbing: DOSEN_NAME,
    createdAt: '2025-11-12',
  },
];

export const INITIAL_SESSIONS: GuidanceSession[] = [
  // Farhan Maulana (Aman: last session 4 days ago)
  {
    id: 'ses-101',
    studentId: 'mhs-1',
    tanggal: '2026-10-11',
    topik: 'Finalisasi Bab 4 & Bab 5 Pembahasan Hasil Uji Regresi Linear Berganda',
    hasil: 'Hasil uji hipotesis menunjukkan F-hitung signifikan. Pembahasan teori literasi finansial sudah runtut, siap menyiapkan kelengkapan naskah dan formulir persetujuan sidang skripsi.',
    createdAt: '2026-10-11T10:30:00Z',
  },
  {
    id: 'ses-102',
    studentId: 'mhs-1',
    tanggal: '2026-09-28',
    topik: 'Review Bab 4 Uji Asumsi Klasik dan Tabulasi Data Kuesioner',
    hasil: 'Perlu menambahkan penjelasan koefisien determinasi R2 pada tabel 4.3 dan merujuk artikel jurnal bereputasi terkait.',
    createdAt: '2026-09-28T14:00:00Z',
  },

  // Nadia Larasati (Aman: last session 6 days ago)
  {
    id: 'ses-201',
    studentId: 'mhs-2',
    tanggal: '2026-10-09',
    topik: 'Pematangan Instrumen Kuesioner dan RPP Project-Based Learning',
    hasil: 'Rubrik penilaian proyek pemasaran disetujui. Lanjutkan pengujian validitas isi (content validity) oleh ahli materi sebelum seminar proposal.',
    createdAt: '2026-10-09T09:15:00Z',
  },
  {
    id: 'ses-202',
    studentId: 'mhs-2',
    tanggal: '2026-09-25',
    topik: 'Pembahasan Kajian Pustaka Bab 2 Pembelajaran Digital Marketing',
    hasil: 'Referensi kajian jurnal nasional terakreditasi SINTA dan Scopus 5 tahun terakhir sudah memadai.',
    createdAt: '2026-09-25T11:00:00Z',
  },

  // Rizky Dwi Pratama (Aman: last session 10 days ago)
  {
    id: 'ses-301',
    studentId: 'mhs-3',
    tanggal: '2026-10-05',
    topik: 'Evaluasi Model Pengukuran PLS-SEM pada Konstruk UTAUT2',
    hasil: 'Convergent validity dan discriminant validity sudah memenuhi kriteria Fornell-Larcker. Lanjutkan penulisan draf artikel seminar hasil.',
    createdAt: '2026-10-05T13:45:00Z',
  },

  // Aulia Nur Salsabila (Perlu perhatian: bimbingan terakhir 21 hari lalu)
  {
    id: 'ses-401',
    studentId: 'mhs-4',
    tanggal: '2026-09-24',
    topik: 'Perumusan Masalah dan Desain Sampling Kuesioner TikTok Shop',
    hasil: 'Teknik purposive sampling pada konsumen mahasiswa UPI perlu diperjelas kriterianya pada Bab 3. Segera unggah perbaikan draf proposal.',
    createdAt: '2026-09-24T15:00:00Z',
  },

  // Dimas Arya Pangestu (Perlu perhatian: tenggat revisi 2 hari ke depan, 2026-10-17)
  {
    id: 'ses-501',
    studentId: 'mhs-5',
    tanggal: '2026-10-10',
    topik: 'Desain Modul Experiential Learning Ritel Modern',
    hasil: 'Struktur modul sudah baik. Tambahkan studi kasus kemitraan minimarket kampus dan selesaikan sebelum tenggat tanggal 17 Oktober.',
    createdAt: '2026-10-10T10:00:00Z',
  },

  // Siti Rahmawati (Perlu perhatian: bimbingan 25 hari lalu, sudah unggah revisi menunggu verifikasi)
  {
    id: 'ses-601',
    studentId: 'mhs-6',
    tanggal: '2026-09-20',
    topik: 'Uji Beda Independent Sample T-Test QRIS vs PayLater',
    hasil: 'Tabel komparasi rata-rata pengeluaran bulanan perlu dilengkapi interpretasi implikasi pedagogis literasi keuangan mahasiswa.',
    createdAt: '2026-09-20T11:30:00Z',
  },

  // Bagas Wicaksono (Terlambat: bimbingan 51 hari lalu + revisi lewat tenggat)
  {
    id: 'ses-701',
    studentId: 'mhs-7',
    tanggal: '2026-08-25',
    topik: 'Analisis Hambatan Keberlanjutan Usaha Tenant Inkubator',
    hasil: 'Data wawancara mendalam dengan 5 pengelola inkubator belum ditranskrip tuntas. Segera selesaikan matriks coding kualitatif.',
    createdAt: '2026-08-25T14:30:00Z',
  },

  // Putri Anggraini (Terlambat: revisi lewat tenggat 2026-10-10 belum dikerjakan)
  {
    id: 'ses-801',
    studentId: 'mhs-8',
    tanggal: '2026-10-01',
    topik: 'Validasi Ahli Media Bahan Ajar Digital Interaktif',
    hasil: 'Revisi lembar penilaian ahli media dan instrumen uji keterbacaan mahasiswa. Perbaiki dan unggah secepatnya.',
    createdAt: '2026-10-01T09:30:00Z',
  },

  // Ilham Ramadhan (Terlambat: bimbingan terakhir 66 hari lalu)
  {
    id: 'ses-901',
    studentId: 'mhs-9',
    tanggal: '2026-08-10',
    topik: 'Klarifikasi Populasi dan Sampel Pelaku Bisnis Kuliner Mahasiswa',
    hasil: 'Ukuran sampel 80 responden masih kurang representatif. Perluas jangkauan ke alumni wirausaha muda FPEB UPI.',
    createdAt: '2026-08-10T16:00:00Z',
  },
];

export const INITIAL_REVISIONS: RevisiTask[] = [
  // Farhan (Terverifikasi)
  {
    id: 'rev-101',
    studentId: 'mhs-1',
    sessionId: 'ses-101',
    deskripsi: 'Menambahkan lampiran output SPSS uji F, uji t, serta bukti cek plagiarisme Turnitin naskah skripsi.',
    tenggat: '2026-10-18',
    status: 'terverifikasi',
    filePerbaikan: {
      namaFile: 'Lampiran_Output_SPSS_Farhan_Final.pdf',
      ukuran: '2.1 MB',
      uploadedAt: '2026-10-13 14:20',
      catatanMahasiswa: 'Output SPSS uji regresi dan tabel koefisien sudah lengkap dilampirkan beserta bukti Turnitin similarity 14%.',
    },
    verifiedAt: '2026-10-14 09:00',
    catatanDosen: 'Revisi disetujui, berkas pendaftaran sidang akhir dapat diproses ke prodi.',
  },

  // Nadia (Belum dikerjakan, aman tenggat 2026-10-25)
  {
    id: 'rev-201',
    studentId: 'mhs-2',
    sessionId: 'ses-201',
    deskripsi: 'Menyempurnakan kisi-kisi instrumen tes kemampuan digital marketing dan rubrik penilaian portofolio e-commerce.',
    tenggat: '2026-10-25',
    status: 'belum_dikerjakan',
  },

  // Rizky (Belum dikerjakan, aman tenggat 2026-10-30)
  {
    id: 'rev-301',
    studentId: 'mhs-3',
    sessionId: 'ses-301',
    deskripsi: 'Menyusun naskah draf artikel seminar hasil 8 halaman sesuai template jurnal Pendidikan Bisnis dan Manajemen.',
    tenggat: '2026-10-30',
    status: 'belum_dikerjakan',
  },

  // Aulia (Belum dikerjakan, tenggat 2026-10-22 tapi lama bimbingan >20 hari -> Perlu Perhatian)
  {
    id: 'rev-401',
    studentId: 'mhs-4',
    sessionId: 'ses-401',
    deskripsi: 'Memperbaiki batasan operasional variabel personal branding dan menambahkan indikator interaksi konten video.',
    tenggat: '2026-10-22',
    status: 'belum_dikerjakan',
  },

  // Dimas (Belum dikerjakan, mendekati tenggat: 2026-10-17 yaitu 2 hari lagi -> Perlu Perhatian)
  {
    id: 'rev-501',
    studentId: 'mhs-5',
    sessionId: 'ses-501',
    deskripsi: 'Melengkapi lembar kerja mahasiswa (LKM) modul ritel dan rubrik penilaian simulasi kasir modern.',
    tenggat: '2026-10-17',
    status: 'belum_dikerjakan',
  },

  // Siti (Diunggah oleh mahasiswa, menunggu verifikasi dosen)
  {
    id: 'rev-601',
    studentId: 'mhs-6',
    sessionId: 'ses-601',
    deskripsi: 'Menambahkan narasi komparasi implikasi risiko impulsivitas belanja mahasiswa antara QRIS dan PayLater.',
    tenggat: '2026-10-20',
    status: 'diunggah',
    filePerbaikan: {
      namaFile: 'Perbaikan_Bab4_Analisis_Komparasi_Siti.pdf',
      ukuran: '1.9 MB',
      uploadedAt: '2026-10-14 20:10',
      catatanMahasiswa: 'Sudah ditambahkan pembahasan mendalam pada sub-bab 4.4 mengenai pola konsumsi dan risiko finansial mahasiswa.',
    },
  },

  // Bagas (Terlambat: tenggat 2026-09-10 sudah lewat 1 bulan lebih)
  {
    id: 'rev-701',
    studentId: 'mhs-7',
    sessionId: 'ses-701',
    deskripsi: 'Menyerahkan matriks transkrip wawancara 5 tenant usaha mahasiswa dan pengelola inkubator bisnis FPEB.',
    tenggat: '2026-09-10',
    status: 'belum_dikerjakan',
  },

  // Putri (Terlambat: tenggat 2026-10-10 sudah terlewat 5 hari)
  {
    id: 'rev-801',
    studentId: 'mhs-8',
    sessionId: 'ses-801',
    deskripsi: 'Memperbaiki butir-butir evaluasi kuesioner kelayakan media bahan ajar digital agar terhindar dari ambiguitas istilah bisnis.',
    tenggat: '2026-10-10',
    status: 'belum_dikerjakan',
  },

  // Ilham (Terlambat: tenggat 2026-08-30 sudah lewat 45 hari)
  {
    id: 'rev-901',
    studentId: 'mhs-9',
    sessionId: 'ses-901',
    deskripsi: 'Menyerahkan draf instrumen kuesioner skala Likert motivasi wirausaha yang telah dikonsultasikan.',
    tenggat: '2026-08-30',
    status: 'belum_dikerjakan',
  },
];

export const INITIAL_AGENT_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-10-14 09:15',
    agentName: 'Pemeriksa Revisi' as const,
    action: 'Analisis kelayakan berkas naskah revisi Bab 4 Farhan Maulana',
    targetStudent: 'Farhan Maulana (2201842)',
    reason: 'Pemeriksaan lampiran output SPSS dan tabel hasil uji hipotesis sesuai catatan bimbingan',
    decision: 'Diverifikasi' as const,
    notes: 'Dosen meninjau checklist AI (3/3 tampak terpenuhi) lalu menyetujui verifikasi final.',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-13 14:30',
    agentName: 'Pengingat Proaktif' as const,
    action: 'Penyusunan dan pengiriman pengingat batas tenggat revisi Putri Anggraini',
    targetStudent: 'Putri Anggraini (2106334)',
    reason: 'Tenggat perbaikan instrumen uji kelayakan bahan ajar digital terlewat 3 hari',
    decision: 'Diedit & Terkirim' as const,
    notes: 'Dosen menambahkan catatan opsi jadwal konsultasi hari Kamis sebelum menyetujui kirim.',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-12 08:00',
    agentName: 'Briefing Mingguan' as const,
    action: 'Pembuatan briefing mingguan portofolio 9 mahasiswa bimbingan',
    reason: 'Identifikasi 3 mahasiswa prioritas tinggi untuk evaluasi tengah semester',
    decision: 'Ditinjau' as const,
    notes: 'Dosen meninjau analisis ringkasan dan menetapkan fokus penanganan mahasiswa terlambat.',
  },
];

