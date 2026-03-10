"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AdminActionState } from "@/lib/admin/action-state";

function valueOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateEmailSequenceAction(
  sequenceId: string,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const subject = valueOrNull(formData.get("subject"));
  const heading = valueOrNull(formData.get("heading"));
  const body = valueOrNull(formData.get("body"));
  const ctaLabel = valueOrNull(formData.get("cta_label"));
  const ctaUrl = valueOrNull(formData.get("cta_url"));
  const isActive = formData.get("is_active") === "on";

  if (!subject) {
    return {
      success: false,
      message: "El asunto es obligatorio.",
    };
  }

  const { error } = await supabaseAdmin
    .from("email_sequences")
    .update({
      subject,
      heading,
      body,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      is_active: isActive,
    })
    .eq("id", sequenceId);

  if (error) {
    return {
      success: false,
      message: `No se pudo guardar el email: ${error.message}`,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/emails");

  return {
    success: true,
    message: "Email actualizado correctamente.",
  };
}

export async function updateDossierAction(
  contentItemId: string,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const title = valueOrNull(formData.get("title"));
  const description = valueOrNull(formData.get("description"));
  const isActive = formData.get("is_active") === "on";
  const fileEntry = formData.get("pdf_file");
  let nextAssetPath: string | undefined;

  if (!title) {
    return {
      success: false,
      message: "El titulo del dossier es obligatorio.",
    };
  }

  if (fileEntry instanceof File && fileEntry.size > 0) {
    const lowerName = fileEntry.name.toLowerCase();
    const isPdf =
      fileEntry.type === "application/pdf" || lowerName.endsWith(".pdf");

    if (!isPdf) {
      return {
        success: false,
        message: "Solo se permiten archivos PDF.",
      };
    }

    if (fileEntry.size > 15 * 1024 * 1024) {
      return {
        success: false,
        message: "El PDF supera el limite de 15 MB.",
      };
    }

    const safeName = lowerName.replace(/[^a-z0-9.-]/g, "-");
    const filePath = `admin/${contentItemId}/${Date.now()}-${safeName}`;
    const arrayBuffer = await fileEntry.arrayBuffer();
    const uploadResult = await supabaseAdmin.storage
      .from("dossiers")
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadResult.error) {
      return {
        success: false,
        message: `No se pudo subir el PDF: ${uploadResult.error.message}`,
      };
    }

    nextAssetPath = filePath;
  }

  const updates: {
    title: string;
    description: string | null;
    is_active: boolean;
    asset_path?: string;
  } = {
    title,
    description,
    is_active: isActive,
  };

  if (nextAssetPath) {
    updates.asset_path = nextAssetPath;
  }

  const { error } = await supabaseAdmin
    .from("content_items")
    .update(updates)
    .eq("id", contentItemId)
    .eq("content_type", "dossier_pdf");

  if (error) {
    return {
      success: false,
      message: `No se pudo guardar el dossier: ${error.message}`,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/dossiers");

  return {
    success: true,
    message: nextAssetPath
      ? "Dossier y PDF actualizados correctamente."
      : "Dossier actualizado correctamente.",
  };
}
