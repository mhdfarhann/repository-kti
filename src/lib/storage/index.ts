import { createClient } from "@/lib/supabase/server";
import { generateSignedUrl } from "./cpanel";

/**
 * Baris minimal yang dibutuhkan dari tabel `submissions` untuk resolve URL file.
 * Pakai Pick supaya bisa dipanggil dengan objek submission penuh maupun hasil select minimal.
 */
type SubmissionFileInfo = {
  file_path: string;
  storage_provider: string; // 'supabase' | 'cpanel'
};

export type GetFileUrlResult =
  | { url: string; error?: undefined }
  | { url?: undefined; error: string };

/**
 * Resolve URL file yang bisa dibuka (signed URL), tanpa peduli file itu masih
 * di Supabase Storage (legacy) atau sudah dipindah ke cPanel Hostinger.
 *
 * Dipakai di:
 * - Server action admin (getFilePreviewUrl) untuk halaman review submission
 * - Alur access-request publik setelah admin grant akses
 *
 * PENTING: fungsi ini TIDAK melakukan pengecekan otorisasi (role admin, status
 * approved, access_request granted, dll) — itu HARUS sudah dicek oleh pemanggil
 * sebelum fungsi ini dipanggil. Fungsi ini murni translasi provider -> URL.
 */
export async function getFileUrl(
  submission: SubmissionFileInfo
): Promise<GetFileUrlResult> {
  if (submission.storage_provider === "cpanel") {
    try {
      const url = generateSignedUrl(submission.file_path, 60);
      return { url };
    } catch (err) {
      console.error("Gagal generate signed URL cPanel:", err);
      return { error: "Gagal membuat tautan file. Silakan coba lagi." };
    }
  }

  // Legacy path: file masih di Supabase Storage
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("kti-files")
    .createSignedUrl(submission.file_path, 60);

  if (error || !data?.signedUrl) {
    console.error("Gagal generate signed URL Supabase:", error);
    return { error: "Gagal membuat tautan file. Silakan coba lagi." };
  }

  return { url: data.signedUrl };
}