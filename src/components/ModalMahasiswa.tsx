import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { Student, TahapSkripsi } from '../types';

interface ModalMahasiswaProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  onSave: (studentData: {
    id?: string;
    nama: string;
    nim: string;
    judul: string;
    tahap: TahapSkripsi;
    angkatan?: string;
    email?: string;
  }) => void;
}

export const ModalMahasiswa: React.FC<ModalMahasiswaProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  onSave,
}) => {
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [judul, setJudul] = useState('');
  const [tahap, setTahap] = useState<TahapSkripsi>('proposal');
  const [angkatan, setAngkatan] = useState('2022');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setNama(studentToEdit.nama);
      setNim(studentToEdit.nim);
      setJudul(studentToEdit.judul);
      setTahap(studentToEdit.tahap);
      setAngkatan(studentToEdit.angkatan || '2022');
      setEmail(studentToEdit.email || '');
    } else {
      setNama('');
      setNim('');
      setJudul('');
      setTahap('proposal');
      setAngkatan('2022');
      setEmail('');
    }
    setError('');
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama lengkap mahasiswa wajib diisi.');
      return;
    }
    if (!nim.trim()) {
      setError('Nomor Induk Mahasiswa (NIM) wajib diisi.');
      return;
    }
    if (!judul.trim()) {
      setError('Judul skripsi atau rencana penelitian wajib diisi.');
      return;
    }

    onSave({
      id: studentToEdit?.id,
      nama: nama.trim(),
      nim: nim.trim(),
      judul: judul.trim(),
      tahap,
      angkatan: angkatan.trim() || '2022',
      email: email.trim() || `${nim.trim().toLowerCase()}@student.ac.id`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {studentToEdit ? 'Ubah Data Mahasiswa' : 'Tambah Mahasiswa Bimbingan'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              FR-1: Kelola data mahasiswa, judul skripsi, dan tahap penyusunan.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Mahasiswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Muhammad Rian Pratama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIM <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 2201945"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahap Skripsi <span className="text-rose-500">*</span>
              </label>
              <select
                value={tahap}
                onChange={(e) => setTahap(e.target.value as TahapSkripsi)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="proposal">Proposal Skripsi</option>
                <option value="seminar">Seminar Hasil</option>
                <option value="sidang">Sidang Akhir</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Skripsi <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan judul lengkap skripsi atau topik penelitian..."
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Angkatan
              </label>
              <input
                type="text"
                placeholder="2022"
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Mahasiswa
              </label>
              <input
                type="email"
                placeholder="nama@student.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
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
              <Check className="w-4 h-4" />
              <span>{studentToEdit ? 'Simpan Perubahan' : 'Tambah Mahasiswa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
