import React, { useState } from 'react';
import { X, Calendar, ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Student } from '../types';
import { SYSTEM_TODAY } from '../utils/statusUtils';

interface ModalCatatBimbinganProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  preselectedStudentId?: string;
  onSave: (sessionData: {
    studentId: string;
    tanggal: string;
    topik: string;
    hasil: string;
    hasRevisi: boolean;
    revisiDeskripsi?: string;
    revisiTenggat?: string;
  }) => void;
}

export const ModalCatatBimbingan: React.FC<ModalCatatBimbinganProps> = ({
  isOpen,
  onClose,
  students,
  preselectedStudentId,
  onSave,
}) => {
  const [studentId, setStudentId] = useState(preselectedStudentId || (students[0]?.id ?? ''));
  const [tanggal, setTanggal] = useState(SYSTEM_TODAY);
  const [topik, setTopik] = useState('');
  const [hasil, setHasil] = useState('');
  const [hasRevisi, setHasRevisi] = useState(true);
  const [revisiDeskripsi, setRevisiDeskripsi] = useState('');
  const [revisiTenggat, setRevisiTenggat] = useState('2026-10-22'); // Default 7 hari ke depan
  const [error, setError] = useState('');

  // Keep student in sync if preselected changes
  React.useEffect(() => {
    if (preselectedStudentId) {
      setStudentId(preselectedStudentId);
    } else if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
    }
  }, [preselectedStudentId, students]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Pilih mahasiswa bimbingan.');
      return;
    }
    if (!tanggal) {
      setError('Isi tanggal pelaksanaan bimbingan.');
      return;
    }
    if (!topik.trim()) {
      setError('Isi topik atau bab yang dibahas.');
      return;
    }
    if (!hasil.trim()) {
      setError('Isi hasil pembahasan atau catatan bimbingan.');
      return;
    }
    if (hasRevisi) {
      if (!revisiDeskripsi.trim()) {
        setError('Tuliskan deskripsi tugas revisi untuk mahasiswa.');
        return;
      }
      if (!revisiTenggat) {
        setError('Tentukan batas waktu (tenggat) pengumpulan revisi.');
        return;
      }
    }

    setError('');
    onSave({
      studentId,
      tanggal,
      topik: topik.trim(),
      hasil: hasil.trim(),
      hasRevisi,
      revisiDeskripsi: hasRevisi ? revisiDeskripsi.trim() : undefined,
      revisiTenggat: hasRevisi ? revisiTenggat : undefined,
    });

    // Reset inputs
    setTopik('');
    setHasil('');
    setRevisiDeskripsi('');
    onClose();
  };

  const setQuickDeadlineDays = (days: number) => {
    const base = new Date('2026-10-15');
    base.setDate(base.getDate() + days);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const d = String(base.getDate()).padStart(2, '0');
    setRevisiTenggat(`${y}-${m}-${d}`);
  };

  const selectedStudent = students.find((s) => s.id === studentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Catat Sesi Bimbingan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              FR-2: Rekam tanggal, hasil bimbingan, serta tugaskan revisi dengan tenggat jelas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Mahasiswa Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mahasiswa Bimbingan <span className="text-rose-500">*</span>
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={!!preselectedStudentId}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100"
            >
              {students.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} — NIM {m.nim} ({m.tahap.toUpperCase()})
                </option>
              ))}
            </select>
            {selectedStudent && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                Judul: {selectedStudent.judul}
              </p>
            )}
          </div>

          {/* Tanggal Pelaksanaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Bimbingan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topik / Bab yang Dibahas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Misal: Review Bab 4 Hasil Pengujian atau Metodologi"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Hasil Pembahasan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hasil Pembahasan & Catatan Dosen <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan poin arahan, masukan perbaikan naskah, atau persetujuan untuk tahap berikutnya..."
              value={hasil}
              onChange={(e) => setHasil(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
            />
          </div>

          {/* Section Tugas Revisi */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasRevisi}
                  onChange={(e) => setHasRevisi(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Ada Tugas Revisi untuk Mahasiswa
                </span>
              </label>
              <span className="text-[11px] text-slate-500">
                Otomatis memicu pelacakan tenggat (FR-3)
              </span>
            </div>

            {hasRevisi && (
              <div className="pt-2 space-y-3 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Deskripsi Tugas Revisi <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Deskripsikan secara spesifik hal yang perlu diperbaiki (contoh: Perbaiki tabel komparasi akurasi dan sertakan matriks kebingungan)..."
                    value={revisiDeskripsi}
                    onChange={(e) => setRevisiDeskripsi(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700">
                      Batas Tenggat Revisi <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Pilihan cepat:</span>
                      <button
                        type="button"
                        onClick={() => setQuickDeadlineDays(3)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-sm"
                      >
                        +3 hari
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDeadlineDays(7)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-sm"
                      >
                        +7 hari
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDeadlineDays(14)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-sm"
                      >
                        +14 hari
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={revisiTenggat}
                    onChange={(e) => setRevisiTenggat(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Sesi Bimbingan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
