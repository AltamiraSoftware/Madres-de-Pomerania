"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ClientDashboardShellProps {
  children: ReactNode;
  dossierCount: number;
  latestDossierLabel: string;
}

const navItems = [
  {
    href: "/app",
    label: "Resumen",
    description: "Tu progreso y contenido desbloqueado",
  },
  {
    href: "/app#dossiers",
    label: "Mis dossiers",
    description: "Biblioteca privada del programa",
  },
  {
    href: "/app/comunidad",
    label: "Comunidad",
    description: "Chat privado entre miembros",
  },
  {
    href: "#",
    label: "VIP",
    description: "Proximamente",
    disabled: true,
  },
];

export default function ClientDashboardShell({
  children,
  dossierCount,
  latestDossierLabel,
}: ClientDashboardShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(242,226,199,0.55),transparent_30%),linear-gradient(180deg,#f8f1e7_0%,#f4ebdf_55%,#efe5d8_100%)] px-4 py-4 md:px-6 md:py-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-[32px] border border-[#d7ccb9] bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(244,232,214,0.88))] shadow-[0_18px_60px_rgba(79,58,33,0.08)] backdrop-blur-sm">
            <div className="border-b border-[#d7ccb9] px-5 py-6">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b7760]">
                Area privada
              </p>
              <h2 className="mt-3 font-serif text-3xl text-[#251b12]">
                Ana y Boo
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5f5347]">
                Tu panel premium para seguir el programa y acceder a tu
                biblioteca privada.
              </p>
            </div>

            <div className="grid gap-3 border-b border-[#d7ccb9] px-4 py-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[22px] border border-[#e3d7c7] bg-white/85 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                  Dossiers
                </p>
                <p className="mt-2 font-serif text-3xl text-[#241a12]">
                  {dossierCount}
                </p>
                <p className="mt-2 text-sm text-[#65584b]">
                  Ya disponibles para ti
                </p>
              </div>

              <div className="rounded-[22px] border border-[#e3d7c7] bg-white/85 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7962]">
                  Ultimo avance
                </p>
                <p className="mt-2 text-sm font-medium text-[#241a12]">
                  {latestDossierLabel}
                </p>
                <p className="mt-2 text-sm text-[#65584b]">
                  Progreso visible en tu biblioteca
                </p>
              </div>
            </div>

            <nav className="space-y-2 p-4">
              {navItems.map((item) => {
                const isActive =
                  !item.disabled &&
                  (pathname === item.href || pathname.startsWith(`${item.href}/`));

                const content = (
                  <>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div
                      className={cn(
                        "mt-1 text-xs leading-5",
                        item.disabled
                          ? "text-[#9a8a78]"
                          : isActive
                            ? "text-[#eadcc9]"
                            : "text-[#7b6a58]"
                      )}
                    >
                      {item.description}
                    </div>
                  </>
                );

                if (item.disabled) {
                  return (
                    <div
                      key={item.label}
                      className="block rounded-[24px] border border-dashed border-[#dccfbe] bg-white/60 px-4 py-4 text-[#6a5b4d]"
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-[24px] border px-4 py-4 transition-all",
                      isActive
                        ? "border-[#251b12] bg-[#251b12] text-[#f7efe3] shadow-[0_12px_24px_rgba(37,27,18,0.18)]"
                        : "border-transparent bg-white/70 text-[#3d342b] hover:border-[#d7ccb9] hover:bg-white"
                    )}
                  >
                    {content}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="overflow-hidden rounded-[36px] border border-[#d8ccbb] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,240,0.88))] shadow-[0_24px_80px_rgba(88,64,36,0.08)] backdrop-blur-sm">
          <div className="border-b border-[#e4d7c6] px-5 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-[#90795f]">
                  Dashboard cliente
                </p>
                <h1 className="mt-3 font-serif text-3xl text-[#241a12] md:text-4xl">
                  Tu espacio privado
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#635548] md:text-[15px]">
                  Un entorno mas claro para seguir tu avance, revisar el estado
                  de tu suscripcion y consultar tus dossiers desbloqueados.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e2d4c3] bg-white/80 px-4 py-3 text-sm text-[#5f5347] shadow-[0_10px_24px_rgba(95,83,71,0.06)]">
                Biblioteca desbloqueada - {dossierCount} items
              </div>
            </div>
          </div>

          <div className="px-4 py-5 md:px-8 md:py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

