"use client";

import { useState, useTransition } from "react";
import { createStaffAccount } from "@/lib/actions/admin";

export default function CreateStaffForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createStaffAccount(formData);
      if (result?.error) setError(result.error);
      else setSuccess(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-[#E4E9EF] bg-white p-5">
      <p className="font-medium text-[#10202F]">Tambah Staff Baru</p>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Identifier (bebas, misal: NIP atau kode staff)
        </label>
        <input
          name="identifier"
          required
          className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
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
          Password Awal
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Akun staff berhasil dibuat.
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-lg bg-[#0B3358] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#082944] disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Buat Akun Staff"}
      </button>
    </form>
  );
}