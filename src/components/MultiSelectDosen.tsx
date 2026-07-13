"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

export type Dosen = {
  id: string;
  nama: string;
  nip_nidn?: string | null;
};

export default function MultiSelectDosen({
  dosenList,
  name = "pembimbing_ids",
}: {
  dosenList: Dosen[];
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Dosen[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = dosenList.filter(
    (d) =>
      d.nama.toLowerCase().includes(query.toLowerCase()) &&
      !selected.some((s) => s.id === d.id)
  );

  function addDosen(d: Dosen) {
    setSelected((prev) => [...prev, d]);
    setQuery("");
  }

  function removeDosen(id: string) {
    setSelected((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input per dosen terpilih, agar terbaca formData.getAll(name) di server action */}
      {selected.map((d) => (
        <input key={d.id} type="hidden" name={name} value={d.id} />
      ))}

      <div
        onClick={() => setOpen(true)}
        className="flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-lg border border-[#E4E9EF] px-3 py-2 text-sm cursor-text focus-within:border-[#0B3358] focus-within:ring-2 focus-within:ring-[#0B3358]/10"
      >
        {selected.map((d) => (
          <span
            key={d.id}
            className="flex items-center gap-1 rounded-md bg-[#EEF3F8] px-2 py-1 text-xs font-medium text-[#0B3358]"
          >
            {d.nama}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeDosen(d.id);
              }}
              className="rounded-full p-0.5 hover:bg-[#0B3358]/10"
              aria-label={`Hapus ${d.nama}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? "Cari nama dosen pembimbing..." : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
        />
      </div>

      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#E4E9EF] bg-white shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-[#94A3B8]">
              {query ? "Dosen tidak ditemukan." : "Semua dosen sudah dipilih."}
            </p>
          ) : (
            filtered.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => addDosen(d)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-[#10202F] hover:bg-[#F7F9FB]"
              >
                <span>{d.nama}</span>
                {d.nip_nidn && <span className="text-xs text-[#94A3B8]">{d.nip_nidn}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}