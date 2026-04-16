"use client"

import { useEffect, useRef, useState } from "react"

const testimonials = [
  {
    name: "María L.",
    role: "Miembro A Medida",
    text: "Desde que me uní, la salud del pelo de Luna ha cambiado completamente. Las guías son claras y el soporte directo es increíble.",
  },
  {
    name: "Carmen R.",
    role: "Miembro Esencial",
    text: "Por fin un espacio pensado para nosotras. Sin ruido, sin publicidad. Solo información útil y un trato exquisito.",
  },
  {
    name: "Isabel G.",
    role: "Miembro A Medida",
    text: "El dossier mensual es oro puro. Me ahorra horas de búsqueda y me da tranquilidad saber que estoy haciendo lo correcto con Coco.",
  },
]

export function Testimonials() {
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
    <section ref={ref} className="noise-bg bg-secondary py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        {/* Header */}
        <div className="mb-20">
          <p className="mb-6 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Testimonios
          </p>
          <h2 className="max-w-md font-serif text-[1.8rem] leading-[1.1] text-foreground sm:text-[2.2rem] lg:text-[2.8rem] text-balance">
            Lo que dicen nuestras miembros
          </h2>
          <div className="mt-8 h-px w-10 bg-border" />
        </div>

        {/* Grid */}
        <div className="grid gap-[1px] border border-border md:grid-cols-3">
          {testimonials.map((t, i) => (
            <blockquote
              key={t.name}
              className={`flex flex-col bg-background p-8 transition-all duration-1000 ease-out lg:p-12 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: visible ? `${i * 140}ms` : "0ms" }}
            >
              <p className="flex-1 text-[13px] leading-[1.8] text-muted-foreground">
                {`"${t.text}"`}
              </p>
              <div className="mt-8 h-px w-6 bg-border" />
              <footer className="mt-5">
                <p className="text-[12px] tracking-wide text-foreground">{t.name}</p>
                <p className="mt-0.5 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  {t.role}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
