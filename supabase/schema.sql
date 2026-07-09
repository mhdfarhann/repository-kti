-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  identifier text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['mahasiswa'::text, 'dosen'::text, 'staff'::text, 'admin'::text])),
  program_studi text,
  created_at timestamp with time zone DEFAULT now(),
  email text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
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
  file_path text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  catatan_reviewer text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  storage_provider text NOT NULL DEFAULT 'supabase'::text CHECK (storage_provider = ANY (ARRAY['supabase'::text, 'cpanel'::text])),
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);
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
  CONSTRAINT access_requests_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.civitas_akademika (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  identifier text NOT NULL UNIQUE,
  nama_lengkap text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['mahasiswa'::text, 'dosen'::text])),
  program_studi text,
  is_registered boolean NOT NULL DEFAULT false,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  CONSTRAINT civitas_akademika_pkey PRIMARY KEY (id),
  CONSTRAINT civitas_akademika_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  submission_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['submission_approved'::text, 'submission_rejected'::text, 'submission_received'::text])),
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT notifications_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);