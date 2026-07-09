import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserRow from "./UserRow";
import { formatTanggal } from "@/lib/helpers";
import {
  Users,
  GraduationCap,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const PAGE_SIZE = 20;

const ROLE_LABEL: Record<string, string> = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
  all: "Semua",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; page?: string; q?: string }>;
}) {
  const { role, page, q } = await searchParams;
  const activeRole = role ?? "all";
  const currentPage = Math.max(1, Number(page) || 1);
  const searchQuery = q?.trim() || "";
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

  // Build query berdasarkan filter
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .in("role", ["mahasiswa", "dosen"])
    .order("created_at", { ascending: false })
    .range(from, to);

  if (activeRole !== "all") {
    query = query.eq("role", activeRole);
  }

  if (searchQuery) {
    query = query.or(
      `full_name.ilike.%${searchQuery}%,identifier.ilike.%${searchQuery}%`
    );
  }

  // Fetch data + counts
  const [
    { data: users, count },
    { count: mahasiswaCount },
    { count: dosenCount },
    { count: totalCount },
  ] = await Promise.all([
    query,
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mahasiswa"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "dosen"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("role", ["mahasiswa", "dosen"]),
  ]);

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  // Bangun URL dasar untuk tab/pagination
  function buildUrl(params: {
    role?: string;
    page?: number;
    q?: string;
  }) {
    const sp = new URLSearchParams();
    const r = params.role ?? activeRole;
    if (r !== "all") sp.set("role", r);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const query = params.q ?? searchQuery;
    if (query) sp.set("q", query);
    const qs = sp.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  }

  const tabs = [
    { key: "all", label: "Semua", count: totalCount ?? 0, icon: Users },
    {
      key: "mahasiswa",
      label: "Mahasiswa",
      count: mahasiswaCount ?? 0,
      icon: GraduationCap,
    },
    {
      key: "dosen",
      label: "Dosen",
      count: dosenCount ?? 0,
      icon: BookOpen,
    },
  ];

  const statCards = [
    {
      label: "Mahasiswa",
      value: mahasiswaCount ?? 0,
      icon: GraduationCap,
      tone: "text-sky-600 bg-sky-50 border-sky-200",
    },
    {
      label: "Dosen",
      value: dosenCount ?? 0,
      icon: BookOpen,
      tone: "text-violet-600 bg-violet-50 border-violet-200",
    },
    {
      label: "Total Akun",
      value: totalCount ?? 0,
      icon: Users,
      tone: "text-[#0B3358] bg-[#EEF3F8] border-[#0B3358]/15",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 border-b border-[#E4E9EF] pb-6">
        <Link
          href="/admin"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0B3358]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
          Khusus Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">
          Kelola Akun Mahasiswa & Dosen
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B]">
          Edit data profil, reset password, atau hapus akun mahasiswa dan dosen
          yang terdaftar di sistem.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.tone}`}>
            <s.icon className="mb-2 h-4 w-4" />
            <p className="text-xl font-semibold leading-none">{s.value}</p>
            <p className="mt-1.5 text-xs font-medium leading-tight opacity-80">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <form className="mb-4">
        {activeRole !== "all" && (
          <input type="hidden" name="role" value={activeRole} />
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            name="q"
            type="search"
            defaultValue={searchQuery}
            placeholder="Cari berdasarkan nama atau NIM/NIDN..."
            className="w-full rounded-xl border border-[#E4E9EF] bg-white py-2.5 pl-10 pr-4 text-sm text-[#10202F] outline-none transition-colors focus:border-[#0B3358] focus:ring-2 focus:ring-[#0B3358]/10"
          />
        </div>
      </form>

      {/* Active search indicator */}
      {searchQuery && (
        <div className="mb-4 flex items-center gap-2 text-sm text-[#64748B]">
          <span>
            Hasil pencarian untuk &ldquo;
            <strong className="text-[#10202F]">{searchQuery}</strong>
            &rdquo; — {count ?? 0} ditemukan
          </span>
          <Link
            href={buildUrl({ q: "", page: 1 })}
            className="rounded-md border border-[#E4E9EF] px-2 py-0.5 text-xs font-medium text-[#64748B] hover:bg-[#EEF3F8]"
          >
            Reset
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex gap-1 border-b border-[#E4E9EF] bg-white/90 px-4 backdrop-blur">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={buildUrl({ role: tab.key, page: 1 })}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeRole === tab.key
                ? "border-[#0B3358] text-[#0B3358]"
                : "border-transparent text-[#64748B] hover:text-[#10202F]"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                activeRole === tab.key
                  ? "bg-[#0B3358] text-white"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {(!users || users.length === 0) && (
        <div className="rounded-xl border border-dashed border-[#E4E9EF] bg-[#F7F9FB] p-10 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-[#94A3B8]" />
          <p className="text-sm text-[#64748B]">
            {searchQuery
              ? "Tidak ada akun yang cocok dengan pencarian."
              : `Belum ada akun ${ROLE_LABEL[activeRole]?.toLowerCase() ?? ""} yang terdaftar.`}
          </p>
        </div>
      )}

      {/* User list */}
      <div className="space-y-2">
        {users?.map((u) => (
          <UserRow
            key={u.id}
            user={{
              id: u.id,
              full_name: u.full_name,
              identifier: u.identifier,
              role: u.role,
              program_studi: u.program_studi,
              email: u.email,
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-[#E4E9EF] pt-5">
          <p className="text-sm text-[#64748B]">
            Halaman {currentPage} dari {totalPages}
            <span className="mx-1.5 text-[#0B3358]">•</span>
            {count} akun
          </p>
          <div className="flex gap-2">
            <Link
              href={buildUrl({ page: currentPage - 1 })}
              className={`inline-flex items-center gap-1 rounded-lg border border-[#E4E9EF] px-3.5 py-2 text-sm font-medium transition-colors ${
                currentPage <= 1
                  ? "pointer-events-none opacity-40"
                  : "text-[#10202F] hover:border-[#0B3358]/30 hover:bg-[#EEF3F8]"
              }`}
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </Link>
            <Link
              href={buildUrl({ page: currentPage + 1 })}
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
