"use client"
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const { openLogin} = useAuthModal();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.05 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id="inicio"
      className="noise-bg relative min-h-[100svh] overflow-hidden bg-background"
    >
      <div className="mx-auto grid min-h-[100svh] max-w-7xl lg:grid-cols-2">
        {/* Text */}
        <div className="flex flex-col justify-center px-6 pt-28 pb-16 lg:px-16 lg:pt-0 lg:pb-0">
          <div
            className={`transition-all duration-[1.2s] ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <p className="mb-10 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Membresia exclusiva
            </p>

            <h1 className="font-serif text-[2.2rem] leading-[1.08] tracking-[-0.01em] text-foreground sm:text-[2.8rem] lg:text-[3.4rem] text-balance">
              Niveles de Membresia
            </h1>
            <p className="mt-3 font-serif text-[1.2rem] leading-[1.2] text-muted-foreground sm:text-[1.5rem] lg:text-[1.8rem]">
              para Madres de Pomerania
            </p>

            <div className="mt-12 h-px w-10 bg-border" />

            <p className="mt-12 max-w-[340px] text-[14px] leading-[1.75] text-muted-foreground">
              Acceso privado para madres de Pomerania de Ana y Boo.
              Cuidado personalizado, asesoria directa y una comunidad
              que entiende lo que tu peludo necesita.
            </p>

            <div
              className={`mt-14 transition-all duration-[1.2s] delay-300 ease-out ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              <button
               onClick={openLogin}
                className="btn-luxury inline-block bg-foreground px-10 py-4 text-[10px] tracking-[0.22em] text-background uppercase"
              >
                Acceso Privado
              </button>
            </div>
          </div>
        </div>

        {/* Image */}
        <div
          className={`relative h-[55vh] overflow-hidden lg:h-auto transition-all duration-[1.6s] ease-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src="/images/hero-pomeranian.png"
            alt="Madre con su Pomerania en un ambiente calido y elegante"
            fill
            priority
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Blending edges */}
          <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-background to-transparent lg:block" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  )
}
