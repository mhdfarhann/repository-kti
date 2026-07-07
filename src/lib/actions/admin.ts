"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { identifierToEmail } from "@/lib/helpers";
import { revalidatePath } from "next/cache";
import { getFileUrl, type GetFileUrlResult } from "@/lib/storage";
import { deleteFromCpanel } from "@/lib/storage/cpanel";

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

/**
 * Hapus submission secara permanen: file fisik (cPanel atau Supabase Storage)
 * DAN baris di database. File dihapus dulu, baru baris DB — supaya kalau
 * penghapusan file gagal, tidak ada file "yatim" yang hilang catatannya di DB.
 *
 * CATATAN TESTING: kalau storage_provider submission ini "cpanel", fungsi ini
 * memanggil deleteFromCpanel() yang pakai koneksi FTPS. Sama seperti upload,
 * FTPS dari localhost bisa gagal/timeout karena keterbatasan jaringan lokal
 * (IPv6/NAT64) yang sudah diketahui — bukan berarti kodenya salah. Test alur
 * ini lewat Vercel Preview/Production, bukan localhost.
 */
export async function deleteSubmission(submissionId: string) {
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

  const canModerate = profile?.role === "admin" || profile?.role === "staff";
  if (!canModerate) return { error: "Anda tidak punya izin untuk menghapus submission." };

  // Pakai service role di sini dan seterusnya — otorisasi sudah dicek manual
  // di atas (role admin/staff), jadi operasi delete tidak perlu (dan tidak boleh)
  // terblokir RLS. Kalau pakai client biasa dan tabel submissions belum punya
  // policy DELETE, Supabase tidak melempar error tapi diam-diam 0 baris terhapus.
  const admin = createServiceRoleClient();

  const { data: submission, error: fetchError } = await admin
    .from("submissions")
    .select("file_path, storage_provider")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    return { error: "Submission tidak ditemukan." };
  }

  try {
    if (submission.storage_provider === "cpanel") {
      await deleteFromCpanel(submission.file_path);
    } else {
      const { error: storageError } = await admin.storage
        .from("kti-files")
        .remove([submission.file_path]);
      if (storageError) throw storageError;
    }
  } catch (err: unknown) {
    const isFileNotFound =
      submission.storage_provider === "cpanel" &&
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: unknown }).code === 550;

    if (!isFileNotFound) {
      console.error("Gagal menghapus file fisik:", err);
      return {
        error:
          "Gagal menghapus file dari storage. Submission tidak dihapus untuk mencegah data tidak konsisten. Coba lagi (kalau providernya cpanel dan Anda sedang test di localhost, ini bisa jadi karena keterbatasan jaringan lokal — coba lewat Vercel Preview).",
      };
    }

    console.warn(
      `File ${submission.file_path} sudah tidak ada di cPanel (550), lanjut hapus baris DB.`
    );
  }

  const { error: deleteError, count } = await admin
    .from("submissions")
    .delete({ count: "exact" })
    .eq("id", submissionId);

  if (!deleteError && count === 0) {
    console.error(
      `Delete submission ${submissionId} tidak error tapi 0 baris terhapus — kemungkinan RLS atau row sudah tidak ada.`
    );
    return {
      error:
        "Submission tidak berhasil dihapus dari database (0 baris terpengaruh). Kemungkinan ada policy RLS yang memblokir, hubungi developer.",
    };
  }

  if (deleteError) {
    console.error("File terhapus tapi baris DB gagal dihapus:", deleteError);
    return {
      error:
        "File sudah terhapus dari storage, tapi data submission gagal dihapus dari database. Perlu cleanup manual.",
    };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/submission/${submissionId}`);
  return { success: true };
}
/**
 * Update data staff: nama, identifier, role (staff<->admin), dan opsional reset password.
 * Kalau identifier berubah, email auth (hasil identifierToEmail) juga ikut di-update
 * supaya login tetap konsisten dengan identifier barunya.
 */
export async function updateStaffAccount(staffId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi habis, login ulang." };

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (requesterProfile?.role !== "admin") {
    return { error: "Hanya super admin yang bisa mengelola akun staff." };
  }

  const identifier = String(formData.get("identifier") || "").trim();
  const full_name = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role") || "");
  const newPassword = String(formData.get("password") || "");

  if (!identifier || !full_name) {
    return { error: "Nama dan identifier wajib diisi." };
  }
  if (role !== "staff" && role !== "admin") {
    return { error: "Role tidak valid." };
  }

  // Cegah admin menurunkan role dirinya sendiri lewat form ini (hindari lockout tidak sengaja)
  if (staffId === user.id && role !== "admin") {
    return { error: "Anda tidak bisa mengubah role akun sendiri lewat sini." };
  }

  const admin = createServiceRoleClient();
  const email = identifierToEmail(identifier);

  if (newPassword.length > 0) {
    if (newPassword.length < 8) {
      return { error: "Password baru minimal 8 karakter." };
    }
    const { error: pwError } = await admin.auth.admin.updateUserById(staffId, {
      password: newPassword,
    });
    if (pwError) {
      console.error("Gagal reset password staff:", pwError);
      return { error: "Gagal mereset password." };
    }
  }

  const { error: emailError } = await admin.auth.admin.updateUserById(staffId, {
    email,
    user_metadata: { identifier, full_name, role },
  });
  if (emailError) {
    console.error("Gagal update email/metadata staff:", emailError);
    return { error: "Gagal memperbarui identifier (kemungkinan sudah dipakai akun lain)." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name, identifier, role })
    .eq("id", staffId);

  if (profileError) {
    console.error("Gagal update profil staff:", profileError);
    return { error: "Gagal menyimpan perubahan data staff." };
  }

  revalidatePath("/admin/staff");
  return { success: true };
}

/**
 * Hapus akun staff permanen (auth user + baris profile). Hanya untuk role 'staff' —
 * admin lain tidak bisa dihapus lewat endpoint ini, dicek ulang di server (bukan
 * cuma disembunyikan di UI) supaya tidak bisa dibypass lewat request langsung.
 *
 * Urutan hapus: profile dulu, baru auth user. Kalau langkah kedua gagal, akun
 * itu kehilangan semua akses (karena role dibaca dari tabel profiles di semua
 * pengecekan), meski secara teknis authnya belum terhapus — lebih aman sebagai
 * fallback dibanding urutan sebaliknya.
 */
export async function deleteStaffAccount(staffId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi habis, login ulang." };

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (requesterProfile?.role !== "admin") {
    return { error: "Hanya super admin yang bisa menghapus akun staff." };
  }

  if (staffId === user.id) {
    return { error: "Anda tidak bisa menghapus akun sendiri." };
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", staffId)
    .single();

  if (!target) return { error: "Akun tidak ditemukan." };
  if (target.role !== "staff") {
    return { error: "Hanya akun dengan role staff yang bisa dihapus lewat halaman ini." };
  }

  const admin = createServiceRoleClient();

  const { error: profileDeleteError } = await admin
    .from("profiles")
    .delete()
    .eq("id", staffId);
  if (profileDeleteError) {
    console.error("Gagal hapus profile staff:", profileDeleteError);
    return { error: "Gagal menghapus data profil staff." };
  }

  const { error: authDeleteError } = await admin.auth.admin.deleteUser(staffId);
  if (authDeleteError) {
    console.error("Profile terhapus tapi auth user gagal dihapus:", authDeleteError);
    return {
      error:
        "Data profil sudah terhapus, tapi akun login gagal dihapus. Perlu cleanup manual di Supabase Auth dashboard.",
    };
  }

  revalidatePath("/admin/staff");
  return { success: true };
}