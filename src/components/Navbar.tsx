import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutUser } from "@/lib/actions/auth";
import MobileMenu from "@/components/MobileMenu";
import UserMenu from "@/components/UserMenu";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  staff: "Staf Akademik",
};

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

  const links = [
    { href: "/search", label: "Cari Karya" },
    ...(isMahasiswaDosen
      ? [
          { href: "/dashboard", label: "Karya Saya" },
          { href: "/upload", label: "Upload" },
        ]
      : []),
    ...(canModerate
      ? [{ href: "/admin", label: isSuperAdmin ? "Dashboard Admin" : "Dashboard" }]
      : []),
  ];

  const roleLabel = isSuperAdmin
    ? ROLE_LABEL.admin
    : isStaff
    ? ROLE_LABEL.staff
    : "Mahasiswa / Dosen";

  const account = user
    ? {
        loggedIn: true as const,
        fullName: profile?.full_name ?? "Pengguna",
        roleLabel,
        logoutAction: logoutUser,
      }
    : { loggedIn: false as const };

  return (
    <header className="relative border-b border-[#E4E9EF] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-lg px-3 py-2 font-medium text-[#334155] transition-colors hover:bg-[#EEF3F8] hover:text-[#0B3358]"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 flex items-center border-l border-[#E4E9EF] pl-3">
            {account.loggedIn ? (
              <UserMenu
                fullName={account.fullName}
                roleLabel={account.roleLabel}
                logoutAction={account.logoutAction}
              />
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-lg px-3 py-2 font-medium text-[#334155] hover:bg-[#EEF3F8]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-lg bg-[#0B3358] px-3 py-2 font-medium text-white hover:bg-[#082944]"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile hamburger — SELALU dirender di sini, di luar nav desktop.
            Berlaku untuk guest maupun user yang sudah login. */}
        <MobileMenu links={links} account={account} />
      </div>
    </header>
  );
}