---
sidebar_position: 2
title: Skema Database & Keamanan
---

# 🗄️ Skema Database & Keamanan

Sistem ini menggunakan **PostgreSQL** yang dikelola melalui platform **Supabase**. Keamanan data dijaga menggunakan **Row Level Security (RLS)** bawaan PostgreSQL untuk memastikan pengguna hanya bisa mengakses data yang menjadi haknya.

---

## 📐 Skema Tabel

Database proyek ini terdiri dari 5 tabel utama:

### 1. Tabel `profiles`
Menyimpan informasi tambahan untuk akun pengguna (selain data kredensial login di `auth.users`).

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  identifier text NOT NULL UNIQUE, -- NIM (Mahasiswa) atau NIDN (Dosen)
  full_name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['mahasiswa'::text, 'dosen'::text, 'staff'::text, 'admin'::text])),
  program_studi text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### 2. Tabel `submissions`
Menyimpan data metadata pengajuan Karya Tulis Ilmiah beserta lokasi penyimpanan berkasnya.

```sql
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  judul text NOT NULL,
  abstrak text NOT NULL,
  jenis_karya text NOT NULL CHECK (jenis_karya = ANY (ARRAY['skripsi'::text, 'laporan_ta'::text, 'kti_dosen'::text, 'jurnal'::text, 'lainnya'::text])),
  program_studi text NOT NULL,
  pembimbing text,
  tahun integer NOT NULL,
  kata_kunci text,
  file_path text NOT NULL, -- Path lokasi file di FTP / Storage
  file_name text NOT NULL, -- Nama asli file PDF
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  catatan_reviewer text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  storage_provider text NOT NULL DEFAULT 'supabase'::text CHECK (storage_provider = ANY (ARRAY['supabase'::text, 'cpanel'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);
```

### 3. Tabel `civitas_akademika`
Daftar putih (*whitelist*) NIM/NIDN mahasiswa/dosen aktif untuk membatasi pendaftaran hanya kepada civitas akademika resmi.

```sql
CREATE TABLE public.civitas_akademika (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  identifier text NOT NULL UNIQUE, -- NIM / NIDN resmi
  nama_lengkap text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['mahasiswa'::text, 'dosen'::text])),
  program_studi text,
  is_registered boolean NOT NULL DEFAULT false,
  user_id uuid, -- UUID akun pendaftar setelah sukses register
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT civitas_akademika_pkey PRIMARY KEY (id),
  CONSTRAINT civitas_akademika_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

### 4. Tabel `notifications`
Menyimpan riwayat notifikasi sistem untuk pengguna.

```sql
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  submission_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['submission_approved'::text, 'submission_rejected'::text, 'submission_received'::text])),
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT notifications_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE
);
```

### 5. Tabel `access_requests`
Menyimpan data permohonan akses publik untuk mengunduh/membaca berkas KTI yang disetujui.

```sql
CREATE TABLE public.access_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_institution text,
  alasan text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'granted'::text, 'denied'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT access_requests_pkey PRIMARY KEY (id),
  CONSTRAINT access_requests_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE
);
```

---

## 🛡️ Kebijakan Row Level Security (RLS)

PostgreSQL Row Level Security (RLS) diaktifkan pada tabel-tabel utama untuk mencegah kebocoran data antar pengguna.

### 👤 Kebijakan Tabel `profiles`
* **Melihat Profil Sendiri**: `auth.uid() = id` (User biasa hanya boleh melihat profilnya sendiri).
* **Manajemen Admin**: Pengguna dengan profil role `admin` atau `staff` dapat melihat daftar seluruh data profil untuk keperluan administratif.

### 📝 Kebijakan Tabel `submissions`
* **Melihat KTI Sendiri**: `auth.uid() = user_id` (Mahasiswa/dosen bisa melihat karya yang dia ajukan baik yang pending, disetujui, maupun ditolak).
* **Unggah Karya**: `auth.uid() = user_id` (Hanya diizinkan jika ID pengunggah cocok dengan sesi login saat ini).
* **Akses Publik (View)**: Publik hanya dapat melihat metadata karya yang berstatus `approved` (disetujui) lewat database view `public_submissions` (yang mengekspos data secara anonim).

---

## 👁️ Database View: `public_submissions`

Untuk membatasi kolom database mana saja yang boleh dibaca secara publik oleh pengunjung yang belum masuk (*anonymous*), sistem menyediakan PostgreSQL View khusus:

```sql
CREATE OR REPLACE VIEW public_submissions AS
SELECT
  s.id,
  s.judul,
  s.abstrak,
  s.jenis_karya,
  s.program_studi,
  s.pembimbing,
  s.tahun,
  s.kata_kunci,
  p.full_name AS penulis,
  s.reviewed_at
FROM submissions s
JOIN profiles p ON p.id = s.user_id
WHERE s.status = 'approved';

-- Hak akses baca diberikan kepada anonim dan pengguna terotentikasi
GRANT SELECT ON public_submissions TO anon, authenticated;
```
