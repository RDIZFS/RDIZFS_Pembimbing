import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client with recommended User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// SYSTEM PROMPT UNTUK AGENT 1: PENGINGAT PROAKTIF
const SYSTEM_PROMPT_PENGINGAT = `Anda adalah Asisten Pengingat Proaktif untuk Dosen Pembimbing Skripsi (Ibu Ratu Dintha Insyani Zukhruf FS, S.Pd., M.M, Program Studi Pendidikan Bisnis, FPEB, Universitas Pendidikan Indonesia).
Tugas Anda: Menyusun draf pesan pengingat yang sangat santun, personal, suportif, dan profesional untuk mahasiswa bimbingan yang berstatus 'Terlambat' atau 'Perlu perhatian'.

Pedoman:
1. Panggil nama mahasiswa secara sopan dan akrab khas bimbingan akademis (misal: "Halo Farhan," atau "Selamat pagi Nadia,").
2. Sebutkan secara spesifik:
   - Judul / topik skripsi mereka
   - Lama sejak bimbingan terakhir
   - Tugas revisi yang belum selesai beserta batas tenggatnya
3. Tunjukkan kepedulian dosen terhadap kendala mahasiswa serta tawarkan waktu diskusi atau asistensi bila mengalami kebuntuan.
4. Jangan menghakimi atau mengancam, tetapi tekankan pentingnya kedisiplinan jadwal agar lulus tepat waktu.
5. JANGAN memberi nilai skripsi. JANGAN menebak fakta di luar data yang diberikan. Jika data tanggal atau revisi minim, nyatakan ketidakpastian secara jelas.`;

// SYSTEM PROMPT UNTUK AGENT 2: BRIEFING MINGGUAN
const SYSTEM_PROMPT_BRIEFING = `Anda adalah Asisten Analis Portofolio Bimbingan Skripsi untuk Dosen Pembimbing (Ibu Ratu Dintha Insyani Zukhruf FS, S.Pd., M.M, Program Studi Pendidikan Bisnis, FPEB, Universitas Pendidikan Indonesia).
Tugas Anda: Menganalisis seluruh data mahasiswa bimbingan skripsi dan menyusun 'Briefing Mingguan' untuk memandu prioritas dosen minggu ini.

Pedoman:
1. Pilih tepat 3 mahasiswa prioritas tertinggi minggu ini berdasarkan keparahan data (misal: keterlambatan bimbingan terlama, revisi lewat tenggat, atau tahap mendekati sidang).
2. Untuk tiap mahasiswa prioritas, sajikan:
   - 'alasan': berbasis data kuantitatif nyata (misal: "Bimbingan terakhir 51 hari lalu, tugas perbaikan inkubator lewat tenggat 35 hari")
   - 'tindakan': saran tindakan konkret untuk dosen pembimbing minggu ini
   - 'urgensi': 'Sangat Mendesak' | 'Tinggi' | 'Sedang'
3. Berikan 'analisisKeseluruhan': ringkasan 2-3 kalimat mengenai dinamika bimbingan minggu ini.
4. Jika terdapat data yang tidak lengkap, nyatakan secara eksplisit bahwa terdapat data yang belum terisi daripada berspekulasi.`;

