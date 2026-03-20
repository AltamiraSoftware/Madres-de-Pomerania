"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

const steps = [
  {
    day: "Dia 1",
    title: "Bienvenida personalizada",
    description:
      "Recibes acceso inmediato a tu area privada, guia de inicio y una hoja de ruta clara para empezar con criterio.",
  },
  {
    day: "Dia 8",
    title: "Primer contenido desbloqueado",
    description:
      "Accedes a tu primer bloque semanal con recomendaciones practicas adaptadas al nivel de tu membresia.",
  },
  {
    day: "Dia 15",
    title: "Seguimiento y ajuste",
    description:
      "El recorrido mantiene continuidad: nuevas pautas, prioridades afinadas y una experiencia mas util que acumulativa.",
  },
  {
    day: "Dia 22",
    title: "Acompanamiento premium",
    description:
      "Las miembros A Medida suman sesiones en vivo, soporte prioritario y recomendaciones con un enfoque mas directo.",
  },
]

const highlights = [
  "Acceso privado y ordenado desde el primer dia",
  "Contenido semanal con progresion real",
  "Experiencia pensada para avanzar sin saturarte",
]

export function Timeline() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

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
      id="metodo"
      className="noise-bg relative overflow-hidden bg-[linear-gradient(180deg,rgba(250,247,241,0.92)_0%,rgba(245,240,231,0.98)_45%,rgba(239,233,223,1)_100%)] py-28 lg:py-40"
    >
      <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-[rgba(186,160,121,0.18)] blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)] lg:gap-16">
          <div
            className={`transition-all duration-1000 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <p className="mb-6 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Experiencia
            </p>
            <h2 className="max-w-lg font-serif text-[1.95rem] leading-[1.05] text-foreground sm:text-[2.45rem] lg:text-[3rem] text-balance">
              Como funciona tu membresia
            </h2>
            <p className="mt-6 max-w-md text-[14px] leading-[1.85] text-muted-foreground">
              Hemos convertido el acompanamiento en una experiencia mas elegante, clara y
              progresiva. Cada etapa entrega valor concreto, sin ruido y con una sensacion
              de cuidado continuo.
            </p>

            <div className="mt-10 rounded-[28px] border border-white/60 bg-white/70 p-7 shadow-[0_18px_60px_rgba(88,71,46,0.08)] backdrop-blur-sm">
              <p className="text-[10px] tracking-[0.26em] text-muted-foreground uppercase">
                Lo que recibes
              </p>
              <div className="mt-5 h-px w-10 bg-border" />
              <ul className="mt-6 space-y-4">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[13px] leading-[1.75] text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[rgba(122,98,68,0.9)]" strokeWidth={1.8} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-[22px] border border-[rgba(122,98,68,0.12)] bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(244,237,226,0.85))] px-5 py-4">
                <p className="text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                  Ritmo premium
                </p>
                <p className="mt-3 text-[13px] leading-[1.75] text-muted-foreground">
                  Una membresia que no se siente masiva: entra, avanza, consulta y recibe
                  contenido con una cadencia pensada para sostener resultados.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute left-8 top-10 bottom-10 hidden w-px bg-[linear-gradient(180deg,rgba(122,98,68,0.12),rgba(122,98,68,0.35),rgba(122,98,68,0.08))] md:block" />

            <div className="grid gap-5">
              {steps.map((step, i) => (
                <article
                  key={step.day}
                  className={`relative overflow-hidden rounded-[28px] border border-white/60 bg-white/76 p-7 shadow-[0_20px_70px_rgba(88,71,46,0.08)] backdrop-blur-sm transition-all duration-1000 ease-out lg:p-8 ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: visible ? `${i * 120}ms` : "0ms" }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(186,160,121,0),rgba(186,160,121,0.55),rgba(186,160,121,0))]" />

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(122,98,68,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,237,226,0.9))] font-serif text-[1rem] text-[rgba(97,78,54,0.92)] shadow-[0_8px_20px_rgba(88,71,46,0.08)]">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                          {step.day}
                        </p>
                        <h3 className="mt-3 font-serif text-[1.2rem] text-foreground lg:text-[1.35rem]">
                          {step.title}
                        </h3>
                        <p className="mt-3 max-w-xl text-[13px] leading-[1.85] text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] tracking-[0.24em] text-[rgba(97,78,54,0.72)] uppercase">
                      <span>Etapa {i + 1}</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div
              className={`mt-6 rounded-[30px] border border-[rgba(122,98,68,0.1)] bg-[linear-gradient(135deg,rgba(110,87,60,0.96),rgba(71,55,39,0.96))] px-7 py-6 text-[#f7f1e8] shadow-[0_28px_90px_rgba(48,36,23,0.18)] transition-all duration-1000 ease-out ${
                visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: visible ? "520ms" : "0ms" }}
            >
              <p className="text-[10px] tracking-[0.28em] text-[#dfcfb9] uppercase">
                Cierre mensual
              </p>
              <h3 className="mt-3 font-serif text-[1.35rem] leading-[1.15] text-balance">
                Tu experiencia culmina con una vista mas clara de avances y siguientes pasos.
              </h3>
              <p className="mt-3 max-w-2xl text-[13px] leading-[1.8] text-[#efe4d6]">
                Cada mes recibes una sensacion de continuidad real: mas contexto, mejores
                decisiones y una membresia que acompana con mas criterio que volumen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
