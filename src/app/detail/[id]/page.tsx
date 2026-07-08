import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  GraduationCap,
  UserCheck,
  Calendar,
  Tag,
  CalendarCheck,
  FileText,
  // Lock, // dipakai lagi saat fitur "ajukan akses" diaktifkan
} from "lucide-react";
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

  const metaItems = [
    { icon: User, label: "Penulis", value: item.penulis },
    { icon: GraduationCap, label: "Program Studi", value: item.program_studi },
    item.pembimbing && { icon: UserCheck, label: "Pembimbing", value: item.pembimbing },
    { icon: Calendar, label: "Tahun", value: item.tahun },
    item.kata_kunci && { icon: Tag, label: "Kata Kunci", value: item.kata_kunci },
    { icon: CalendarCheck, label: "Dipublikasikan", value: formatTanggal(item.reviewed_at) },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0B3358]"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke pencarian
        </Link>

        <span className="shrink-0 rounded-full border border-[#0B3358]/15 bg-[#EEF3F8] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#0B3358]">
          {JENIS_KARYA_LABEL[item.jenis_karya]}
        </span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold leading-snug tracking-tight text-[#10202F]">
        {item.judul}
      </h1>

      {/* Kartu metadata */}
      <div className="mb-8 grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-[#E4E9EF] bg-[#F7F9FB] p-5 sm:grid-cols-2">
        {metaItems.map((m) => (
          <div key={m.label} className="flex items-start gap-2.5">
            <m.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0B3358]/60" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                {m.label}
              </p>
              <p className="text-sm text-[#334155]">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
          <FileText className="h-3.5 w-3.5" />
          Abstrak
        </h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#334155]">
          {item.abstrak}
        </p>
      </div>

      {/* 
        Fitur "Ajukan Akses Full Text" — disembunyikan sementara, belum dipakai.
        Aktifkan lagi dengan uncomment blok di bawah + import Lock dari lucide-react.

      <div className="relative mt-8 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/60 p-5">
        <Lock className="absolute -right-2 -top-2 h-16 w-16 text-amber-200/60" />
        <div className="relative">
          <h2 className="mb-1 flex items-center gap-2 font-medium text-amber-900">
            <Lock className="h-4 w-4" />
            Dokumen lengkap tidak tersedia untuk diunduh publik
          </h2>
          <p className="mb-4 text-sm text-amber-800">
            Untuk mengakses dokumen lengkap, silakan ajukan permintaan akses.
            Permintaan akan ditinjau oleh bagian akademik.
          </p>
          <Link
            href={`/request-access/${item.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B3358] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#082944]"
          >
            Ajukan Akses Full Text
          </Link>
        </div>
      </div>
      */}
    </div>
  );
}