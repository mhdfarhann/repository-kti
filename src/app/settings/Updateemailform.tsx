"use client";

import { useState, useTransition } from "react";
import { Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { updateEmail } from "@/lib/actions/profiles";

export default function UpdateEmailForm({ currentEmail }: { currentEmail: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateEmail(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <form action={handleSubmit} className="rounded-xl border border-[#E4E9EF] bg-white p-5">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
        Email Aktif
      </label>
      <div className="relative mb-1.5">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        <input
          name="email"
          type="email"
          required
          defaultValue={currentEmail ?? ""}
          placeholder="email@contoh.com"
          className="w-full rounded-lg border border-[#E4E9EF] py-2.5 pl-9 pr-3 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
        />
      </div>
      <p className="mb-4 text-xs text-[#94A3B8]">
        Dipakai untuk mengirim notifikasi status review karya Anda. Pastikan email ini aktif dan sering dicek.
      </p>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Email berhasil diperbarui.
        </p>
      )}

      <button
        disabled={pending}
        className="rounded-lg bg-[#0B3358] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#082944] disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Email"}
      </button>
    </form>
  );
}