"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSubmission } from "@/lib/actions/admin";

/**
 * Versi ringkas DeleteSubmissionButton untuk dipasang di kartu list (AdminPage),
 * bukan di halaman detail. stopPropagation dipakai karena kartu ini sendiri
 * adalah <Link> ke halaman detail — tombol hapus harus mencegah klik itu
 * ikut trigger navigasi ke halaman review.
 */
export default function DeleteSubmissionButtonCompact({
  submissionId,
}: {
  submissionId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await deleteSubmission(submissionId);
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      } else {
        router.refresh();
      }
    });
  }

  function openConfirm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(true);
  }

  function cancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
    setError(null);
  }

  if (confirming) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex shrink-0 items-center gap-2"
      >
        <button
          onClick={handleDelete}
          disabled={pending}
          className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? "..." : "Yakin?"}
        </button>
        <button
          onClick={cancel}
          disabled={pending}
          className="rounded-lg border border-[#E4E9EF] px-2.5 py-1 text-xs font-medium text-[#10202F] hover:bg-white"
        >
          Batal
        </button>
        {error && <span className="text-xs text-rose-700">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={openConfirm}
      className="shrink-0 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 opacity-0 transition-opacity hover:bg-rose-50 group-hover:opacity-100"
    >
      Hapus
    </button>
  );
}