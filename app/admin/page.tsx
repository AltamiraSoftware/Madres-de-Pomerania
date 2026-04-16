import Link from "next/link";
import { getAdminDossiers } from "@/lib/admin/content-items";
import { getAdminEmailSequences } from "@/lib/admin/email-sequences";
import { getActiveAdminSubscriptions } from "@/lib/admin/subscriptions";

function formatDate(date: string | null) {
  if (!date) {
    return "Sin fecha";
  }

  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminPage() {
  const [emailSequences, dossiers, activeSubscriptions] = await Promise.all([
    getAdminEmailSequences(),
    getAdminDossiers(),
    getActiveAdminSubscriptions(),
  ]);

  const stats = [
    {
      label: "Emails activos",
      value: emailSequences.filter((sequence) => sequence.is_active).length,
      helper: `${emailSequences.length} secuencias configuradas`,
    },
    {
      label: "Dossiers activos",
      value: dossiers.filter((dossier) => dossier.is_active).length,
      helper: `${dossiers.length} assets en biblioteca`,
    },
    {
      label: "Suscripciones activas",
      value: activeSubscriptions.length,
      helper: "Clientes con acceso vigente",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[34px] border border-[#dccdbd] bg-[linear-gradient(135deg,#251b12_0%,#3a2c1f_40%,#8f7556_100%)] px-6 py-7 text-[#f8efe3] shadow-[0_26px_70px_rgba(62,43,26,0.18)] md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)] xl:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#e7d7c1]">
              Visión general
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
              Un panel más claro para operar contenido y membresías.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#efe0cb] md:text-[15px]">
              Todo el trabajo editorial y operativo reunido en una interfaz más
              limpia, premium y fácil de revisar de un vistazo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#eddcc7]">
                  {stat.label}
                </p>
                <p className="mt-3 font-serif text-3xl">{stat.value}</p>
                <p className="mt-2 text-sm text-[#e8d8c4]">{stat.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-[#ddd1c0] bg-white/90 p-6 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">
            Gestión editorial
          </p>
          <h3 className="mt-3 font-serif text-3xl text-[#251b12]">
            Emails por mes
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#625448]">
            La nueva vista agrupa cada mes como desplegable para localizar rápido
            la secuencia correcta y reducir saturación visual.
          </p>
          <Link
            href="/admin/emails"
            className="mt-6 inline-flex rounded-full border border-[#251b12] bg-[#251b12] px-4 py-2 text-sm text-[#f8efe3] transition-colors hover:bg-[#3a2c1f]"
          >
            Abrir emails
          </Link>
        </article>

        <article className="rounded-[28px] border border-[#ddd1c0] bg-white/90 p-6 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">
            Biblioteca privada
          </p>
          <h3 className="mt-3 font-serif text-3xl text-[#251b12]">
            Dossiers y PDFs
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#625448]">
            Gestiona metadatos y reemplazos de PDF con una estructura plegable,
            responsive y más limpia para el trabajo diario.
          </p>
          <Link
            href="/admin/dossiers"
            className="mt-6 inline-flex rounded-full border border-[#251b12] bg-[#251b12] px-4 py-2 text-sm text-[#f8efe3] transition-colors hover:bg-[#3a2c1f]"
          >
            Abrir dossiers
          </Link>
        </article>

        <article className="rounded-[28px] border border-[#ddd1c0] bg-white/90 p-6 shadow-[0_14px_38px_rgba(90,70,45,0.05)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">
            Comunidad
          </p>
          <h3 className="mt-3 font-serif text-3xl text-[#251b12]">
            Moderación del chat
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#625448]">
            Revisa participantes activos, aplica silencios temporales y bloqueos sin tocar el resto del sistema.
          </p>
          <Link
            href="/admin/chat"
            className="mt-6 inline-flex rounded-full border border-[#251b12] bg-[#251b12] px-4 py-2 text-sm text-[#f8efe3] transition-colors hover:bg-[#3a2c1f]"
          >
            Abrir chat
          </Link>
        </article>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[#dfd0bf] bg-white/92 shadow-[0_18px_48px_rgba(87,66,43,0.06)]">
        <div className="border-b border-[#eee2d5] px-5 py-5 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f7962]">
                Suscripciones
              </p>
              <h3 className="mt-2 font-serif text-3xl text-[#241a12]">
                Activas ahora
              </h3>
            </div>
            <p className="text-sm text-[#67594d]">
              Nombre, email, tier y próxima referencia de renovación.
            </p>
          </div>
        </div>

        {activeSubscriptions.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#67594d] md:px-6">
            No hay suscripciones activas en este momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f7efe4] text-[11px] uppercase tracking-[0.2em] text-[#8d785f]">
                <tr>
                  <th className="px-5 py-4 font-medium md:px-6">Cliente</th>
                  <th className="px-5 py-4 font-medium md:px-6">Email</th>
                  <th className="px-5 py-4 font-medium md:px-6">Tier</th>
                  <th className="px-5 py-4 font-medium md:px-6">Estado</th>
                  <th className="px-5 py-4 font-medium md:px-6">Renovación</th>
                </tr>
              </thead>
              <tbody>
                {activeSubscriptions.map((subscription) => (
                  <tr
                    key={subscription.userId}
                    className="border-t border-[#f0e4d7] text-sm text-[#4d4034]"
                  >
                    <td className="px-5 py-4 md:px-6">
                      <div className="font-medium text-[#241a12]">
                        {subscription.fullName ?? "Sin nombre"}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8c7862]">
                        {subscription.userId.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-5 py-4 md:px-6">{subscription.email ?? "Sin email"}</td>
                    <td className="px-5 py-4 md:px-6">
                      <span className="rounded-full bg-[#f7efe4] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#6e5c4c]">
                        {subscription.tier}
                      </span>
                    </td>
                    <td className="px-5 py-4 md:px-6">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-700">
                        {subscription.cancelAtPeriodEnd ? "Activa fin de ciclo" : "Activa"}
                      </span>
                    </td>
                    <td className="px-5 py-4 md:px-6">{formatDate(subscription.currentPeriodEnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
