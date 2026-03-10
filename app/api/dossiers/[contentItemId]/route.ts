import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ contentItemId: string }> }
) {
  const { contentItemId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { data: unlock, error: unlockError } = await supabase
    .from("unlocks")
    .select("content_item_id")
    .eq("user_id", user.id)
    .eq("content_item_id", contentItemId)
    .maybeSingle();

  if (unlockError) {
    return NextResponse.json({ error: unlockError.message }, { status: 500 });
  }

  if (!unlock) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: dossier, error: dossierError } = await supabaseAdmin
    .from("content_items")
    .select("asset_path, content_type, is_active")
    .eq("id", contentItemId)
    .eq("content_type", "dossier_pdf")
    .maybeSingle();

  if (dossierError) {
    return NextResponse.json({ error: dossierError.message }, { status: 500 });
  }

  if (!dossier || !dossier.is_active || !dossier.asset_path) {
    return NextResponse.json({ error: "Dossier not available" }, { status: 404 });
  }

  const { data: signedUrl, error: signedUrlError } = await supabaseAdmin.storage
    .from("dossiers")
    .createSignedUrl(dossier.asset_path, 60);

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json(
      { error: signedUrlError?.message ?? "Could not create signed URL" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
