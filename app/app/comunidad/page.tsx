import Link from "next/link";
import ClientDashboardShell from "@/components/app/ClientDashboardShell";
import CommunityChat from "@/components/app/CommunityChat";
import SubscribeButton from "@/components/app/SubscribeButton";
import { getUnlockedDossiersForUser } from "@/lib/content/get-unlocked-dossiers";
import {
  getChatMessages,
  getChatViewerContext
} from "@/lib/chat/server";
import { isMutedNow } from "@/lib/chat/utils";
import { redirect } from "next/navigation";

function formatMutedUntil(date: string | null) {
  if (!date) {
    return "Hasta nuevo aviso";
  }

  return new Date(date).toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CommunityPage() {
  const viewer = await getChatViewerContext();

  if (!viewer) {
    redirect("/");
  }

  const dossiers = await getUnlockedDossiersForUser(viewer.userId);
  const latestDossier = dossiers[dossiers.length - 1] ?? null;
  const latestDossierLabel = latestDossier?.monthIndex
    ? `Mes ${latestDossier.monthIndex}`
    : "Tu biblioteca empezará a llenarse pronto";

  const canRead = viewer.hasActiveSubscription && !viewer.moderation.isBlocked;
  const canSend = canRead && !isMutedNow(viewer.moderation);
  const messages = canRead && viewer.room ? await getChatMessages(viewer.room.id) : [];

  return (
    <ClientDashboardShell
      dossierCount={dossiers.length}
      latestDossierLabel={latestDossierLabel}
    >
      {!viewer.hasActiveSubscription ? (
        <section className="overflow-hidden rounded-[30px] border border-[#ddd1c0] bg-white/92 shadow-[0_16px_48px_rgba(84,64,40,0.06)]">
          <div className="grid gap-5 border-b border-[#eee2d5] px-5 py-6 md:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8e7760]">
                Comunidad privada
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#241a12]">
                Activa tu acceso para entrar al chat
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625549]">
                La conversación comunitaria está reservada para miembros con suscripción activa. En cuanto reanudes tu plan, podrás leer y participar otra vez.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e6d8c7] bg-[linear-gradient(180deg,#fffdf9,#f6ede1)] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                Estado actual
              </p>
              <p className="mt-2 font-serif text-3xl text-[#241a12]">
                Sin acceso
              </p>
              <p className="mt-2 text-sm text-[#625549]">
                Los mensajes de la comunidad permanecen ocultos hasta que tu suscripción vuelva a estar activa.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm leading-6 text-[#625549]">
              Tu dashboard y tus dossiers siguen aquí, pero la comunidad requiere acceso activo.
            </div>
            <div className="lg:min-w-[240px]">
              <SubscribeButton userId={viewer.userId} tier="esencial" />
            </div>
          </div>
        </section>
      ) : viewer.moderation.isBlocked ? (
        <section className="overflow-hidden rounded-[30px] border border-[#e4cdc7] bg-white/92 shadow-[0_16px_48px_rgba(84,64,40,0.06)]">
          <div className="px-5 py-10 md:px-6 md:py-12">
            <div className="rounded-[28px] border border-dashed border-[#e0c9c2] bg-[linear-gradient(135deg,#fff8f7,#f7ebe8)] p-6 text-center md:p-8">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#9b6e66]">
                Acceso restringido
              </p>
              <h2 className="mt-3 font-serif text-3xl text-[#241a12]">
                Tu acceso a la comunidad ha sido restringido
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#67584b]">
                Ahora mismo no puedes entrar al chat comunitario. Si necesitas revisar tu caso, escribe al equipo y te ayudaremos.
              </p>
              {viewer.moderation.reason ? (
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#7b615b]">
                  Motivo registrado: {viewer.moderation.reason}
                </p>
              ) : null}
              <Link
                href="/app"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-[#251b12] bg-[#251b12] px-4 py-2 text-sm text-[#f8efe3] transition-colors hover:bg-[#3a2c1f]"
              >
                Volver al panel
              </Link>
            </div>
          </div>
        </section>
      ) : !viewer.room ? (
        <section className="rounded-[30px] border border-[#ddd1c0] bg-white/92 px-5 py-8 text-sm text-[#625549] shadow-[0_16px_48px_rgba(84,64,40,0.06)] md:px-6">
          La sala principal de la comunidad todavía no está disponible.
        </section>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-[26px] border border-[#ddd1c0] bg-white/92 p-5 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                Acceso
              </p>
              <p className="mt-3 font-serif text-3xl text-[#241a12]">Activo</p>
              <p className="mt-2 text-sm text-[#625549]">
                Tu suscripción te permite leer y participar en la comunidad.
              </p>
            </article>

            <article className="rounded-[26px] border border-[#ddd1c0] bg-white/92 p-5 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                Mensajes visibles
              </p>
              <p className="mt-3 font-serif text-3xl text-[#241a12]">{messages.length}</p>
              <p className="mt-2 text-sm text-[#625549]">
                Conversaciones cargadas en esta sala compartida.
              </p>
            </article>

            <article className="rounded-[26px] border border-[#ddd1c0] bg-white/92 p-5 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                Estado de escritura
              </p>
              <p className="mt-3 font-serif text-3xl text-[#241a12]">
                {canSend ? "Libre" : "Silenciada"}
              </p>
              <p className="mt-2 text-sm text-[#625549]">
                {canSend
                  ? "Puedes escribir y participar con normalidad."
                  : `Podrás volver a escribir: ${formatMutedUntil(viewer.moderation.mutedUntil)}`}
              </p>
            </article>
          </section>

          <CommunityChat
            roomId={viewer.room.id}
            currentUserId={viewer.userId}
            currentDisplayName={viewer.displayName}
            initialMessages={messages}
            mutedUntil={viewer.moderation.mutedUntil}
            mutedReason={viewer.moderation.reason}
            canSend={canSend}
            title="Sala privada de madres Pomerania"
            subtitle="Una conversación centrada, elegante y cercana para compartir avances, dudas y pequeños descubrimientos del programa."
            closeHref="/app"
            closeLabel="Volver al panel"
          />
        </div>
      )}
    </ClientDashboardShell>
  );
}
