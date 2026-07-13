"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadToCpanel } from "@/lib/storage/cpanel";
import { CHECKLIST_ITEMS } from "@/lib/helpers";
import { notify } from "@/lib/notifications";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitKarya(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi login sudah habis. Silakan login ulang." };
  }

  const judul = String(formData.get("judul") || "").trim();
  const abstrak = String(formData.get("abstrak") || "").trim();
  const jenis_karya = String(formData.get("jenis_karya") || "");
  const program_studi = String(formData.get("program_studi") || "").trim();
  const pembimbing = String(formData.get("pembimbing") || "").trim();
  const tahun = Number(formData.get("tahun"));
  const kata_kunci = String(formData.get("kata_kunci") || "").trim();

  const pembimbingIds = formData.getAll("pembimbing_ids") as string[];
const abstrakEn = formData.get("abstrak_en") as string;
 
if (pembimbingIds.length === 0) {
  return { error: "Pilih minimal satu dosen pembimbing." };
}
if (!abstrakEn || abstrakEn.trim().length === 0) {
  return { error: "Abstract (English) wajib diisi." };
}
 

  if (!judul || !abstrak || !jenis_karya || !program_studi || !tahun) {
    return { error: "Lengkapi semua field wajib." };
  }

  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "File PDF wajib diupload." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { error: "Ukuran file melebihi 20MB." };
  }
  if (file.type !== "application/pdf") {
    return { error: "File harus berformat PDF." };
  }

  const checklist: Record<string, boolean> = {};
  for (const item of CHECKLIST_ITEMS) {
    checklist[item.key] = formData.get(`checklist_${item.key}`) === "on";
  }
  const semuaChecklistDicentang = CHECKLIST_ITEMS.every(
    (item) => checklist[item.key]
  );
  if (!semuaChecklistDicentang) {
    return { error: "Semua syarat pada checklist wajib dicentang sebelum submit." };
  }

  const safeFileName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
  const file_path = `${user.id}/${Date.now()}-${safeFileName}`;
  const file_name = file.name;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadToCpanel(buffer, file_path);
  } catch (err) {
    console.error("Gagal upload ke cPanel:", err);
    return { error: "Gagal mengupload file ke server. Silakan coba lagi." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      judul,
      abstrak,
      jenis_karya,
      program_studi,
      pembimbing: pembimbing || null,
      tahun,
      kata_kunci: kata_kunci || null,
      file_path,
      file_name,
      checklist,
      storage_provider: "cpanel",
      status: "pending",
      pembimbing_ids: pembimbingIds, // uuid[], Supabase JS client handle otomatis
      abstrak_en: abstrakEn,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: "Gagal menyimpan data: " + (insertError?.message ?? "unknown") };
  }

  // Notifikasi ke pengaju sendiri: konfirmasi karyanya sudah masuk antrian review.
  // Best-effort — kalau gagal, tidak menggagalkan proses submit.
  const { data: pengaju } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  await notify({
    userId: user.id,
    submissionId: inserted.id,
    type: "submission_received",
    message: `Karya "${judul}" berhasil disubmit dan sedang menunggu review.`,
    emailTo: pengaju?.email ?? null,
    emailSubject: "Karya Anda Sedang Direview - Repositori KTI",
    emailBody: `Halo ${pengaju?.full_name ?? ""},\n\nKarya berjudul "${judul}" sudah berhasil kami terima dan akan segera direview oleh bagian akademik. Anda akan mendapat notifikasi lagi setelah proses review selesai.\n\nTerima kasih.`,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard?submitted=1");
}

export async function reviewSubmission(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi habis, login ulang." };

  const submissionId = String(formData.get("submission_id") || "");
  const decision = String(formData.get("decision") || ""); // "approved" | "rejected"
  const catatan = String(formData.get("catatan") || "").trim();

  if (!["approved", "rejected"].includes(decision)) {
    return { error: "Keputusan tidak valid." };
  }
  if (decision === "rejected" && !catatan) {
    return { error: "Alasan penolakan wajib diisi." };
  }

  const { data: updated, error } = await supabase
    .from("submissions")
    .update({
      status: decision,
      catatan_reviewer: catatan || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select("id, judul, user_id")
    .single();

  if (error || !updated) return { error: error?.message ?? "Submission tidak ditemukan." };

  // Ambil data kontak si pengaju untuk dikirimi notifikasi
  const { data: pengaju } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", updated.user_id)
    .single();

  const isApproved = decision === "approved";

  await notify({
    userId: updated.user_id,
    submissionId: updated.id,
    type: isApproved ? "submission_approved" : "submission_rejected",
    message: isApproved
      ? `Karya "${updated.judul}" telah disetujui dan sekarang tampil di repositori publik.`
      : `Karya "${updated.judul}" ditolak. Catatan: ${catatan}`,
    emailTo: pengaju?.email ?? null,
    emailSubject: isApproved
      ? "Karya Anda Disetujui - Repositori KTI"
      : "Karya Anda Perlu Direvisi - Repositori KTI",
    emailBody: isApproved
      ? `Halo ${pengaju?.full_name ?? ""},\n\nSelamat! Karya berjudul "${updated.judul}" telah disetujui oleh reviewer dan sekarang dapat diakses publik di repositori.\n\nTerima kasih.`
      : `Halo ${pengaju?.full_name ?? ""},\n\nKarya berjudul "${updated.judul}" belum bisa disetujui dengan catatan berikut:\n\n"${catatan}"\n\nSilakan perbaiki dan submit ulang karya Anda.\n\nTerima kasih.`,
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function requestAccess(formData: FormData) {
  const supabase = await createClient();

  const submission_id = String(formData.get("submission_id") || "");
  const requester_name = String(formData.get("requester_name") || "").trim();
  const requester_email = String(formData.get("requester_email") || "").trim();
  const requester_institution = String(formData.get("requester_institution") || "").trim();
  const alasan = String(formData.get("alasan") || "").trim();

  if (!requester_name || !requester_email || !alasan) {
    return { error: "Lengkapi semua field wajib." };
  }

  const { error } = await supabase.from("access_requests").insert({
    submission_id,
    requester_name,
    requester_email,
    requester_institution: requester_institution || null,
    alasan,
  });

  if (error) return { error: error.message };

  return { success: true };
}