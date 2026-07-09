"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { identifierToEmail } from "@/lib/helpers";
import { redirect } from "next/navigation";

function normalizeNama(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function registerUser(formData: FormData) {
  const identifier = String(formData.get("identifier") || "").trim();
  const full_name = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role") || "");
  const program_studi = String(formData.get("program_studi") || "").trim();
  const password = String(formData.get("password") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!identifier || !full_name || !password || !email) {
    return { error: "Semua field wajib diisi." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email tidak valid." };
  }
  if (!["mahasiswa", "dosen"].includes(role)) {
    return { error: "Role tidak valid." };
  }
  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  // civitas_akademika RLS-nya deny-all untuk client, jadi cek pakai service role.
  const admin = createServiceRoleClient();

  const { data: master, error: findError } = await admin
    .from("civitas_akademika")
    .select("*")
    .eq("identifier", identifier)
    .eq("role", role)
    .maybeSingle();

  if (findError) {
    return { error: "Gagal memvalidasi data akademik. Coba lagi." };
  }
  if (!master) {
    return {
      error: "NIM/NIDN tidak ditemukan pada data akademik kampus. Jika Anda yakin ini keliru, hubungi admin.",
    };
  }
  if (master.is_registered) {
    return { error: "NIM/NIDN ini sudah terdaftar. Silakan login." };
  }
  if (normalizeNama(master.nama_lengkap) !== normalizeNama(full_name)) {
    return { error: "Nama yang Anda masukkan tidak sesuai dengan data akademik. Periksa kembali ejaan nama Anda." };
  }

  const supabase = await createClient();
  const authEmail = identifierToEmail(identifier);

  const { data, error } = await supabase.auth.signUp({
    email: authEmail,
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
    program_studi: program_studi || master.program_studi || null,
    email, // email yang diisi user sendiri saat registrasi, bukan data whitelist
  });

  if (profileError) {
    // Rollback biar tidak ada auth user "yatim" tanpa profile & tanpa civitas ter-update
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "Gagal menyimpan profil: " + profileError.message };
  }

  // Tandai identifier sudah dipakai, supaya tidak bisa didaftarkan ulang oleh orang lain
  const { error: markError } = await admin
    .from("civitas_akademika")
    .update({ is_registered: true, user_id: data.user.id })
    .eq("id", master.id);

  if (markError) {
    // Akun & profile sudah terlanjur jadi, ini tidak fatal — tapi dicatat untuk admin cek manual.
    console.error("Gagal update is_registered untuk", identifier, markError.message);
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