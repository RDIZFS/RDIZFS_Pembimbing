import React from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  FileText,
  ShieldCheck,
  AlertTriangle,
  User,
} from 'lucide-react';
import { GuidanceSession, RevisiTask, Student } from '../types';
import {
  formatTanggalIndo,
  getStatusBadgeStyle,
  getTahapLabel,
  hitungStatusMahasiswa,
} from '../utils/statusUtils';

interface MahasiswaViewProps {
  student: Student;
  sessions: GuidanceSession[];
  revisions: RevisiTask[];
  onOpenUploadRevisi: (revisi: RevisiTask) => void;
  students: Student[];
  onSwitchStudent: (studentId: string) => void;
}

export const MahasiswaView: React.FC<MahasiswaViewProps> = ({
  student,
  sessions,
  revisions,
  onOpenUploadRevisi,
  students,
  onSwitchStudent,
}) => {
  // NFR-3: PRIVASI - Mahasiswa HANYA melihat data miliknya sendiri
  const studentSessions = sessions
    .filter((s) => s.studentId === student.id)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const studentRevisions = revisions
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => a.tenggat.localeCompare(b.tenggat));

  const statusDetail = hitungStatusMahasiswa(student.id, sessions, revisions);
  const badgeStyle = getStatusBadgeStyle(statusDetail.status);

  const pendingRevisions = studentRevisions.filter((r) => r.status === 'belum_dikerjakan');
  const uploadedRevisions = studentRevisions.filter((r) => r.status === 'diunggah');
  const verifiedRevisions = studentRevisions.filter((r) => r.status === 'terverifikasi');

  return (
    <div className="space-y-6">
      
      {/* Student Welcome & Profile Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Switcher simulator banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">
              Portal Mahasiswa Bimbingan
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-600 font-medium">
              Sesi Aktif: {student.nama}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Simulasi Mahasiswa:</span>
            <select
              value={student.id}
              onChange={(e) => onSwitchStudent(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 max-w-[260px] truncate"
            >
              {students.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} — {getTahapLabel(m.tahap)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Bio & Thesis Details */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 tabular-nums">
                NIM {student.nim}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-slate-600">
                Tahap: <strong className="text-slate-900">{getTahapLabel(student.tahap)}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-600">
                Pembimbing: <strong>{student.pembimbing}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {student.judul}
            </h1>

            <p className="text-xs text-slate-500">
              {student.nama} · Angkatan {student.angkatan} · {student.email}
            </p>
          </div>

          {/* Current Status Box (FR-3) */}
          <div className={`p-4 rounded-xl border ${badgeStyle.bg} min-w-[240px] shrink-0 space-y-1.5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Status Progres Skripsi</span>
              <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
            </div>
            <div className="text-lg font-bold">
              {statusDetail.status}
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {statusDetail.alasan}
            </p>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Total Sesi Bimbingan</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {studentSessions.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Revisi Menunggu / Dikerjakan</span>
            <span className="text-lg font-bold text-amber-700 tabular-nums">
              {pendingRevisions.length + uploadedRevisions.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Revisi Terverifikasi</span>
            <span className="text-lg font-bold text-emerald-700 tabular-nums">
              {verifiedRevisions.length}
            </span>
          </div>
        </div>

      </div>

      {/* Main Section: Daftar Tugas Revisi (FR-4) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Tugas Revisi dari Dosen Pembimbing (FR-4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah file dokumen perbaikan untuk setiap tugas sebelum tenggat waktu berakhir.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            {studentRevisions.length} Tugas
          </span>
        </div>

        <div className="p-6 space-y-4">
          {studentRevisions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Tidak ada tugas revisi saat ini</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Anda tidak memiliki revisi pending. Pantau terus jadwal bimbingan berikutnya bersama dosen pembimbing.
              </p>
            </div>
          ) : (
            studentRevisions.map((rev) => {
              const isVerified = rev.status === 'terverifikasi';
              const isUploaded = rev.status === 'diunggah';
              const isPending = rev.status === 'belum_dikerjakan';

              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isVerified
                      ? 'bg-slate-50/60 border-slate-200'
                      : isUploaded
                      ? 'bg-indigo-50/30 border-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : isUploaded
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isVerified
                          ? '✓ Disetujui / Terverifikasi'
                          : isUploaded
                          ? '⏳ Menunggu Verifikasi Dosen'
                          : '⚠️ Belum Dikerjakan'}
                      </span>

                      <span className="text-xs text-slate-500">
                        Batas Tenggat: <strong className="text-slate-800 tabular-nums">{formatTanggalIndo(rev.tenggat)}</strong>
                      </span>
                    </div>

                    {/* Upload Action Button */}
                    {!isVerified && (
                      <button
                        type="button"
                        onClick={() => onOpenUploadRevisi(rev)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap ${
                          isUploaded
                            ? 'text-indigo-700 bg-white border border-indigo-300 hover:bg-indigo-50'
                            : 'text-white bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>{isUploaded ? 'Unggah Ulang Perbaikan' : 'Unggah File Perbaikan'}</span>
                      </button>
                    )}
                  </div>

                  {/* Deskripsi Revisi */}
                  <div className="text-xs text-slate-900 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                      Instruksi Perbaikan:
                    </span>
                    {rev.deskripsi}
                  </div>

                  {/* Uploaded File Details */}
                  {rev.filePerbaikan && (
                    <div className="mt-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          Berkas Terlampir: {rev.filePerbaikan.namaFile} ({rev.filePerbaikan.ukuran})
                        </span>
                        <span className="text-[11px] text-indigo-700 tabular-nums">
                          Diunggah pada: {rev.filePerbaikan.uploadedAt}
                        </span>
                      </div>
                      {rev.filePerbaikan.catatanMahasiswa && (
                        <p className="text-slate-700 italic text-[11px] bg-white p-2 rounded-sm border border-slate-200">
                          Catatan Anda: "{rev.filePerbaikan.catatanMahasiswa}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Verification Note from Lecturer */}
                  {isVerified && (
                    <div className="mt-2.5 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Revisi telah diverifikasi dosen pembimbing.</span>
                        {rev.catatanDosen && (
                          <p className="text-emerald-700 text-[11px] mt-0.5 italic">
                            Catatan Dosen: "{rev.catatanDosen}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Riwayat Sesi Bimbingan Mahasiswa */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Riwayat Sesi Bimbingan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urut dari sesi yang paling terbaru.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {studentSessions.length} Sesi Terlaksana
          </span>
        </div>

        <div className="p-6 space-y-4">
          {studentSessions.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                Belum ada catatan riwayat sesi bimbingan yang terekam.
              </p>
            </div>
          ) : (
            studentSessions.map((session, idx) => (
              <div
                key={session.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Sesi Bimbingan #{studentSessions.length - idx}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-600 font-medium tabular-nums">
                      {formatTanggalIndo(session.tanggal)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Dosen: {student.pembimbing}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Topik Pembahasan:
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {session.topik}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Hasil Pembahasan & Arahan:
                  </span>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-md border border-slate-100">
                    {session.hasil}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
