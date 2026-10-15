import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Check,
  Download,
} from 'lucide-react';
import { GuidanceSession, RevisiTask, Student, RevisionAnalysis } from '../types';
import {
  formatTanggalIndo,
  getStatusBadgeStyle,
  getTahapLabel,
  hitungStatusMahasiswa,
} from '../utils/statusUtils';

interface ModalDetailMahasiswaProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  sessions: GuidanceSession[];
  revisions: RevisiTask[];
  onOpenCatatBimbingan: (studentId: string) => void;
  onOpenEditStudent: (student: Student) => void;
  onVerifyRevision: (revisiId: string, catatanDosen?: string) => void;
}

export const ModalDetailMahasiswa: React.FC<ModalDetailMahasiswaProps> = ({
  isOpen,
  onClose,
  student,
  sessions,
  revisions,
  onOpenCatatBimbingan,
  onOpenEditStudent,
  onVerifyRevision,
}) => {
  const [activeTab, setActiveTab] = useState<'revisi' | 'riwayat'>('revisi');
  const [verifyingRevisiId, setVerifyingRevisiId] = useState<string | null>(null);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');
  const [analyzingRevisiId, setAnalyzingRevisiId] = useState<string | null>(null);
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, RevisionAnalysis>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const handleRunAiInspection = async (rev: RevisiTask) => {
    if (!student) return;
    setLoadingAiId(rev.id);
    try {
      const res = await fetch('/api/agents/pemeriksa-revisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tugasRevisi: rev.deskripsi,
          namaMahasiswa: student.nama,
          judulSkripsi: student.judul,
          catatanMahasiswa: rev.filePerbaikan?.catatanMahasiswa || 'Berkas perbaikan telah diunggah.',
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysisMap((prev) => ({ ...prev, [rev.id]: data.analysis }));
        setAnalyzingRevisiId(rev.id);
      }
    } catch (err) {
      console.error('Error running AI inspection:', err);
    } finally {
      setLoadingAiId(null);
    }
  };

  if (!isOpen || !student) return null;

  const statusDetail = hitungStatusMahasiswa(student.id, sessions, revisions);
  const badgeStyle = getStatusBadgeStyle(statusDetail.status);

  const studentSessions = sessions
    .filter((s) => s.studentId === student.id)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const studentRevisions = revisions
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => a.tenggat.localeCompare(b.tenggat));

  const handleConfirmVerification = (revisiId: string) => {
    onVerifyRevision(revisiId, catatanVerifikasi.trim() || 'Telah diperiksa dan disetujui oleh dosen pembimbing.');
    setVerifyingRevisiId(null);
    setCatatanVerifikasi('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 tabular-nums">
                NIM {student.nim}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-slate-600">
                Tahap: <strong className="text-slate-900">{getTahapLabel(student.tahap)}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                {statusDetail.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{student.nama}</h2>
            <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl font-normal leading-relaxed">
              {student.judul}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenEditStudent(student)}
              className="p-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 border border-slate-200 bg-white"
              title="Ubah data mahasiswa"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ubah Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Explanation Banner */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Kondisi Status:</strong> {statusDetail.alasan}
            </span>
          </div>

          <button
            onClick={() => onOpenCatatBimbingan(student.id)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Bimbingan Baru</span>
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('revisi')}
            className={`pb-3 text-xs font-semibold transition-colors relative ${
              activeTab === 'revisi'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Tugas Revisi ({studentRevisions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`pb-3 text-xs font-semibold transition-colors relative ${
              activeTab === 'riwayat'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Sesi Bimbingan ({studentSessions.length})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'revisi' && (
            <div className="space-y-3">
              {studentRevisions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">
                    Tidak ada tugas revisi yang tercatat
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Saat Anda mencatat bimbingan, Anda dapat memberikan tugas revisi beserta tenggat.
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
                          ? 'bg-indigo-50/40 border-indigo-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : isUploaded
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isVerified
                              ? '✓ Terverifikasi Selesai'
                              : isUploaded
                              ? 'Menunggu Verifikasi Dosen'
                              : 'Belum Dikerjakan'}
                          </span>
                          <span className="text-xs text-slate-500">
                            Tenggat: <strong className="text-slate-800 tabular-nums">{formatTanggalIndo(rev.tenggat)}</strong>
                          </span>
                        </div>

                        {/* Actions: AI Check + FR-5 Verification Action */}
                        <div className="flex items-center gap-2">
                          {!isVerified && rev.filePerbaikan && (
                            <button
                              type="button"
                              onClick={() => handleRunAiInspection(rev)}
                              disabled={loadingAiId === rev.id}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 rounded-md transition-colors flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>{loadingAiId === rev.id ? 'Memeriksa AI...' : 'Periksa AI (Agent 3)'}</span>
                            </button>
                          )}

                          {!isVerified && (
                            <div>
                              {verifyingRevisiId === rev.id ? (
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                  <input
                                    type="text"
                                    placeholder="Catatan verifikasi dosen..."
                                    value={catatanVerifikasi}
                                    onChange={(e) => setCatatanVerifikasi(e.target.value)}
                                    className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmVerification(rev.id)}
                                    className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                                  >
                                    Konfirmasi
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setVerifyingRevisiId(null)}
                                    className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setVerifyingRevisiId(rev.id)}
                                  className="px-3 py-1 text-xs font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-md transition-colors flex items-center gap-1.5"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Verifikasi Revisi (FR-5)</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-900 font-medium leading-relaxed">
                        {rev.deskripsi}
                      </p>

                      {/* Lampiran file perbaikan jika diunggah */}
                      {rev.filePerbaikan && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              Berkas Perbaikan Mahasiswa: {rev.filePerbaikan.namaFile} ({rev.filePerbaikan.ukuran})
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Diunggah: {rev.filePerbaikan.uploadedAt}
                            </span>
                          </div>
                          {rev.filePerbaikan.catatanMahasiswa && (
                            <p className="text-slate-600 italic text-[11px] bg-slate-50 p-2 rounded-sm border border-slate-100">
                              "{rev.filePerbaikan.catatanMahasiswa}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* AI Checklist Inspection Result (Agent 3) */}
                      {aiAnalysisMap[rev.id] && (
                        <div className="mt-3 p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 text-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                              Checklist Kepatuhan Revisi (Agent 3)
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-sm">
                              Dibuat oleh AI, perlu ditinjau dosen
                            </span>
                          </div>

                          <p className="text-slate-700 text-[11.5px] leading-relaxed">
                            {aiAnalysisMap[rev.id].ringkasan}
                          </p>

                          <div className="space-y-1.5 pt-1">
                            {aiAnalysisMap[rev.id].checklist.map((item, idx) => {
                              const isFulfilled = item.status === 'Tampak terpenuhi';
                              const isPartial = item.status === 'Sebagian';
                              return (
                                <div key={idx} className="p-2 bg-white rounded-lg border border-indigo-100 space-y-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-800 text-[11px]">
                                      {item.poin}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm shrink-0 ${
                                        isFulfilled
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : isPartial
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-500">
                                    {item.alasan}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          <p className="text-[10.5px] text-indigo-900/80 italic border-t border-indigo-200/60 pt-1.5">
                            Catatan: {aiAnalysisMap[rev.id].catatanUmum}
                          </p>
                        </div>
                      )}

                      {/* Verifikasi log */}
                      {isVerified && (
                        <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1.5 bg-emerald-50/60 p-2 rounded-md">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            Diverifikasi pada {rev.verifiedAt}. {rev.catatanDosen && `Catatan: "${rev.catatanDosen}"`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              {studentSessions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                  <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">
                    Belum ada sesi bimbingan tercatat
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Gunakan tombol "Catat Bimbingan Baru" untuk memulai log pertama.
                  </p>
                </div>
              ) : (
                studentSessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Sesi #{studentSessions.length - index}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-600 font-medium">
                          {formatTanggalIndo(session.tanggal)}
                        </span>
                      </div>
                      <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm font-medium">
                        Oleh: {student.pembimbing}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Topik Bahasan:
                      </span>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">
                        {session.topik}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Hasil Pembahasan & Catatan:
                      </span>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-md border border-slate-100">
                        {session.hasil}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
