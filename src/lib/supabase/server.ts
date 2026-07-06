import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Diabaikan jika dipanggil dari Server Component (tanpa akses set cookie).
            // Session tetap akan di-refresh lewat middleware.ts
          }
        },
      },
    }
  );
}

// Client dengan service role, khusus dipakai di server action tertentu
// yang butuh bypass RLS (misal: admin membuat akun staff baru).
// JANGAN PERNAH diimport di kode yang berjalan di browser.
import { createClient as createRawClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
