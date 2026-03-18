"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat/types";

interface CommunityChatProps {
  roomId: string;
  currentUserId: string;
  currentDisplayName: string;
  initialMessages: ChatMessage[];
  mutedUntil: string | null;
  mutedReason: string | null;
  canSend: boolean;
  title?: string;
  subtitle?: string;
  closeHref?: string;
  closeLabel?: string;
  launcherTitle?: string;
  launcherDescription?: string;
}

function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMutedUntil(date: string | null) {
  if (!date) {
    return "hasta nuevo aviso";
  }

  return new Date(date).toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayLabel(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function CommunityChat({
  roomId,
  currentUserId,
  currentDisplayName,
  initialMessages,
  mutedUntil,
  mutedReason,
  canSend,
  title = "Sala privada de la comunidad",
  subtitle = "Un chat cuidado, cercano y elegante para compartir avances, dudas y pequenas victorias.",
  closeHref,
  closeLabel = "Cerrar",
  launcherTitle = "Chat privado",
  launcherDescription = "Abre la conversacion en un modal centrado, limpio y pensado para leer y responder sin distracciones.",
}: CommunityChatProps) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const modalListRef = useRef<HTMLDivElement>(null);
  const modalTitle = "Sala privada de madres de Pomerania";

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const list = modalListRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isModalOpen]);

  useEffect(() => {
    let isMounted = true;

    async function refreshMessages() {
      setIsRefreshing(true);

      try {
        const response = await fetch("/api/chat/messages", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | { messages?: ChatMessage[]; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "No se pudo actualizar la comunidad.");
        }

        if (isMounted && payload?.messages) {
          setMessages(payload.messages);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "No se pudo actualizar la comunidad."
          );
        }
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    }

    const channel = supabase
      .channel(`community-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          void refreshMessages();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSend || !body.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: body.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo enviar el mensaje.");
      }

      setBody("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar el mensaje."
      );
    } finally {
      setIsSending(false);
    }
  }

  function renderChatShell({
    modal = false,
    scrollRef,
  }: {
    modal?: boolean;
    scrollRef: React.RefObject<HTMLDivElement | null>;
  }) {
    return (
      <div
        className={cn(
          "relative mx-auto flex w-full flex-col overflow-hidden border border-white/45 bg-[linear-gradient(180deg,rgba(255,251,246,0.97),rgba(250,243,234,0.95))] shadow-[0_32px_100px_rgba(39,25,16,0.24)]",
          modal
            ? "h-[min(88vh,920px)] max-w-5xl rounded-[32px]"
            : "min-h-[72vh] max-w-5xl rounded-[32px]"
        )}
      >
        <header className="relative overflow-hidden border-b border-white/15 bg-[linear-gradient(120deg,#2d2016_0%,#6b4c34_48%,#b4895f_100%)] px-5 py-5 text-[#fbf4ea] md:px-7 md:py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#efe0cf]">
                Chat privado
              </p>
              <h2 className="mt-2 max-w-xl font-serif text-[1.7rem] leading-tight md:mt-3 md:text-4xl">
                {modalTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {modal ? (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-[#fff7ee] transition hover:bg-white/18"
                  aria-label="Cerrar chat"
                >
                  ×
                </button>
              ) : closeHref ? (
                <Link
                  href={closeHref}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-[#fff7ee] transition hover:bg-white/18"
                  aria-label={closeLabel}
                >
                  ×
                </Link>
              ) : (
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-[#fff7ee]">
                  ×
                </div>
              )}
            </div>
          </div>

        </header>

        <div className="flex flex-1 flex-col overflow-hidden">
          {!canSend ? (
            <div className="border-b border-[#eadbc9] bg-[linear-gradient(180deg,#fff7ea,#f8ecd4)] px-5 py-4 text-sm text-[#6e5836] md:px-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#987a44]">
                Escritura restringida
              </p>
              <p className="mt-2 leading-6">
                Puedes seguir leyendo la comunidad, pero tu cuenta esta silenciada {formatMutedUntil(mutedUntil)}.
                {mutedReason ? ` Motivo: ${mutedReason}` : ""}
              </p>
            </div>
          ) : null}

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fdf8f2_0%,#fbf4eb_100%)] px-4 py-5 md:px-6 md:py-6"
          >
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
              {messages.length === 0 ? (
                <div className="mx-auto mt-10 max-w-xl rounded-[30px] border border-dashed border-[#dccdbc] bg-[linear-gradient(135deg,#fffdf8,#f5ecdf)] px-6 py-10 text-center shadow-[0_16px_40px_rgba(90,70,45,0.06)]">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#e3d6c7] bg-white/80 text-2xl text-[#8f7962]">
                    C
                  </div>
                  <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-[#90795f]">
                    Conversacion abierta
                  </p>
                  <h3 className="mt-3 font-serif text-2xl text-[#241a12]">
                    Todavia no hay mensajes.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#625549]">
                    Abre la sala con un mensaje amable, breve y util para el resto de la comunidad.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.userId === currentUserId;

                  return (
                    <article
                      key={message.id}
                      className={cn(
                        "flex w-full",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[88%] rounded-[26px] border px-4 py-3 shadow-[0_12px_28px_rgba(90,70,45,0.05)] md:max-w-[72%]",
                          isOwn
                            ? "border-[#2e2117] bg-[linear-gradient(180deg,#34251b,#241912)] text-[#fbf3e7]"
                            : "border-[#e3d6c7] bg-white text-[#2f251d]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                isOwn ? "text-white" : "text-[#241a12]"
                              )}
                            >
                              {message.displayName}
                            </p>
                            <div
                              className={cn(
                                "mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]",
                                isOwn ? "text-[#d8c5ae]" : "text-[#8f7962]"
                              )}
                            >
                              <span>{formatMessageTime(message.createdAt)}</span>
                              <span className="hidden h-1 w-1 rounded-full bg-current sm:block" />
                              <span className="capitalize">{formatDayLabel(message.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <p
                          className={cn(
                            "mt-3 whitespace-pre-wrap text-sm leading-6",
                            isOwn ? "text-[#f8efe3]" : "text-[#5b4e43]"
                          )}
                        >
                          {message.body}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          <footer className="border-t border-[#eadbc9] bg-[linear-gradient(180deg,#fffdfa,#f8f0e5)] px-4 py-4 md:px-6 md:py-5">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
              <div className="hidden gap-3 text-[11px] uppercase tracking-[0.18em] text-[#8f7962] md:grid md:grid-cols-3">
                <span>Claro y respetuoso</span>
                <span>Una idea por mensaje</span>
                <span>Comunidad privada</span>
              </div>

              <form
                className="flex flex-col gap-3 md:flex-row md:items-end"
                onSubmit={handleSubmit}
              >
                <label className="flex-1">
                  <span className="sr-only">Mensaje</span>
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder={
                      canSend
                        ? "Escribe aqui tu mensaje..."
                        : "Ahora mismo no puedes enviar mensajes."
                    }
                    disabled={!canSend || isSending}
                    rows={2}
                    className="min-h-[88px] w-full rounded-[24px] border border-[#e1d4c4] bg-white px-4 py-3 text-sm leading-6 text-[#241a12] outline-none transition focus:border-[#2d2218] focus:shadow-[0_0_0_4px_rgba(45,34,24,0.06)] disabled:cursor-not-allowed disabled:opacity-70 md:min-h-[112px] md:py-4"
                  />
                </label>

                <div className="flex items-center justify-between gap-3 md:w-[210px] md:flex-col md:items-stretch">
                  <p className="hidden text-xs leading-5 text-[#7b6a58] md:block">
                    Maximo 1500 caracteres.
                  </p>
                  <button
                    type="submit"
                    disabled={!canSend || isSending || !body.trim()}
                    className="inline-flex items-center justify-center rounded-[20px] border border-[#251b12] bg-[#251b12] px-5 py-3 text-sm font-medium text-[#f8efe3] shadow-[0_12px_28px_rgba(37,27,18,0.14)] transition hover:bg-[#3a2c1f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending ? "Enviando..." : "Enviar mensaje"}
                  </button>
                </div>
              </form>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-[32px] border border-[#ddd1c0] bg-[linear-gradient(180deg,rgba(255,251,246,0.96),rgba(249,241,231,0.92))] p-5 shadow-[0_20px_54px_rgba(81,58,33,0.08)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(47,35,24,0.06),transparent_34%)]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">
              {launcherTitle}
            </p>
            <h3 className="mt-2 font-serif text-3xl text-[#241a12]">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#625549]">
              {subtitle}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#7b6a58]">
              {launcherDescription}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#6f5f50]">
              <div className="rounded-full border border-[#e0d3c2] bg-white/80 px-3 py-2 text-xs md:text-sm">
                Participando como <span className="font-medium text-[#241a12]">{currentDisplayName}</span>
              </div>
              <div className="rounded-full border border-[#e0d3c2] bg-white/80 px-3 py-2 text-xs md:text-sm">
                {isRefreshing
                  ? "Actualizando mensajes..."
                  : `${messages.length} mensaje${messages.length === 1 ? "" : "s"} visibles`}
              </div>
              <div className="rounded-full border border-[#e0d3c2] bg-white/80 px-3 py-2 text-xs md:text-sm">
                Ambiente sereno y privado
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[220px] md:items-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-[#251b12] bg-[#251b12] px-5 py-3 text-sm font-medium text-[#f8efe3] shadow-[0_12px_28px_rgba(37,27,18,0.14)] transition hover:bg-[#3a2c1f]"
            >
              Abrir chat
            </button>
          </div>
        </div>
      </section>

      {isMounted && isModalOpen
        ? createPortal(
            <div className="fixed inset-0 z-[120]">
              <button
                aria-label="Cerrar chat"
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/45 backdrop-blur-[4px]"
              />

              <div className="absolute left-1/2 top-1/2 h-[calc(100vh-24px)] w-[96vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 animate-[chatModalIn_180ms_ease-out] md:h-[calc(100vh-48px)]">
                {renderChatShell({ modal: true, scrollRef: modalListRef })}
              </div>
            </div>,
            document.body
          )
        : null}

      <style jsx global>{`
        @keyframes chatModalIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}
