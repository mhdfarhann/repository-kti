"use client";

import { useState, useTransition } from "react";
import { requestAccess } from "@/lib/actions/submissions";

export default function RequestAccessForm({ submissionId }: { submissionId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await requestAccess(formData);
      if (result?.error) setError(result.error);
      else setSuccess(true);
    });
  }

  if (success) {
    return (
      <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Permintaan akses berhasil dikirim. Bagian akademik akan meninjau dan
        menghubungi kamu lewat email yang didaftarkan.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="submission_id" value={submissionId} />

      <div>
        <label className="mb-1 block text-sm font-medium">Nama Lengkap</label>
        <input
          name="requester_name"
          required
          className="w-full rounded-md border border-stone-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          name="requester_email"
          type="email"
          required
          className="w-full rounded-md border border-stone-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Institusi/Afiliasi</label>
        <input
          name="requester_institution"
          placeholder="Opsional"
          className="w-full rounded-md border border-stone-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tujuan Penggunaan</label>
        <textarea
          name="alasan"
          required
          rows={3}
          placeholder="Jelaskan untuk keperluan apa dokumen ini dibutuhkan"
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
        {pending ? "Mengirim..." : "Kirim Permintaan"}
      </button>
    </form>
  );
}
