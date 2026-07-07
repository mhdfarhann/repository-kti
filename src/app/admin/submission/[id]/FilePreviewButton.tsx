"use client";

import { useState, useTransition } from "react";
import { getFilePreviewUrl } from "@/lib/actions/admin";

/**
 * CATATAN MIGRASI:
 * Prop diganti dari `filePath` menjadi `submissionId` — server yang query ulang
 * file_path & storage_provider dari database, supaya client tidak bisa
 * memalsukan path file untuk mengakses submission lain.
 */
export default function FilePreviewButton({
  submissionId,
  fileName,
}: {
  submissionId: string;
  fileName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await getFilePreviewUrl(submissionId);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        window.open(result.url, "_blank");
      }
    });
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg border border-[#0B3358] px-4 py-2.5 text-sm font-medium text-[#0B3358] transition-colors hover:bg-[#EEF3F8] disabled:opacity-60"
      >
        {pending ? "Membuka..." : `Buka File: ${fileName}`}
      </button>
      {error && (
        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}