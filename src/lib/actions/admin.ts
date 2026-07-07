"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { identifierToEmail } from "@/lib/helpers";
import { revalidatePath } from "next/cache";
import { getFileUrl, type GetFileUrlResult } from "@/lib/storage";

export async function createStaffAccount(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi habis, login ulang." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Hanya super admin yang bisa membuat akun staff baru." };
  }

  const identifier = String(formData.get("identifier") || "").trim();
  const full_name = String(formData.get("full_name") || "").trim();
  const password = String(formData.get("password") || "");

  if (!identifier || !full_name || password.length < 8) {
    return { error: "Lengkapi semua field (password minimal 8 karakter)." };
  }

  const admin = createServiceRoleClient();
  const email = identifierToEmail(identifier);

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { identifier, full_name, role: "staff" },
  });

  if (error) return { error: error.message };

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    identifier,
    full_name,
    role: "staff",
  });

  if (profileError) return { error: profileError.message };

  revalidatePath("/admin/staff");
  return { success: true };
}

/**
 * CATATAN MIGRASI:
 * Sebelumnya fungsi ini terima `filePath` langsung dari client dan langsung
 * memanggil supabase.storage.createSignedUrl(filePath). Sekarang terima
 * `submissionId`, server query ulang submission (termasuk storage_provider)
 * supaya client tidak bisa memalsukan path file, dan otomatis pilih provider
 * yang benar (Supabase legacy vs cPanel) lewat wrapper getFileUrl().
 *
 * PENTING: sesuaikan pemanggilan di komponen FilePreviewButton — kirim
 * submissionId, bukan lagi filePath.
 */
export async function getFilePreviewUrl(
  submissionId: string
): Promise<GetFileUrlResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi habis." };

  const { data: submission, error } = await supabase
    .from("submissions")
    .select("file_path, storage_provider")
    .eq("id", submissionId)
    .single();

  if (error || !submission) {
    return { error: "Submission tidak ditemukan." };
  }

  return getFileUrl(submission);
}