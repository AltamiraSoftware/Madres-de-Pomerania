"use client"

import { useEffect, useRef, useState } from "react"
import { useAuthModal } from "@/components/auth/AuthModalProvider";
export function FinalCTA() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const { openLogin } = useAuthModal();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="noise-bg bg-secondary py-28 lg:py-40">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-16">
        <div
          className={`transition-all duration-[1.2s] ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <div className="mx-auto mb-12 h-px w-10 bg-border" />

          <h2 className="font-serif text-[1.8rem] leading-[1.1] text-foreground sm:text-[2.2rem] lg:text-[2.8rem] text-balance">
            Sin Colas, Sin Ruido.
            <span className="mt-1 block">Solo Cuidados Reales.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-sm text-[13px] leading-[1.75] text-muted-foreground">
            Accede a la tranquilidad de un asesoramiento personalizado y
            confidencial.
          </p>

          <div className="mt-12">
            <button
                  className="btn-luxury inline-block bg-foreground px-10 py-4 text-[10px] tracking-[0.22em] text-background uppercase"
                  onClick={openLogin}
            >
              Unete Ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
