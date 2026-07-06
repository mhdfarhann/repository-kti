"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { identifierToEmail } from "@/lib/helpers";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const identifier = String(formData.get("identifier") || "").trim();
  const full_name = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role") || "");
  const program_studi = String(formData.get("program_studi") || "").trim();
  const password = String(formData.get("password") || "");

  if (!identifier || !full_name || !password) {
    return { error: "Semua field wajib diisi." };
  }
  if (!["mahasiswa", "dosen"].includes(role)) {
    return { error: "Role tidak valid." };
  }
  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  const supabase = await createClient();
  const email = identifierToEmail(identifier);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { identifier, full_name, role } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "NIM/NIDN ini sudah terdaftar. Silakan login." };
    }
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Gagal membuat akun. Coba lagi." };
  }

  // Buat baris profile terkait
  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    identifier,
    full_name,
    role,
    program_studi: program_studi || null,
  });

  if (profileError) {
    return { error: "Gagal menyimpan profil: " + profileError.message };
  }

  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");

  if (!identifier || !password) {
    return { error: "NIM/NIDN dan password wajib diisi." };
  }

  const supabase = await createClient();
  const email = identifierToEmail(identifier);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "NIM/NIDN atau password salah." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "admin" || profile?.role === "staff") {
    redirect("/admin");
  }

  redirect("/dashboard");
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Dipakai khusus di halaman admin/setup untuk membuat akun admin PERTAMA,
// dilindungi oleh secret code dari environment variable (bukan dari database),
// supaya tidak ada yang bisa daftar jadi admin lewat form publik biasa.
export async function bootstrapAdmin(formData: FormData) {
  const secret = String(formData.get("secret") || "");
  const identifier = String(formData.get("identifier") || "").trim();
  const full_name = String(formData.get("full_name") || "").trim();
  const password = String(formData.get("password") || "");

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return { error: "Kode setup salah." };
  }
  if (!identifier || !full_name || password.length < 8) {
    return { error: "Lengkapi semua field (password minimal 8 karakter)." };
  }

  const admin = createServiceRoleClient();
  const email = identifierToEmail(identifier);

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { identifier, full_name, role: "admin" },
  });

  if (error) return { error: error.message };

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    identifier,
    full_name,
    role: "admin",
  });

  if (profileError) return { error: profileError.message };

  return { success: true };
}
