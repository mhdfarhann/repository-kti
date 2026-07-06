"use client";

import { loginUser } from "@/lib/actions/auth";
import { useState, useTransition } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginUser(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#0B3358] text-sm font-semibold text-white">
          AAA
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">Masuk</h1>
      </div>

      <form action={handleSubmit} className="space-y-4 rounded-xl border border-[#E4E9EF] bg-white p-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            NIM / NIDN
          </label>
          <input
            name="identifier"
            required
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
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
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
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
          {pending ? "Memproses..." : "Masuk"}
        </button>

        <p className="text-center text-sm text-[#64748B]">
          Belum punya akun?{" "}
          <a href="/register" className="font-medium text-[#0B3358] hover:underline underline-offset-4">
            Daftar di sini
          </a>
        </p>
      </form>
    </div>
  );
}