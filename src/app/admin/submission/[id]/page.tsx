import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ListChecks, Check, X } from "lucide-react";
import { JENIS_KARYA_LABEL, STATUS_LABEL, STATUS_COLOR, CHECKLIST_ITEMS, formatTanggal } from "@/lib/helpers";
import ReviewActions from "./ReviewActions";
import DeleteSubmissionButton from "./Deletesubmissionbutton";
import FilePreviewButton from "./FilePreviewButton";

export default async function ReviewSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const canModerate = profile?.role === "admin" || profile?.role === "staff";
  if (!canModerate) redirect("/dashboard");

  const { data: item } = await supabase
    .from("submissions")
    .select("*, profiles!submissions_user_id_fkey(full_name, identifier, role)")
    .eq("id", id)
    .single();

  if (!item) notFound();

  const pengaju = item.profiles as unknown as {
    full_name: string;
    identifier: string;
    role: string;
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0B3358]"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard Admin
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#E4E9EF] pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">{item.judul}</h1>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_COLOR[item.status]}`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </div>

      <div className="mb-6 space-y-1.5 text-sm text-[#475569]">
        <p><span className="font-medium text-[#10202F]">Pengaju:</span> {pengaju?.full_name} ({pengaju?.identifier}, {pengaju?.role})</p>
        <p><span className="font-medium text-[#10202F]">Jenis Karya:</span> {JENIS_KARYA_LABEL[item.jenis_karya]}</p>
        <p><span className="font-medium text-[#10202F]">Program Studi:</span> {item.program_studi}</p>
        {item.pembimbing && <p><span className="font-medium text-[#10202F]">Pembimbing:</span> {item.pembimbing}</p>}
        <p><span className="font-medium text-[#10202F]">Tahun:</span> {item.tahun}</p>
        {item.kata_kunci && <p><span className="font-medium text-[#10202F]">Kata Kunci:</span> {item.kata_kunci}</p>}
        <p><span className="font-medium text-[#10202F]">Diupload:</span> {formatTanggal(item.created_at)}</p>
      </div>

      <div className="mb-6 rounded-xl border border-[#E4E9EF] bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
          <FileText className="h-3.5 w-3.5" />
          Abstrak
        </h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#334155]">
          {item.abstrak}
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-[#E4E9EF] bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
          <ListChecks className="h-3.5 w-3.5" />
          Checklist yang Dicentang Pengaju
        </h2>
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((c) => (
            <p key={c.key} className="flex items-center gap-2.5 text-sm text-[#334155]">
              {item.checklist?.[c.key] ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <X className="h-4 w-4 shrink-0 text-rose-500" />
              )}
              {c.label}
            </p>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <FilePreviewButton submissionId={item.id} fileName={item.file_name} />
        <DeleteSubmissionButton submissionId={item.id} />
      </div>

      {item.status === "pending" ? (
        <ReviewActions submissionId={item.id} />
      ) : (
        item.catatan_reviewer && (
          <div className="rounded-xl border border-[#E4E9EF] bg-[#F7F9FB] p-4 text-sm text-[#334155]">
            <span className="font-medium text-[#10202F]">Catatan reviewer:</span> {item.catatan_reviewer}
          </div>
        )
      )}
    </div>
  );
}