import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteSubmissionButtonCompact from "./submission/[id]/DeletesubmissionbuttonCompact";
import { Clock, CheckCircle2, XCircle, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

import {
  JENIS_KARYA_LABEL,
  STATUS_LABEL,
  STATUS_COLOR,
  formatTanggal,
} from "@/lib/helpers";

const PAGE_SIZE = 20;

const STATUS_ICON: Record<string, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
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

  const [
    { data: submissions, count },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
    { count: totalCount },
  ] = await Promise.all([
    query,
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
  ]);

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  const tabs = [
    { key: "pending", label: "Menunggu Review", count: pendingCount ?? 0 },
    { key: "approved", label: "Disetujui", count: approvedCount ?? 0 },
    { key: "rejected", label: "Ditolak", count: rejectedCount ?? 0 },
    { key: "all", label: "Semua", count: totalCount ?? 0 },
  ];

  const statCards = [
    { label: "Menunggu Review", value: pendingCount ?? 0, icon: Clock, tone: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Disetujui", value: approvedCount ?? 0, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Ditolak", value: rejectedCount ?? 0, icon: XCircle, tone: "text-rose-600 bg-rose-50 border-rose-200" },
    { label: "Total Submission", value: totalCount ?? 0, icon: Inbox, tone: "text-[#0B3358] bg-[#EEF3F8] border-[#0B3358]/15" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#E4E9EF] pb-6">
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
          <div className="flex shrink-0 gap-2">
            <Link
              href="/admin/users"
              className="rounded-lg border border-[#E4E9EF] px-4 py-2.5 text-sm font-medium text-[#10202F] transition-colors hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
            >
              Kelola Akun Mahasiswa/Dosen
            </Link>
            <Link
              href="/admin/staff"
              className="rounded-lg border border-[#E4E9EF] px-4 py-2.5 text-sm font-medium text-[#10202F] transition-colors hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
            >
              Kelola Akun Staff
            </Link>
          </div>
        )}
      </div>

      {/* Kartu statistik */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.tone}`}>
            <s.icon className="mb-2 h-4 w-4" />
            <p className="text-xl font-semibold leading-none">{s.value}</p>
            <p className="mt-1.5 text-xs font-medium leading-tight opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs — sticky, dengan badge count */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex gap-1 border-b border-[#E4E9EF] bg-white/90 px-4 backdrop-blur">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin?status=${tab.key}`}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeStatus === tab.key
                ? "border-[#0B3358] text-[#0B3358]"
                : "border-transparent text-[#64748B] hover:text-[#10202F]"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                activeStatus === tab.key ? "bg-[#0B3358] text-white" : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {(!submissions || submissions.length === 0) && (
        <div className="rounded-xl border border-dashed border-[#E4E9EF] bg-[#F7F9FB] p-10 text-center">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-[#94A3B8]" />
          <p className="text-sm text-[#64748B]">
            {EMPTY_MESSAGE[activeStatus] ?? "Tidak ada submission di kategori ini."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {submissions?.map((s) => {
          const StatusIcon = STATUS_ICON[s.status];
          return (
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
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {STATUS_LABEL[s.status]}
                  </span>
                  <DeleteSubmissionButtonCompact submissionId={s.id} />
                </div>
              </div>
              <p className="text-sm text-[#64748B]">
                {s.profiles?.full_name} ({s.profiles?.identifier}) <span className="mx-1.5 text-[#0B3358]">•</span> {JENIS_KARYA_LABEL[s.jenis_karya]} <span className="mx-1.5 text-[#0B3358]">•</span> {s.tahun} <span className="mx-1.5 text-[#0B3358]">•</span> {formatTanggal(s.created_at)}
              </p>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-[#E4E9EF] pt-5">
          <p className="text-sm text-[#64748B]">
            Halaman {currentPage} dari {totalPages} <span className="mx-1.5 text-[#0B3358]">•</span> {count} submission
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin?status=${activeStatus}&page=${currentPage - 1}`}
              className={`inline-flex items-center gap-1 rounded-lg border border-[#E4E9EF] px-3.5 py-2 text-sm font-medium transition-colors ${
                currentPage <= 1
                  ? "pointer-events-none opacity-40"
                  : "text-[#10202F] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
              }`}
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </Link>
            <Link
              href={`/admin?status=${activeStatus}&page=${currentPage + 1}`}
              className={`inline-flex items-center gap-1 rounded-lg border border-[#E4E9EF] px-3.5 py-2 text-sm font-medium transition-colors ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-40"
                  : "text-[#10202F] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
              }`}
            >
              Selanjutnya <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}