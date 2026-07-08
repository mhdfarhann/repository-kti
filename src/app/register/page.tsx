"use client";

import { registerUser } from "@/lib/actions/auth";
import { useState, useTransition } from "react";
import { Eye, EyeOff, User, Lock, IdCard, GraduationCap } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerUser(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <AuthLayout eyebrow="Bergabung dengan Repositori">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">Daftar Akun</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Untuk mahasiswa dan dosen yang ingin mengunggah karya tulis ilmiah.
        </p>
      </div>

      <form
        action={handleSubmit}
        className="space-y-4 rounded-2xl border border-[#E4E9EF] bg-white p-6 shadow-[0_1px_3px_rgba(11,51,88,0.04)]"
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Saya adalah
          </label>
          <select
            name="role"
            required
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          >
            <option value="mahasiswa">Mahasiswa</option>
            <option value="dosen">Dosen</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            NIM / NIDN
          </label>
          <div className="relative">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="identifier"
              required
              placeholder="Masukkan NIM atau NIDN"
              className="w-full rounded-lg border border-[#E4E9EF] py-2.5 pl-9 pr-3 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Nama Lengkap
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="full_name"
              required
              className="w-full rounded-lg border border-[#E4E9EF] py-2.5 pl-9 pr-3 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Program Studi
          </label>
          <div className="relative">
            <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="program_studi"
              placeholder="Misal: D3 Akupunktur"
              className="w-full rounded-lg border border-[#E4E9EF] py-2.5 pl-9 pr-3 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-lg border border-[#E4E9EF] py-2.5 pl-9 pr-10 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-[#0B3358] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#082944] disabled:opacity-60"
        >
          {pending ? "Memproses..." : "Daftar"}
        </button>

        <p className="text-center text-sm text-[#64748B]">
          Sudah punya akun?{" "}
          <a href="/login" className="font-medium text-[#0B3358] hover:underline underline-offset-4">
            Masuk di sini
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}