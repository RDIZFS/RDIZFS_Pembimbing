/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DosenDashboard } from './components/DosenDashboard';
import { MahasiswaView } from './components/MahasiswaView';
import { ModalCatatBimbingan } from './components/ModalCatatBimbingan';
import { ModalMahasiswa } from './components/ModalMahasiswa';
import { ModalUploadRevisi } from './components/ModalUploadRevisi';
import { ModalDetailMahasiswa } from './components/ModalDetailMahasiswa';
import {
  INITIAL_STUDENTS,
  INITIAL_SESSIONS,
  INITIAL_REVISIONS,
  DOSEN_NAME,
} from './data/initialData';
import {
  GuidanceSession,
  RevisiTask,
  Role,
  Student,
  TahapSkripsi,
} from './types';
import { CheckCircle2, Info } from 'lucide-react';

const STORAGE_KEY_STUDENTS = 'bimbingan_skripsi_upi_students_v2';
const STORAGE_KEY_SESSIONS = 'bimbingan_skripsi_upi_sessions_v2';
const STORAGE_KEY_REVISIONS = 'bimbingan_skripsi_upi_revisions_v2';

export default function App() {
  // Roles & View State
  const [currentRole, setCurrentRole] = useState<Role>('dosen');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('mhs-6'); // Default to Siti (has uploaded revision)

  // Core Data loaded from localStorage or initialized from dummy data
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [sessions, setSessions] = useState<GuidanceSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [revisions, setRevisions] = useState<RevisiTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVISIONS);
      return saved ? JSON.parse(saved) : INITIAL_REVISIONS;
    } catch {
      return INITIAL_REVISIONS;
    }
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(revisions));
  }, [revisions]);

  // Modal States
  const [isCatatBimbinganOpen, setIsCatatBimbinganOpen] = useState(false);
  const [catatBimbinganStudentId, setCatatBimbinganStudentId] = useState<string | undefined>();

  const [isMahasiswaModalOpen, setIsMahasiswaModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  const [isUploadRevisiOpen, setIsUploadRevisiOpen] = useState(false);
  const [revisiToUpload, setRevisiToUpload] = useState<RevisiTask | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Reset to default dummy data
  const handleResetData = () => {
    if (window.confirm('Reset data ke kondisi awal dummy (9 mahasiswa, sesi bimbingan, dan revisi)?')) {
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
      localStorage.removeItem(STORAGE_KEY_REVISIONS);
      setStudents(INITIAL_STUDENTS);
      setSessions(INITIAL_SESSIONS);
      setRevisions(INITIAL_REVISIONS);
      setSelectedStudentId(INITIAL_STUDENTS[0].id);
      setIsDetailModalOpen(false);
      showNotification('Data prototipe telah berhasil dikembalikan ke bawaan.', 'info');
    }
  };

  // FR-1: Add or Edit Student
  const handleSaveStudent = (data: {
    id?: string;
    nama: string;
    nim: string;
    judul: string;
    tahap: TahapSkripsi;
    angkatan?: string;
    email?: string;
  }) => {
    if (data.id) {
      // Edit
      setStudents((prev) =>
        prev.map((s) =>
          s.id === data.id
            ? {
                ...s,
                nama: data.nama,
                nim: data.nim,
                judul: data.judul,
                tahap: data.tahap,
                angkatan: data.angkatan || s.angkatan,
                email: data.email || s.email,
              }
            : s
        )
      );
      if (detailStudent && detailStudent.id === data.id) {
        setDetailStudent((prev) => (prev ? { ...prev, ...data } : null));
      }
      showNotification(`Data mahasiswa ${data.nama} berhasil diperbarui.`);
    } else {
      // Add new
      const newStudent: Student = {
        id: `mhs-${Date.now()}`,
        nama: data.nama,
        nim: data.nim,
        judul: data.judul,
        tahap: data.tahap,
        angkatan: data.angkatan || '2022',
        email: data.email || `${data.nim}@upi.edu`,
        pembimbing: DOSEN_NAME,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setStudents((prev) => [newStudent, ...prev]);
      showNotification(`Mahasiswa baru ${newStudent.nama} berhasil ditambahkan ke daftar bimbingan.`);
    }
  };

  // FR-2: Record Guidance Session & create task if requested
  const handleSaveSession = (sessionData: {
    studentId: string;
    tanggal: string;
    topik: string;
    hasil: string;
    hasRevisi: boolean;
    revisiDeskripsi?: string;
    revisiTenggat?: string;
  }) => {
    const newSessionId = `ses-${Date.now()}`;
    const newSession: GuidanceSession = {
      id: newSessionId,
      studentId: sessionData.studentId,
      tanggal: sessionData.tanggal,
      topik: sessionData.topik,
      hasil: sessionData.hasil,
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);

    if (sessionData.hasRevisi && sessionData.revisiDeskripsi && sessionData.revisiTenggat) {
      const newRevisi: RevisiTask = {
        id: `rev-${Date.now()}`,
        studentId: sessionData.studentId,
        sessionId: newSessionId,
        deskripsi: sessionData.revisiDeskripsi,
        tenggat: sessionData.revisiTenggat,
        status: 'belum_dikerjakan',
      };
      setRevisions((prev) => [newRevisi, ...prev]);
    }

    const studentObj = students.find((s) => s.id === sessionData.studentId);
    showNotification(
      `Sesi bimbingan untuk ${studentObj ? studentObj.nama : 'mahasiswa'} berhasil dicatat. Status diperbarui otomatis.`
    );
  };

  // FR-4: Student uploads revision
  const handleUploadRevisi = (
    revisiId: string,
    uploadData: {
      namaFile: string;
      ukuran: string;
      catatanMahasiswa: string;
    }
  ) => {
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setRevisions((prev) =>
      prev.map((r) =>
        r.id === revisiId
          ? {
              ...r,
              status: 'diunggah',
              filePerbaikan: {
                namaFile: uploadData.namaFile,
                ukuran: uploadData.ukuran,
                uploadedAt: formattedNow,
                catatanMahasiswa: uploadData.catatanMahasiswa,
              },
            }
          : r
      )
    );

    showNotification(
      `Berkas revisi "${uploadData.namaFile}" berhasil dikirim ke dosen pembimbing untuk diverifikasi.`
    );
  };

  // FR-5: Lecturer verifies revision
  const handleVerifyRevision = (revisiId: string, catatanDosen?: string) => {
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setRevisions((prev) =>
      prev.map((r) =>
        r.id === revisiId
          ? {
              ...r,
              status: 'terverifikasi',
              verifiedAt: formattedNow,
              catatanDosen: catatanDosen || 'Telah diperiksa dan disetujui.',
            }
          : r
      )
    );

    showNotification('Revisi mahasiswa telah diverifikasi dan ditandai selesai (FR-5).');
  };

  // Quick action from dosen
  const handleQuickVerify = (revisiId: string) => {
    handleVerifyRevision(revisiId, 'Verifikasi cepat dari dasbor.');
  };

  const handleOpenCatatBimbingan = (studentId?: string) => {
    setCatatBimbinganStudentId(studentId);
    setIsCatatBimbinganOpen(true);
  };

  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsMahasiswaModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsMahasiswaModalOpen(true);
  };

  const handleSelectStudentDetail = (student: Student) => {
    setDetailStudent(student);
    setIsDetailModalOpen(true);
  };

  // Active student for student view
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Top Bar Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        selectedStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
        students={students}
        onResetData={handleResetData}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2.5 max-w-md transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'dosen' ? (
          <DosenDashboard
            students={students}
            sessions={sessions}
            revisions={revisions}
            onOpenAddStudent={handleOpenAddStudent}
            onOpenEditStudent={handleOpenEditStudent}
            onOpenCatatBimbingan={handleOpenCatatBimbingan}
            onSelectStudentDetail={handleSelectStudentDetail}
            onQuickVerifyRevision={handleQuickVerify}
          />
        ) : (
          <MahasiswaView
            student={activeStudent}
            sessions={sessions}
            revisions={revisions}
            onOpenUploadRevisi={(rev) => {
              setRevisiToUpload(rev);
              setIsUploadRevisiOpen(true);
            }}
            students={students}
            onSwitchStudent={(id) => setSelectedStudentId(id)}
          />
        )}
      </main>

      {/* Modal: Catat Sesi Bimbingan (FR-2) */}
      <ModalCatatBimbingan
        isOpen={isCatatBimbinganOpen}
        onClose={() => setIsCatatBimbinganOpen(false)}
        students={students}
        preselectedStudentId={catatBimbinganStudentId}
        onSave={handleSaveSession}
      />

      {/* Modal: Tambah / Ubah Mahasiswa (FR-1) */}
      <ModalMahasiswa
        isOpen={isMahasiswaModalOpen}
        onClose={() => setIsMahasiswaModalOpen(false)}
        studentToEdit={studentToEdit}
        onSave={handleSaveStudent}
      />

      {/* Modal: Unggah Berkas Perbaikan Revisi Mahasiswa (FR-4) */}
      <ModalUploadRevisi
        isOpen={isUploadRevisiOpen}
        onClose={() => {
          setIsUploadRevisiOpen(false);
          setRevisiToUpload(null);
        }}
        revisi={revisiToUpload}
        onUpload={handleUploadRevisi}
      />

      {/* Modal: Detail Profil & Log Mahasiswa untuk Dosen (FR-1, FR-2, FR-5) */}
      <ModalDetailMahasiswa
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailStudent(null);
        }}
        student={detailStudent}
        sessions={sessions}
        revisions={revisions}
        onOpenCatatBimbingan={(studentId) => {
          setIsDetailModalOpen(false);
          handleOpenCatatBimbingan(studentId);
        }}
        onOpenEditStudent={(student) => {
          setIsDetailModalOpen(false);
          handleOpenEditStudent(student);
        }}
        onVerifyRevision={handleVerifyRevision}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Prototipe Dashboard Pemantauan Bimbingan Skripsi · Hak Akses Peran Terpisah (Dosen & Mahasiswa)
          </span>
          <span className="text-slate-400">
            Sistem Evaluasi Status Otomatis & Pelacakan Revisi (FR-1 s/d FR-5)
          </span>
        </div>
      </footer>

    </div>
  );
}
