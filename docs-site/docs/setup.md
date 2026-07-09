---
sidebar_position: 5
title: Panduan Setup & Konfigurasi
---

# 🛠️ Panduan Setup & Konfigurasi

Halaman ini memandu pengembang dalam melakukan konfigurasi awal, penginstalan dependensi, dan menjalankan server repositori secara lokal maupun produksi.

---

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan lingkungan pengembangan Anda telah terpasang:
* **Node.js** versi 18 atau 20 (disarankan LTS)
* **NPM**, **PNPM**, atau **Yarn** sebagai package manager
* Proyek **Supabase** yang aktif (akses ke SQL Editor untuk inisialisasi schema)
* Server hosting **cPanel** dengan akses FTP/FTPS
* Akun **Resend** (layanan pengirim email)

---

## ⚙️ Konfigurasi Environment Variables

Buat berkas bernama `.env.local` di root folder proyek Next.js Anda (sejajar dengan `package.json`). Isi berkas tersebut dengan variabel berikut:

```env
# ============================================================
# 1. KONEKSI SUPABASE
# ============================================================
# Diambil dari: Supabase Dashboard -> Project Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://<id-proyek-anda>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (PENTING: Hanya untuk server-side Next.js, JANGAN di browser!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================
# 2. SETUP ADMIN PERTAMA
# ============================================================
# Kode rahasia acak untuk pendaftaran admin pertama kali di /admin/setup
ADMIN_SETUP_SECRET=kode-rahasia-setup-admin-anda

# ============================================================
# 3. CPANEL FTP STORAGE
# ============================================================
# Kredensial FTP untuk mengunggah berkas PDF secara aman (FTPS)
CPANEL_FTP_HOST=srvXXX.niagahoster.com
CPANEL_FTP_USER=username-ftp-anda@domain.ac.id
CPANEL_FTP_PASSWORD=password-ftp-anda

# Kunci rahasia HMAC-SHA256 untuk memvalidasi Signed URL berkas PDF
SERVE_SECRET=kunci-rahasia-hmac-sha256-acak-yang-panjang

# Tautan mengarah ke file serve.php di subdomain/hosting cPanel Anda
CPANEL_SERVE_URL=https://files.domain.ac.id/serve.php

# ============================================================
# 4. NOTIFIKASI EMAIL (RESEND)
# ============================================================
# Diambil dari: Resend Dashboard -> API Keys
RESEND_API_KEY=re_XXXXXXXXX
```

---

## 🚀 Instalasi & Menjalankan Aplikasi

### 1. Pemasangan Dependensi
Buka terminal Anda di direktori proyek dan jalankan perintah:

```bash
npm install
```

### 2. Menjalankan Mode Pengembangan (Local Development)
Untuk menjalankan web lokal di `http://localhost:3000`:

```bash
npm run dev
```

### 3. Kompilasi & Build Produksi
Untuk memastikan kode bebas dari kesalahan TypeScript/linting sebelum rilis produksi:

```bash
npm run build
```

### 4. Menjalankan Build Produksi secara Lokal
Setelah build berhasil, jalankan server produksi dengan:

```bash
npm run start
```

---

## 🔑 Inisialisasi Akun Admin Pertama (Bootstrap Admin)

Ketika database masih kosong dan belum ada satu pun akun admin yang terdaftar:

1. Pastikan Anda telah menetapkan nilai rahasia di variabel `ADMIN_SETUP_SECRET` pada berkas `.env.local`.
2. Buka browser dan arahkan ke alamat halaman setup admin: `http://localhost:3000/admin/setup`.
3. Masukkan kode setup yang sama dengan isi `ADMIN_SETUP_SECRET` Anda.
4. Isi data Nama Lengkap, NIM/NIDN (sebagai pengidentifikasi login unik), dan password akun admin Anda.
5. Klik **Daftar Akun Admin**.
6. Sistem akan membuat akun auth admin dan profil admin di database.
7. Setelah selesai, halaman `/admin/setup` ini **tidak perlu digunakan lagi**. Akun admin atau staff baru selanjutnya harus dibuat secara aman melalui menu **Dashboard Admin -> Kelola Akun Staff** setelah Anda masuk.
