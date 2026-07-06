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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">
        Upload Karya Tulis Ilmiah
      </h1>
      <p className="mb-6 text-sm text-stone-500">
        Isi data berikut dengan lengkap. Karya akan direview oleh bagian akademik
        sebelum tampil di pencarian publik.
      </p>
      <UploadForm defaultProgramStudi={profile?.program_studi ?? ""} />
    </div>
  );
}
