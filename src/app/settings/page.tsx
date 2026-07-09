import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UpdateEmailForm from "./Updateemailform";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, identifier, role, program_studi, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0B3358]"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
      </Link>

      <div className="mb-8 border-b border-[#E4E9EF] pb-6">
        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
          Pengaturan Akun
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">
          {profile?.full_name ?? "Profil Saya"}
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          {profile?.identifier} &middot; {profile?.role === "dosen" ? "Dosen" : "Mahasiswa"}
          {profile?.program_studi ? ` \u00b7 ${profile.program_studi}` : ""}
        </p>
      </div>

      <UpdateEmailForm currentEmail={profile?.email ?? null} />
    </div>
  );
}