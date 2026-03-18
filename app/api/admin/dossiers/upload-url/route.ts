import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function sanitizeFileName(fileName: string) {
  const normalized = fileName.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  const collapsed = normalized.replace(/-+/g, "-").replace(/^-|-$/g, "");

  if (!collapsed) {
    return "dossier.pdf";
  }

  return collapsed.endsWith(".pdf") ? collapsed : `${collapsed}.pdf`;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesion para subir archivos." },
      { status: 401 }
    );
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    return NextResponse.json(
      { error: "No tienes permisos para subir dossiers." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer la solicitud de subida." },
      { status: 400 }
    );
  }

  const contentItemId =
    typeof body === "object" && body !== null && "contentItemId" in body
      ? String(body.contentItemId).trim()
      : "";
  const fileName =
    typeof body === "object" && body !== null && "fileName" in body
      ? String(body.fileName).trim()
      : "";
  const contentType =
    typeof body === "object" && body !== null && "contentType" in body
      ? String(body.contentType).trim()
      : "";

  if (!contentItemId || !fileName) {
    return NextResponse.json(
      { error: "Faltan datos para preparar la subida." },
      { status: 400 }
    );
  }

  if (contentType && contentType !== "application/pdf") {
    return NextResponse.json(
      { error: "Solo se permiten archivos PDF." },
      { status: 400 }
    );
  }

  const { data: dossier, error: dossierError } = await supabaseAdmin
    .from("content_items")
    .select("id")
    .eq("id", contentItemId)
    .eq("content_type", "dossier_pdf")
    .maybeSingle();

  if (dossierError || !dossier) {
    return NextResponse.json(
      { error: "El dossier no existe o no se puede editar." },
      { status: 404 }
    );
  }

  const safeName = sanitizeFileName(fileName);
  const filePath = `admin/${contentItemId}/${Date.now()}-${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from("dossiers")
    .createSignedUploadUrl(filePath, {
      upsert: true,
    });

  if (error || !data) {
    return NextResponse.json(
      { error: `No se pudo preparar la subida: ${error?.message ?? "error desconocido"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
  });
}
