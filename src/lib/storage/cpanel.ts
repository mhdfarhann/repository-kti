import crypto from "crypto";
import { Client } from "basic-ftp";
import { Readable } from "stream";

/**
 * Modul penyimpanan file di cPanel Hostinger, diakses lewat 2 jalur:
 * - Upload: FTPS (basic-ftp) dari server Next.js (Vercel) ke folder /home/<user>/kti-files
 * - Download: signed URL (HMAC-SHA256) yang mengarah ke serve.php di subdomain terpisah
 *
 * PENTING: relativePath yang dipakai di sini HARUS path relatif terhadap root folder
 * FTP jail (mis. "user-uuid/1720000000-nama.pdf"), BUKAN path absolut filesystem.
 * serve.php di server yang akan menggabungkannya dengan base directory di sana.
 */

const SERVE_SECRET = process.env.SERVE_SECRET;
const SERVE_BASE_URL = process.env.CPANEL_SERVE_URL;

const FTP_HOST = process.env.CPANEL_FTP_HOST;
const FTP_USER = process.env.CPANEL_FTP_USER;
const FTP_PASSWORD = process.env.CPANEL_FTP_PASSWORD;

function assertEnv() {
  const missing: string[] = [];
  if (!SERVE_SECRET) missing.push("SERVE_SECRET");
  if (!SERVE_BASE_URL) missing.push("CPANEL_SERVE_URL");
  if (!FTP_HOST) missing.push("CPANEL_FTP_HOST");
  if (!FTP_USER) missing.push("CPANEL_FTP_USER");
  if (!FTP_PASSWORD) missing.push("CPANEL_FTP_PASSWORD");
  if (missing.length > 0) {
    throw new Error(
      `Konfigurasi cPanel storage tidak lengkap, env var berikut belum diset: ${missing.join(", ")}`
    );
  }
}

/**
 * Generate signed URL sementara untuk mengakses file di cPanel lewat serve.php.
 * ttlSeconds default 60 detik — cukup untuk membuka file sekali, tidak untuk dibagikan ulang.
 */
export function generateSignedUrl(relativePath: string, ttlSeconds = 60): string {
  assertEnv();

  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = crypto
    .createHmac("sha256", SERVE_SECRET as string)
    .update(`${relativePath}.${exp}`)
    .digest("hex");

  const params = new URLSearchParams({ p: relativePath, exp: String(exp), sig });
  return `${SERVE_BASE_URL}?${params.toString()}`;
}

/**
 * Upload buffer file ke cPanel via FTPS. relativePath contoh: "user-uuid/1720000000-nama.pdf".
 * Folder induk akan dibuat otomatis kalau belum ada (ensureDir bersifat rekursif & idempotent).
 */
export async function uploadToCpanel(buffer: Buffer, relativePath: string): Promise<void> {
  assertEnv();

  const client = new Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: true, // FTPS eksplisit — WAJIB, jangan pernah diubah ke false
    });

    const dir = relativePath.split("/").slice(0, -1).join("/");
    if (dir) {
      await client.ensureDir(dir);
      // ensureDir mengubah working directory ke folder itu, balikkan ke root
      await client.cd("/");
    }

    await client.uploadFrom(Readable.from(buffer), relativePath);
  } finally {
    client.close();
  }
}

/**
 * Hapus file di cPanel via FTPS. Dipakai kalau submission dihapus/ditolak permanen,
 * atau untuk cleanup saat testing.
 */
export async function deleteFromCpanel(relativePath: string): Promise<void> {
  assertEnv();

  const client = new Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: true,
    });
    await client.remove(relativePath);
  } finally {
    client.close();
  }
}