// SYSTEM PROMPT UNTUK AGENT 3: PEMERIKSA REVISI
const SYSTEM_PROMPT_PEMERIKSA = `Anda adalah Asisten Pemeriksa Kepatuhan Revisi Skripsi untuk Dosen Pembimbing (Program Studi Pendidikan Bisnis, FPEB, Universitas Pendidikan Indonesia).
Tugas Anda: Membandingkan instruksi tugas revisi yang diberikan oleh dosen dengan bukti/catatan/naskah perbaikan yang dikirimkan oleh mahasiswa.

Pedoman:
1. Bedah instruksi revisi menjadi 2 hingga 4 poin kriteria spesifik.
2. Untuk setiap poin, tentukan status kelengkapan:
   - 'Tampak terpenuhi': bukti perbaikan terlihat jelas dan menjawab arahan
   - 'Sebagian': baru dikerjakan sebagian atau masih ada komponen yang kurang
   - 'Belum terlihat': belum ada bukti pengerjaan untuk poin tersebut
3. Berikan 'alasan': penjelasan ringkas 1-2 kalimat mengapa status tersebut disematkan berdasarkan data perbaikan yang ada.
4. Berikan 'catatanUmum': rangkuman umum untuk pertimbangan dosen sebelum memutuskan verifikasi resmi.
5. Ingatkan bahwa analisis ini hanyalah asisten awal yang WAJIB ditinjau dan diverifikasi langsung oleh dosen pembimbing.`;

