"use client";

import { registerUser } from "@/lib/actions/auth";
import { useState, useTransition } from "react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerUser(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8">
        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
          Akademi Akupunktur Aceh
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">Daftar Akun</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Untuk mahasiswa dan dosen yang ingin mengunggah karya tulis ilmiah.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4 rounded-xl border border-[#E4E9EF] bg-white p-6">
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
          <input
            name="identifier"
            required
            placeholder="Masukkan NIM atau NIDN"
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Nama Lengkap
          </label>
          <input
            name="full_name"
            required
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Program Studi
          </label>
          <input
            name="program_studi"
            placeholder="Misal: D3 Akupunktur"
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
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
    </div>
  );
}