import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { JENIS_KARYA_LABEL } from "@/lib/helpers";

const PAGE_SIZE = 12;

const JENIS_OPTIONS = [
  { key: "all", label: "Semua Jenis" },
  { key: "skripsi", label: "Skripsi" },
  { key: "laporan_ta", label: "Laporan Tugas Akhir" },
  { key: "kti_dosen", label: "Karya Ilmiah Dosen" },
  { key: "jurnal", label: "Jurnal" },
  { key: "lainnya", label: "Lainnya" },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; jenis?: string; page?: string }>;
}) {
  const { q, jenis, page } = await searchParams;
  const keyword = q ?? "";
  const activeJenis = jenis ?? "all";
  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("public_submissions")
    .select("*", { count: "exact" })
    .order("reviewed_at", { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.or(
      `judul.ilike.%${keyword}%,kata_kunci.ilike.%${keyword}%,penulis.ilike.%${keyword}%`
    );
  }
  if (activeJenis !== "all") {
    query = query.eq("jenis_karya", activeJenis);
  }

  const { data: results, count } = await query;
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 border-b border-[#E4E9EF] pb-6">
        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
          Repositori Publik
        </p>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-[#10202F]">
          Cari Karya Tulis Ilmiah
        </h1>
        <p className="mb-5 text-sm text-[#64748B]">
          Repositori skripsi, laporan tugas akhir, dan karya ilmiah Akademi Akupunktur Aceh.
        </p>

        <form className="flex gap-2">
          <input type="hidden" name="jenis" value={activeJenis} />
          <input
            name="q"
            defaultValue={keyword}
            placeholder="Cari judul, penulis, atau kata kunci..."
            className="w-full rounded-lg border border-[#E4E9EF] px-4 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-[#0B3358] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#082944]"
          >
            Cari
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {JENIS_OPTIONS.map((opt) => (
            <Link
              key={opt.key}
              href={`/search?q=${encodeURIComponent(keyword)}&jenis=${opt.key}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeJenis === opt.key
                  ? "border-[#0B3358] bg-[#0B3358] text-white"
                  : "border-[#E4E9EF] text-[#334155] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {(!results || results.length === 0) && (
        <div className="rounded-xl border border-dashed border-[#E4E9EF] bg-[#F7F9FB] p-10 text-center">
          <p className="text-sm text-[#64748B]">
            {keyword ? "Tidak ada hasil yang cocok." : "Belum ada karya yang dipublikasikan."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {results?.map((r) => (
          <Link
            key={r.id}
            href={`/detail/${r.id}`}
            className="group relative block overflow-hidden rounded-xl border border-[#E4E9EF] bg-white p-5 transition-shadow hover:shadow-[0_1px_12px_rgba(11,51,88,0.08)]"
          >
            <span className="absolute inset-y-0 left-0 w-[3px] bg-[#0B3358] opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="mb-2 inline-block rounded-full border border-[#0B3358]/15 bg-[#EEF3F8] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#0B3358]">
              {JENIS_KARYA_LABEL[r.jenis_karya]}
            </span>
            <h2 className="mb-1 font-medium text-[#10202F]">{r.judul}</h2>
            <p className="mb-2 text-sm text-[#64748B]">
              {r.penulis} <span className="mx-1.5 text-[#0B3358]">•</span> {r.tahun} <span className="mx-1.5 text-[#0B3358]">•</span> {r.program_studi}
            </p>
            <p className="line-clamp-2 text-sm text-[#475569]">{r.abstrak}</p>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-[#E4E9EF] pt-5">
          <p className="text-sm text-[#64748B]">
            Halaman {currentPage} dari {totalPages} <span className="mx-1.5 text-[#0B3358]">•</span> {count} karya
          </p>
          <div className="flex gap-2">
            <Link
              href={`/search?q=${encodeURIComponent(keyword)}&jenis=${activeJenis}&page=${currentPage - 1}`}
              className={`rounded-lg border border-[#E4E9EF] px-3.5 py-2 text-sm font-medium transition-colors ${
                currentPage <= 1
                  ? "pointer-events-none opacity-40"
                  : "text-[#10202F] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
              }`}
            >
              ← Sebelumnya
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(keyword)}&jenis=${activeJenis}&page=${currentPage + 1}`}
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