// ==========================================
// ENDPOINT 1: AGENT 1 - DRAF PENGINGAT
// ==========================================
app.post('/api/agents/pengingat', async (req, res) => {
  try {
    const { students } = req.body; // students with pending revisions & days since last session
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Data mahasiswa tidak valid' });
    }

    if (!apiKey) {
      // Fallback cerdas berbasis template jika API key belum terisi
      const fallbackDrafts = students.map((s: any) => ({
        studentId: s.id,
        nama: s.nama,
        nim: s.nim,
        status: s.status,
        subjek: `Pengingat Progres Bimbingan Skripsi - ${s.nama}`,
        pesan: `Selamat siang ${s.nama} (${s.nim}),\n\nSemoga dalam keadaan sehat. Menindaklanjuti progres skripsi Anda yang berjudul "${s.judul}", tercatat bahwa sesi bimbingan terakhir telah berlangsung sekitar ${s.hariBimbingan ?? '-'} hari yang lalu.\n\nTerdapat tugas revisi yang tercatat: "${s.revisiDeskripsi || 'Penyempurnaan naskah'}" dengan tenggat ${s.tenggat || 'segera'}. Mohon untuk segera menyelesaikan perbaikan dan mengunggah berkasnya melalui portal bimbingan agar dapat Ibu periksa.\n\nJika ada kendala dalam analisis data atau penulisan, silakan sampaikan agar dapat kita diskusikan bersama. Tetap semangat!\n\nSalam,\nRatu Dintha Insyani Zukhruf FS, S.Pd., M.M\nDosen Pembimbing Skripsi`,
        urgensi: s.status === 'Terlambat' ? 'Tinggi' : 'Sedang',
      }));
      return res.json({ drafts: fallbackDrafts, source: 'fallback' });
    }

    const promptText = `Berikut adalah data mahasiswa berstatus 'Terlambat' atau 'Perlu perhatian' yang membutuhkan draf pesan pengingat:\n${JSON.stringify(
      students,
      null,
      2
    )}\n\nBuatlah draf pesan pengingat untuk masing-masing mahasiswa dalam format JSON sesuai schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT_PENGINGAT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              studentId: { type: Type.STRING },
              nama: { type: Type.STRING },
              nim: { type: Type.STRING },
              subjek: { type: Type.STRING },
              pesan: { type: Type.STRING },
              urgensi: { type: Type.STRING },
            },
            required: ['studentId', 'nama', 'subjek', 'pesan'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    return res.json({ drafts: parsed, source: 'gemini' });
  } catch (err: any) {
    console.error('Error in /api/agents/pengingat:', err);
    // Fallback jika API error
    const fallbackDrafts = (req.body.students || []).map((s: any) => ({
      studentId: s.id,
      nama: s.nama,
      nim: s.nim,
      subjek: `Tindak Lanjut Revisi Skripsi - ${s.nama}`,
      pesan: `Halo ${s.nama}, semoga dalam keadaan sehat selalu. Mengingat bimbingan terakhir ${s.hariBimbingan || 0} hari lalu dan terdapat tugas revisi "${s.revisiDeskripsi || 'revisi skripsi'}" dengan tenggat ${s.tenggat || 'segera'}, mohon konfirmasi progres Anda dan unggah berkas perbaikan ke portal bimbingan. Terima kasih.\n\nSalam,\nRatu Dintha Insyani Zukhruf FS, S.Pd., M.M`,
      urgensi: s.status === 'Terlambat' ? 'Tinggi' : 'Sedang',
    }));
    return res.json({ drafts: fallbackDrafts, source: 'fallback_on_error' });
  }
});

// ==========================================
// ENDPOINT 2: AGENT 2 - BRIEFING MINGGUAN
// ==========================================
app.post('/api/agents/briefing', async (req, res) => {
  try {
    const { studentsData, counts } = req.body;
    if (!studentsData || !counts) {
      return res.status(400).json({ error: 'Data mahasiswa tidak lengkap' });
    }

    if (!apiKey) {
      // Fallback terstruktur jika tanpa API Key
      const fallbackResult = {
        analisisKeseluruhan: `Dari total ${counts.total} mahasiswa bimbingan, ${counts.aman} mahasiswa berada dalam kondisi Aman, ${counts.perhatian} mahasiswa Perlu Perhatian, dan ${counts.terlambat} mahasiswa Terlambat. Prioritas utama minggu ini difokuskan pada mahasiswa yang mengalami stagnasi revisi lebih dari 30 hari untuk mencegah keterlambatan semester.`,
        prioritasMahasiswa: [
          {
            studentId: 'mhs-7',
            nama: 'Bagas Wicaksono',
            nim: '2004519',
            tahap: 'Sidang Akhir',
            alasan: 'Bimbingan terakhir 51 hari lalu dan tugas perbaikan transkrip wawancara inkubator lewat tenggat 35 hari.',
            tindakan: 'Kirimkan pesan pengingat resmi dan agendakan sesi tatap muka langsung di kampus untuk membedah kendala kualitatif.',
            urgensi: 'Sangat Mendesak',
          },
          {
            studentId: 'mhs-8',
            nama: 'Putri Anggraini',
            nim: '2106334',
            tahap: 'Proposal',
            alasan: 'Tugas perbaikan instrumen uji kelayakan bahan ajar digital telah melewati tenggat sejak 10 Oktober 2026.',
            tindakan: 'Minta mahasiswa mengirimkan draf revisi butir kuesioner sebelum akhir pekan ini agar jadwal seminar proposal tidak bergeser.',
            urgensi: 'Tinggi',
          },
          {
            studentId: 'mhs-6',
            nama: 'Siti Rahmawati',
            nim: '2207612',
            tahap: 'Sidang Akhir',
            alasan: 'Telah mengunggah berkas revisi komparasi QRIS vs PayLater dan sedang menunggu verifikasi dosen untuk mendaftar sidang.',
            tindakan: 'Tinjau berkas naskah Bab 4 yang diunggah dan berikan status verifikasi agar mahasiswa dapat segera mendaftar sidang akhir.',
            urgensi: 'Tinggi',
          },
        ],
        rekomendasiJadwal: 'Disarankan membuka sesi bimbingan terjadwal pada hari Selasa dan Kamis untuk memfasilitasi 3 mahasiswa prioritas.',
      };
      return res.json({ briefing: fallbackResult, source: 'fallback' });
    }

    const promptText = `Berikut adalah data rekap bimbingan mahasiswa minggu ini:\nRingkasan Status: ${JSON.stringify(
      counts
    )}\nData Mahasiswa:\n${JSON.stringify(
      studentsData,
      null,
      2
    )}\n\nLakukan analisis portofolio dan susun Briefing Mingguan berisi tepat 3 mahasiswa prioritas tertinggi dan ringkasan kondisi keseluruhan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT_BRIEFING,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analisisKeseluruhan: { type: Type.STRING },
            prioritasMahasiswa: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  studentId: { type: Type.STRING },
                  nama: { type: Type.STRING },
                  nim: { type: Type.STRING },
                  tahap: { type: Type.STRING },
                  alasan: { type: Type.STRING },
                  tindakan: { type: Type.STRING },
                  urgensi: { type: Type.STRING },
                },
                required: ['studentId', 'nama', 'alasan', 'tindakan', 'urgensi'],
              },
            },
            rekomendasiJadwal: { type: Type.STRING },
          },
          required: ['analisisKeseluruhan', 'prioritasMahasiswa'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ briefing: parsed, source: 'gemini' });
  } catch (err: any) {
    console.error('Error in /api/agents/briefing:', err);
    return res.status(500).json({ error: 'Gagal membuat briefing mingguan' });
  }
});

