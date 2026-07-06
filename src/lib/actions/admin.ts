"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { identifierToEmail } from "@/lib/helpers";
import { revalidatePath } from "next/cache";

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

// Menghasilkan signed URL sementara untuk admin/staff melihat/preview file KTI
export async function getFilePreviewUrl(filePath: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi habis." };

  const { data, error } = await supabase.storage
    .from("kti-files")
    .createSignedUrl(filePath, 60 * 10); // berlaku 10 menit

  if (error) return { error: error.message };
  return { url: data.signedUrl };
}