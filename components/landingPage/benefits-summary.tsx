"use client"

import { useEffect, useRef, useState } from "react"

const bars = [
  { label: "Nivel Uno — Esencial", value: 65 },
  { label: "Nivel Dos — A Medida", value: 95 },
]

export function BenefitsSummary() {
  const ref = useRef<HTMLElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true) },
      { threshold: 0.25 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="noise-bg border border-border bg-secondary">
          <div className="grid md:grid-cols-2">
            {/* Left */}
            <div className="flex flex-col justify-center p-10 lg:p-16">
              <p className="mb-6 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                Resumen
              </p>
              <h2 className="font-serif text-[1.6rem] leading-[1.1] text-foreground sm:text-[2rem] lg:text-[2.4rem] text-balance">
                Resumen de Beneficios
              </h2>
              <p className="mt-2 text-[13px] tracking-wide text-muted-foreground">
                Madres de Pomerania de Ana y Boo
              </p>
              <div className="mt-8 h-px w-8 bg-border" />
              <p className="mt-8 max-w-sm text-[13px] leading-[1.75] text-muted-foreground">
                Acceso exclusivo sin distracciones para ti y tu Pomerania.
                Contenido curado, asesorias directas y tranquilidad real.
              </p>
            </div>

            {/* Right — Progress bars */}
            <div className="flex flex-col justify-center border-t border-border p-10 md:border-t-0 md:border-l lg:p-16">
              <div className="flex flex-col gap-10">
                {bars.map((bar, i) => (
                  <div key={bar.label}>
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="text-[12px] tracking-wide text-foreground">
                        {bar.label}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {bar.value}%
                      </span>
                    </div>
                    <div className="h-[2px] w-full overflow-hidden bg-border">
                      <div
                        className={`h-full bg-foreground/60 ${animate ? "progress-animate" : ""}`}
                        style={{
                          "--target-width": `${bar.value}%`,
                          width: animate ? `${bar.value}%` : "0%",
                          animationDelay: `${i * 0.4}s`,
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
