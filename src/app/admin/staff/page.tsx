import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateStaffForm from "./CreateStaffForm";

const PAGE_SIZE = 20;

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
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

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: staffList, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "staff")
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#64748B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
        Khusus Super Admin
      </p>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-[#10202F]">
        Kelola Akun Staff
      </h1>
      <p className="mb-6 text-sm text-[#64748B]">
        Akun staff punya akses untuk mereview dan menyetujui/menolak submission, tapi tidak bisa mengelola akun staff lain.
      </p>

      <div className="mb-8">
        <CreateStaffForm />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#64748B]">
        Daftar Staff ({count ?? 0})
      </h2>

      {(!staffList || staffList.length === 0) && (
        <div className="rounded-xl border border-dashed border-[#E4E9EF] bg-[#F7F9FB] p-8 text-center">
          <p className="text-sm text-[#64748B]">Belum ada akun staff.</p>
        </div>
      )}

      <div className="space-y-2">
        {staffList?.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-[#E4E9EF] bg-white px-4 py-3 text-sm"
          >
            <p className="font-medium text-[#10202F]">{s.full_name}</p>
            <p className="text-[#64748B]">{s.identifier}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-[#64748B]">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin/staff?page=${currentPage - 1}`}
              className={`rounded-lg border border-[#E4E9EF] px-3.5 py-2 text-sm font-medium transition-colors ${
                currentPage <= 1
                  ? "pointer-events-none opacity-40"
                  : "text-[#10202F] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
              }`}
            >
              ← Sebelumnya
            </Link>
            <Link
              href={`/admin/staff?page=${currentPage + 1}`}
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