import DossierEditor from "@/components/admin/DossierEditor";
import { getAdminDossiers } from "@/lib/admin/content-items";

function groupByMonth<T extends { month_index: number | null; is_active: boolean }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = item.month_index === null ? "without-month" : String(item.month_index);

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
}

export default async function AdminDossiersPage() {
  const dossiers = await getAdminDossiers();
  const groupedDossiers = groupByMonth(dossiers);
  const months = Object.keys(groupedDossiers).sort((a, b) => {
    if (a === "without-month") return 1;
    if (b === "without-month") return -1;
    return Number(a) - Number(b);
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-[#dfd1c1] bg-[linear-gradient(135deg,#f7f0e6,#ead7bc)] p-6 md:p-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b755e]">
          Dossiers
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-[#241a12] md:text-4xl">
              Biblioteca PDF
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#635548] md:text-[15px]">
              Gestiona cada dossier por mes con una vista plegable y limpia,
              pensada para trabajar rapido incluso en movil.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-[#4d4034] sm:w-auto">
            <div className="rounded-[20px] bg-white/80 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#8f7962]">
                Total
              </div>
              <div className="mt-2 font-serif text-2xl">{dossiers.length}</div>
            </div>
            <div className="rounded-[20px] bg-white/80 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#8f7962]">
                Activos
              </div>
              <div className="mt-2 font-serif text-2xl">
                {dossiers.filter((dossier) => dossier.is_active).length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {months.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-[#d7c8b8] bg-white/80 p-6 text-sm text-[#65594c]">
          No hay dossiers en <code>content_items</code>.
        </section>
      ) : (
        <div className="space-y-4">
          {months.map((month, index) => {
            const monthDossiers = groupedDossiers[month];
            const activeCount = monthDossiers.filter((dossier) => dossier.is_active).length;
            const heading = month === "without-month" ? "Sin mes" : `Mes ${month}`;

            return (
              <details
                key={month}
                open={index === 0}
                className="group overflow-hidden rounded-[28px] border border-[#ded1c2] bg-white/85 shadow-[0_18px_48px_rgba(84,64,42,0.06)]"
              >
                <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-5 marker:hidden md:flex-row md:items-center md:justify-between md:px-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#8d785f]">
                      Programa
                    </p>
                    <h3 className="mt-2 font-serif text-2xl text-[#241a12] md:text-3xl">
                      {heading}
                    </h3>
                    <p className="mt-2 text-sm text-[#68594c]">
                      {monthDossiers.length} dossiers · {activeCount} activos
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#f7efe4] px-4 py-2 text-sm text-[#5c4e42]">
                      Ver archivos
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-[#dccdbc] bg-white text-[#5c4e42] transition-transform group-open:rotate-180">
                      <span className="text-lg">⌄</span>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-[#efe3d6] bg-[linear-gradient(180deg,rgba(252,248,243,0.75),rgba(255,255,255,0.92))] px-4 py-4 md:px-6 md:py-6">
                  <div className="grid gap-4">
                    {monthDossiers.map((dossier) => (
                      <article
                        key={dossier.id}
                        className="rounded-[26px] border border-[#eadfce] bg-white p-5 shadow-[0_10px_30px_rgba(92,74,54,0.05)]"
                      >
                        <DossierEditor dossier={dossier} />
                      </article>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
