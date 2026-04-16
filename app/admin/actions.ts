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

export async function updateChatModerationAction(
  roomId: string,
  userId: string,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const intent = typeof formData.get("intent") === "string" ? String(formData.get("intent")) : "";
  const reason = valueOrNull(formData.get("reason"));
  const mutedUntilValue = valueOrNull(formData.get("muted_until"));
  const mutedUntil = mutedUntilValue ? new Date(mutedUntilValue).toISOString() : null;

  if (!["mute", "unmute", "block", "unblock"].includes(intent)) {
    return {
      success: false,
      message: "No se pudo interpretar la acción de moderación.",
    };
  }

  if ((intent === "mute" || intent === "block") && !reason) {
    return {
      success: false,
      message: "Añade un motivo para registrar la moderación.",
    };
  }

  const { data: currentModeration, error: currentModerationError } = await supabaseAdmin
    .from("chat_user_moderation")
    .select("is_muted, is_blocked, muted_until, reason")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle();

  if (currentModerationError) {
    return {
      success: false,
      message: `No se pudo cargar la moderación actual: ${currentModerationError.message}`,
    };
  }

  const updates = {
    room_id: roomId,
    user_id: userId,
    is_muted:
      intent === "mute"
        ? true
        : intent === "unmute"
          ? false
          : currentModeration?.is_muted ?? false,
    is_blocked:
      intent === "block"
        ? true
        : intent === "unblock"
          ? false
          : currentModeration?.is_blocked ?? false,
    muted_until:
      intent === "mute"
        ? mutedUntil
        : intent === "unmute"
          ? null
          : currentModeration?.muted_until ?? null,
    reason,
  };

  const { error } = await supabaseAdmin
    .from("chat_user_moderation")
    .upsert(updates, { onConflict: "room_id,user_id" });

  if (error) {
    return {
      success: false,
      message: `No se pudo guardar la moderación: ${error.message}`,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/chat");

  return {
    success: true,
    message:
      intent === "mute"
        ? "Silencio aplicado correctamente."
        : intent === "unmute"
          ? "Silencio retirado correctamente."
          : intent === "block"
            ? "Acceso bloqueado correctamente."
            : "Acceso restaurado correctamente.",
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
  const nextAssetPath = valueOrNull(formData.get("asset_path"));

  if (!title) {
    return {
      success: false,
      message: "El título del dossier es obligatorio.",
    };
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
