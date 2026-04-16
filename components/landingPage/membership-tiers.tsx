"use client"

import { useEffect, useRef, useState } from "react"

const tiers = [
  {
    id: "esencial",
    label: "Nivel Uno",
    name: "Esencial",
    features: [
      "Acceso a Guías de Cuidado Básicas",
      "Actualizaciones Mensuales de Salud",
      "Soporte vía Chat Comunitario",
    ],
  },
  {
    id: "a-medida",
    label: "Nivel Dos",
    name: "A Medida",
    features: [
      "Planes de Cuidado Completamente Personalizados",
      "Sesiones Mensuales de Q&A en Vivo",
      "Soporte Prioritario y Asesoría Directa",
    ],
  },
]

export function MembershipTiers() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id="niveles" className="noise-bg py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        {/* Header */}
        <div
          className={`mb-20 transition-all duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="mb-6 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Membresía
          </p>
          <h2 className="max-w-md font-serif text-[1.8rem] leading-[1.1] text-foreground sm:text-[2.2rem] lg:text-[2.8rem] text-balance">
            Dos niveles, un mismo compromiso
          </h2>
          <div className="mt-8 h-px w-10 bg-border" />
        </div>

        {/* Two-column cards */}
        <div className="grid gap-[1px] border border-border md:grid-cols-2">
          {tiers.map((tier, i) => (
            <article
              key={tier.id}
              className={`flex flex-col p-10 lg:p-14 transition-all duration-1000 ease-out ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              } ${i === 0 ? "bg-background" : "bg-secondary"}`}
              style={{ transitionDelay: visible ? `${i * 180}ms` : "0ms" }}
            >
              <p className="mb-2 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                {tier.label}
              </p>
              <h3 className="font-serif text-[1.5rem] text-foreground lg:text-[1.8rem]">
                {tier.name}
              </h3>

              <div className="my-8 h-px w-8 bg-border" />

              <ul className="flex flex-col gap-5">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-4 text-[13px] leading-[1.7] text-muted-foreground"
                  >
                    <span className="mt-[9px] block h-[3px] w-[3px] flex-shrink-0 rounded-full bg-muted-foreground/40" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
