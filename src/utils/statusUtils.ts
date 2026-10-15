import { GuidanceSession, RevisiTask, StatusBimbingan, StatusDetail } from '../types';

// Tanggal acuan sistem sesuai waktu saat ini (15 Oktober 2026)
export const SYSTEM_TODAY = '2026-10-15';

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysDifference(targetDateStr: string, baseDateStr: string = SYSTEM_TODAY): number {
  const target = parseDate(targetDateStr);
  const base = parseDate(baseDateStr);
  const diffTime = base.getTime() - target.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function formatTanggalIndo(dateStr: string, short = false): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const bulanLengkap = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const bulanPendek = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const namaBulan = short ? bulanPendek[monthIdx] : bulanLengkap[monthIdx];
  return `${day} ${namaBulan} ${year}`;
}

/**
 * Aturan status otomatis (FR-3):
 * 1. Terlambat:
 *    - Bimbingan terakhir > 30 hari lalu, ATAU
 *    - Ada revisi yang belum selesai/terverifikasi yang sudah lewat tenggat (tenggat < hari ini).
 * 2. Perlu perhatian:
 *    - Bimbingan terakhir 15 s/d 30 hari lalu, ATAU
 *    - Ada revisi yang belum terverifikasi dengan tenggat dalam 3 hari ke depan (0 <= hari <= 3).
 * 3. Aman:
 *    - Bimbingan terakhir <= 14 hari lalu, dan tidak ada revisi lewat tenggat, dan tidak ada revisi mepet <= 3 hari.
 * Jika beberapa kondisi terpenuhi sekaligus, status terberat yang diambil: Terlambat > Perlu perhatian > Aman.
 */
export function hitungStatusMahasiswa(
  studentId: string,
  sessions: GuidanceSession[],
  revisions: RevisiTask[],
  todayStr: string = SYSTEM_TODAY
): StatusDetail {
  // Sesi mahasiswa terkait diurutkan dari terbaru
  const studentSessions = sessions
    .filter((s) => s.studentId === studentId)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const studentRevisions = revisions.filter((r) => r.studentId === studentId);

  const lastSession = studentSessions[0] || null;
  const daysSinceLastSession = lastSession ? getDaysDifference(lastSession.tanggal, todayStr) : null;

  // Analisis revisi yang belum terverifikasi
  const activeRevisions = studentRevisions.filter((r) => r.status !== 'terverifikasi');
  
  let revisiLewatTenggatCount = 0;
  let revisiMendekatiTenggatCount = 0;

  for (const rev of activeRevisions) {
    const daysUntilDue = -getDaysDifference(rev.tenggat, todayStr); // positif jika di masa depan, negatif jika lewat
    if (daysUntilDue < 0) {
      revisiLewatTenggatCount++;
    } else if (daysUntilDue <= 3) {
      revisiMendekatiTenggatCount++;
    }
  }

  // Evaluasi kondisi Terlambat
  const bimbinganTerlambat = daysSinceLastSession !== null ? daysSinceLastSession > 30 : true;
  const revisiTerlambat = revisiLewatTenggatCount > 0;

  if (bimbinganTerlambat || revisiTerlambat) {
    const alasanParts: string[] = [];
    if (bimbinganTerlambat) {
      alasanParts.push(
        daysSinceLastSession !== null
          ? `Bimbingan terakhir ${daysSinceLastSession} hari lalu (>30 hari)`
          : 'Belum pernah melakukan bimbingan'
      );
    }
    if (revisiTerlambat) {
      alasanParts.push(`${revisiLewatTenggatCount} tugas revisi telah melewati tenggat`);
    }
    return {
      status: 'Terlambat',
      alasan: alasanParts.join(' & '),
      hariSejakBimbinganTerakhir: daysSinceLastSession,
      revisiLewatTenggatCount,
      revisiMendekatiTenggatCount,
      lastSessionDate: lastSession ? lastSession.tanggal : null,
    };
  }

  // Evaluasi kondisi Perlu Perhatian
  const bimbinganPerluPerhatian = daysSinceLastSession !== null && daysSinceLastSession >= 15 && daysSinceLastSession <= 30;
  const revisiPerluPerhatian = revisiMendekatiTenggatCount > 0;

  if (bimbinganPerluPerhatian || revisiPerluPerhatian) {
    const alasanParts: string[] = [];
    if (bimbinganPerluPerhatian) {
      alasanParts.push(`Bimbingan terakhir ${daysSinceLastSession} hari lalu (15-30 hari)`);
    }
    if (revisiPerluPerhatian) {
      alasanParts.push(`${revisiMendekatiTenggatCount} revisi mendekati tenggat (≤3 hari)`);
    }
    return {
      status: 'Perlu perhatian',
      alasan: alasanParts.join(' & '),
      hariSejakBimbinganTerakhir: daysSinceLastSession,
      revisiLewatTenggatCount,
      revisiMendekatiTenggatCount,
      lastSessionDate: lastSession ? lastSession.tanggal : null,
    };
  }

  // Kondisi Aman
  return {
    status: 'Aman',
    alasan: `Bimbingan aktif (${daysSinceLastSession !== null ? `${daysSinceLastSession} hari lalu` : 'baru-baru ini'}), seluruh tugas revisi terkendali`,
    hariSejakBimbinganTerakhir: daysSinceLastSession,
    revisiLewatTenggatCount: 0,
    revisiMendekatiTenggatCount: 0,
    lastSessionDate: lastSession ? lastSession.tanggal : null,
  };
}

export function getStatusBadgeStyle(status: StatusBimbingan): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Aman':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Perlu perhatian':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'Terlambat':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
  }
}

export function getTahapLabel(tahap: string): string {
  switch (tahap) {
    case 'proposal':
      return 'Proposal';
    case 'seminar':
      return 'Seminar Hasil';
    case 'sidang':
      return 'Sidang Akhir';
    default:
      return tahap;
  }
}
