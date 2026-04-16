"use client"

import { useAuthModal } from "@/components/auth/AuthModalProvider"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Check, Minus } from "lucide-react"

const plans = [
  {
    id: "essential",
    name: "Esencial",
    label: "Entrada cuidada",
    price: "29",
    period: "/mes",
    description: "Todo lo esencial para cuidar a tu Pomerania con más criterio y calma.",
    features: [
      "Guías de cuidado básicas",
      "Actualizaciones mensuales de salud",
      "Chat comunitario",
      "Contenido semanal por drip",
      "Acceso al archivo de guías",
    ],
    cta: "Suscribirme Esencial",
    highlighted: false,
    comparison: [true, true, true, false, false, false],
  },
  {
    id: "vip",
    name: "A Medida",
    label: "Experiencia premium",
    price: "89",
    period: "/mes",
    description: "La experiencia completa, con acompañamiento más directo y recomendaciones personalizadas.",
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
  "Guías de cuidado",
  "Actualizaciones de salud",
  "Chat comunitario",
  "Planes personalizados",
  "Q&A en vivo mensual",
  "Dossier mensual",
]

export function Pricing() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const { openLogin } = useAuthModal()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.06 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id="membresia"
      className="noise-bg relative overflow-hidden bg-[linear-gradient(180deg,rgba(244,239,232,0.95)_0%,rgba(239,232,221,0.98)_48%,rgba(233,225,214,1)_100%)] py-28 lg:py-40"
    >
      <div className="pointer-events-none absolute right-[-4rem] top-16 h-72 w-72 rounded-full bg-[rgba(186,160,121,0.2)] blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-white/45 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="mb-6 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Planes
          </p>
          <h2 className="font-serif text-[1.95rem] leading-[1.05] text-foreground sm:text-[2.45rem] lg:text-[3rem] text-balance">
            Elige tu nivel de cuidado
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[14px] leading-[1.85] text-muted-foreground">
            Dos niveles claros, una lectura más limpia y una presentación más sobria.
            Elige entre una base sólida o un acompañamiento más cercano y personalizado.
          </p>
          <div className="mx-auto mt-8 h-px w-10 bg-border" />
        </div>

        <div className="mt-16 grid gap-6 xl:grid-cols-2">
          {plans.map((plan, i) => (
            <article
              key={plan.id}
              className={`relative overflow-hidden rounded-[30px] border p-8 shadow-[0_20px_70px_rgba(88,71,46,0.08)] backdrop-blur-sm transition-all duration-1000 ease-out lg:p-10 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              } ${
                plan.highlighted
                  ? "border-[rgba(122,98,68,0.1)] bg-[linear-gradient(145deg,rgba(104,82,56,0.97),rgba(70,54,39,0.98))] text-[#f7f1e8] shadow-[0_28px_90px_rgba(48,36,23,0.18)]"
                  : "border-white/60 bg-white/76 text-foreground"
              }`}
              style={{ transitionDelay: visible ? `${i * 140}ms` : "0ms" }}
            >
              <div
                className={`absolute inset-x-0 top-0 h-px ${
                  plan.highlighted
                    ? "bg-[linear-gradient(90deg,rgba(223,207,185,0),rgba(223,207,185,0.9),rgba(223,207,185,0))]"
                    : "bg-[linear-gradient(90deg,rgba(186,160,121,0),rgba(186,160,121,0.55),rgba(186,160,121,0))]"
                }`}
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-[10px] tracking-[0.28em] uppercase ${
                      plan.highlighted ? "text-[#dfcfb9]" : "text-muted-foreground"
                    }`}
                  >
                    {plan.label}
                  </p>
                  <h3
                    className={`mt-3 font-serif text-[1.55rem] lg:text-[1.9rem] ${
                      plan.highlighted ? "text-[#fff7ee]" : "text-foreground"
                    }`}
                  >
                    {plan.name}
                  </h3>
                </div>

                {plan.highlighted && (
                  <span className="rounded-full border border-[#c9b392]/25 bg-white/8 px-3 py-1 text-[9px] tracking-[0.24em] text-[#efe2cf] uppercase">
                    Más elegido
                  </span>
                )}
              </div>

              <p
                className={`mt-4 max-w-md text-[13px] leading-[1.8] ${
                  plan.highlighted ? "text-[#efe4d6]" : "text-muted-foreground"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 flex items-end gap-1">
                <span
                  className={`font-serif text-[3.2rem] leading-none tracking-tight lg:text-[3.7rem] ${
                    plan.highlighted ? "text-[#fff7ee]" : "text-foreground"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`mb-1 text-[14px] ${
                    plan.highlighted ? "text-[#dfcfb9]" : "text-muted-foreground"
                  }`}
                >
                  &euro;
                </span>
                <span
                  className={`mb-1 text-[12px] ${
                    plan.highlighted ? "text-[#dfcfb9]" : "text-muted-foreground"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              <div className={`my-8 h-px w-10 ${plan.highlighted ? "bg-white/20" : "bg-border"}`} />

              <ul className="mb-10 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-3 text-[13px] leading-[1.75] ${
                      plan.highlighted ? "text-[#f1e6d8]" : "text-foreground/80"
                    }`}
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        plan.highlighted ? "text-[#dfcfb9]" : "text-[rgba(122,98,68,0.9)]"
                      }`}
                      strokeWidth={1.8}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={openLogin}
                className={`btn-luxury w-full px-6 py-3.5 text-[10px] tracking-[0.24em] uppercase transition-all ${
                  plan.highlighted
                    ? "border border-white/10 bg-[#f7f1e8] text-[#4d3b29] hover:bg-white"
                    : "border border-[rgba(122,98,68,0.14)] bg-transparent text-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {plan.cta}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </span>
              </button>
            </article>
          ))}
        </div>

        <div
          className={`mt-8 overflow-hidden rounded-[30px] border border-white/60 bg-white/76 p-8 shadow-[0_20px_70px_rgba(88,71,46,0.08)] backdrop-blur-sm transition-all duration-1000 ease-out lg:p-10 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: visible ? "280ms" : "0ms" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                Comparativa
              </p>
              <h3 className="mt-3 font-serif text-[1.3rem] text-foreground lg:text-[1.45rem]">
                Comparativa de planes
              </h3>
            </div>
            <p className="max-w-sm text-[12px] leading-[1.75] text-muted-foreground">
              La diferencia está en el nivel de personalización y acceso directo.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="pb-4 text-left text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    Característica
                  </th>
                  <th className="pb-4 text-center text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    Esencial
                  </th>
                  <th className="pb-4 text-center text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    A Medida
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row}
                    className={idx < comparisonRows.length - 1 ? "border-b border-border/45" : ""}
                  >
                    <td className="py-4 text-[13px] text-foreground/78">{row}</td>
                    <td className="py-4 text-center">
                      {plans[0].comparison[idx] ? (
                        <Check className="mx-auto h-4 w-4 text-[rgba(122,98,68,0.9)]" strokeWidth={1.8} />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-border" strokeWidth={1.8} />
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {plans[1].comparison[idx] ? (
                        <Check className="mx-auto h-4 w-4 text-[rgba(122,98,68,0.9)]" strokeWidth={1.8} />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-border" strokeWidth={1.8} />
                      )}
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
