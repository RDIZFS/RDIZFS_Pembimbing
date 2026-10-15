import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Edit2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  GuidanceSession,
  RevisiTask,
  StatusBimbingan,
  Student,
  TahapSkripsi,
} from '../types';
import {
  formatTanggalIndo,
  getStatusBadgeStyle,
  getTahapLabel,
  hitungStatusMahasiswa,
} from '../utils/statusUtils';

interface DosenDashboardProps {
  students: Student[];
  sessions: GuidanceSession[];
  revisions: RevisiTask[];
  onOpenAddStudent: () => void;
  onOpenEditStudent: (student: Student) => void;
  onOpenCatatBimbingan: (studentId?: string) => void;
  onSelectStudentDetail: (student: Student) => void;
  onQuickVerifyRevision: (revisiId: string) => void;
}

export const DosenDashboard: React.FC<DosenDashboardProps> = ({
  students,
  sessions,
  revisions,
  onOpenAddStudent,
  onOpenEditStudent,
  onOpenCatatBimbingan,
  onSelectStudentDetail,
  onQuickVerifyRevision,
}) => {
  const [filterStatus, setFilterStatus] = useState<'semua' | StatusBimbingan>('semua');
  const [filterTahap, setFilterTahap] = useState<'semua' | TahapSkripsi>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Hitung status untuk seluruh mahasiswa
  const studentWithStatus = useMemo(() => {
    return students.map((student) => {
      const statusDetail = hitungStatusMahasiswa(student.id, sessions, revisions);
      const studentRevs = revisions.filter((r) => r.studentId === student.id);
      const pendingRevs = studentRevs.filter((r) => r.status === 'belum_dikerjakan');
      const uploadedRevs = studentRevs.filter((r) => r.status === 'diunggah');

      return {
        ...student,
        statusDetail,
        totalRevisi: studentRevs.length,
        pendingRevisiCount: pendingRevs.length,
        uploadedRevisiCount: uploadedRevs.length,
        uploadedRevisi: uploadedRevs,
      };
    });
  }, [students, sessions, revisions]);

  // Statistik Ringkasan (KPIs)
  const stats = useMemo(() => {
    const total = studentWithStatus.length;
    const aman = studentWithStatus.filter((s) => s.statusDetail.status === 'Aman').length;
    const perhatian = studentWithStatus.filter((s) => s.statusDetail.status === 'Perlu perhatian').length;
    const terlambat = studentWithStatus.filter((s) => s.statusDetail.status === 'Terlambat').length;
    const perluVerifikasi = revisions.filter((r) => r.status === 'diunggah').length;

    return { total, aman, perhatian, terlambat, perluVerifikasi };
  }, [studentWithStatus, revisions]);

  // Filtered Students (FR-5)
  const filteredStudents = useMemo(() => {
    return studentWithStatus.filter((m) => {
      // Filter Status
      if (filterStatus !== 'semua' && m.statusDetail.status !== filterStatus) {
        return false;
      }
      // Filter Tahap
      if (filterTahap !== 'semua' && m.tahap !== filterTahap) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNama = m.nama.toLowerCase().includes(query);
        const matchNim = m.nim.toLowerCase().includes(query);
        const matchJudul = m.judul.toLowerCase().includes(query);
        if (!matchNama && !matchNim && !matchJudul) return false;
      }
      return true;
    });
  }, [studentWithStatus, filterStatus, filterTahap, searchQuery]);

  const hasActiveFilters = filterStatus !== 'semua' || filterTahap !== 'semua' || searchQuery !== '';

  const resetFilters = () => {
    setFilterStatus('semua');
    setFilterTahap('semua');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Dosen Profile Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <span className="text-xs font-semibold text-indigo-600 block mb-1">
            Dosen Pembimbing Skripsi
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ratu Dintha Insyani Zukhruf FS, S.Pd., M.M
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Program Studi Pendidikan Bisnis · Fakultas Pendidikan Ekonomi dan Bisnis (FPEB) · Universitas Pendidikan Indonesia
          </p>
        </div>

        {/* Action Buttons: Fast Guidance Log & Add Student */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAddStudent}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Tambah Mahasiswa</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenCatatBimbingan()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Catat Bimbingan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Summary in 1 View + 1-Click Filter for NFR-1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Advisees */}
        <button
          type="button"
          onClick={() => setFilterStatus('semua')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filterStatus === 'semua'
              ? 'bg-white border-slate-400 ring-2 ring-slate-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Mahasiswa</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {stats.total}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Semua tahapan skripsi
          </span>
        </button>

        {/* Aman */}
        <button
          type="button"
          onClick={() => setFilterStatus('Aman')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filterStatus === 'Aman'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Status Aman</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {stats.aman}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Bimbingan aktif ≤14 hari
          </span>
        </button>

        {/* Perlu Perhatian */}
        <button
          type="button"
          onClick={() => setFilterStatus('Perlu perhatian')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filterStatus === 'Perlu perhatian'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Perlu Perhatian</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">
            {stats.perhatian}
          </div>
          <span className="text-[11px] text-amber-600 mt-1 block">
            15-30 hari atau tenggat ≤3 hari
          </span>
        </button>

        {/* Terlambat (1-Click Filter for NFR-1 target: < 10 detik dari halaman utama) */}
        <button
          type="button"
          onClick={() => setFilterStatus('Terlambat')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filterStatus === 'Terlambat'
              ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/20 shadow-xs'
              : 'bg-white border-rose-200 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold flex items-center gap-1">
              <span>Terlambat</span>
              <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded-sm font-semibold">
                1-Klik
              </span>
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 tabular-nums">
            {stats.terlambat}
          </div>
          <span className="text-[11px] text-rose-600 mt-1 block">
            &gt;30 hari atau lewat tenggat
          </span>
        </button>
      </div>

      {/* Banner alert if there are uploaded revisions waiting for verification (FR-5) */}
      {stats.perluVerifikasi > 0 && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Terdapat <strong>{stats.perluVerifikasi} revisi</strong> yang telah diunggah oleh mahasiswa dan siap Anda verifikasi (FR-5).
            </span>
          </div>
          <span className="text-[11px] text-indigo-700 font-medium">
            Periksa pada detail profil mahasiswa
          </span>
        </div>
      )}

      {/* Filter and Search Bar (FR-5) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama mahasiswa, NIM, atau topik skripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Status (Semua | Aman | Perlu perhatian | Terlambat) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mr-1">
              Status:
            </span>
            {(['semua', 'Aman', 'Perlu perhatian', 'Terlambat'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'semua' ? 'Semua Status' : st}
              </button>
            ))}
          </div>

          {/* Filter Tahap (Semua | Proposal | Seminar | Sidang) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mr-1">
              Tahap:
            </span>
            {(['semua', 'proposal', 'seminar', 'sidang'] as const).map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setFilterTahap(th)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterTahap === th
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {th === 'semua' ? 'Semua Tahap' : getTahapLabel(th)}
              </button>
            ))}
          </div>

          {/* Reset Filter Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}

        </div>
      </div>

      {/* Main Student List Table (Desktop & Tablet) / Cards (Mobile) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Table Header Count */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Daftar Mahasiswa Bimbingan
            </span>
            <span className="text-xs text-slate-500">
              ({filteredStudents.length} dari {students.length} mahasiswa)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Klik baris untuk melihat riwayat log dan verifikasi revisi
          </span>
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada mahasiswa yang sesuai filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Coba sesuaikan kata kunci pencarian atau ubah opsi filter status dan tahap.
            </p>
            <button
              onClick={resetFilters}
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              Tampilkan Semua Mahasiswa
            </button>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-52">Mahasiswa & NIM</th>
                    <th className="py-3 px-4 min-w-[260px]">Judul Skripsi</th>
                    <th className="py-3 px-3 w-28">Tahap</th>
                    <th className="py-3 px-4 w-36">Bimbingan Terakhir</th>
                    <th className="py-3 px-4 w-36">Status Otomatis</th>
                    <th className="py-3 px-3 w-28">Tugas Revisi</th>
                    <th className="py-3 px-4 w-28 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((m) => {
                    const badgeStyle = getStatusBadgeStyle(m.statusDetail.status);
                    const lastDate = m.statusDetail.lastSessionDate;
                    const daysAgo = m.statusDetail.hariSejakBimbinganTerakhir;

                    return (
                      <tr
                        key={m.id}
                        onClick={() => onSelectStudentDetail(m)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Mahasiswa & NIM */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {m.nama}
                          </div>
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            {m.nim} · Angk. {m.angkatan}
                          </div>
                        </td>

                        {/* Judul Skripsi */}
                        <td className="py-3.5 px-4">
                          <p className="text-slate-800 line-clamp-2 leading-relaxed">
                            {m.judul}
                          </p>
                        </td>

                        {/* Tahap */}
                        <td className="py-3.5 px-3">
                          <span className="inline-block text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md whitespace-nowrap">
                            {getTahapLabel(m.tahap)}
                          </span>
                        </td>

                        {/* Bimbingan Terakhir */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {lastDate ? (
                            <div>
                              <span className="font-medium text-slate-800 tabular-nums">
                                {formatTanggalIndo(lastDate, true)}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {daysAgo === 0 ? 'Hari ini' : `${daysAgo} hari lalu`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-rose-500 font-medium">Belum pernah</span>
                          )}
                        </td>

                        {/* Status Otomatis (FR-3) */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle.bg} whitespace-nowrap`}
                            title={m.statusDetail.alasan}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                            {m.statusDetail.status}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-[160px]" title={m.statusDetail.alasan}>
                            {m.statusDetail.alasan}
                          </span>
                        </td>

                        {/* Tugas Revisi */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {m.uploadedRevisiCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3" />
                              {m.uploadedRevisiCount} verifikasi
                            </span>
                          ) : m.pendingRevisiCount > 0 ? (
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              {m.pendingRevisiCount} belum
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">0 pending</span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onOpenCatatBimbingan(m.id)}
                              title="Catat sesi bimbingan"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectStudentDetail(m)}
                              title="Buka detail mahasiswa"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (360px - 768px compliant) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredStudents.map((m) => {
                const badgeStyle = getStatusBadgeStyle(m.statusDetail.status);
                const lastDate = m.statusDetail.lastSessionDate;
                const daysAgo = m.statusDetail.hariSejakBimbinganTerakhir;

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectStudentDetail(m)}
                    className="p-4 space-y-2.5 hover:bg-slate-50 transition-colors active:bg-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {m.nama}
                        </h4>
                        <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                          NIM {m.nim} · {getTahapLabel(m.tahap)}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle.bg} shrink-0`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                        {m.statusDetail.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-2">
                      {m.judul}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1 text-slate-500 border-t border-slate-100">
                      <div>
                        <span>Bimbingan: </span>
                        <strong className="text-slate-800">
                          {lastDate ? formatTanggalIndo(lastDate, true) : 'Belum pernah'}
                        </strong>
                        {daysAgo !== null && (
                          <span className="text-[11px] text-slate-400 ml-1">
                            ({daysAgo} hari lalu)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenCatatBimbingan(m.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-md"
                        >
                          + Catat
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectStudentDetail(m)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
