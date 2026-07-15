"use client";

import { useRef, useState, useTransition } from "react";
import {
  BookOpen,
  GraduationCap,
  UploadCloud,
  FileCheck2,
  X,
  ListChecks,
  AlertTriangle,
  MailWarning,
} from "lucide-react";
import { submitKarya } from "@/lib/actions/submissions";
import { CHECKLIST_ITEMS } from "@/lib/helpers";
import MultiSelectDosen, { type Dosen } from "@/components/MultiSelectDosen";

const TAHUN_SEKARANG = new Date().getFullYear();
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
      <Icon className="h-3.5 w-3.5 text-[#0B3358]" />
      {title}
    </h2>
  );
}

export default function UploadForm({
  defaultProgramStudi,
  userEmail,
  dosenList,
}: {
  defaultProgramStudi: string;
  userEmail: string;
  dosenList: Dosen[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [abstrakLength, setAbstrakLength] = useState(0);
  const [abstrakEnLength, setAbstrakEnLength] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    if (file && file.size > MAX_FILE_SIZE) {
      setError("Ukuran file melebihi 20MB.");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  }

  function clearFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(formData: FormData) {
    setError(null);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      setError("File PDF wajib diupload.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file melebihi 20MB.");
      return;
    }

    const pembimbingIds = formData.getAll("pembimbing_ids");
    if (pembimbingIds.length === 0) {
      setError("Pilih minimal satu dosen pembimbing.");
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
      {/* Peringatan email */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <MailWarning className="h-5 w-5 shrink-0 text-amber-600" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Pastikan email akun kamu benar</p>
          <p className="mt-0.5 text-amber-700">
            Notifikasi status review akan dikirim ke{" "}
            <span className="font-semibold">{userEmail}</span>. Kalau email ini
            salah atau tidak aktif, hubungi admin sebelum melanjutkan submit.
          </p>
        </div>
      </div>

      {/* Seksi: Informasi Karya */}
      <div className="rounded-xl border border-[#E4E9EF] bg-white p-5">
        <SectionHeader icon={BookOpen} title="Informasi Karya" />
        <div className="space-y-4">
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
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Ringkasan
              </label>
              <span className="text-[11px] text-[#94A3B8]">{abstrakLength} karakter</span>
            </div>
            <textarea
              name="ringkasan"
              required
              rows={5}
              placeholder="Ringkasan isi karya (akan tampil di halaman publik)"
              onChange={(e) => setAbstrakLength(e.target.value.length)}
              className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2.5 text-sm text-[#10202F] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Summary
              </label>
              <span className="text-[11px] text-[#94A3B8]">{abstrakEnLength} characters</span>
            </div>
            <textarea
              name="summary"
              required
              rows={5}
              placeholder="English summary of the work (shown on the public page)"
              onChange={(e) => setAbstrakEnLength(e.target.value.length)}
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
                <option value="karya_tulis_ilmiah">Karya Tulis Ilmiah</option>
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
        </div>
      </div>

      {/* Seksi: Detail Akademik */}
      <div className="rounded-xl border border-[#E4E9EF] bg-white p-5">
        <SectionHeader icon={GraduationCap} title="Detail Akademik" />
        <div className="space-y-4">
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
              Dosen Pembimbing
            </label>
            <MultiSelectDosen dosenList={dosenList} />
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
        </div>
      </div>

      {/* Seksi: Dokumen */}
      <div className="rounded-xl border border-[#E4E9EF] bg-white p-5">
        <SectionHeader icon={UploadCloud} title="Dokumen" />

        {!selectedFile ? (
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#E4E9EF] bg-[#F7F9FB] px-4 py-8 text-center transition-colors hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
          >
            <UploadCloud className="h-7 w-7 text-[#94A3B8]" />
            <span className="text-sm font-medium text-[#10202F]">
              Klik untuk memilih file PDF
            </span>
            <span className="text-xs text-[#94A3B8]">Maksimal 20MB</span>
          </label>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#0B3358]/15 bg-[#EEF3F8] px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <FileCheck2 className="h-5 w-5 shrink-0 text-[#0B3358]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#10202F]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#64748B]">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="shrink-0 rounded-lg p-1.5 text-[#64748B] transition-colors hover:bg-white hover:text-rose-600"
              aria-label="Hapus file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          id="file-upload"
          name="file"
          type="file"
          accept="application/pdf"
          required
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Seksi: Checklist */}
      <div className="rounded-xl border border-[#E4E9EF] bg-[#F7F9FB] p-5">
        <SectionHeader icon={ListChecks} title="Checklist Persyaratan (wajib dicentang semua)" />
        <div className="space-y-2.5">
          {CHECKLIST_ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm text-[#334155] transition-colors hover:bg-white"
            >
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
        <p className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
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