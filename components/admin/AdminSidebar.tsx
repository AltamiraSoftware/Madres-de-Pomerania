"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/admin",
    label: "Resumen",
    description: "Vista operativa del negocio",
  },
  {
    href: "/admin/emails",
    label: "Emails",
    description: "Secuencias y contenido editorial",
  },
  {
    href: "/admin/dossiers",
    label: "Dossiers",
    description: "PDFs y biblioteca privada",
  },
  {
    href: "/admin/chat",
    label: "Chat",
    description: "Moderacion de comunidad",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="overflow-hidden rounded-[32px] border border-[#d7ccb9] bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(244,232,214,0.88))] shadow-[0_18px_60px_rgba(79,58,33,0.08)] backdrop-blur-sm">
      <div className="border-b border-[#d7ccb9] px-5 py-6">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b7760]">
          Panel admin
        </p>
        <h2 className="mt-3 font-serif text-3xl text-[#251b12]">Ana y Boo</h2>
        <p className="mt-3 text-sm leading-6 text-[#5f5347]">
          Gestion editorial, dossiers y estado del plan esencial.
        </p>
      </div>

      <nav className="space-y-2 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

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
              <div className="text-sm font-medium">{item.label}</div>
              <div
                className={cn(
                  "mt-1 text-xs leading-5",
                  isActive ? "text-[#eadcc9]" : "text-[#7b6a58]"
                )}
              >
                {item.description}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
