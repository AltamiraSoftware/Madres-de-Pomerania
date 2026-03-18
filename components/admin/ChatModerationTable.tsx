"use client";

import { useActionState } from "react";
import { updateChatModerationAction } from "@/app/admin/actions";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/admin/action-state";
import { isMutedNow } from "@/lib/chat/utils";
import type { AdminChatParticipant } from "@/lib/chat/types";

function getInitials(name: string | null, email: string | null) {
  const base = name ?? email ?? "Miembro";
  const parts = base
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "");

  return parts.join("") || "M";
}

function formatDateTime(date: string | null) {
  if (!date) {
    return "Sin actividad";
  }

  return new Date(date).toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FeedbackMessage({ state }: { state: AdminActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={`text-xs ${state.success ? "text-emerald-700" : "text-red-600"}`}>
      {state.message}
    </p>
  );
}

function ChatModerationRow({ participant }: { participant: AdminChatParticipant }) {
  const action = updateChatModerationAction.bind(
    null,
    participant.roomId,
    participant.userId
  );
  const [state, formAction, isPending] = useActionState(action, initialAdminActionState);
  const mutedActive = isMutedNow(participant.moderation);

  return (
    <form action={formAction} className="border-t border-[#f0e4d7] px-5 py-5 md:px-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)_auto] xl:items-start">
        <div className="rounded-[26px] border border-[#eadfce] bg-[linear-gradient(180deg,#fffdfa,#f8f0e5)] p-4 shadow-[0_10px_24px_rgba(90,70,45,0.04)]">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#dfd1bf] bg-white text-sm font-medium tracking-[0.18em] text-[#6b5847]">
              {getInitials(participant.fullName, participant.email)}
            </div>

            <div className="min-w-0">
              <div className="font-medium text-[#241a12]">
                {participant.fullName ?? "Sin nombre"}
              </div>
              <div className="mt-1 break-all text-sm text-[#625549]">
                {participant.email ?? "Sin email"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[#8c7862]">
            <span className="rounded-full bg-[#f7efe4] px-3 py-1">{participant.tier}</span>
            <span className="rounded-full bg-[#f7efe4] px-3 py-1">
              {participant.recentMessageCount} mensajes
            </span>
            {participant.moderation.isBlocked ? (
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Bloqueada</span>
            ) : null}
            {mutedActive ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Silenciada</span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-[#e6d8c7] bg-white/80 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#927d65]">
                Ultima actividad
              </p>
              <p className="mt-2 text-sm text-[#4f4337]">
                {formatDateTime(participant.latestMessageAt)}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#e6d8c7] bg-white/80 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#927d65]">
                Estado actual
              </p>
              <p className="mt-2 text-sm text-[#4f4337]">
                {participant.moderation.isBlocked
                  ? "Acceso cerrado"
                  : mutedActive
                    ? "Lectura solo"
                    : "Participacion libre"}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#625549]">
            Ultima actividad: {formatDateTime(participant.latestMessageAt)}
          </p>
        </div>

        <div className="grid gap-3 rounded-[26px] border border-[#eadfce] bg-white/80 p-4 shadow-[0_10px_24px_rgba(90,70,45,0.04)] md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-black/45">Motivo</span>
            <textarea
              name="reason"
              defaultValue={participant.moderation.reason ?? ""}
              rows={3}
              className="w-full rounded-2xl border border-black/10 bg-[#F6F0E8] px-4 py-3 text-sm leading-6 text-black outline-none focus:border-black/30"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-black/45">Silenciar hasta</span>
            <input
              type="datetime-local"
              name="muted_until"
              defaultValue={participant.moderation.mutedUntil ? participant.moderation.mutedUntil.slice(0, 16) : ""}
              className="w-full rounded-2xl border border-black/10 bg-[#F6F0E8] px-4 py-3 text-sm text-black outline-none focus:border-black/30"
            />
            <p className="text-xs leading-5 text-[#7b6a58]">
              Si lo dejas vacio, el silencio queda activo hasta que lo retires manualmente.
            </p>
          </label>
        </div>

        <div className="flex flex-col gap-2 rounded-[26px] border border-[#eadfce] bg-white/80 p-4 shadow-[0_10px_24px_rgba(90,70,45,0.04)] xl:min-w-[190px]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8f7962]">
            Acciones
          </p>
          <button
            type="submit"
            name="intent"
            value="mute"
            disabled={isPending}
            className="rounded-full border border-[#251b12] px-4 py-2 text-sm text-[#251b12] transition-colors hover:bg-[#251b12] hover:text-[#f8efe3] disabled:opacity-60"
          >
            Silenciar
          </button>
          <button
            type="submit"
            name="intent"
            value="unmute"
            disabled={isPending}
            className="rounded-full border border-[#d7ccb9] bg-white px-4 py-2 text-sm text-[#251b12] transition-colors hover:border-[#251b12] disabled:opacity-60"
          >
            Quitar silencio
          </button>
          <button
            type="submit"
            name="intent"
            value="block"
            disabled={isPending}
            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            Bloquear
          </button>
          <button
            type="submit"
            name="intent"
            value="unblock"
            disabled={isPending}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
          >
            Desbloquear
          </button>
          <div className="pt-1">
            <FeedbackMessage state={state} />
          </div>
        </div>
      </div>
    </form>
  );
}

export default function ChatModerationTable({
  participants,
}: {
  participants: AdminChatParticipant[];
}) {
  if (participants.length === 0) {
    return (
      <div className="px-5 py-6 text-sm text-[#67594d] md:px-6">
        No hay suscripciones activas para moderar en este momento.
      </div>
    );
  }

  return (
    <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,244,236,0.9))]">
      {participants.map((participant) => (
        <ChatModerationRow key={participant.userId} participant={participant} />
      ))}
    </div>
  );
}
