import Image from "next/image";

export default function AuthLayout({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Panel kiri — branding, hanya tampil di layar besar */}
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-[#0B3358] lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Motif titik meridian */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.25]"
          viewBox="0 0 400 800"
          fill="none"
        >
          <g stroke="#3D6690" strokeWidth="1">
            <line x1="60" y1="90" x2="140" y2="150" />
            <line x1="140" y1="150" x2="110" y2="260" />
            <line x1="110" y1="260" x2="200" y2="320" />
            <line x1="200" y1="320" x2="170" y2="440" />
            <line x1="170" y1="440" x2="260" y2="500" />
            <line x1="260" y1="500" x2="230" y2="620" />
            <line x1="60" y1="90" x2="30" y2="220" />
            <line x1="30" y1="220" x2="90" y2="340" />
          </g>
          <g fill="#3D6690">
            <circle cx="60" cy="90" r="3.5" />
            <circle cx="140" cy="150" r="3.5" />
            <circle cx="110" cy="260" r="3.5" />
            <circle cx="200" cy="320" r="3.5" />
            <circle cx="170" cy="440" r="3.5" />
            <circle cx="260" cy="500" r="3.5" />
            <circle cx="230" cy="620" r="3.5" />
            <circle cx="30" cy="220" r="3.5" />
            <circle cx="90" cy="340" r="3.5" />
          </g>
          {/* Titik aksen — "titik meridian" utama */}
          <circle cx="200" cy="320" r="5" fill="#C68A4E" className="animate-pulse motion-reduce:animate-none" />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/aaa-logo.png"
            alt="Logo Akademi Akupunktur Aceh"
            width={40}
            height={40}
            className="rounded-md bg-white/10 p-1"
          />
          <span className="text-sm font-medium tracking-wide text-white/90">
            Akademi Akupunktur Aceh
          </span>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#C68A4E]">
            {eyebrow}
          </p>
          <h2 className="text-2xl font-semibold leading-snug text-white">
            Repositori karya tulis ilmiah, terjaga dan tersusun rapi.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Tempat mahasiswa dan dosen mengarsipkan skripsi, laporan tugas akhir, dan
            karya ilmiah — dapat ditelusuri kapan saja.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Akademi Akupunktur Aceh
        </p>
      </div>

      {/* Panel kanan — form */}
      <div className="flex flex-1 items-center justify-center bg-[#F7F9FB] px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          {/* Logo tampil di sini kalau layar kecil (panel kiri disembunyikan) */}
          <div className="mb-6 flex items-center justify-center gap-2.5 lg:hidden">
            <Image
              src="/aaa-logo.png"
              alt="Logo Akademi Akupunktur Aceh"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="text-sm font-medium text-[#0B3358]">
              Akademi Akupunktur Aceh
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}