import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  JENIS_KARYA_LABEL,
  STATUS_LABEL,
  STATUS_COLOR,
  formatTanggal,
} from "@/lib/helpers";

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 flex items-end justify-between gap-4 border-b border-[#E4E9EF] pb-6">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#64748B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
            Repositori Karya
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">
            Karya Saya
          </h1>
        </div>
        <Link
          href="/upload"
          className="shrink-0 rounded-lg bg-[#0B3358] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#082944]"
        >
          + Upload Karya Baru
        </Link>
        
      </div>

      {submitted === "1" && (
        <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Karya berhasil disubmit dan sedang menunggu review dari bagian akademik.
        </p>
      )}

      {(!submissions || submissions.length === 0) && (
        <div className="rounded-xl border border-dashed border-[#E4E9EF] bg-[#F7F9FB] p-10 text-center">
          <p className="text-sm text-[#64748B]">
            Kamu belum mengupload karya apapun.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {submissions?.map((s) => (
          <div
            key={s.id}
            className="group relative overflow-hidden rounded-xl border border-[#E4E9EF] bg-white p-5 transition-shadow hover:shadow-[0_1px_12px_rgba(11,51,88,0.08)]"
          >
            <span className="absolute inset-y-0 left-0 w-[3px] bg-[#0B3358] opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-2 flex items-start justify-between gap-4">
              <h2 className="font-medium text-[#10202F]">{s.judul}</h2>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_COLOR[s.status]}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s.status]}`} />
                {STATUS_LABEL[s.status]}
              </span>
            </div>
            <p className="text-sm text-[#64748B]">
              {JENIS_KARYA_LABEL[s.jenis_karya]} <span className="mx-1.5 text-[#0B3358]">•</span> {s.tahun} <span className="mx-1.5 text-[#0B3358]">•</span> Diupload {formatTanggal(s.created_at)}
            </p>
            {s.status === "rejected" && s.catatan_reviewer && (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <strong>Catatan reviewer:</strong> {s.catatan_reviewer}
              </p>
            )}
            {s.status === "approved" && (
              <Link
                href={`/detail/${s.id}`}
                className="mt-3 inline-block text-sm font-medium text-[#0B3358] hover:underline underline-offset-4"
              >
                Lihat halaman publik →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}