"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStaffAccount, deleteStaffAccount } from "@/lib/actions/admin";

type Staff = {
  id: string;
  full_name: string;
  identifier: string;
  role: string;
};

export default function StaffRow({ staff }: { staff: Staff }) {
  const [mode, setMode] = useState<"view" | "edit" | "confirmDelete">("view");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleEditSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateStaffAccount(staff.id, formData);
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
      const result = await deleteStaffAccount(staff.id);
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
        className="space-y-3 rounded-lg border border-[#0B3358]/30 bg-[#EEF3F8] p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Nama Lengkap
          </label>
          <input
            name="full_name"
            defaultValue={staff.full_name}
            required
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2 text-sm outline-none focus:border-[#0B3358]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Identifier
          </label>
          <input
            name="identifier"
            defaultValue={staff.identifier}
            required
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2 text-sm outline-none focus:border-[#0B3358]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Role
          </label>
          <select
            name="role"
            defaultValue={staff.role}
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2 text-sm outline-none focus:border-[#0B3358]"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Password Baru (kosongkan jika tidak ingin reset)
          </label>
          <input
            name="password"
            type="password"
            minLength={8}
            className="w-full rounded-lg border border-[#E4E9EF] px-3 py-2 text-sm outline-none focus:border-[#0B3358]"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex gap-2">
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
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
        <p className="mb-3 text-sm text-rose-800">
          Yakin ingin menghapus akun staff <strong>{staff.full_name}</strong> secara
          permanen? Akun ini tidak akan bisa login lagi.
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
            onClick={() => setMode("view")}
            disabled={pending}
            className="rounded-lg border border-[#E4E9EF] px-4 py-2 text-sm font-medium text-[#10202F] hover:bg-white"
          >
            Batal
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#E4E9EF] bg-white px-4 py-3 text-sm">
      <div>
        <p className="font-medium text-[#10202F]">{staff.full_name}</p>
        <p className="text-[#64748B]">
          {staff.identifier} <span className="mx-1.5">•</span> {staff.role}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setMode("edit")}
          className="rounded-lg border border-[#E4E9EF] px-3 py-1.5 text-xs font-medium text-[#10202F] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
        >
          Edit
        </button>
        <button
          onClick={() => setMode("confirmDelete")}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
        >
          Hapus
        </button>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  );
}