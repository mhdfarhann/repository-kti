"use client";

import { useState, useTransition } from "react";
import { submitKarya } from "@/lib/actions/submissions";
import { CHECKLIST_ITEMS } from "@/lib/helpers";

const TAHUN_SEKARANG = new Date().getFullYear();

export default function UploadForm({
  defaultProgramStudi,
}: {
  defaultProgramStudi: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      setError("File PDF wajib diupload.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Ukuran file melebihi 20MB.");
      return;
    }

    startTransition(async () => {
      try {
        // File dikirim langsung sebagai bagian dari FormData ke server action.
        // Server yang akan mengupload ke cPanel via FTPS — kredensial FTP tidak
        // pernah ada di sisi browser, beda dari alur lama yang upload langsung
        // ke Supabase Storage dari client.
        const result = await submitKarya(formData);
        if (result?.error) {
          setError(result.error);
        }
      } catch (err) {
        setError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Judul Karya
        </label>
        <input
          name="judul"
          required
          className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Abstrak
        </label>
        <textarea
          name="abstrak"
          required
          rows={5}
          placeholder="Ringkasan isi karya (akan tampil di halaman publik)"
          className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Jenis Karya
          </label>
          <select
            name="jenis_karya"
            required
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          >
            <option value="skripsi">Skripsi</option>
            <option value="laporan_ta">Laporan Tugas Akhir</option>
            <option value="kti_dosen">Karya Ilmiah Dosen</option>
            <option value="jurnal">Jurnal</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Tahun
          </label>
          <input
            name="tahun"
            type="number"
            required
            defaultValue={TAHUN_SEKARANG}
            min={2000}
            max={TAHUN_SEKARANG + 1}
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Program Studi
        </label>
        <input
          name="program_studi"
          required
          defaultValue={defaultProgramStudi}
          className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Pembimbing
        </label>
        <input
          name="pembimbing"
          placeholder="Nama pembimbing (opsional)"
          className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Kata Kunci
        </label>
        <input
          name="kata_kunci"
          placeholder="Pisahkan dengan koma, misal: akupunktur, nyeri punggung"
          className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          File PDF (maks. 20MB)
        </label>
        <input
          name="file"
          type="file"
          accept="application/pdf"
          required
          className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-[#EEF3F8] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#0B3358] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
        />
      </div>

      <div className="rounded-xl border border-[#E4E9EF] bg-[#F7F9FB] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Checklist Persyaratan (wajib dicentang semua)
        </p>
        <div className="space-y-2.5">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item.key} className="flex items-start gap-2.5 text-sm text-[#334155]">
              <input
                type="checkbox"
                name={`checklist_${item.key}`}
                required
                className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#0B3358] focus:ring-[#0B3358]/30"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-lg bg-[#0B3358] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#082944] disabled:opacity-60"
      >
        {pending ? "Mengupload & menyimpan..." : "Submit untuk Review"}
      </button>
    </form>
  );
}