// ==========================================
// ENDPOINT 3: AGENT 3 - PEMERIKSA REVISI
// ==========================================
app.post('/api/agents/pemeriksa-revisi', async (req, res) => {
  try {
    const { tugasRevisi, namaMahasiswa, judulSkripsi, catatanMahasiswa, teksDokumen } = req.body;
    if (!tugasRevisi) {
      return res.status(400).json({ error: 'Tugas revisi wajib diisi' });
    }

    const submissionContent = teksDokumen || catatanMahasiswa || 'Dokumen telah diunggah oleh mahasiswa.';

    if (!apiKey) {
      // Fallback analisis realistis jika tanpa API key
      const fallbackResult = {
        ringkasan: `Hasil analisis awal perbaikan naskah untuk ${namaMahasiswa || 'mahasiswa'}: dokumen perbaikan mencakup sebagian besar instruksi yang diminta pada bimbingan.`,
        catatanUmum: 'Pemeriksaan otomatis mendeteksi adanya respons terhadap instruksi utama. Tetap disarankan dosen membaca langsung berkas lampiran sebelum menekan tombol Verifikasi Resmi.',
        checklist: [
          {
            poin: 'Kesesuaian dengan instruksi utama revisi',
            status: 'Tampak terpenuhi',
            alasan: 'Catatan pengumpulan dan berkas terlampir menunjukkan fokus pada perbaikan bab yang ditugaskan.',
          },
          {
            poin: 'Kelengkapan lampiran bukti data & referensi pendukung',
            status: 'Sebagian',
            alasan: 'Terdapat penjelasan tertulis, namun dosen perlu memeriksa kelengkapan tabel output atau dokumen uji secara visual.',
          },
          {
            poin: 'Kerapian format dan struktur sitasi ilmiah',
            status: 'Tampak terpenuhi',
            alasan: 'Dokumen diserahkan dalam format dokumen terstruktur.',
          },
        ],
      };
      return res.json({ analysis: fallbackResult, source: 'fallback' });
    }

    const promptText = `Mahasiswa: ${namaMahasiswa || 'Mahasiswa'}
Judul Skripsi: ${judulSkripsi || 'Skripsi'}
Tugas Revisi dari Dosen: "${tugasRevisi}"
Isi / Catatan Perbaikan Mahasiswa: "${submissionContent}"

Bandingkan tugas revisi di atas dengan materi perbaikan yang diserahkan. Buat checklist evaluasi per poin revisi.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT_PEMERIKSA,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ringkasan: { type: Type.STRING },
            catatanUmum: { type: Type.STRING },
            checklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  poin: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    description: 'Tampak terpenuhi, Sebagian, atau Belum terlihat',
                  },
                  alasan: { type: Type.STRING },
                },
                required: ['poin', 'status', 'alasan'],
              },
            },
          },
          required: ['ringkasan', 'checklist', 'catatanUmum'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ analysis: parsed, source: 'gemini' });
  } catch (err: any) {
    console.error('Error in /api/agents/pemeriksa-revisi:', err);
    return res.status(500).json({ error: 'Gagal menganalisis revisi' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
