import React, { useState, useMemo } from 'react';
import {
  Bot,
  Send,
  Edit3,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileCheck2,
  Calendar,
  RefreshCw,
  History,
  ShieldCheck,
  ChevronRight,
  Info,
  Check,
  X,
  User,
  BookOpen,
} from 'lucide-react';
import {
  AgentLogEntry,
  AgentName,
  GuidanceSession,
  KeputusanDosen,
  ReminderDraft,
  RevisionAnalysis,
  RevisiTask,
  Student,
  WeeklyBriefing,
} from '../types';
import {
  formatTanggalIndo,
  getStatusBadgeStyle,
  getTahapLabel,
  hitungStatusMahasiswa,
  SYSTEM_TODAY,
} from '../utils/statusUtils';

interface AsistenAIViewProps {
  students: Student[];
  sessions: GuidanceSession[];
  revisions: RevisiTask[];
  agentLogs: AgentLogEntry[];
  onAddAgentLog: (log: Omit<AgentLogEntry, 'id' | 'timestamp'>) => void;
  onVerifyRevision: (revisiId: string, catatanDosen?: string) => void;
  onSelectStudentDetail: (student: Student) => void;
}

export const AsistenAIView: React.FC<AsistenAIViewProps> = ({
  students,
  sessions,
  revisions,
  agentLogs,
  onAddAgentLog,
  onVerifyRevision,
  onSelectStudentDetail,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pengingat' | 'briefing' | 'pemeriksa' | 'logs'>('pengingat');

  // ==========================================
  // AGENT 1: PENGINGAT PROAKTIF STATE
  // ==========================================
  const [reminderDrafts, setReminderDrafts] = useState<ReminderDraft[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [editingDraft, setEditingDraft] = useState<ReminderDraft | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editMessage, setEditMessage] = useState('');

  // Identifikasi mahasiswa yang membutuhkan perhatian/terlambat
  const targetStudentsForReminder = useMemo(() => {
    return students
      .map((student) => {
        const detail = hitungStatusMahasiswa(student.id, sessions, revisions);
        const studentRevs = revisions.filter((r) => r.studentId === student.id && r.status !== 'terverifikasi');
        const overdueRev = studentRevs.find((r) => r.tenggat < SYSTEM_TODAY);
        const nearRev = studentRevs.find((r) => r.tenggat >= SYSTEM_TODAY);
        const activeRev = overdueRev || nearRev || studentRevs[0];

        return {
          student,
          statusDetail: detail,
          activeRevision: activeRev,
        };
      })
      .filter((item) => item.statusDetail.status === 'Terlambat' || item.statusDetail.status === 'Perlu perhatian');
  }, [students, sessions, revisions]);

  // Generate / Refresh Reminder Drafts via Gemini API
  const handleGenerateReminders = async () => {
    setLoadingReminders(true);
    try {
      const payloadStudents = targetStudentsForReminder.map((item) => ({
        id: item.student.id,
        nama: item.student.nama,
        nim: item.student.nim,
        judul: item.student.judul,
        status: item.statusDetail.status,
        hariBimbingan: item.statusDetail.hariSejakBimbinganTerakhir,
        revisiDeskripsi: item.activeRevision?.deskripsi || 'Penyempurnaan draf bab skripsi',
        tenggat: item.activeRevision ? formatTanggalIndo(item.activeRevision.tenggat) : 'segera',
      }));

      const res = await fetch('/api/agents/pengingat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: payloadStudents }),
      });

      const data = await res.json();
      if (data.drafts && Array.isArray(data.drafts)) {
        setReminderDrafts(
          data.drafts.map((d: any) => ({
            ...d,
            statusPengiriman: 'menunggu',
          }))
        );
      }
    } catch (err) {
      console.error('Error generating reminders:', err);
    } finally {
      setLoadingReminders(false);
    }
  };

  // Setujui & Kirim (Simulasi)
  const handleApproveSend = (draft: ReminderDraft) => {
    setReminderDrafts((prev) =>
      prev.map((d) => (d.studentId === draft.studentId ? { ...d, statusPengiriman: 'terkirim' } : d))
    );

    const mhs = students.find((s) => s.id === draft.studentId);
    onAddAgentLog({
      agentName: 'Pengingat Proaktif',
      action: `Pengiriman draf pesan pengingat bimbingan ke ${draft.nama}`,
      targetStudent: `${draft.nama} (${draft.nim})`,
      reason: `Mahasiswa berstatus ${draft.urgensi === 'Tinggi' ? 'Terlambat' : 'Perlu perhatian'}, bimbingan stagnan atau mendekati batas tenggat`,
      decision: 'Disetujui & Terkirim',
      notes: `Subjek: "${draft.subjek}". Disetujui dosen tanpa perubahan teks.`,
    });
  };

  // Tolak Pengingat
  const handleRejectReminder = (draft: ReminderDraft) => {
    setReminderDrafts((prev) =>
      prev.map((d) => (d.studentId === draft.studentId ? { ...d, statusPengiriman: 'ditolak' } : d))
    );

    onAddAgentLog({
      agentName: 'Pengingat Proaktif',
      action: `Pembatalan draf pengingat untuk ${draft.nama}`,
      targetStudent: `${draft.nama} (${draft.nim})`,
      reason: 'Dosen memutuskan untuk tidak mengirimkan pengingat otomatis saat ini',
      decision: 'Ditolak',
      notes: 'Draf ditolak oleh dosen pembimbing.',
    });
  };

  // Simpan Edit & Kirim
  const handleSaveEditSend = () => {
    if (!editingDraft) return;

    setReminderDrafts((prev) =>
      prev.map((d) =>
        d.studentId === editingDraft.studentId
          ? {
              ...d,
              subjek: editSubject,
              pesan: editMessage,
              statusPengiriman: 'terkirim',
            }
          : d
      )
    );

    onAddAgentLog({
      agentName: 'Pengingat Proaktif',
      action: `Pengiriman pesan pengingat hasil edit dosen ke ${editingDraft.nama}`,
      targetStudent: `${editingDraft.nama} (${editingDraft.nim})`,
      reason: 'Dosen menyesuaikan instruksi kalimat dan arahan sebelum dikirimkan ke mahasiswa',
      decision: 'Diedit & Terkirim',
      notes: `Pesan telah disunting oleh dosen pembimbing sebelum dikirimkan. Subjek baru: "${editSubject}".`,
    });

    setEditingDraft(null);
  };

  // ==========================================
  // AGENT 2: BRIEFING MINGGUAN STATE
  // ==========================================
  const [briefing, setBriefing] = useState<WeeklyBriefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  const studentCounts = useMemo(() => {
    let aman = 0;
    let perhatian = 0;
    let terlambat = 0;

    for (const s of students) {
      const st = hitungStatusMahasiswa(s.id, sessions, revisions).status;
      if (st === 'Aman') aman++;
      else if (st === 'Perlu perhatian') perhatian++;
      else if (st === 'Terlambat') terlambat++;
    }

    return { total: students.length, aman, perhatian, terlambat };
  }, [students, sessions, revisions]);

  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const studentsPayload = students.map((s) => {
        const detail = hitungStatusMahasiswa(s.id, sessions, revisions);
        const sRevs = revisions.filter((r) => r.studentId === s.id);
        const pending = sRevs.filter((r) => r.status === 'belum_dikerjakan');
        const uploaded = sRevs.filter((r) => r.status === 'diunggah');

        return {
          id: s.id,
          nama: s.nama,
          nim: s.nim,
          tahap: s.tahap,
          judul: s.judul,
          status: detail.status,
          alasanStatus: detail.alasan,
          hariBimbinganTerakhir: detail.hariSejakBimbinganTerakhir,
          pendingRevisiCount: pending.length,
          uploadedRevisiCount: uploaded.length,
          tugasTertunggak: pending.map((p) => `${p.deskripsi} (tenggat ${p.tenggat})`),
        };
      });

      const res = await fetch('/api/agents/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentsData: studentsPayload,
          counts: studentCounts,
        }),
      });

      const data = await res.json();
      if (data.briefing) {
        setBriefing({
          ...data.briefing,
          generatedAt: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });

        onAddAgentLog({
          agentName: 'Briefing Mingguan',
          action: 'Pembuatan laporan briefing mingguan portofolio skripsi',
          reason: `Analisis terhadap ${students.length} mahasiswa (${studentCounts.terlambat} terlambat, ${studentCounts.perhatian} perlu perhatian)`,
          decision: 'Ditinjau',
          notes: 'Briefing berhasil disusun oleh Gemini AI dan siap ditindaklanjuti oleh dosen.',
        });
      }
    } catch (err) {
      console.error('Error in handleGenerateBriefing:', err);
    } finally {
      setLoadingBriefing(false);
    }
  };

  // ==========================================
  // AGENT 3: PEMERIKSA REVISI STATE
  // ==========================================
  const [selectedStudentForReview, setSelectedStudentForReview] = useState<string>(students[0]?.id || '');
  const [selectedRevisionId, setSelectedRevisionId] = useState<string>('');
  const [customRevisionText, setCustomRevisionText] = useState('');
  const [customSubmissionText, setCustomSubmissionText] = useState('');
  const [revisionAnalysis, setRevisionAnalysis] = useState<RevisionAnalysis | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Revisions for selected student
  const studentRevisionsForReview = useMemo(() => {
    return revisions.filter((r) => r.studentId === selectedStudentForReview);
  }, [revisions, selectedStudentForReview]);

  // Saat ganti mahasiswa, pilih revisi pertama yang ada
  const handleSelectStudentForReview = (studentId: string) => {
    setSelectedStudentForReview(studentId);
    const revs = revisions.filter((r) => r.studentId === studentId);
    if (revs.length > 0) {
      setSelectedRevisionId(revs[0].id);
      setCustomRevisionText(revs[0].deskripsi);
      setCustomSubmissionText(revs[0].filePerbaikan?.catatanMahasiswa || 'Dokumen naskah perbaikan telah diunggah mahasiswa.');
    } else {
      setSelectedRevisionId('');
      setCustomRevisionText('');
      setCustomSubmissionText('');
    }
    setRevisionAnalysis(null);
  };

  const handleSelectSpecificRevision = (revisiId: string) => {
    setSelectedRevisionId(revisiId);
    const rev = revisions.find((r) => r.id === revisiId);
    if (rev) {
      setCustomRevisionText(rev.deskripsi);
      setCustomSubmissionText(
        rev.filePerbaikan?.catatanMahasiswa
          ? `Berkas: ${rev.filePerbaikan.namaFile}\nCatatan Mahasiswa: ${rev.filePerbaikan.catatanMahasiswa}`
          : 'Dokumen naskah perbaikan telah diunggah oleh mahasiswa.'
      );
    }
    setRevisionAnalysis(null);
  };

  const handleRunRevisionCheck = async () => {
    if (!customRevisionText.trim()) return;

    setLoadingReview(true);
    const targetStudent = students.find((s) => s.id === selectedStudentForReview);

    try {
      const res = await fetch('/api/agents/pemeriksa-revisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tugasRevisi: customRevisionText,
          namaMahasiswa: targetStudent?.nama,
          judulSkripsi: targetStudent?.judul,
          catatanMahasiswa: customSubmissionText,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setRevisionAnalysis({
          ...data.analysis,
          tugasRevisi: customRevisionText,
          namaMahasiswa: targetStudent?.nama,
          generatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        });

        onAddAgentLog({
          agentName: 'Pemeriksa Revisi',
          action: `Pemeriksaan checklist kepatuhan tugas revisi ${targetStudent?.nama || 'Mahasiswa'}`,
          targetStudent: targetStudent ? `${targetStudent.nama} (${targetStudent.nim})` : undefined,
          reason: 'Evaluasi kesesuaian catatan perbaikan mahasiswa terhadap instruksi revisi bimbingan',
          decision: 'Ditinjau',
          notes: 'AI menghasilkan checklist kriteria. Verifikasi resmi tetap menunggu persetujuan dosen.',
        });
      }
    } catch (err) {
      console.error('Error in handleRunRevisionCheck:', err);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleVerifyCurrentRevisionOfficial = () => {
    if (!selectedRevisionId) return;
    const rev = revisions.find((r) => r.id === selectedRevisionId);
    const mhs = students.find((s) => s.id === selectedStudentForReview);

    onVerifyRevision(
      selectedRevisionId,
      'Diverifikasi resmi oleh dosen pembimbing setelah meninjau berkas naskah dan checklist rekomendasi AI.'
    );

    onAddAgentLog({
      agentName: 'Pemeriksa Revisi',
      action: `Verifikasi resmi revisi skripsi ${mhs?.nama || ''}`,
      targetStudent: mhs ? `${mhs.nama} (${mhs.nim})` : undefined,
      reason: 'Dosen meninjau kepatuhan revisi dan menyetujui hasil perbaikan naskah',
      decision: 'Diverifikasi',
      notes: 'Status tugas revisi resmi berubah menjadi Terverifikasi (FR-5).',
    });
  };

  // Filter logs by Agent Name
  const [logAgentFilter, setLogAgentFilter] = useState<'Semua' | AgentName>('Semua');
  const filteredLogs = useMemo(() => {
    if (logAgentFilter === 'Semua') return agentLogs;
    return agentLogs.filter((l) => l.agentName === logAgentFilter);
  }, [agentLogs, logAgentFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner Asisten AI */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Asisten AI Dosen Pembimbing Skripsi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Pusat Otomasi & Analitik Bimbingan
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Didukung model Gemini 3.8 Flash untuk membantu Ibu <strong>Ratu Dintha Insyani Zukhruf FS, S.Pd., M.M</strong> dalam memantau ritme bimbingan, menyusun pengingat proaktif, dan memeriksa kelengkapan perbaikan naskah.
          </p>
        </div>

        {/* Anti-Slop Strict Label Requirement */}
        <div className="mt-4 pt-3 border-t border-indigo-700/50 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-200">
          <span className="inline-flex items-center gap-1.5 font-medium bg-black/20 px-2.5 py-1 rounded-md">
            <Info className="w-3.5 h-3.5 text-amber-300" />
            <strong>Aturan Mutlak:</strong> Seluruh tindakan berdampak wajib disetujui dosen sebelum dieksekusi.
          </span>
          <span className="text-[11px] text-indigo-300">
            Prompt sistem terisolasi · Tanpa pengiriman data ke layanan luar
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button
            type="button"
            onClick={() => setActiveSubTab('pengingat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'pengingat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Agent 1: Pengingat Proaktif</span>
            {targetStudentsForReminder.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeSubTab === 'pengingat' ? 'bg-indigo-800 text-white' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {targetStudentsForReminder.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('briefing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'briefing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent 2: Briefing Mingguan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('pemeriksa')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'pemeriksa'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Agent 3: Pemeriksa Revisi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Aktivitas Agent</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === 'logs' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {agentLogs.length}
            </span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: AGENT 1 - PENGINGAT PROAKTIF                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'pengingat' && (
        <div className="space-y-5">
          {/* Action Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Agent 1: Pengingat Proaktif
                </span>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded-sm">
                  Dibuat oleh AI, perlu ditinjau dosen
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Agent memindai mahasiswa berstatus <strong>Terlambat</strong> (&gt;30 hari bimbingan) atau <strong>Perlu perhatian</strong> (&le;3 hari tenggat) dan menyusun draf pesan personal yang sopan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateReminders}
              disabled={loadingReminders || targetStudentsForReminder.length === 0}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingReminders ? 'animate-spin' : ''}`} />
              <span>{loadingReminders ? 'Menganalisis & Menyusun Draf...' : 'Susun Draf Pengingat AI'}</span>
            </button>
          </div>

          {/* Target Student Count Banner */}
          <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-700">
              Terdeteksi <strong>{targetStudentsForReminder.length} mahasiswa</strong> yang memerlukan pengingat bimbingan.
            </span>
            <span className="text-[11px] text-slate-500">
              Pengiriman hanya disimulasikan dan dicatat pada log aktivitas tanpa keluar jaringan.
            </span>
          </div>

          {/* Draf Cards List */}
          {reminderDrafts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
              <Bot className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Draf Pesan Belum Dibuat</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol <strong>"Susun Draf Pengingat AI"</strong> di atas. Model Gemini akan memproses data bimbingan dan menyiapkan draf pesan untuk Anda tinjau.
              </p>
              <button
                type="button"
                onClick={handleGenerateReminders}
                disabled={loadingReminders}
                className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jalankan Agent 1 Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminderDrafts.map((draft) => {
                const isSent = draft.statusPengiriman === 'terkirim';
                const isRejected = draft.statusPengiriman === 'ditolak';

                return (
                  <div
                    key={draft.studentId}
                    className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                      isSent
                        ? 'bg-emerald-50/40 border-emerald-200 opacity-90'
                        : isRejected
                        ? 'bg-slate-100/60 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Tag & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{draft.nama}</span>
                          <span className="text-[11px] text-slate-500 tabular-nums">NIM {draft.nim}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            isSent
                              ? 'bg-emerald-100 text-emerald-800'
                              : isRejected
                              ? 'bg-slate-200 text-slate-700'
                              : draft.urgensi === 'Tinggi'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isSent ? '✓ Terkirim (Simulasi)' : isRejected ? 'Ditolak' : `Urgensi: ${draft.urgensi}`}
                        </span>
                      </div>

                      {/* AI Notice Badge */}
                      <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm inline-block font-medium">
                        Dibuat oleh AI, perlu ditinjau dosen
                      </div>

                      {/* Subjek */}
                      <div className="text-xs">
                        <span className="text-slate-500 font-semibold block text-[11px]">Subjek Pesan:</span>
                        <p className="font-semibold text-slate-900 mt-0.5">{draft.subjek}</p>
                      </div>

                      {/* Pesan */}
                      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono text-[11.5px]">
                        {draft.pesan}
                      </div>
                    </div>

                    {/* Dosen Decision Controls (Human in the loop) */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                      {isSent ? (
                        <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 py-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Pesan telah disetujui & tercatat di Log Aktivitas.</span>
                        </div>
                      ) : isRejected ? (
                        <div className="text-xs text-slate-500 italic py-1">
                          Draf pengingat ditolak oleh dosen.
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRejectReminder(draft)}
                            className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDraft(draft);
                                setEditSubject(draft.subjek);
                                setEditMessage(draft.pesan);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Draf</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApproveSend(draft)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Setujui & Kirim</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Edit Draf Pesan */}
          {editingDraft && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden space-y-4 p-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Sunting Draf Pengingat: {editingDraft.nama}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sesuaikan kata-kata arahan sebelum mengirimkan secara resmi.
                    </p>
                  </div>
                  <button onClick={() => setEditingDraft(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subjek Pesan</label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Isi Pesan Pengingat</label>
                    <textarea
                      rows={7}
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-[11.5px]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDraft(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditSend}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan & Setujui Kirim</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: AGENT 2 - BRIEFING MINGGUAN                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'briefing' && (
        <div className="space-y-5">
          {/* Action Trigger Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Agent 2: Analisis Portofolio & Briefing Mingguan
                </span>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded-sm">
                  Dibuat oleh AI, perlu ditinjau dosen
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Menganalisis seluruh portofolio 9 mahasiswa dan mengekstrak <strong>3 mahasiswa prioritas tertinggi minggu ini</strong> berdasarkan data konkret keterlambatan dan tenggat revisi.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateBriefing}
              disabled={loadingBriefing}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingBriefing ? 'animate-spin' : ''}`} />
              <span>{loadingBriefing ? 'Menghitung Analisis...' : 'Buat Briefing Minggu Ini'}</span>
            </button>
          </div>

          {/* Kondisi Bimbingan Saat Ini (Summary Bar) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Mahasiswa</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{studentCounts.total}</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase">Status Aman</span>
              <p className="text-xl font-bold text-emerald-800 mt-0.5 tabular-nums">{studentCounts.aman}</p>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[11px] font-semibold text-amber-700 uppercase">Perlu Perhatian</span>
              <p className="text-xl font-bold text-amber-800 mt-0.5 tabular-nums">{studentCounts.perhatian}</p>
            </div>
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[11px] font-semibold text-rose-700 uppercase">Terlambat</span>
              <p className="text-xl font-bold text-rose-800 mt-0.5 tabular-nums">{studentCounts.terlambat}</p>
            </div>
          </div>

          {/* Briefing Output Content */}
          {!briefing ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
              <Bot className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Briefing Mingguan Belum Dibuat</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol <strong>"Buat Briefing Minggu Ini"</strong> untuk mengekstrak ringkasan komprehensif dan 3 mahasiswa yang membutuhkan intervensi segera.
              </p>
              <button
                type="button"
                onClick={handleGenerateBriefing}
                disabled={loadingBriefing}
                className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Susun Analisis Briefing Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Executive Summary Paragraph */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Ringkasan Dinamika Bimbingan Minggu Ini</span>
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm font-medium">
                      Dibuat oleh AI, perlu ditinjau dosen
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Dihasilkan: {briefing.generatedAt}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {briefing.analisisKeseluruhan}
                </p>
                {briefing.rekomendasiJadwal && (
                  <p className="text-xs text-indigo-700 font-medium pt-1">
                    💡 <strong>Saran Alokasi Waktu:</strong> {briefing.rekomendasiJadwal}
                  </p>
                )}
              </div>

              {/* 3 Prioritas Mahasiswa Minggu Ini */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    3 Mahasiswa Prioritas Tertinggi Minggu Ini
                  </h3>
                  <span className="text-xs text-slate-500">
                    Berdasarkan bobot data keterlambatan bimbingan & tenggat revisi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {briefing.prioritasMahasiswa.map((p, idx) => {
                    const isUrgent = p.urgensi === 'Sangat Mendesak';
                    const targetStudentObj = students.find((s) => s.id === p.studentId);

                    return (
                      <div
                        key={p.studentId || idx}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                          isUrgent ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 block uppercase">
                                Prioritas #{idx + 1} · {p.tahap}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">{p.nama}</h4>
                              <span className="text-[11px] text-slate-500 tabular-nums">NIM {p.nim}</span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm shrink-0 ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.urgensi}
                            </span>
                          </div>

                          <div className="text-xs space-y-1">
                            <span className="text-[11px] font-semibold text-slate-600 block">
                              Alasan Berbasis Data:
                            </span>
                            <p className="text-slate-800 leading-relaxed bg-white/80 p-2 rounded-md border border-slate-100">
                              {p.alasan}
                            </p>
                          </div>

                          <div className="text-xs space-y-1">
                            <span className="text-[11px] font-semibold text-indigo-700 block">
                              Tindakan yang Disarankan:
                            </span>
                            <p className="text-slate-700 leading-relaxed bg-indigo-50/40 p-2 rounded-md border border-indigo-100/60">
                              {p.tindakan}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              if (targetStudentObj) {
                                onSelectStudentDetail(targetStudentObj);
                              }
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                          >
                            <span>Buka Profil</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onAddAgentLog({
                                agentName: 'Briefing Mingguan',
                                action: `Dosen meninjau saran prioritas untuk ${p.nama}`,
                                targetStudent: `${p.nama} (${p.nim})`,
                                reason: p.alasan,
                                decision: 'Ditinjau',
                                notes: `Dosen menyetujui rekomendasi tindakan: "${p.tindakan}"`,
                              });
                              alert(`Rekomendasi untuk ${p.nama} telah ditandai ditinjau dan dicatat ke Log Aktivitas.`);
                            }}
                            className="text-xs px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-slate-700 transition-colors"
                          >
                            Tandai Ditinjau
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: AGENT 3 - PEMERIKSA REVISI                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'pemeriksa' && (
        <div className="space-y-5">
          {/* Header Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Agent 3: Pemeriksa Kepatuhan Revisi
              </span>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded-sm">
                Dibuat oleh AI, perlu ditinjau dosen
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Agent membandingkan arahan tugas revisi dari dosen dengan dokumen atau catatan yang diajukan oleh mahasiswa, kemudian menghasilkan checklist evaluasi ("Tampak terpenuhi", "Sebagian", atau "Belum terlihat").
            </p>
          </div>

          {/* Interactive Inspection Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Input Selection (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pilih Mahasiswa & Tugas Revisi
              </h3>

              {/* Mahasiswa Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mahasiswa Bimbingan
                </label>
                <select
                  value={selectedStudentForReview}
                  onChange={(e) => handleSelectStudentForReview(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} — NIM {s.nim} ({getTahapLabel(s.tahap)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Revision Picker (if any) */}
              {studentRevisionsForReview.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Tugas Revisi Tercatat ({studentRevisionsForReview.length} tugas)
                  </label>
                  <select
                    value={selectedRevisionId}
                    onChange={(e) => handleSelectSpecificRevision(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    {studentRevisionsForReview.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.status === 'diunggah'
                          ? '⏳ [Diunggah] '
                          : r.status === 'terverifikasi'
                          ? '✓ [Selesai] '
                          : '⚠️ [Belum] '}
                        {r.deskripsi.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
                  Belum ada revisi tercatat untuk mahasiswa ini. Anda dapat mengetik instruksi manual di bawah.
                </div>
              )}

              {/* Textarea: Tugas Revisi dari Dosen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruksi Tugas Revisi dari Dosen
                </label>
                <textarea
                  rows={3}
                  value={customRevisionText}
                  onChange={(e) => setCustomRevisionText(e.target.value)}
                  placeholder="Contoh: Tambahkan penjelasan uji beda t-test dan lampiran output SPSS Bab 4..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Textarea: Materi / Bukti Perbaikan Mahasiswa */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Bukti Naskah Perbaikan Mahasiswa
                </label>
                <textarea
                  rows={4}
                  value={customSubmissionText}
                  onChange={(e) => setCustomSubmissionText(e.target.value)}
                  placeholder="Isi catatan mahasiswa atau ringkasan perbaikan naskah..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                />
              </div>

              {/* Run Button */}
              <button
                type="button"
                onClick={handleRunRevisionCheck}
                disabled={loadingReview || !customRevisionText.trim()}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${loadingReview ? 'animate-spin' : ''}`} />
                <span>{loadingReview ? 'Menganalisis Kepatuhan Perbaikan...' : 'Periksa Kepatuhan Revisi'}</span>
              </button>
            </div>

            {/* Right: AI Analysis Results (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Hasil Pemeriksaan Kepatuhan Revisi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluasi kriteria per poin instruksi bimbingan.
                  </p>
                </div>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm font-medium">
                  Dibuat oleh AI, perlu ditinjau dosen
                </span>
              </div>

              {!revisionAnalysis ? (
                <div className="text-center py-16 space-y-2">
                  <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700">Belum Ada Pemeriksaan yang Berjalan</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Pilih mahasiswa dan klik tombol "Periksa Kepatuhan Revisi" di sebelah kiri untuk melihat checklist kriteria otomatis.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Warning banner as requested */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11.5px] leading-relaxed">
                      <strong>Penting:</strong> Hasil ini hanya saran asistensi awal. Status tugas revisi mahasiswa baru berubah menjadi <strong>"Terverifikasi"</strong> setelah dosen menekan tombol verifikasi sendiri secara sadar.
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <span className="font-semibold text-slate-700 block">Rangkuman AI:</span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {revisionAnalysis.ringkasan}
                    </p>
                  </div>

                  {/* Checklist Points */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Checklist Evaluasi per Poin:
                    </span>

                    {revisionAnalysis.checklist.map((item, idx) => {
                      const isFulfilled = item.status === 'Tampak terpenuhi';
                      const isPartial = item.status === 'Sebagian';

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-1"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {idx + 1}. {item.poin}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm shrink-0 ${
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

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {item.alasan}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dosen Official Action Box */}
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-indigo-950 block">Keputusan Dosen Pembimbing</span>
                      <p className="text-indigo-800 text-[11px] mt-0.5">
                        Setujui hasil perbaikan untuk menandai tugas ini selesai (FR-5).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyCurrentRevisionOfficial}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verifikasi Resmi Sekarang (FR-5)</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: LOG AKTIVITAS AGENT                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Log Aktivitas Agent & Keputusan Dosen
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mencatat rekam jejak setiap aksi agent, data alasan, serta status persetujuan dosen (Disetujui / Diedit / Ditolak / Ditinjau).
              </p>
            </div>

            {/* Filter by Agent Name */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 mr-1">Filter:</span>
              {(['Semua', 'Pengingat Proaktif', 'Briefing Mingguan', 'Pemeriksa Revisi'] as const).map((ag) => (
                <button
                  key={ag}
                  type="button"
                  onClick={() => setLogAgentFilter(ag)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    logAgentFilter === ag
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ag}
                </button>
              ))}
            </div>
          </div>

          {/* Logs List Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-36">Waktu</th>
                    <th className="py-3 px-4 w-40">Agent</th>
                    <th className="py-3 px-4 min-w-[200px]">Tindakan & Mahasiswa</th>
                    <th className="py-3 px-4 min-w-[220px]">Alasan Berbasis Data</th>
                    <th className="py-3 px-4 w-36">Keputusan Dosen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const isApproved = log.decision.includes('Disetujui') || log.decision === 'Diverifikasi';
                    const isEdited = log.decision.includes('Diedit');
                    const isRejected = log.decision === 'Ditolak';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {log.agentName}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 leading-snug">{log.action}</p>
                          {log.targetStudent && (
                            <span className="text-[11px] text-indigo-600 font-medium block mt-0.5">
                              {log.targetStudent}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 leading-relaxed text-[11.5px]">
                          {log.reason}
                          {log.notes && (
                            <span className="block text-[11px] text-slate-400 italic mt-0.5">
                              Catatan: {log.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isEdited
                                ? 'bg-indigo-100 text-indigo-800'
                                : isRejected
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {log.decision}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
