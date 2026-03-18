import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getChatMessages,
  getChatViewerContext,
} from "@/lib/chat/server";
import { isMutedNow } from "@/lib/chat/utils";

function forbidden(message: string, status = 403) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const viewer = await getChatViewerContext();

  if (!viewer) {
    return forbidden("Debes iniciar sesion para entrar en la comunidad.", 401);
  }

  if (!viewer.hasActiveSubscription && !viewer.isAdmin) {
    return forbidden("Necesitas una suscripcion activa para ver la comunidad.");
  }

  if (viewer.moderation.isBlocked) {
    return forbidden("Tu acceso a la comunidad ha sido restringido.");
  }

  if (!viewer.room) {
    return NextResponse.json(
      { error: "La sala principal de la comunidad no esta disponible." },
      { status: 404 }
    );
  }

  const messages = await getChatMessages(viewer.room.id);

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const viewer = await getChatViewerContext();

  if (!viewer) {
    return forbidden("Debes iniciar sesion para escribir en la comunidad.", 401);
  }

  if (!viewer.hasActiveSubscription && !viewer.isAdmin) {
    return forbidden("Necesitas una suscripcion activa para participar.");
  }

  if (viewer.moderation.isBlocked) {
    return forbidden("Tu acceso a la comunidad ha sido restringido.");
  }

  if (!viewer.isAdmin && isMutedNow(viewer.moderation)) {
    return forbidden("Tu cuenta esta silenciada temporalmente y no puede enviar mensajes.");
  }

  if (!viewer.room) {
    return NextResponse.json(
      { error: "La sala principal de la comunidad no esta disponible." },
      { status: 404 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el mensaje." },
      { status: 400 }
    );
  }

  const body =
    typeof payload === "object" && payload !== null && "body" in payload
      ? String(payload.body).trim()
      : "";

  if (!body) {
    return NextResponse.json(
      { error: "Escribe un mensaje antes de enviarlo." },
      { status: 400 }
    );
  }

  if (body.length > 1500) {
    return NextResponse.json(
      { error: "El mensaje supera el limite de 1500 caracteres." },
      { status: 400 }
    );
  }

  const supabase = viewer.isAdmin
    ? supabaseAdmin
    : await createServerSupabaseClient();
  const { error } = await supabase.from("chat_messages").insert({
    room_id: viewer.room.id,
    user_id: viewer.userId,
    message: body,
  });

  if (error) {
    return NextResponse.json(
      { error: `No se pudo enviar el mensaje: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
