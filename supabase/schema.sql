-- ============================================================
-- SCHEMA: Repository KTI Akademi Akupunktur Aceh
-- Jalankan file ini di Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Tabel PROFILES (data tambahan di luar auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  identifier text unique not null,       -- NIM / NIDN
  full_name text not null,
  role text not null check (role in ('mahasiswa', 'dosen', 'admin')),
  program_studi text,
  created_at timestamptz default now()
);

-- 2. Tabel SUBMISSIONS (karya yang diupload)
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  judul text not null,
  abstrak text not null,
  jenis_karya text not null check (jenis_karya in ('skripsi', 'laporan_ta', 'kti_dosen', 'jurnal', 'lainnya')),
  program_studi text not null,
  pembimbing text,
  tahun int not null,
  kata_kunci text,
  file_path text not null,               -- path di Supabase Storage
  file_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  checklist jsonb not null default '{}'::jsonb,
  catatan_reviewer text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- 3. Tabel ACCESS_REQUESTS (permintaan akses full text dari publik)
create table if not exists access_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  requester_name text not null,
  requester_email text not null,
  requester_institution text,
  alasan text not null,
  status text not null default 'pending' check (status in ('pending', 'granted', 'denied')),
  created_at timestamptz default now()
);

-- 4. VIEW publik: hanya expose kolom yang aman untuk karya yang sudah approved
create or replace view public_submissions as
select
  s.id,
  s.judul,
  s.abstrak,
  s.jenis_karya,
  s.program_studi,
  s.pembimbing,
  s.tahun,
  s.kata_kunci,
  p.full_name as penulis,
  s.reviewed_at
from submissions s
join profiles p on p.id = s.user_id
where s.status = 'approved';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table submissions enable row level security;
alter table access_requests enable row level security;

-- PROFILES policies
create policy "User bisa lihat profil sendiri"
  on profiles for select
  using (auth.uid() = id);

create policy "Admin bisa lihat semua profil"
  on profiles for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "User bisa insert profil sendiri saat register"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Admin bisa insert profil staff baru"
  on profiles for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- SUBMISSIONS policies
create policy "User bisa lihat submission sendiri"
  on submissions for select
  using (auth.uid() = user_id);

create policy "Admin bisa lihat semua submission"
  on submissions for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "User bisa insert submission sendiri"
  on submissions for insert
  with check (auth.uid() = user_id);

create policy "Admin bisa update status submission"
  on submissions for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ACCESS_REQUESTS policies
create policy "Siapa saja (publik) bisa insert access request"
  on access_requests for insert
  with check (true);

create policy "Admin bisa lihat semua access request"
  on access_requests for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin bisa update access request"
  on access_requests for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- public_submissions (view) bisa diakses siapa saja termasuk yang belum login
grant select on public_submissions to anon, authenticated;

-- ============================================================
-- STORAGE BUCKET
-- Jalankan bagian ini, atau buat manual lewat Dashboard -> Storage
-- ============================================================

insert into storage.buckets (id, name, public)
values ('kti-files', 'kti-files', false)
on conflict (id) do nothing;

-- Hanya user yang login boleh upload ke folder miliknya sendiri
create policy "User bisa upload file ke folder sendiri"
  on storage.objects for insert
  with check (
    bucket_id = 'kti-files'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner file & admin boleh baca file (untuk preview/review)
create policy "Owner dan admin bisa baca file"
  on storage.objects for select
  using (
    bucket_id = 'kti-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );
