"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteSubmission } from "@/lib/actions/admin";

export default function DeleteSubmissionButton({ submissionId }: { submissionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSubmission(submissionId);
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    });
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" /> Hapus Submission
      </button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-rose-200 bg-rose-50 p-4">
      <p className="mb-3 flex items-start gap-2 text-sm text-rose-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Yakin ingin menghapus submission ini secara permanen? File dan seluruh datanya
        tidak bisa dikembalikan.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" /> {pending ? "Menghapus..." : "Ya, Hapus Permanen"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="rounded-lg border border-[#E4E9EF] px-4 py-2 text-sm font-medium text-[#10202F] hover:bg-white"
        >
          Batal
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}