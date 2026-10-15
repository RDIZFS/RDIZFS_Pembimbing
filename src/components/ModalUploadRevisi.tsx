import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { RevisiTask } from '../types';
import { formatTanggalIndo } from '../utils/statusUtils';

interface ModalUploadRevisiProps {
  isOpen: boolean;
  onClose: () => void;
  revisi: RevisiTask | null;
  onUpload: (revisiId: string, uploadData: {
    namaFile: string;
    ukuran: string;
    catatanMahasiswa: string;
  }) => void;
}

export const ModalUploadRevisi: React.FC<ModalUploadRevisiProps> = ({
  isOpen,
  onClose,
  revisi,
  onUpload,
}) => {
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !revisi) return null;

  const handleSimulateFileSelect = (name: string, size: string) => {
    setSelectedFileName(name);
    setFileSize(size);
    setError('');
  };

  const handleRealFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeInMb} MB`);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFileName = selectedFileName.trim() || 'Naskah_Revisi_Perbaikan.pdf';
    
    onUpload(revisi.id, {
      namaFile: finalFileName,
      ukuran: fileSize,
      catatanMahasiswa: catatan.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Unggah File Perbaikan Revisi</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              FR-4: Kirimkan dokumen perbaikan agar dapat diperiksa & diverifikasi oleh Dosen.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Details Summary */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <span className="font-semibold text-slate-700 block">Tugas Revisi dari Dosen:</span>
            <p className="text-slate-900 leading-relaxed font-medium">"{revisi.deskripsi}"</p>
            <div className="flex items-center gap-2 text-slate-500 pt-1 text-[11px]">
              <span>Tenggat pengumpulan:</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                {formatTanggalIndo(revisi.tenggat)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Berkas Naskah Perbaikan (PDF / DOCX)
              </label>
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleRealFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept=".pdf,.docx,.doc,.zip"
                />
                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">
                  {selectedFileName ? selectedFileName : 'Klik atau seret file dokumen ke sini'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format didukung: PDF, DOCX, ZIP (Maks 25 MB)
                </p>
              </div>

              {/* Quick sample pickers */}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                <span>Atau gunakan nama file sampel:</span>
                <button
                  type="button"
                  onClick={() => handleSimulateFileSelect('Perbaikan_Skripsi_Bab_Lengkap_Revisi.pdf', '3.2 MB')}
                  className="text-indigo-600 hover:underline bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-sm"
                >
                  Naskah_Bab_Revisi.pdf
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateFileSelect('Lampiran_Hasil_Pengujian_Data.docx', '1.1 MB')}
                  className="text-indigo-600 hover:underline bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-sm"
                >
                  Lampiran_Pengujian.docx
                </button>
              </div>
            </div>

            {/* Catatan Mahasiswa */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Mahasiswa untuk Pembimbing
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan ringkasan bagian mana saja yang telah diperbaiki..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
              />
            </div>

            {/* Actions */}
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
                <span>Kirimkan Perbaikan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
