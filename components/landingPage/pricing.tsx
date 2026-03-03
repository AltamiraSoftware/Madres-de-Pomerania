"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Minus } from "lucide-react"

const plans = [
  {
    id: "essential",
    name: "Esencial",
    price: "19",
    period: "/mes",
    description: "Todo lo basico para cuidar a tu Pomerania con confianza.",
    features: [
      "Guias de cuidado basicas",
      "Actualizaciones mensuales de salud",
      "Chat comunitario",
      "Contenido semanal por drip",
      "Acceso al archivo de guias",
    ],
    cta: "Suscribirme Esencial",
    highlighted: false,
    comparison: [true, true, true, false, false, false],
  },
  {
    id: "vip",
    name: "A Medida",
    price: "49",
    period: "/mes",
    description: "La experiencia completa: personalizada, directa y exclusiva.",
    features: [
      "Todo lo del plan Esencial",
      "Planes de cuidado personalizados",
      "Sesiones mensuales de Q&A en vivo",
      "Soporte prioritario directo",
      "Dossier mensual personalizado",
    ],
    cta: "Suscribirme A Medida",
    highlighted: true,
    comparison: [true, true, true, true, true, true],
  },
]

const comparisonRows = [
  "Guias de cuidado",
  "Actualizaciones de salud",
  "Chat comunitario",
  "Planes personalizados",
  "Q&A en vivo mensual",
  "Dossier mensual",
]

export function Pricing() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.06 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id="membresia" className="noise-bg bg-secondary py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        {/* Header */}
        <div className="mb-20">
          <p className="mb-6 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Planes
          </p>
          <h2 className="max-w-md font-serif text-[1.8rem] leading-[1.1] text-foreground sm:text-[2.2rem] lg:text-[2.8rem] text-balance">
            Elige tu nivel de cuidado
          </h2>
          <p className="mt-5 max-w-sm text-[13px] leading-[1.75] text-muted-foreground">
            Sin permanencia. Cancela cuando quieras. Tu Pomerania merece lo mejor.
          </p>
          <div className="mt-8 h-px w-10 bg-border" />
        </div>

        {/* Cards */}
        <div className="grid gap-[1px] border border-border md:grid-cols-2">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`relative flex flex-col p-10 lg:p-14 transition-all duration-1000 ease-out ${
                visible ? (i === 0 ? "stagger-1" : "stagger-2") : "opacity-0"
              } ${plan.highlighted ? "bg-background" : "bg-secondary"}`}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="mb-6">
                  <span className="inline-block border border-border px-3 py-1 text-[9px] tracking-[0.25em] text-muted-foreground uppercase">
                    Mas elegido
                  </span>
                </div>
              )}

              <h3 className="font-serif text-[1.4rem] text-foreground lg:text-[1.7rem]">
                {plan.name}
              </h3>
              <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mt-8 flex items-baseline">
                <span className="font-serif text-[2.8rem] leading-none tracking-tight text-foreground lg:text-[3.2rem]">
                  {plan.price}
                </span>
                <span className="ml-1 text-[14px] text-muted-foreground">{"€"}</span>
                <span className="ml-1 text-[12px] text-muted-foreground">{plan.period}</span>
              </div>

              <div className="my-8 h-px w-8 bg-border" />

              {/* Features */}
              <ul className="mb-10 flex flex-1 flex-col gap-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[13px] leading-[1.7] text-muted-foreground">
                    <span className="mt-[9px] block h-[3px] w-[3px] flex-shrink-0 rounded-full bg-muted-foreground/40" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`btn-luxury w-full py-3.5 text-[10px] tracking-[0.22em] uppercase transition-all ${
                  plan.highlighted
                    ? "bg-foreground text-background"
                    : "border border-border bg-transparent text-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <div className="mt-20 border border-border bg-background p-8 lg:p-12">
          <h3 className="mb-8 font-serif text-[1.15rem] text-foreground">
            Comparativa de planes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-left text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Caracteristica
                  </th>
                  <th className="pb-4 text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Esencial
                  </th>
                  <th className="pb-4 text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    A Medida
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={row} className={idx < comparisonRows.length - 1 ? "border-b border-border/50" : ""}>
                    <td className="py-4 text-[13px] text-muted-foreground">{row}</td>
                    <td className="py-4 text-center">
                      {plans[0].comparison[idx]
                        ? <Check className="mx-auto h-3.5 w-3.5 text-foreground/50" strokeWidth={1.5} />
                        : <Minus className="mx-auto h-3.5 w-3.5 text-border" strokeWidth={1.5} />}
                    </td>
                    <td className="py-4 text-center">
                      {plans[1].comparison[idx]
                        ? <Check className="mx-auto h-3.5 w-3.5 text-foreground/50" strokeWidth={1.5} />
                        : <Minus className="mx-auto h-3.5 w-3.5 text-border" strokeWidth={1.5} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
