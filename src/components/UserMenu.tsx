"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings, LogOut, ChevronDown } from "lucide-react";

type Props = {
  fullName: string;
  roleLabel: string;
  logoutAction: () => Promise<void>;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserMenu({ fullName, roleLabel, logoutAction }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-lg border border-transparent py-1.5 pl-1.5 pr-3 transition-colors hover:border-[#E4E9EF] hover:bg-[#F7F9FB]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B3358] text-xs font-semibold text-white">
          {getInitials(fullName)}
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-sm font-medium text-[#10202F]">{fullName}</span>
          <span className="text-[11px] text-[#64748B]">{roleLabel}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-[#64748B] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 overflow-hidden rounded-xl border border-[#E4E9EF] bg-white shadow-[0_8px_30px_rgba(11,51,88,0.12)]">
          <div className="border-b border-[#E4E9EF] px-4 py-3 sm:hidden">
            <p className="text-sm font-medium text-[#10202F]">{fullName}</p>
            <p className="text-xs text-[#64748B]">{roleLabel}</p>
          </div>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#EEF3F8] hover:text-[#0B3358]"
          >
            <Settings size={16} />
            Pengaturan Akun
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50">
              <LogOut size={16} />
              Keluar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}