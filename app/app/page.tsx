import Link from "next/link";
import CheckoutStatusBanner from "@/components/app/CheckoutStatusBanner";
import ClientDashboardShell from "@/components/app/ClientDashboardShell";
import ManageSubscriptionButton from "@/components/app/ManageSubscriptionButton";
import SubscribeButton from "@/components/app/SubscribeButton";
import { getUnlockedDossiersForUser } from "@/lib/content/get-unlocked-dossiers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && admin) redirect("/admin");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status,tier,current_period_end,cancel_at,cancel_at_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const dossiers = await getUnlockedDossiersForUser(user.id);

  const status = sub?.status ?? "canceled";
  const tier = sub?.tier ?? "esencial";
  const isActive = status === "active";
  const scheduledCancel = isActive && sub?.cancel_at_period_end === true;
  const cancelDate = scheduledCancel
    ? sub?.cancel_at ?? sub?.current_period_end ?? null
    : null;
  const latestDossier = dossiers[dossiers.length - 1] ?? null;
  const latestDossierLabel = latestDossier?.monthIndex
    ? `Mes ${latestDossier.monthIndex}`
    : "Tu biblioteca empezara a llenarse pronto";

  return (
    <ClientDashboardShell
      dossierCount={dossiers.length}
      latestDossierLabel={latestDossierLabel}
    >
      <div className="space-y-6">
        <div className="mt-6">
          <CheckoutStatusBanner tier={tier} />
        </div>

        {isActive ? (
          <section className="overflow-hidden rounded-[30px] border border-[#ddd1c0] bg-white/92 shadow-[0_16px_48px_rgba(84,64,40,0.06)]">
            <div className="grid gap-5 border-b border-[#eee2d5] px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8e7760]">
                  Progreso actual
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#241a12]">
                  Suscripcion activa
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625549]">
                  Mantienes acceso al plan <span className="font-medium text-[#241a12]">{tier}</span> y
                  ya tienes <span className="font-medium text-[#241a12]"> {dossiers.length} </span>
                  dossier{dossiers.length === 1 ? "" : "s"} desbloqueado{dossiers.length === 1 ? "" : "s"} en tu biblioteca privada.
                </p>

                {scheduledCancel && cancelDate && (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625549]">
                    Tu suscripcion se cancelara el <span className="font-medium text-[#241a12]">{formatLongDate(cancelDate)}</span>.
                    Mantendras acceso hasta esa fecha.
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[22px] border border-[#e6d8c7] bg-[linear-gradient(180deg,#fffdf9,#f6ede1)] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                    Plan
                  </p>
                  <p className="mt-2 font-serif text-3xl text-[#241a12]">
                    {tier}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[#e6d8c7] bg-[linear-gradient(180deg,#fffdf9,#f6ede1)] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                    Ultimo dossier
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#241a12]">
                    {latestDossierLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm leading-6 text-[#625549]">
                Puedes gestionar tu plan o seguir avanzando en los contenidos desbloqueados.
              </div>
              <div className="lg:min-w-[240px]">
                <ManageSubscriptionButton userId={user.id} />
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[30px] border border-[#ddd1c0] bg-white/92 shadow-[0_16px_48px_rgba(84,64,40,0.06)]">
            <div className="grid gap-5 border-b border-[#eee2d5] px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8e7760]">
                  Estado del plan
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#241a12]">
                  Sin acceso activo
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#625549]">
                  Estado actual: <span className="font-medium text-[#241a12]">{status}</span>
                </p>

                {cancelDate && (
                  <p className="mt-3 text-sm leading-6 text-[#625549]">
                    Tu acceso finalizo el <span className="font-medium text-[#241a12]">{formatLongDate(cancelDate)}</span>.
                  </p>
                )}
              </div>

              <div className="rounded-[22px] border border-[#e6d8c7] bg-[linear-gradient(180deg,#fffdf9,#f6ede1)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                  Biblioteca actual
                </p>
                <p className="mt-2 font-serif text-3xl text-[#241a12]">
                  {dossiers.length}
                </p>
                <p className="mt-2 text-sm text-[#625549]">
                  Dossiers visibles en tu panel
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm leading-6 text-[#625549]">
                Activa tu plan para seguir desbloqueando nuevos contenidos del programa.
              </div>
              <div className="lg:min-w-[240px]">
                <SubscribeButton userId={user.id} tier="esencial" />
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-[26px] border border-[#ddd1c0] bg-white/92 p-5 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">Comunidad</p>
            <h3 className="mt-3 font-serif text-3xl text-[#241a12]">Chat privado</h3>
            <p className="mt-3 text-sm leading-6 text-[#625549]">Un espacio compartido para conversar con otras miembros del programa en tiempo real.</p>
            <Link
              href="/app/comunidad"
              className="mt-5 inline-flex items-center justify-center rounded-full border border-[#251b12] bg-[#251b12] px-4 py-2 text-sm text-[#f8efe3] transition-colors hover:bg-[#3a2c1f]"
            >
              Abrir comunidad
            </Link>
          </article>

          <article className="rounded-[26px] border border-[#ddd1c0] bg-white/92 p-5 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">Biblioteca</p>
            <h3 className="mt-3 font-serif text-3xl text-[#241a12]">{dossiers.length}</h3>
            <p className="mt-3 text-sm leading-6 text-[#625549]">Dossiers disponibles en tu espacio privado y ordenados segun tu avance.</p>
          </article>

          <article className="rounded-[26px] border border-[#ddd1c0] bg-white/92 p-5 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">Proximo paso</p>
            <h3 className="mt-3 font-serif text-3xl text-[#241a12]">{latestDossierLabel}</h3>
            <p className="mt-3 text-sm leading-6 text-[#625549]">Tu panel ya esta preparado para futuras secciones como comunidad, VIP y soporte.</p>
          </article>
        </section>

        <section
          id="dossiers"
          className="overflow-hidden rounded-[30px] border border-[#ddd1c0] bg-white/92 shadow-[0_16px_48px_rgba(84,64,40,0.06)]"
        >
          <div className="border-b border-[#eee2d5] px-5 py-5 md:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8e7760]">
                  Mis dossiers
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#241a12]">
                  Contenido desbloqueado
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[#625549]">
                Solo ves los dossiers que ya tienes desbloqueados en tu progreso.
              </p>
            </div>
          </div>

          {dossiers.length === 0 ? (
            <div className="px-5 py-10 md:px-6 md:py-12">
              <div className="rounded-[28px] border border-dashed border-[#dccdbc] bg-[linear-gradient(135deg,#fcf8f3,#f5ebde)] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] md:p-8">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#e3d6c7] bg-white/80 text-2xl text-[#8f7962]">
                  D
                </div>
                <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-[#90795f]">
                  Aun no disponible
                </p>
                <h3 className="mt-3 font-serif text-2xl text-[#241a12]">
                  Tu biblioteca se ira completando mes a mes
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#67584b]">
                  Cuando el sistema desbloquee nuevos contenidos segun tu ciclo del programa, los veras aqui en una vista clara y ordenada.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 px-5 py-5 md:px-6 md:py-6 xl:grid-cols-2">
              {dossiers.map((dossier) => (
                <article
                  key={dossier.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#e7dbcc] bg-[linear-gradient(180deg,#ffffff,#fbf7f1)] p-5 shadow-[0_12px_32px_rgba(87,66,43,0.05)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#8d775f]">
                        {dossier.monthIndex ? `Mes ${dossier.monthIndex}` : "Sin mes"}
                      </p>
                      <h3 className="mt-3 font-serif text-2xl text-[#241a12]">
                        {dossier.title}
                      </h3>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#9a866f]">
                        Desbloqueado el {formatLongDate(dossier.unlockedAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f6eee3] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#6e5e4f]">
                      PDF
                    </span>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-[#635549]">
                    {dossier.description ?? "Este dossier ya esta disponible para ti."}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 border-t border-[#efe3d6] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-[#625549]">
                      Disponible para lectura o descarga inmediata.
                    </div>
                    <a
                      href={`/api/dossiers/${dossier.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-[#251b12] bg-[#251b12] px-4 py-2 text-sm text-[#f8efe3] transition-colors hover:bg-[#3a2c1f]"
                    >
                      Ver o descargar
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </ClientDashboardShell>
  );
}
