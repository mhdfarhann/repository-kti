// Supabase Auth butuh format email. Karena user login pakai NIM/NIDN,
// kita ubah jadi email "internal" yang tidak pernah benar-benar dikirimi surel.
// Domain internal ini TIDAK perlu benar-benar ada / terdaftar DNS.
const INTERNAL_DOMAIN = "repo.acehakupunktur.internal";

export function identifierToEmail(identifier: string) {
  const clean = identifier.trim().replace(/\s+/g, "");
  return `${clean}@${INTERNAL_DOMAIN}`;
}

export function formatTanggal(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const JENIS_KARYA_LABEL: Record<string, string> = {
  skripsi: "Skripsi",
  laporan_ta: "Laporan Tugas Akhir",
  kti_dosen: "Karya Ilmiah Dosen",
  jurnal: "Jurnal",
  lainnya: "Lainnya",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export const STATUS_COLOR: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

export const CHECKLIST_ITEMS = [
  { key: "bebas_plagiarisme", label: "Karya bebas dari plagiarisme (sudah dicek similarity)" },
  { key: "format_sesuai", label: "Format dokumen sesuai template institusi" },
  { key: "sudah_disetujui_pembimbing", label: "Sudah disetujui / ditandatangani pembimbing" },
  { key: "bebas_pustaka", label: "Sudah menyelesaikan proses bebas pustaka" },
] as const;

export type Submission = {
  id: string;
  user_id: string;
  judul: string;
  abstrak: string;
  jenis_karya: string;
  program_studi: string;
  pembimbing: string | null;
  tahun: number;
  kata_kunci: string | null;
  file_path: string;
  file_name: string;
  status: "pending" | "approved" | "rejected";
  checklist: Record<string, boolean>;
  catatan_reviewer: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  identifier: string;
  full_name: string;
  role: "mahasiswa" | "dosen" | "staff" | "admin";
  program_studi: string | null;
  email: string | null;
  created_at: string;
};
