"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewSubmission } from "@/lib/actions/submissions";

export default function ReviewActions({ submissionId }: { submissionId: string }) {
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"approved" | "rejected" | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const catatanTrimmed = catatan.trim();
  const catatanCukup = catatanTrimmed.length >= 5;

  function requestDecision(decision: "approved" | "rejected") {
    setError(null);
    if (decision === "rejected" && !catatanCukup) {
      setError("Tulis alasan penolakan minimal 5 karakter.");
      return;
    }
    setConfirming(decision);
  }

  function confirmDecision() {
    if (!confirming) return;
    const decision = confirming;

    const formData = new FormData();
    formData.set("submission_id", submissionId);
    formData.set("decision", decision);
    formData.set("catatan", catatanTrimmed);

    startTransition(async () => {
      const result = await reviewSubmission(formData);
      if (result?.error) {
        setError(result.error);
        setConfirming(null);
      } else {
        router.push("/admin");
      }
    });
  }

  return (
    <div className="rounded-xl border border-[#E4E9EF] bg-white p-5">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
        Catatan (wajib jika menolak)
      </label>
      <textarea
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        rows={3}
        placeholder="Contoh: format belum sesuai template, mohon perbaiki bab 3"
        className="mb-4 w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
      />

      {error && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {!confirming ? (
        <div className="flex gap-3">
          <button
            onClick={() => requestDecision("approved")}
            disabled={pending}
            className="flex-1 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
          >
            Setujui
          </button>
          <button
            onClick={() => requestDecision("rejected")}
            disabled={pending}
            className="flex-1 rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-800 disabled:opacity-60"
          >
            Tolak
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm text-amber-900">
            {confirming === "approved"
              ? "Setujui karya ini? Karya akan langsung tampil di pencarian publik."
              : "Tolak karya ini? Pengaju akan menerima catatan penolakan dan perlu submit ulang."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmDecision}
              disabled={pending}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                confirming === "approved"
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : "bg-rose-700 hover:bg-rose-800"
              }`}
            >
              {pending ? "Memproses..." : "Ya, Konfirmasi"}
            </button>
            <button
              onClick={() => setConfirming(null)}
              disabled={pending}
              className="flex-1 rounded-lg border border-[#E4E9EF] px-4 py-2.5 text-sm font-medium text-[#10202F] transition-colors hover:bg-[#F7F9FB] disabled:opacity-60"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}