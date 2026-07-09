"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateEmail(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi login sudah habis. Silakan login ulang." };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    return { error: "Email wajib diisi." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email tidak valid." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ email })
    .eq("id", user.id);

  if (error) {
    return { error: "Gagal menyimpan email: " + error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}