"use client"

import { useEffect, useRef, useState } from "react"

const steps = [
  {
    day: "Dia 1",
    title: "Tu bienvenida personalizada",
    description: "Recibe tu kit de bienvenida digital con la guia de inicio y tu primera evaluacion de salud.",
  },
  {
    day: "Dia 8",
    title: "Primera guia de cuidado",
    description: "Accede a tu primer contenido semanal adaptado al nivel de tu membresia.",
  },
  {
    day: "Dia 15",
    title: "Seguimiento y ajustes",
    description: "Revision de progreso y ajuste de recomendaciones segun la respuesta de tu Pomerania.",
  },
  {
    day: "Dia 22",
    title: "Sesion en vivo",
    description: "Los miembros A Medida disfrutan de su primera sesion de Q&A en directo.",
  },
  {
    day: "Mensual",
    title: "Dossier personalizado",
    description: "Cada mes recibes un resumen completo con nuevas recomendaciones y actualizaciones.",
  },
]

export function Timeline() {
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
    <section ref={ref} id="metodo" className="noise-bg py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        {/* Header */}
        <div className="mb-20">
          <p className="mb-6 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Metodo
          </p>
          <h2 className="max-w-md font-serif text-[1.8rem] leading-[1.1] text-foreground sm:text-[2.2rem] lg:text-[2.8rem] text-balance">
            Como funciona tu membresia
          </h2>
          <div className="mt-8 h-px w-10 bg-border" />
        </div>

        {/* Steps — simple vertical list */}
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div
              key={step.day}
              className={`grid gap-4 border-t border-border py-10 transition-all duration-1000 ease-out md:grid-cols-[120px_1fr] md:gap-12 lg:py-12 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: visible ? `${i * 100}ms` : "0ms" }}
            >
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                {step.day}
              </span>
              <div>
                <h3 className="font-serif text-[1.1rem] text-foreground lg:text-[1.25rem]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-[13px] leading-[1.75] text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
