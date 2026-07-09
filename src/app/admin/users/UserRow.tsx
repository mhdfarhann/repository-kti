"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserAccount, deleteUserAccount } from "@/lib/actions/admin";

type User = {
  id: string;
  full_name: string;
  identifier: string;
  role: string;
  program_studi: string | null;
  email: string | null;
};

export default function UserRow({ user }: { user: User }) {
  const [mode, setMode] = useState<"view" | "edit" | "confirmDelete">("view");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleEditSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateUserAccount(user.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setMode("view");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteUserAccount(user.id);
      if (result?.error) {
        setError(result.error);
        setMode("view");
      } else {
        router.refresh();
      }
    });
  }

  if (mode === "edit") {
    return (
      <form
        action={handleEditSubmit}
        className="space-y-3 rounded-xl border border-[#0B3358]/30 bg-[#EEF3F8] p-5"
      >
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              user.role === "mahasiswa"
                ? "bg-sky-100 text-sky-700"
                : "bg-violet-100 text-violet-700"
            }`}
          >
            {user.role}
          </span>
          <span className="text-xs text-[#64748B]">Edit Akun</span>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Nama Lengkap
          </label>
          <input
            name="full_name"
            defaultValue={user.full_name}
            required
            className="w-full rounded-lg border border-[#E4E9EF] bg-white px-3 py-2 text-sm outline-none focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              {user.role === "mahasiswa" ? "NIM" : "NIDN"}
            </label>
            <input
              name="identifier"
              defaultValue={user.identifier}
              required
              className="w-full rounded-lg border border-[#E4E9EF] bg-white px-3 py-2 text-sm outline-none focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Program Studi
            </label>
            <input
              name="program_studi"
              defaultValue={user.program_studi ?? ""}
              className="w-full rounded-lg border border-[#E4E9EF] bg-white px-3 py-2 text-sm outline-none focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={user.email ?? ""}
            className="w-full rounded-lg border border-[#E4E9EF] bg-white px-3 py-2 text-sm outline-none focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Password Baru{" "}
            <span className="font-normal normal-case tracking-normal text-[#94A3B8]">
              (kosongkan jika tidak ingin reset)
            </span>
          </label>
          <input
            name="password"
            type="password"
            minLength={8}
            placeholder="••••••••"
            className="w-full rounded-lg border border-[#E4E9EF] bg-white px-3 py-2 text-sm outline-none focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            disabled={pending}
            className="rounded-lg bg-[#0B3358] px-4 py-2 text-sm font-medium text-white hover:bg-[#082944] disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("view");
              setError(null);
            }}
            disabled={pending}
            className="rounded-lg border border-[#E4E9EF] px-4 py-2 text-sm font-medium text-[#10202F] hover:bg-white"
          >
            Batal
          </button>
        </div>
      </form>
    );
  }

  if (mode === "confirmDelete") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
        <p className="mb-3 text-sm text-rose-800">
          Yakin ingin menghapus akun <strong>{user.full_name}</strong> (
          {user.identifier}) secara permanen? Akun ini tidak akan bisa login
          lagi dan NIM/NIDN-nya akan bisa didaftarkan ulang.
        </p>
        <p className="mb-4 text-xs text-rose-600">
          Catatan: Jika akun ini masih punya submission, hapus semua submission
          terlebih dahulu melalui halaman review admin.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {pending ? "Menghapus..." : "Ya, Hapus Permanen"}
          </button>
          <button
            onClick={() => {
              setMode("view");
              setError(null);
            }}
            disabled={pending}
            className="rounded-lg border border-[#E4E9EF] px-4 py-2 text-sm font-medium text-[#10202F] hover:bg-white"
          >
            Batal
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      </div>
    );
  }

  // View mode
  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-[#E4E9EF] bg-white px-5 py-4 text-sm transition-shadow hover:shadow-[0_1px_12px_rgba(11,51,88,0.06)]">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <p className="truncate font-medium text-[#10202F]">
            {user.full_name}
          </p>
          <span
            className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              user.role === "mahasiswa"
                ? "bg-sky-100 text-sky-700"
                : "bg-violet-100 text-violet-700"
            }`}
          >
            {user.role}
          </span>
        </div>
        <p className="text-[#64748B]">
          {user.identifier}
          {user.program_studi && (
            <>
              <span className="mx-1.5 text-[#CBD5E1]">•</span>
              {user.program_studi}
            </>
          )}
          {user.email && (
            <>
              <span className="mx-1.5 text-[#CBD5E1]">•</span>
              {user.email}
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setMode("edit")}
          className="rounded-lg border border-[#E4E9EF] px-3 py-1.5 text-xs font-medium text-[#10202F] transition-colors hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
        >
          Edit
        </button>
        <button
          onClick={() => setMode("confirmDelete")}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
