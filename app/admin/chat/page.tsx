import { redirect } from "next/navigation";
import CommunityChat from "@/components/app/CommunityChat";
import ChatModerationTable from "@/components/admin/ChatModerationTable";
import {
  getAdminChatParticipants,
  getChatMessages,
  getChatViewerContext,
} from "@/lib/chat/server";

export default async function AdminChatPage() {
  const viewer = await getChatViewerContext();

  if (!viewer) {
    redirect("/");
  }

  if (!viewer.isAdmin) {
    redirect("/app");
  }

  const room = viewer.room;

  if (!room) {
    return (
      <div className="rounded-[30px] border border-[#dfd0bf] bg-white/92 px-6 py-8 text-sm text-[#67594d] shadow-[0_18px_48px_rgba(87,66,43,0.06)]">
        La sala principal del chat no está disponible todavía.
      </div>
    );
  }

  const participants = await getAdminChatParticipants(room.id);
  const messages = await getChatMessages(room.id);
  const mutedCount = participants.filter((participant) => participant.moderation.isMuted).length;
  const blockedCount = participants.filter((participant) => participant.moderation.isBlocked).length;
  const activeSpeakers = participants.filter((participant) => participant.recentMessageCount > 0).length;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[34px] border border-[#dccdbd] bg-[linear-gradient(135deg,#251b12_0%,#3a2c1f_40%,#8f7556_100%)] px-6 py-7 text-[#f8efe3] shadow-[0_26px_70px_rgba(62,43,26,0.18)] md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)] xl:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#e7d7c1]">
              Moderación de comunidad
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
              Controla tono, acceso y ritmo del chat comunitario.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#efe0cb] md:text-[15px]">
              Una vista operativa para revisar participantes activos, aplicar silencios temporales y restringir acceso cuando haga falta.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#e7d7c1]">
              Sala actual: {room.name ?? room.slug}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#eddcc7]">Participantes</p>
              <p className="mt-3 font-serif text-3xl">{participants.length}</p>
              <p className="mt-2 text-sm text-[#e8d8c4]">Miembros activos con acceso</p>
            </div>
            <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#eddcc7]">Silenciadas</p>
              <p className="mt-3 font-serif text-3xl">{mutedCount}</p>
              <p className="mt-2 text-sm text-[#e8d8c4]">Lectura permitida, envío restringido</p>
            </div>
            <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#eddcc7]">Bloqueadas</p>
              <p className="mt-3 font-serif text-3xl">{blockedCount}</p>
              <p className="mt-2 text-sm text-[#e8d8c4]">Sin acceso a la comunidad</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-[#ddd1c0] bg-white/90 p-6 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">Actividad reciente</p>
          <h3 className="mt-3 font-serif text-3xl text-[#251b12]">{activeSpeakers}</h3>
          <p className="mt-3 text-sm leading-6 text-[#625448]">
            Miembros con mensajes recientes detectados en la comunidad.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#ddd1c0] bg-white/90 p-6 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">Política suave</p>
          <h3 className="mt-3 font-serif text-3xl text-[#251b12]">Silencio</h3>
          <p className="mt-3 text-sm leading-6 text-[#625448]">
            La usuaria puede seguir leyendo, pero no publicar mientras el silencio siga activo.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#ddd1c0] bg-white/90 p-6 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">Política fuerte</p>
          <h3 className="mt-3 font-serif text-3xl text-[#251b12]">Bloqueo</h3>
          <p className="mt-3 text-sm leading-6 text-[#625448]">
            La usuaria deja de ver el chat hasta que se retire la restricción.
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[#dfd0bf] bg-white/92 shadow-[0_18px_48px_rgba(87,66,43,0.06)]">
        <div className="border-b border-[#eee2d5] px-5 py-5 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">Moderación</p>
              <h3 className="mt-2 font-serif text-3xl text-[#241a12]">Miembros con acceso al chat</h3>
            </div>
            <p className="text-sm text-[#67594d]">
              Ajusta silencio, bloqueo y motivo sin tocar el resto del sistema.
            </p>
          </div>
        </div>

        <ChatModerationTable participants={participants} />
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[#dfd0bf] bg-white/92 shadow-[0_18px_48px_rgba(87,66,43,0.06)]">
        <div className="border-b border-[#eee2d5] px-5 py-5 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">Sala en directo</p>
              <h3 className="mt-2 font-serif text-3xl text-[#241a12]">Vista y respuesta como Mama de Boo</h3>
            </div>
            <p className="text-sm text-[#67594d]">
              Los mensajes enviados desde aquí se muestran al resto de miembros como Mamá de Boo.
            </p>
          </div>
        </div>

        <div className="px-5 py-5 md:px-6">
          <CommunityChat
            roomId={room.id}
            currentUserId={viewer.userId}
            currentDisplayName="Mamá de Boo"
            initialMessages={messages}
            mutedUntil={null}
            mutedReason={null}
            canSend
            title="Sala principal de comunidad"
            subtitle="Vista operativa del chat en formato modal premium, con respuesta directa del equipo bajo la firma Mamá de Boo."
            closeHref="/admin"
            closeLabel="Volver al admin"
            canDeleteMessages
          />
        </div>
      </section>
    </div>
  );
}
