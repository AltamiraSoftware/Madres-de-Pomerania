import EmailSequenceEditor from "@/components/admin/EmailSequenceEditor";
import { getAdminEmailSequences } from "@/lib/admin/email-sequences";

function groupByMonth<T extends { month_index: number; is_active: boolean }>(items: T[]) {
  return items.reduce<Record<number, T[]>>((acc, item) => {
    const key = item.month_index;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
}

export default async function AdminEmailsPage() {
  const emailSequences = await getAdminEmailSequences();
  const groupedSequences = groupByMonth(emailSequences);
  const months = Object.keys(groupedSequences)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-[#dfd1c1] bg-[linear-gradient(135deg,#fbf6ef,#f4e5ce)] p-6 md:p-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b755e]">
          Emails
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-[#241a12] md:text-4xl">
              Secuencias editoriales
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#635548] md:text-[15px]">
              Cada mes se presenta como desplegable para reducir ruido visual y
              revisar el contenido de forma mas ordenada.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-[#4d4034] sm:w-auto">
            <div className="rounded-[20px] bg-white/80 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#8f7962]">
                Total
              </div>
              <div className="mt-2 font-serif text-2xl">{emailSequences.length}</div>
            </div>
            <div className="rounded-[20px] bg-white/80 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#8f7962]">
                Activas
              </div>
              <div className="mt-2 font-serif text-2xl">
                {emailSequences.filter((sequence) => sequence.is_active).length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {months.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-[#d7c8b8] bg-white/80 p-6 text-sm text-[#65594c]">
          No hay secuencias en <code>email_sequences</code>.
        </section>
      ) : (
        <div className="space-y-4">
          {months.map((month, index) => {
            const monthSequences = groupedSequences[month];
            const activeCount = monthSequences.filter((sequence) => sequence.is_active).length;

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
                      Mes {month}
                    </h3>
                    <p className="mt-2 text-sm text-[#68594c]">
                      {monthSequences.length} secuencias · {activeCount} activas
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#f7efe4] px-4 py-2 text-sm text-[#5c4e42]">
                      Ver contenido
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-[#dccdbc] bg-white text-[#5c4e42] transition-transform group-open:rotate-180">
                      <span className="text-lg">⌄</span>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-[#efe3d6] bg-[linear-gradient(180deg,rgba(252,248,243,0.75),rgba(255,255,255,0.92))] px-4 py-4 md:px-6 md:py-6">
                  <div className="grid gap-4">
                    {monthSequences.map((sequence) => (
                      <article
                        key={sequence.id}
                        className="rounded-[26px] border border-[#eadfce] bg-white p-5 shadow-[0_10px_30px_rgba(92,74,54,0.05)]"
                      >
                        <EmailSequenceEditor sequence={sequence} />
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
