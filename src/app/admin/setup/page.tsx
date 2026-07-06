"use client";

import { useState, useTransition } from "react";
import { bootstrapAdmin } from "@/lib/actions/auth";

export default function AdminSetupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await bootstrapAdmin(formData);
      if (result?.error) setError(result.error);
      else setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Akun admin berhasil dibuat.{" "}
        <a href="/login" className="underline">
          Silakan login
        </a>
        .
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">
        Setup Akun Admin Pertama
      </h1>
      <p className="mb-6 text-sm text-stone-500">
        Halaman ini hanya untuk membuat akun admin pertama kali. Setelah punya
        satu akun admin, gunakan menu &quot;Kelola Akun Staff&quot; di dashboard
        admin untuk menambah admin lainnya.
      </p>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Kode Setup</label>
          <input
            name="secret"
            type="password"
            required
            placeholder="Kode rahasia dari environment variable ADMIN_SETUP_SECRET"
            className="w-full rounded-md border border-stone-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Identifier</label>
          <input
            name="identifier"
            required
            placeholder="NIP atau kode staff"
            className="w-full rounded-md border border-stone-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nama Lengkap</label>
          <input
            name="full_name"
            required
            className="w-full rounded-md border border-stone-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border border-stone-300 px-3 py-2"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          disabled={pending}
          className="w-full rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {pending ? "Memproses..." : "Buat Akun Admin"}
        </button>
      </form>
    </div>
  );
}
