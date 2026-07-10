"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Settings, LogOut } from "lucide-react";

type NavLink = { href: string; label: string };

type AccountInfo =
  | { loggedIn: false }
  | { loggedIn: true; fullName: string; roleLabel: string; logoutAction: () => Promise<void> };

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MobileMenu({
  links,
  account,
}: {
  links: NavLink[];
  account: AccountInfo;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        className="inline-flex items-center rounded-lg p-2 text-[#0B3358] hover:bg-[#EEF3F8]"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-[#E4E9EF] bg-white px-4 py-3 shadow-md">
          <nav className="flex flex-col gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-medium text-[#334155] transition-colors hover:bg-[#EEF3F8] hover:text-[#0B3358]"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-[#E4E9EF] pt-2">
              {!account.loggedIn ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 font-medium text-[#334155] hover:bg-[#EEF3F8]"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-[#0B3358] px-3 py-2.5 text-center font-medium text-white hover:bg-[#082944]"
                  >
                    Daftar
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 px-3 py-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B3358] text-xs font-semibold text-white">
                      {getInitials(account.fullName)}
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-[#10202F]">
                        {account.fullName}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        {account.roleLabel}
                      </span>
                    </span>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium text-[#334155] hover:bg-[#EEF3F8] hover:text-[#0B3358]"
                  >
                    <Settings size={16} />
                    Pengaturan Akun
                  </Link>
                  <form action={account.logoutAction}>
                    <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-medium text-rose-600 hover:bg-rose-50">
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </form>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}