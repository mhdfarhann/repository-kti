import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Repository KTI — Akademi Akupunktur Aceh",
  description:
    "Repositori karya tulis ilmiah, skripsi, dan laporan tugas akhir Akademi Akupunktur Aceh.",
  icons: {
    icon: "/aaa-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-[#10202F] antialiased">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-[#E4E9EF] py-6 text-center text-sm text-[#64748B]">
          © {new Date().getFullYear()} Akademi Akupunktur Aceh — Repository Karya Tulis Ilmiah
        </footer>
      </body>
    </html>
  );
}