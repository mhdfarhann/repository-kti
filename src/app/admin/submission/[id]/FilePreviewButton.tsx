"use client";

import { useState, useTransition } from "react";
import { FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { getFilePreviewUrl } from "@/lib/actions/admin";

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
        <FileText className="h-4 w-4" />
        {pending ? "Membuka..." : fileName}
        {!pending && <ExternalLink className="h-3.5 w-3.5 opacity-60" />}
      </button>
      {error && (
        <p className="mt-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}