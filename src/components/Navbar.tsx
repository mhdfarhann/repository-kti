import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutUser } from "@/lib/actions/auth";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string; role: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const isSuperAdmin = profile?.role === "admin";
  const isStaff = profile?.role === "staff";
  const canModerate = isSuperAdmin || isStaff;
  const isMahasiswaDosen = user && !canModerate;

  return (
    <header className="border-b border-[#E4E9EF] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link href="/search" className="flex items-center gap-3">
          <Image
            src="/aaa-logo.png"
            alt="Logo Akademi Akupunktur Aceh"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-[#0B3358]">
              Repository KTI
            </span>
            <span className="block text-xs text-[#64748B]">
              Akademi Akupunktur Aceh
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/search"
            className="rounded-lg px-3 py-2 font-medium text-[#334155] transition-colors hover:bg-[#EEF3F8] hover:text-[#0B3358]"
          >
            Cari Karya
          </Link>

          {!user && (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 font-medium text-[#334155] transition-colors hover:bg-[#EEF3F8] hover:text-[#0B3358]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="ml-1 rounded-lg bg-[#0B3358] px-4 py-2 font-medium text-white transition-colors hover:bg-[#082944]"
              >
                Daftar
              </Link>
            </>
          )}

          {isMahasiswaDosen && (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 font-medium text-[#334155] transition-colors hover:bg-[#EEF3F8] hover:text-[#0B3358]"
              >
                Karya Saya
              </Link>
              <Link
                href="/upload"
                className="rounded-lg px-3 py-2 font-medium text-[#334155] transition-colors hover:bg-[#EEF3F8] hover:text-[#0B3358]"
              >
                Upload
              </Link>
            </>
          )}

          {canModerate && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 font-medium text-[#334155] transition-colors hover:bg-[#EEF3F8] hover:text-[#0B3358]"
            >
              {isSuperAdmin ? "Dashboard Admin" : "Dashboard"}
            </Link>
          )}

          {user && (
            <form action={logoutUser} className="ml-2 border-l border-[#E4E9EF] pl-2">
              <button className="rounded-lg px-3 py-2 font-medium text-[#64748B] transition-colors hover:bg-rose-50 hover:text-rose-700">
                Keluar ({profile?.full_name ?? "..."})
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}