import { createServiceRoleClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Domain pengirim harus sudah diverifikasi di dashboard Resend.
// Sampai domain diverifikasi, Resend hanya bisa kirim ke email pemilik akun sendiri
// (cocok untuk testing), jadi pastikan ini sudah beres sebelum go-live.
const FROM_EMAIL = "Repositori KTI Akupunktur Aceh <notifikasi@acehakupunktur.ac.id>";

type NotificationType = "submission_approved" | "submission_rejected" | "submission_received";

type NotifyParams = {
  userId: string;
  submissionId: string;
  type: NotificationType;
  message: string;
  emailTo: string | null;
  emailSubject: string;
  emailBody: string; // plain text, akan dibungkus template HTML sederhana
};

/**
 * Buat notifikasi in-app (selalu) + kirim email (best-effort).
 * Kegagalan kirim email TIDAK melempar error ke pemanggil, supaya
 * proses approve/reject submission tidak pernah gagal gara-gara email down.
 */
export async function notify({
  userId,
  submissionId,
  type,
  message,
  emailTo,
  emailSubject,
  emailBody,
}: NotifyParams) {
  const admin = createServiceRoleClient();

  const { error: insertError } = await admin.from("notifications").insert({
    user_id: userId,
    submission_id: submissionId,
    type,
    message,
  });

  if (insertError) {
    console.error("Gagal membuat notifikasi in-app:", insertError.message);
  }

  if (!emailTo) {
    console.warn(`Tidak ada email untuk user ${userId}, notifikasi email dilewati.`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: emailTo,
      subject: emailSubject,
      html: renderEmailTemplate(emailBody),
    });
  } catch (err) {
    // Sengaja tidak di-throw. Log saja supaya bisa dicek manual kalau ada masalah.
    console.error("Gagal mengirim email notifikasi:", err);
  }
}

function renderEmailTemplate(bodyText: string) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #10202F;">
    <p style="font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; color: #64748B; margin-bottom: 4px;">
      Repositori KTI &middot; Akademi Akupunktur Aceh
    </p>
    <div style="white-space: pre-line; font-size: 14px; line-height: 1.6; margin-top: 16px;">
      ${bodyText}
    </div>
    <p style="margin-top: 32px; font-size: 12px; color: #94A3B8;">
      Email ini dikirim otomatis, mohon tidak dibalas ke alamat ini.
    </p>
  </div>`;
}