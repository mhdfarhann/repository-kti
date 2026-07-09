---
sidebar_position: 3
title: Sistem Penyimpanan (Dual Storage)
---

# 📦 Sistem Penyimpanan (Dual Storage)

Aplikasi Repository KTI mendukung mekanisme penyimpanan ganda (*Dual Storage*). Sistem membedakan penanganan berkas berdasarkan kolom `storage_provider` pada tabel `submissions`:

1. **Supabase Storage (Legacy)**: Berkas disimpan di bucket pribadi Supabase.
2. **cPanel FTP Storage (Production)**: Berkas diunggah secara aman menggunakan protokol **FTPS** ke server hosting cPanel eksternal.

---

## 🔒 Alur Keamanan Berkas PDF KTI

Untuk melindungi hak kekayaan intelektual (HAKI), berkas PDF KTI asli disimpan secara privat (tidak diletakkan di dalam folder publik web server cPanel). 

Akses unduhan atau pratinjau berkas dijaga dengan alur berikut:

```text
[Browser User] 
      │
      │ 1. Minta file (klik preview / akses disetujui)
      ▼
[Server Next.js] 
      │
      │ 2. Validasi otorisasi user (role admin / status granted)
      │ 3. Buat HMAC Signature & Expire Timestamp (TTL 60s)
      ▼
[Browser User] 
      │
      │ 4. Redirect ke Signed URL (cPanel serve.php?p=path&exp=timestamp&sig=hmac)
      ▼
[cPanel Subdomain (serve.php)]
      │
      │ 5. Validasi Signature & Cek Kadaluarsa (exp)
      ├─► [Gagal] Kirim HTTP 403 Forbidden
      └─► [Sukses] Kirim File PDF (application/pdf)
```

---

## 📤 Proses Unggah Berkas (Upload via FTPS)

Unggahan berkas dilakukan di sisi server (*Server-side*) oleh Next.js untuk menyembunyikan kredensial FTP cPanel dari pengguna. Kami menggunakan library `basic-ftp` untuk membangun koneksi **FTPS (FTP over TLS/SSL)** eksplisit:

* File diunggah ke path yang diacak: `user_id/timestamp-nama_file.pdf`
* Folder induk pengguna dibuat secara otomatis secara rekursif jika belum tersedia di server FTP.

### Snippet Implementasi FTP Client (`src/lib/storage/cpanel.ts`)

```typescript
import { Client } from "basic-ftp";
import { Readable } from "stream";

export async function uploadToCpanel(buffer: Buffer, relativePath: string): Promise<void> {
  const client = new Client();
  
  try {
    await client.access({
      host: process.env.CPANEL_FTP_HOST,
      user: process.env.CPANEL_FTP_USER,
      password: process.env.CPANEL_FTP_PASSWORD,
      secure: true, // FTPS Eksplisit (Wajib aktif!)
    });

    const dir = relativePath.split("/").slice(0, -1).join("/");
    if (dir) {
      await client.ensureDir(dir); // Membuat folder rekursif
      await client.cd("/"); // Kembali ke root jail
    }

    // Upload berkas dari memory buffer stream
    await client.uploadFrom(Readable.from(buffer), relativePath);
  } finally {
    client.close();
  }
}
```

---

## 🔑 Algoritma Pembuatan Tanda Tangan (Signed URL)

Ketika admin meninjau dokumen atau permohonan akses publik disetujui, server Next.js akan menghasilkan tautan yang ditandatangani kriptografi HMAC-SHA256 dengan masa aktif singkat (default: 60 detik):

```typescript
import crypto from "crypto";

export function generateSignedUrl(relativePath: string, ttlSeconds = 60): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  
  // Membuat signature menggunakan kunci rahasia SERVE_SECRET
  const sig = crypto
    .createHmac("sha256", process.env.SERVE_SECRET)
    .update(`${relativePath}.${exp}`)
    .digest("hex");

  const params = new URLSearchParams({
    p: relativePath,
    exp: String(exp),
    sig: sig
  });

  return `${process.env.CPANEL_SERVE_URL}?${params.toString()}`;
}
```

---

## 📄 Skrip Penerima cPanel (`serve.php`)

Skrip berikut dipasang di server cPanel untuk menyajikan file secara aman dengan memverifikasi tanda tangan HMAC dari URL yang dikirim:

```php
<?php
// serve.php - Diletakkan di subdomain files.domain.ac.id

$secret = "kunci_rahasia_hmac_anda_sesuai_env"; 
$baseDir = "/home/username/kti-files/"; // Root folder penyimpanan file PDF privat

$path = $_GET['p'] ?? '';
$exp = $_GET['exp'] ?? 0;
$sig = $_GET['sig'] ?? '';

if (!$path || !$exp || !$sig) {
    http_response_code(400);
    exit("Parameter tidak lengkap.");
}

// 1. Cek kadaluarsa
if (time() > $exp) {
    http_response_code(403);
    exit("Tautan telah kadaluarsa.");
}

// 2. Validasi Signature HMAC
$expectedSig = hash_hmac('sha256', $path . "." . $exp, $secret);

if (!hash_equals($expectedSig, $sig)) {
    http_response_code(403);
    exit("Tanda tangan tidak valid/akses ditolak.");
}

// 3. Cari berkas fisik
$realPath = realpath($baseDir . $path);
if (!$realPath || strpos($realPath, $baseDir) !== 0 || !is_file($realPath)) {
    http_response_code(404);
    exit("Berkas tidak ditemukan.");
}

// 4. Kirim berkas ke browser
header('Content-Type: application/pdf');
header('Content-Length: ' . filesize($realPath));
header('Content-Disposition: inline; filename="' . basename($realPath) . '"');
readfile($realPath);
```
