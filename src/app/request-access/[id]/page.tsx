import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RequestAccessForm from "./RequestAccessForm";

export default async function RequestAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("public_submissions")
    .select("id, judul")
    .eq("id", id)
    .single();

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">
        Ajukan Akses Full Text
      </h1>
      <p className="mb-6 text-sm text-stone-500">
        Untuk karya: <strong>{item.judul}</strong>
      </p>
      <RequestAccessForm submissionId={item.id} />
    </div>
  );
}
