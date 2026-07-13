import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: dosenList } = await supabase
    .from("dosen")
    .select("id, nama, nip_nidn")
    .order("nama");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 border-b border-[#E4E9EF] pb-6">
        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B3358]" />
          Kontribusi Karya Ilmiah
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#10202F]">
          Upload Karya Tulis Ilmiah
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Isi data berikut dengan lengkap. Karya akan direview oleh bagian akademik
          sebelum tampil di pencarian publik.
        </p>
      </div>
      <UploadForm
        defaultProgramStudi={profile?.program_studi ?? ""}
        userEmail={profile?.email ?? user.email ?? ""}
        dosenList={dosenList ?? []}
      />
    </div>
  );
}