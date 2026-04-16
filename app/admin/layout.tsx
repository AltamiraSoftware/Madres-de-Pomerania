import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/admin/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,226,197,0.55),transparent_32%),linear-gradient(180deg,#f8f1e7_0%,#f3eadf_55%,#efe5d8_100%)] px-4 py-4 md:px-6 md:py-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <AdminSidebar />
        </div>

        <section className="overflow-hidden rounded-[36px] border border-[#d8ccbb] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,240,0.88))] shadow-[0_24px_80px_rgba(88,64,36,0.08)] backdrop-blur-sm">
          <div className="border-b border-[#e4d7c6] px-5 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-[#90795f]">
                  Administración
                </p>
                <h1 className="mt-3 font-serif text-3xl text-[#241a12] md:text-4xl">
                  Centro de control
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#635548] md:text-[15px]">
                  Una vista más clara para gestionar contenido, revisar el estado
                  del programa y mantener la operación editorial bajo control.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e2d4c3] bg-white/80 px-4 py-3 text-sm text-[#5f5347] shadow-[0_10px_24px_rgba(95,83,71,0.06)]">
                {admin.email ?? admin.userId}
              </div>
            </div>
          </div>

          <div className="px-4 py-5 md:px-8 md:py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
