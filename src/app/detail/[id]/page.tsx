import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JENIS_KARYA_LABEL, formatTanggal } from "@/lib/helpers";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("public_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/search"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0B3358]"
      >
        ← Kembali ke pencarian
      </Link>

      <span className="mb-3 inline-block rounded-full border border-[#0B3358]/15 bg-[#EEF3F8] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#0B3358]">
        {JENIS_KARYA_LABEL[item.jenis_karya]}
      </span>

      <h1 className="mb-4 text-2xl font-semibold tracking-tight text-[#10202F]">
        {item.judul}
      </h1>

      <div className="mb-8 space-y-1.5 border-b border-[#E4E9EF] pb-6 text-sm text-[#475569]">
        <p><span className="font-medium text-[#10202F]">Penulis:</span> {item.penulis}</p>
        <p><span className="font-medium text-[#10202F]">Program Studi:</span> {item.program_studi}</p>
        {item.pembimbing && (
          <p><span className="font-medium text-[#10202F]">Pembimbing:</span> {item.pembimbing}</p>
        )}
        <p><span className="font-medium text-[#10202F]">Tahun:</span> {item.tahun}</p>
        {item.kata_kunci && (
          <p><span className="font-medium text-[#10202F]">Kata Kunci:</span> {item.kata_kunci}</p>
        )}
        <p><span className="font-medium text-[#10202F]">Dipublikasikan:</span> {formatTanggal(item.reviewed_at)}</p>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
          Abstrak
        </h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#334155]">
          {item.abstrak}
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
        <h2 className="mb-1 font-medium text-amber-900">
          Dokumen lengkap tidak tersedia untuk diunduh publik
        </h2>
        <p className="mb-4 text-sm text-amber-800">
          Untuk mengakses dokumen lengkap, silakan ajukan permintaan akses.
          Permintaan akan ditinjau oleh bagian akademik.
        </p>
        <Link
          href={`/request-access/${item.id}`}
          className="inline-block rounded-lg bg-[#0B3358] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#082944]"
        >
          Ajukan Akses Full Text
        </Link>
      </div>
    </div>
  );
}