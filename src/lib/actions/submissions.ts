"use server";

import { createClient } from "@/lib/supabase/server";
import { CHECKLIST_ITEMS } from "@/lib/helpers";
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

  // File sudah diupload ke Storage di client; di sini hanya terima referensinya
  const file_path = String(formData.get("file_path") || "").trim();
  const file_name = String(formData.get("file_name") || "").trim();

  if (!judul || !abstrak || !jenis_karya || !program_studi || !tahun) {
    return { error: "Lengkapi semua field wajib." };
  }
  if (!file_path || !file_name) {
    return { error: "File PDF wajib diupload." };
  }

  // Pastikan file yang direferensikan benar milik user ini (folder pertama = user.id)
  if (!file_path.startsWith(`${user.id}/`)) {
    return { error: "File tidak valid." };
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

  const { error: insertError } = await supabase.from("submissions").insert({
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
    status: "pending",
  });

  if (insertError) {
    return { error: "Gagal menyimpan data: " + insertError.message };
  }

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

  const { error } = await supabase
    .from("submissions")
    .update({
      status: decision,
      catatan_reviewer: catatan || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) return { error: error.message };

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