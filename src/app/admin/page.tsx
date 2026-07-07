import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteSubmissionButtonCompact from "./submission/[id]/DeletesubmissionbuttonCompact";

import {
  JENIS_KARYA_LABEL,
  STATUS_LABEL,
  STATUS_COLOR,
  formatTanggal,
} from "@/lib/helpers";

const PAGE_SIZE = 20;

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
};

const EMPTY_MESSAGE: Record<string, string> = {
  pending: "Semua submission sudah direview. Kerja bagus!",
  approved: "Belum ada karya yang disetujui di kategori ini.",
  rejected: "Belum ada karya yang ditolak di kategori ini.",
  all: "Belum ada submission yang masuk.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page } = await searchParams;
  const activeStatus = status ?? "pending";
  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

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

  const isSuperAdmin = profile?.role === "admin";
  const canModerate = isSuperAdmin || profile?.role === "staff";
  if (!canModerate) redirect("/dashboard");

  let query = supabase
    .from("submissions")
    .select("*, profiles!submissions_user_id_fkey(full_name, identifier)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: submissions, count } = await query;
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  const tabs = [
    { key: "pending", label: "Menunggu Review" },
    { key: "approved", label: "Disetujui" },
    { key: "rejected", label: "Ditolak" },
    { key: "all", label: "Semua" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#E4E9EF] pb-6">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#64748B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
            Panel Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">
            Dashboard Admin
          </h1>
        </div>
        {isSuperAdmin && (
          <Link
            href="/admin/staff"
            className="shrink-0 rounded-lg border border-[#E4E9EF] px-4 py-2.5 text-sm font-medium text-[#10202F] transition-colors hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
          >
            Kelola Akun Staff
          </Link>
        )}
      </div>

      <div className="mb-6 flex gap-1 border-b border-[#E4E9EF]">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin?status=${tab.key}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeStatus === tab.key
                ? "border-[#0B3358] text-[#0B3358]"
                : "border-transparent text-[#64748B] hover:text-[#10202F]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {(!submissions || submissions.length === 0) && (
        <div className="rounded-xl border border-dashed border-[#E4E9EF] bg-[#F7F9FB] p-10 text-center">
          <p className="text-sm text-[#64748B]">
            {EMPTY_MESSAGE[activeStatus] ?? "Tidak ada submission di kategori ini."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {submissions?.map((s) => (
          <Link
            key={s.id}
            href={`/admin/submission/${s.id}`}
            className="group relative block overflow-hidden rounded-xl border border-[#E4E9EF] bg-white p-5 transition-shadow hover:shadow-[0_1px_12px_rgba(11,51,88,0.08)]"
          >
            <span className="absolute inset-y-0 left-0 w-[3px] bg-[#0B3358] opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="mb-1.5 flex items-start justify-between gap-4">
              <h2 className="font-medium text-[#10202F]">{s.judul}</h2>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_COLOR[s.status]}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s.status]}`} />
                  {STATUS_LABEL[s.status]}
                </span>
                <DeleteSubmissionButtonCompact submissionId={s.id} />
              </div>
            </div>
            <p className="text-sm text-[#64748B]">
              {s.profiles?.full_name} ({s.profiles?.identifier}) <span className="mx-1.5 text-[#0B3358]">•</span> {JENIS_KARYA_LABEL[s.jenis_karya]} <span className="mx-1.5 text-[#0B3358]">•</span> {s.tahun} <span className="mx-1.5 text-[#0B3358]">•</span> {formatTanggal(s.created_at)}
            </p>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-[#E4E9EF] pt-5">
          <p className="text-sm text-[#64748B]">
            Halaman {currentPage} dari {totalPages} <span className="mx-1.5 text-[#0B3358]">•</span> {count} submission
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin?status=${activeStatus}&page=${currentPage - 1}`}
              className={`rounded-lg border border-[#E4E9EF] px-3.5 py-2 text-sm font-medium transition-colors ${
                currentPage <= 1
                  ? "pointer-events-none opacity-40"
                  : "text-[#10202F] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
              }`}
            >
              ← Sebelumnya
            </Link>
            <Link
              href={`/admin?status=${activeStatus}&page=${currentPage + 1}`}
              className={`rounded-lg border border-[#E4E9EF] px-3.5 py-2 text-sm font-medium transition-colors ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-40"
                  : "text-[#10202F] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
              }`}
            >
              Selanjutnya →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}